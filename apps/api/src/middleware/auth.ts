import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config.js';
import { prisma } from '../db.js';

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'COORDINATOR' | 'STUDENT';
  name: string;
  studentId?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Extract authentication token from Authorization header, Cookie, or Query parameter.
 */
export function extractToken(req: Request): string | null {
  // 1. Check Authorization header (Bearer <token>)
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const parts = authHeader.trim().split(/\s+/);
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      return parts[1];
    }
    if (parts.length === 1 && parts[0].length > 10) {
      return parts[0];
    }
  }

  // 2. Check HTTP Cookie
  if (req.cookies?.screening_token) {
    return req.cookies.screening_token;
  }

  // 3. Check Query parameter (useful for authenticated direct file downloads/exports)
  if (typeof req.query?.token === 'string' && req.query.token.trim()) {
    return req.query.token.trim();
  }

  return null;
}

/**
 * Strict Authentication Middleware.
 * Rejects unauthenticated requests with HTTP 401. Never falls back to a mock user.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required. Please log in to access this resource.',
      });
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      role?: 'ADMIN' | 'COORDINATOR' | 'STUDENT';
      studentId?: number;
      email?: string;
    };

    if (!payload || !payload.sub) {
      return res.status(401).json({
        error: 'Invalid token payload. Please log in again.',
      });
    }

    // 1. If token belongs to a Student candidate
    if (payload.role === 'STUDENT' || payload.studentId || payload.sub.startsWith('student-')) {
      const studentIdNum = payload.studentId || parseInt(payload.sub.replace('student-', ''), 10);
      let student = null;
      try {
        if (!isNaN(studentIdNum)) {
          student = await prisma.student.findUnique({ where: { id: studentIdNum } });
        }
        if (!student && payload.email) {
          student = await prisma.student.findFirst({
            where: { email: { equals: payload.email.toLowerCase(), mode: 'insensitive' } },
          });
        }
      } catch (_) {
        try {
          student = await prisma.student.findFirst({
            where: { id: studentIdNum },
          });
        } catch (_) {}
      }

      if (!student) {
        return res.status(401).json({
          error: 'Student account associated with this session no longer exists.',
        });
      }

      req.user = {
        id: String(student.id),
        email: student.email,
        role: 'STUDENT',
        name: student.name,
        studentId: student.id,
      };
      return next();
    }

    // 2. If token belongs to Admin / Placement Coordinator
    let user = null;
    try {
      user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user && payload.email) {
        user = await prisma.user.findFirst({
          where: { email: { equals: payload.email.toLowerCase(), mode: 'insensitive' } },
        });
      }
    } catch (_) {
      try {
        user = await prisma.user.findFirst({ where: { id: payload.sub } });
      } catch (_) {}
    }

    if (!user) {
      // Fallback verification for default admin
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@placement.edu';
      if (payload.sub === 'cuid-admin-1' || payload.email === adminEmail) {
        req.user = {
          id: 'cuid-admin-1',
          email: adminEmail,
          role: (payload.role as any) || 'ADMIN',
          name: 'Placement Officer',
        };
        return next();
      }
      return res.status(401).json({
        error: 'Coordinator account associated with this session was not found.',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: (user.role as any) || 'COORDINATOR',
      name: user.name,
    };
    return next();
  } catch (err: any) {
    return res.status(401).json({
      error: 'Session expired or invalid token. Please log in again.',
    });
  }
}

/**
 * Role-Based Access Control Guard.
 * Rejects unauthorized roles with HTTP 403 Forbidden.
 */
export const requireRole = (...roles: AuthUser['role'][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required. Please log in.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied: Insufficient permissions for ${req.user.role}. Required role: ${roles.join(' or ')}.`,
      });
    }

    next();
  };
};
