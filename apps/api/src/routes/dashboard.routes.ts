import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../db.js';
import { getActiveRuleset } from '../services/rules.service.js';
import { enrichStudent } from './students.routes.js';

const router = Router();

router.get('/summary', requireAuth, async (req, res, next) => {
  try {
    const query = z
      .object({
        minCgpa: z.coerce.number().min(0).max(10).optional(),
        maxCgpa: z.coerce.number().min(0).max(10).optional(),
        skill: z.string().trim().optional(),
        skills: z.string().trim().optional(),
        skillsMatchMode: z.enum(['AND', 'OR']).default('OR'),
        category: z.string().trim().optional(),
        branch: z.string().trim().optional(),
        search: z.string().trim().optional(),
        hasInternship: z.enum(['true', 'false']).optional(),
        hasCertification: z.enum(['true', 'false']).optional(),
        isOverridden: z.enum(['true', 'false']).optional(),
        isReviewed: z.enum(['true', 'false']).optional(),
      })
      .parse(req.query);

    const where: any = {};

    if (query.minCgpa !== undefined || query.maxCgpa !== undefined) {
      where.cgpa = {};
      if (query.minCgpa !== undefined) where.cgpa.gte = query.minCgpa;
      if (query.maxCgpa !== undefined) where.cgpa.lte = query.maxCgpa;
    }

    const rawSkillFilter = query.skills || query.skill;
    if (rawSkillFilter) {
      const skillList = rawSkillFilter.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillList.length > 0) {
        if (query.skillsMatchMode === 'AND') {
          where.skills = { hasEvery: skillList };
        } else {
          where.skills = { hasSome: skillList };
        }
      }
    }

    if (query.category) {
      const categories = query.category.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
      if (categories.length === 1) {
        where.category = categories[0];
      } else if (categories.length > 1) {
        where.category = { in: categories };
      }
    }

    if (query.branch) {
      const branches = query.branch.split(',').map((b) => b.trim()).filter(Boolean);
      if (branches.length === 1) {
        where.branch = { contains: branches[0], mode: 'insensitive' };
      } else if (branches.length > 1) {
        where.branch = { in: branches };
      }
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { externalId: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.hasInternship !== undefined) {
      where.internships =
        query.hasInternship === 'true'
          ? { isEmpty: false }
          : { isEmpty: true };
    }

    if (query.hasCertification !== undefined) {
      where.certifications =
        query.hasCertification === 'true'
          ? { isEmpty: false }
          : { isEmpty: true };
    }

    if (query.isOverridden !== undefined) {
      where.isOverridden = query.isOverridden === 'true';
    }

    if (query.isReviewed !== undefined) {
      where.isReviewed = query.isReviewed === 'true';
    }

    // Retrieve filtered list of students
    const filteredStudents = await prisma.student.findMany({ where });
    const totalCohortCount = await prisma.student.count();

    const activeRules = getActiveRuleset();
    const total = filteredStudents.length;

    let strong = 0;
    let average = 0;
    let needsImprovement = 0;
    let withInternship = 0;
    let withCertification = 0;
    let overriddenCount = 0;
    let reviewedCount = 0;

    const skillCounts: Record<string, number> = {};
    const branchMap: Record<string, { total: number; strong: number; average: number; needsImprovement: number }> = {};
    const cgpaHistogram: Record<string, number> = {
      '<6.0': 0,
      '6.0–6.9': 0,
      '7.0–7.9': 0,
      '8.0–8.9': 0,
      '9.0–10.0': 0,
    };

    let cgpaSum = 0;
    let maxCgpa = 0;
    let minCgpa = total > 0 ? 10 : 0;

    for (const rawStudent of filteredStudents) {
      const student = enrichStudent(rawStudent);
      const effCategory = student.category;

      if (effCategory === 'STRONG') strong++;
      else if (effCategory === 'AVERAGE') average++;
      else needsImprovement++;

      if (student.isOverridden) overriddenCount++;
      if (student.isReviewed) reviewedCount++;

      const numCgpa = Number(student.cgpa) || 0;
      cgpaSum += numCgpa;
      if (numCgpa > maxCgpa) maxCgpa = numCgpa;
      if (numCgpa < minCgpa) minCgpa = numCgpa;

      if (numCgpa < 6.0) cgpaHistogram['<6.0']++;
      else if (numCgpa < 7.0) cgpaHistogram['6.0–6.9']++;
      else if (numCgpa < 8.0) cgpaHistogram['7.0–7.9']++;
      else if (numCgpa < 9.0) cgpaHistogram['8.0–8.9']++;
      else cgpaHistogram['9.0–10.0']++;

      if (student.internships && student.internships.length > 0) withInternship++;
      if (student.certifications && student.certifications.length > 0) withCertification++;

      if (Array.isArray(student.skills)) {
        for (const sk of student.skills) {
          if (sk) skillCounts[sk] = (skillCounts[sk] || 0) + 1;
        }
      }

      if (!branchMap[student.branch]) {
        branchMap[student.branch] = { total: 0, strong: 0, average: 0, needsImprovement: 0 };
      }
      branchMap[student.branch].total++;
      if (effCategory === 'STRONG') branchMap[student.branch].strong++;
      else if (effCategory === 'AVERAGE') branchMap[student.branch].average++;
      else branchMap[student.branch].needsImprovement++;
    }

    const topSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const branches = Object.entries(branchMap)
      .map(([branch, stats]) => ({ branch, ...stats }))
      .sort((a, b) => b.total - a.total);

    const strongPct = total > 0 ? Math.round((strong / total) * 100) : 0;
    const avgPct = total > 0 ? Math.round((average / total) * 100) : 0;
    const needsPct = total > 0 ? Math.round((needsImprovement / total) * 100) : 0;
    const internshipRate = total > 0 ? Math.round((withInternship / total) * 100) : 0;
    const certificationRate = total > 0 ? Math.round((withCertification / total) * 100) : 0;
    const averageCgpa = total > 0 ? Number((cgpaSum / total).toFixed(2)) : 0;

    res.json({
      totalCohortCount,
      total,
      isFiltered: total !== totalCohortCount,
      strong,
      strongPct,
      average,
      avgPct,
      needsImprovement,
      needsPct,
      averageCgpa,
      maxCgpa: total > 0 ? maxCgpa : 0,
      minCgpa: total > 0 ? minCgpa : 0,
      withInternship,
      internshipRate,
      withCertification,
      certificationRate,
      overriddenCount,
      reviewedCount,
      topSkills,
      branches,
      cgpaHistogram,
      rules: {
        id: activeRules.id,
        version: activeRules.version,
        strongThreshold: activeRules.strongThreshold,
        averageThreshold: activeRules.averageThreshold,
        maxScore: activeRules.cgpaMax + activeRules.skillsMax + activeRules.projectsMax + activeRules.internshipMax + activeRules.certificationMax,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;


