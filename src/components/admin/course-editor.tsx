"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  ExternalLink,
  Info,
  Layers,
  ListChecks,
  Loader2,
  MessageSquareQuote,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminPost } from "@/components/admin/api";
import { useAdminRole } from "@/components/admin/role-context";
import { ImageField } from "@/components/admin/image-field";
import { ContentIcon } from "@/components/site/content-icon";
import { ICON_NAMES } from "@/lib/content/icons";
import { slugify } from "@/lib/content/helpers";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/content/types";

/* ───────────────────────────── small helpers ───────────────────────────── */

type Values = Record<string, unknown>;

const asString = (value: unknown): string =>
  typeof value === "string" ? value : value === null || value === undefined ? "" : String(value);

const asList = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((entry) => asString(entry)) : [];

const asRecords = (value: unknown): Values[] =>
  Array.isArray(value)
    ? (value.filter(
        (entry) => entry && typeof entry === "object" && !Array.isArray(entry)
      ) as Values[])
    : [];

const linesToText = (value: unknown) => asList(value).join("\n");

function Field({
  label,
  hint,
  span = 1,
  children,
}: {
  label: string;
  hint?: string;
  span?: 1 | 2;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", span === 2 && "sm:col-span-2")}>
      <Label className="text-sm font-semibold">{label}</Label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Panel({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

/* ───────────────────────────── list editors ───────────────────────────── */

/** Editable list of plain strings (one row per value). */
function StringListEditor({
  items,
  onChange,
  placeholder,
  addLabel = "Add item",
  multiline = false,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  multiline?: boolean;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-muted-foreground">
          Nothing added yet.
        </p>
      ) : null}
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-1.5">
          {multiline ? (
            <Textarea
              rows={3}
              className="min-w-0 flex-1"
              value={item}
              placeholder={placeholder}
              onChange={(event) =>
                onChange(items.map((value, i) => (i === index ? event.target.value : value)))
              }
            />
          ) : (
            <Input
              className="min-w-0 flex-1"
              value={item}
              placeholder={placeholder}
              onChange={(event) =>
                onChange(items.map((value, i) => (i === index ? event.target.value : value)))
              }
            />
          )}
          <div className="flex shrink-0 flex-col gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title="Move up"
              disabled={index === 0}
              onClick={() => move(index, index - 1)}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive"
              title="Remove"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ""])}>
        <Plus className="mr-1 h-3.5 w-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}

/** One field inside a record row. */
interface RowField {
  key: string;
  label: string;
  type?: "text" | "textarea" | "list" | "select";
  placeholder?: string;
  span?: 1 | 2;
  /** Options for `type: "select"`. */
  options?: { label: string; value: string }[];
}

/** Editable list of small objects (tracks, modules, reviews, FAQs…). */
function RecordListEditor({
  items,
  onChange,
  fields,
  template,
  addLabel,
  itemLabel,
}: {
  items: Values[];
  onChange: (next: Values[]) => void;
  fields: RowField[];
  template: Values;
  addLabel: string;
  itemLabel: string;
}) {
  const update = (index: number, key: string, value: unknown) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-3 text-xs text-muted-foreground">
          Nothing added yet — use “{addLabel}” below.
        </p>
      ) : null}

      {items.map((item, index) => (
        <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs font-bold uppercase tracking-wider text-slate-500">
              {itemLabel} {index + 1}
              {fields[0] && asString(item[fields[0].key])
                ? ` · ${asString(item[fields[0].key])}`
                : ""}
            </p>
            <div className="flex shrink-0 items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Move up"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Move down"
                disabled={index === items.length - 1}
                onClick={() => move(index, index + 1)}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                title="Remove"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.key}
                className={cn(
                  "space-y-1.5",
                  (field.span === 2 || field.type === "textarea" || field.type === "list") &&
                    "sm:col-span-2"
                )}
              >
                <Label className="text-xs font-semibold text-slate-600">{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    rows={2}
                    value={asString(item[field.key])}
                    placeholder={field.placeholder}
                    onChange={(event) => update(index, field.key, event.target.value)}
                  />
                ) : field.type === "select" ? (
                  <Select
                    value={asString(item[field.key]) || field.options?.[0]?.value || ""}
                    onValueChange={(next) => update(index, field.key, next)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={field.placeholder ?? "Select…"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {(field.options ?? []).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "list" ? (
                  <StringListEditor
                    items={asList(item[field.key])}
                    onChange={(next) => update(index, field.key, next)}
                    placeholder={field.placeholder ?? "One item per line"}
                    addLabel="Add"
                  />
                ) : (
                  <Input
                    value={asString(item[field.key])}
                    placeholder={field.placeholder}
                    onChange={(event) => update(index, field.key, event.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...items, { ...template }])}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}

/* ───────────────────────────── tabs ───────────────────────────── */

const TABS = [
  { id: "basics", label: "Basics", icon: Info },
  { id: "content", label: "About & highlights", icon: BookOpen },
  { id: "projects", label: "Projects & extras", icon: Layers },
  { id: "curriculum", label: "Curriculum", icon: ListChecks },
  { id: "cohort", label: "Batches & placement", icon: Users },
  { id: "social", label: "Reviews & FAQs", icon: MessageSquareQuote },
  { id: "seo", label: "CTA & SEO", icon: Search },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ───────────────────────────── editor ───────────────────────────── */

/**
 * Full-page editor for one course (Admin → Courses → Add / Edit).
 *
 * Courses have a structured detail page — syllabus modules, tracks, reviews,
 * FAQs — which the generic key/value collection editor cannot express, so this
 * screen gives every block its own panel and repeatable row editor. Saving
 * writes the whole record through the same `/api/admin/content` endpoint
 * (`createItem` / `updateItem`), so roles, audit logging and validation are
 * unchanged.
 */
export function CourseEditor({
  initial,
  courseId,
  isNew,
}: {
  initial: Values;
  courseId?: string;
  isNew: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { canWrite } = useAdminRole();
  const [values, setValues] = useState<Values>(initial);
  const [tab, setTab] = useState<TabId>("basics");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  /** Set a value by key; `"trainer.name"`-style paths write nested objects. */
  const set = (key: string, value: unknown) => {
    setValues((current) => {
      if (!key.includes(".")) return { ...current, [key]: value };
      const keys = key.split(".");
      const clone: Values = { ...current };
      let cursor: Values = clone;
      keys.forEach((part, index) => {
        if (index === keys.length - 1) {
          cursor[part] = value;
          return;
        }
        const next = cursor[part] && typeof cursor[part] === "object" ? { ...(cursor[part] as Values) } : {};
        cursor[part] = next;
        cursor = next;
      });
      return clone;
    });
    setDirty(true);
  };

  const text = (key: string, placeholder?: string) => (
    <Input
      value={asString(values[key])}
      placeholder={placeholder}
      onChange={(event) => set(key, event.target.value)}
    />
  );

  const textarea = (key: string, placeholder?: string, rows = 3) => (
    <Textarea
      rows={rows}
      value={asString(values[key])}
      placeholder={placeholder}
      onChange={(event) => set(key, event.target.value)}
    />
  );

  const stringList = (key: string, placeholder?: string, addLabel?: string, multiline?: boolean) => (
    <StringListEditor
      items={asList(values[key])}
      onChange={(next) => set(key, next)}
      placeholder={placeholder}
      addLabel={addLabel}
      multiline={multiline}
    />
  );

  const title = asString(values.title);
  const slug = asString(values.slug);
  const previewSlug = slug || slugify(title);

  const curriculumCount = asRecords(values.curriculum).length;
  const topicCount = asRecords(values.curriculum).reduce(
    (sum, module) => sum + asList(module.topics).length,
    0
  );

  const summary = useMemo(
    () => ({
      learn: asList(values.learn).length || asList(values.highlights).length,
      tools: asList(values.tools).length,
      reviews: asRecords(values.reviews).length,
      faqs: asRecords(values.faqs).length,
      projects: asRecords(values.projects).length,
      miniProjects: asRecords(values.miniProjects).length,
      includes: asRecords(values.includes).length,
      batches: asRecords(values.batches).length,
    }),
    [values]
  );

  const save = async () => {
    if (!canWrite) {
      toast({
        variant: "destructive",
        title: "Read-only account",
        description: "Your account can view this course but not change it.",
      });
      return;
    }
    if (!title.trim()) {
      toast({ variant: "destructive", title: "Course name is required" });
      setTab("basics");
      return;
    }

    const payload: Values = {
      ...values,
      title: title.trim(),
      slug: previewSlug,
      description: asString(values.description).trim(),
      // Keep arrays well-formed even when the admin removed every row.
      modes: asList(values.modes).filter(Boolean),
      highlights: asList(values.highlights).filter(Boolean),
      heroStats: asList(values.heroStats).filter(Boolean),
      learn: asList(values.learn).filter(Boolean),
      tools: asList(values.tools).filter(Boolean),
      aboutParagraphs: asList(values.aboutParagraphs).filter(Boolean),
      curriculum: asRecords(values.curriculum)
        .map((module) => ({
          title: asString(module.title).trim(),
          topics: asList(module.topics).filter(Boolean),
        }))
        .filter((module) => module.title),
      tracks: asRecords(values.tracks)
        .map((track) => ({
          title: asString(track.title).trim(),
          subtitle: asString(track.subtitle).trim(),
          points: asList(track.points).filter(Boolean),
        }))
        .filter((track) => track.title),
      benefits: asRecords(values.benefits)
        .map((benefit) => ({
          title: asString(benefit.title).trim(),
          description: asString(benefit.description).trim(),
        }))
        .filter((benefit) => benefit.title || benefit.description),
      reviews: asRecords(values.reviews)
        .map((review) => ({
          name: asString(review.name).trim(),
          role: asString(review.role).trim(),
          quote: asString(review.quote).trim(),
        }))
        .filter((review) => review.name || review.quote),
      faqs: asRecords(values.faqs)
        .map((faq) => ({
          question: asString(faq.question).trim(),
          answer: asString(faq.answer).trim(),
        }))
        .filter((faq) => faq.question && faq.answer),
      includes: asRecords(values.includes)
        .map((item) => ({ label: asString(item.label).trim(), icon: asString(item.icon) || "Sparkles" }))
        .filter((item) => item.label),
      miniProjects: asRecords(values.miniProjects)
        .map((project) => ({
          title: asString(project.title).trim(),
          description: asString(project.description).trim(),
          image: asString(project.image),
        }))
        .filter((project) => project.title),
      projects: asRecords(values.projects)
        .map((project) => ({
          title: asString(project.title).trim(),
          description: asString(project.description).trim(),
          image: asString(project.image),
        }))
        .filter((project) => project.title),
      batches: asRecords(values.batches)
        .map((batch) => ({
          label: asString(batch.label).trim(),
          timing: asString(batch.timing).trim(),
          starts: asString(batch.starts).trim(),
          seats: asString(batch.seats).trim(),
          mode: asString(batch.mode).trim(),
          startDate: asString(batch.startDate).trim(),
        }))
        .filter((batch) => batch.label || batch.timing),
      placementPoints: asList(values.placementPoints).filter(Boolean),
      trainer: {
        name: asString((values.trainer as Values | undefined)?.name).trim(),
        role: asString((values.trainer as Values | undefined)?.role).trim(),
        photo: asString((values.trainer as Values | undefined)?.photo),
        bio: asString((values.trainer as Values | undefined)?.bio).trim(),
      },
      active: values.active !== false,
    };

    setSaving(true);
    const result = isNew
      ? await adminPost({ op: "createItem", collection: "courses", item: payload })
      : await adminPost({
          op: "updateItem",
          collection: "courses",
          id: courseId,
          item: payload,
        });
    setSaving(false);

    if (!result.ok) {
      toast({ variant: "destructive", title: "Not saved", description: result.error });
      return;
    }

    setDirty(false);
    toast({
      title: isNew ? "Course created" : "Course saved",
      description: "Your changes are live on the website.",
    });

    if (isNew) {
      // The API assigns the id — find the row it just created and continue editing it.
      const created = (
        result.content as { collections?: { courses?: Course[] } } | undefined
      )?.collections?.courses?.find((course) => course.slug === payload.slug);
      if (created) {
        router.replace(`/admin/courses/${created.id}`);
        setValues({ ...created });
        return;
      }
    }
    router.refresh();
  };

  return (
    <div className="pb-24">
      {/* header */}
      <div className="mb-5">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All courses
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold tracking-tight text-ink">
              {isNew ? "Add a new course" : title || "Untitled course"}
              {!isNew ? (
                <Badge variant="secondary" className="text-[10px]">
                  {values.active === false ? "Hidden" : "Published"}
                </Badge>
              ) : null}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isNew
                ? "Fill in the basics first — every other section is optional and can be added later."
                : "Everything here appears on the course page. Empty sections are simply hidden."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {previewSlug && !isNew ? (
              <Button asChild variant="outline" size="sm" className="h-9 rounded-lg font-bold">
                <a href={`/courses/${previewSlug}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1.5 h-4 w-4" />
                  View page
                </a>
              </Button>
            ) : null}
            <Button
              onClick={save}
              disabled={saving || !canWrite}
              className="btn-futur h-9 rounded-lg px-4 text-sm font-bold text-white"
            >
              {saving ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-4 w-4" />
              )}
              {isNew ? "Create course" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div
        aria-label="Course sections"
        className="mb-5 flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"
      >
        {TABS.map((entry) => {
          const active = tab === entry.id;
          const count =
            entry.id === "curriculum"
              ? curriculumCount
              : entry.id === "social"
                ? summary.reviews + summary.faqs
                : entry.id === "projects"
                  ? summary.projects + summary.miniProjects
                  : entry.id === "cohort"
                    ? summary.batches
                    : 0;
          return (
            <button
              key={entry.id}
              type="button"
              aria-pressed={active}
              onClick={() => setTab(entry.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-ink"
              )}
            >
              <entry.icon className="h-4 w-4" aria-hidden="true" />
              {entry.label}
              {count > 0 ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-extrabold",
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="space-y-5">
        {/* ═══════════ BASICS ═══════════ */}
        {tab === "basics" ? (
          <>
            <Panel
              title="Course card & identity"
              description="These fields power the course card on /courses, the footer list and the enquiry form dropdown."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Course name" hint="Shown as the card title and in the page heading.">
                  {text("title", "Full Stack Development")}
                </Field>
                <Field label="Level" hint="e.g. Beginner → Advanced">
                  {text("level", "Beginner → Advanced")}
                </Field>

                <Field
                  label="URL slug"
                  span={2}
                  hint={`Course page: /courses/${previewSlug || "your-course"}. Duplicate slugs get a -2 suffix automatically.`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={asString(values.slug)}
                      placeholder="full-stack-development"
                      onChange={(event) => {
                        set("slug", slugify(event.target.value));
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => {
                        set("slug", slugify(title));
                      }}
                    >
                      From name
                    </Button>
                  </div>
                </Field>

                <Field label="Icon" hint="Shown on the card when no cover image is uploaded.">
                  <Select
                    value={asString(values.icon) || "Sparkles"}
                    onValueChange={(next) => set("icon", next)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Choose an icon" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {ICON_NAMES.map((name) => (
                        <SelectItem key={name} value={name}>
                          <span className="flex items-center gap-2">
                            <ContentIcon name={name} className="h-4 w-4" />
                            {name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Badge" hint="Optional ribbon on the card, e.g. “Most popular”.">
                  {text("badge", "Most popular")}
                </Field>

                <Field label="Short description" span={2} hint="Two lines on the card; also used in search results.">
                  {textarea("description", "What this course makes you able to do.", 3)}
                </Field>

                <Field
                  label="Tagline"
                  span={2}
                  hint="One confident line under the course page headline."
                >
                  {textarea("tagline", "Design, build and deploy complete web applications…", 2)}
                </Field>

                <Field
                  label="Who it is for"
                  span={2}
                  hint="Shown with a people icon under the headline, e.g. freshers & working professionals."
                >
                  {text("audience", "Designed for freshers, career switchers and working professionals")}
                </Field>
              </div>
            </Panel>

            <Panel
              title="Cover image"
              description="Used on the course card and as the main image on the course page. Landscape images (16:10) look best."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <ImageField
                    id="coverImage"
                    value={asString(values.coverImage)}
                    placeholder="/images/courses/full-stack.webp"
                    onChange={(next) => set("coverImage", next)}
                  />
                </div>
                <Field label="Image alt text" span={2} hint="Describe the image for accessibility and image search.">
                  {text("coverAlt", "Students building a web app in the full stack class")}
                </Field>
              </div>
            </Panel>

            <Panel title="Fee, batch & mode" description="The price card and quick facts on the course page.">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Fee" hint="e.g. ₹45,000, or “On request”.">
                  {text("fee", "On request")}
                </Field>
                <Field label="Duration">
                  {text("duration", "5–6 Months (typical)")}
                </Field>
                <Field label="Fee note" hint="Small print under the price, e.g. instalments.">
                  {text("priceNote", "Fee can be paid in two instalments")}
                </Field>
                <Field label="Batch note" hint="Shown in the price card and quick facts.">
                  {text("batchNote", "New batch every month · weekday & weekend")}
                </Field>
                <Field label="Seats note">
                  {text("seatsNote", "Small batches — 15 learners per batch")}
                </Field>
                <Field label="Instructor / mentor line">
                  {text("instructor", "Senior Yantrix mentors")}
                </Field>
                <Field label="Language">
                  {text("language", "Hindi · English · Marathi")}
                </Field>
                <Field label="Modes" hint="Common values: Online, Offline. One per row.">
                  {stringList("modes", "Online", "Add mode")}
                </Field>
                <Field
                  label="Highlight chips"
                  span={2}
                  hint="Three short chips on the card (syllabus keywords)."
                >
                  {stringList("highlights", "React & Node.js basics", "Add highlight")}
                </Field>
                <Field label="Headline stats" span={2} hint="Small chips under the course page headline.">
                  {stringList("heroStats", "10+ live projects", "Add stat")}
                </Field>

                <Field
                  label="Announcement strip"
                  span={2}
                  hint="The strip above the course page, e.g. “Admissions open — limited seats”. Leave empty to hide it."
                >
                  {text("urgencyNote", "Admissions open — limited seats per batch")}
                </Field>
                <Field
                  label="Next batch start date"
                  hint="YYYY-MM-DD. With a date set, the strip shows a live countdown."
                >
                  <Input
                    type="date"
                    value={asString(values.batchStartDate)}
                    onChange={(event) => set("batchStartDate", event.target.value)}
                  />
                </Field>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">Published</p>
                    <p className="text-xs text-muted-foreground">
                      Off hides the card and the course page from the website.
                    </p>
                  </div>
                  <Switch
                    checked={values.active !== false}
                    onCheckedChange={(checked) => set("active", checked)}
                  />
                </div>
              </div>
            </Panel>
          </>
        ) : null}

        {/* ═══════════ CONTENT ═══════════ */}
        {tab === "content" ? (
          <>
            <Panel
              title="About this course"
              description="The opening section of the course page. One paragraph per row."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Section heading" span={2}>
                  {text("aboutTitle", "Go from your first line of HTML to a deployed app")}
                </Field>
                <Field label="Paragraphs" span={2} hint="Blank rows are dropped when you save.">
                  {stringList("aboutParagraphs", "Write a paragraph…", "Add paragraph", true)}
                </Field>
                <div className="sm:col-span-2">
                  <ImageField
                    id="aboutImage"
                    value={asString(values.aboutImage)}
                    placeholder="/images/courses/classroom.webp"
                    onChange={(next) => set("aboutImage", next)}
                  />
                </div>
                <Field label="About image alt text" span={2}>
                  {text("aboutImageAlt", "Trainer explaining a React component on screen")}
                </Field>
              </div>
            </Panel>

            <Panel
              title="What you'll learn"
              description="Outcome list — also sent to search engines as the Course “teaches” field."
            >
              <Field label="Outcomes" span={2} hint="One outcome per row.">
                {stringList("learn", "Build responsive interfaces…", "Add outcome")}
              </Field>
            </Panel>

            <Panel
              title="Why this course"
              description="Short benefit cards near the top of the course page."
            >
              <RecordListEditor
                items={asRecords(values.benefits)}
                onChange={(next) => set("benefits", next)}
                template={{ title: "", description: "" }}
                addLabel="Add benefit"
                itemLabel="Benefit"
                fields={[
                  { key: "title", label: "Title" },
                  { key: "description", label: "Description", type: "textarea" },
                  { key: "stat", label: "Big figure (optional)", placeholder: "2.5L+" },
                  { key: "tag", label: "Figure label (optional)", placeholder: "Jobs in India" },
                ]}
              />
            </Panel>

            <Panel
              title="Specialisations / tracks"
              description="Optional: split the program into stacks (e.g. MERN, Spring Boot, Django)."
            >
              <RecordListEditor
                items={asRecords(values.tracks)}
                onChange={(next) => set("tracks", next)}
                template={{ title: "", subtitle: "", points: [] }}
                addLabel="Add track"
                itemLabel="Track"
                fields={[
                  { key: "title", label: "Track name", placeholder: "MERN Stack" },
                  { key: "subtitle", label: "One-line description", placeholder: "React + Node.js" },
                  { key: "points", label: "What it covers", type: "list", placeholder: "Frontend: React, CSS" },
                ]}
              />
            </Panel>

            <Panel title="Tools & technologies" description="Shown as the tool grid on the course page.">
              <Field label="Tools" span={2} hint="One tool per row, e.g. React, MongoDB, Power BI.">
                {stringList("tools", "React", "Add tool")}
              </Field>
            </Panel>

            <Panel
              title="Brochure"
              description="Optional PDF or link. Without a link the page offers “Get the syllabus” on WhatsApp instead."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Brochure title">
                  {text("brochureTitle", "Full Stack Development syllabus")}
                </Field>
                <Field label="Brochure URL" hint="Upload a PDF anywhere public and paste the link.">
                  {text("brochureUrl", "/files/full-stack-syllabus.pdf")}
                </Field>
              </div>
            </Panel>
          </>
        ) : null}

        {/* ═══════════ PROJECTS & EXTRAS ═══════════ */}
        {tab === "projects" ? (
          <>
            <Panel
              title="Capstone projects"
              description="The portfolio projects at the end of the program. Each one gets a card with an optional screenshot."
            >
              <RecordListEditor
                items={asRecords(values.projects)}
                onChange={(next) => set("projects", next)}
                template={{ title: "", description: "", image: "" }}
                addLabel="Add capstone project"
                itemLabel="Project"
                fields={[
                  { key: "title", label: "Project name", placeholder: "E-commerce website" },
                  { key: "description", label: "One-line description", type: "textarea" },
                ]}
              />
              <p className="mt-3 text-xs text-muted-foreground">
                Project screenshots: save each project first, then paste an image URL into the
                project JSON via the generic editor — or simply leave the card icon-only.
              </p>
            </Panel>

            <Panel
              title="Mini projects"
              description="Small practice builds used while teaching. Shown as a compact list under the capstones."
            >
              <RecordListEditor
                items={asRecords(values.miniProjects)}
                onChange={(next) => set("miniProjects", next)}
                template={{ title: "", description: "", image: "" }}
                addLabel="Add mini project"
                itemLabel="Mini project"
                fields={[
                  { key: "title", label: "Name", placeholder: "Weather app" },
                  { key: "description", label: "What it teaches", type: "textarea" },
                ]}
              />
            </Panel>

            <Panel
              title="What's included"
              description="The icon grid of deliverables — recordings, notes, assessments, certification, support…"
            >
              <RecordListEditor
                items={asRecords(values.includes)}
                onChange={(next) => set("includes", next)}
                template={{ label: "", icon: "Sparkles" }}
                addLabel="Add item"
                itemLabel="Item"
                fields={[
                  { key: "label", label: "Label", placeholder: "Recorded video lectures" },
                  {
                    key: "icon",
                    label: "Icon",
                    type: "select",
                    options: ICON_NAMES.map((name) => ({ label: name, value: name })),
                  },
                ]}
              />
            </Panel>

            <Panel title="Certificate" description="The certification block under the included grid.">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Certificate title">{text("certificateTitle", "Certificate of completion")}</Field>
                <Field label="Certificate text" span={2}>
                  {textarea(
                    "certificateText",
                    "Finish the modules, assignments and your final project to receive…",
                    2
                  )}
                </Field>
                <div className="sm:col-span-2">
                  <ImageField
                    id="certificateImage"
                    value={asString(values.certificateImage)}
                    placeholder="/images/certificate.webp"
                    onChange={(next) => set("certificateImage", next)}
                  />
                </div>
              </div>
            </Panel>
          </>
        ) : null}

        {/* ═══════════ BATCHES & PLACEMENT ═══════════ */}
        {tab === "cohort" ? (
          <>
            <Panel
              title="Upcoming batches"
              description="Shown as a batch list with a “Book a seat” button per row."
            >
              <RecordListEditor
                items={asRecords(values.batches)}
                onChange={(next) => set("batches", next)}
                template={{ label: "", timing: "", starts: "", seats: "", mode: "Offline", startDate: "" }}
                addLabel="Add batch"
                itemLabel="Batch"
                fields={[
                  { key: "label", label: "Batch name", placeholder: "Weekday batch" },
                  { key: "mode", label: "Mode", placeholder: "Online / Offline" },
                  { key: "timing", label: "Timing", placeholder: "Mon–Fri · 2 hours/day" },
                  { key: "starts", label: "Starts (text)", placeholder: "Next month" },
                  { key: "seats", label: "Seats", placeholder: "15 seats" },
                  {
                    key: "startDate",
                    label: "Start date (YYYY-MM-DD)",
                    placeholder: "2026-01-15",
                  },
                ]}
              />
            </Panel>

            <Panel
              title="Placement & career support"
              description="The career-support section near the end of the course page."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Section heading" span={2}>
                  {text("placementTitle", "Placement & career support")}
                </Field>
                <Field label="Intro text" span={2}>
                  {textarea("placementText", "Training is only half the job…", 2)}
                </Field>
                <Field label="Support points" span={2} hint="One point per row.">
                  {stringList("placementPoints", "Resume and portfolio review", "Add point")}
                </Field>
              </div>
            </Panel>

            <Panel title="Trainer" description="The “who teaches this course” card.">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Trainer name">{text("trainer.name", "Saurabh Sir")}</Field>
                <Field label="Role / designation">{text("trainer.role", "Senior Full Stack Developer")}</Field>
                <Field label="Short bio" span={2}>
                  {textarea("trainer.bio", "Teaches with production examples from real projects…", 2)}
                </Field>
                <div className="sm:col-span-2">
                  <ImageField
                    id="trainer.photo"
                    value={asString((values.trainer as Values | undefined)?.photo)}
                    placeholder="/images/trainers/saurabh.webp"
                    onChange={(next) => set("trainer.photo", next)}
                  />
                </div>
              </div>
            </Panel>
          </>
        ) : null}

        {/* ═══════════ CURRICULUM ═══════════ */}
        {tab === "curriculum" ? (
          <Panel
            title="Course curriculum"
            description={`${curriculumCount} module${curriculumCount === 1 ? "" : "s"} · ${topicCount} topic${topicCount === 1 ? "" : "s"}. Each module is one expandable row on the course page.`}
          >
            <RecordListEditor
              items={asRecords(values.curriculum)}
              onChange={(next) => set("curriculum", next)}
              template={{ title: "", topics: [] }}
              addLabel="Add module"
              itemLabel="Module"
              fields={[
                { key: "title", label: "Module title", placeholder: "React front end", span: 2 },
                { key: "topics", label: "Topics", type: "list", placeholder: "Components, props and state" },
              ]}
            />
          </Panel>
        ) : null}

        {/* ═══════════ SOCIAL ═══════════ */}
        {tab === "social" ? (
          <>
            <Panel
              title="Student reviews"
              description="Quotes from learners. Only add reviews you can stand behind — they are published as-is."
            >
              <RecordListEditor
                items={asRecords(values.reviews)}
                onChange={(next) => set("reviews", next)}
                template={{ name: "", role: "", quote: "" }}
                addLabel="Add review"
                itemLabel="Review"
                fields={[
                  { key: "name", label: "Student name" },
                  { key: "role", label: "Role / course batch", placeholder: "Frontend Developer" },
                  { key: "quote", label: "Quote", type: "textarea" },
                ]}
              />
            </Panel>

            <Panel
              title="Course FAQs"
              description="These appear first on the course page and are added to the FAQ structured data (great for Google and AI answer engines)."
            >
              <RecordListEditor
                items={asRecords(values.faqs)}
                onChange={(next) => set("faqs", next)}
                template={{ question: "", answer: "" }}
                addLabel="Add question"
                itemLabel="Question"
                fields={[
                  { key: "question", label: "Question", span: 2 },
                  { key: "answer", label: "Answer", type: "textarea" },
                ]}
              />
            </Panel>
          </>
        ) : null}

        {/* ═══════════ CTA + SEO ═══════════ */}
        {tab === "seo" ? (
          <>
            <Panel
              title="Closing call to action"
              description="The band at the end of the course page."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="CTA heading" span={2}>
                  {text("ctaTitle", "Ready to build your first full stack app?")}
                </Field>
                <Field label="CTA text" span={2}>
                  {textarea("ctaText", "Talk to a counsellor about the next batch…", 2)}
                </Field>
                <Field label="Sticky button label" hint="Used on the mobile enquiry bar.">
                  {text("ctaLabel", "Enquire now")}
                </Field>
                <Field label="WhatsApp message" hint="Pre-filled text when a visitor taps “Ask on WhatsApp”.">
                  {textarea("whatsappMessage", "Hi Yantrix Technology, I'm interested in…", 2)}
                </Field>
              </div>
            </Panel>

            <Panel
              title="Search listing"
              description="Optional overrides for the browser tab / Google result. Leave empty to use the course name and tagline."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="SEO title" span={2} hint="Around 55–60 characters reads best.">
                  {text("seoTitle", "Full Stack Development Course in Pune — Fees & Syllabus")}
                </Field>
                <Field label="Meta description" span={2} hint="Around 150–160 characters.">
                  {textarea("seoDescription", "Learn full stack development in Pune with hands-on projects…", 3)}
                </Field>
              </div>
            </Panel>
          </>
        ) : null}
      </div>

      {/* sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:pl-72">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {dirty ? "You have unsaved changes." : isNew ? "Not created yet." : "All changes saved."}
          </p>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="h-10 rounded-xl font-bold">
              <Link href="/admin/courses">Cancel</Link>
            </Button>
            <Button
              onClick={save}
              disabled={saving || !canWrite}
              title={canWrite ? undefined : "Your account has read-only access"}
              className="btn-futur h-10 rounded-xl px-5 font-bold text-white"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isNew ? "Create course" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
