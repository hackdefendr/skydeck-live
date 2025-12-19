import { Router } from 'express';
import { authService } from '../services/auth.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Login
router.post('/login', authRateLimiter, validate(schemas.login), asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip;

  const result = await authService.login(identifier, password, userAgent, ipAddress);

  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  // Set cookie
  res.cookie('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    token: result.token,
    user: result.user,
  });
}));

// Logout
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  await authService.logout(req.token);
  res.clearCookie('token');
  res.json({ success: true });
}));

// Logout all sessions
router.post('/logout-all', authenticate, asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.id);
  res.clearCookie('token');
  res.json({ success: true });
}));

// Get current user
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.json({ user: req.user });
}));

// Get sessions
router.get('/sessions', authenticate, asyncHandler(async (req, res) => {
  const sessions = await authService.getSessions(req.user.id);
  res.json({ sessions });
}));

// Revoke session
router.delete('/sessions/:sessionId', authenticate, asyncHandler(async (req, res) => {
  const result = await authService.revokeSession(req.user.id, req.params.sessionId);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true });
}));

// Refresh token
router.post('/refresh', authenticate, asyncHandler(async (req, res) => {
  const result = await authService.refreshBlueskySession(req.user);

  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  res.json({ success: true });
}));

export default router;
