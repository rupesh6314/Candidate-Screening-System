import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma, getStudentDefaultPassword } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { categorize, normalizeList } from '../services/categorization.service.js';
import { parseStudentsCsvWithReport } from '../services/csv.service.js';
import { getActiveRuleset } from '../services/rules.service.js';
import { audit } from '../services/audit.service.js';
import { sendEmail, getWelcomeEmailHtml } from '../services/email.service.js';

export function generateRandomStudentPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Temp#${rand}!`;
}

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const studentSchema = z.object({
  externalId: z.string().min(1).max(50),
  name: z.string().min(1).max(150),
  email: z.string().email(),
  phone: z.string().max(30).nullable().optional(),
  branch: z.string().min(1).max(150),
  cgpa: z.coerce.number().min(0).max(10),
  skills: z.union([z.array(z.string()), z.string()]).default([]),
  projects: z.union([z.array(z.string()), z.string()]).default([]),
  internships: z.union([z.array(z.string()), z.string()]).default([]),
  certifications: z.union([z.array(z.string()), z.string()]).default([]),
});

export const DEFAULT_ASSESSMENT_STUDENTS = [
  {
    externalId: '1',
    name: 'Aarav Gupta',
    email: 'aarav.g@gmail.com',
    phone: '9876543210',
    branch: 'Computer Science',
    cgpa: 9.3,
    skills: ['MERN', 'AWS', 'Next.js'],
    projects: ['E-commerce Web App', 'Chat Application'],
    internships: ['SDE Intern at Amazon'],
    certifications: ['AWS Cloud Practitioner', 'Meta Front-End Developer'],
  },
  {
    externalId: '2',
    name: 'Ishita Verma',
    email: 'ishita.v21@gmail.com',
    phone: '8765432109',
    branch: 'Information Technology',
    cgpa: 8.9,
    skills: ['React', 'Node.js', 'MongoDB'],
    projects: ['Task Management System'],
    internships: ['Frontend Intern at TCS'],
    certifications: ['Google UX Design'],
  },
  {
    externalId: '3',
    name: 'Rohan Nair',
    email: 'rnair.dev@gmail.com',
    phone: '7654321098',
    branch: 'Computer Science',
    cgpa: 9.1,
    skills: ['Python', 'Django', 'React'],
    projects: ['Social Media Dashboard', 'Portfolio App'],
    internships: ['Web Dev Intern at Infosys'],
    certifications: ['IBM Full Stack Software Developer'],
  },
  {
    externalId: '4',
    name: 'Megha Sharma',
    email: 'megha.sharma99@gmail.com',
    phone: '6543210987',
    branch: 'Software Engineering',
    cgpa: 8.5,
    skills: ['Java', 'Spring Boot', 'React'],
    projects: ['Inventory Management System'],
    internships: ['Java Developer Intern at Wipro'],
    certifications: ['Oracle Certified Associate'],
  },
  {
    externalId: '5',
    name: 'Karthik Reddy',
    email: 'karthik.r@gmail.com',
    phone: '9012345678',
    branch: 'Computer Science',
    cgpa: 8.2,
    skills: ['JavaScript', 'Express', 'SQL'],
    projects: ['Weather App', 'Blog Platform'],
    internships: ['Software Intern at Tech Mahindra'],
    certifications: ['HackerRank JavaScript (Basic)'],
  },
  {
    externalId: '6',
    name: 'Sneha Desai',
    email: 'snehad.22@gmail.com',
    phone: '8123456790',
    branch: 'Electronics',
    cgpa: 7.6,
    skills: ['HTML', 'CSS', 'JavaScript'],
    projects: ['Personal Website'],
    internships: [],
    certifications: [],
  },
  {
    externalId: '7',
    name: 'Aditya Kumar',
    email: 'aditya.k45@gmail.com',
    phone: '9123456781',
    branch: 'Mechanical',
    cgpa: 7.1,
    skills: ['Python', 'SQL'],
    projects: ['Data Analysis on Sales Data'],
    internships: [],
    certifications: ['Google Data Analytics'],
  },
  {
    externalId: '8',
    name: 'Neha Singh',
    email: 'nehasingh.01@gmail.com',
    phone: '7123456789',
    branch: 'Information Technology',
    cgpa: 7.8,
    skills: ['Java', 'HTML', 'CSS'],
    projects: ['Library Management System'],
    internships: ['Trainee at WebX'],
    certifications: [],
  },
  {
    externalId: '9',
    name: 'Vivek Joshi',
    email: 'vivek.j@gmail.com',
    phone: '8234567890',
    branch: 'Computer Science',
    cgpa: 6.9,
    skills: ['C++', 'HTML'],
    projects: ['Calculator App'],
    internships: [],
    certifications: [],
  },
  {
    externalId: '10',
    name: 'Pooja Patel',
    email: 'poojap.tech@gmail.com',
    phone: '9345678901',
    branch: 'Civil',
    cgpa: 7.4,
    skills: ['Python', 'Excel'],
    projects: ['Student Database System'],
    internships: [],
    certifications: [],
  },
  {
    externalId: '11',
    name: 'Amit Chawla',
    email: 'amit.c00@gmail.com',
    phone: '9456789012',
    branch: 'Civil',
    cgpa: 5.9,
    skills: ['MS Word'],
    projects: [],
    internships: [],
    certifications: [],
  },
  {
    externalId: '12',
    name: 'Suman Rao',
    email: 'suman.rao1@gmail.com',
    phone: '8567890123',
    branch: 'Mechanical',
    cgpa: 6.1,
    skills: ['Windows', 'Data Entry'],
    projects: ['Basic HTML Page'],
    internships: [],
    certifications: [],
  },
  {
    externalId: '13',
    name: 'Deepak Tiwari',
    email: 'deepakt.77@gmail.com',
    phone: '7678901234',
    branch: 'Electronics',
    cgpa: 5.4,
    skills: ['MS Excel'],
    projects: [],
    internships: [],
    certifications: [],
  },
  {
    externalId: '14',
    name: 'Meera Reddy',
    email: 'meera.r3@gmail.com',
    phone: '9789012345',
    branch: 'Chemical',
    cgpa: 6.3,
    skills: ['Basic Computer'],
    projects: [],
    internships: [],
    certifications: [],
  },
  {
    externalId: '15',
    name: 'Rajeev Menon',
    email: 'rajeev.m9@gmail.com',
    phone: '8890123456',
    branch: 'Mechanical',
    cgpa: 5.2,
    skills: ['MS Office'],
    projects: [],
    internships: [],
    certifications: [],
  },
];

export function enrichStudent(student: any) {
  const rules = getActiveRuleset();
  const numericCgpa = Number(student.cgpa) || 0;
  const evaluation = categorize(
    {
      cgpa: numericCgpa,
      skills: student.skills || [],
      projects: student.projects || [],
      internships: student.internships || [],
      certifications: student.certifications || [],
    },
    rules
  );

  const effectiveCategory = student.isOverridden && student.overrideCategory
    ? student.overrideCategory
    : evaluation.category;

  return {
    ...student,
    cgpa: numericCgpa,
    score: evaluation.score,
    maxScore: evaluation.maxScore,
    calculatedCategory: evaluation.category,
    category: effectiveCategory,
    isOverridden: Boolean(student.isOverridden),
    overrideCategory: student.overrideCategory || null,
    overrideReason: student.overrideReason || null,
    overriddenBy: student.overriddenBy || null,
    overriddenAt: student.overriddenAt || null,
    isReviewed: Boolean(student.isReviewed),
    breakdown: evaluation.breakdown,
    summaryReason: evaluation.summaryReason,
    formulaString: evaluation.formulaString,
    strengths: evaluation.strengths,
    recommendations: evaluation.recommendations,
    technicalSkillsCount: evaluation.technicalSkillsCount,
    nonTechnicalSkillsCount: evaluation.nonTechnicalSkillsCount,
  };
}

function prepareStudentData(raw: z.infer<typeof studentSchema>) {
  const rules = getActiveRuleset();
  const skills = normalizeList(raw.skills);
  const projects = normalizeList(raw.projects);
  const internships = normalizeList(raw.internships);
  const certifications = normalizeList(raw.certifications);
  const numericCgpa = Number(raw.cgpa) || 0;

  const evalResult = categorize(
    {
      cgpa: numericCgpa,
      skills,
      projects,
      internships,
      certifications,
    },
    rules
  );

  return {
    externalId: raw.externalId.trim(),
    name: raw.name.trim(),
    email: raw.email.trim().toLowerCase(),
    phone: raw.phone ? raw.phone.trim() : null,
    branch: raw.branch.trim(),
    cgpa: numericCgpa,
    skills,
    projects,
    internships,
    certifications,
    score: evalResult.score,
    category: evalResult.category,
    isOverridden: false,
    overrideCategory: null,
    overrideReason: null,
    isReviewed: false,
  };
}

// GET /api/students - Filtered list with pagination and explainability
router.get('/', requireAuth, async (req, res, next) => {
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
        sortBy: z
          .enum(['score', 'cgpa', 'name', 'branch', 'createdAt'])
          .default('cgpa'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        page: z.coerce.number().int().positive().default(1),
        pageSize: z.coerce.number().int().min(1).max(200).default(50),
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

    const orderBy: any[] = [];
    if (query.sortBy === 'cgpa') {
      orderBy.push({ cgpa: query.sortOrder });
      orderBy.push({ name: 'asc' });
    } else if (query.sortBy === 'score') {
      orderBy.push({ score: query.sortOrder });
      orderBy.push({ cgpa: 'desc' });
      orderBy.push({ name: 'asc' });
    } else if (query.sortBy === 'name') {
      orderBy.push({ name: query.sortOrder });
      orderBy.push({ cgpa: 'desc' });
    } else {
      orderBy.push({ [query.sortBy]: query.sortOrder });
      orderBy.push({ name: 'asc' });
    }

    const [items, total] = await prisma.$transaction([
      prisma.student.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.student.count({ where }),
    ]);

    const enrichedItems = items.map(enrichStudent);

    res.json({
      items: enrichedItems,
      students: enrichedItems,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: total || enrichedItems.length,
        totalPages: Math.ceil((total || enrichedItems.length) / query.pageSize) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/students/export - Export shortlisted candidates to CSV
router.get('/export', requireAuth, async (req, res, next) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: [{ score: 'desc' }, { cgpa: 'desc' }, { name: 'asc' }],
    });

    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Branch',
      'CGPA',
      'Skills',
      'Projects',
      'Internships',
      'Certifications',
      'Score',
      'Category',
      'Overridden',
      'OverrideReason',
      'Explanation',
    ];

    const rows = students.map((s: any) => {
      const enriched = enrichStudent(s);
      return [
        `"${enriched.externalId}"`,
        `"${enriched.name.replace(/"/g, '""')}"`,
        `"${enriched.email}"`,
        `"${enriched.phone || ''}"`,
        `"${enriched.branch}"`,
        enriched.cgpa.toFixed(2),
        `"${enriched.skills.join(', ')}"`,
        `"${enriched.projects.join(', ')}"`,
        `"${enriched.internships.join(', ')}"`,
        `"${enriched.certifications.join(', ')}"`,
        enriched.score,
        `"${enriched.category}"`,
        enriched.isOverridden ? 'YES' : 'NO',
        `"${(enriched.overrideReason || '').replace(/"/g, '""')}"`,
        `"${enriched.summaryReason.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="placement_shortlist_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
});

// POST /api/students/compare - Side-by-side comparison of 2-4 students
router.post('/compare', requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      ids: z.array(z.number().int()).min(2).max(4),
    });
    const { ids } = schema.parse(req.body);

    const students = await prisma.student.findMany({
      where: { id: { in: ids } },
    });

    const enriched = students.map(enrichStudent);
    res.json({ candidates: enriched });
  } catch (error) {
    next(error);
  }
});

// POST /api/students/bulk-action - Bulk review or action
router.post(
  '/bulk-action',
  requireAuth,
  requireRole('ADMIN', 'COORDINATOR'),
  async (req, res, next) => {
    try {
      const schema = z.object({
        ids: z.array(z.number().int()).min(1),
        action: z.enum(['MARK_REVIEWED', 'UNMARK_REVIEWED', 'DELETE']),
      });
      const { ids, action } = schema.parse(req.body);

      if (action === 'DELETE') {
        for (const id of ids) {
          await prisma.student.delete({ where: { id } });
        }
      } else {
        const isReviewed = action === 'MARK_REVIEWED';
        for (const id of ids) {
          await prisma.student.update({
            where: { id },
            data: { isReviewed },
          });
        }
      }

      await audit(req.user!.id, `BULK_${action}`, 'STUDENT', undefined, { count: ids.length, ids });
      res.json({ success: true, count: ids.length, action });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/students/:id/override - Manual Category Override with mandatory justification
router.post(
  '/:id/override',
  requireAuth,
  requireRole('ADMIN', 'COORDINATOR'),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid student ID' });

      const categoryVal = req.body.category || req.body.overrideCategory;
      const reasonVal = req.body.reason || req.body.overrideReason;

      const schema = z.object({
        category: z.enum(['STRONG', 'AVERAGE', 'NEEDS_IMPROVEMENT']),
        reason: z.string().min(5, 'A detailed override justification reason is required (min 5 characters)'),
      });

      const { category, reason } = schema.parse({ category: categoryVal, reason: reasonVal });
      const student = await prisma.student.findUnique({ where: { id } });
      if (!student) return res.status(404).json({ error: 'Student not found' });

      const updated = await prisma.student.update({
        where: { id },
        data: {
          isOverridden: true,
          overrideCategory: category,
          overrideReason: reason.trim(),
          overriddenBy: req.body.userName || req.user!.name,
          overriddenAt: new Date().toISOString(),
        },
      });

      await audit(req.user!.id, 'MANUAL_OVERRIDE', 'STUDENT', String(id), {
        previousCategory: student.category,
        newCategory: category,
        reason,
      });

      const enriched = enrichStudent(updated);
      res.json({ success: true, student: enriched, ...enriched });
    } catch (error) {
      next(error);
    }
  }
);

// Clear override (supports both POST /:id/clear-override and DELETE /:id/override)
const handleClearOverride = async (req: any, res: any, next: any) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid student ID' });

    const updated = await prisma.student.update({
      where: { id },
      data: {
        isOverridden: false,
        overrideCategory: null,
        overrideReason: null,
        overriddenBy: null,
        overriddenAt: null,
      },
    });

    await audit(req.user!.id, 'CLEAR_OVERRIDE', 'STUDENT', String(id));
    const enriched = enrichStudent(updated);
    res.json({ success: true, student: enriched, ...enriched });
  } catch (error) {
    next(error);
  }
};

router.post('/:id/clear-override', requireAuth, requireRole('ADMIN', 'COORDINATOR'), handleClearOverride);
router.delete('/:id/override', requireAuth, requireRole('ADMIN', 'COORDINATOR'), handleClearOverride);

// POST /api/students/reset-sample - Reset to the STON Technology 15-student assessment dataset
router.post(
  '/reset-sample',
  requireAuth,
  requireRole('ADMIN', 'COORDINATOR'),
  async (req, res, next) => {
    try {
      await prisma.$transaction(async (tx: any) => {
        await tx.student.deleteMany();
        for (const raw of DEFAULT_ASSESSMENT_STUDENTS) {
          const prepared = prepareStudentData(raw);
          const defaultPass = getStudentDefaultPassword(raw.name);
          const passwordHash = bcrypt.hashSync(defaultPass, 10);
          await tx.student.create({
            data: {
              ...prepared,
              passwordHash,
              mustChangePassword: false,
              profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(raw.name)}`,
              resumeUrl: `https://drive.google.com/file/d/sample-resume-${raw.externalId}/view`,
              bio: `Final year ${raw.branch} undergraduate candidate.`,
            },
          });
        }
      });

      await audit(req.user!.id, 'RESET_SAMPLE_DATA', 'STUDENT', undefined, {
        count: DEFAULT_ASSESSMENT_STUDENTS.length,
      });

      res.json({
        success: true,
        message: 'Dataset successfully reset to official 15 assessment records.',
        count: DEFAULT_ASSESSMENT_STUDENTS.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/students/:id - Single student detail with full explainability breakdown
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(enrichStudent(student));
  } catch (error) {
    next(error);
  }
});

// POST /api/students - Add single student
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'COORDINATOR'),
  async (req, res, next) => {
    try {
      const parsed = studentSchema.parse(req.body);
      const data = prepareStudentData(parsed);

      const existing = await prisma.student.findFirst({
        where: {
          OR: [{ externalId: data.externalId }, { email: data.email }],
        },
      });

      if (existing) {
        return res.status(400).json({
          error: `Student with ID "${data.externalId}" or Email "${data.email}" already exists.`,
        });
      }

      const tempPassword = generateRandomStudentPassword();
      const passwordHash = bcrypt.hashSync(tempPassword, 10);

      const created = await prisma.student.create({
        data: {
          ...data,
          passwordHash,
          mustChangePassword: true,
          profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
          resumeUrl: `https://drive.google.com/file/d/sample-resume-${data.externalId}/view`,
          bio: `Final year ${data.branch} undergraduate candidate.`,
        },
      });

      // Dispatch automated welcome and password credentials email notification to student's inbox
      const welcomeSubject = '🎓 Welcome to Campus Placement Portal - Your Login Credentials';
      const welcomeMessage = `Hello ${created.name},

Your official campus placement student account has been registered by the Placement Coordinator.

Here are your login credentials:
• Registered Email: ${created.email}
• Temporary Password: ${tempPassword}

⚠️ CRITICAL SAFETY NOTICE:
When you log in for the first time, you MUST and SHOULD change your password immediately in your profile settings for more safety and account protection.`;

      try {
        await prisma.studentNotification.create({
          data: {
            studentId: created.id,
            studentEmail: created.email,
            subject: welcomeSubject,
            message: welcomeMessage,
          },
        });
      } catch (notifErr: any) {
        console.warn('⚠️ Could not record initial student notification:', notifErr?.message || notifErr);
      }

      // Dispatch SMTP email asynchronously in background
      sendEmail({
        to: created.email,
        subject: welcomeSubject,
        text: welcomeMessage,
        html: getWelcomeEmailHtml(created.name, created.email, tempPassword),
      }).catch((err: any) => {
        console.warn(`⚠️ Background email dispatch failed for ${created.email}:`, err?.message || err);
      });

      await audit(req.user!.id, 'CREATE', 'STUDENT', String(created.id), {
        email: created.email,
        temporaryPasswordDispatched: true,
      });

      res.status(201).json({
        ...enrichStudent(created),
        temporaryPassword: tempPassword,
        credentialsEmailSent: true,
        message: `Student account created successfully! Login credentials with temporary password (${tempPassword}) and security change notice were sent to ${created.email}.`,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/students/:id - Update student
router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'COORDINATOR'),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid student ID' });
      }

      const parsed = studentSchema.partial().parse(req.body);
      const existing = await prisma.student.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const merged = {
        externalId: parsed.externalId ?? existing.externalId,
        name: parsed.name ?? existing.name,
        email: parsed.email ?? existing.email,
        phone: parsed.phone !== undefined ? parsed.phone : existing.phone,
        branch: parsed.branch ?? existing.branch,
        cgpa: parsed.cgpa !== undefined ? Number(parsed.cgpa) : Number(existing.cgpa),
        skills: parsed.skills ?? existing.skills,
        projects: parsed.projects ?? existing.projects,
        internships: parsed.internships ?? existing.internships,
        certifications: parsed.certifications ?? existing.certifications,
      };

      const prepared = prepareStudentData(merged as any);

      const updated = await prisma.student.update({
        where: { id },
        data: prepared,
      });

      await audit(req.user!.id, 'UPDATE', 'STUDENT', String(id));
      res.json(enrichStudent(updated));
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/students/:id - Delete student
router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'COORDINATOR'),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid student ID' });
      }

      await prisma.student.delete({ where: { id } });
      await audit(req.user!.id, 'DELETE', 'STUDENT', String(id));

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/students/import - Transactional CSV import with dirty data report
router.post(
  '/import',
  requireAuth,
  requireRole('ADMIN', 'COORDINATOR'),
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'CSV file is required' });
      }
      if (!req.file.originalname.toLowerCase().endsWith('.csv')) {
        return res.status(400).json({ error: 'Only CSV files are accepted' });
      }

      const rules = getActiveRuleset();
      const report = parseStudentsCsvWithReport(req.file.buffer.toString('utf8'), rules);

      if (report.validStudents.length === 0) {
        return res.status(400).json({
          error: 'CSV file contains no valid student records',
          report,
        });
      }

      await prisma.$transaction(async (tx: any) => {
        for (const record of report.validStudents) {
          await tx.student.upsert({
            where: { externalId: record.externalId },
            update: {
              ...record,
              isOverridden: false,
              overrideCategory: null,
              overrideReason: null,
            },
            create: {
              ...record,
              isOverridden: false,
              overrideCategory: null,
              overrideReason: null,
              isReviewed: false,
            },
          });
        }
      });

      await audit(req.user!.id, 'IMPORT_CSV', 'STUDENT', undefined, {
        totalRows: report.totalRows,
        accepted: report.acceptedCount,
        warnings: report.warningCount,
        fileName: req.file.originalname,
      });

      res.json({
        success: true,
        imported: report.validStudents.length,
        message: `Successfully processed ${report.totalRows} CSV row(s): ${report.acceptedCount} clean, ${report.warningCount} with sanitized warnings.`,
        report,
      });
    } catch (error: any) {
      next(error);
    }
  }
);

export default router;


