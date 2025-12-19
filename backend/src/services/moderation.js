import { prisma } from '../index.js';
import { authService } from './auth.js';
import { blueskyService } from './bluesky.js';

class ModerationService {
  // Report content
  async reportContent(user, { reasonType, reason, subject }) {
    const agent = await authService.getBlueskyAgent(user);
    return blueskyService.reportContent(agent, { reasonType, reason, subject });
  }

  // Report post
  async reportPost(user, postUri, postCid, reasonType, reason) {
    return this.reportContent(user, {
      reasonType,
      reason,
      subject: {
        $type: 'com.atproto.repo.strongRef',
        uri: postUri,
        cid: postCid,
      },
    });
  }

  // Report account
  async reportAccount(user, did, reasonType, reason) {
    return this.reportContent(user, {
      reasonType,
      reason,
      subject: {
        $type: 'com.atproto.admin.defs#repoRef',
        did,
      },
    });
  }

  // Block user (via Bluesky API)
  async blockUser(user, targetDid) {
    const agent = await authService.getBlueskyAgent(user);
    const result = await blueskyService.block(agent, targetDid);

    if (result.success) {
      // Also store locally for quick access
      await prisma.blockedUser.upsert({
        where: {
          userId_blockedDid: {
            userId: user.id,
            blockedDid: targetDid,
          },
        },
        create: {
          userId: user.id,
          blockedDid: targetDid,
        },
        update: {},
      });
    }

    return result;
  }

  // Unblock user
  async unblockUser(user, targetDid, blockUri) {
    const agent = await authService.getBlueskyAgent(user);
    const result = await blueskyService.unblock(agent, blockUri);

    if (result.success) {
      await prisma.blockedUser.deleteMany({
        where: {
          userId: user.id,
          blockedDid: targetDid,
        },
      });
    }

    return result;
  }

  // Mute user (via Bluesky API)
  async muteUser(user, targetDid, duration = null) {
    const agent = await authService.getBlueskyAgent(user);
    const result = await blueskyService.mute(agent, targetDid);

    if (result.success) {
      const expiresAt = duration
        ? new Date(Date.now() + duration * 1000)
        : null;

      await prisma.mutedUser.upsert({
        where: {
          userId_mutedDid: {
            userId: user.id,
            mutedDid: targetDid,
          },
        },
        create: {
          userId: user.id,
          mutedDid: targetDid,
          expiresAt,
        },
        update: {
          expiresAt,
        },
      });
    }

    return result;
  }

  // Unmute user
  async unmuteUser(user, targetDid) {
    const agent = await authService.getBlueskyAgent(user);
    const result = await blueskyService.unmute(agent, targetDid);

    if (result.success) {
      await prisma.mutedUser.deleteMany({
        where: {
          userId: user.id,
          mutedDid: targetDid,
        },
      });
    }

    return result;
  }

  // Get blocked users
  async getBlockedUsers(user) {
    return prisma.blockedUser.findMany({
      where: { userId: user.id },
      orderBy: { blockedAt: 'desc' },
    });
  }

  // Get muted users
  async getMutedUsers(user) {
    return prisma.mutedUser.findMany({
      where: {
        userId: user.id,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { mutedAt: 'desc' },
    });
  }

  // Add muted word
  async addMutedWord(user, word, isRegex = false, duration = null) {
    const expiresAt = duration
      ? new Date(Date.now() + duration * 1000)
      : null;

    return prisma.mutedWord.create({
      data: {
        userId: user.id,
        word,
        isRegex,
        expiresAt,
      },
    });
  }

  // Remove muted word
  async removeMutedWord(user, wordId) {
    return prisma.mutedWord.deleteMany({
      where: {
        id: wordId,
        userId: user.id,
      },
    });
  }

  // Get muted words
  async getMutedWords(user) {
    return prisma.mutedWord.findMany({
      where: {
        userId: user.id,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { mutedAt: 'desc' },
    });
  }

  // Check if content should be filtered
  async shouldFilterContent(user, text) {
    const mutedWords = await this.getMutedWords(user);

    for (const muted of mutedWords) {
      if (muted.isRegex) {
        try {
          const regex = new RegExp(muted.word, 'i');
          if (regex.test(text)) {
            return true;
          }
        } catch {
          // Invalid regex, skip
        }
      } else {
        if (text.toLowerCase().includes(muted.word.toLowerCase())) {
          return true;
        }
      }
    }

    return false;
  }

  // Check if user is blocked
  async isUserBlocked(user, targetDid) {
    const blocked = await prisma.blockedUser.findUnique({
      where: {
        userId_blockedDid: {
          userId: user.id,
          blockedDid: targetDid,
        },
      },
    });
    return !!blocked;
  }

  // Check if user is muted
  async isUserMuted(user, targetDid) {
    const muted = await prisma.mutedUser.findFirst({
      where: {
        userId: user.id,
        mutedDid: targetDid,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
    return !!muted;
  }

  // Clean up expired mutes
  async cleanupExpiredMutes() {
    const result = await prisma.mutedUser.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
          not: null,
        },
      },
    });

    const wordResult = await prisma.mutedWord.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
          not: null,
        },
      },
    });

    return {
      mutedUsers: result.count,
      mutedWords: wordResult.count,
    };
  }

  // Reason types for reporting
  getReasonTypes() {
    return [
      { value: 'com.atproto.moderation.defs#reasonSpam', label: 'Spam' },
      { value: 'com.atproto.moderation.defs#reasonViolation', label: 'Community Guidelines Violation' },
      { value: 'com.atproto.moderation.defs#reasonMisleading', label: 'Misleading Content' },
      { value: 'com.atproto.moderation.defs#reasonSexual', label: 'Sexual Content' },
      { value: 'com.atproto.moderation.defs#reasonRude', label: 'Harassment' },
      { value: 'com.atproto.moderation.defs#reasonOther', label: 'Other' },
    ];
  }
}

export const moderationService = new ModerationService();
export default moderationService;
