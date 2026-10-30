/**
 * In-memory brute-force guard for the admin login: 10 *failed* steps
 * (wrong password or wrong code) per 10 minutes per IP. Successful logins
 * clear the counter, so normal use never locks anyone out.
 *
 * ⚠️ Server-only module.
 */
import type { NextRequest } from "next/server";

const WINDOW = 10 * 60 * 1000;
const MAX_FAILURES = 10;
const shared = globalThis as unknown as { yantrixLoginFailures?: Map<string, number[]> };
const failures = (shared.yantrixLoginFailures ??= new Map<string, number[]>());

export function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
}

export function isBlocked(ip: string): boolean {
  const now = Date.now();
  const recent = (failures.get(ip) ?? []).filter((t) => now - t < WINDOW);
  failures.set(ip, recent);
  return recent.length >= MAX_FAILURES;
}

export function recordFailure(ip: string): void {
  const now = Date.now();
  const recent = (failures.get(ip) ?? []).filter((t) => now - t < WINDOW);
  recent.push(now);
  failures.set(ip, recent);
  if (failures.size > 5000) {
    for (const [key, times] of failures) if (times.every((t) => now - t >= WINDOW)) failures.delete(key);
  }
}

export function clearFailures(ip: string): void {
  failures.delete(ip);
}
