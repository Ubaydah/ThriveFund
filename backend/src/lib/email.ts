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
        <p style="color:#888;font-size:12px">ThriveFund · helping you save together</p>
      </div>`,
  };
}

export function paymentReceivedEmail(payerName: string, amount: number, goalTitle: string) {
  return {
    subject: `Payment received: ₦${amount.toLocaleString()} for ${goalTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#00A86B">ThriveFund</h2>
        <p>Good news! A payment has been received and reconciled automatically.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#666">Contributor</td><td style="padding:8px"><strong>${payerName}</strong></td></tr>
          <tr><td style="padding:8px;color:#666">Amount</td><td style="padding:8px"><strong>₦${amount.toLocaleString()}</strong></td></tr>
          <tr><td style="padding:8px;color:#666">Goal</td><td style="padding:8px"><strong>${goalTitle}</strong></td></tr>
        </table>
        <p style="color:#888;font-size:12px">ThriveFund · payment operations platform</p>
      </div>`,
  };
}

export async function sendPaymentReceivedEmail(
  to: string,
  data: { payerName: string; amount: number; goalTitle: string },
) {
  const template = paymentReceivedEmail(data.payerName, data.amount, data.goalTitle);
  await sendEmail({ to: { email: to }, subject: template.subject, html: template.html });
}
