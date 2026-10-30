"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
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
        "group flex h-full w-[300px] shrink-0 flex-col gap-4 rounded-3xl border border-white/10 bg-[#0a1230]/85 p-5 transition-colors duration-300 hover:border-cyan-300/40",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <PersonPhoto src={student.photo} name={student.name} className="h-16 w-16 rounded-2xl text-[11px]" />
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

/** Every placed student, searchable by name or company, with quick company filters. */
function AllPlacedDialog({ students }: { students: PlacedStudent[] }) {
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState<string | null>(null);
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
          className="mx-auto mt-10 flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-cyan-400/20"
        >
          View all {students.length} placed students
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </DialogTrigger>
      <DialogContent data-lenis-prevent className="flex max-h-[90svh] flex-col border-white/10 bg-[#070d22] text-white sm:max-w-5xl">
        <div>
          <DialogTitle className="text-2xl font-extrabold">All placed students</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-slate-400">
            {students.length} students placed — search by name or company.
          </DialogDescription>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <label htmlFor="placed-search" className="sr-only">Search placed students</label>
          <input
            id="placed-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or company…"
            className="h-11 w-full rounded-full border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/50 focus:outline-none"
          />
        </div>
        {companies.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {[null, ...companies.map(([c]) => c)].map((c) => (
              <button
                key={c ?? "all"}
                type="button"
                onClick={() => setCompany(c)}
                aria-pressed={company === c}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  company === c ? "border-cyan-300/60 bg-cyan-400/15 text-white" : "border-white/10 text-slate-300 hover:text-white"
                )}
              >
                {c ?? "All"}
              </button>
            ))}
          </div>
        )}
        <ul className="-mx-1 grid flex-1 gap-3 overflow-y-auto px-1 pb-1 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {shown.map((s) => (
            <li key={s.id}>
              <StudentCard student={s} className="w-full" />
            </li>
          ))}
          {shown.length === 0 && <li className="col-span-full py-10 text-center text-sm text-slate-400">No students match your search.</li>}
        </ul>
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
