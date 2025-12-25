import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { prisma } from '../index.js';

const router = Router();

// Get user's theme
router.get('/', authenticate, asyncHandler(async (req, res) => {
  let theme = await prisma.theme.findUnique({
    where: { userId: req.user.id },
  });

  // Create default theme if none exists
  if (!theme) {
    theme = await prisma.theme.create({
      data: { userId: req.user.id },
    });
  }

  res.json({ theme });
}));

// Update theme
router.patch('/', authenticate, validate(schemas.updateTheme), asyncHandler(async (req, res) => {
  const updates = req.body;

  const theme = await prisma.theme.upsert({
    where: { userId: req.user.id },
    create: {
      userId: req.user.id,
      ...updates,
    },
    update: updates,
  });

  res.json({ theme });
}));

// Reset theme to default
router.post('/reset', authenticate, asyncHandler(async (req, res) => {
  await prisma.theme.delete({
    where: { userId: req.user.id },
  }).catch(() => {}); // Ignore if doesn't exist

  const theme = await prisma.theme.create({
    data: { userId: req.user.id },
  });

  res.json({ theme });
}));

// Export theme
router.get('/export', authenticate, asyncHandler(async (req, res) => {
  const theme = await prisma.theme.findUnique({
    where: { userId: req.user.id },
  });

  if (!theme) {
    return res.status(404).json({ error: 'Theme not found' });
  }

  // Remove user-specific fields
  const { id, userId, createdAt, updatedAt, ...exportableTheme } = theme;

  res.json({ theme: exportableTheme });
}));

// Import theme
router.post('/import', authenticate, asyncHandler(async (req, res) => {
  const importedTheme = req.body.theme;

  // Validate imported theme
  const validFields = [
    'name', 'mode', 'primaryColor', 'secondaryColor', 'accentColor',
    'bgPrimary', 'bgSecondary', 'bgTertiary',
    'textPrimary', 'textSecondary', 'textMuted',
    'borderColor', 'fontFamily', 'fontSize',
    'columnWidth', 'columnGap', 'compactMode', 'customCss', 'logoVariant',
  ];

  const filteredTheme = Object.keys(importedTheme)
    .filter((key) => validFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = importedTheme[key];
      return obj;
    }, {});

  const theme = await prisma.theme.upsert({
    where: { userId: req.user.id },
    create: {
      userId: req.user.id,
      ...filteredTheme,
    },
    update: filteredTheme,
  });

  res.json({ theme });
}));

// Get preset themes
router.get('/presets', asyncHandler(async (req, res) => {
  const presets = [
    {
      name: 'Dark (Default)',
      mode: 'dark',
      primaryColor: '#0085ff',
      secondaryColor: '#6366f1',
      accentColor: '#22c55e',
      bgPrimary: '#000000',
      bgSecondary: '#16181c',
      bgTertiary: '#1d1f23',
      textPrimary: '#e7e9ea',
      textSecondary: '#71767b',
      textMuted: '#536471',
      borderColor: '#2f3336',
    },
    {
      name: 'Light',
      mode: 'light',
      primaryColor: '#0085ff',
      secondaryColor: '#6366f1',
      accentColor: '#22c55e',
      bgPrimary: '#ffffff',
      bgSecondary: '#f7f9f9',
      bgTertiary: '#eff3f4',
      textPrimary: '#0f1419',
      textSecondary: '#536471',
      textMuted: '#8b98a5',
      borderColor: '#eff3f4',
    },
    {
      name: 'Dim',
      mode: 'dark',
      primaryColor: '#1d9bf0',
      secondaryColor: '#7856ff',
      accentColor: '#00ba7c',
      bgPrimary: '#15202b',
      bgSecondary: '#1e2732',
      bgTertiary: '#263340',
      textPrimary: '#f7f9f9',
      textSecondary: '#8b98a5',
      textMuted: '#6e767d',
      borderColor: '#38444d',
    },
    {
      name: 'Midnight Blue',
      mode: 'dark',
      primaryColor: '#7aa2f7',
      secondaryColor: '#bb9af7',
      accentColor: '#9ece6a',
      bgPrimary: '#1a1b26',
      bgSecondary: '#24283b',
      bgTertiary: '#414868',
      textPrimary: '#c0caf5',
      textSecondary: '#a9b1d6',
      textMuted: '#565f89',
      borderColor: '#414868',
    },
    {
      name: 'Sunset',
      mode: 'dark',
      primaryColor: '#ff7b72',
      secondaryColor: '#d2a8ff',
      accentColor: '#7ee787',
      bgPrimary: '#0d1117',
      bgSecondary: '#161b22',
      bgTertiary: '#21262d',
      textPrimary: '#f0f6fc',
      textSecondary: '#8b949e',
      textMuted: '#6e7681',
      borderColor: '#30363d',
    },
  ];

  res.json({ presets });
}));

export default router;
