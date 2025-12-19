import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { moderationService } from '../services/moderation.js';

const router = Router();

// Get reason types for reporting
router.get('/reason-types', (req, res) => {
  res.json({ reasonTypes: moderationService.getReasonTypes() });
});

// Report post
router.post('/report/post', authenticate, asyncHandler(async (req, res) => {
  const { postUri, postCid, reasonType, reason } = req.body;

  const result = await moderationService.reportPost(
    req.user,
    postUri,
    postCid,
    reasonType,
    reason
  );

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true });
}));

// Report account
router.post('/report/account', authenticate, asyncHandler(async (req, res) => {
  const { did, reasonType, reason } = req.body;

  const result = await moderationService.reportAccount(
    req.user,
    did,
    reasonType,
    reason
  );

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true });
}));

// Block user
router.post('/block/:did', authenticate, asyncHandler(async (req, res) => {
  const { did } = req.params;

  const result = await moderationService.blockUser(req.user, did);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ uri: result.uri });
}));

// Unblock user
router.delete('/block/:did', authenticate, asyncHandler(async (req, res) => {
  const { did } = req.params;
  const { blockUri } = req.body;

  const result = await moderationService.unblockUser(req.user, did, blockUri);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true });
}));

// Get blocked users
router.get('/blocked', authenticate, asyncHandler(async (req, res) => {
  const blocked = await moderationService.getBlockedUsers(req.user);
  res.json({ blocked });
}));

// Mute user
router.post('/mute/:did', authenticate, asyncHandler(async (req, res) => {
  const { did } = req.params;
  const { duration } = req.body; // Duration in seconds, null for permanent

  const result = await moderationService.muteUser(req.user, did, duration);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true });
}));

// Unmute user
router.delete('/mute/:did', authenticate, asyncHandler(async (req, res) => {
  const { did } = req.params;

  const result = await moderationService.unmuteUser(req.user, did);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true });
}));

// Get muted users
router.get('/muted', authenticate, asyncHandler(async (req, res) => {
  const muted = await moderationService.getMutedUsers(req.user);
  res.json({ muted });
}));

// Add muted word
router.post('/muted-words', authenticate, asyncHandler(async (req, res) => {
  const { word, isRegex, duration } = req.body;

  const mutedWord = await moderationService.addMutedWord(
    req.user,
    word,
    isRegex,
    duration
  );

  res.status(201).json({ mutedWord });
}));

// Remove muted word
router.delete('/muted-words/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  await moderationService.removeMutedWord(req.user, id);
  res.json({ success: true });
}));

// Get muted words
router.get('/muted-words', authenticate, asyncHandler(async (req, res) => {
  const mutedWords = await moderationService.getMutedWords(req.user);
  res.json({ mutedWords });
}));

export default router;
