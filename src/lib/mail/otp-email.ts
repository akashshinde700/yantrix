/**
 * Delivers an admin sign-in code. With SMTP configured it is emailed; without
 * it (local setup) the code is printed to the server terminal so the site
 * owner — who has server access — can still sign in.
 *
 * ⚠️ Server-only module.
 */

import { getContent } from "@/lib/content/store";
import { defaultFrom, mailConfigured, sendMail } from "@/lib/mail/mailer";
import { brandAttachments } from "@/lib/mail/enquiry-emails";
import { istTime, otpEmail } from "@/lib/mail/templates";

export type OtpDelivery = "email" | "console" | "unavailable";

/**
 * How the code will be delivered.
 *
 * Printing the code to the terminal is a development convenience — in
 * production it would turn two-factor auth into "whoever can read the container
 * logs", so the console fallback is disabled there and sign-in fails instead of
 * silently degrading to a single factor.
 */
export function otpDeliveryMethod(): OtpDelivery {
  if (mailConfigured()) return "email";
  return process.env.NODE_ENV === "production" ? "unavailable" : "console";
}

export async function deliverOtp(
  admin: { name: string; email: string },
  code: string,
  meta: { ip: string; minutes: number }
): Promise<{ ok: boolean; error?: string }> {
  const method = otpDeliveryMethod();
  if (method === "unavailable") {
    console.error(
      "[admin OTP] SMTP is not configured and the console fallback is disabled in production — sign-in cannot complete."
    );
    return { ok: false, error: "Email delivery is not configured on this server." };
  }
  if (method === "console") {
    console.warn(
      [
        "",
        "  ── admin sign-in code (development fallback) ──",
        `  account : ${admin.email}`,
        `  code    : ${code}`,
        `  valid   : ${meta.minutes} minutes, single use`,
        "  SMTP is not configured, so the code is printed here.",
        "  ──────────────────────────────────────────────",
        "",
      ].join("\n")
    );
    return { ok: true };
  }
  const { settings } = await getContent();
  const mail = otpEmail(code, admin.name, settings, { ip: meta.ip, at: istTime(new Date().toISOString()), minutes: meta.minutes });
  const result = await sendMail({
    from: defaultFrom(settings.name),
    to: { name: admin.name, address: admin.email },
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    attachments: await brandAttachments(),
    priority: "high",
  });
  if (!result.sent) console.error(`[admin OTP] email to ${admin.email} failed: ${result.error}`);
  return result.sent ? { ok: true } : { ok: false, error: result.error };
}
