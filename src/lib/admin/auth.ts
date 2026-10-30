/**
 * Authentication for the /admin panel.
 *
 * - Passwords are hashed with scrypt (node:crypto) + per-user salt.
 * - Sessions are stateless, signed (HMAC-SHA256) cookies — no extra table.
 * - The first admin is created automatically from ADMIN_EMAIL /
 *   ADMIN_PASSWORD, or from the documented default below.
 *
 * ⚠️ Server-only module.
 */

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createAdmin, getAdmins, updateAdmin } from "@/lib/content/store";
import type { AdminAccount, PublicAdmin } from "@/lib/content/types";

export const SESSION_COOKIE = "yantrix_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

export const DEFAULT_ADMIN_EMAIL = "admin@yantrixtechnology.com";
export const DEFAULT_ADMIN_PASSWORD = "Yantrix@2024";

const DEV_FALLBACK_SECRET = "yantrix-dev-only-session-secret-change-me-in-production";

let warned = false;

/**
 * The cookie signing key.
 *
 * Resolved lazily so `next build` does not need the runtime secret, but it still
 * fails closed: in production a missing secret throws on the first sign/verify
 * instead of quietly signing with a value that is published in this repository
 * (which would let anyone forge an admin session).
 */
function secret(): string {
  const configured = process.env.ADMIN_SESSION_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set. Generate one with `openssl rand -base64 48` and set it in the environment."
    );
  }
  if (!warned) {
    warned = true;
    console.warn(
      "[auth] ADMIN_SESSION_SECRET is not set — using the development-only fallback. Do NOT deploy like this."
    );
  }
  return DEV_FALLBACK_SECRET;
}

/* ───────────────────────── passwords ───────────────────────── */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, salt, hash] = stored.split(":");
    if (scheme !== "scrypt" || !salt || !hash) return false;
    const derived = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/* ───────────────────────── seeding ───────────────────────── */

export async function ensureDefaultAdmin(): Promise<void> {
  const admins = await getAdmins();
  if (admins.length > 0) return;

  const configuredEmail = process.env.ADMIN_EMAIL;
  const configuredPassword = process.env.ADMIN_PASSWORD;

  // Production must bootstrap from the environment. Seeding the documented default
  // password into a production database would hand out an owner account to anyone
  // who has read this repository.
  if (process.env.NODE_ENV === "production" && (!configuredEmail || !configuredPassword)) {
    throw new Error(
      "No admin account exists. Set ADMIN_EMAIL and ADMIN_PASSWORD (and ADMIN_NAME) to create the first owner."
    );
  }
  if (!configuredEmail || !configuredPassword) {
    console.warn(
      `[auth] No admin account exists — creating the development default ${DEFAULT_ADMIN_EMAIL}. ` +
        "Set ADMIN_EMAIL / ADMIN_PASSWORD before deploying."
    );
  }

  const email = (configuredEmail ?? DEFAULT_ADMIN_EMAIL).toLowerCase();
  const password = configuredPassword ?? DEFAULT_ADMIN_PASSWORD;
  const now = new Date().toISOString();
  const owner: AdminAccount = {
    id: randomBytes(8).toString("hex"),
    name: process.env.ADMIN_NAME ?? "Site Owner",
    email,
    passwordHash: hashPassword(password),
    role: "owner",
    active: true,
    createdAt: now,
    lastLoginAt: null,
    sessionVersion: 0,
  };
  // Insert-if-absent: a concurrent first request loses the race harmlessly
  // instead of replacing the account the winner just created.
  await createAdmin(owner);
}

/* ───────────────────────── sessions ───────────────────────── */

interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: AdminAccount["role"];
  /** Admin's session generation — bumping it invalidates every issued token. */
  ver: number;
  exp: number;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createSessionToken(admin: AdminAccount): string {
  const payload: SessionPayload = {
    sub: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    ver: admin.sessionVersion ?? 0,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSessionAdmin(): Promise<PublicAdmin | null> {
  const store = await cookies();
  const payload = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const admins = await getAdmins();
  const admin = admins.find((a) => a.id === payload.sub && a.active);
  if (!admin) return null;
  // A password change (or an explicit "sign out everywhere") bumps sessionVersion,
  // so tokens minted before it stop working immediately instead of at expiry.
  if ((admin.sessionVersion ?? 0) !== (payload.ver ?? 0)) return null;
  return publicAdmin(admin);
}

export function publicAdmin(admin: AdminAccount): PublicAdmin {
  const { passwordHash: _passwordHash, ...rest } = admin;
  return rest;
}

/* Role rules live in ./permissions so the client-side panel can share them. */
export { canWrite, isOwner } from "@/lib/admin/permissions";

/**
 * Step 1 of the login: checks email + password only. Does NOT sign in —
 * the admin must still verify the one-time code (see lib/admin/otp.ts).
 */
export async function verifyCredentials(email: string, password: string): Promise<AdminAccount | null> {
  await ensureDefaultAdmin();
  const admins = await getAdmins();
  const admin = admins.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!admin || !admin.active) return null;
  if (!verifyPassword(password, admin.passwordHash)) return null;
  return admin;
}

export async function getActiveAdminById(id: string): Promise<AdminAccount | null> {
  const admins = await getAdmins();
  return admins.find((a) => a.id === id && a.active) ?? null;
}

/** Step 2 succeeded: record the login time. */
export async function recordLogin(id: string): Promise<AdminAccount | null> {
  return updateAdmin(id, { lastLoginAt: new Date().toISOString() });
}

/**
 * Invalidate every session token ever issued for this account by moving its
 * session generation. Used on password change and account deactivation.
 */
export async function bumpSessionVersion(id: string): Promise<AdminAccount | null> {
  const admins = await getAdmins();
  const admin = admins.find((a) => a.id === id);
  if (!admin) return null;
  return updateAdmin(id, { sessionVersion: (admin.sessionVersion ?? 0) + 1 });
}

/** HMAC with the session secret — used to hash one-time codes at rest. */
export function signValue(value: string): string {
  return sign(value);
}

export function setSessionCookie(response: import("next/server").NextResponse, admin: AdminAccount): void {
  response.cookies.set(SESSION_COOKIE, createSessionToken(admin), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
