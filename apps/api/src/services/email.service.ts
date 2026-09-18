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
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; }
      .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; max-width: 580px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
      .header { background: linear-gradient(135deg, #2563eb, #0284c7); padding: 30px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
      .body { padding: 30px; color: #cbd5e1; font-size: 15px; line-height: 1.6; }
      .credentials-box { background-color: #0f172a; border-left: 4px solid #38bdf8; padding: 16px 20px; border-radius: 6px; margin: 20px 0; }
      .warning-box { background-color: #451a03; border: 1px solid #b45309; color: #fde68a; padding: 15px 20px; border-radius: 6px; margin: 20px 0; font-size: 13px; }
      .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 34px; border-radius: 8px; font-weight: 700; font-size: 16px; }
      .footer { background-color: #0f172a; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <h1>🎓 Campus Placement Portal</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Official Student Registration Notice</p>
      </div>
      <div class="body">
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your official student candidate profile has been registered by the Placement Coordinator. You now have access to active recruitment drives, eligibility evaluation, and application tracking.</p>
        
        <div class="credentials-box">
          <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px;">YOUR LOGIN CREDENTIALS:</p>
          <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Registered Email:</strong> <span style="color: #38bdf8;">${email}</span></p>
          <p style="margin: 0; font-size: 15px;"><strong>Temporary Password:</strong> <code style="background: #1e293b; padding: 4px 10px; border-radius: 4px; color: #38bdf8; font-size: 16px; font-weight: 700;">${tempPassword}</code></p>
        </div>

        <div class="warning-box">
          <strong>⚠️ MANDATORY SAFETY NOTICE:</strong><br/>
          When you log in for the first time, you must change your temporary password in your student profile settings for account security and safety.
        </div>

        <p style="text-align: center; margin: 30px 0 10px 0;">
          <a href="${portalUrl}" class="btn">Log In to Placement Portal</a>
        </p>
      </div>
      <div class="footer">
        © 2026 Campus Placement Cell & Corporate Relations Office. All rights reserved.
      </div>
    </div>
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
  const formattedDate = formatDeadlineDisplay(deadline);

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; }
      .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; max-width: 580px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
      .header { background: linear-gradient(135deg, #059669, #0284c7); padding: 30px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
      .body { padding: 30px; color: #cbd5e1; font-size: 15px; line-height: 1.6; }
      .drive-box { background-color: #0f172a; border-left: 4px solid #10b981; padding: 18px 20px; border-radius: 6px; margin: 20px 0; }
      .btn { display: inline-block; background: #059669; color: white !important; text-decoration: none; padding: 14px 34px; border-radius: 8px; font-weight: 700; font-size: 16px; }
      .footer { background-color: #0f172a; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <h1>🚀 New Campus Placement Drive Alert</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">You are eligible to apply!</p>
      </div>
      <div class="body">
        <p>Hello <strong>${name}</strong>,</p>
        <p><strong>${companyName}</strong> has announced a recruitment drive on campus and your academic standing meets all eligibility requirements!</p>
        
        <div class="drive-box">
          <p style="margin: 0 0 6px 0;"><strong>🏢 Company:</strong> <span style="color: #38bdf8; font-size: 16px;">${companyName}</span></p>
          <p style="margin: 0 0 6px 0;"><strong>💼 Job Role:</strong> ${role}</p>
          <p style="margin: 0 0 6px 0;"><strong>💰 Package (CTC):</strong> <span style="color: #4ade80;">${ctc}</span></p>
          <p style="margin: 0 0 6px 0;"><strong>🎓 Eligibility Cutoff:</strong> ${minCgpa.toFixed(2)} CGPA</p>
          <p style="margin: 0;"><strong>⏰ Application Deadline:</strong> <span style="color: #f87171; font-weight: 700; font-size: 15px;">${formattedDate}</span></p>
        </div>

        <p>Please log in to your Student Placement Portal and submit your <strong>Opt-In</strong> response before the deadline expires.</p>

        <p style="text-align: center; margin: 30px 0 10px 0;">
          <a href="${portalUrl}" class="btn">Log In to Placement Portal</a>
        </p>
      </div>
      <div class="footer">
        © 2026 Campus Placement Cell & Corporate Relations Office. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}
