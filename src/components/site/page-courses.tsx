"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Clock,
  MapPin,
  MessageCircleQuestion,
  Monitor,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBand } from "@/components/site/cta-band";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { HeroDecor } from "@/components/site/svg-decor";
import { HudCorners, ScanSweep } from "@/components/site/ai-decor";
import { tiltHandlers } from "@/components/site/fx";
import { useCollection, useLabels, useSection, useSettings, useSiteContent } from "@/lib/content/provider";
import { ContentIcon } from "@/components/site/content-icon";
import { whatsappUrl } from "@/lib/content/helpers";
import { coursePath } from "@/lib/seo";
import type { Course, SimpleItem } from "@/lib/content/types";
import { useSiteStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Three tinted variants so a grid without cover images still has rhythm. */
const COVER_TINTS = [
  "bg-[radial-gradient(circle_at_28%_22%,rgba(34,211,238,0.30),transparent_58%),radial-gradient(circle_at_82%_78%,rgba(37,99,235,0.35),transparent_58%),linear-gradient(135deg,#070d22,#0b1433)]",
  "bg-[radial-gradient(circle_at_72%_24%,rgba(167,139,250,0.30),transparent_58%),radial-gradient(circle_at_18%_80%,rgba(34,211,238,0.28),transparent_58%),linear-gradient(135deg,#0a0b1f,#0b1433)]",
  "bg-[radial-gradient(circle_at_48%_18%,rgba(37,99,235,0.36),transparent_58%),radial-gradient(circle_at_86%_76%,rgba(34,211,238,0.26),transparent_58%),linear-gradient(135deg,#050914,#101a3d)]",
];

/** Cover image, or a branded icon panel when the admin has not uploaded one. */
function CourseCover({ course, variant = 0 }: { course: Course; variant?: number }) {
  if (course.coverImage) {
    return (
      <img
        src={course.coverImage}
        alt={course.coverAlt || `${course.title} course at Yantrix Technology`}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-full w-full items-center justify-center",
        COVER_TINTS[variant % COVER_TINTS.length]
      )}
    >
      <ContentIcon
        name={course.icon}
        className="h-14 w-14 text-cyber-300/90 transition-transform duration-500 group-hover:scale-110"
      />
    </div>
  );
}

function CourseCard({ course, index }: { course: Course; index: number }) {
  const navigate = useSiteStore((s) => s.navigate);
  const t = useLabels();
  const href = coursePath(course);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.07, ease: "easeOut" }}
      {...tiltHandlers(4)}
      className="tilt-card spotlight-card card-glow group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-20 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-500 via-cyber-400 to-brand-700 transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
      <HudCorners />
      <ScanSweep />

      {/* ── cover ── */}
      <a href={href} tabIndex={-1} aria-hidden="true" className="relative block overflow-hidden">
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/10">
          <CourseCover course={course} variant={index} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#040815]/85 via-[#040815]/10 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {course.badge ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-600 to-cyber-500 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {course.badge}
              </span>
            ) : null}
          </div>
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {course.modes.map((mode) => (
              <span
                key={mode}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-bold text-cyber-200 backdrop-blur"
              >
                {mode === "Online" ? (
                  <Monitor className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                )}
                {mode}
              </span>
            ))}
          </div>
        </div>
      </a>

      {/* ── body ── */}
      <div className="relative z-10 flex flex-1 flex-col p-5">
        <h3 className="text-lg font-extrabold leading-snug text-ink">
          <a href={href} className="transition-colors hover:text-cyber-300">
            {course.title}
          </a>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {course.tagline || course.description}
        </p>

        {course.highlights?.length ? (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {course.highlights.slice(0, 3).map((highlight) => (
              <span
                key={highlight}
                className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200"
              >
                {highlight}
              </span>
            ))}
          </div>
        ) : null}

        <dl className="mt-4 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
            <dt className="sr-only">{t("courses.duration")}</dt>
            <dd className="font-semibold">{course.duration || "Duration on enquiry"}</dd>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <BarChart3 className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
            <dt className="sr-only">Level</dt>
            <dd className="font-semibold">{course.level || "All levels"}</dd>
          </div>
          {course.curriculum?.length ? (
            <div className="flex items-center gap-1.5 text-slate-500">
              <BookOpen className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
              <dt className="sr-only">{t("cp.curriculumModules")}</dt>
              <dd className="font-semibold">
                {course.curriculum.length} {t("cp.curriculumModules")} ·{" "}
                {course.curriculum.reduce((sum, module) => sum + (module.topics?.length ?? 0), 0)}{" "}
                {t("cp.curriculumSessions")}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("courses.fee")}</p>
            <p className="text-base font-extrabold text-ink">{course.fee || "On request"}</p>
          </div>
          <a
            href={href}
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-600 transition-colors hover:text-cyber-300"
          >
            {t("courses.viewDetails")}
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            <span className="sr-only"> for {course.title}</span>
          </a>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => navigate("contact", { course: course.title })}
            className="btn-futur btn-shine h-10 flex-1 rounded-xl text-sm font-bold text-white"
          >
            {t("courses.enquire")}
          </Button>
          <a
            href={href}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-3.5 text-sm font-bold text-ink transition-colors hover:border-cyber-300/60 hover:bg-white/5"
          >
            {t("courses.details")}
            <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

const FILTERS = ["All", "Online", "Offline"] as const;

export function PageCourses() {
  const courses = useCollection<Course>("courses");
  const chips = useCollection<SimpleItem>("courseChips");
  const section = useSection("coursesPage");
  const settings = useSettings();
  const t = useLabels();
  const copy = useSiteContent().pages.courses;
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const visible = useMemo(
    () =>
      filter === "All"
        ? courses
        : courses.filter((course) => (course.modes ?? []).some((mode) => mode === filter)),
    [courses, filter]
  );

  const counts = useMemo(
    () => ({
      All: courses.length,
      Online: courses.filter((c) => (c.modes ?? []).includes("Online")).length,
      Offline: courses.filter((c) => (c.modes ?? []).includes("Offline")).length,
    }),
    [courses]
  );

  return (
    <>
      {/* Page hero band — cosmic space */}
      <section className="relative overflow-hidden bg-space py-16 sm:py-20">
        <HeroDecor
          orbitClassName="-right-20 -top-24 h-80 w-80 text-brand-400/40"
          circuitClassName="absolute inset-x-0 bottom-0 h-40 w-full text-brand-400/25"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            as="h1"
            dark
            align="left"
            eyebrow={section.eyebrow}
            title={section.title}
            description={section.description}
          />
          <div className="mt-6 flex flex-wrap gap-2.5">
            {chips.map((chip) => (
              <span
                key={chip.id}
                className="glass rounded-full px-4 py-1.5 text-xs font-bold text-cyber-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white hover:shadow-[0_0_18px_-4px_rgba(34,211,238,0.5)]"
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Course grid — with star field */}
      <section
        id="course-grid"
        className="relative scroll-mt-28 overflow-hidden bg-slate-50 py-14 sm:py-16"
        aria-labelledby="course-grid-heading"
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          {/* The cards below are <h3>; this keeps the outline h1 → h2 → h3. */}
          <h2 id="course-grid-heading" className="sr-only">
            {t("courses.all")}
          </h2>

          {/* Mode filter — mirrors the "online / offline" split on course listings */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map((option) => {
                const active = filter === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFilter(option)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold transition-all",
                      active
                        ? "border-transparent bg-gradient-to-r from-brand-600 to-cyber-500 text-white shadow-[0_8px_24px_-10px_rgba(34,211,238,0.8)]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-cyber-300/60 hover:text-ink"
                    )}
                  >
                    {option}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-extrabold",
                        active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {counts[option]}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Showing {visible.length} of {courses.length} courses
            </p>
          </div>

          <div className="grid gap-5 [perspective:1400px] sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-semibold text-ink">
                No {filter.toLowerCase()} batches are listed right now.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Talk to us — we often open a batch when enough students ask.
              </p>
              <Button
                onClick={() => useSiteStore.getState().navigate("contact")}
                className="btn-futur mt-4 h-10 rounded-xl px-5 text-sm font-bold text-white"
              >
                Ask about {filter.toLowerCase()} batches
              </Button>
            </div>
          ) : null}

          {/* Editable-content + disclaimer notes */}
          <div className="mx-auto mt-10 max-w-3xl space-y-2 text-center">
            <p className="text-xs leading-relaxed text-slate-500">{copy.note}</p>
            <p className="text-xs leading-relaxed text-slate-500">
              Looking for something specific or corporate training for your team?{" "}
              <button
                onClick={() => useSiteStore.getState().navigate("contact")}
                className="font-bold text-brand-700 underline-offset-2 hover:underline"
              >
                {t("courses.talkToUs")}
              </button>{" "}
              — we regularly add new programs.
            </p>
          </div>
        </div>
      </section>

      {/* Help choose section — cosmic glow */}
      <section className="relative overflow-hidden bg-white py-14 sm:py-16" aria-labelledby="course-help-heading">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-8 rounded-3xl border border-slate-100 bg-slate-50/80 p-8 sm:p-10 lg:grid-cols-[auto_1fr_auto]">
            <span className="hover-wiggle mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-cyber-500 text-white shadow-lg shadow-cyber-500/30 lg:mx-0">
              <MessageCircleQuestion className="h-8 w-8" aria-hidden="true" />
            </span>
            <div className="text-center lg:text-left">
              <h2 id="course-help-heading" className="text-xl font-extrabold text-ink sm:text-2xl">
                {copy.helpTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {copy.helpText}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button
                onClick={() => useSiteStore.getState().navigate("contact")}
                className="btn-futur btn-shine h-11 rounded-full px-6 font-bold text-white"
              >
                <Users className="mr-1 h-4.5 w-4.5" aria-hidden="true" />
                {copy.helpCta}
              </Button>
              <a
                href={whatsappUrl(settings, `Hello ${settings.name}, I need help choosing the right course.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600"
              >
                <WhatsAppIcon className="h-4.5 w-4.5" />
                {t("courses.whatsapp")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
