/**
 * MySQL-backed data store for the website content, enquiries and admin users.
 *
 * Tables (created automatically on first use):
 *  - site_content : single row holding the whole SiteContent JSON document
 *  - enquiries    : contact-form submissions
 *  - admins       : admin panel accounts
 *  - audit_log    : admin actions (capped at AUDIT_LIMIT rows)
 *
 * Connection comes from DATABASE_URL, e.g.
 *   mysql://root:root@localhost:3306/yantrix
 *
 * Every access goes through the small set of helpers exported here.
 *
 * ⚠️ Server-only module.
 */

import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";
import { randomUUID } from "node:crypto";
import { DEFAULT_CONTENT } from "@/lib/content/defaults";
import type {
  AdminAccount,
  AdminAuditEntry,
  CollectionKey,
  ContentItem,
  Enquiry,
  SiteContent,
} from "@/lib/content/types";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "mysql://root:root@localhost:3306/yantrix";

/* ─────────────────────────── connection ─────────────────────────── */

// Reuse the pool across hot reloads in dev.
const globalForDb = globalThis as unknown as {
  yantrixPool?: Pool;
  yantrixSchema?: Promise<void>;
  /** which SCHEMA the cached promise ran — a changed schema re-runs (new tables appear without a restart) */
  yantrixSchemaKey?: string;
};

function pool(): Pool {
  if (!globalForDb.yantrixPool) {
    const created = mysql.createPool({
      uri: DATABASE_URL,
      connectionLimit: 10,
      timezone: "Z",
      dateStrings: false,
      // Fail fast: the store façade falls back to the JSON file store when the
      // database is not there, so a request must not hang for 10s first.
      connectTimeout: 2000,
    });
    // Idle connections can be dropped by the server; without a listener the
    // pool re-emits that error and Node treats it as uncaught.
    (created as unknown as NodeJS.EventEmitter).on("error", (error: unknown) => {
      console.warn(`[store] MySQL pool error: ${String(error).slice(0, 160)}`);
    });
    globalForDb.yantrixPool = created;
  }
  return globalForDb.yantrixPool;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS site_content (
     id TINYINT PRIMARY KEY,
     data JSON NOT NULL,
     updated_at DATETIME(3) NOT NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS enquiries (
     id VARCHAR(36) PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL,
     mobile VARCHAR(50) NOT NULL,
     course VARCHAR(255) NOT NULL,
     message TEXT NULL,
     status VARCHAR(20) NOT NULL DEFAULT 'new',
     notes TEXT NOT NULL,
     source VARCHAR(50) NOT NULL DEFAULT 'website',
     created_at DATETIME(3) NOT NULL,
     updated_at DATETIME(3) NOT NULL,
     INDEX idx_enquiries_created (created_at)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS admins (
     id VARCHAR(36) PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL UNIQUE,
     password_hash VARCHAR(255) NOT NULL,
     role VARCHAR(20) NOT NULL,
     active TINYINT(1) NOT NULL DEFAULT 1,
     created_at DATETIME(3) NOT NULL,
     last_login_at DATETIME(3) NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS audit_log (
     id VARCHAR(36) PRIMARY KEY,
     actor_email VARCHAR(255) NOT NULL,
     action VARCHAR(100) NOT NULL,
     target VARCHAR(255) NOT NULL,
     created_at DATETIME(3) NOT NULL,
     INDEX idx_audit_created (created_at)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS media (
     id VARCHAR(36) PRIMARY KEY,
     mime VARCHAR(60) NOT NULL,
     data MEDIUMBLOB NOT NULL,
     created_at DATETIME(3) NOT NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

const SCHEMA_KEY = `${SCHEMA.length}:${SCHEMA.join("").length}`;

async function db(): Promise<Pool> {
  if (globalForDb.yantrixSchemaKey !== SCHEMA_KEY) {
    globalForDb.yantrixSchema = undefined;
    globalForDb.yantrixSchemaKey = SCHEMA_KEY;
  }
  if (!globalForDb.yantrixSchema) {
    globalForDb.yantrixSchema = (async () => {
      for (const statement of SCHEMA) await pool().query(statement);
    })().catch((error) => {
      globalForDb.yantrixSchema = undefined;
      throw error;
    });
  }
  await globalForDb.yantrixSchema;
  return pool();
}

/** ISO string → JS Date for DATETIME columns. */
function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null;
}

function toIso(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

/* ─────────────────────────── content ─────────────────────────── */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Deep-merges stored content over the defaults so new fields never break old data. */
function mergeDeep<T>(defaults: T, stored: unknown): T {
  if (Array.isArray(defaults)) {
    return (Array.isArray(stored) ? stored : defaults) as T;
  }
  if (isObject(defaults)) {
    if (!isObject(stored)) return defaults;
    const out: Record<string, unknown> = { ...defaults };
    for (const key of Object.keys(defaults)) {
      out[key] = mergeDeep(
        (defaults as Record<string, unknown>)[key],
        (stored as Record<string, unknown>)[key]
      );
    }
    // keep unknown keys from old data? no — schema is the source of truth
    return out as T;
  }
  return (stored === undefined || stored === null ? defaults : stored) as T;
}

function normaliseContent(raw: unknown): SiteContent {
  const merged = mergeDeep<SiteContent>(DEFAULT_CONTENT, raw);

  // Collections: ensure every item has an id / sortOrder / active flag
  for (const key of Object.keys(merged.collections) as CollectionKey[]) {
    const list = merged.collections[key];
    if (!Array.isArray(list)) {
      merged.collections[key] = DEFAULT_CONTENT.collections[key];
      continue;
    }
    merged.collections[key] = list.map((entry, index) => {
      const record: Record<string, unknown> = isObject(entry) ? entry : {};
      return {
        ...record,
        id: typeof record.id === "string" && record.id ? record.id : randomUUID(),
        sortOrder: Number(record.sortOrder ?? index + 1),
        active: record.active !== false,
      } as ContentItem;
    }) as SiteContent["collections"][CollectionKey];
  }
  return merged;
}

async function writeContent(content: SiteContent): Promise<void> {
  const conn = await db();
  await conn.query(
    `INSERT INTO site_content (id, data, updated_at) VALUES (1, ?, ?)
     ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)`,
    [JSON.stringify(content), new Date()]
  );
}

export async function getContent(): Promise<SiteContent> {
  const conn = await db();
  const [rows] = await conn.query<RowDataPacket[]>(
    "SELECT data FROM site_content WHERE id = 1"
  );
  if (rows.length === 0) {
    const seeded = normaliseContent(DEFAULT_CONTENT);
    await writeContent(seeded);
    return seeded;
  }
  const data = rows[0].data;
  return normaliseContent(typeof data === "string" ? JSON.parse(data) : data);
}

export async function saveContent(content: SiteContent): Promise<SiteContent> {
  const next = normaliseContent({
    ...content,
    version: (content.version ?? 1) + 1,
    updatedAt: new Date().toISOString(),
  });
  await writeContent(next);
  return next;
}

export async function updateContent(
  mutator: (current: SiteContent) => SiteContent | Promise<SiteContent>
): Promise<SiteContent> {
  const current = await getContent();
  const next = await mutator(structuredClone(current));
  return saveContent(next);
}

export async function resetContent(): Promise<SiteContent> {
  const fresh = normaliseContent(DEFAULT_CONTENT);
  return saveContent(fresh);
}

/* ─────────────────────────── enquiries ─────────────────────────── */

function rowToEnquiry(row: RowDataPacket): Enquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    mobile: row.mobile,
    course: row.course,
    message: row.message ?? null,
    status: row.status,
    notes: row.notes ?? "",
    source: row.source,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

export async function getEnquiries(): Promise<Enquiry[]> {
  const conn = await db();
  const [rows] = await conn.query<RowDataPacket[]>(
    "SELECT * FROM enquiries ORDER BY created_at DESC"
  );
  return rows.map(rowToEnquiry);
}

export async function addEnquiry(
  input: Pick<Enquiry, "name" | "email" | "mobile" | "course" | "message"> & {
    source?: string;
  }
): Promise<Enquiry> {
  const now = new Date().toISOString();
  const enquiry: Enquiry = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    mobile: input.mobile,
    course: input.course,
    message: input.message ?? null,
    status: "new",
    notes: "",
    source: input.source ?? "website",
    createdAt: now,
    updatedAt: now,
  };
  const conn = await db();
  await conn.query(
    `INSERT INTO enquiries
       (id, name, email, mobile, course, message, status, notes, source, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      enquiry.id,
      enquiry.name,
      enquiry.email,
      enquiry.mobile,
      enquiry.course,
      enquiry.message,
      enquiry.status,
      enquiry.notes,
      enquiry.source,
      toDate(enquiry.createdAt),
      toDate(enquiry.updatedAt),
    ]
  );
  return enquiry;
}

export async function updateEnquiry(
  id: string,
  patch: Partial<Pick<Enquiry, "status" | "notes">>
): Promise<Enquiry | null> {
  const conn = await db();
  const [rows] = await conn.query<RowDataPacket[]>(
    "SELECT * FROM enquiries WHERE id = ?",
    [id]
  );
  if (rows.length === 0) return null;
  const next: Enquiry = {
    ...rowToEnquiry(rows[0]),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await conn.query(
    "UPDATE enquiries SET status = ?, notes = ?, updated_at = ? WHERE id = ?",
    [next.status, next.notes, toDate(next.updatedAt), id]
  );
  return next;
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  const conn = await db();
  const [result] = await conn.query<mysql.ResultSetHeader>(
    "DELETE FROM enquiries WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

/* ─────────────────────────── media (uploaded images) ─────────────────────────── */

export async function saveMedia(id: string, mime: string, data: Buffer): Promise<void> {
  const conn = await db();
  await conn.query("INSERT INTO media (id, mime, data, created_at) VALUES (?, ?, ?, ?)", [id, mime, data, new Date()]);
}

export async function getMedia(id: string): Promise<{ mime: string; data: Buffer } | null> {
  const conn = await db();
  const [rows] = await conn.query<RowDataPacket[]>("SELECT mime, data FROM media WHERE id = ?", [id]);
  return rows.length ? { mime: rows[0].mime as string, data: rows[0].data as Buffer } : null;
}

/* ─────────────────────────── admin users ─────────────────────────── */

export async function getAdmins(): Promise<AdminAccount[]> {
  const conn = await db();
  const [rows] = await conn.query<RowDataPacket[]>(
    "SELECT * FROM admins ORDER BY created_at ASC"
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    active: Boolean(row.active),
    createdAt: toIso(row.created_at),
    lastLoginAt: row.last_login_at ? toIso(row.last_login_at) : null,
  }));
}

/** Replaces the full admin list (upserts given accounts, removes the rest). */
export async function saveAdmins(admins: AdminAccount[]): Promise<void> {
  const conn = await (await db()).getConnection();
  try {
    await conn.beginTransaction();
    const ids = admins.map((a) => a.id);
    if (ids.length > 0) {
      await conn.query("DELETE FROM admins WHERE id NOT IN (?)", [ids]);
    } else {
      await conn.query("DELETE FROM admins");
    }
    for (const a of admins) {
      await conn.query(
        `INSERT INTO admins
           (id, name, email, password_hash, role, active, created_at, last_login_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name), email = VALUES(email),
           password_hash = VALUES(password_hash), role = VALUES(role),
           active = VALUES(active), last_login_at = VALUES(last_login_at)`,
        [
          a.id,
          a.name,
          a.email,
          a.passwordHash,
          a.role,
          a.active ? 1 : 0,
          toDate(a.createdAt),
          toDate(a.lastLoginAt),
        ]
      );
    }
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/* ─────────────────────────── audit log ─────────────────────────── */

const AUDIT_LIMIT = 300;

export async function addAuditEntry(
  entry: Omit<AdminAuditEntry, "id" | "createdAt">
): Promise<void> {
  const conn = await db();
  await conn.query(
    "INSERT INTO audit_log (id, actor_email, action, target, created_at) VALUES (?, ?, ?, ?, ?)",
    [randomUUID(), entry.actorEmail, entry.action, entry.target, new Date()]
  );
  await conn.query(
    `DELETE FROM audit_log WHERE id NOT IN (
       SELECT id FROM (
         SELECT id FROM audit_log ORDER BY created_at DESC LIMIT ?
       ) AS keep
     )`,
    [AUDIT_LIMIT]
  );
}

export async function getAuditLog(): Promise<AdminAuditEntry[]> {
  const conn = await db();
  const [rows] = await conn.query<RowDataPacket[]>(
    "SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?",
    [AUDIT_LIMIT]
  );
  return rows.map((row) => ({
    id: row.id,
    actorEmail: row.actor_email,
    action: row.action,
    target: row.target,
    createdAt: toIso(row.created_at),
  }));
}
