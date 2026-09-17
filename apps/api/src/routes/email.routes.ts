import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  getEmailConfigStatus,
  saveEmailConfig,
  sendEmail,
} from '../services/email.service.js';

const router = Router();

router.get('/status', requireAuth, (_req, res) => {
  const status = getEmailConfigStatus();
  res.json(status);
});

router.post(
  '/config',
  requireAuth,
  requireRole('ADMIN', 'COORDINATOR'),
  async (req, res, next) => {
    try {
      const schema = z.object({
        host: z.string().optional(),
        port: z.coerce.number().optional(),
        user: z.string().min(1, 'Email address is required'),
        pass: z.string().min(1, 'Password / App Password is required'),
        fromName: z.string().optional(),
        fromEmail: z.string().email().optional(),
      });

      const parsed = schema.parse(req.body);
      saveEmailConfig(parsed);

      res.json({
        success: true,
        message: 'SMTP Email Configuration saved successfully!',
        status: getEmailConfigStatus(),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/test',
  requireAuth,
  requireRole('ADMIN', 'COORDINATOR'),
  async (req, res, next) => {
    try {
      const schema = z.object({
        to: z.string().email('Valid recipient email address is required'),
      });

      const { to } = schema.parse(req.body);

      const result = await sendEmail({
        to,
        subject: '🧪 Campus Placement Portal - SMTP Email Delivery Test',
        text: 'Hello,\n\nThis is a verification test email from your Campus Placement & Screening Portal.\n\nYour SMTP credentials are configured and functioning properly. Candidate registration welcome emails and campus recruitment drive notifications will now be delivered directly to student inboxes.\n\nTimestamp: ' + new Date().toISOString(),
        html: '<div style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 500px; margin: 0 auto;"><h2 style="color: #38bdf8; margin-top: 0;">🧪 SMTP Delivery Verification</h2><p>Hello,</p><p>Your <strong>Campus Placement Portal</strong> email service is configured and operational!</p><div style="background: #1e293b; padding: 12px 16px; border-left: 4px solid #10b981; border-radius: 6px; margin: 16px 0;">✅ <strong>Status:</strong> Live SMTP Dispatched Successfully<br/>⏰ <strong>Verified At:</strong> ' + new Date().toLocaleString() + '</div><p style="font-size: 13px; color: #94a3b8;">When you register candidates, their login credentials and security notices will be sent directly to their verified email.</p></div>',
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'SMTP test failed. Please verify your email, SMTP host, and App Password (for Gmail, generate a 16-character Google App Password in Security settings).',
        });
      }

      res.json({
        success: true,
        message: 'Test email successfully dispatched to ' + to + '! Check your inbox.',
        details: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
