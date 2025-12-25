import { prisma } from '../index.js';
import { generateSessionToken } from '../utils/jwt.js';
import { blueskyService } from './bluesky.js';
import config from '../config/index.js';

class AuthService {
  // Login user with Bluesky credentials
  async login(identifier, password, userAgent, ipAddress, options = {}) {
    const { service, authFactorToken, twoFactorCode } = options;

    // Determine the effective PDS URL (custom service or default)
    const effectivePdsUrl = service || config.bluesky.service;

    // Authenticate with Bluesky (with optional custom PDS and 2FA)
    const result = await blueskyService.login(identifier, password, {
      service,
      authFactorToken,
      twoFactorCode,
    });

    // Check if 2FA is required
    if (result.requires2FA) {
      return {
        success: false,
        requires2FA: true,
        authFactorToken: result.authFactorToken,
      };
    }

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { did: result.did },
    });

    if (!user) {
      // Create new user with default columns
      user = await prisma.user.create({
        data: {
          did: result.did,
          handle: result.handle,
          displayName: result.displayName || result.handle,
          accessJwt: result.accessJwt,
          refreshJwt: result.refreshJwt,
          pdsUrl: effectivePdsUrl, // Store the PDS URL used for authentication
          columns: {
            create: [
              { type: 'HOME', title: 'Home', position: 0 },
              { type: 'NOTIFICATIONS', title: 'Notifications', position: 1 },
              { type: 'MESSAGES', title: 'Messages', position: 2 },
            ],
          },
          theme: {
            create: {},
          },
        },
      });
    } else {
      // Update existing user's tokens and PDS URL
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          handle: result.handle,
          displayName: result.displayName || result.handle,
          accessJwt: result.accessJwt,
          refreshJwt: result.refreshJwt,
          pdsUrl: effectivePdsUrl, // Update the PDS URL in case it changed
        },
      });
    }

    // Get profile to update avatar/description
    try {
      const agent = await blueskyService.createAuthenticatedAgent(
        result.accessJwt,
        result.refreshJwt,
        result.did,
        result.handle,
        effectivePdsUrl // Pass the PDS URL
      );
      const profile = await blueskyService.getProfile(agent, result.did);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          avatar: profile.avatar,
          description: profile.description,
        },
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }

    // Create session token
    const token = generateSessionToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        did: user.did,
        handle: user.handle,
        displayName: user.displayName,
        avatar: user.avatar,
      },
    };
  }

  // Logout user
  async logout(token) {
    try {
      await prisma.session.delete({
        where: { token },
      });
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  }

  // Logout all sessions
  async logoutAll(userId) {
    try {
      await prisma.session.deleteMany({
        where: { userId },
      });
      return { success: true };
    } catch (error) {
      console.error('Logout all error:', error);
      return { success: false, error: 'Logout failed' };
    }
  }

  // Get user sessions
  async getSessions(userId) {
    return prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Revoke specific session
  async revokeSession(userId, sessionId) {
    try {
      await prisma.session.deleteMany({
        where: {
          id: sessionId,
          userId,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Revoke session error:', error);
      return { success: false, error: 'Revoke session failed' };
    }
  }

  // Refresh Bluesky tokens
  async refreshBlueskySession(user) {
    if (!user.refreshJwt) {
      return { success: false, error: 'No refresh token available' };
    }

    // Use the user's stored PDS URL or fall back to config default
    const pdsUrl = user.pdsUrl || config.bluesky.service;
    const result = await blueskyService.refreshSession(user.refreshJwt, pdsUrl);

    if (!result.success) {
      return result;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        accessJwt: result.accessJwt,
        refreshJwt: result.refreshJwt,
      },
    });

    return {
      success: true,
      accessJwt: result.accessJwt,
      refreshJwt: result.refreshJwt,
    };
  }

  // Get authenticated Bluesky agent for user
  async getBlueskyAgent(user) {
    // Use the user's stored PDS URL or fall back to config default
    const pdsUrl = user.pdsUrl || config.bluesky.service;

    // Check if token needs refresh before creating agent
    const shouldRefresh = this.shouldRefreshToken(user.accessJwt);

    if (shouldRefresh) {
      console.log(`[Auth] Token expired or expiring soon for ${user.handle}, refreshing...`);
      const refreshResult = await this.refreshBlueskySession(user);
      if (refreshResult.success) {
        // Update user object with new tokens for this request
        user.accessJwt = refreshResult.accessJwt;
        user.refreshJwt = refreshResult.refreshJwt;
      } else {
        console.error(`[Auth] Token refresh failed for ${user.handle}:`, refreshResult.error);
        // Continue with existing token - it might still work or will fail gracefully
      }
    }

    // Create agent with (possibly refreshed) tokens and the user's PDS URL
    const agent = await blueskyService.createAuthenticatedAgent(
      user.accessJwt,
      user.refreshJwt,
      user.did,
      user.handle,
      pdsUrl
    );

    return agent;
  }

  // Check if token should be refreshed (expired or expiring within 5 minutes)
  shouldRefreshToken(jwt) {
    if (!jwt) return true;

    try {
      const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString());
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      const bufferSeconds = 300; // 5 minute buffer before expiry

      // Token should be refreshed if it expires within 5 minutes
      return (exp - now) < bufferSeconds;
    } catch {
      // If we can't parse the token, assume it needs refresh
      return true;
    }
  }

  // Helper to get remaining time until token expires (in seconds)
  getTokenExpiryTime(jwt) {
    if (!jwt) return 0;

    try {
      const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString());
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, exp - now);
    } catch {
      return 0;
    }
  }

  // Clean up expired sessions
  async cleanupExpiredSessions() {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });
      console.log(`Cleaned up ${result.count} expired sessions`);
      return result.count;
    } catch (error) {
      console.error('Cleanup sessions error:', error);
      return 0;
    }
  }
}

export const authService = new AuthService();
export default authService;
