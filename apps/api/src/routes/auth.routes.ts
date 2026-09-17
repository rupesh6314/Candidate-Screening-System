import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db.js';
import { env } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
import { audit } from '../services/audit.service.js';

const router = Router();
const loginSchema = z.object({
  email: z.string().min(1, 'Email address or Roll ID is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['ADMIN', 'COORDINATOR', 'STUDENT']).optional(),
});

// POST /api/auth/login - Authenticate Admin or Student strictly against database encrypted password hashes
router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const inputIdentifier = (body.email || '').trim();
    const emailLower = inputIdentifier.toLowerCase();
    const phoneDigits = inputIdentifier.replace(/\D/g, '');

    // 1. Check if it's an Admin/Coordinator user
    let adminUser = null;
    try {
      adminUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: emailLower, mode: 'insensitive' } },
            { email: { equals: inputIdentifier, mode: 'insensitive' } },
          ],
        },
      });
    } catch (_) {
      try {
        adminUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: emailLower },
              { email: inputIdentifier },
            ],
          },
        });
      } catch (err) {
        console.warn('Error querying admin user:', err);
      }
    }

    if (adminUser && adminUser.passwordHash) {
      let isMatch = await bcrypt.compare(body.password, adminUser.passwordHash);
      if (!isMatch && body.password.trim() !== body.password) {
        isMatch = await bcrypt.compare(body.password.trim(), adminUser.passwordHash);
      }

      if (isMatch) {
        const token = jwt.sign({ sub: adminUser.id, role: adminUser.role }, env.JWT_SECRET, {
          expiresIn: '8h',
        });

        res.cookie('screening_token', token, {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 8 * 60 * 60 * 1000,
        });

        await audit(adminUser.id, 'LOGIN', 'AUTH');

        return res.json({
          user: {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
          },
        });
      }
    }

    // 2. Check if it's a Student Candidate
    let student = null;
    try {
      student = await prisma.student.findFirst({
        where: {
          OR: [
            { email: { equals: emailLower, mode: 'insensitive' } },
            { email: { equals: inputIdentifier, mode: 'insensitive' } },
            { externalId: { equals: inputIdentifier, mode: 'insensitive' } },
            ...(phoneDigits && phoneDigits.length >= 7 ? [{ phone: phoneDigits }] : []),
          ],
        },
      });
    } catch (_) {
      try {
        student = await prisma.student.findFirst({
          where: {
            OR: [
              { email: emailLower },
              { email: inputIdentifier },
              { externalId: inputIdentifier },
              ...(phoneDigits && phoneDigits.length >= 7 ? [{ phone: phoneDigits }] : []),
            ],
          },
        });
      } catch (err) {
        console.warn('Error querying student user:', err);
      }
    }

    if (student && student.passwordHash) {
      let isMatch = await bcrypt.compare(body.password, student.passwordHash);
      if (!isMatch && body.password.trim() !== body.password) {
        isMatch = await bcrypt.compare(body.password.trim(), student.passwordHash);
      }

      if (isMatch) {
        const token = jwt.sign(
          { sub: `student-${student.id}`, role: 'STUDENT', studentId: student.id },
          env.JWT_SECRET,
          { expiresIn: '8h' }
        );

        res.cookie('screening_token', token, {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 8 * 60 * 60 * 1000,
        });

        return res.json({
          user: {
            id: String(student.id),
            email: student.email,
            name: student.name,
            role: 'STUDENT',
            studentId: student.id,
            branch: student.branch,
            cgpa: student.cgpa,
            mustChangePassword: Boolean(student.mustChangePassword),
          },
          student: {
            ...student,
            mustChangePassword: Boolean(student.mustChangePassword),
          },
        });
      }
    }

    return res.status(401).json({
      error: 'Invalid credentials. Please verify your registered email and password.',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/change-password - Secure password change for students
router.post('/change-password', async (req, res, next) => {
  try {
    const schema = z.object({
      studentId: z.coerce.number().optional(),
      email: z.string().email().optional(),
      oldPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    });
    const { studentId, email, oldPassword, newPassword } = schema.parse(req.body);

    const student = await prisma.student.findFirst({
      where: {
        OR: [
          ...(studentId ? [{ id: studentId }, { externalId: String(studentId) }] : []),
          ...(email ? [{ email: email.toLowerCase().trim() }] : []),
          ...((req as any).user?.email ? [{ email: (req as any).user.email.toLowerCase().trim() }] : []),
        ],
      },
    });

    if (!student || !student.passwordHash) {
      return res.status(404).json({ error: 'Student account not found.' });
    }

    let isOldMatch = await bcrypt.compare(oldPassword, student.passwordHash);
    if (!isOldMatch && oldPassword.trim() !== oldPassword) {
      isOldMatch = await bcrypt.compare(oldPassword.trim(), student.passwordHash);
    }
    if (!isOldMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword.trim(), 10);
    await prisma.student.update({
      where: { id: student.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    // Post security confirmation notification to student inbox
    try {
      await prisma.studentNotification.create({
        data: {
          studentId: student.id,
          studentEmail: student.email,
          subject: 'Security Alert: Password Changed Successfully',
          message: `Hello ${student.name},\n\nYour account password was updated successfully on ${new Date().toLocaleString()}.\n\nIf you did not make this change, please report to your Placement Coordinator immediately.`,
        },
      });
    } catch (notifErr: any) {
      console.warn('Could not record change-password notification:', notifErr?.message);
    }

    await audit(String(student.id), 'PASSWORD_CHANGE', 'STUDENT');

    return res.json({
      success: true,
      message: 'Password changed successfully! You can now use your new password.',
      mustChangePassword: false,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('screening_token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
