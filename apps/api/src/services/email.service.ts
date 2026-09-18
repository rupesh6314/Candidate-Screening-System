import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config.js';

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDbEmailConfig, saveDbEmailConfig } from '../db.js';

export interface SmtpConfig {
  host?: string;
  port?: number;
  user: string;
  pass: string;
  fromName?: string;
  fromEmail?: string;
}

const EMAIL_CONFIG_FILE = path.join(os.tmpdir(), 'screening_smtp_config_v2.json');
let runtimeConfig: SmtpConfig | null = null;

export function loadEmailConfig(): SmtpConfig | null {
  if (runtimeConfig) return runtimeConfig;
  try {
    const dbConfig = getDbEmailConfig();
    if (dbConfig && dbConfig.user && dbConfig.pass) {
      runtimeConfig = dbConfig;
      return runtimeConfig;
    }
  } catch (_) {}

  try {
    if (fs.existsSync(EMAIL_CONFIG_FILE)) {
      runtimeConfig = JSON.parse(fs.readFileSync(EMAIL_CONFIG_FILE, 'utf8'));
      return runtimeConfig;
    }
  } catch (_) {}
  return null;
}

export function saveEmailConfig(config: SmtpConfig): void {
  runtimeConfig = config;
  try {
    saveDbEmailConfig(config);
  } catch (_) {}
  try {
    fs.writeFileSync(EMAIL_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (_) {}
}

export function getTransporter(): Transporter | null {
  const custom = loadEmailConfig();
  const smtpHost = custom?.host || process.env.SMTP_HOST || process.env.SMTP_SERVER || '';
  const smtpPort = custom?.port || parseInt(process.env.SMTP_PORT || '465', 10);
  const smtpUser = custom?.user || process.env.SMTP_USER || process.env.GMAIL_USER || process.env.EMAIL_USER || '';
  const rawPass = custom?.pass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || '';
  const smtpPass = rawPass ? rawPass.replace(/\s+/g, '') : '';

  if (!smtpUser || !smtpPass) return null;

  const isGmail =
    smtpHost.toLowerCase().includes('gmail') ||
    smtpUser.toLowerCase().endsWith('@gmail.com') ||
    (!smtpHost && smtpUser.includes('@'));

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
  }

  const isOutlook =
    smtpHost.toLowerCase().includes('office365') ||
    smtpHost.toLowerCase().includes('outlook') ||
    smtpUser.toLowerCase().endsWith('@outlook.com') ||
    smtpUser.toLowerCase().endsWith('@hotmail.com');

  if (isOutlook) {
    return nodemailer.createTransport({
      service: 'outlook',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3',
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
  }

  return nodemailer.createTransport({
    host: smtpHost || 'smtp.gmail.com',
    port: smtpPort || 465,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });
}

export function getEmailConfigStatus(): { configured: boolean; user?: string; host?: string; mode: 'REAL_SMTP' | 'IN_APP_SIMULATOR' } {
  const custom = loadEmailConfig();
  const user = custom?.user || process.env.SMTP_USER || process.env.GMAIL_USER || process.env.EMAIL_USER;
  const pass = custom?.pass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
  const host = custom?.host || process.env.SMTP_HOST || 'smtp.gmail.com';

  if (user && pass) {
    return {
      configured: true,
      user: user.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      host,
      mode: 'REAL_SMTP',
    };
  }
  return {
    configured: false,
    mode: 'IN_APP_SIMULATOR',
  };
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams): Promise<{ success: boolean; messageId?: string; simulated?: boolean; error?: string }> {
  const custom = loadEmailConfig();
  const smtpUser = custom?.user || process.env.SMTP_USER || process.env.GMAIL_USER || process.env.EMAIL_USER || '';
  const fromName = custom?.fromName || 'Campus Placement Cell';
  const fromEmail = custom?.fromEmail || smtpUser || 'placements@campus.edu';
  const resendKey = process.env.RESEND_API_KEY || '';

  // 1. Check if Resend Cloud Email API is available (works 100% on Vercel without SMTP port blocking)
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${fromName} <onboarding@resend.dev>`,
          to: [to],
          subject,
          text,
          html: html || `<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">${text.replace(/\n/g, '<br/>')}</div>`,
        }),
      });

      const resData = (await res.json()) as any;
      if (res.ok && resData?.id) {
        console.log(`📧 [RESEND API] Live Email Dispatched to ${to}: "${subject}" (ID: ${resData.id})`);
        return { success: true, messageId: resData.id, simulated: false };
      } else {
        console.warn(`⚠️ Resend API returned error:`, resData);
      }
    } catch (resendErr: any) {
      console.warn(`⚠️ Resend API request failed:`, resendErr?.message || resendErr);
    }
  }

  // 2. Check if SMTP Transporter is configured
  const transporter = getTransporter();
  if (transporter) {
    try {
      const fromAddress = `"${fromName}" <${fromEmail}>`;
      const sendPromise = transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        text,
        html: html || `<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">${text.replace(/\n/g, '<br/>')}</div>`,
      });

      const timeoutPromise = new Promise<{ messageId: string }>((_, reject) =>
        setTimeout(() => reject(new Error('SMTP connection timed out after 8000ms')), 8000)
      );

      const info = (await Promise.race([sendPromise, timeoutPromise])) as any;
      console.log(`📧 [LIVE SMTP] Outgoing Email Dispatched to ${to}: "${subject}" (MessageID: ${info.messageId})`);
      return { success: true, messageId: info.messageId, simulated: false };
    } catch (error: any) {
      console.warn(`⚠️ SMTP delivery to ${to} failed (${error.message}). Message recorded in student in-app inbox.`);
      return { success: false, messageId: `fallback-${Date.now()}`, simulated: true, error: error.message };
    }
  }

  console.log(`📬 [In-App Notification Dispatcher] To: ${to} | Subject: "${subject}" (No SMTP or Resend credentials provided in environment)`);
  return { success: false, messageId: `simulated-${Date.now()}`, simulated: true, error: 'No live email credentials (SMTP or RESEND_API_KEY) configured in environment.' };
}

export function getWelcomeEmailHtml(name: string, email: string, tempPassword: string): string {
  const portalUrl = 'https://candidate-screening-system-api.vercel.app/';
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campus Placement Portal - Account Credentials</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <!-- Header -->
    <tr>
      <td style="background-color: #1e3a8a; padding: 28px 32px; text-align: left; border-bottom: 3px solid #2563eb;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #bfdbfe; margin-bottom: 6px;">
          Office of Career Services & Placements
        </div>
        <div style="font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.3;">
          Student Portal Access Credentials
        </div>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 32px; font-size: 15px; line-height: 1.6; color: #334155;">
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #0f172a;">
          Dear <strong>${name}</strong>,
        </p>
        <p style="margin: 0 0 20px 0; color: #475569;">
          Your candidate profile has been registered on the official Campus Placement & Recruitment Portal. You may now log in to view active corporate recruitment drives, verify your eligibility, and submit applications.
        </p>

        <!-- Credentials Table -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin: 20px 0;">
          <tr>
            <td colspan="2" style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">
              Login Credentials
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 600; color: #475569; width: 40%; border-bottom: 1px solid #e2e8f0;">
              Registered Email:
            </td>
            <td style="padding: 12px 16px; color: #0f172a; font-weight: 500; border-bottom: 1px solid #e2e8f0;">
              ${email}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 600; color: #475569;">
              Temporary Password:
            </td>
            <td style="padding: 12px 16px;">
              <code style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 4px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 15px; font-weight: 700; color: #1e40af;">${tempPassword}</code>
            </td>
          </tr>
        </table>

        <!-- Security Notice -->
        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 4px; margin: 22px 0; font-size: 14px; color: #92400e; line-height: 1.5;">
          <strong>Security Notice:</strong> For account safety, you will be required to change this temporary password upon your initial login in your Student Profile Settings.
        </div>

        <!-- Button -->
        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${portalUrl}" style="display: inline-block; background-color: #1d4ed8; color: #ffffff !important; text-decoration: none; padding: 13px 32px; border-radius: 6px; font-size: 15px; font-weight: 600; text-align: center; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            Access Placement Portal &rarr;
          </a>
        </div>

        <p style="margin: 16px 0 0 0; font-size: 12px; color: #64748b; text-align: center; word-break: break-all;">
          If the button above does not open, navigate directly to: <br/>
          <a href="${portalUrl}" style="color: #2563eb; text-decoration: underline;">${portalUrl}</a>
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
        <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569;">
          Campus Placement & Corporate Relations Cell
        </p>
        <p style="margin: 0;">
          This is an official automated communication. Please do not reply directly to this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function formatDeadlineDisplay(deadline: string | Date): string {
  try {
    const d = typeof deadline === 'string' ? new Date(deadline) : deadline;
    if (isNaN(d.getTime())) return String(deadline);
    return (
      d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' (IST)'
    );
  } catch (_) {
    return String(deadline);
  }
}

export function getDriveAlertEmailHtml(
  name: string,
  companyName: string,
  role: string,
  ctc: string,
  deadline: string | Date,
  minCgpa: number
): string {
  const portalUrl = 'https://candidate-screening-system-api.vercel.app/';
  const formattedDeadline = formatDeadlineDisplay(deadline);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campus Recruitment Drive Announcement - ${companyName}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <!-- Header Banner -->
    <tr>
      <td style="background-color: #0f172a; padding: 28px 32px; text-align: left; border-bottom: 3px solid #0284c7;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #38bdf8; margin-bottom: 6px;">
          Office of Career Services & Placements
        </div>
        <div style="font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.3;">
          Campus Recruitment Drive Announcement
        </div>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 32px; font-size: 15px; line-height: 1.6; color: #334155;">
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #0f172a;">
          Dear <strong>${name}</strong>,
        </p>
        <p style="margin: 0 0 20px 0; color: #475569;">
          <strong>${companyName}</strong> has announced its upcoming campus recruitment drive. Based on your current academic record and branch criteria, you meet all eligibility requirements to participate.
        </p>

        <!-- Drive Details Table -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin: 22px 0;">
          <tr>
            <td colspan="2" style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; background-color: #f1f5f9;">
              Drive Specifications & Criteria
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 600; color: #475569; width: 42%; border-bottom: 1px solid #e2e8f0;">
              Company:
            </td>
            <td style="padding: 12px 16px; color: #0f172a; font-weight: 700; font-size: 16px; border-bottom: 1px solid #e2e8f0;">
              ${companyName}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">
              Position / Role:
            </td>
            <td style="padding: 12px 16px; color: #1e293b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">
              ${role}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">
              Compensation (CTC):
            </td>
            <td style="padding: 12px 16px; color: #047857; font-weight: 700; border-bottom: 1px solid #e2e8f0;">
              ${ctc}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">
              Academic Eligibility:
            </td>
            <td style="padding: 12px 16px; color: #334155; border-bottom: 1px solid #e2e8f0;">
              Minimum ${minCgpa.toFixed(2)} CGPA
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 600; color: #475569;">
              Application Deadline:
            </td>
            <td style="padding: 12px 16px;">
              <span style="display: inline-block; background-color: #fee2e2; border: 1px solid #fecaca; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 14px;">
                ${formattedDeadline}
              </span>
            </td>
          </tr>
        </table>

        <!-- Action Notice -->
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 4px; margin: 22px 0; font-size: 14px; color: #1e40af; line-height: 1.5;">
          <strong>Action Required:</strong> Please log in to your Student Placement Portal and record your <strong>Opt-In</strong> response before the registration window closes.
        </div>

        <!-- Button -->
        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${portalUrl}" style="display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 13px 32px; border-radius: 6px; font-size: 15px; font-weight: 600; text-align: center; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            View Drive & Submit Opt-In &rarr;
          </a>
        </div>

        <p style="margin: 16px 0 0 0; font-size: 12px; color: #64748b; text-align: center; word-break: break-all;">
          If the button above does not open, navigate directly to: <br/>
          <a href="${portalUrl}" style="color: #0284c7; text-decoration: underline;">${portalUrl}</a>
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
        <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569;">
          Campus Placement & Corporate Relations Cell
        </p>
        <p style="margin: 0;">
          This is an official automated communication. Please do not reply directly to this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
