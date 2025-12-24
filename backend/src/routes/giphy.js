import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import config from '../config/index.js';

const router = Router();

const GIPHY_API_BASE = 'https://api.giphy.com/v1/gifs';

// Search GIFs
router.get('/search', authenticate, asyncHandler(async (req, res) => {
  const { q, limit = 25, offset = 0 } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  if (!config.giphy.apiKey) {
    return res.status(503).json({ error: 'GIPHY API key not configured' });
  }

  const params = new URLSearchParams({
    api_key: config.giphy.apiKey,
    q,
    limit: Math.min(parseInt(limit, 10), 50),
    offset: parseInt(offset, 10),
    rating: 'pg-13',
    lang: 'en',
  });

  const response = await fetch(`${GIPHY_API_BASE}/search?${params}`);
  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json({ error: data.message || 'GIPHY API error' });
  }

  // Transform response to only include needed data
  const gifs = data.data.map((gif) => ({
    id: gif.id,
    title: gif.title,
    url: gif.url,
    images: {
      original: {
        url: gif.images.original.url,
        width: gif.images.original.width,
        height: gif.images.original.height,
        size: gif.images.original.size,
      },
      fixed_height: {
        url: gif.images.fixed_height.url,
        width: gif.images.fixed_height.width,
        height: gif.images.fixed_height.height,
      },
      fixed_width: {
        url: gif.images.fixed_width.url,
        width: gif.images.fixed_width.width,
        height: gif.images.fixed_width.height,
      },
      preview_gif: {
        url: gif.images.preview_gif.url,
        width: gif.images.preview_gif.width,
        height: gif.images.preview_gif.height,
      },
    },
  }));

  res.json({
    gifs,
    pagination: {
      total: data.pagination.total_count,
      count: data.pagination.count,
      offset: data.pagination.offset,
    },
  });
}));

// Get trending GIFs
router.get('/trending', authenticate, asyncHandler(async (req, res) => {
  const { limit = 25, offset = 0 } = req.query;

  if (!config.giphy.apiKey) {
    return res.status(503).json({ error: 'GIPHY API key not configured' });
  }

  const params = new URLSearchParams({
    api_key: config.giphy.apiKey,
    limit: Math.min(parseInt(limit, 10), 50),
    offset: parseInt(offset, 10),
    rating: 'pg-13',
  });

  const response = await fetch(`${GIPHY_API_BASE}/trending?${params}`);
  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json({ error: data.message || 'GIPHY API error' });
  }

  const gifs = data.data.map((gif) => ({
    id: gif.id,
    title: gif.title,
    url: gif.url,
    images: {
      original: {
        url: gif.images.original.url,
        width: gif.images.original.width,
        height: gif.images.original.height,
        size: gif.images.original.size,
      },
      fixed_height: {
        url: gif.images.fixed_height.url,
        width: gif.images.fixed_height.width,
        height: gif.images.fixed_height.height,
      },
      fixed_width: {
        url: gif.images.fixed_width.url,
        width: gif.images.fixed_width.width,
        height: gif.images.fixed_width.height,
      },
      preview_gif: {
        url: gif.images.preview_gif.url,
        width: gif.images.preview_gif.width,
        height: gif.images.preview_gif.height,
      },
    },
  }));

  res.json({
    gifs,
    pagination: {
      total: data.pagination.total_count,
      count: data.pagination.count,
      offset: data.pagination.offset,
    },
  });
}));

export default router;
