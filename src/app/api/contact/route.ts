import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

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

/* ── Lightweight in-memory rate limiting (max 5 submissions / 10 min / IP) ── */
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    // Keep the map bounded
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many enquiries from this device. Please try again later." },
        { status: 429 }
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

    const enquiry = await db.courseEnquiry.create({
      data: {
        name,
        email: email.toLowerCase(),
        mobile,
        course,
        message: message && message.length > 0 ? message : null,
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, id: enquiry.id }, { status: 201 });
  } catch (error) {
    console.error("[/api/contact] Failed to save enquiry:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save your enquiry right now. Please try again or WhatsApp us." },
      { status: 500 }
    );
  }
}
