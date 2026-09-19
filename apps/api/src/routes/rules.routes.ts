import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { prisma } from '../db.js';
import {
  getActiveRuleset,
  saveRuleset,
  resetRulesetToDefault,
  previewCohortImpact,
} from '../services/rules.service.js';

const router = Router();

const rulesetSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  version: z.coerce.number().optional(),
  cgpaMax: z.coerce.number().min(0).max(100),
  skillsMax: z.coerce.number().min(0).max(100),
  projectsMax: z.coerce.number().min(0).max(100),
  internshipMax: z.coerce.number().min(0).max(100),
  certificationMax: z.coerce.number().min(0).max(100),
  strongThreshold: z.coerce.number().min(0).max(100),
  averageThreshold: z.coerce.number().min(0).max(100),
  nonTechnicalSkills: z.array(z.string()).optional(),
});

// GET /api/rules - Retrieve active ruleset
router.get('/', requireAuth, (_req, res) => {
  const rules = getActiveRuleset();
  res.json({ rules, ...rules });
});

// POST /api/rules/preview - Preview impact of new weights on the cohort (Protected: Coordinator/Admin only)
router.post('/preview', requireAuth, requireRole('ADMIN', 'COORDINATOR'), async (req, res, next) => {
  try {
    const proposed = rulesetSchema.partial().parse(req.body);
    const students = await prisma.student.findMany();
    const preview = previewCohortImpact(proposed, students);
    res.json(preview);
  } catch (error) {
    next(error);
  }
});

// PUT /api/rules - Update active ruleset with version increment
router.put(
  '/',
  requireAuth,
  requireRole('ADMIN', 'COORDINATOR'),
  async (req, res, next) => {
    try {
      const parsed = rulesetSchema.parse(req.body);
      const updated = await saveRuleset(parsed, req.user!.id);
      res.json({
        success: true,
        message: `Ruleset updated successfully (Version ${updated.version}).`,
        rules: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/rules/reset - Reset ruleset to system defaults
router.post(
  '/reset',
  requireAuth,
  requireRole('ADMIN', 'COORDINATOR'),
  async (req, res, next) => {
    try {
      const reset = await resetRulesetToDefault(req.user!.id);
      res.json({
        success: true,
        message: 'Scoring ruleset reset to system default values.',
        rules: reset,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
