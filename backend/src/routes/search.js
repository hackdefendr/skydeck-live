import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authService } from '../services/auth.js';
import { blueskyService } from '../services/bluesky.js';

const router = Router();

// Search posts
router.get('/posts', authenticate, validate(schemas.search), asyncHandler(async (req, res) => {
  const { q, limit = 25, cursor } = req.query;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.searchPosts(agent, q, {
    limit: parseInt(limit, 10),
    cursor,
  });

  res.json(result);
}));

// Search users/actors
router.get('/users', authenticate, validate(schemas.search), asyncHandler(async (req, res) => {
  const { q, limit = 25, cursor } = req.query;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.searchActors(agent, q, {
    limit: parseInt(limit, 10),
    cursor,
  });

  res.json(result);
}));

// Combined search
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q || q.length < 1) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const agent = await authService.getBlueskyAgent(req.user);

  // Run both searches in parallel
  const [postsResult, actorsResult] = await Promise.all([
    blueskyService.searchPosts(agent, q, { limit: parseInt(limit, 10) }),
    blueskyService.searchActors(agent, q, { limit: parseInt(limit, 10) }),
  ]);

  res.json({
    posts: postsResult.posts,
    users: actorsResult.actors,
  });
}));

// Get typeahead suggestions (for mentions)
router.get('/typeahead', authenticate, asyncHandler(async (req, res) => {
  const { q, limit = 8 } = req.query;

  if (!q || q.length < 1) {
    return res.json({ actors: [] });
  }

  const agent = await authService.getBlueskyAgent(req.user);

  try {
    const result = await agent.searchActorsTypeahead({
      term: q,
      limit: parseInt(limit, 10),
    });

    res.json({ actors: result.data.actors });
  } catch (error) {
    console.error('Typeahead error:', error);
    res.json({ actors: [] });
  }
}));

export default router;
