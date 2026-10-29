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

/* Very small in-memory brute-force guard: 8 attempts / 10 min / IP. */
const attempts = new Map<string, number[]>();
const WINDOW = 10 * 60 * 1000;
const MAX = 8;

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (recent.length >= MAX) return true;
  recent.push(now);
  attempts.set(ip, recent);
  return false;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (tooMany(ip)) {
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
    return NextResponse.json(
      { ok: false, error: "Incorrect email or password." },
      { status: 401 }
    );
  }

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
