import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authService } from '../services/auth.js';
import { blueskyService } from '../services/bluesky.js';

const router = Router();

// Get user's lists
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { limit = 50, cursor } = req.query;
  const agent = await authService.getBlueskyAgent(req.user);

  const result = await blueskyService.getLists(agent, req.user.did, {
    limit: parseInt(limit),
    cursor,
  });

  res.json(result);
}));

// Get a specific list
router.get('/:uri', authenticate, asyncHandler(async (req, res) => {
  const listUri = decodeURIComponent(req.params.uri);
  const agent = await authService.getBlueskyAgent(req.user);

  try {
    const response = await agent.app.bsky.graph.getList({ list: listUri });
    res.json({
      list: response.data.list,
      items: response.data.items,
      cursor: response.data.cursor,
    });
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({ error: 'Failed to fetch list' });
  }
}));

// Create a new list
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { name, purpose, description, avatar } = req.body;

  if (!name || !purpose) {
    return res.status(400).json({ error: 'Name and purpose are required' });
  }

  // Validate purpose
  const validPurposes = ['app.bsky.graph.defs#curatelist', 'app.bsky.graph.defs#modlist'];
  if (!validPurposes.includes(purpose)) {
    return res.status(400).json({ error: 'Invalid list purpose. Use curatelist or modlist.' });
  }

  const agent = await authService.getBlueskyAgent(req.user);

  try {
    const record = {
      $type: 'app.bsky.graph.list',
      purpose,
      name,
      description: description || '',
      createdAt: new Date().toISOString(),
    };

    // Handle avatar upload if provided
    if (avatar) {
      // Avatar should be a blob reference from a previous upload
      record.avatar = avatar;
    }

    const response = await agent.app.bsky.graph.list.create(
      { repo: req.user.did },
      record
    );

    res.status(201).json({
      uri: response.uri,
      cid: response.cid,
    });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: error.message || 'Failed to create list' });
  }
}));

// Update a list
router.patch('/:rkey', authenticate, asyncHandler(async (req, res) => {
  const { rkey } = req.params;
  const { name, description, avatar } = req.body;

  const agent = await authService.getBlueskyAgent(req.user);

  try {
    // Get current list record
    const currentRecord = await agent.app.bsky.graph.list.get({
      repo: req.user.did,
      rkey,
    });

    // Update record with new values
    const updatedRecord = {
      ...currentRecord.value,
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(avatar !== undefined && { avatar }),
    };

    // Delete old and create new (AT Protocol doesn't have true update)
    await agent.app.bsky.graph.list.delete({
      repo: req.user.did,
      rkey,
    });

    const response = await agent.app.bsky.graph.list.create(
      { repo: req.user.did },
      updatedRecord
    );

    res.json({
      uri: response.uri,
      cid: response.cid,
    });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ error: error.message || 'Failed to update list' });
  }
}));

// Delete a list
router.delete('/:rkey', authenticate, asyncHandler(async (req, res) => {
  const { rkey } = req.params;
  const agent = await authService.getBlueskyAgent(req.user);

  try {
    await agent.app.bsky.graph.list.delete({
      repo: req.user.did,
      rkey,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete list' });
  }
}));

// Add member to list
router.post('/:listUri/members', authenticate, asyncHandler(async (req, res) => {
  const listUri = decodeURIComponent(req.params.listUri);
  const { did } = req.body;

  if (!did) {
    return res.status(400).json({ error: 'Member DID is required' });
  }

  const agent = await authService.getBlueskyAgent(req.user);

  try {
    const response = await agent.app.bsky.graph.listitem.create(
      { repo: req.user.did },
      {
        $type: 'app.bsky.graph.listitem',
        subject: did,
        list: listUri,
        createdAt: new Date().toISOString(),
      }
    );

    res.status(201).json({
      uri: response.uri,
      cid: response.cid,
    });
  } catch (error) {
    console.error('Add list member error:', error);
    res.status(500).json({ error: error.message || 'Failed to add member' });
  }
}));

// Remove member from list
router.delete('/:listUri/members/:rkey', authenticate, asyncHandler(async (req, res) => {
  const { rkey } = req.params;
  const agent = await authService.getBlueskyAgent(req.user);

  try {
    await agent.app.bsky.graph.listitem.delete({
      repo: req.user.did,
      rkey,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Remove list member error:', error);
    res.status(500).json({ error: error.message || 'Failed to remove member' });
  }
}));

// Search users to add to list
router.get('/search/users', authenticate, asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const agent = await authService.getBlueskyAgent(req.user);

  try {
    const result = await blueskyService.searchActors(agent, q, { limit: parseInt(limit) });
    res.json(result);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
}));

export default router;
