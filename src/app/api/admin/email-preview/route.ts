import { NextRequest, NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/admin/auth";
import { getContent } from "@/lib/content/store";
import type { Course } from "@/lib/content/types";
import { adminEmail, CID, studentEmail } from "@/lib/mail/templates";
import { sampleEnquiry } from "@/lib/mail/sample";

export const dynamic = "force-dynamic";

/** Renders an enquiry email with sample data (admin only). ?type=student|admin */
export async function GET(request: NextRequest) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401 });
  const content = await getContent();
  const enquiry = sampleEnquiry(content);
  const course = (content.collections.courses as unknown as Course[]).find((c) => c.title === enquiry.course);
  const mail = request.nextUrl.searchParams.get("type") === "admin" ? adminEmail(enquiry, content.settings) : studentEmail(enquiry, content.settings, course);
  // inline images are attachments in real emails; point them at /public for the preview
  const html = mail.html.replaceAll(`cid:${CID.banner}`, "/email/email-banner.gif").replaceAll(`cid:${CID.icon}`, "/email/icon-email.png");
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" } });
}
