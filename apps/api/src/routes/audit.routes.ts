import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { prisma } from '../db.js';

const router = Router();

// GET /api/audit - Get system audit log history (Protected: Coordinator/Admin only)
router.get('/', requireAuth, requireRole('ADMIN', 'COORDINATOR'), async (_req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ logs });
  } catch (error) {
    next(error);
  }
});

export default router;
