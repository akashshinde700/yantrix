"use client";

import { SectionHeading } from "@/components/site/section-heading";
import { Counter } from "@/components/site/fx";
import { Reveal } from "@/components/site/reveal";
import { Aurora, HexRing, PulseGrid } from "@/components/site/svg-decor";
import { HudCorners } from "@/components/site/ai-decor";
import { CalendarDays, Layers, MonitorSmartphone, Target, type LucideIcon } from "lucide-react";

/* ────────────────────────────────────────────────────────────────────
   TechTicker — infinite marquee of technologies taught across courses.
   Inspired by leading IT-institute sites; pauses on hover.
   ──────────────────────────────────────────────────────────────────── */

const techStack = [
  "HTML5",
  "CSS3",
  "JavaScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "SQL",
  "Power BI",
  "Excel",
  "Figma",
  "SEO",
  "Google Ads",
  "Git & GitHub",
  "MS Office",
  "ChatGPT for Work",
];

export function TechTicker() {
  const row = [...techStack, ...techStack]; // duplicated for a seamless -50% loop

  return (
    <section aria-label="Technologies you will learn" className="border-y border-slate-100 bg-white py-7">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Skills you&apos;ll learn — across development, data, design &amp; marketing
        </p>
      </div>
      <div className="marquee-mask marquee-hover overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-3 pr-3">
          {row.map((tech, i) => (
            <span
              key={`${tech}-${i}`}
              aria-hidden={i >= techStack.length}
              className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-cyber-400/60 hover:text-cyber-700 hover:shadow-[0_0_20px_-4px_rgba(34,211,238,0.45)]"
            >
              <span
                className="h-2 w-2 rounded-full bg-gradient-to-br from-brand-500 to-cyber-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                aria-hidden="true"
              />
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────
   StatsBand — honest, animated counters (no fabricated numbers):
   founded year, number of courses, learning modes, practical focus.
   ──────────────────────────────────────────────────────────────────── */

interface Stat {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
  sub: string;
}

const stats: Stat[] = [
  {
    icon: CalendarDays,
    value: 2024,
    suffix: "",
    label: "Founded",
    sub: "A new-age IT training institute",
  },
  {
    icon: Layers,
    value: 8,
    suffix: "+",
    label: "Career Courses",
    sub: "Development, data, design & marketing",
  },
  {
    icon: MonitorSmartphone,
    value: 2,
    suffix: "",
    label: "Learning Modes",
    sub: "Live online & classroom batches",
  },
  {
    icon: Target,
    value: 100,
    suffix: "%",
    label: "Practical Learning",
    sub: "Project-based, hands-on curriculum",
  },
];

export function StatsBand() {
  return (
    <section
      className="relative overflow-hidden bg-space py-14 sm:py-16"
      aria-label="Yantrix Technology in numbers"
    >
      {/* futuristic decor */}
      <Aurora className="opacity-80" />
      <PulseGrid className="opacity-50" />
      <HexRing className="pointer-events-none absolute -left-16 top-1/2 hidden h-64 w-64 -translate-y-1/2 text-cyber-400/20 lg:block" />
      <HexRing className="pointer-events-none absolute -right-20 top-0 hidden h-72 w-72 text-brand-400/20 lg:block" />
      <div
        className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-brand-500/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-cyber-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          dark
          eyebrow="Yantrix in Numbers"
          title="Small institute, serious standards"
          description="Real, verifiable facts — no inflated counts, no fake promises. Just focused, practical IT training."
        />

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div className="group relative flex flex-col items-center text-center">
                <HudCorners dark className="rounded-2xl" />
                {/* icon with orbiting dash ring on hover */}
                <span className="glass relative flex h-14 w-14 items-center justify-center rounded-2xl text-cyber-300 shadow-[0_0_22px_-6px_rgba(34,211,238,0.45)] transition-colors duration-300 group-hover:text-white">
                  <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    aria-hidden="true"
                    className="absolute -inset-2.5 h-[calc(100%+20px)] w-[calc(100%+20px)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="48"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="dash-flow text-cyber-400"
                      strokeLinecap="round"
                    />
                  </svg>
                  <stat.icon className="h-6.5 w-6.5 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                </span>

                <p className="text-glow-soft mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
                  <Counter to={stat.value} />
                  <span className="text-gradient-cyber">{stat.suffix}</span>
                </p>
                <p className="mt-1.5 text-sm font-extrabold uppercase tracking-wider text-cyber-200">
                  {stat.label}
                </p>
                <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-slate-400">{stat.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
