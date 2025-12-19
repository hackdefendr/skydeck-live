import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { postRateLimiter } from '../middleware/rateLimiter.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authService } from '../services/auth.js';
import { blueskyService } from '../services/bluesky.js';
import { feedService } from '../services/feed.js';

const router = Router();

// Create post
router.post('/', authenticate, postRateLimiter, validate(schemas.createPost), asyncHandler(async (req, res) => {
  const { text, replyTo, quoteUri, embed, langs } = req.body;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.createPost(agent, {
    text,
    replyTo,
    embed,
    langs,
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json({
    uri: result.uri,
    cid: result.cid,
  });
}));

// Get post thread
router.get('/:uri(*)', authenticate, asyncHandler(async (req, res) => {
  const uri = req.params.uri;
  const { depth = 10, parentHeight = 80 } = req.query;

  const thread = await feedService.getPostThread(req.user, uri, {
    depth: parseInt(depth, 10),
    parentHeight: parseInt(parentHeight, 10),
  });

  res.json({ thread });
}));

// Delete post
router.delete('/:uri(*)', authenticate, asyncHandler(async (req, res) => {
  const uri = req.params.uri;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.deletePost(agent, uri);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true });
}));

// Like post
router.post('/:uri(*)/like', authenticate, asyncHandler(async (req, res) => {
  const uri = req.params.uri;
  const { cid } = req.body;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.likePost(agent, uri, cid);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ uri: result.uri });
}));

// Unlike post
router.delete('/:uri(*)/like', authenticate, asyncHandler(async (req, res) => {
  const { likeUri } = req.body;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.unlikePost(agent, likeUri);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true });
}));

// Repost
router.post('/:uri(*)/repost', authenticate, asyncHandler(async (req, res) => {
  const uri = req.params.uri;
  const { cid } = req.body;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.repost(agent, uri, cid);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ uri: result.uri });
}));

// Delete repost
router.delete('/:uri(*)/repost', authenticate, asyncHandler(async (req, res) => {
  const { repostUri } = req.body;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.deleteRepost(agent, repostUri);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true });
}));

export default router;
