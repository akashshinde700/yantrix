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
  AdminPatch,
  CollectionKey,
  ContentItem,
  Enquiry,
  SiteContent,
} from "@/lib/content/types";

/**
 * Where the JSON documents live. `DATA_DIR` may point outside the project, so
 * the bundler cannot scope these reads statically and would otherwise trace the
 * whole repository into `.next/standalone`. The `turbopackIgnore` markers on the
 * fs calls below opt out of that; `public/` is copied by the build script.
 */
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

/**
 * Read one file. A missing file is normal (fresh checkout) and yields the
 * fallback; a corrupt or unreadable file is NOT — it must surface, otherwise the
 * next write silently persists the defaults over real data.
 */
async function readJson<T>(key: FileKey, fallback: T): Promise<T> {
  const writable = await ensureDir();
  if (!writable) {
    return (memoryCache.get(key) as T | undefined) ?? fallback;
  }
  let raw: string;
  try {
    raw = await fs.readFile(/* turbopackIgnore: true */ FILES[key], "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return (memoryCache.get(key) as T | undefined) ?? fallback;
    }
    console.error(`[store] cannot read ${FILES[key]}:`, error);
    throw error;
  }
  try {
    const parsed = JSON.parse(raw) as T;
    memoryCache.set(key, parsed);
    return parsed;
  } catch (error) {
    console.error(
      `[store] ${FILES[key]} is not valid JSON — refusing to overwrite it with defaults:`,
      error
    );
    throw error;
  }
}

async function writeJson<T>(key: FileKey, data: T): Promise<void> {
  memoryCache.set(key, data);
  const writable = await ensureDir();
  if (!writable) return;

  const tmp = `${FILES[key]}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(/* turbopackIgnore: true */ tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(/* turbopackIgnore: true */ tmp, FILES[key]);
}

/**
 * Read → mutate → write, serialised per file. Reads happen *inside* the queue:
 * doing them outside let two concurrent mutations start from the same snapshot
 * and silently drop one of the writes.
 */
async function mutateJson<T>(
  key: FileKey,
  fallback: T,
  mutate: (current: T) => T | Promise<T>
): Promise<T> {
  const previous = writeQueue.get(key) ?? Promise.resolve();
  const run = previous
    .catch(() => undefined)
    .then(async () => {
      const current = await readJson<T>(key, fallback);
      const next = await mutate(current);
      await writeJson(key, next);
      return next;
    });
  writeQueue.set(key, run);
  return run;
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

function withVersion(content: SiteContent): SiteContent {
  return normaliseContent({
    ...content,
    version: (content.version ?? 1) + 1,
    updatedAt: new Date().toISOString(),
  });
}

export async function getContent(): Promise<SiteContent> {
  const stored = await readJson<unknown>("content", null);
  if (!stored) {
    const seeded = normaliseContent(DEFAULT_CONTENT);
    await mutateJson<SiteContent | null>("content", null, (current) => current ?? seeded);
    return seeded;
  }
  return normaliseContent(stored);
}

export async function saveContent(content: SiteContent): Promise<SiteContent> {
  const next = withVersion(content);
  await writeJson("content", next);
  return next;
}

export async function updateContent(
  mutator: (current: SiteContent) => SiteContent | Promise<SiteContent>
): Promise<SiteContent> {
  // Read inside the queue: two admins saving different sections at the same
  // moment must not start from the same snapshot and lose one of the edits.
  return mutateJson<SiteContent | null>("content", null, async (stored) => {
    const current = stored ? normaliseContent(stored) : normaliseContent(DEFAULT_CONTENT);
    return withVersion(await mutator(structuredClone(current)));
  }) as Promise<SiteContent>;
}

export async function resetContent(): Promise<SiteContent> {
  const fresh = normaliseContent(DEFAULT_CONTENT);
  return saveContent(fresh);
}

/* ─────────────────────────── enquiries ─────────────────────────── */

export async function getEnquiries(): Promise<Enquiry[]> {
  const list = await readJson<Enquiry[]>("enquiries", []);
  // Copy before sorting: the cached array is shared and must not be reordered in place.
  return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
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
  await mutateJson<Enquiry[]>("enquiries", [], (list) => [enquiry, ...list]);
  return enquiry;
}

export async function updateEnquiry(
  id: string,
  patch: Partial<Pick<Enquiry, "status" | "notes">>
): Promise<Enquiry | null> {
  let updated: Enquiry | null = null;
  await mutateJson<Enquiry[]>("enquiries", [], (list) => {
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) return list;
    updated = { ...list[index], ...patch, updatedAt: new Date().toISOString() };
    return list.map((entry, i) => (i === index ? updated! : entry));
  });
  return updated;
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  let removed = false;
  await mutateJson<Enquiry[]>("enquiries", [], (list) => {
    const next = list.filter((e) => e.id !== id);
    removed = next.length !== list.length;
    return removed ? next : list;
  });
  return removed;
}

/* ─────────────────────────── admin users ─────────────────────────── */

/* uploaded images: DATA_DIR/media/<id> (+ .type sidecar holding the MIME type) */

export async function saveMedia(id: string, mime: string, data: Buffer): Promise<void> {
  const dir = path.join(DATA_DIR, "media");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(/* turbopackIgnore: true */ path.join(dir, id), data);
  await fs.writeFile(/* turbopackIgnore: true */ path.join(dir, `${id}.type`), mime, "utf8");
}

export async function getMedia(id: string): Promise<{ mime: string; data: Buffer } | null> {
  const dir = path.join(DATA_DIR, "media");
  try {
    const [data, mime] = await Promise.all([
      fs.readFile(/* turbopackIgnore: true */ path.join(dir, id)),
      fs.readFile(/* turbopackIgnore: true */ path.join(dir, `${id}.type`), "utf8"),
    ]);
    return { mime, data };
  } catch {
    return null;
  }
}

export async function getAdmins(): Promise<AdminAccount[]> {
  return readJson<AdminAccount[]>("admins", []);
}

/** Insert one account. Returns false when the email is already taken. */
export async function createAdmin(admin: AdminAccount): Promise<boolean> {
  let created = false;
  await mutateJson<AdminAccount[]>("admins", [], (list) => {
    const email = admin.email.toLowerCase();
    if (list.some((account) => account.email.toLowerCase() === email)) return list;
    created = true;
    return [...list, { ...admin, sessionVersion: admin.sessionVersion ?? 0 }];
  });
  return created;
}

/** Update only the fields present in the patch. */
export async function updateAdmin(id: string, patch: AdminPatch): Promise<AdminAccount | null> {
  let updated: AdminAccount | null = null;
  await mutateJson<AdminAccount[]>("admins", [], (list) =>
    list.map((account) => {
      if (account.id !== id) return account;
      updated = { ...account, ...patch };
      return updated;
    })
  );
  return updated;
}

export async function deleteAdmin(id: string): Promise<boolean> {
  let removed = false;
  await mutateJson<AdminAccount[]>("admins", [], (list) => {
    const next = list.filter((account) => account.id !== id);
    removed = next.length !== list.length;
    return removed ? next : list;
  });
  return removed;
}

/* ─────────────────────────── audit log ─────────────────────────── */

const AUDIT_LIMIT = 300;

export async function addAuditEntry(
  entry: Omit<AdminAuditEntry, "id" | "createdAt">
): Promise<void> {
  await mutateJson<AdminAuditEntry[]>("audit", [], (log) =>
    [{ ...entry, id: randomUUID(), createdAt: new Date().toISOString() }, ...log].slice(0, AUDIT_LIMIT)
  );
}

export async function getAuditLog(): Promise<AdminAuditEntry[]> {
  return readJson<AdminAuditEntry[]>("audit", []);
}

export { DATA_DIR };
