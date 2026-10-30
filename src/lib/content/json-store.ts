/**
 * File-backed data store for the website content, enquiries and admin users.
 *
 * Why a JSON store instead of a database?
 *  - This site is a single small institute website; a JSON document is more
 *    than enough and needs zero infrastructure.
 *  - It works out of the box on any host / container, including read-only
 *    filesystems (the store then degrades to in-memory defaults).
 *
 * The store is designed to be swapped for Postgres/Supabase later: every
 * access goes through the small set of helpers exported here.
 *
 * ⚠️ Server-only module (uses `node:fs`).
 */

import { promises as fs } from "node:fs";
import path from "node:path";
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

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");

const FILES = {
  content: path.join(DATA_DIR, "site-content.json"),
  enquiries: path.join(DATA_DIR, "enquiries.json"),
  admins: path.join(DATA_DIR, "admins.json"),
  audit: path.join(DATA_DIR, "audit-log.json"),
} as const;

type FileKey = keyof typeof FILES;

/** Serialises writes per file so concurrent admin actions cannot corrupt data. */
const writeQueue = new Map<FileKey, Promise<unknown>>();

const memoryCache = new Map<FileKey, unknown>();

let dirReady = false;
let storageWritable = true;

async function ensureDir(): Promise<boolean> {
  if (dirReady) return storageWritable;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    storageWritable = true;
  } catch {
    storageWritable = false;
    console.warn(
      `[store] Data directory "${DATA_DIR}" is not writable — using in-memory storage for this process.`
    );
  }
  dirReady = true;
  return storageWritable;
}

async function readJson<T>(key: FileKey, fallback: T): Promise<T> {
  const writable = await ensureDir();
  if (!writable) {
    return (memoryCache.get(key) as T | undefined) ?? fallback;
  }
  try {
    const raw = await fs.readFile(FILES[key], "utf8");
    const parsed = JSON.parse(raw) as T;
    memoryCache.set(key, parsed);
    return parsed;
  } catch {
    return (memoryCache.get(key) as T | undefined) ?? fallback;
  }
}

async function writeJson<T>(key: FileKey, data: T): Promise<void> {
  memoryCache.set(key, data);
  const writable = await ensureDir();
  if (!writable) return;

  const previous = writeQueue.get(key) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(async () => {
      const tmp = `${FILES[key]}.${process.pid}.${Date.now()}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
      await fs.rename(tmp, FILES[key]);
    });
  writeQueue.set(key, next);
  await next;
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

export async function getContent(): Promise<SiteContent> {
  const stored = await readJson<unknown>(  "content",
    null
  );
  if (!stored) {
    const seeded = normaliseContent(DEFAULT_CONTENT);
    await writeJson("content", seeded);
    return seeded;
  }
  return normaliseContent(stored);
}

export async function saveContent(content: SiteContent): Promise<SiteContent> {
  const next = normaliseContent({
    ...content,
    version: (content.version ?? 1) + 1,
    updatedAt: new Date().toISOString(),
  });
  await writeJson("content", next);
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

export async function getEnquiries(): Promise<Enquiry[]> {
  const list = await readJson<Enquiry[]>("enquiries", []);
  return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
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
  const list = await readJson<Enquiry[]>("enquiries", []);
  list.unshift(enquiry);
  await writeJson("enquiries", list);
  return enquiry;
}

export async function updateEnquiry(
  id: string,
  patch: Partial<Pick<Enquiry, "status" | "notes">>
): Promise<Enquiry | null> {
  const list = await readJson<Enquiry[]>("enquiries", []);
  const index = list.findIndex((e) => e.id === id);
  if (index === -1) return null;
  list[index] = { ...list[index], ...patch, updatedAt: new Date().toISOString() };
  await writeJson("enquiries", list);
  return list[index];
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  const list = await readJson<Enquiry[]>("enquiries", []);
  const next = list.filter((e) => e.id !== id);
  if (next.length === list.length) return false;
  await writeJson("enquiries", next);
  return true;
}

/* ─────────────────────────── admin users ─────────────────────────── */

/* uploaded images: DATA_DIR/media/<id> (+ .type sidecar holding the MIME type) */

export async function saveMedia(id: string, mime: string, data: Buffer): Promise<void> {
  const dir = path.join(DATA_DIR, "media");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, id), data);
  await fs.writeFile(path.join(dir, `${id}.type`), mime, "utf8");
}

export async function getMedia(id: string): Promise<{ mime: string; data: Buffer } | null> {
  const dir = path.join(DATA_DIR, "media");
  try {
    const [data, mime] = await Promise.all([fs.readFile(path.join(dir, id)), fs.readFile(path.join(dir, `${id}.type`), "utf8")]);
    return { mime, data };
  } catch {
    return null;
  }
}

export async function getAdmins(): Promise<AdminAccount[]> {
  return readJson<AdminAccount[]>("admins", []);
}

export async function saveAdmins(admins: AdminAccount[]): Promise<void> {
  await writeJson("admins", admins);
}

/* ─────────────────────────── audit log ─────────────────────────── */

const AUDIT_LIMIT = 300;

export async function addAuditEntry(
  entry: Omit<AdminAuditEntry, "id" | "createdAt">
): Promise<void> {
  const log = await readJson<AdminAuditEntry[]>("audit", []);
  log.unshift({ ...entry, id: randomUUID(), createdAt: new Date().toISOString() });
  await writeJson("audit", log.slice(0, AUDIT_LIMIT));
}

export async function getAuditLog(): Promise<AdminAuditEntry[]> {
  return readJson<AdminAuditEntry[]>("audit", []);
}

export { DATA_DIR };
