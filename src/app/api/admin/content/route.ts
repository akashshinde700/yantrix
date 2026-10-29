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

function sanitiseItem(raw: unknown, fallbackOrder: number) {
  const source = isObject(raw) ? raw : {};
  const item: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (key === "id") continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      item[key] = value;
    } else if (Array.isArray(value)) {
      item[key] = value.map((entry) => (typeof entry === "string" ? entry : String(entry)));
    }
  }
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
    console.error("[/api/admin/content]", error);
    return NextResponse.json({ ok: false, error: "Could not save changes." }, { status: 500 });
  }
}
