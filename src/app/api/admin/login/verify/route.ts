import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getActiveAdminById, recordLogin, setSessionCookie } from "@/lib/admin/auth";
import { OTP_COOKIE, verifyChallenge } from "@/lib/admin/otp";
import { clearFailures, clientIp, isBlocked, recordFailure } from "@/lib/admin/login-guard";
import { addAuditEntry } from "@/lib/content/store";

export const dynamic = "force-dynamic";

const schema = z.object({ code: z.string().regex(/^\d{6}$/) });

/** Admin login, step 2 of 2: the one-time code. Only now is the session created. */
export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (isBlocked(ip)) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Please wait 10 minutes." }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Enter the 6-digit code." }, { status: 422 });

  const result = verifyChallenge(request.cookies.get(OTP_COOKIE)?.value, parsed.data.code);
  if (!result.ok) {
    recordFailure(ip);
    const response = NextResponse.json(
      { ok: false, error: result.error, restart: Boolean(result.restart), attemptsLeft: result.attemptsLeft },
      { status: 401 }
    );
    if (result.restart) response.cookies.delete({ name: OTP_COOKIE, path: "/api/admin/login" });
    return response;
  }

  const admin = await getActiveAdminById(result.adminId);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "This account is no longer active.", restart: true }, { status: 403 });
  }
  const updated = (await recordLogin(admin.id)) ?? admin;
  clearFailures(ip);
  await addAuditEntry({ actorEmail: admin.email, action: "login.success", target: ip });

  const response = NextResponse.json({ ok: true, name: updated.name, role: updated.role });
  setSessionCookie(response, updated);
  response.cookies.delete({ name: OTP_COOKIE, path: "/api/admin/login" });
  return response;
}
