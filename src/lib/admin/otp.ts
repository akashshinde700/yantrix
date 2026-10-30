/**
 * One-time codes for the admin login's second step.
 *
 * After a correct email + password the server creates a challenge: a 6-digit
 * code (crypto.randomInt) that is emailed to the admin. Only an HMAC of the
 * code is kept (never the code itself), together with its expiry and attempt
 * counters. The browser holds just a random challenge id in an httpOnly
 * cookie — no session exists until the code is verified.
 *
 *   - code valid for 5 minutes
 *   - 5 wrong attempts → challenge destroyed (sign in again)
 *   - resend: 30 s cooldown, at most 3 resends (each issues a new code)
 *
 * Challenges live in server memory (shared on globalThis), which is right for
 * a single server process; a restart simply asks the admin to sign in again.
 *
 * ⚠️ Server-only module.
 */

import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { signValue } from "@/lib/admin/auth";

export const OTP_COOKIE = "yantrix_otp";
export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
export const OTP_MAX_RESENDS = 3;

interface Challenge {
  adminId: string;
  codeHash: string;
  expires: number;
  attempts: number;
  resends: number;
  lastSentAt: number;
}

const shared = globalThis as unknown as { yantrixOtp?: Map<string, Challenge> };
const store = (shared.yantrixOtp ??= new Map<string, Challenge>());

const hashCode = (id: string, code: string) => signValue(`otp:${id}:${code}`);
const newCode = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

function sweep() {
  const now = Date.now();
  for (const [id, c] of store) if (c.expires < now) store.delete(id);
}

/** Start a challenge for an admin who passed the password check. */
export function createChallenge(adminId: string): { id: string; code: string; expires: number } {
  sweep();
  // one pending challenge per admin
  for (const [id, c] of store) if (c.adminId === adminId) store.delete(id);
  const id = randomBytes(32).toString("base64url");
  const code = newCode();
  const now = Date.now();
  store.set(id, { adminId, codeHash: hashCode(id, code), expires: now + OTP_TTL_MS, attempts: 0, resends: 0, lastSentAt: now });
  return { id, code, expires: now + OTP_TTL_MS };
}

export type VerifyResult =
  | { ok: true; adminId: string }
  | { ok: false; error: string; attemptsLeft?: number; restart?: boolean };

export function verifyChallenge(id: string | undefined, code: string): VerifyResult {
  sweep();
  const c = id ? store.get(id) : undefined;
  if (!id || !c) return { ok: false, error: "Your code has expired. Please sign in again.", restart: true };

  const expected = Buffer.from(c.codeHash);
  const given = Buffer.from(hashCode(id, code.replace(/\D/g, "")));
  const match = expected.length === given.length && timingSafeEqual(expected, given);
  if (match) {
    store.delete(id); // single use
    return { ok: true, adminId: c.adminId };
  }
  c.attempts += 1;
  const left = OTP_MAX_ATTEMPTS - c.attempts;
  if (left <= 0) {
    store.delete(id);
    return { ok: false, error: "Too many wrong codes. Please sign in again.", restart: true };
  }
  return { ok: false, error: `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.`, attemptsLeft: left };
}

export type ResendResult =
  | { ok: true; adminId: string; code: string; expires: number }
  | { ok: false; error: string; waitSeconds?: number; restart?: boolean };

/** Issue a fresh code for an existing challenge (the old code stops working). */
export function resendChallenge(id: string | undefined): ResendResult {
  sweep();
  const c = id ? store.get(id) : undefined;
  if (!id || !c) return { ok: false, error: "Your sign-in has expired. Please sign in again.", restart: true };
  const wait = c.lastSentAt + OTP_RESEND_COOLDOWN_MS - Date.now();
  if (wait > 0) return { ok: false, error: `Please wait ${Math.ceil(wait / 1000)} s before requesting a new code.`, waitSeconds: Math.ceil(wait / 1000) };
  if (c.resends >= OTP_MAX_RESENDS) return { ok: false, error: "Resend limit reached. Please sign in again.", restart: true };
  const code = newCode();
  const now = Date.now();
  c.codeHash = hashCode(id, code);
  c.expires = now + OTP_TTL_MS;
  c.attempts = 0;
  c.resends += 1;
  c.lastSentAt = now;
  return { ok: true, adminId: c.adminId, code, expires: c.expires };
}

/** "admin@yantrixtechnology.com" → "ad•••@yantrixtechnology.com" */
export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  return `${user.slice(0, 2)}${"•".repeat(Math.max(3, user.length - 2))}@${domain}`;
}
