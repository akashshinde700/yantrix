/**
 * SMTP mailer (nodemailer). Configured from environment variables:
 *
 *   SMTP_HOST            e.g. smtp.gmail.com / smtp.hostinger.com / smtp.zoho.in
 *   SMTP_PORT            587 (STARTTLS, default) or 465 (SSL)
 *   SMTP_SECURE          "true" for port 465 (auto-detected from the port if unset)
 *   SMTP_USER            the mailbox login
 *   SMTP_PASS            its password (Gmail: an App Password, not the normal one)
 *   MAIL_FROM            optional, e.g. "Yantrix Technology <info@yantrixtechnology.com>"
 *   ADMIN_NOTIFY_EMAIL   optional, comma-separated; defaults to the site's contact email
 *
 * Without SMTP_HOST/USER/PASS mail is skipped with a warning — enquiries are
 * still saved, so nothing breaks before email is configured.
 *
 * ⚠️ Server-only module.
 */

import nodemailer, { type SendMailOptions, type Transporter } from "nodemailer";

const shared = globalThis as unknown as { yantrixMailer?: Transporter | null; yantrixMailerWarned?: boolean };

export function mailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function transporter(): Transporter | null {
  if (shared.yantrixMailer !== undefined) return shared.yantrixMailer;
  if (!mailConfigured()) {
    if (!shared.yantrixMailerWarned) {
      console.warn("[mail] SMTP is not configured (SMTP_HOST / SMTP_USER / SMTP_PASS) — enquiry emails are skipped.");
      shared.yantrixMailerWarned = true;
    }
    return null;
  }
  const port = Number(process.env.SMTP_PORT || 587);
  shared.yantrixMailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    pool: true,
    maxConnections: 2,
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return shared.yantrixMailer;
}

/** Default "From" — MAIL_FROM, else the site name at the SMTP mailbox. */
export function defaultFrom(siteName: string): string {
  return process.env.MAIL_FROM || `"${siteName.replace(/"/g, "")}" <${process.env.SMTP_USER}>`;
}

export async function sendMail(options: SendMailOptions): Promise<{ sent: boolean; id?: string; error?: string }> {
  const t = transporter();
  if (!t) return { sent: false, error: "SMTP not configured" };
  try {
    const info = await t.sendMail(options);
    return { sent: true, id: info.messageId };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : String(error) };
  }
}
