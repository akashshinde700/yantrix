import { randomUUID } from "node:crypto";
import { DEFAULT_CONTENT } from "@/lib/content/defaults";
import type { CollectionKey, ContentItem, SiteContent } from "@/lib/content/types";

/*
 * Shared by the MySQL and JSON stores: turns whatever is stored into a
 * complete, current SiteContent. Stored content always wins; the defaults
 * only fill what the stored copy has never had, so a code update that adds
 * new fields, sections or seed data shows up on an existing database without
 * a manual migration — and nothing an admin saved is overwritten.
 */

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

/*
 * Values that earlier versions of the code shipped as defaults and that were
 * later improved. A stored value that still equals one of these was never
 * edited by an admin, so it follows the current default; anything an admin
 * typed is left alone.
 */
const LEGACY_DEFAULTS: [path: string, oldValue: string][] = [
  // the site is served on www; the bare domain only redirects
  ["settings.url", "https://yantrixtechnology.com"],
  ["seo.global.defaultTitle",
    "Yantrix Technology | IT Training Institute — Online & Offline Courses with Placement Assistance"],
  ["seo.global.defaultDescription",
    "Yantrix Technology is an IT training institute offering online and offline courses in Full Stack Development, Web Development, Python, Java, Data Analytics and more — with live projects and placement assistance."],
  ["seo.pages.home.title",
    "Yantrix Technology | IT Training Institute — Online & Offline Courses with Placement Assistance"],
  ["seo.pages.home.description",
    "Yantrix Technology is an IT training institute offering online and offline courses in Full Stack Development, Web Development, Python, Java, Data Analytics and more — with live projects and placement assistance."],
  ["seo.pages.courses.title",
    "IT Courses — Full Stack, Web Development, Python, Java & More | Yantrix Technology"],
  ["seo.pages.courses.description",
    "Explore career-oriented IT courses at Yantrix Technology: Full Stack Development, Web Development, Python, Java, Data Analytics, Digital Marketing, UI/UX Design and basic computer training. Online & offline batches with placement assistance."],
  ["seo.pages.about.title", "About Yantrix Technology — Practical IT Training Institute Since 2024"],
  ["seo.pages.about.description",
    "Yantrix Technology, founded in 2024, is an IT training institute focused on practical learning, live projects and career growth. Learn about our mission, vision and training approach."],
  ["seo.pages.contact.title", "Contact Yantrix Technology — Enquire About IT Courses & Admission"],
];

function getPath(root: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => (isObject(node) ? node[key] : undefined), root);
}

function setPath(root: unknown, path: string, value: unknown): void {
  const keys = path.split(".");
  const parent = getPath(root, keys.slice(0, -1).join("."));
  if (isObject(parent)) parent[keys[keys.length - 1]] = value;
}

function upgradeLegacyDefaults(content: SiteContent): void {
  for (const [path, oldValue] of LEGACY_DEFAULTS) {
    if (getPath(content, path) === oldValue) setPath(content, path, getPath(DEFAULT_CONTENT, path));
  }
}

/** Fields that identify the same record across seed data and stored data. */
const NATURAL_KEYS = ["slug", "name", "question", "title"] as const;

function sameRecord(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  for (const key of NATURAL_KEYS) {
    const left = a[key];
    const right = b[key];
    if (typeof left === "string" && typeof right === "string" && left) {
      return left.trim().toLowerCase() === right.trim().toLowerCase();
    }
  }
  return false;
}

/**
 * Fills fields a stored record has never had (the key is absent) from the
 * matching seed record. A field the admin cleared is still present (as "" or
 * []), so it stays cleared.
 */
function backfillRecord(
  stored: Record<string, unknown>,
  seeds: ContentItem[]
): Record<string, unknown> {
  const seed = seeds.find((candidate) => sameRecord(stored, candidate));
  if (!seed) return stored;
  const out = { ...stored };
  for (const [key, value] of Object.entries(seed)) {
    if (key === "id" || key === "sortOrder" || key === "active") continue;
    if (!(key in out)) out[key] = structuredClone(value);
  }
  return out;
}

export function normaliseContent(raw: unknown): SiteContent {
  const merged = mergeDeep<SiteContent>(DEFAULT_CONTENT, raw);
  upgradeLegacyDefaults(merged);
  const seeded = new Set<CollectionKey>(merged.seededCollections ?? []);

  for (const key of Object.keys(merged.collections) as CollectionKey[]) {
    const defaults = DEFAULT_CONTENT.collections[key];
    let list = merged.collections[key] as unknown;
    if (!Array.isArray(list)) list = defaults;
    // A collection that was never filled gets its seed data once. After that
    // it is marked, so an admin who deletes every item keeps an empty list.
    if ((list as unknown[]).length === 0 && defaults.length > 0 && !seeded.has(key)) {
      list = structuredClone(defaults);
    }
    merged.collections[key] = (list as unknown[]).map((entry, index) => {
      const record = backfillRecord(isObject(entry) ? entry : {}, defaults);
      return {
        ...record,
        id: typeof record.id === "string" && record.id ? record.id : randomUUID(),
        sortOrder: Number(record.sortOrder ?? index + 1),
        active: record.active !== false,
      } as ContentItem;
    }) as SiteContent["collections"][CollectionKey];
    if (merged.collections[key].length > 0) seeded.add(key);
  }

  merged.seededCollections = [...seeded];
  return merged;
}
