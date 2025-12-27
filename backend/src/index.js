import express from 'express';
import path from 'path';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import { initializeSocket } from './socket/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import routes from './routes/index.js';
import { PrismaClient } from '@prisma/client';
import { schedulerService } from './services/scheduler.js';

// Initialize Prisma
export const prisma = new PrismaClient();

// Initialize Express
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = initializeSocket(httpServer);
export { io };

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
app.use(rateLimiter);

// Body parsing
app.use(express.static(path.join('public'), {
    setHeaders: function (res, path, stat) {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
	if (path.endsWith('.css')) {
	    res.setHeader('Content-Type', 'text/css');
	}
    }
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Static files for uploads
app.use('/uploads', express.static(config.upload.uploadDir));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rate limit status (for monitoring)
app.get('/api/status/rate-limits', (req, res) => {
  const { blueskyService } = require('./services/bluesky.js');
  const { cache } = require('./utils/cache.js');

  res.json({
    rateLimits: blueskyService.getRateLimitStatus(),
    cache: {
      inFlightRequests: cache.getInFlightCount(),
    },
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
// Trust proxy settings for Docker/nginx setup
// Use 1 to trust only the first proxy (nginx reverse proxy)
// This prevents IP spoofing via X-Forwarded-For header manipulation
app.set('trust proxy', 1);
httpServer.listen(config.port, () => {
  console.log(`SkyDeck API running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);

  // Start the scheduled posts processor (check every minute)
  schedulerService.start(60000);
});

export default app;
