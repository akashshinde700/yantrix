import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ensureDefaultAdmin, verifyCredentials } from "@/lib/admin/auth";
import { OTP_COOKIE, OTP_TTL_MS, createChallenge, maskEmail } from "@/lib/admin/otp";
import { clientIp, isBlocked, recordFailure } from "@/lib/admin/login-guard";
import { addAuditEntry } from "@/lib/content/store";
import { deliverOtp, otpDeliveryMethod } from "@/lib/mail/otp-email";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Admin login, step 1 of 2: email + password. On success NO session is
 * created — a one-time code is sent to the admin's email and the browser gets
 * only a short-lived challenge cookie. Step 2 is /api/admin/login/verify.
 */
export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (isBlocked(ip)) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Please wait 10 minutes." }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address and password." }, { status: 422 });
  }

  await ensureDefaultAdmin();
  const admin = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!admin) {
    recordFailure(ip);
    return NextResponse.json({ ok: false, error: "Incorrect email or password." }, { status: 401 });
  }

  const challenge = createChallenge(admin.id);
  const minutes = OTP_TTL_MS / 60_000;
  // wait a little for the email so a failure can be shown; slow SMTP keeps sending in the background
  const sent = await Promise.race([
    deliverOtp(admin, challenge.code, { ip, minutes }),
    new Promise<{ ok: true }>((resolve) => setTimeout(() => resolve({ ok: true }), 12_000)),
  ]);
  if (!sent.ok) {
    return NextResponse.json(
      { ok: false, error: "Could not send the sign-in code by email. Check the SMTP settings (the server log has details)." },
      { status: 502 }
    );
  }
  await addAuditEntry({ actorEmail: admin.email, action: "login.otp_sent", target: ip });

  const response = NextResponse.json({
    ok: true,
    otpRequired: true,
    delivery: otpDeliveryMethod(),
    sentTo: maskEmail(admin.email),
    expiresInSeconds: OTP_TTL_MS / 1000,
  });
  response.cookies.set(OTP_COOKIE, challenge.id, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/api/admin/login",
    maxAge: OTP_TTL_MS / 1000,
  });
  return response;
}
