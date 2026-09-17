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
  async (req, res) => {
    try {
      const body = req.body || {};
      const user = String(body.user || '').trim();
      const pass = String(body.pass || '').trim();

      if (!user) {
        return res.status(400).json({ error: 'SMTP Username / Sender Email address is required.' });
      }
      if (!pass) {
        return res.status(400).json({ error: 'SMTP Password / Google App Password is required.' });
      }

      const host = body.host ? String(body.host).trim() : 'smtp.gmail.com';
      const port = body.port ? Number(body.port) : 465;
      const fromName = body.fromName ? String(body.fromName).trim() : 'Campus Placement Cell';
      const fromEmail = body.fromEmail && String(body.fromEmail).trim().includes('@')
        ? String(body.fromEmail).trim()
        : user;

      saveEmailConfig({
        host,
        port,
        user,
        pass: pass.replace(/\s+/g, ''),
        fromName,
        fromEmail,
      });

      return res.json({
        success: true,
        message: 'SMTP Email Configuration saved successfully!',
        status: getEmailConfigStatus(),
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Failed to save SMTP configuration.' });
    }
  }
);

router.post(
  '/test',
  requireAuth,
  requireRole('ADMIN', 'COORDINATOR'),
  async (req, res) => {
    try {
      const to = String(req.body?.to || '').trim();
      if (!to || !to.includes('@')) {
        return res.status(400).json({
          error: 'Please enter a valid recipient email address (e.g. name@domain.com) to test.',
        });
      }

      const status = getEmailConfigStatus();
      if (!status.configured) {
        return res.status(400).json({
          error: 'SMTP credentials have not been configured yet. Please enter your email and App Password above, then click "Save SMTP Credentials" first.',
        });
      }

      const result = await sendEmail({
        to,
        subject: '🧪 Campus Placement Portal - SMTP Email Delivery Test',
        text: 'Hello,\n\nThis is a verification test email from your Campus Placement & Screening Portal.\n\nYour SMTP credentials are configured and functioning properly. Candidate registration welcome emails and campus recruitment drive notifications will now be delivered directly to student inboxes.\n\nTimestamp: ' + new Date().toISOString(),
        html: '<div style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 500px; margin: 0 auto;"><h2 style="color: #38bdf8; margin-top: 0;">🧪 SMTP Delivery Verification</h2><p>Hello,</p><p>Your <strong>Campus Placement Portal</strong> email service is configured and operational!</p><div style="background: #1e293b; padding: 12px 16px; border-left: 4px solid #10b981; border-radius: 6px; margin: 16px 0;">✅ <strong>Status:</strong> Live SMTP Dispatched Successfully<br/>⏰ <strong>Verified At:</strong> ' + new Date().toLocaleString() + '</div><p style="font-size: 13px; color: #94a3b8;">When you register candidates, their login credentials and security notices will be sent directly to their verified email.</p></div>',
      });

      if (!result.success) {
        return res.status(400).json({
          error: `SMTP Dispatch failed: ${result.error || 'Authentication rejected'}. For Gmail, please make sure you generated a 16-character Google App Password in your Google Account Security settings (not your standard login password).`,
        });
      }

      return res.json({
        success: true,
        message: `Test email successfully dispatched to ${to}! Check your inbox.`,
        details: result,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Failed to dispatch test email.' });
    }
  }
);

export default router;
