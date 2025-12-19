import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { mediaService } from '../services/media.js';
import config from '../config/index.js';

const router = Router();

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

// Upload image
router.post('/image', authenticate, uploadRateLimiter, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const validation = mediaService.validateFile(req.file, 'image');
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const result = await mediaService.uploadImage(req.user, req.file);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    blob: result.blob,
    mimeType: result.mimeType,
    size: result.size,
  });
}));

// Upload multiple images
router.post('/images', authenticate, uploadRateLimiter, upload.array('files', 4), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files provided' });
  }

  // Validate all files
  for (const file of req.files) {
    const validation = mediaService.validateFile(file, 'image');
    if (!validation.valid) {
      return res.status(400).json({ error: `${file.originalname}: ${validation.error}` });
    }
  }

  // Add alt text from body if provided
  const files = req.files.map((file, index) => ({
    ...file,
    alt: req.body[`alt${index}`] || '',
  }));

  const result = await mediaService.createImageEmbed(req.user, files);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ embed: result.embed });
}));

// Upload video
router.post('/video', authenticate, uploadRateLimiter, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const validation = mediaService.validateFile(req.file, 'video');
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  req.file.alt = req.body.alt || '';

  const result = await mediaService.createVideoEmbed(req.user, req.file);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ embed: result.embed });
}));

// Get supported types
router.get('/types', (req, res) => {
  res.json({
    image: {
      types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      maxSize: 1000000,
      maxCount: 4,
    },
    video: {
      types: ['video/mp4', 'video/webm', 'video/quicktime'],
      maxSize: 50000000,
      maxCount: 1,
    },
  });
});

export default router;
