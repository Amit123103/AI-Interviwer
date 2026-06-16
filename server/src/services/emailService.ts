import nodemailer from 'nodemailer';

// ═══════════════════════════════════════════════════════════════════
// EMAIL SERVICE — Robust SMTP Configuration
// ═══════════════════════════════════════════════════════════════════
//
// ENV variables required:
//   SMTP_HOST   — e.g. smtp.gmail.com
//   SMTP_PORT   — 465 (SSL) or 587 (TLS/STARTTLS)
//   SMTP_SECURE — "true" for port 465, "false" for port 587
//   SMTP_USER   — your email (e.g. yourname@gmail.com)
//   SMTP_PASS   — App Password (NOT your Gmail password)
//   SMTP_FROM   — optional, defaults to SMTP_USER
//   CLIENT_URL  — e.g. http://localhost:3000 or https://yourdomain.com
//
// For Gmail:
//   1. Enable 2-Step Verification on your Google Account
//   2. Go to https://myaccount.google.com/apppasswords
//   3. Generate an App Password for "Mail"
//   4. Use that 16-char password as SMTP_PASS
// ═══════════════════════════════════════════════════════════════════

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true'; // true for 465, false for 587
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

// ── Check for missing config at load time ──
const smtpConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

if (!smtpConfigured) {
    console.log('[EMAIL] ℹ️  SMTP not configured — email features disabled (set SMTP_HOST, SMTP_USER, SMTP_PASS to enable)');
}

// ── Create transporter (only real if configured) ──
const transporter = smtpConfigured
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
        // Connection tuning
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        // TLS options — allow self-signed in dev
        tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production',
        },
    })
    : null;

// ── Verify SMTP connection at startup ──
export const verifyEmailTransporter = async (): Promise<boolean> => {
    if (!transporter) {
        console.log('[EMAIL] ❌ Transporter not created — SMTP not configured');
        return false;
    }

    try {
        await transporter.verify();
        console.log('[EMAIL] ✅ SMTP connection verified successfully');
        console.log(`[EMAIL]    Host: ${SMTP_HOST}:${SMTP_PORT} (secure: ${SMTP_SECURE})`);
        console.log(`[EMAIL]    From: ${SMTP_FROM}`);
        return true;
    } catch (error: any) {
        console.error('[EMAIL] ❌ SMTP verification FAILED:');
        console.error(`[EMAIL]    Error: ${error.message}`);

        if (error.code === 'EAUTH') {
            console.error('[EMAIL]    → Authentication failed. Check SMTP_USER and SMTP_PASS.');
            console.error('[EMAIL]    → For Gmail, use an App Password (not your regular password).');
        } else if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
            console.error(`[EMAIL]    → Cannot connect to ${SMTP_HOST}:${SMTP_PORT}.`);
            console.error('[EMAIL]    → Check host/port and ensure outbound SMTP is not blocked.');
            console.error('[EMAIL]    → Try switching SMTP_PORT to 587 with SMTP_SECURE=false.');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('[EMAIL]    → Connection refused. Is the SMTP server reachable?');
        }

        return false;
    }
};

// ── Internal send helper with full logging ──
const sendEmail = async (
    to: string,
    subject: string,
    html: string,
    context: string
): Promise<boolean> => {
    if (!to) {
        console.warn(`[EMAIL] ${context}: No recipient email provided — skipping`);
        return false;
    }

    if (!transporter) {
        console.error(`[EMAIL] ${context}: Cannot send — SMTP not configured`);
        console.error('[EMAIL]   Set SMTP_HOST, SMTP_USER, SMTP_PASS in your .env file');
        return false;
    }

    try {
        console.log(`[EMAIL] ${context}: Sending to ${to}...`);

        const info = await transporter.sendMail({
            from: `"Intervyxa AI" <${SMTP_FROM}>`,
            to,
            subject,
            html,
        });

        console.log(`[EMAIL] ${context}: ✅ Sent successfully`);
        console.log(`[EMAIL]   MessageId: ${info.messageId}`);
        console.log(`[EMAIL]   Response: ${info.response}`);
        console.log(`[EMAIL]   Accepted: ${JSON.stringify(info.accepted)}`);

        if (info.rejected && info.rejected.length > 0) {
            console.warn(`[EMAIL]   ⚠️ Rejected: ${JSON.stringify(info.rejected)}`);
        }

        return true;
    } catch (error: any) {
        console.error(`[EMAIL] ${context}: ❌ FAILED to send`);
        console.error(`[EMAIL]   To: ${to}`);
        console.error(`[EMAIL]   Error: ${error.message}`);
        console.error(`[EMAIL]   Code: ${error.code || 'N/A'}`);

        if (error.responseCode) {
            console.error(`[EMAIL]   SMTP Response Code: ${error.responseCode}`);
        }

        if (error.code === 'EENVELOPE') {
            console.error('[EMAIL]   → Invalid sender/recipient address');
        } else if (error.code === 'EAUTH') {
            console.error('[EMAIL]   → SMTP authentication failed mid-session');
        } else if (error.code === 'EMESSAGE') {
            console.error('[EMAIL]   → Message was rejected (could be spam filters)');
        }

        // Re-throw so callers can decide how to handle
        throw error;
    }
};

// ── Send test email (for debugging) ──
export const sendTestEmail = async (toEmail: string): Promise<boolean> => {
    return sendEmail(
        toEmail,
        'Test Email — Intervyxa AI',
        `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 30px; background: #0a0a0a; color: white; border-radius: 16px;">
            <h2 style="margin: 0 0 16px 0;">✅ Email Delivery Test</h2>
            <p style="color: #a1a1aa; font-size: 14px;">If you're reading this, your SMTP configuration is working correctly!</p>
            <p style="color: #71717a; font-size: 12px; margin-top: 20px;">
                Host: ${SMTP_HOST}:${SMTP_PORT}<br/>
                Secure: ${SMTP_SECURE}<br/>
                From: ${SMTP_FROM}<br/>
                Sent at: ${new Date().toISOString()}
            </p>
        </div>
        `,
        'TEST'
    );
};

// ═══════════════════════════════════════════════════════════════════
// PUBLIC EMAIL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

// ── Report Email ──
export const sendReportEmail = async (toEmail: string, reportData: any, scoreData: any) => {
    try {
        const subject = `Your Interview Report - ${reportData.final_level}`;
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background-color: #111; color: white; padding: 20px; text-align: center;">
                    <h1>Interview Report</h1>
                    <p style="color: #888;">AI Robotic Interviewer</p>
                </div>
                <div style="padding: 20px; border: 1px solid #ddd;">
                    <h2>Performance Summary</h2>
                    <p><strong>Status:</strong> ${reportData.final_level}</p>
                    <p><strong>Technical Score:</strong> ${scoreData.technical}/10</p>
                    <p><strong>Communication Score:</strong> ${scoreData.communication}/10</p>
                    <p><strong>Confidence Score:</strong> ${scoreData.confidence}/10</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <h3>Feedback</h3>
                    <p>${reportData.interview_summary}</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4ade80;">
                        <h4>Areas for Improvement</h4>
                        <ul>
                            ${reportData.areas_for_improvement?.map((area: string) => `<li>${area}</li>`).join('') || '<li>None identified.</li>'}
                        </ul>
                    </div>
                    <p style="margin-top: 20px;">
                        <a href="${clientUrl}/dashboard/report/${reportData._id || ''}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Full Report</a>
                    </p>
                </div>
                <div style="text-align: center; padding: 20px; font-size: 12px; color: #888;">
                    &copy; 2026 Intervyxa AI Platform
                </div>
            </div>
        `;

        await sendEmail(toEmail, subject, htmlContent, 'REPORT');
    } catch (error: any) {
        console.error('[EMAIL] Report email failed (non-fatal):', error.message);
    }
};

// ── Welcome Email ──
export const sendWelcomeEmail = async (toEmail: string, username: string) => {
    const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/login`;

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #e4e4e7; background: #0a0a0a; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06);">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%); padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 900; color: white; letter-spacing: -0.5px;">Welcome to the Platform!</h1>
                <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.8); letter-spacing: 2px; text-transform: uppercase; font-weight: 700;">Account Initialized Successfully</p>
            </div>
            <div style="padding: 32px 30px;">
                <p style="font-size: 16px; line-height: 1.6; color: #d4d4d8;">
                    Hi <strong style="color: white;">${username}</strong>,
                </p>
                <p style="font-size: 14px; line-height: 1.7; color: #a1a1aa;">
                    Your account has been created successfully! You now have access to our AI-powered interview preparation platform — complete with mock interviews, coding challenges, real-time feedback, and personalized training.
                </p>
                <div style="background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.15); border-radius: 16px; padding: 20px; margin: 24px 0;">
                    <p style="margin: 0 0 12px 0; font-size: 12px; color: #7c3aed; text-transform: uppercase; font-weight: 800; letter-spacing: 2px;">What You Can Do</p>
                    <ul style="margin: 0; padding: 0 0 0 16px; font-size: 13px; color: #a1a1aa; line-height: 2;">
                        <li>Practice with AI-powered mock interviews</li>
                        <li>Solve 500+ coding challenges in 13+ languages</li>
                        <li>Get real-time feedback and performance reports</li>
                        <li>Track your progress with analytics dashboard</li>
                    </ul>
                </div>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 14px 36px; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 10px 30px rgba(139,92,246,0.3);">
                        Login to Dashboard &rarr;
                    </a>
                </div>
            </div>
            <div style="text-align: center; padding: 20px 30px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 11px; color: #52525b;">
                &copy; 2026 Intervyxa AI &bull; Secured by AI
            </div>
        </div>
    `;

    // Welcome email is non-critical — don't throw
    try {
        await sendEmail(toEmail, `Welcome to Intervyxa AI, ${username}! 🎉`, htmlContent, 'WELCOME');
    } catch (error: any) {
        console.error('[EMAIL] Welcome email failed (non-fatal):', error.message);
    }
};

// ── Password Reset Email ──
export const sendPasswordResetEmail = async (toEmail: string, resetUrl: string, username: string) => {
    const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #e4e4e7; background: #0a0a0a; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06);">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); padding: 36px 30px; text-align: center;">
                <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 900; color: white;">Password Reset Request</h1>
                <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.8); letter-spacing: 2px; text-transform: uppercase; font-weight: 700;">Secure Recovery Link</p>
            </div>
            <div style="padding: 32px 30px;">
                <p style="font-size: 14px; line-height: 1.7; color: #d4d4d8;">
                    Hi <strong style="color: white;">${username}</strong>,
                </p>
                <p style="font-size: 14px; line-height: 1.7; color: #a1a1aa;">
                    We received a request to reset your password. Click the button below to set a new password. This link is valid for <strong style="color: #f97316;">30 minutes</strong> and can only be used once.
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #dc2626, #f97316); color: white; padding: 14px 36px; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 10px 30px rgba(220,38,38,0.3);">
                        Reset Password &rarr;
                    </a>
                </div>
                <div style="background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.12); border-radius: 12px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.6;">
                        ⚠️ If you did not request this reset, please ignore this email. Your password will remain unchanged and the link will expire automatically.
                    </p>
                </div>
                <p style="font-size: 11px; color: #52525b; word-break: break-all;">
                    If the button doesn't work, copy this link:<br/>
                    <a href="${resetUrl}" style="color: #7c3aed;">${resetUrl}</a>
                </p>
            </div>
            <div style="text-align: center; padding: 20px 30px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 11px; color: #52525b;">
                &copy; 2026 Intervyxa AI &bull; Secured by AI
            </div>
        </div>
    `;

    // Password reset IS critical — let errors propagate to the controller
    await sendEmail(toEmail, 'Password Reset Request — Intervyxa AI', htmlContent, 'PASSWORD_RESET');
};

