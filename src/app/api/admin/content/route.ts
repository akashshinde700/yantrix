import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { canWrite, getSessionAdmin } from "@/lib/admin/auth";
import {
  addAuditEntry,
  getContent,
  resetContent,
  updateContent,
} from "@/lib/content/store";
import { COLLECTION_KEYS, type CollectionKey, type SiteContent } from "@/lib/content/types";

export const dynamic = "force-dynamic";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Merge `patch` into `base` without dropping untouched keys. */
function mergeDeep<T>(base: T, patch: unknown): T {
  if (!isObject(patch) || !isObject(base)) {
    return (patch === undefined ? base : patch) as T;
  }
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(patch)) {
    const current = (base as Record<string, unknown>)[key];
    if (isObject(value) && isObject(current)) {
      result[key] = mergeDeep(current, value);
    } else if (Array.isArray(value)) {
      result[key] = value;
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

/**
 * Strip anything that is not JSON data (functions, Dates, class instances…) and
 * cap the nesting depth. Previously this was a *type* whitelist that dropped
 * every object-valued field silently — the moment an item gained something like
 * `stats: [{ label, value }]`, saving would have wiped it with a success toast.
 */
const MAX_ITEM_DEPTH = 4;

function sanitiseValue(value: unknown, depth = 0): unknown {
  if (depth > MAX_ITEM_DEPTH) return undefined;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (value === null) return null;
  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitiseValue(entry, depth + 1))
      .filter((entry) => entry !== undefined);
  }
  if (isObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      const clean = sanitiseValue(entry, depth + 1);
      if (clean !== undefined) out[key] = clean;
    }
    return out;
  }
  return undefined;
}

function sanitiseItem(raw: unknown, fallbackOrder: number) {
  const source = isObject(raw) ? raw : {};
  const item = sanitiseValue(source) as Record<string, unknown>;
  delete item.id; // ids are assigned by the store, never by the client
  item.sortOrder = Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : fallbackOrder;
  item.active = item.active !== false;
  return item;
}

function isCollectionKey(value: unknown): value is CollectionKey {
  return typeof value === "string" && (COLLECTION_KEYS as readonly string[]).includes(value);
}

export async function GET() {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401 });
  }
  const content = await getContent();
  return NextResponse.json({ ok: true, content });
}

export async function POST(request: NextRequest) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401 });
  }
  if (!canWrite(admin.role)) {
    return NextResponse.json(
      { ok: false, error: "Your account has read-only access." },
      { status: 403 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const op = String(body.op ?? "");

  try {
    if (op === "updateSettings" || op === "updateSeo" || op === "updateSections" || op === "updatePages") {
      const keyMap = {
        updateSettings: "settings",
        updateSeo: "seo",
        updateSections: "sections",
        updatePages: "pages",
      } as const;
      const key = keyMap[op as keyof typeof keyMap];
      const content = await updateContent((current) => {
        const next = { ...current } as SiteContent;
        (next[key] as unknown) = mergeDeep(
          current[key] as unknown,
          isObject(body.value) ? body.value : {}
        );
        return next;
      });
      await addAuditEntry({ actorEmail: admin.email, action: op, target: key });
      return NextResponse.json({ ok: true, content });
    }

    if (op === "createItem") {
      if (!isCollectionKey(body.collection)) {
        return NextResponse.json({ ok: false, error: "Unknown collection." }, { status: 400 });
      }
      const collection = body.collection;
      const content = await updateContent((current) => {
        const list = current.collections[collection];
        const maxOrder = list.reduce((max, item) => Math.max(max, item.sortOrder), 0);
        const item = sanitiseItem(body.item, maxOrder + 1);
        current.collections[collection] = [
          ...list,
          { ...item, id: randomUUID() } as (typeof list)[number],
        ];
        return current;
      });
      await addAuditEntry({ actorEmail: admin.email, action: "createItem", target: collection });
      return NextResponse.json({ ok: true, content });
    }

    if (op === "updateItem") {
      if (!isCollectionKey(body.collection) || typeof body.id !== "string") {
        return NextResponse.json({ ok: false, error: "Unknown collection or item." }, { status: 400 });
      }
      const collection = body.collection;
      const id = body.id;
      const content = await updateContent((current) => {
        current.collections[collection] = current.collections[collection].map((item) =>
          item.id === id
            ? ({ ...item, ...sanitiseItem({ ...item, ...(isObject(body.item) ? body.item : {}) }, item.sortOrder) } as typeof item)
            : item
        );
        return current;
      });
      await addAuditEntry({ actorEmail: admin.email, action: "updateItem", target: collection });
      return NextResponse.json({ ok: true, content });
    }

    if (op === "deleteItem") {
      if (!isCollectionKey(body.collection) || typeof body.id !== "string") {
        return NextResponse.json({ ok: false, error: "Unknown collection or item." }, { status: 400 });
      }
      const collection = body.collection;
      const id = body.id;
      const content = await updateContent((current) => {
        current.collections[collection] = current.collections[collection].filter(
          (item) => item.id !== id
        );
        return current;
      });
      await addAuditEntry({ actorEmail: admin.email, action: "deleteItem", target: collection });
      return NextResponse.json({ ok: true, content });
    }

    if (op === "moveItem") {
      if (!isCollectionKey(body.collection) || typeof body.id !== "string") {
        return NextResponse.json({ ok: false, error: "Unknown collection or item." }, { status: 400 });
      }
      const collection = body.collection;
      const id = body.id;
      const direction = body.direction === "up" ? -1 : 1;
      const content = await updateContent((current) => {
        const list = [...current.collections[collection]].sort((a, b) => a.sortOrder - b.sortOrder);
        const index = list.findIndex((item) => item.id === id);
        const target = index + direction;
        if (index === -1 || target < 0 || target >= list.length) return current;
        [list[index], list[target]] = [list[target], list[index]];
        current.collections[collection] = list.map((item, i) => ({ ...item, sortOrder: i + 1 }));
        return current;
      });
      await addAuditEntry({ actorEmail: admin.email, action: "moveItem", target: collection });
      return NextResponse.json({ ok: true, content });
    }

    if (op === "reset") {
      const content = await resetContent();
      await addAuditEntry({ actorEmail: admin.email, action: "resetContent", target: "content" });
      return NextResponse.json({ ok: true, content });
    }

    return NextResponse.json({ ok: false, error: `Unknown operation "${op}".` }, { status: 400 });
  } catch (error) {
    // A short reference ties the opaque message in the UI to the server log,
    // so "it fails sometimes" becomes one grep without leaking internals.
    const ref = randomUUID().slice(0, 8);
    console.error(`[/api/admin/content] ${ref}`, { op, error });
    return NextResponse.json(
      { ok: false, error: `Could not save changes. Reference ${ref}.` },
      { status: 500 }
    );
  }
}
