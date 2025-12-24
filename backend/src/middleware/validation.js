import { z } from 'zod';
import { AppError } from './errorHandler.js';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      console.error('Validation errors:', JSON.stringify(details, null, 2));
      const appError = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      appError.details = details;
      next(appError);
    } else {
      next(error);
    }
  }
};

// Common validation schemas
export const schemas = {
  login: z.object({
    body: z.object({
      identifier: z.string().min(1, 'Identifier is required'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),

  createPost: z.object({
    body: z.object({
      text: z.string().min(1).max(300, 'Post must be 300 characters or less'),
      replyTo: z.string().optional(),
      quoteUri: z.string().optional(),
      mediaIds: z.array(z.string()).optional(),
      langs: z.array(z.string()).optional(),
    }),
  }),

  updateColumn: z.object({
    params: z.object({
      id: z.string().uuid(),
    }),
    body: z.object({
      title: z.string().optional(),
      position: z.number().int().optional(),
      width: z.number().int().min(250).max(600).optional(),
      config: z.record(z.any()).optional(),
      isVisible: z.boolean().optional(),
      refreshInterval: z.number().int().min(0).max(600).optional(),
    }),
  }),

  createColumn: z.object({
    body: z.object({
      type: z.enum([
        'HOME', 'NOTIFICATIONS', 'MENTIONS', 'MESSAGES',
        'SEARCH', 'LIST', 'FEED', 'PROFILE', 'LIKES', 'BOOKMARKS',
      ]),
      title: z.string().min(1).max(50),
      position: z.number().int().optional(),
      width: z.number().int().min(250).max(600).optional(),
      refreshInterval: z.number().int().min(0).max(600).optional(),
      feedUri: z.string().optional(),
      listUri: z.string().optional(),
      searchQuery: z.string().optional(),
      profileDid: z.string().optional(),
    }),
  }),

  updateTheme: z.object({
    body: z.object({
      name: z.string().optional(),
      mode: z.enum(['light', 'dark', 'system']).optional(),
      primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      bgPrimary: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      bgSecondary: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      bgTertiary: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      textPrimary: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      textSecondary: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      textMuted: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      borderColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      fontFamily: z.string().optional(),
      fontSize: z.enum(['small', 'medium', 'large']).optional(),
      columnWidth: z.number().int().min(250).max(600).optional(),
      columnGap: z.number().int().min(0).max(32).optional(),
      compactMode: z.boolean().optional(),
      customCss: z.string().max(10000).nullable().optional(),
    }).passthrough(),
  }),

  search: z.object({
    query: z.object({
      q: z.string().min(1, 'Search query is required'),
      type: z.enum(['posts', 'users', 'feeds']).optional(),
      limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
      cursor: z.string().optional(),
    }),
  }),

  pagination: z.object({
    query: z.object({
      limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
      cursor: z.string().optional(),
    }),
  }),
};
