import { NextResponse } from "next/server";
import { canWrite, getSessionAdmin } from "@/lib/admin/auth";
import { addAuditEntry, getContent } from "@/lib/content/store";
import { mailConfigured } from "@/lib/mail/mailer";
import { sendEnquiryEmails } from "@/lib/mail/enquiry-emails";
import { sampleEnquiry } from "@/lib/mail/sample";

export const dynamic = "force-dynamic";

/** Sends both enquiry emails with sample data to the logged-in admin. */
export async function POST() {
  const admin = await getSessionAdmin();
  if (!admin || !canWrite(admin.role)) return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401 });
  if (!mailConfigured()) {
    return NextResponse.json({ ok: false, error: "SMTP is not configured — add SMTP_HOST, SMTP_USER and SMTP_PASS to .env and restart." }, { status: 400 });
  }
  const content = await getContent();
  const result = await sendEnquiryEmails(sampleEnquiry(content, admin.email), { adminTo: [admin.email] });
  await addAuditEntry({ actorEmail: admin.email, action: "email.test", target: admin.email });
  if (!result.student.sent || !result.admin.sent) {
    return NextResponse.json({ ok: false, error: result.student.error || result.admin.error || "Sending failed." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, to: admin.email });
}
