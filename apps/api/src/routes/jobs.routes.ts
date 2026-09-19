import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { prisma } from '../db.js';
import { enrichStudent } from './students.routes.js';
import { rankCandidatesForJob, JobRequirement } from '../services/job-matching.service.js';
import { audit } from '../services/audit.service.js';

const router = Router();

const jobSchema = z.object({
  jobTitle: z.string().min(1).default('Software Development Engineer'),
  companyName: z.string().min(1).default('Visiting Technology Recruiter'),
  minCgpa: z.coerce.number().min(0).max(10).default(7.5),
  mandatorySkills: z.union([z.array(z.string()), z.string()]).default([]),
  optionalSkills: z.union([z.array(z.string()), z.string()]).default([]),
  internshipRequired: z.boolean().default(false),
  eligibleBranches: z.union([z.array(z.string()), z.string()]).default([]),
});

function parseList(val: any): string[] {
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === 'string') return val.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
  return [];
}

// POST /api/jobs/match - Rank cohort against company requirements (Protected: Coordinator/Admin only)
router.post('/match', requireAuth, requireRole('ADMIN', 'COORDINATOR'), async (req, res, next) => {
  try {
    const raw = jobSchema.parse(req.body);
    const job: JobRequirement = {
      jobTitle: raw.jobTitle.trim(),
      companyName: raw.companyName.trim(),
      minCgpa: raw.minCgpa,
      mandatorySkills: parseList(raw.mandatorySkills),
      optionalSkills: parseList(raw.optionalSkills),
      internshipRequired: raw.internshipRequired,
      eligibleBranches: parseList(raw.eligibleBranches),
    };

    const students = await prisma.student.findMany();
    const enriched = students.map(enrichStudent);
    const rankedMatches = rankCandidatesForJob(enriched, job);

    await audit(req.user!.id, 'MATCH_JOB_REQUIREMENT', 'JOB', undefined, {
      company: job.companyName,
      title: job.jobTitle,
      matchesCount: rankedMatches.length,
    });

    res.json({
      job,
      totalCandidates: students.length,
      matches: rankedMatches,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/jobs/export-shortlist - Export ranked match shortlist as CSV (Protected: Coordinator/Admin only)
router.post('/export-shortlist', requireAuth, requireRole('ADMIN', 'COORDINATOR'), async (req, res, next) => {
  try {
    const raw = jobSchema.parse(req.body);
    const job: JobRequirement = {
      jobTitle: raw.jobTitle.trim(),
      companyName: raw.companyName.trim(),
      minCgpa: raw.minCgpa,
      mandatorySkills: parseList(raw.mandatorySkills),
      optionalSkills: parseList(raw.optionalSkills),
      internshipRequired: raw.internshipRequired,
      eligibleBranches: parseList(raw.eligibleBranches),
    };

    const students = await prisma.student.findMany();
    const enriched = students.map(enrichStudent);
    const rankedMatches = rankCandidatesForJob(enriched, job);

    const headers = [
      'Rank',
      'MatchScore%',
      'FitTier',
      'CandidateID',
      'Name',
      'Email',
      'Phone',
      'Branch',
      'CGPA',
      'Skills',
      'Projects',
      'Internships',
      'Score10',
      'Category',
      'CGPAMet',
      'MandatorySkillsMatched',
      'MissingSkills',
      'MatchRationale',
    ];

    const rows = rankedMatches.map((m, idx) => [
      idx + 1,
      `${m.matchScore}%`,
      `"${m.tier}"`,
      `"${m.candidate.externalId}"`,
      `"${m.candidate.name.replace(/"/g, '""')}"`,
      `"${m.candidate.email}"`,
      `"${m.candidate.phone || ''}"`,
      `"${m.candidate.branch}"`,
      Number(m.candidate.cgpa).toFixed(2),
      `"${m.candidate.skills.join(', ')}"`,
      `"${m.candidate.projects.join(', ')}"`,
      `"${m.candidate.internships.join(', ')}"`,
      m.candidate.score,
      `"${m.candidate.category}"`,
      m.cgpaMatched ? 'YES' : 'NO',
      `"${m.mandatorySkillsMatched.join(', ')}"`,
      `"${m.mandatorySkillsMissing.join(', ')}"`,
      `"${m.matchReason.replace(/"/g, '""')}"`,
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const filename = `${job.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Shortlist_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
});

export default router;
