import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { prisma } from '../index.js';
import { feedService } from '../services/feed.js';

const router = Router();

// Get user's columns
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const columns = await prisma.column.findMany({
    where: { userId: req.user.id },
    orderBy: { position: 'asc' },
  });

  res.json({ columns });
}));

// Create column
router.post('/', authenticate, validate(schemas.createColumn), asyncHandler(async (req, res) => {
  const { type, title, position, width, feedUri, listUri, searchQuery, profileDid } = req.body;

  // Get max position if not provided
  let columnPosition = position;
  if (columnPosition === undefined) {
    const maxPosition = await prisma.column.findFirst({
      where: { userId: req.user.id },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    columnPosition = (maxPosition?.position ?? -1) + 1;
  }

  const column = await prisma.column.create({
    data: {
      userId: req.user.id,
      type,
      title,
      position: columnPosition,
      width: width || 350,
      feedUri,
      listUri,
      searchQuery,
      profileDid,
    },
  });

  res.status(201).json({ column });
}));

// Update column
router.patch('/:id', authenticate, validate(schemas.updateColumn), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, position, width, config, isVisible } = req.body;

  const column = await prisma.column.updateMany({
    where: {
      id,
      userId: req.user.id,
    },
    data: {
      ...(title !== undefined && { title }),
      ...(position !== undefined && { position }),
      ...(width !== undefined && { width }),
      ...(config !== undefined && { config }),
      ...(isVisible !== undefined && { isVisible }),
    },
  });

  if (column.count === 0) {
    return res.status(404).json({ error: 'Column not found' });
  }

  const updatedColumn = await prisma.column.findUnique({ where: { id } });
  res.json({ column: updatedColumn });
}));

// Reorder columns
router.post('/reorder', authenticate, asyncHandler(async (req, res) => {
  const { columnIds } = req.body;

  // Update positions in a transaction
  await prisma.$transaction(
    columnIds.map((id, index) =>
      prisma.column.updateMany({
        where: { id, userId: req.user.id },
        data: { position: index },
      })
    )
  );

  const columns = await prisma.column.findMany({
    where: { userId: req.user.id },
    orderBy: { position: 'asc' },
  });

  res.json({ columns });
}));

// Delete column
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await prisma.column.deleteMany({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (result.count === 0) {
    return res.status(404).json({ error: 'Column not found' });
  }

  res.json({ success: true });
}));

// Get column feed data
router.get('/:id/feed', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 50, cursor } = req.query;

  const column = await prisma.column.findFirst({
    where: { id, userId: req.user.id },
  });

  if (!column) {
    return res.status(404).json({ error: 'Column not found' });
  }

  const feed = await feedService.getFeedForColumn(req.user, column);
  res.json(feed);
}));

// Reset columns to default
router.post('/reset', authenticate, asyncHandler(async (req, res) => {
  // Delete all existing columns
  await prisma.column.deleteMany({
    where: { userId: req.user.id },
  });

  // Create default columns
  const defaultColumns = [
    { type: 'HOME', title: 'Home', position: 0 },
    { type: 'NOTIFICATIONS', title: 'Notifications', position: 1 },
    { type: 'MESSAGES', title: 'Messages', position: 2 },
  ];

  const columns = await prisma.column.createMany({
    data: defaultColumns.map((col) => ({
      ...col,
      userId: req.user.id,
    })),
  });

  const createdColumns = await prisma.column.findMany({
    where: { userId: req.user.id },
    orderBy: { position: 'asc' },
  });

  res.json({ columns: createdColumns });
}));

export default router;
