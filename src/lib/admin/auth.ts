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
import { getAdmins, saveAdmins } from "@/lib/content/store";
import type { AdminAccount, PublicAdmin } from "@/lib/content/types";

export const SESSION_COOKIE = "yantrix_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

export const DEFAULT_ADMIN_EMAIL = "admin@yantrixtechnology.com";
export const DEFAULT_ADMIN_PASSWORD = "Yantrix@2024";

const SECRET =
  process.env.ADMIN_SESSION_SECRET ??
  "yantrix-dev-only-session-secret-change-me-in-production";

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

  const email = (process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
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
  };
  await saveAdmins([owner]);
}

/* ───────────────────────── sessions ───────────────────────── */

interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: AdminAccount["role"];
  exp: number;
}

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

export function createSessionToken(admin: AdminAccount): string {
  const payload: SessionPayload = {
    sub: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
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
  return publicAdmin(admin);
}

export function publicAdmin(admin: AdminAccount): PublicAdmin {
  const { passwordHash: _passwordHash, ...rest } = admin;
  return rest;
}

/** Roles allowed to make changes. */
export function canWrite(role: PublicAdmin["role"] | undefined): boolean {
  return role === "owner" || role === "editor";
}

export function isOwner(role: PublicAdmin["role"] | undefined): boolean {
  return role === "owner";
}

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
  const admins = await getAdmins();
  const admin = admins.find((a) => a.id === id);
  if (!admin) return null;
  const updated: AdminAccount = { ...admin, lastLoginAt: new Date().toISOString() };
  await saveAdmins(admins.map((a) => (a.id === id ? updated : a)));
  return updated;
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
