import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { prisma } from '../index.js';
import { feedService } from '../services/feed.js';

const router = Router();

// Get user's bookmarks
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { limit = 50, cursor } = req.query;
  const limitNum = Math.min(parseInt(limit) || 50, 100);

  const where = { userId: req.user.id };

  // Handle cursor-based pagination
  if (cursor) {
    const cursorDate = new Date(cursor);
    where.createdAt = { lt: cursorDate };
  }

  const bookmarks = await prisma.bookmark.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limitNum + 1, // Fetch one extra to determine if there's more
  });

  const hasMore = bookmarks.length > limitNum;
  const results = hasMore ? bookmarks.slice(0, limitNum) : bookmarks;

  // Get fresh post data for bookmarks that have URIs
  const postUris = results.map(b => b.postUri);
  let freshPosts = {};

  if (postUris.length > 0) {
    try {
      // Try to fetch fresh post data
      const posts = await feedService.getPostsByUris(req.user, postUris);
      freshPosts = posts.reduce((acc, post) => {
        if (post) acc[post.uri] = post;
        return acc;
      }, {});
    } catch (error) {
      console.error('Failed to fetch fresh bookmark posts:', error);
      // Fall back to cached data
    }
  }

  const feed = results.map(bookmark => {
    const freshPost = freshPosts[bookmark.postUri];
    const post = freshPost || bookmark.postData;
    return {
      post,
      bookmarkId: bookmark.id,
      bookmarkedAt: bookmark.createdAt,
    };
  }).filter(item => item.post); // Filter out any null posts

  res.json({
    feed,
    cursor: hasMore ? results[results.length - 1].createdAt.toISOString() : null,
  });
}));

// Add bookmark
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { postUri, postCid, postData } = req.body;

  if (!postUri || !postCid) {
    return res.status(400).json({ error: 'postUri and postCid are required' });
  }

  // Check if already bookmarked
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_postUri: {
        userId: req.user.id,
        postUri,
      },
    },
  });

  if (existing) {
    return res.status(409).json({ error: 'Post already bookmarked', bookmark: existing });
  }

  const bookmark = await prisma.bookmark.create({
    data: {
      userId: req.user.id,
      postUri,
      postCid,
      postData: postData || null,
    },
  });

  res.status(201).json({ bookmark });
}));

// Remove bookmark by post URI
router.delete('/post/:postUri', authenticate, asyncHandler(async (req, res) => {
  const postUri = decodeURIComponent(req.params.postUri);

  const result = await prisma.bookmark.deleteMany({
    where: {
      userId: req.user.id,
      postUri,
    },
  });

  if (result.count === 0) {
    return res.status(404).json({ error: 'Bookmark not found' });
  }

  res.json({ success: true });
}));

// Remove bookmark by ID
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await prisma.bookmark.deleteMany({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (result.count === 0) {
    return res.status(404).json({ error: 'Bookmark not found' });
  }

  res.json({ success: true });
}));

// Check if post is bookmarked
router.get('/check/:postUri', authenticate, asyncHandler(async (req, res) => {
  const postUri = decodeURIComponent(req.params.postUri);

  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_postUri: {
        userId: req.user.id,
        postUri,
      },
    },
  });

  res.json({ bookmarked: !!bookmark, bookmark });
}));

// Get bookmark count
router.get('/count', authenticate, asyncHandler(async (req, res) => {
  const count = await prisma.bookmark.count({
    where: { userId: req.user.id },
  });

  res.json({ count });
}));

export default router;
