import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { prisma } from '../index.js';
import { authService } from '../services/auth.js';
import { blueskyService } from '../services/bluesky.js';

const router = Router();

// Get all drafts (non-scheduled)
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const drafts = await prisma.draft.findMany({
    where: {
      userId: req.user.id,
      scheduledAt: null,
    },
    orderBy: { updatedAt: 'desc' },
  });

  res.json({ drafts });
}));

// Get scheduled posts
router.get('/scheduled', authenticate, asyncHandler(async (req, res) => {
  const scheduled = await prisma.draft.findMany({
    where: {
      userId: req.user.id,
      scheduledAt: { not: null },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  res.json({ scheduled });
}));

// Get single draft
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const draft = await prisma.draft.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!draft) {
    return res.status(404).json({ error: 'Draft not found' });
  }

  res.json({ draft });
}));

// Create draft
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { text, replyTo, quotePost, mediaIds, scheduledAt } = req.body;

  if (!text && (!mediaIds || mediaIds.length === 0)) {
    return res.status(400).json({ error: 'Draft must have text or media' });
  }

  // Validate scheduled time if provided
  if (scheduledAt) {
    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ error: 'Invalid scheduled date' });
    }
    if (scheduledDate <= new Date()) {
      return res.status(400).json({ error: 'Scheduled time must be in the future' });
    }
  }

  const draft = await prisma.draft.create({
    data: {
      userId: req.user.id,
      text: text || '',
      replyTo: replyTo || null,
      quotePost: quotePost || null,
      mediaIds: mediaIds || [],
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
  });

  res.status(201).json({ draft });
}));

// Update draft
router.patch('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text, replyTo, quotePost, mediaIds, scheduledAt } = req.body;

  const existing = await prisma.draft.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!existing) {
    return res.status(404).json({ error: 'Draft not found' });
  }

  // Validate scheduled time if provided
  if (scheduledAt !== undefined && scheduledAt !== null) {
    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ error: 'Invalid scheduled date' });
    }
    if (scheduledDate <= new Date()) {
      return res.status(400).json({ error: 'Scheduled time must be in the future' });
    }
  }

  const draft = await prisma.draft.update({
    where: { id },
    data: {
      ...(text !== undefined && { text }),
      ...(replyTo !== undefined && { replyTo }),
      ...(quotePost !== undefined && { quotePost }),
      ...(mediaIds !== undefined && { mediaIds }),
      ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
    },
  });

  res.json({ draft });
}));

// Delete draft
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await prisma.draft.deleteMany({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (result.count === 0) {
    return res.status(404).json({ error: 'Draft not found' });
  }

  res.json({ success: true });
}));

// Post a draft immediately
router.post('/:id/post', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const draft = await prisma.draft.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!draft) {
    return res.status(404).json({ error: 'Draft not found' });
  }

  try {
    const agent = await authService.getBlueskyAgent(req.user);

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

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Delete the draft after successful post
    await prisma.draft.delete({ where: { id } });

    res.json({ success: true, uri: result.uri, cid: result.cid });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create post' });
  }
}));

// Get draft and scheduled counts
router.get('/counts/all', authenticate, asyncHandler(async (req, res) => {
  const [draftCount, scheduledCount] = await Promise.all([
    prisma.draft.count({
      where: {
        userId: req.user.id,
        scheduledAt: null,
      },
    }),
    prisma.draft.count({
      where: {
        userId: req.user.id,
        scheduledAt: { not: null },
      },
    }),
  ]);

  res.json({ drafts: draftCount, scheduled: scheduledCount });
}));

export default router;
