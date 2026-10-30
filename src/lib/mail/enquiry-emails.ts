/**
 * Sends the two enquiry emails (student confirmation + admin alert).
 * Called from /api/contact via next/server `after()`, so the visitor gets
 * their "thank you" immediately and a slow SMTP server never delays it.
 *
 * ⚠️ Server-only module.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { getContent } from "@/lib/content/store";
import type { Course, Enquiry } from "@/lib/content/types";
import { defaultFrom, mailConfigured, sendMail } from "@/lib/mail/mailer";
import { adminEmail, CID, studentEmail } from "@/lib/mail/templates";

type Result = { sent: boolean; id?: string; error?: string };

// public/ is copied into production builds (standalone output), so the assets live there
const ASSET_DIR = path.join(process.cwd(), "public", "email");

let assets: { banner: Buffer; icon: Buffer } | null = null;
async function loadAssets() {
  assets ??= {
    banner: await readFile(path.join(ASSET_DIR, "email-banner.gif")),
    icon: await readFile(path.join(ASSET_DIR, "icon-email.png")),
  };
  return assets;
}

/** The embedded banner + icon every branded email carries. */
export async function brandAttachments() {
  const { banner, icon } = await loadAssets();
  return [
    { filename: "yantrix.gif", content: banner, cid: CID.banner, contentType: "image/gif" },
    { filename: "yantrix-icon.png", content: icon, cid: CID.icon, contentType: "image/png" },
  ];
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** The course the student picked, if it matches a published course. */
function matchCourse(courses: Course[], picked: string): Course | undefined {
  const p = norm(picked);
  return courses.find((c) => c.active !== false && (norm(c.title) === p || norm(c.slug) === p));
}

/** Who gets admin alerts: ADMIN_NOTIFY_EMAIL (comma-separated), else the site's contact email. */
function adminRecipients(siteEmail: string): string[] {
  return (process.env.ADMIN_NOTIFY_EMAIL || siteEmail || process.env.SMTP_USER || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function sendEnquiryEmails(
  enquiry: Enquiry,
  { adminTo }: { adminTo?: string[] } = {}
): Promise<{ student: Result; admin: Result }> {
  if (!mailConfigured()) {
    const skipped = await sendMail({}); // logs the one-time "SMTP not configured" warning
    return { student: skipped, admin: skipped };
  }

  const content = await getContent();
  const { settings } = content;
  const course = matchCourse(content.collections.courses as unknown as Course[], enquiry.course);
  const attachments = await brandAttachments();
  const from = defaultFrom(settings.name);
  const admins = adminTo ?? adminRecipients(settings.contact.email);
  const studentMail = studentEmail(enquiry, settings, course);
  const adminMail = adminEmail(enquiry, settings);

  const [student, admin] = await Promise.all([
    sendMail({
      from,
      to: { name: enquiry.name, address: enquiry.email },
      replyTo: settings.contact.email || undefined,
      subject: studentMail.subject,
      html: studentMail.html,
      text: studentMail.text,
      attachments,
    }),
    admins.length
      ? sendMail({
          from,
          to: admins,
          replyTo: { name: enquiry.name, address: enquiry.email },
          subject: adminMail.subject,
          html: adminMail.html,
          text: adminMail.text,
          attachments,
          priority: "high",
        })
      : Promise.resolve<Result>({ sent: false, error: "No admin address configured" }),
  ]);

  const ref = enquiry.id.slice(0, 8);
  if (!student.sent) console.error(`[mail] confirmation to student failed (enquiry ${ref}): ${student.error}`);
  if (!admin.sent) console.error(`[mail] admin alert failed (enquiry ${ref}): ${admin.error}`);
  if (student.sent && admin.sent) console.info(`[mail] enquiry ${ref}: confirmation + admin alert sent`);
  return { student, admin };
}
