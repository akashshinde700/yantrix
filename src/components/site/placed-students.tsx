"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, Quote, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SectionHeading } from "@/components/site/section-heading";
import { PersonPhoto } from "@/components/site/trainers-section";
import { useCollection, useSection } from "@/lib/content/provider";
import type { PlacedStudent } from "@/lib/content/types";
import { cn } from "@/lib/utils";

function StudentCard({ student, className }: { student: PlacedStudent; className?: string }) {
  return (
    <article
      className={cn(
        "group flex h-full w-[300px] shrink-0 flex-col gap-4 rounded-3xl border border-white/10 bg-[#0a1230]/85 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-[0_18px_40px_-18px_rgba(34,211,238,0.55)]",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="h-16 w-16 overflow-hidden rounded-2xl">
            <PersonPhoto
              src={student.photo}
              name={student.name}
              className="h-16 w-16 text-[11px] transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <BadgeCheck
            className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-[#0a1230] text-emerald-300"
            aria-label="Placed"
          />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-extrabold text-white">{student.name}</h3>
          {student.role && <p className="truncate text-sm text-slate-300">{student.role}</p>}
          {student.company && (
            <p className="line-clamp-2 text-sm font-bold leading-snug text-cyber-200">
              <span className="sr-only">at </span>
              {student.company}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {student.course && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-200">
            {student.course}
          </span>
        )}
        {student.batch && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
            Batch {student.batch}
          </span>
        )}
        {student.package && (
          <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-200">
            {student.package}
          </span>
        )}
      </div>
      {student.quote && (
        <p className="relative line-clamp-3 pl-6 text-sm italic leading-relaxed text-slate-400">
          <Quote className="absolute left-0 top-0.5 h-4 w-4 text-cyber-400/60" aria-hidden="true" />
          {student.quote}
        </p>
      )}
    </article>
  );
}

const FIRST_BATCH = 15;

/**
 * The card grid inside the panel. Mounted only while the panel is open, so it
 * renders the first 15 cards immediately (the panel appears instantly) and
 * the rest once the opening animation has played. Cards cascade in; when the
 * filter changes, removed cards fade out and — for small result sets — the
 * remaining ones glide into their new places.
 */
function PlacedGrid({ shown, reduced }: { shown: PlacedStudent[]; reduced: boolean }) {
  const [limit, setLimit] = useState(FIRST_BATCH);
  useEffect(() => {
    const t = setTimeout(() => setLimit(Number.POSITIVE_INFINITY), 650);
    return () => clearTimeout(t);
  }, []);
  const visible = shown.slice(0, limit);
  const glide = !reduced && shown.length <= 40; // layout tracking is cheap only for small sets

  return (
    <ul className="placed-scroll -mx-1 grid flex-1 content-start gap-3 overflow-y-auto px-1 pb-2 pt-1 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout" initial>
        {visible.map((s, i) => {
          const blur = i < FIRST_BATCH;
          return (
            <motion.li
              key={s.id}
              layout={glide}
              initial={reduced ? false : { opacity: 0, y: 18, scale: 0.96, ...(blur ? { filter: "blur(6px)" } : {}) }}
              animate={{ opacity: 1, y: 0, scale: 1, ...(blur ? { filter: "blur(0px)" } : {}) }}
              exit={reduced ? undefined : { opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
              transition={{
                duration: 0.45,
                delay: reduced ? 0 : i < FIRST_BATCH ? 0.28 + i * 0.035 : Math.min(i - FIRST_BATCH, 20) * 0.02,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <StudentCard student={s} className="w-full" />
            </motion.li>
          );
        })}
      </AnimatePresence>
      {shown.length === 0 && (
        <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-12 text-center text-sm text-slate-400">
          No students match your search.
        </motion.li>
      )}
    </ul>
  );
}

/** Every placed student, searchable by name or company, with quick company filters. */
function AllPlacedDialog({ students }: { students: PlacedStudent[] }) {
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const companies = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of students) if (s.company) counts.set(s.company, (counts.get(s.company) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [students]);
  const q = query.trim().toLowerCase();
  const shown = students.filter(
    (s) => (!company || s.company === company) && (!q || `${s.name} ${s.company} ${s.course} ${s.role}`.toLowerCase().includes(q))
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group mx-auto mt-10 flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-cyan-400/20 hover:shadow-[0_0_30px_-6px_rgba(34,211,238,0.7)]"
        >
          View all {students.length} placed students
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </button>
      </DialogTrigger>
      <DialogContent
        data-lenis-prevent
        className="placed-dialog flex max-h-[90svh] flex-col overflow-hidden border-white/10 bg-[#070d22] text-white sm:max-w-5xl"
      >
        {/* header + live counter */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-end justify-between gap-3 pr-8"
        >
          <div>
            <DialogTitle className="text-2xl font-extrabold">All placed students</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-slate-400">
              Search by name or company, or pick a company below.
            </DialogDescription>
          </div>
          <p className="text-sm text-slate-400" aria-live="polite">
            Showing{" "}
            <motion.span
              key={shown.length}
              initial={reduced ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block min-w-[2ch] text-right text-lg font-extrabold text-white"
            >
              {shown.length}
            </motion.span>{" "}
            of {students.length}
          </p>
        </motion.div>

        {/* search + company chips */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <label htmlFor="placed-search" className="sr-only">Search placed students</label>
            <input
              id="placed-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or company…"
              className="h-11 w-full rounded-full border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white transition-shadow placeholder:text-slate-500 focus:border-cyan-300/50 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.12)] focus:outline-none"
            />
          </div>
          {companies.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {[null, ...companies.map(([c]) => c)].map((c) => {
                const active = company === c;
                return (
                  <button
                    key={c ?? "all"}
                    type="button"
                    onClick={() => setCompany(c)}
                    aria-pressed={active}
                    className={cn(
                      "relative rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                      active ? "border-transparent text-white" : "border-white/10 text-slate-300 hover:border-white/25 hover:text-white"
                    )}
                  >
                    {/* the highlight slides from chip to chip */}
                    {active && (
                      <motion.span
                        layoutId="placed-chip"
                        className="absolute inset-0 rounded-full border border-cyan-300/60 bg-gradient-to-r from-cyan-400/25 to-violet-500/25 shadow-[0_0_16px_-4px_rgba(34,211,238,0.8)]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative">{c ?? "All"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        <PlacedGrid shown={shown} reduced={Boolean(reduced)} />
      </DialogContent>
    </Dialog>
  );
}

/**
 * Students who got placed (admin: /admin/placed-students). 6+ students: two
 * marquee rows drifting in opposite directions (pause on hover, static for
 * reduced motion); fewer: a simple grid. Hidden when switched off or empty.
 */
export function PlacedStudents() {
  const section = useSection("placedStudents");
  const students = useCollection<PlacedStudent>("placedStudents");
  if (section.hidden || students.length === 0) return null;

  const marquee = students.length >= 6;
  const half = Math.ceil(students.length / 2);
  const rows = [students.slice(0, half), students.slice(half)];

  return (
    <section className="relative py-16 sm:py-20" aria-label={section.eyebrow || "Placed students"}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} description={section.description} />
        <p className="mt-5 text-center text-sm font-semibold text-slate-400">
          <span className="text-2xl font-extrabold text-white">{students.length}</span> students placed and counting
        </p>
      </div>

      {marquee ? (
        <div className="placed-marquee mt-10 space-y-5">
          {rows.map((row, r) => (
            <div key={r} className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
              <ul
                className={cn("placed-track flex w-max gap-5", r === 1 && "placed-track-reverse")}
                // calm, constant speed however many students there are (~3.2 s per card)
                style={{ animationDuration: `${Math.max(40, row.length * 3.2)}s` }}
              >
                {[...row, ...row].map((student, i) => (
                  <li key={`${student.id}-${i}`} aria-hidden={i >= row.length ? true : undefined}>
                    <StudentCard student={student} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex justify-center px-4">
            <AllPlacedDialog students={students} />
          </div>
        </div>
      ) : (
        <ul className="mx-auto mt-10 flex max-w-7xl flex-wrap justify-center gap-5 px-4 sm:px-6">
          {students.map((student, i) => (
            <motion.li
              key={student.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <StudentCard student={student} />
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
