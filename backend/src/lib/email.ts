import { env } from '../config/env';

interface Recipient {
  email: string;
  name?: string;
}

interface SendEmailOptions {
  to: Recipient | Recipient[];
  subject: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const to = Array.isArray(options.to) ? options.to : [options.to];

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: env.BREVO_SENDER_NAME, email: env.BREVO_SENDER_EMAIL },
      to,
      subject: options.subject,
      htmlContent: options.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo error ${res.status}: ${body}`);
  }
}

// ── Email templates ────────────────────────────────────────────────────────────

export function passwordResetEmail(name: string, resetLink: string) {
  return {
    subject: 'Reset your ThriveFund password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#7C3AED">ThriveFund</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below — the link expires in <strong>1 hour</strong>.</p>
        <a href="${resetLink}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#7C3AED;color:#fff;text-decoration:none;border-radius:6px">
          Reset Password
        </a>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#888;font-size:12px">ThriveFund · helping you save together</p>
      </div>`,
  };
}

export function invitationEmail(
  goalTitle: string,
  inviterName: string,
  contributionLink: string,
  message?: string,
) {
  return {
    subject: `${inviterName} invited you to contribute to "${goalTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#7C3AED">ThriveFund</h2>
        <p>Hi there,</p>
        <p><strong>${inviterName}</strong> has invited you to contribute to their savings goal: <strong>${goalTitle}</strong>.</p>
        ${message ? `<blockquote style="border-left:3px solid #7C3AED;padding-left:12px;color:#555">${message}</blockquote>` : ''}
        <a href="${contributionLink}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#7C3AED;color:#fff;text-decoration:none;border-radius:6px">
          Contribute Now
        </a>
        <p style="color:#888;font-size:12px">ThriveFund · helping you save together</p>
      </div>`,
  };
}
