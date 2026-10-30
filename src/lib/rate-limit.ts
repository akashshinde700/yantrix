/**
 * Shared in-memory rate limiting + client-IP resolution.
 *
 * Used by the admin login guard and the public contact form. The counts live on
 * `globalThis` so every route bundle in the process sees the same numbers (a
 * module-level map is re-instantiated per bundle, which silently multiplied the
 * effective limit).
 *
 * Limitations, by design:
 *  - Memory only: each instance counts separately. Fine for a single-process
 *    deployment; move to Redis (or a MySQL table) once you run more than one.
 *  - Trusts proxy headers only when `TRUST_PROXY_HEADERS` is not "false".
 */

import type { NextRequest } from "next/server";

/* ─────────────────────────── client ip ─────────────────────────── */

/**
 * The client address, or "unknown" when it cannot be determined.
 *
 * `x-forwarded-for` is a comma-separated chain: `client, proxy1, proxy2`. Each
 * hop appends the address it saw, so the **rightmost** entry is the one written
 * by the hop closest to us and the leftmost is whatever the caller decided to
 * send. Reading the leftmost entry (as this code used to) lets an attacker pick
 * their own rate-limit bucket by sending `X-Forwarded-For: <anything>`.
 */
export function clientIp(request: NextRequest): string {
  if (process.env.TRUST_PROXY_HEADERS === "false") return "unknown";

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((hop) => hop.trim())
      .filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/* ─────────────────────────── limiter ─────────────────────────── */

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the oldest hit leaves the window (only when blocked). */
  retryAfterSeconds: number;
  remaining: number;
}

interface Bucket {
  hits: number[];
}

const state = globalThis as unknown as {
  yantrixRateLimits?: Map<string, Map<string, Bucket>>;
};

function buckets(name: string): Map<string, Bucket> {
  state.yantrixRateLimits ??= new Map();
  let bucket = state.yantrixRateLimits.get(name);
  if (!bucket) {
    bucket = new Map();
    state.yantrixRateLimits.set(name, bucket);
  }
  return bucket;
}

export interface RateLimiterOptions {
  /** Key prefix so several limiters can share the global map. */
  name: string;
  windowMs: number;
  max: number;
}

export interface RateLimiter {
  /** Count one attempt and report whether it is allowed. */
  hit(key: string): RateLimitResult;
  /** Whether `key` is already over the limit, without recording an attempt. */
  blocked(key: string): RateLimitResult;
  /** Drop the history for one key (e.g. after a successful sign-in). */
  clear(key: string): void;
  /** Record one attempt without checking (call after a request is allowed). */
  record(key: string): void;
}

export function createRateLimiter({ name, windowMs, max }: RateLimiterOptions): RateLimiter {
  const map = buckets(name);

  const recent = (key: string, now: number): number[] => {
    const bucket = map.get(key);
    if (!bucket) return [];
    const hits = bucket.hits.filter((at) => now - at < windowMs);
    if (hits.length === 0) map.delete(key);
    else bucket.hits = hits;
    return hits;
  };

  const evaluate = (key: string, now: number): RateLimitResult => {
    const hits = recent(key, now);
    if (hits.length < max) {
      return { allowed: true, retryAfterSeconds: 0, remaining: max - hits.length };
    }
    const oldest = hits[0];
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
      remaining: 0,
    };
  };

  const push = (key: string, now: number) => {
    const hits = recent(key, now);
    hits.push(now);
    map.set(key, { hits });
    // Keep the map bounded on a busy or hostile origin.
    if (map.size > 5000) {
      for (const [otherKey, bucket] of map) {
        if (bucket.hits.every((at) => now - at >= windowMs)) map.delete(otherKey);
      }
    }
  };

  return {
    blocked: (key) => evaluate(key, Date.now()),
    hit: (key) => {
      const now = Date.now();
      const result = evaluate(key, now);
      push(key, now);
      return result;
    },
    record: (key) => push(key, Date.now()),
    clear: (key) => map.delete(key),
  };
}
