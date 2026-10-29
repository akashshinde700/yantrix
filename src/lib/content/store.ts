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
import type { AdminAccount, AdminAuditEntry, Enquiry, SiteContent } from "@/lib/content/types";

type Backend = "mysql" | "json";

const MODE = (process.env.CONTENT_STORE ?? "auto").toLowerCase();

let backend: Backend = MODE === "json" ? "json" : "mysql";
let warned = false;
let reachable: Promise<boolean> | null = null;

/**
 * Cheap TCP probe before the first query. Connecting through the driver when
 * nothing listens produced an `AggregateError` that Next's dev server logged as
 * an uncaught exception and that stalled the first render, so ask the socket
 * layer first — it fails in microseconds.
 */
function mysqlReachable(): Promise<boolean> {
  reachable ??= new Promise<boolean>((resolve) => {
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
  return reachable;
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
  if (warned) return;
  warned = true;
  const message = error instanceof Error ? error.message : String(error);
  console.warn(
    `[store] MySQL unavailable (${message.slice(0, 160)}). ` +
      "Falling back to the JSON file store in ./data for this process. " +
      "Set CONTENT_STORE=mysql to make database errors fatal."
  );
}

async function run<T>(onMysql: () => Promise<T>, onJson: () => Promise<T>): Promise<T> {
  if (backend === "json") return onJson();
  if (!(await mysqlReachable())) {
    warnOnce(new Error("connection refused"));
    backend = "json";
    return onJson();
  }
  try {
    return await onMysql();
  } catch (error) {
    if (MODE !== "auto" || !isUnreachable(error)) throw error;
    warnOnce(error);
    backend = "json";
    return onJson();
  }
}

/* ─────────────────────────── content ─────────────────────────── */

export function getContent(): Promise<SiteContent> {
  return run(mysqlStore.getContent, jsonStore.getContent);
}

export function saveContent(content: SiteContent): Promise<SiteContent> {
  return run(
    () => mysqlStore.saveContent(content),
    () => jsonStore.saveContent(content)
  );
}

export function updateContent(
  mutator: (current: SiteContent) => SiteContent | Promise<SiteContent>
): Promise<SiteContent> {
  return run(
    () => mysqlStore.updateContent(mutator),
    () => jsonStore.updateContent(mutator)
  );
}

export function resetContent(): Promise<SiteContent> {
  return run(mysqlStore.resetContent, jsonStore.resetContent);
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

/* ─────────────────────────── admin users ─────────────────────────── */

export function getAdmins(): Promise<AdminAccount[]> {
  return run(mysqlStore.getAdmins, jsonStore.getAdmins);
}

export function saveAdmins(admins: AdminAccount[]): Promise<void> {
  return run(
    () => mysqlStore.saveAdmins(admins),
    () => jsonStore.saveAdmins(admins)
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
