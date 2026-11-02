"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { adminPost } from "@/components/admin/api";
import { useAdminRole } from "@/components/admin/role-context";
import { ContentIcon } from "@/components/site/content-icon";
import type { Course } from "@/lib/content/types";

/**
 * Admin → Courses landing screen.
 *
 * A compact list rather than the generic collection editor: courses now have
 * a full detail page, so this screen shows the cover, fee, mode and publish
 * state, links straight to the editor, and keeps reordering / hiding / delete
 * one click away.
 */
export function CourseList({ items }: { items: Course[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const { canWrite } = useAdminRole();
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const sorted = useMemo(() => [...items].sort((a, b) => a.sortOrder - b.sortOrder), [items]);
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sorted;
    return sorted.filter((course) =>
      [course.title, course.slug, course.level, ...(course.modes ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [sorted, query]);

  const run = async (body: Record<string, unknown>, message: string) => {
    const result = await adminPost(body);
    if (!result.ok) {
      toast({ variant: "destructive", title: "Not saved", description: result.error });
      return;
    }
    toast({ title: message });
    router.refresh();
  };

  const copyLink = async (course: Course) => {
    const url = `${window.location.origin}/courses/${course.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(course.id);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      toast({ variant: "destructive", title: "Could not copy", description: url });
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">Course catalogue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {sorted.length} course{sorted.length === 1 ? "" : "s"} · each one gets its own page at{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/courses/&lt;slug&gt;</code>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search courses…"
              aria-label="Search courses"
              className="h-9 w-full pl-8 sm:w-56"
            />
          </div>
          {canWrite ? (
            <Button
              asChild
              className="btn-futur h-9 rounded-lg px-4 text-sm font-bold text-white"
            >
              <Link href="/admin/courses/new">
                <Plus className="mr-1.5 h-4 w-4" /> Add course
              </Link>
            </Button>
          ) : null}
        </div>
      </header>

      {visible.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">
          {sorted.length === 0
            ? "No courses yet. Add your first course to publish a page for it."
            : "No course matches that search."}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {visible.map((course) => {
            const index = sorted.findIndex((item) => item.id === course.id);
            const hidden = course.active === false;
            return (
              <li key={course.id} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                {/* cover / icon */}
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {course.coverImage ? (
                      <img src={course.coverImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ContentIcon name={course.icon} className="h-6 w-6 text-brand-600" />
                    )}
                  </span>

                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink">
                      {course.title || "(untitled)"}
                      {hidden ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Hidden
                        </Badge>
                      ) : null}
                      {course.badge ? (
                        <Badge className="bg-brand-50 text-[10px] text-brand-800 ring-1 ring-brand-100">
                          {course.badge}
                        </Badge>
                      ) : null}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      /courses/{course.slug}
                    </p>
                    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-500">
                      <span>{course.fee || "Fee on request"}</span>
                      <span>{course.duration}</span>
                      <span>{(course.modes ?? []).join(" / ")}</span>
                      <span>{course.level}</span>
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Copy link"
                    onClick={() => copyLink(course)}
                  >
                    {copied === course.id ? (
                      <span className="text-[10px] font-bold text-emerald-600">Copied</span>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="View page" asChild>
                    <a href={`/courses/${course.slug}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>

                  {canWrite ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={index <= 0 || busyId !== null}
                        title="Move up"
                        onClick={async () => {
                          setBusyId(course.id);
                          await run(
                            { op: "moveItem", collection: "courses", id: course.id, direction: "up" },
                            "Order updated"
                          );
                          setBusyId(null);
                        }}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={index < 0 || index >= sorted.length - 1 || busyId !== null}
                        title="Move down"
                        onClick={async () => {
                          setBusyId(course.id);
                          await run(
                            { op: "moveItem", collection: "courses", id: course.id, direction: "down" },
                            "Order updated"
                          );
                          setBusyId(null);
                        }}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={hidden ? "Show on website" : "Hide from website"}
                        onClick={() =>
                          run(
                            {
                              op: "updateItem",
                              collection: "courses",
                              id: course.id,
                              item: { ...course, active: hidden },
                            },
                            hidden ? "Course published" : "Course hidden"
                          )
                        }
                      >
                        {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Delete"
                        onClick={async () => {
                          if (
                            !window.confirm(
                              `Delete "${course.title}" and its course page? This cannot be undone.`
                            )
                          ) {
                            return;
                          }
                          setBusyId(course.id);
                          await run(
                            { op: "deleteItem", collection: "courses", id: course.id },
                            "Course deleted"
                          );
                          setBusyId(null);
                        }}
                      >
                        {busyId === course.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  ) : null}

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="ml-1 h-8 rounded-lg font-bold"
                  >
                    <Link href={`/admin/courses/${course.id}`}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      {canWrite ? "Edit" : "View"}
                    </Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
