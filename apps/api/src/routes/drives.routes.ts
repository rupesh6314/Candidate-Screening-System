import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { sendEmail, getDriveAlertEmailHtml } from '../services/email.service.js';

export const router = Router();

// --------------------------------------------------------------------------
// 1. Placement Coordinator / Admin: List & Create Company Drives
// --------------------------------------------------------------------------

// GET /api/drives - List all company drives with applicant statistics
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const drives = await prisma.companyDrive.findMany();
    const applications = await prisma.driveApplication.findMany();
    const students = await prisma.student.findMany();

    const drivesWithStats = drives.map((drive: any) => {
      const driveApps = applications.filter((a: any) => a.driveId === drive.id);
      const eligibleCount = students.filter(
        (s: any) =>
          Number(s.cgpa) >= Number(drive.minCgpa) &&
          (!drive.allowedBranches?.length || drive.allowedBranches.includes(s.branch))
      ).length;

      const optedInCount = driveApps.filter((a: any) => a.status === 'OPTED_IN').length;
      const optedOutCount = driveApps.filter((a: any) => a.status === 'OPTED_OUT').length;
      const shortlistedCount = driveApps.filter((a: any) => a.status === 'OPTED_IN' && a.isShortlistedByCoordinator).length;

      const isDeadlinePassed = new Date(drive.deadline).getTime() < Date.now();

      return {
        ...drive,
        stats: {
          eligibleCount,
          optedInCount,
          optedOutCount,
          shortlistedCount,
          pendingResponseCount: Math.max(0, eligibleCount - (optedInCount + optedOutCount)),
          isDeadlinePassed,
        },
      };
    });

    res.json({ drives: drivesWithStats });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch company drives' });
  }
});

// POST /api/drives - Post a new campus drive with targeted email notification dispatch
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      companyName,
      logoUrl,
      role,
      jobType = 'FULL_TIME',
      ctc,
      stipend,
      location,
      minCgpa = 7.0,
      allowedBranches = [],
      requiredSkills = [],
      description,
      selectionProcess = [],
      serviceAgreement = 'None',
      startDate,
      deadline,
    } = req.body;

    if (!companyName || !role || !ctc || !deadline) {
      res.status(400).json({ error: 'Company name, role, CTC, and application deadline are mandatory.' });
      return;
    }

    const minCgpaNum = Number(minCgpa) || 0;
    const driveDeadline = new Date(deadline).toISOString();
    const driveStart = startDate ? new Date(startDate).toISOString() : new Date().toISOString();

    const newDrive = await prisma.companyDrive.create({
      data: {
        companyName,
        logoUrl: logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(companyName)}`,
        role,
        jobType,
        ctc,
        stipend: stipend || 'Not Disclosed',
        location: location || 'Bangalore / Hybrid',
        minCgpa: minCgpaNum,
        allowedBranches: Array.isArray(allowedBranches) ? allowedBranches : [],
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
        description: description || `${companyName} is hiring for ${role}.`,
        selectionProcess: Array.isArray(selectionProcess) && selectionProcess.length > 0
          ? selectionProcess
          : ['Online Coding Assessment', 'Technical Interview 1', 'HR Discussion'],
        serviceAgreement: serviceAgreement || 'None',
        startDate: driveStart,
        deadline: driveDeadline,
        isActive: true,
        createdBy: 'Placement Coordinator',
      },
    });

    // Targeted Notification & Simulated Email Engine:
    // Filter all students who meet the CGPA and branch criteria
    const allStudents = await prisma.student.findMany();
    const eligibleStudents = allStudents.filter((s: any) => {
      const passesCgpa = Number(s.cgpa) >= minCgpaNum;
      const passesBranch =
        !newDrive.allowedBranches.length || newDrive.allowedBranches.includes(s.branch);
      return passesCgpa && passesBranch;
    });

    const deadlineFormatted = new Date(driveDeadline).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const notificationsToCreate = eligibleStudents.map((student: any) => ({
      studentId: student.id,
      studentEmail: student.email,
      driveId: newDrive.id,
      companyName: newDrive.companyName,
      subject: `🎯 Campus Placement Alert: ${newDrive.companyName} (${newDrive.role}) Drive Active!`,
      message: `Dear ${student.name},\n\nYou are eligible for the upcoming ${newDrive.companyName} campus placement drive for the role of "${newDrive.role}".\n\n• Package / CTC: ${newDrive.ctc}\n• Monthly Stipend: ${newDrive.stipend}\n• Minimum CGPA Required: ${newDrive.minCgpa}\n• Application Window: Active until ${deadlineFormatted}\n\nPlease log in to your Student Placement Portal and submit your Opt-In response before the strict deadline!`,
      minCgpa: minCgpaNum,
      deadline: driveDeadline,
      isRead: false,
    }));

    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({ data: notificationsToCreate });

      // Send real SMTP HTML emails to eligible students before completing response
      try {
        await Promise.allSettled(
          eligibleStudents.map((st: any) =>
            sendEmail({
              to: st.email,
              subject: `🎯 Campus Placement Alert: ${newDrive.companyName} (${newDrive.role}) Drive Active!`,
              text: `Dear ${st.name},\n\nYou are eligible for the upcoming ${newDrive.companyName} campus placement drive for the role of "${newDrive.role}".\n\n• Package / CTC: ${newDrive.ctc}\n• Minimum CGPA Required: ${newDrive.minCgpa}\n• Application Window: Active until ${deadlineFormatted}\n\nPlease log in to your Student Placement Portal and submit your Opt-In response!`,
              html: getDriveAlertEmailHtml(
                st.name,
                newDrive.companyName,
                newDrive.role,
                newDrive.ctc,
                driveDeadline,
                minCgpaNum
              ),
            })
          )
        );
      } catch (e) {
        console.error('Drive emails dispatch error:', e);
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'COMPANY_DRIVE_POSTED',
        entityType: 'COMPANY_DRIVE',
        entityId: newDrive.id,
        userEmail: 'admin@placement.edu',
        details: JSON.stringify({
          companyName,
          role,
          minCgpa: minCgpaNum,
          eligibleCount: eligibleStudents.length,
          deadline: driveDeadline,
        }),
      },
    });

    res.status(201).json({
      drive: newDrive,
      eligibleStudentsCount: eligibleStudents.length,
      notificationsDispatched: notificationsToCreate.length,
      message: `Campus drive for ${companyName} posted successfully. Targeted email notifications dispatched to ${eligibleStudents.length} eligible candidates.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create campus drive' });
  }
});

// GET /api/drives/:id - Get detailed company drive with JD
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const drive = await prisma.companyDrive.findUnique({ where: { id: req.params.id } });
    if (!drive) {
      res.status(404).json({ error: 'Company drive not found' });
      return;
    }
    res.json({ drive });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch drive details' });
  }
});

// GET /api/drives/:id/applicants - Placement Coordinator view of opted-in & opted-out candidates
router.get('/:id/applicants', async (req: Request, res: Response): Promise<void> => {
  try {
    const drive = await prisma.companyDrive.findUnique({ where: { id: req.params.id } });
    if (!drive) {
      res.status(404).json({ error: 'Company drive not found' });
      return;
    }

    const applications = await prisma.driveApplication.findMany({
      where: { driveId: req.params.id },
    });

    const students = await prisma.student.findMany();

    // Map application records with live student details
    const detailedApplicants = applications.map((app: any) => {
      const s = students.find((st: any) => Number(st.id) === Number(app.studentId));
      return {
        id: app.id,
        driveId: app.driveId,
        studentId: app.studentId,
        status: app.status,
        responseAt: app.responseAt,
        isShortlistedByCoordinator: Boolean(app.isShortlistedByCoordinator),
        coordinatorNotes: app.coordinatorNotes || '',
        sharedWithCompanyAt: app.sharedWithCompanyAt || null,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        studentExternalId: s?.externalId || String(app.studentId),
        studentName: s?.name || 'Candidate #' + app.studentId,
        studentEmail: s?.email || '',
        studentPhone: s?.phone || '',
        studentBranch: s?.branch || 'General',
        studentCgpa: Number(s?.cgpa ?? 0),
        studentSkills: Array.isArray(s?.skills) ? s.skills : [],
        studentResumeUrl: s?.resumeUrl || '',
        studentAvatarUrl: s?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(s?.name || String(app.studentId))}`,
        student: s || null,
      };
    });

    const optedIn = detailedApplicants.filter((a: any) => a.status === 'OPTED_IN');
    const optedOut = detailedApplicants.filter((a: any) => a.status === 'OPTED_OUT');
    const shortlisted = optedIn.filter((a: any) => a.isShortlistedByCoordinator);

    res.json({
      drive,
      optedIn,
      optedOut,
      shortlisted,
      summary: {
        totalOptedIn: optedIn.length,
        totalOptedOut: optedOut.length,
        totalShortlisted: shortlisted.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch applicants' });
  }
});

// PATCH /api/drives/:id/applicants/:studentId - Coordinator shortlist / un-shortlist candidate profile
router.patch('/:id/applicants/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { isShortlisted, coordinatorNotes } = req.body;
    const driveId = req.params.id;
    const studentId = Number(req.params.studentId);

    const updated = await prisma.driveApplication.update({
      where: { driveId, studentId },
      data: {
        isShortlistedByCoordinator: Boolean(isShortlisted),
        ...(coordinatorNotes !== undefined ? { coordinatorNotes } : {}),
      },
    });

    res.json({ application: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update applicant shortlist status' });
  }
});

// POST /api/drives/:id/share-with-company - Finalize & export candidate profiles to company recruiter
router.post('/:id/share-with-company', async (req: Request, res: Response): Promise<void> => {
  try {
    const drive = await prisma.companyDrive.findUnique({ where: { id: req.params.id } });
    if (!drive) {
      res.status(404).json({ error: 'Company drive not found' });
      return;
    }

    const applications = await prisma.driveApplication.findMany({
      where: { driveId: req.params.id, status: 'OPTED_IN' },
    });

    // Filter shortlisted if any, otherwise all opted-in
    const shortlisted = applications.filter((a: any) => a.isShortlistedByCoordinator);
    const candidatesToShare = shortlisted.length > 0 ? shortlisted : applications;

    const sharedAt = new Date().toISOString();

    for (const app of candidatesToShare) {
      await prisma.driveApplication.update({
        where: { id: app.id },
        data: { sharedWithCompanyAt: sharedAt },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: 'CANDIDATE_LIST_DISPATCHED_TO_COMPANY',
        entityType: 'COMPANY_DRIVE',
        entityId: drive.id,
        userEmail: 'admin@placement.edu',
        details: JSON.stringify({
          companyName: drive.companyName,
          role: drive.role,
          dispatchedCount: candidatesToShare.length,
          sharedAt,
        }),
      },
    });

    res.json({
      success: true,
      message: `Successfully approved and dispatched ${candidatesToShare.length} candidate profiles to ${drive.companyName} recruitment team.`,
      dispatchedCount: candidatesToShare.length,
      candidates: candidatesToShare,
      sharedAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to share candidate list with company' });
  }
});

// --------------------------------------------------------------------------
// 2. Student Portal: Feed, Opt-In / Opt-Out, Notifications, Profile
// --------------------------------------------------------------------------

// GET /api/drives/student/:studentId - Tailored company feeds for a student (Active, Not Opted-In, All)
router.get('/student/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await resolveStudent(req.params.studentId, (req as any).user?.email);
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const allDrives = await prisma.companyDrive.findMany();
    const studentApps = await prisma.driveApplication.findMany({ where: { studentId: student.id } });

    const now = Date.now();

    // Filter drives where student is eligible based on CGPA and Branch
    const eligibleDrives = allDrives.filter((drive: any) => {
      const meetsCgpa = Number(student.cgpa) >= Number(drive.minCgpa);
      const meetsBranch =
        !drive.allowedBranches?.length || drive.allowedBranches.includes(student.branch);
      return meetsCgpa && meetsBranch;
    });

    const enrichedDrives = eligibleDrives.map((drive: any) => {
      const app = studentApps.find((a: any) => a.driveId === drive.id);
      const deadlineTime = new Date(drive.deadline).getTime();
      const isExpired = deadlineTime < now;

      return {
        ...drive,
        studentResponse: app
          ? {
              status: app.status,
              responseAt: app.responseAt,
              isShortlisted: app.isShortlistedByCoordinator,
            }
          : null,
        isExpired,
        timeRemainingMs: Math.max(0, deadlineTime - now),
      };
    });

    // 1. Active Drives: Deadline has not passed
    const activeDrives = enrichedDrives.filter((d: any) => !d.isExpired);

    // 2. Not Opted-In: Deadline has expired, and student either did NOT respond or opted out
    const notOptedInDrives = enrichedDrives.filter(
      (d: any) => d.isExpired && (!d.studentResponse || d.studentResponse.status === 'OPTED_OUT')
    );

    // 3. All Eligible Drives: All drives matching student criteria
    const allEligibleDrives = enrichedDrives;

    res.json({
      student: {
        ...student,
        mustChangePassword: Boolean(student.mustChangePassword),
      },
      feeds: {
        active: activeDrives,
        notOptedIn: notOptedInDrives,
        all: allEligibleDrives,
      },
      counts: {
        active: activeDrives.length,
        notOptedIn: notOptedInDrives.length,
        all: allEligibleDrives.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch student drive feed' });
  }
});

// POST /api/drives/student/:studentId/respond - Student Opt-In or Opt-Out
router.post('/student/:studentId/respond', async (req: Request, res: Response): Promise<void> => {
  try {
    const studentIdParam = req.params.studentId;
    const { driveId, status } = req.body;

    if (!driveId || !['OPTED_IN', 'OPTED_OUT'].includes(status)) {
      res.status(400).json({ error: 'Valid driveId and status (OPTED_IN / OPTED_OUT) are required.' });
      return;
    }

    const student = await resolveStudent(studentIdParam, (req as any).user?.email);
    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const drive = await prisma.companyDrive.findUnique({ where: { id: driveId } });
    if (!drive) {
      res.status(404).json({ error: 'Company drive not found.' });
      return;
    }

    // Check Eligibility
    if (Number(student.cgpa) < Number(drive.minCgpa)) {
      res.status(403).json({
        error: `Ineligible: This drive requires a minimum CGPA of ${drive.minCgpa}. Your current CGPA is ${student.cgpa}.`,
      });
      return;
    }

    // Check Deadline Enforcement
    const deadlineTime = new Date(drive.deadline).getTime();
    if (deadlineTime < Date.now()) {
      res.status(400).json({
        error: `The application deadline for ${drive.companyName} closed on ${new Date(drive.deadline).toLocaleString('en-IN')}. No further responses can be submitted.`,
      });
      return;
    }

    const application = await prisma.driveApplication.upsert({
      where: {
        driveId_studentId: { driveId, studentId: student.id },
      },
      update: {
        status,
        responseAt: new Date(),
      },
      create: {
        driveId,
        studentId: student.id,
        status,
        responseAt: new Date(),
        isShortlistedByCoordinator: false,
        coordinatorNotes: '',
      },
    });

    res.json({
      success: true,
      message: status === 'OPTED_IN' ? 'Opted In Successfully' : 'Opted Out Successfully',
      application,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to submit response' });
  }
});

// Helper to resolve student by id, externalId, or email
async function resolveStudent(identifier: any, emailHint?: string) {
  const numId = Number(identifier);
  const strId = String(identifier || '').trim();
  const email = emailHint ? String(emailHint).trim().toLowerCase() : '';

  let student = null;
  if (!isNaN(numId) && numId > 0) {
    student = await prisma.student.findUnique({ where: { id: numId } });
  }
  if (!student && strId) {
    student = await prisma.student.findFirst({
      where: {
        OR: [
          { externalId: strId },
          { email: strId.toLowerCase() },
          ...(email ? [{ email }] : []),
        ],
      },
    });
  }
  if (!student && email) {
    student = await prisma.student.findFirst({
      where: { email },
    });
  }
  return student;
}

// GET /api/drives/student/:studentId/notifications - Fetch simulated email alerts
router.get('/student/:studentId/notifications', async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await resolveStudent(req.params.studentId, (req as any).user?.email);
    if (!student) {
      res.json({ notifications: [] });
      return;
    }
    const notifModel = (prisma as any).studentNotification || (prisma as any).notification;
    const notifications = await notifModel.findMany({
      where: {
        OR: [
          { studentId: student.id },
          { studentEmail: student.email.toLowerCase() },
        ],
      },
      orderBy: { sentAt: 'desc' },
    });
    res.json({ notifications: notifications || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch notifications' });
  }
});

// GET /api/drives/student/:studentId/profile - Fetch student profile
router.get('/student/:studentId/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await resolveStudent(req.params.studentId, (req as any).user?.email);
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.json({ student });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch student profile' });
  }
});

// PUT /api/drives/student/:studentId/profile - Update mandatory student profile (Photo, Resume URL, Skills)
router.put('/student/:studentId/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await resolveStudent(req.params.studentId, (req as any).user?.email || req.body?.email);
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const { name, phone, branch, cgpa, skills, resumeUrl, profileImage, bio } = req.body;

    const updated = await prisma.student.update({
      where: { id: student.id },
      data: {
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(branch ? { branch } : {}),
        ...(cgpa !== undefined ? { cgpa: Number(cgpa) } : {}),
        ...(skills ? { skills: Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim()) } : {}),
        ...(resumeUrl ? { resumeUrl } : {}),
        ...(profileImage ? { profileImage } : {}),
        ...(bio ? { bio } : {}),
      },
    });

    res.json({
      success: true,
      message: 'Student profile updated successfully.',
      student: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update student profile' });
  }
});
