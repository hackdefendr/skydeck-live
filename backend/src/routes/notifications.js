import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { notificationService } from '../services/notification.js';

const router = Router();

// Get notifications
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { limit = 50, cursor } = req.query;

  const result = await notificationService.getNotifications(req.user, {
    limit: parseInt(limit, 10),
    cursor,
  });

  res.json(result);
}));

// Get unread count
router.get('/unread', authenticate, asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user);
  res.json({ count });
}));

// Mark all as seen
router.post('/seen', authenticate, asyncHandler(async (req, res) => {
  await notificationService.markAsSeen(req.user);
  res.json({ success: true });
}));

// Get notification summary
router.get('/summary', authenticate, asyncHandler(async (req, res) => {
  const result = await notificationService.getNotifications(req.user, { limit: 100 });
  const summary = notificationService.getNotificationSummary(result.notifications);
  res.json(summary);
}));

export default router;
