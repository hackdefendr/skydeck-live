import { prisma } from '../index.js';
import { authService } from './auth.js';
import { blueskyService } from './bluesky.js';

class SchedulerService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  // Start the scheduler
  start(intervalMs = 60000) {
    if (this.intervalId) {
      console.log('Scheduler already running');
      return;
    }

    console.log(`Starting scheduler with ${intervalMs}ms interval`);
    this.intervalId = setInterval(() => this.processScheduledPosts(), intervalMs);

    // Run immediately on start
    this.processScheduledPosts();
  }

  // Stop the scheduler
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Scheduler stopped');
    }
  }

  // Process all due scheduled posts
  async processScheduledPosts() {
    if (this.isRunning) {
      console.log('Scheduler already processing, skipping...');
      return;
    }

    this.isRunning = true;

    try {
      const now = new Date();

      // Find all scheduled posts that are due
      const duePosts = await prisma.draft.findMany({
        where: {
          scheduledAt: {
            not: null,
            lte: now,
          },
        },
        include: {
          // We don't have a user relation, so we need to get user separately
        },
      });

      if (duePosts.length === 0) {
        this.isRunning = false;
        return;
      }

      console.log(`Processing ${duePosts.length} scheduled posts`);

      for (const draft of duePosts) {
        try {
          await this.postScheduledDraft(draft);
        } catch (error) {
          console.error(`Failed to post scheduled draft ${draft.id}:`, error);
          // Continue processing other drafts
        }
      }
    } catch (error) {
      console.error('Scheduler error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // Post a single scheduled draft
  async postScheduledDraft(draft) {
    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: draft.userId },
    });

    if (!user) {
      console.error(`User not found for draft ${draft.id}`);
      // Delete orphaned draft
      await prisma.draft.delete({ where: { id: draft.id } });
      return;
    }

    // Get authenticated agent
    const agent = await authService.getBlueskyAgent(user);

    // Build embed from quote post if present
    let embed = null;
    if (draft.quotePost) {
      embed = {
        $type: 'app.bsky.embed.record',
        record: {
          uri: draft.quotePost.uri,
          cid: draft.quotePost.cid,
        },
      };
    }

    // Create the post
    const result = await blueskyService.createPost(agent, {
      text: draft.text,
      replyTo: draft.replyTo,
      embed,
    });

    if (result.success) {
      console.log(`Posted scheduled draft ${draft.id}: ${result.uri}`);
      // Delete the draft
      await prisma.draft.delete({ where: { id: draft.id } });
    } else {
      console.error(`Failed to post draft ${draft.id}: ${result.error}`);
      // Optionally: Mark as failed or retry later
    }
  }
}

export const schedulerService = new SchedulerService();
export default schedulerService;
