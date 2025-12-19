import { prisma } from '../index.js';
import { generateSessionToken } from '../utils/jwt.js';
import { blueskyService } from './bluesky.js';

class AuthService {
  // Login user with Bluesky credentials
  async login(identifier, password, userAgent, ipAddress) {
    // Authenticate with Bluesky
    const result = await blueskyService.login(identifier, password);

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
      // Update existing user's tokens
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          handle: result.handle,
          displayName: result.displayName || result.handle,
          accessJwt: result.accessJwt,
          refreshJwt: result.refreshJwt,
        },
      });
    }

    // Get profile to update avatar/description
    try {
      const agent = await blueskyService.createAuthenticatedAgent(
        result.accessJwt,
        result.refreshJwt,
        result.did,
        result.handle
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

    const result = await blueskyService.refreshSession(user.refreshJwt);

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
    // Try to create agent with current tokens
    let agent = await blueskyService.createAuthenticatedAgent(
      user.accessJwt,
      user.refreshJwt,
      user.did,
      user.handle
    );

    // If tokens might be expired, try refreshing
    const tokenAge = this.getTokenAge(user.accessJwt);
    if (tokenAge > 1800) { // 30 minutes
      const refreshResult = await this.refreshBlueskySession(user);
      if (refreshResult.success) {
        agent = await blueskyService.createAuthenticatedAgent(
          refreshResult.accessJwt,
          refreshResult.refreshJwt,
          user.did,
          user.handle
        );
      }
    }

    return agent;
  }

  // Helper to estimate token age (basic check)
  getTokenAge(jwt) {
    try {
      const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString());
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      return exp - now < 0 ? Infinity : Math.floor(Date.now() / 1000) - (payload.iat || 0);
    } catch {
      return Infinity;
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
