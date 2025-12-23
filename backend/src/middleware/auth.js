import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { prisma } from '../index.js';
import { AppError } from './errorHandler.js';

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header or cookie
    let token = req.headers.authorization?.replace('Bearer ', '');

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      // Log which endpoint is being hit without auth for debugging
      console.log(`[AUTH] No token for ${req.method} ${req.originalUrl} from ${req.ip}`);
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        did: true,
        handle: true,
        displayName: true,
        avatar: true,
        accessJwt: true,
        refreshJwt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 401, 'USER_NOT_FOUND');
    }

    // Check session validity
    const session = await prisma.session.findFirst({
      where: {
        token,
        userId: user.id,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new AppError('Session expired or invalid', 401, 'SESSION_INVALID');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'));
    } else {
      next(error);
    }
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.replace('Bearer ', '');

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          did: true,
          handle: true,
          displayName: true,
          avatar: true,
        },
      });

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch {
    // Continue without auth
    next();
  }
};
