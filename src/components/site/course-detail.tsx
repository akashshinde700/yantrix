"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  GraduationCap,
  IndianRupee,
  Languages,
  MapPin,
  Monitor,
  Quote,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { ContentIcon } from "@/components/site/content-icon";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { CtaBand } from "@/components/site/cta-band";
import { HudCorners, ScanSweep } from "@/components/site/ai-decor";
import { useCollection, useSettings, useSiteContent } from "@/lib/content/provider";
import { whatsappUrl } from "@/lib/content/helpers";
import { courseFaqs, courseHeadline, coursePath } from "@/lib/seo";
import { getIcon } from "@/lib/content/icons";
import { useSiteStore } from "@/lib/store";
import type { Course } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/* ─────────────────────────────── shared bits ─────────────────────────────── */

const CARD =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1230]/80 backdrop-blur-sm";

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn("mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14", className)}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-cyber-300">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={`${id}-heading`}
          className="mt-2 text-2xl font-extrabold tracking-tight text-white text-balance sm:text-3xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">{description}</p>
        ) : null}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

/** Cover image when the admin uploaded one, otherwise a branded icon panel. */
function CoverArt({
  course,
  className,
  iconClassName,
  priority = false,
  variant = 0,
}: {
  course: Course;
  className?: string;
  iconClassName?: string;
  /** The hero image is the LCP element — do not defer it. */
  priority?: boolean;
  /** Tint variant for the icon fallback (keeps a grid from looking flat). */
  variant?: number;
}) {
  if (course.coverImage) {
    return (
      <img
        src={course.coverImage}
        alt={course.coverAlt || `${course.title} course at Yantrix Technology`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-full w-full items-center justify-center",
        variant === 1
          ? "bg-[radial-gradient(circle_at_72%_24%,rgba(167,139,250,0.3),transparent_58%),radial-gradient(circle_at_18%_80%,rgba(34,211,238,0.28),transparent_58%),linear-gradient(135deg,#0a0b1f,#0b1433)]"
          : variant === 2
            ? "bg-[radial-gradient(circle_at_48%_18%,rgba(37,99,235,0.36),transparent_58%),radial-gradient(circle_at_86%_76%,rgba(34,211,238,0.26),transparent_58%),linear-gradient(135deg,#050914,#101a3d)]"
            : "bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.28),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(37,99,235,0.32),transparent_55%),linear-gradient(135deg,#070d22,#0b1433)]",
        className
      )}
    >
      <ContentIcon name={course.icon} className={cn("h-20 w-20 text-cyber-300/90", iconClassName)} />
    </div>
  );
}

/* ─────────────────────────── urgency strip ─────────────────────────── */

/** Live countdown to the next batch start. Renders nothing until mounted, so
 *  the server and client markup always match on first paint. */
function useCountdown(target?: string) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;
    const end = new Date(`${target}T00:00:00`).getTime();
    if (Number.isNaN(end)) return;
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (left === null || left <= 0) return null;
  const totalSeconds = Math.floor(left / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/**
 * The announcement strip that sits above the course page (the "batch closing
 * in" strip these course pages usually carry). The countdown only appears when
 * the admin set a batch start date.
 */
function UrgencyStrip({
  note,
  startDate,
  fee,
  onEnquire,
}: {
  note?: string;
  startDate?: string;
  fee?: string;
  onEnquire: () => void;
}) {
  const left = useCountdown(startDate);
  if (!note && !left) return null;

  const units = left
    ? [
        { value: left.days, label: "days" },
        { value: left.hours, label: "hrs" },
        { value: left.minutes, label: "min" },
        { value: left.seconds, label: "sec" },
      ]
    : [];

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-cyber-400/25 bg-gradient-to-r from-[#0b1a3a] via-[#081128] to-[#0b1a3a] px-4 py-3 shadow-[0_16px_40px_-24px_rgba(34,211,238,0.6)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyber-400 opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyber-300" />
        </span>
        <p className="text-xs font-bold uppercase tracking-wider text-cyber-200 sm:text-[13px]">
          {note || "Admissions open"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {units.length > 0 ? (
          <div className="flex items-center gap-1.5">
            <span className="mr-1 hidden text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:inline">
              Batch starts in
            </span>
            {units.map((unit) => (
              <span
                key={unit.label}
                className="flex min-w-[46px] flex-col items-center rounded-lg border border-white/10 bg-black/30 px-2 py-1"
              >
                <span className="font-mono text-sm font-extrabold leading-none text-white">
                  {String(unit.value).padStart(2, "0")}
                </span>
                <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {unit.label}
                </span>
              </span>
            ))}
          </div>
        ) : null}

        <Button
          onClick={onEnquire}
          className="btn-futur h-9 rounded-full px-4 text-xs font-bold text-white"
        >
          {fee && !/request|enquir/i.test(fee) ? `Enroll · ${fee}` : "Enroll now"}
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────────── page ─────────────────────────────── */

/**
 * /courses/[slug] — the full course page: promise + price card, about, tracks,
 * outcomes, tools, syllabus, reviews and Q&A, all driven by the admin-editable
 * `Course` record (see Admin → Courses). Every block disappears cleanly when
 * its field is empty, so a partially filled course still reads well.
 */
export function CourseDetail({ slug }: { slug: string }) {
  const content = useSiteContent();
  const settings = useSettings();
  const courses = useCollection<Course>("courses");
  const navigate = useSiteStore((s) => s.navigate);
  const course = courses.find((c) => c.slug === slug);

  if (!course) return null;

  const city = settings.contact.city;
  const modes = course.modes?.length ? course.modes : ["Online", "Offline"];
  const learn = course.learn?.length ? course.learn : (course.highlights ?? []);
  const tools = course.tools ?? [];
  const curriculum = course.curriculum ?? [];
  const benefits = course.benefits ?? [];
  const tracks = course.tracks ?? [];
  const reviews = course.reviews ?? [];
  const includes = course.includes ?? [];
  const miniProjects = course.miniProjects ?? [];
  const projects = course.projects ?? [];
  const batches = course.batches ?? [];
  const placementPoints = course.placementPoints ?? [];
  const hasPlacement = Boolean(course.placementTitle || placementPoints.length);
  const hasTrainer = Boolean(course.trainer?.name || course.instructor);
  const faqs = courseFaqs(content, course);
  const related = courses.filter((c) => c.slug !== slug).slice(0, 3);
  const about = course.aboutParagraphs?.length ? course.aboutParagraphs : [course.description];
  const waMessage =
    course.whatsappMessage ||
    `Hi ${settings.name}, I'm interested in the ${course.title} course. Please share fees and batch details.`;

  const summary = [
    `${course.title} at ${settings.name} is a${course.duration ? ` ${course.duration}` : ""} course`,
    course.level ? ` for ${course.level.toLowerCase()} learners` : "",
    `, available ${modes.join(" and ").toLowerCase()}${city ? ` in ${city}` : ""}. `,
    course.description,
  ].join("");

  const facts = [
    { icon: Clock, label: "Duration", value: course.duration || "On enquiry" },
    { icon: BarChart3, label: "Level", value: course.level || "All levels" },
    { icon: Monitor, label: "Mode", value: modes.join(" / ") },
    { icon: IndianRupee, label: "Fee", value: course.fee || "On request" },
  ];

  const anchors = [
    { id: "overview", label: "Overview" },
    ...(benefits.length ? [{ id: "why", label: "Why this course" }] : []),
    ...(tools.length ? [{ id: "tools", label: "Tools covered" }] : []),
    ...(learn.length ? [{ id: "learn", label: "What you'll learn" }] : []),
    ...(curriculum.length ? [{ id: "curriculum", label: "Curriculum" }] : []),
    ...(includes.length || course.certificateTitle ? [{ id: "included", label: "What's included" }] : []),
    ...(projects.length || miniProjects.length ? [{ id: "projects", label: "Projects" }] : []),
    ...(batches.length ? [{ id: "batches", label: "Batches" }] : []),
    ...(hasPlacement ? [{ id: "placement", label: "Placement" }] : []),
    ...(hasTrainer ? [{ id: "trainer", label: "Trainer" }] : []),
    ...(reviews.length ? [{ id: "reviews", label: "Reviews" }] : []),
    ...(faqs.length ? [{ id: "faqs", label: "FAQs" }] : []),
  ];

  return (
    <article className="relative pb-24 lg:pb-0">
      {/* ═══════════════ HERO ═══════════════ */}
      <header className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_78%_10%,rgba(34,211,238,0.16),transparent_65%),radial-gradient(ellipse_55%_45%_at_10%_35%,rgba(37,99,235,0.2),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pt-10">
          <UrgencyStrip
            note={course.urgencyNote}
            startDate={course.batchStartDate}
            fee={course.fee}
            onEnquire={() => navigate("contact", { course: course.title })}
          />

          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-400">
              <li>
                <a href="/" className="transition-colors hover:text-white">
                  Home
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <a href="/courses" className="transition-colors hover:text-white">
                  Courses
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-cyber-200">
                {course.title}
              </li>
            </ol>
          </nav>

          <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
            {/* ── promise ── */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyber-400/25 bg-white/5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-cyber-200">
                  <ContentIcon name={course.icon} className="h-3.5 w-3.5" />
                  {[course.level, city].filter(Boolean).join(" · ") || "Course"}
                </span>
                {course.badge ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-600 to-cyber-500 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-[0_6px_20px_-6px_rgba(34,211,238,0.7)]">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    {course.badge}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-5xl">
                <span className="text-gradient-cyber">{courseHeadline(content, course)}</span>
              </h1>

              <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed text-slate-200 sm:text-lg">
                {course.tagline || course.description}
              </p>
              <p data-speakable className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
                {summary}
              </p>

              {course.heroStats?.length ? (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {course.heroStats.filter(Boolean).map((stat) => (
                    <li
                      key={stat}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-bold text-slate-200"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyber-300" aria-hidden="true" />
                      {stat}
                    </li>
                  ))}
                </ul>
              ) : null}

              {course.audience ? (
                <p className="mt-5 flex items-start gap-2 text-sm font-semibold text-slate-300">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-cyber-300" aria-hidden="true" />
                  {course.audience}
                </p>
              ) : null}

              <dl className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-sm text-slate-400">
                {course.instructor ? (
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-cyber-300" aria-hidden="true" />
                    <dt className="sr-only">Instructor</dt>
                    <dd>{course.instructor}</dd>
                  </div>
                ) : null}
                {course.language ? (
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-cyber-300" aria-hidden="true" />
                    <dt className="sr-only">Language</dt>
                    <dd>{course.language}</dd>
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyber-300" aria-hidden="true" />
                  <dt className="sr-only">Location</dt>
                  <dd>
                    {modes.includes("Offline") ? `Classroom in ${city || "Pune"}` : "Live online"} ·{" "}
                    {modes.join(" / ")}
                  </dd>
                </div>
              </dl>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  onClick={() => navigate("contact", { course: course.title })}
                  className="btn-futur h-12 rounded-full px-7 text-base font-bold text-white"
                >
                  Enquire for this course
                  <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                </Button>
                <a
                  href={whatsappUrl(settings, waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp inline-flex h-12 items-center gap-2 rounded-full px-6 text-base font-bold text-white"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Ask on WhatsApp
                </a>
              </div>
            </div>

            {/* ── cover + price card ── */}
            <div className="space-y-4">
              <div className="group relative overflow-hidden rounded-3xl border border-white/12 bg-[#070d22] shadow-[0_28px_70px_-30px_rgba(2,8,23,0.95)]">
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <CoverArt course={course} priority />
                </div>
                <HudCorners dark />
                <ScanSweep />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#040815] via-[#040815]/60 to-transparent p-4 pt-12">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {modes.map((mode) => (
                      <span
                        key={mode}
                        className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[11px] font-bold text-cyber-200 backdrop-blur"
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
              </div>

              {/* Price / enrol card */}
              <div className="relative overflow-hidden rounded-2xl border border-cyber-400/25 bg-gradient-to-b from-[#0c1738] to-[#070d22] p-5 shadow-[0_20px_50px_-24px_rgba(34,211,238,0.45)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyber-300">
                      Course fee
                    </p>
                    <p className="mt-1 text-3xl font-extrabold leading-none text-white">
                      {course.fee || "On request"}
                    </p>
                    {course.priceNote ? (
                      <p className="mt-2 text-xs leading-relaxed text-slate-400">{course.priceNote}</p>
                    ) : null}
                  </div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                    {course.active === false ? "Closed" : "Admissions open"}
                  </span>
                </div>

                <Button
                  onClick={() => navigate("contact", { course: course.title })}
                  className="btn-futur mt-4 h-11 w-full rounded-xl text-sm font-bold text-white"
                >
                  Enquire now
                  <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                </Button>

                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  {course.batchNote ? (
                    <li className="flex items-start gap-2">
                      <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyber-300" aria-hidden="true" />
                      {course.batchNote}
                    </li>
                  ) : null}
                  {course.seatsNote ? (
                    <li className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyber-300" aria-hidden="true" />
                      {course.seatsNote}
                    </li>
                  ) : null}
                  {course.duration ? (
                    <li className="flex items-start gap-2">
                      <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyber-300" aria-hidden="true" />
                      {course.duration}
                    </li>
                  ) : null}
                </ul>

                {course.brochureUrl ? (
                  <a
                    href={course.brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:border-cyber-300/60 hover:bg-white/10"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    {course.brochureTitle || "Download syllabus"}
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          {/* quick facts */}
          <dl className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-2xl border border-white/10 bg-[#0a1230]/80 p-4">
                <dt className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <fact.icon className="h-3.5 w-3.5 text-cyber-300" aria-hidden="true" />
                  {fact.label}
                </dt>
                <dd className="mt-1.5 text-base font-bold text-white">{fact.value}</dd>
              </div>
            ))}
          </dl>

          {/* section jump links */}
          {anchors.length > 2 ? (
            <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2">
              {anchors.map((anchor) => (
                <a
                  key={anchor.id}
                  href={`#${anchor.id}`}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-bold text-slate-300 transition-all hover:-translate-y-0.5 hover:border-cyber-300/50 hover:text-white"
                >
                  {anchor.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </header>

      {/* ═══════════════ OVERVIEW / ABOUT ═══════════════ */}
      <Section
        id="overview"
        eyebrow="About the course"
        title={course.aboutTitle || `About the ${course.title} course`}
      >
        <div className={cn("grid gap-8", course.aboutImage ? "lg:grid-cols-[1.1fr_0.9fr]" : "")}>
          <div className="space-y-4">
            {about.filter(Boolean).map((paragraph, index) => (
              <Reveal key={index} delay={index * 0.06}>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-base">{paragraph}</p>
              </Reveal>
            ))}
          </div>
          {course.aboutImage ? (
            <Reveal delay={0.1}>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <img
                  src={course.aboutImage}
                  alt={course.aboutImageAlt || `${course.title} training session`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
          ) : null}
        </div>

        {/* tracks / specialisations */}
        {tracks.length ? (
          <div className="mt-10">
            <h3 className="text-lg font-extrabold text-white">Specialisations inside this program</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tracks.map((track, index) => (
                <Reveal key={track.title} delay={index * 0.06}>
                  <div className={cn(CARD, "card-glow-dark group h-full p-5")}>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-cyber-500 text-white">
                      <BookOpen className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <h4 className="mt-3 text-base font-extrabold text-white">{track.title}</h4>
                    {track.subtitle ? (
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">{track.subtitle}</p>
                    ) : null}
                    <ul className="mt-3 space-y-1.5">
                      {(track.points ?? []).filter(Boolean).map((point) => (
                        <li key={point} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-cyber-300"
                            aria-hidden="true"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        ) : null}
      </Section>

      {/* ═══════════════ WHY THIS COURSE ═══════════════ */}
      {benefits.length ? (
        <Section
          id="why"
          eyebrow="Why this course"
          title={`What makes ${course.title} at ${settings.shortName || settings.name} different`}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <Reveal key={`${benefit.title}-${index}`} delay={index * 0.06}>
                <div className={cn(CARD, "group h-full p-5")}>
                  {benefit.stat ? (
                    <>
                      <p className="text-2xl font-extrabold leading-none text-gradient-cyber sm:text-3xl">
                        {benefit.stat}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-cyber-400/25 bg-cyber-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-cyber-200">
                        {benefit.tag || "Highlight"}
                      </span>
                      <h3 className="mt-3 text-sm font-extrabold text-white">{benefit.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {benefit.description}
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyber-400/25 bg-cyber-500/10 text-cyber-300">
                        <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <h3 className="mt-3 text-base font-extrabold text-white">{benefit.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                        {benefit.description}
                      </p>
                    </>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ═══════════════ TOOLS ═══════════════ */}
      {tools.length ? (
        <Section
          id="tools"
          eyebrow="Tools covered"
          title="The stack you will work with"
          description="Everything here is introduced in class and used in a project — no theory-only tours."
        >
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {tools.filter(Boolean).map((tool, index) => (
              <Reveal key={tool} delay={index * 0.03}>
                <li className="group flex h-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 transition-colors hover:border-cyber-300/40 hover:bg-white/[0.06]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600/80 to-cyber-500/80 text-[13px] font-black text-white">
                    {tool.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="text-xs font-bold leading-tight text-slate-200">{tool}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* ═══════════════ WHAT YOU'LL LEARN ═══════════════ */}
      {learn.length ? (
        <Section
          id="learn"
          eyebrow="Learning outcomes"
          title={`What you'll learn in ${course.title}`}
          description="Each point below is something you will have built, practised or shipped by the end of the program."
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {learn.filter(Boolean).map((item, index) => (
              <Reveal key={item} delay={index * 0.04}>
                <li className={cn(CARD, "flex h-full items-start gap-3 p-4")}>
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyber-300" aria-hidden="true" />
                  <span className="text-sm font-semibold leading-relaxed text-slate-100">{item}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* ═══════════════ CURRICULUM ═══════════════ */}
      {curriculum.length ? (
        <CurriculumSection
          courseTitle={course.title}
          modules={curriculum}
          brochureTitle={course.brochureTitle}
          brochureUrl={course.brochureUrl}
          whatsappHref={whatsappUrl(
            settings,
            `Hi ${settings.name}, please share the ${course.title} syllabus PDF.`
          )}
        />
      ) : null}

      {/* ═══════════════ WHAT'S INCLUDED + CERTIFICATE ═══════════════ */}
      <IncludedSection
        includes={includes}
        certificateTitle={course.certificateTitle}
        certificateText={course.certificateText}
        certificateImage={course.certificateImage}
      />

      {/* ═══════════════ PROJECTS ═══════════════ */}
      {projects.length || miniProjects.length ? (
        <ProjectsSection
          courseTitle={course.title}
          projects={projects}
          miniProjects={miniProjects}
        />
      ) : null}

      {/* ═══════════════ BATCHES ═══════════════ */}
      <BatchesSection
        batches={batches}
        onEnquire={(batch) => navigate("contact", { course: `${course.title} — ${batch}` })}
      />

      {/* ═══════════════ PLACEMENT ═══════════════ */}
      <PlacementSection
        title={course.placementTitle}
        text={course.placementText}
        points={placementPoints}
        onEnquire={() => navigate("contact", { course: course.title })}
      />

      {/* ═══════════════ TRAINER ═══════════════ */}
      <TrainerSection
        trainer={course.trainer}
        fallback={course.instructor}
        city={city}
      />

      {/* ═══════════════ REVIEWS ═══════════════ */}
      {reviews.length ? (
        <Section
          id="reviews"
          eyebrow="Student reviews"
          title="What our students say"
          description="Feedback from learners who completed this program."
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <Reveal key={`${review.name}-${index}`} delay={index * 0.06}>
                <figure className={cn(CARD, "h-full p-5")}>
                  <Quote className="h-6 w-6 text-cyber-300/70" aria-hidden="true" />
                  <blockquote className="mt-3 text-sm leading-relaxed text-slate-200">
                    “{review.quote}”
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-3 border-t border-white/10 pt-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-cyber-500 text-xs font-black text-white">
                      {review.name.trim().charAt(0).toUpperCase()}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-white">{review.name}</span>
                      {review.role ? (
                        <span className="block text-xs text-slate-400">{review.role}</span>
                      ) : null}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ═══════════════ FAQ ═══════════════ */}
      {faqs.length ? (
        <Section
          id="faqs"
          eyebrow="FAQ"
          title={`${course.title} — questions students ask`}
          description="Straight answers. If yours is not here, message us on WhatsApp and we will reply the same day."
        >
          <div className="mx-auto max-w-3xl space-y-3">
            {faqs.map((qa, index) => (
              <details
                key={qa.question}
                open={index === 0}
                className="group rounded-2xl border border-white/10 bg-[#0a1230]/80 px-5 transition-colors open:border-cyber-400/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[15px] font-bold text-white [&::-webkit-details-marker]:hidden">
                  {qa.question}
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-cyber-300 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-slate-300">{qa.answer}</p>
              </details>
            ))}
          </div>

          <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-[#0c1738] to-[#070d22] p-5 sm:flex-row">
            <div>
              <p className="text-sm font-extrabold text-white">Still have questions?</p>
              <p className="mt-1 text-xs text-slate-400">
                Talk to our team about fees, batch timings and whether this course fits your goal.
              </p>
            </div>
            <div className="flex w-full shrink-0 gap-2 sm:w-auto">
              <Button
                onClick={() => navigate("contact", { course: course.title })}
                className="btn-futur h-10 flex-1 rounded-xl px-5 text-sm font-bold text-white sm:flex-none"
              >
                Contact us
              </Button>
              <a
                href={whatsappUrl(settings, waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white sm:flex-none"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </Section>
      ) : null}

      {/* ═══════════════ RELATED ═══════════════ */}
      {related.length ? (
        <Section
          id="related"
          eyebrow="Keep exploring"
          title={`Other courses at ${settings.shortName || settings.name}`}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((other, index) => (
              <a
                key={other.id}
                href={coursePath(other)}
                className={cn(
                  CARD,
                  "group flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-cyber-400/40"
                )}
              >
                <div className="aspect-[16/9] w-full overflow-hidden border-b border-white/10">
                  <CoverArt course={other} iconClassName="h-12 w-12" variant={index + 1} />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="flex items-center gap-2 text-cyber-300">
                    <ContentIcon name={other.icon} className="h-4 w-4" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {other.duration}
                    </span>
                  </span>
                  <span className="mt-2 text-lg font-extrabold text-white">{other.title}</span>
                  <span className="mt-1 line-clamp-2 text-sm text-slate-400">{other.description}</span>
                  <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-bold uppercase tracking-wider text-cyber-300">
                    View course
                    <ArrowRight
                      className="h-3 w-3 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </Section>
      ) : null}

      <CtaBand
        title={course.ctaTitle || `Ready to start ${course.title}?`}
        description={
          course.ctaText ||
          `Talk to our team about the next ${course.title} batch, the fee and the admission process.`
        }
      />

      <StickyEnquire
        title={course.title}
        fee={course.fee}
        label={course.ctaLabel || "Enquire now"}
      />
    </article>
  );
}

/* ─────────────────────────── page sections ─────────────────────────── */

/** Capstone + mini projects — the "what you will build" part of the page. */
function ProjectsSection({
  courseTitle,
  projects,
  miniProjects,
}: {
  courseTitle: string;
  projects: { title: string; description: string; image?: string }[];
  miniProjects: { title: string; description: string; image?: string }[];
}) {
  return (
    <Section
      id="projects"
      eyebrow="Projects"
      title={`Projects you build in ${courseTitle}`}
      description="Build-along practice projects during the modules, then one portfolio-grade capstone you can demo in interviews."
    >
      {projects.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <Reveal key={`${project.title}-${index}`} delay={index * 0.05}>
              <article className={cn(CARD, "group flex h-full flex-col")}>
                <div className="aspect-[16/9] w-full overflow-hidden border-b border-white/10">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.22),transparent_58%),radial-gradient(circle_at_80%_80%,rgba(37,99,235,0.28),transparent_58%),linear-gradient(135deg,#070d22,#0b1433)]"
                    >
                      <Rocket className="h-10 w-10 text-cyber-300/80" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-cyber-400/25 bg-cyber-500/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-cyber-200">
                    Capstone
                  </span>
                  <h3 className="mt-2.5 text-base font-extrabold text-white">{project.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                    {project.description}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      ) : null}

      {miniProjects.length ? (
        <div className="mt-8">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300">
            Mini projects along the way
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {miniProjects.map((project, index) => (
              <Reveal key={`${project.title}-${index}`} delay={index * 0.04}>
                <div className="flex h-full items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600/80 to-cyber-500/80 text-white">
                    <Rocket className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{project.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                      {project.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      ) : null}
    </Section>
  );
}

/** "What's included" icon grid + certification block. */
function IncludedSection({
  includes,
  certificateTitle,
  certificateText,
  certificateImage,
}: {
  includes: { label: string; icon?: string }[];
  certificateTitle?: string;
  certificateText?: string;
  certificateImage?: string;
}) {
  if (!includes.length && !certificateTitle) return null;
  const Icon = getIcon;

  return (
    <Section
      id="included"
      eyebrow="What's included"
      title="Everything that comes with the program"
      description="Not just lectures — the notes, practice, feedback and support that turn classes into skills."
    >
      {includes.length ? (
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {includes.map((item, index) => {
            const ItemIcon = Icon(item.icon);
            return (
              <Reveal key={`${item.label}-${index}`} delay={index * 0.03}>
                <li className="flex h-full flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-4 text-center transition-colors hover:border-cyber-300/40 hover:bg-white/[0.06]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyber-400/25 bg-cyber-500/10 text-cyber-300">
                    <ItemIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-bold leading-tight text-slate-200">
                    {item.label}
                  </span>
                </li>
              </Reveal>
            );
          })}
        </ul>
      ) : null}

      {certificateTitle ? (
        <div className="mt-6 grid items-center gap-5 rounded-2xl border border-white/10 bg-gradient-to-r from-[#0c1738] to-[#070d22] p-5 sm:p-6 lg:grid-cols-[auto_1fr_auto]">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-cyber-500 text-white">
            <Award className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-white">{certificateTitle}</h3>
            {certificateText ? (
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-400">
                {certificateText}
              </p>
            ) : null}
          </div>
          {certificateImage ? (
            <img
              src={certificateImage}
              alt="Yantrix Technology course certificate"
              loading="lazy"
              decoding="async"
              className="h-24 w-auto rounded-lg border border-white/10 object-contain"
            />
          ) : null}
        </div>
      ) : null}
    </Section>
  );
}

/** Upcoming batches table. */
function BatchesSection({
  batches,
  onEnquire,
}: {
  batches: {
    label: string;
    timing: string;
    starts: string;
    seats: string;
    mode?: string;
  }[];
  onEnquire: (label: string) => void;
}) {
  if (!batches.length) return null;

  return (
    <Section
      id="batches"
      eyebrow="Batches & timings"
      title="Pick the batch that fits your week"
      description="Seats are limited per batch so every learner gets attention. Ask us before a batch fills up."
    >
      <div className="space-y-3">
        {batches.map((batch, index) => (
          <Reveal key={`${batch.label}-${index}`} delay={index * 0.05}>
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0a1230]/80 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyber-300">
                  {batch.mode === "Online" ? (
                    <Monitor className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <CalendarDays className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>
                <div>
                  <p className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-white">
                    {batch.label}
                    {batch.mode ? (
                      <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        {batch.mode}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    {batch.timing ? <span>{batch.timing}</span> : null}
                    {batch.starts ? <span>Starts: {batch.starts}</span> : null}
                    {batch.seats ? <span>{batch.seats}</span> : null}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => onEnquire(`${batch.label} — ${batch.timing}`)}
                variant="outline"
                className="h-9 shrink-0 rounded-lg border-white/20 bg-white/5 text-xs font-bold text-white hover:bg-white/10 hover:text-white"
              >
                Book a seat
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/** Placement & career support. */
function PlacementSection({
  title,
  text,
  points,
  onEnquire,
}: {
  title?: string;
  text?: string;
  points: string[];
  onEnquire: () => void;
}) {
  if (!points.length && !title) return null;

  return (
    <Section
      id="placement"
      eyebrow="Career support"
      title={title || "Placement & career support"}
      description={text}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {points.filter(Boolean).map((point, index) => (
          <Reveal key={`${point}-${index}`} delay={index * 0.04}>
            <div className="flex h-full items-start gap-3 rounded-2xl border border-white/10 bg-[#0a1230]/80 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-cyber-500 text-white">
                <Briefcase className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-sm leading-relaxed text-slate-200">{point}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Placement assistance includes resume, portfolio, mock interviews and job-search guidance.
        Yantrix Technology provides assistance and does not guarantee a job.
        <button
          onClick={onEnquire}
          className="ml-1 font-bold text-cyber-300 underline-offset-2 hover:underline"
        >
          Talk to us about the support
        </button>
      </p>
    </Section>
  );
}

/** Trainer / mentor card. */
function TrainerSection({
  trainer,
  fallback,
  city,
}: {
  trainer?: { name: string; role: string; photo?: string; bio?: string } | null;
  fallback?: string;
  city?: string;
}) {
  if (!trainer?.name && !fallback) return null;
  const name = trainer?.name || fallback || "";

  return (
    <Section id="trainer" eyebrow="Your mentor" title="Who teaches this course">
      <div className={cn(CARD, "flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-6")}>
        <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-brand-600 to-cyber-500 text-2xl font-black text-white">
          {trainer?.photo ? (
            <img
              src={trainer.photo}
              alt={name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            name.trim().charAt(0).toUpperCase()
          )}
        </span>
        <div>
          <h3 className="text-lg font-extrabold text-white">{name}</h3>
          {trainer?.role ? (
            <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-cyber-300">
              {trainer.role}
            </p>
          ) : null}
          {trainer?.bio ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">{trainer.bio}</p>
          ) : null}
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-cyber-300" aria-hidden="true" />
              Small batches, personal feedback
            </span>
            {city ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-cyber-300" aria-hidden="true" />
                Classroom in {city} · live online
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────── curriculum accordion ─────────────────────────── */

function CurriculumSection({
  courseTitle,
  modules,
  brochureTitle,
  brochureUrl,
  whatsappHref,
}: {
  courseTitle: string;
  modules: { title: string; topics: string[] }[];
  brochureTitle?: string;
  brochureUrl?: string;
  whatsappHref: string;
}) {
  const [open, setOpen] = useState<number[]>([0]);
  const allOpen = open.length === modules.length;

  const toggle = (index: number) =>
    setOpen((current) =>
      current.includes(index) ? current.filter((i) => i !== index) : [...current, index]
    );

  return (
    <Section
      id="curriculum"
      eyebrow="Course curriculum"
      title={`${courseTitle} syllabus, module by module`}
      description={`${modules.length} modules · ${modules.reduce((sum, m) => sum + (m.topics?.length ?? 0), 0)} topics. Expand any module to see what is covered.`}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {modules.length} modules
          </p>
          <button
            type="button"
            onClick={() => setOpen(allOpen ? [] : modules.map((_, index) => index))}
            className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-cyber-200 transition-colors hover:border-cyber-300/50 hover:text-white"
          >
            {allOpen ? "Collapse all" : "Expand all modules"}
          </button>
        </div>

        <ol className="space-y-3">
          {modules.map((module, index) => {
            const expanded = open.includes(index);
            const topics = (module.topics ?? []).filter(Boolean);
            return (
              <li
                key={`${module.title}-${index}`}
                className={cn(
                  "rounded-2xl border bg-[#0a1230]/80 transition-colors",
                  expanded ? "border-cyber-400/40" : "border-white/10"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={expanded}
                  aria-controls={`module-panel-${index}`}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left sm:px-5"
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black",
                      expanded
                        ? "bg-gradient-to-br from-brand-600 to-cyber-500 text-white"
                        : "border border-white/10 bg-white/5 text-slate-300"
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-extrabold text-white sm:text-base">
                      {module.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {topics.length} topic{topics.length === 1 ? "" : "s"}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-cyber-300 transition-transform",
                      expanded && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={`module-panel-${index}`}
                  hidden={!expanded}
                  className="border-t border-white/10 px-4 pb-4 pt-3 sm:px-5"
                >
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {topics.map((topic) => (
                      <li key={topic} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-cyber-300/80"
                          aria-hidden="true"
                        />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-cyber-500 text-white">
              <Download className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-white">{brochureTitle || "Course brochure"}</p>
              <p className="text-xs text-slate-400">
                Module list, tools and project details in one PDF.
              </p>
            </div>
          </div>
          {brochureUrl ? (
            <a
              href={brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-cyber-300/40 bg-cyber-500/10 px-5 text-sm font-bold text-cyber-200 transition-colors hover:bg-cyber-500/20"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download brochure
            </a>
          ) : (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Get the syllabus
            </a>
          )}
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────── mobile sticky CTA ─────────────────────────── */

function StickyEnquire({ title, fee, label }: { title: string; fee: string; label: string }) {
  const navigate = useSiteStore((s) => s.navigate);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#050914]/95 px-4 py-3 pr-24 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-white">{title}</p>
          <p className="text-[11px] font-semibold text-cyber-300">{fee || "Fee on request"}</p>
        </div>
        <Button
          onClick={() => navigate("contact", { course: title })}
          className="btn-futur h-10 shrink-0 rounded-xl px-4 text-sm font-bold text-white"
        >
          {label}
          <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
