/**
 * Content store façade.
 *
 * Two backends implement the same API:
 *   - `mysql-store.ts`  MySQL, the production default (`DATABASE_URL`)
 *   - `json-store.ts`   JSON files under `data/`, used for local work
 *
 * `CONTENT_STORE` controls the behaviour:
 *   - `auto` (default) — MySQL, falling back to JSON files whenever the
 *     database cannot be reached (fresh checkout, CI, `next build` without a
 *     database, preview sandboxes). The fallback is logged once so it is never
 *     silent, and is sticky for the lifetime of the process.
 *   - `mysql` — MySQL only; connection problems surface as errors. Use this in
 *     production so a misconfigured database fails loudly instead of quietly
 *     writing to local files.
 *   - `json` — file store only (handy for offline development).
 *
 * ⚠️ Server-only module.
 */

import net from "node:net";
import * as mysqlStore from "@/lib/content/mysql-store";
import * as jsonStore from "@/lib/content/json-store";
import type {
  AdminAccount,
  AdminAuditEntry,
  AdminPatch,
  Enquiry,
  SiteContent,
} from "@/lib/content/types";

type Backend = "mysql" | "json";

const MODE = (process.env.CONTENT_STORE ?? "auto").toLowerCase();

/**
 * Every latch lives on globalThis, not in module scope.
 *
 * Next bundles pages and API routes as separate module instances, so a
 * module-level `backend` could latch to JSON in the page bundle while the API
 * bundle stayed on MySQL — the site would render content that admin saves never
 * reach. The content cache below already had to be global for the same reason.
 */
const state = globalThis as unknown as {
  yantrixBackend?: Backend;
  yantrixReachable?: Promise<boolean> | null;
  yantrixStoreWarned?: boolean;
  yantrixContentCache?: { value: SiteContent; at: number; generation: number } | null;
  yantrixContentPending?: Promise<SiteContent> | null;
  yantrixContentGeneration?: number;
};

function currentBackend(): Backend {
  state.yantrixBackend ??= MODE === "json" ? "json" : "mysql";
  return state.yantrixBackend;
}

function setBackend(next: Backend) {
  state.yantrixBackend = next;
}

/**
 * Cheap TCP probe before the first query. Connecting through the driver when
 * nothing listens produced an `AggregateError` that Next's dev server logged as
 * an uncaught exception and that stalled the first render, so ask the socket
 * layer first — it fails in microseconds.
 */
function probeMysql(): Promise<boolean> {
  state.yantrixReachable ??= new Promise<boolean>((resolve) => {
    let url: URL;
    try {
      url = new URL(process.env.DATABASE_URL ?? "mysql://root:root@localhost:3306/yantrix");
    } catch {
      resolve(false);
      return;
    }
    const socket = net.connect({
      host: url.hostname || "localhost",
      port: Number(url.port || 3306),
    });
    const finish = (ok: boolean) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(1500, () => finish(false));
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
  });
  return state.yantrixReachable;
}

/**
 * Probe, but only cache a *positive* result. A database that was briefly
 * unavailable at boot must be picked up again rather than being written off for
 * the lifetime of the process.
 */
async function mysqlReachable(): Promise<boolean> {
  const ok = await probeMysql();
  if (!ok) state.yantrixReachable = null;
  return ok;
}

/** Errors that mean "the database is not there", not "the query is wrong". */
const UNREACHABLE = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EPIPE",
  "ER_ACCESS_DENIED_ERROR",
  "ER_BAD_DB_ERROR",
  "ER_CON_COUNT_ERROR",
]);

function isUnreachable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: unknown }).code;
  if (typeof code === "string" && UNREACHABLE.has(code)) return true;
  // Node aggregates connection attempts (IPv6 + IPv4) into one error.
  const nested = (error as { errors?: unknown[] }).errors;
  return Array.isArray(nested) && nested.some(isUnreachable);
}

function warnOnce(error: unknown) {
  if (state.yantrixStoreWarned) return;
  state.yantrixStoreWarned = true;
  const message = error instanceof Error ? error.message : String(error);
  console.warn(
    `[store] MySQL unavailable (${message.slice(0, 160)}). ` +
      "Falling back to the JSON file store in ./data for this process. " +
      "Set CONTENT_STORE=mysql to make database errors fatal."
  );
}

async function run<T>(onMysql: () => Promise<T>, onJson: () => Promise<T>): Promise<T> {
  if (currentBackend() === "json") {
    // While latched to JSON, keep testing the database so a recovered one is used again.
    if (MODE === "mysql") return onJson();
    if (await mysqlReachable()) {
      setBackend("mysql");
      state.yantrixStoreWarned = false;
    } else {
      return onJson();
    }
  }
  if (!(await mysqlReachable())) {
    warnOnce(new Error("connection refused"));
    setBackend("json");
    return onJson();
  }
  try {
    return await onMysql();
  } catch (error) {
    if (MODE !== "auto" || !isUnreachable(error)) throw error;
    warnOnce(error);
    setBackend("json");
    return onJson();
  }
}

/* ─────────────────────────── content ─────────────────────────── */

/*
 * Site content is read by the layout, the page, metadata, sitemap… several
 * times per request and changes only when an admin saves. Keep it in memory
 * for a short time (and share in-flight reads); every write refreshes it, so
 * admin edits still show up immediately.
 */
const CONTENT_TTL_MS = 30_000;

// One cache per server process, on globalThis: Next bundles API routes and
// pages as separate module instances, so a module-level cache would let an
// admin save refresh only the API's copy while pages kept serving stale content.

/**
 * Bumped by every write. A read that started before the write compares its
 * generation on completion and declines to populate the cache if a write has
 * landed since — otherwise a slow read could resurrect the previous document
 * for a whole TTL right after an admin saved.
 */
function generation(): number {
  return (state.yantrixContentGeneration ??= 0);
}

function remember(value: SiteContent, readGeneration: number): SiteContent {
  if (readGeneration === generation()) {
    state.yantrixContentCache = { value, at: Date.now(), generation: readGeneration };
  }
  return value;
}

function invalidate(): void {
  state.yantrixContentGeneration = generation() + 1;
  state.yantrixContentCache = null;
}

export function getContent(): Promise<SiteContent> {
  const cached = state.yantrixContentCache;
  if (cached && cached.generation === generation() && Date.now() - cached.at < CONTENT_TTL_MS) {
    return Promise.resolve(cached.value);
  }
  const readGeneration = generation();
  state.yantrixContentPending ??= run(mysqlStore.getContent, jsonStore.getContent)
    .then((value) => remember(value, readGeneration))
    .finally(() => {
      state.yantrixContentPending = null;
    });
  return state.yantrixContentPending;
}

export function saveContent(content: SiteContent): Promise<SiteContent> {
  invalidate();
  return run(
    () => mysqlStore.saveContent(content),
    () => jsonStore.saveContent(content)
  ).then((value) => remember(value, generation()));
}

export function updateContent(
  mutator: (current: SiteContent) => SiteContent | Promise<SiteContent>
): Promise<SiteContent> {
  invalidate();
  return run(
    () => mysqlStore.updateContent(mutator),
    () => jsonStore.updateContent(mutator)
  ).then((value) => remember(value, generation()));
}

export function resetContent(): Promise<SiteContent> {
  invalidate();
  return run(mysqlStore.resetContent, jsonStore.resetContent).then((value) =>
    remember(value, generation())
  );
}

/* ─────────────────────────── enquiries ─────────────────────────── */

export function getEnquiries(): Promise<Enquiry[]> {
  return run(mysqlStore.getEnquiries, jsonStore.getEnquiries);
}

export function addEnquiry(
  input: Pick<Enquiry, "name" | "email" | "mobile" | "course" | "message"> & {
    source?: string;
  }
): Promise<Enquiry> {
  return run(
    () => mysqlStore.addEnquiry(input),
    () => jsonStore.addEnquiry(input)
  );
}

export function updateEnquiry(
  id: string,
  patch: Partial<Pick<Enquiry, "status" | "notes">>
): Promise<Enquiry | null> {
  return run(
    () => mysqlStore.updateEnquiry(id, patch),
    () => jsonStore.updateEnquiry(id, patch)
  );
}

export function deleteEnquiry(id: string): Promise<boolean> {
  return run(
    () => mysqlStore.deleteEnquiry(id),
    () => jsonStore.deleteEnquiry(id)
  );
}

/* ─────────────────────────── media ─────────────────────────── */

export function saveMedia(id: string, mime: string, data: Buffer): Promise<void> {
  return run(
    () => mysqlStore.saveMedia(id, mime, data),
    () => jsonStore.saveMedia(id, mime, data)
  );
}

export function getMedia(id: string): Promise<{ mime: string; data: Buffer } | null> {
  return run(
    () => mysqlStore.getMedia(id),
    () => jsonStore.getMedia(id)
  );
}

/* ─────────────────────────── admin users ─────────────────────────── */

export function getAdmins(): Promise<AdminAccount[]> {
  return run(mysqlStore.getAdmins, jsonStore.getAdmins);
}

/** Insert one account. `false` means the email is already in use. */
export function createAdmin(admin: AdminAccount): Promise<boolean> {
  return run(
    () => mysqlStore.createAdmin(admin),
    () => jsonStore.createAdmin(admin)
  );
}

export function updateAdmin(id: string, patch: AdminPatch): Promise<AdminAccount | null> {
  return run(
    () => mysqlStore.updateAdmin(id, patch),
    () => jsonStore.updateAdmin(id, patch)
  );
}

export function deleteAdmin(id: string): Promise<boolean> {
  return run(
    () => mysqlStore.deleteAdmin(id),
    () => jsonStore.deleteAdmin(id)
  );
}

/* ─────────────────────────── audit log ─────────────────────────── */

export function addAuditEntry(
  entry: Omit<AdminAuditEntry, "id" | "createdAt">
): Promise<void> {
  return run(
    () => mysqlStore.addAuditEntry(entry),
    () => jsonStore.addAuditEntry(entry)
  );
}

export function getAuditLog(): Promise<AdminAuditEntry[]> {
  return run(mysqlStore.getAuditLog, jsonStore.getAuditLog);
}
