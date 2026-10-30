/**
 * In-memory brute-force guard for the admin login: 10 *failed* steps
 * (wrong password or wrong code) per 10 minutes per IP. Successful logins
 * clear the counter, so normal use never locks anyone out.
 *
 * The limiter and `clientIp` live in `@/lib/rate-limit` so the public contact
 * form shares the same implementation. Counts are per process — see the note
 * there about multi-instance deployments.
 *
 * ⚠️ Server-only module.
 */
import { createRateLimiter } from "@/lib/rate-limit";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 10;

export const loginLimiter = createRateLimiter({
  name: "admin-login",
  windowMs: WINDOW_MS,
  max: MAX_FAILURES,
});

export { clientIp } from "@/lib/rate-limit";

export function isBlocked(ip: string): boolean {
  return !loginLimiter.blocked(ip).allowed;
}

export function recordFailure(ip: string): void {
  loginLimiter.record(ip);
}

export function clearFailures(ip: string): void {
  loginLimiter.clear(ip);
}
