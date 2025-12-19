import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { messagingService } from '../services/messaging.js';

const router = Router();

// Get conversations
router.get('/conversations', authenticate, asyncHandler(async (req, res) => {
  const { limit = 50, cursor } = req.query;

  const result = await messagingService.getConversations(req.user, {
    limit: parseInt(limit, 10),
    cursor,
  });

  res.json(result);
}));

// Get single conversation
router.get('/conversations/:convoId', authenticate, asyncHandler(async (req, res) => {
  const { convoId } = req.params;
  const conversation = await messagingService.getConversation(req.user, convoId);
  res.json({ conversation });
}));

// Get messages in conversation
router.get('/conversations/:convoId/messages', authenticate, asyncHandler(async (req, res) => {
  const { convoId } = req.params;
  const { limit = 50, cursor } = req.query;

  const result = await messagingService.getMessages(req.user, convoId, {
    limit: parseInt(limit, 10),
    cursor,
  });

  res.json(result);
}));

// Send message
router.post('/conversations/:convoId/messages', authenticate, asyncHandler(async (req, res) => {
  const { convoId } = req.params;
  const { text } = req.body;

  const result = await messagingService.sendMessage(req.user, convoId, text);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json({ message: result.message });
}));

// Delete message
router.delete('/conversations/:convoId/messages/:messageId', authenticate, asyncHandler(async (req, res) => {
  const { convoId, messageId } = req.params;

  const result = await messagingService.deleteMessage(req.user, convoId, messageId);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true });
}));

// Start new conversation
router.post('/conversations', authenticate, asyncHandler(async (req, res) => {
  const { memberDids } = req.body;

  const result = await messagingService.startConversation(req.user, memberDids);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json({ conversation: result.conversation });
}));

// Leave conversation
router.delete('/conversations/:convoId', authenticate, asyncHandler(async (req, res) => {
  const { convoId } = req.params;

  const result = await messagingService.leaveConversation(req.user, convoId);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true });
}));

// Mute conversation
router.post('/conversations/:convoId/mute', authenticate, asyncHandler(async (req, res) => {
  const { convoId } = req.params;

  const result = await messagingService.muteConversation(req.user, convoId);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true });
}));

// Unmute conversation
router.delete('/conversations/:convoId/mute', authenticate, asyncHandler(async (req, res) => {
  const { convoId } = req.params;

  const result = await messagingService.unmuteConversation(req.user, convoId);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true });
}));

// Mark conversation as read
router.post('/conversations/:convoId/read', authenticate, asyncHandler(async (req, res) => {
  const { convoId } = req.params;
  const { messageId } = req.body;

  const result = await messagingService.markAsRead(req.user, convoId, messageId);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true });
}));

// Get unread count
router.get('/unread', authenticate, asyncHandler(async (req, res) => {
  const count = await messagingService.getUnreadCount(req.user);
  res.json({ count });
}));

export default router;
