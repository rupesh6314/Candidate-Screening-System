import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config.js';

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let transporter: Transporter | null = null;

// Initialize transporter if SMTP credentials are provided
const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || '';
const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
const smtpPass = rawPass ? rawPass.replace(/\s+/g, '') : '';

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
} else if (smtpUser && smtpPass) {
  // Gmail service shortcut
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams): Promise<{ success: boolean; messageId?: string }> {
  try {
    if (transporter) {
      const fromAddress = process.env.SMTP_FROM || `"Campus Placement Cell" <${smtpUser || 'placements@campus.edu'}>`;
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        text,
        html: html || `<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">${text.replace(/\n/g, '<br/>')}</div>`,
      });
      console.log(`📧 Outgoing Email Sent to ${to}: ${subject} (MessageID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`📬 [Email Dispatch Simulator] To: ${to} | Subject: "${subject}"`);
      return { success: true, messageId: `simulated-${Date.now()}` };
    }
  } catch (error: any) {
    console.error(`⚠️ Failed to send SMTP email to ${to}:`, error.message);
    return { success: false };
  }
}

export function getWelcomeEmailHtml(name: string, email: string, tempPassword: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; }
      .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; max-width: 580px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
      .header { background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 30px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
      .body { padding: 30px; color: #cbd5e1; font-size: 15px; line-height: 1.6; }
      .credentials-box { background-color: #0f172a; border-left: 4px solid #06b6d4; padding: 15px 20px; border-radius: 6px; margin: 20px 0; }
      .warning-box { background-color: #451a03; border: 1px solid #b45309; color: #fde68a; padding: 15px 20px; border-radius: 6px; margin: 20px 0; }
      .btn { display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin-top: 15px; }
      .footer { background-color: #0f172a; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <h1>🎓 Campus Placement Portal</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Welcome to Placement Season 2026</p>
      </div>
      <div class="body">
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your official student candidate profile has been registered by the Placement Coordinator. You now have access to active recruitment drives, JD evaluation, and application shortlists.</p>
        
        <div class="credentials-box">
          <p style="margin: 0 0 8px 0; color: #94a3b8;">Your Login Credentials:</p>
          <p style="margin: 0 0 4px 0;"><strong>Registered Email:</strong> <span style="color: #38bdf8;">${email}</span></p>
          <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #1e293b; padding: 3px 8px; border-radius: 4px; color: #f43f5e; font-size: 16px;">${tempPassword}</code></p>
        </div>

        <div class="warning-box">
          <strong>⚠️ MANDATORY SAFETY NOTICE:</strong><br/>
          When you log in for the first time, you <strong>must change your password immediately</strong> in your profile settings for account security and safety.
        </div>

        <p style="text-align: center;">
          <a href="${process.env.FRONTEND_ORIGIN || 'https://candidate-screening-system.vercel.app'}" class="btn">Log In to My Placement Portal →</a>
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

export function getDriveAlertEmailHtml(
  name: string,
  companyName: string,
  role: string,
  ctc: string,
  deadline: string,
  minCgpa: number
): string {
  const formattedDate = new Date(deadline).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

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
      .btn { display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin-top: 15px; }
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
          <p style="margin: 0;"><strong>⏰ Application Deadline:</strong> <span style="color: #f87171; font-weight: 600;">${formattedDate}</span></p>
        </div>

        <p>Please log in to your Student Placement Portal and submit your <strong>Opt-In</strong> response before the deadline expires.</p>

        <p style="text-align: center;">
          <a href="${process.env.FRONTEND_ORIGIN || 'https://candidate-screening-system.vercel.app'}" class="btn">View Drive & Opt-In Now →</a>
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
