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

export type OtpDelivery = "email" | "console";

export function otpDeliveryMethod(): OtpDelivery {
  return mailConfigured() ? "email" : "console";
}

export async function deliverOtp(
  admin: { name: string; email: string },
  code: string,
  meta: { ip: string; minutes: number }
): Promise<{ ok: boolean; error?: string }> {
  if (!mailConfigured()) {
    console.warn(
      `\n┌──────────────────────────────────────────────┐\n│ [admin OTP] SMTP not configured — code for   │\n│ ${admin.email.padEnd(44)} │\n│ is ${code}  (valid ${meta.minutes} min)                       │\n└──────────────────────────────────────────────┘\n`
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
