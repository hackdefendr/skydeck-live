import { Router } from 'express';
import authRoutes from './auth.js';
import usersRoutes from './users.js';
import postsRoutes from './posts.js';
import feedsRoutes from './feeds.js';
import notificationsRoutes from './notifications.js';
import messagesRoutes from './messages.js';
import columnsRoutes from './columns.js';
import themesRoutes from './themes.js';
import moderationRoutes from './moderation.js';
import preferencesRoutes from './preferences.js';
import mediaRoutes from './media.js';
import searchRoutes from './search.js';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/posts', postsRoutes);
router.use('/feeds', feedsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/messages', messagesRoutes);
router.use('/columns', columnsRoutes);
router.use('/themes', themesRoutes);
router.use('/moderation', moderationRoutes);
router.use('/preferences', preferencesRoutes);
router.use('/media', mediaRoutes);
router.use('/search', searchRoutes);

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'SkyDeck API',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/users',
      '/api/posts',
      '/api/feeds',
      '/api/notifications',
      '/api/messages',
      '/api/columns',
      '/api/themes',
      '/api/moderation',
      '/api/preferences',
      '/api/media',
      '/api/search',
    ],
  });
});

export default router;
