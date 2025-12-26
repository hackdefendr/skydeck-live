import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { translationService } from '../services/translation.js';

const router = Router();

// Translate text
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { text, targetLang, sourceLang } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!targetLang) {
    return res.status(400).json({ error: 'Target language is required' });
  }

  const result = await translationService.translate(text, targetLang, sourceLang || 'auto');

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json({
    translatedText: result.translatedText,
    detectedLanguage: result.detectedLanguage,
    targetLanguage: result.targetLanguage,
    cached: result.cached || false,
  });
}));

// Detect language
router.post('/detect', authenticate, asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const result = await translationService.detectLanguage(text);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json({
    language: result.language,
    confidence: result.confidence,
  });
}));

// Get supported languages
router.get('/languages', authenticate, asyncHandler(async (req, res) => {
  const languages = translationService.getSupportedLanguages();
  res.json({ languages });
}));

export default router;
