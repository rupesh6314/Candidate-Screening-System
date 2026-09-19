import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  getEmailConfigStatus,
  saveEmailConfig,
  sendEmail,
} from '../services/email.service.js';

const router = Router();

router.get('/status', requireAuth, requireRole('ADMIN', 'COORDINATOR'), (_req, res) => {
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
        subject: 'Campus Placement Portal - Email Delivery Verification',
        text: 'Hello,\n\nThis is a verification test email from your Campus Placement & Screening Portal.\n\nYour SMTP credentials are configured and functioning properly. Candidate registration welcome emails and campus recruitment drive notifications will now be delivered directly to student inboxes.\n\nPortal Link: https://candidate-screening-system-api.vercel.app/\nTimestamp: ' + new Date().toISOString(),
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SMTP Delivery Verification</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <tr>
      <td style="background-color: #1e3a8a; padding: 24px 28px; text-align: left; border-bottom: 3px solid #2563eb;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #bfdbfe; margin-bottom: 4px;">
          System Configuration Test
        </div>
        <div style="font-size: 18px; font-weight: 700; color: #ffffff;">
          SMTP Email Delivery Verification
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px; font-size: 14px; line-height: 1.6; color: #334155;">
        <p style="margin: 0 0 14px 0; font-size: 15px; color: #0f172a;">
          Hello Administrator,
        </p>
        <p style="margin: 0 0 18px 0; color: #475569;">
          Your <strong>Campus Placement Portal</strong> email service is configured correctly and verified operational.
        </p>
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; margin: 18px 0;">
          <tr>
            <td style="padding: 14px 18px; color: #166534; font-size: 14px;">
              <strong>Delivery Status:</strong> SMTP Dispatched Successfully<br/>
              <strong>Verified At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)
            </td>
          </tr>
        </table>
        <div style="text-align: center; margin: 24px 0 12px 0;">
          <a href="https://candidate-screening-system-api.vercel.app/" style="display: inline-block; background-color: #1d4ed8; color: #ffffff !important; text-decoration: none; padding: 11px 26px; border-radius: 6px; font-size: 14px; font-weight: 600;">
            Open Placement Portal &rarr;
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f8fafc; padding: 16px 28px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
        Campus Placement & Corporate Relations Cell • Automated Dispatch System
      </td>
    </tr>
  </table>
</body>
</html>
        `,
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
