import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  authenticate,
  createSessionToken,
  ensureDefaultAdmin,
} from "@/lib/admin/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/*
 * Small in-memory brute-force guard: 10 *failed* logins / 10 min / IP.
 * Successful logins are not counted, so normal use never locks anyone out.
 */
const failures = new Map<string, number[]>();
const WINDOW = 10 * 60 * 1000;
const MAX_FAILURES = 10;

function isBlocked(ip: string): boolean {
  const now = Date.now();
  const recent = (failures.get(ip) ?? []).filter((t) => now - t < WINDOW);
  failures.set(ip, recent);
  return recent.length >= MAX_FAILURES;
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const recent = (failures.get(ip) ?? []).filter((t) => now - t < WINDOW);
  recent.push(now);
  failures.set(ip, recent);
  if (failures.size > 5000) {
    for (const [key, times] of failures) {
      if (times.every((t) => now - t >= WINDOW)) failures.delete(key);
    }
  }
}

function clearFailures(ip: string): void {
  failures.delete(ip);
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isBlocked(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many login attempts. Please wait 10 minutes." },
      { status: 429 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid email address and password." },
      { status: 422 }
    );
  }

  await ensureDefaultAdmin();
  const admin = await authenticate(parsed.data.email, parsed.data.password);
  if (!admin) {
    recordFailure(ip);
    return NextResponse.json(
      { ok: false, error: "Incorrect email or password." },
      { status: 401 }
    );
  }
  clearFailures(ip);

  const response = NextResponse.json({ ok: true, name: admin.name, role: admin.role });
  response.cookies.set(SESSION_COOKIE, createSessionToken(admin), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
