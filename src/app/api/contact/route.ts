import { NextRequest, NextResponse, after } from "next/server";
import { z } from "zod";
import { addEnquiry } from "@/lib/content/store";
import { sendEnquiryEmails } from "@/lib/mail/enquiry-emails";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

/* ── Validation (mirrors the client-side schema) ── */
const enquirySchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  mobile: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s\-()]/g, ""))
    .pipe(z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Invalid mobile number")),
  course: z.string().trim().min(1).max(120),
  message: z.string().trim().max(1000).optional().nullable(),
});

/* ── Shared in-memory rate limiting (max 5 submissions / 10 min / IP) ── */
const contactLimiter = createRateLimiter({
  name: "contact-form",
  windowMs: 10 * 60 * 1000,
  max: 5,
});

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    const limit = contactLimiter.hit(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many enquiries from this device. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Please check the form fields and try again.",
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 422 }
      );
    }

    const { name, email, mobile, course, message } = parsed.data;

    const enquiry = await addEnquiry({
      name,
      email: email.toLowerCase(),
      mobile,
      course,
      message: message && message.length > 0 ? message : null,
      source: "website",
    });

    // confirmation to the student + alert to the admin, after the response is sent
    after(() =>
      sendEnquiryEmails(enquiry).catch((error) => console.error("[/api/contact] enquiry emails failed:", error))
    );

    return NextResponse.json({ ok: true, id: enquiry.id }, { status: 201 });
  } catch (error) {
    console.error("[/api/contact] Failed to save enquiry:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save your enquiry right now. Please try again or WhatsApp us." },
      { status: 500 }
    );
  }
}
