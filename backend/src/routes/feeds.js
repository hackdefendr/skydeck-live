import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { feedService } from '../services/feed.js';

const router = Router();

// Get home timeline
router.get('/timeline', authenticate, asyncHandler(async (req, res) => {
  const { limit = 50, cursor } = req.query;

  const result = await feedService.getTimeline(req.user, {
    limit: parseInt(limit, 10),
    cursor,
  });

  res.json(result);
}));

// Get custom feed
router.get('/feed/:feedUri(*)', authenticate, asyncHandler(async (req, res) => {
  const { feedUri } = req.params;
  const { limit = 50, cursor } = req.query;

  const result = await feedService.getFeed(req.user, feedUri, {
    limit: parseInt(limit, 10),
    cursor,
  });

  res.json(result);
}));

// Get list feed
router.get('/list/:listUri(*)', authenticate, asyncHandler(async (req, res) => {
  const { listUri } = req.params;
  const { limit = 50, cursor } = req.query;

  const result = await feedService.getListFeed(req.user, listUri, {
    limit: parseInt(limit, 10),
    cursor,
  });

  res.json(result);
}));

// Get suggested feeds
router.get('/suggested', authenticate, asyncHandler(async (req, res) => {
  const { limit = 50, cursor } = req.query;

  const result = await feedService.getSuggestedFeeds(req.user, {
    limit: parseInt(limit, 10),
    cursor,
  });

  res.json(result);
}));

// Get saved feeds
router.get('/saved', authenticate, asyncHandler(async (req, res) => {
  const feeds = await feedService.getSavedFeeds(req.user);
  res.json({ feeds });
}));

// Get mentions
router.get('/mentions', authenticate, asyncHandler(async (req, res) => {
  const { limit = 50, cursor } = req.query;

  const result = await feedService.getMentions(req.user, {
    limit: parseInt(limit, 10),
    cursor,
  });

  res.json(result);
}));

export default router;
