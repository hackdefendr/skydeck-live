import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authService } from '../services/auth.js';
import { blueskyService } from '../services/bluesky.js';
import { prisma } from '../index.js';

const router = Router();

// Get user profile
router.get('/:actor', authenticate, asyncHandler(async (req, res) => {
  const { actor } = req.params;
  const agent = await authService.getBlueskyAgent(req.user);
  const profile = await blueskyService.getProfile(agent, actor);
  res.json({ profile });
}));

// Update own profile
router.patch('/me', authenticate, asyncHandler(async (req, res) => {
  const { displayName, description } = req.body;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.updateProfile(agent, {
    displayName,
    description,
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  // Update local database
  await prisma.user.update({
    where: { id: req.user.id },
    data: { displayName, description },
  });

  res.json({ success: true });
}));

// Get user's followers
router.get('/:actor/followers', authenticate, asyncHandler(async (req, res) => {
  const { actor } = req.params;
  const { limit = 50, cursor } = req.query;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.getFollowers(agent, actor, {
    limit: parseInt(limit, 10),
    cursor,
  });

  res.json(result);
}));

// Get user's follows
router.get('/:actor/follows', authenticate, asyncHandler(async (req, res) => {
  const { actor } = req.params;
  const { limit = 50, cursor } = req.query;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.getFollows(agent, actor, {
    limit: parseInt(limit, 10),
    cursor,
  });

  res.json(result);
}));

// Get suggested follows based on an actor
router.get('/:actor/suggested-follows', authenticate, asyncHandler(async (req, res) => {
  const { actor } = req.params;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.getSuggestedFollows(agent, actor);
  res.json(result);
}));

// Get known/mutual followers
router.get('/:actor/known-followers', authenticate, asyncHandler(async (req, res) => {
  const { actor } = req.params;
  const { limit = 50, cursor } = req.query;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.getKnownFollowers(agent, actor, {
    limit: parseInt(limit, 10),
    cursor,
  });

  res.json(result);
}));

// Follow user
router.post('/:did/follow', authenticate, asyncHandler(async (req, res) => {
  const { did } = req.params;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.follow(agent, did);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ uri: result.uri });
}));

// Unfollow user
router.delete('/:did/follow', authenticate, asyncHandler(async (req, res) => {
  const { followUri } = req.body;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.unfollow(agent, followUri);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true });
}));

// Get user's lists
router.get('/:actor/lists', authenticate, asyncHandler(async (req, res) => {
  const { actor } = req.params;
  const { limit = 50, cursor } = req.query;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.getLists(agent, actor, {
    limit: parseInt(limit, 10),
    cursor,
  });

  res.json(result);
}));

// Get user's feed (posts)
router.get('/:actor/feed', authenticate, asyncHandler(async (req, res) => {
  const { actor } = req.params;
  const { limit = 50, cursor, filter } = req.query;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.getAuthorFeed(agent, actor, {
    limit: parseInt(limit, 10),
    cursor,
    filter,
  });

  res.json(result);
}));

// Get user's likes
router.get('/:actor/likes', authenticate, asyncHandler(async (req, res) => {
  const { actor } = req.params;
  const { limit = 50, cursor } = req.query;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.getActorLikes(agent, actor, {
    limit: parseInt(limit, 10),
    cursor,
  });

  res.json(result);
}));

// Get user's starter packs
router.get('/:actor/starter-packs', authenticate, asyncHandler(async (req, res) => {
  const { actor } = req.params;
  const { limit = 50, cursor } = req.query;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.getActorStarterPacks(agent, actor, {
    limit: parseInt(limit, 10),
    cursor,
  });

  res.json(result);
}));

export default router;
