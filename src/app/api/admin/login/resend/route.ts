import { NextRequest, NextResponse } from "next/server";
import { getActiveAdminById } from "@/lib/admin/auth";
import { OTP_COOKIE, OTP_TTL_MS, resendChallenge } from "@/lib/admin/otp";
import { clientIp } from "@/lib/admin/login-guard";
import { deliverOtp } from "@/lib/mail/otp-email";

export const dynamic = "force-dynamic";

/** Sends a fresh code for the pending sign-in (30 s cooldown, max 3 resends). */
export async function POST(request: NextRequest) {
  const result = resendChallenge(request.cookies.get(OTP_COOKIE)?.value);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, waitSeconds: result.waitSeconds, restart: Boolean(result.restart) },
      { status: result.waitSeconds ? 429 : 401 }
    );
  }
  const admin = await getActiveAdminById(result.adminId);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "This account is no longer active.", restart: true }, { status: 403 });
  }
  const sent = await Promise.race([
    deliverOtp(admin, result.code, { ip: clientIp(request), minutes: OTP_TTL_MS / 60_000 }),
    new Promise<{ ok: true }>((resolve) => setTimeout(() => resolve({ ok: true }), 12_000)),
  ]);
  if (!sent.ok) return NextResponse.json({ ok: false, error: "Could not send a new code. Check the SMTP settings." }, { status: 502 });
  return NextResponse.json({ ok: true, expiresInSeconds: OTP_TTL_MS / 1000 });
}
