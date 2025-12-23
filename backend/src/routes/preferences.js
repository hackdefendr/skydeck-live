import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { blueskyService } from '../services/bluesky.js';

const router = Router();

// Standard content labels from Bluesky
const CONTENT_LABELS = [
  {
    id: 'nsfw',
    label: 'nsfw',
    name: 'Explicit Sexual Images',
    description: 'Images of nudity or sexual activity',
    category: 'adult',
    defaultVisibility: 'warn',
    adultOnly: true,
  },
  {
    id: 'nudity',
    label: 'nudity',
    name: 'Other Nudity',
    description: 'Artistic or non-sexual nudity',
    category: 'adult',
    defaultVisibility: 'warn',
    adultOnly: true,
  },
  {
    id: 'sexual',
    label: 'sexual',
    name: 'Sexually Suggestive',
    description: 'Content that is sexually suggestive but not explicit',
    category: 'adult',
    defaultVisibility: 'warn',
    adultOnly: false,
  },
  {
    id: 'gore',
    label: 'gore',
    name: 'Graphic Violence',
    description: 'Violent or gory content',
    category: 'violence',
    defaultVisibility: 'warn',
    adultOnly: false,
  },
  {
    id: 'corpse',
    label: 'corpse',
    name: 'Dead Bodies',
    description: 'Images of dead bodies or remains',
    category: 'violence',
    defaultVisibility: 'hide',
    adultOnly: false,
  },
  {
    id: 'graphic-media',
    label: 'graphic-media',
    name: 'Graphic Media',
    description: 'Disturbing or graphic media',
    category: 'violence',
    defaultVisibility: 'warn',
    adultOnly: false,
  },
  {
    id: 'spam',
    label: 'spam',
    name: 'Spam',
    description: 'Content identified as spam',
    category: 'moderation',
    defaultVisibility: 'hide',
    adultOnly: false,
  },
  {
    id: 'impersonation',
    label: 'impersonation',
    name: 'Impersonation',
    description: 'Accounts impersonating others',
    category: 'moderation',
    defaultVisibility: 'warn',
    adultOnly: false,
  },
];

// Get helper to create agent
async function getAgent(user) {
  return blueskyService.createAuthenticatedAgent(
    user.accessJwt,
    user.refreshJwt,
    user.did,
    user.handle
  );
}

// Get all content label definitions
router.get('/content-labels', authenticate, asyncHandler(async (req, res) => {
  res.json({ labels: CONTENT_LABELS });
}));

// Get user's content label preferences
router.get('/content-labels/prefs', authenticate, asyncHandler(async (req, res) => {
  const agent = await getAgent(req.user);
  const prefs = await blueskyService.getContentLabelPrefs(agent);

  // Map preferences to a more usable format
  const prefMap = {};
  for (const pref of prefs) {
    const key = pref.labelerDid ? `${pref.labelerDid}:${pref.label}` : pref.label;
    prefMap[key] = pref.visibility;
  }

  res.json({ preferences: prefMap });
}));

// Update a content label preference
router.put('/content-labels/prefs/:label', authenticate, asyncHandler(async (req, res) => {
  const { label } = req.params;
  const { visibility, labelerDid } = req.body;

  if (!['ignore', 'warn', 'hide'].includes(visibility)) {
    return res.status(400).json({ error: 'Invalid visibility. Must be: ignore, warn, or hide' });
  }

  const agent = await getAgent(req.user);
  const result = await blueskyService.setContentLabelPref(agent, {
    label,
    visibility,
    labelerDid,
  });

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json({ success: true });
}));

// Get adult content setting
router.get('/adult-content', authenticate, asyncHandler(async (req, res) => {
  const agent = await getAgent(req.user);
  const enabled = await blueskyService.getAdultContentEnabled(agent);
  res.json({ enabled });
}));

// Update adult content setting
router.put('/adult-content', authenticate, asyncHandler(async (req, res) => {
  const { enabled } = req.body;

  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'enabled must be a boolean' });
  }

  const agent = await getAgent(req.user);
  const result = await blueskyService.setAdultContentEnabled(agent, enabled);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json({ success: true });
}));

// Get all preferences in one call
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const agent = await getAgent(req.user);

  const [labelPrefs, adultContentEnabled] = await Promise.all([
    blueskyService.getContentLabelPrefs(agent),
    blueskyService.getAdultContentEnabled(agent),
  ]);

  // Map label preferences
  const prefMap = {};
  for (const pref of labelPrefs) {
    const key = pref.labelerDid ? `${pref.labelerDid}:${pref.label}` : pref.label;
    prefMap[key] = pref.visibility;
  }

  res.json({
    labels: CONTENT_LABELS,
    preferences: prefMap,
    adultContentEnabled,
  });
}));

export default router;
