"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { tiltHandlers } from "@/components/site/fx";
import { Aurora, LightBeam } from "@/components/site/svg-decor";
import { HudCorners, ScanSweep } from "@/components/site/ai-decor";
import { useCollection, useSection } from "@/lib/content/provider";
import { ContentIcon } from "@/components/site/content-icon";
import type { Feature, TrainingMode } from "@/lib/content/types";
import { useSiteStore } from "@/lib/store";

export function BadgesStrip() {
  const items = useCollection<Feature>("badges");
  const section = useSection("badges");
  if (section.hidden || items.length === 0) return null;

  return (
    <section
      className="relative z-10 bg-white pb-4"
      aria-label={section.eyebrow || "Key highlights"}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid -translate-y-12 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {items.map((badge, i) => {
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.15 + i * 0.1,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                className="card-glow group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-lg shadow-brand-950/[0.06] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-900/10"
              >
                <HudCorners />
                <ScanSweep />
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 via-brand-700 to-cyber-600 text-white shadow-md shadow-brand-700/25 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-[0_0_24px_-4px_rgba(34,211,238,0.6)]">
                  <ContentIcon name={badge.icon} className="h-6 w-6" />
                </span>
                <div>
                  {/* Not a heading: these cards orbit the hero between <h1> and the
                    first <h2>, so an <h3> here breaks the heading order. */}
                  <p className="text-base font-extrabold text-ink">
                    {badge.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {badge.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WhyChooseUs() {
  const items = useCollection<Feature>("features");
  const section = useSection("why");
  if (section.hidden || items.length === 0) return null;

  return (
    <section
      className="bg-slate-50 py-16 sm:py-20"
      aria-labelledby="why-choose-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />
        <div className="mt-12 grid gap-5 [perspective:1400px] sm:grid-cols-2 lg:grid-cols-3">
          {items.map((feature, i) => {
            return (
              <motion.article
                key={feature.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.5,
                  delay: (i % 3) * 0.08,
                  ease: "easeOut",
                }}
                {...tiltHandlers(4)}
                className="tilt-card spotlight-card card-glow group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/[0.08]"
              >
                {/* animated corner glow */}
                <span
                  aria-hidden="true"
                  className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-brand-100/0 blur-2xl transition-all duration-500 group-hover:bg-cyber-300/40"
                />
                <HudCorners />
                <ScanSweep />

                {/* Icon with dash-flow ring + wiggle on hover */}
                <span className="relative z-10 flex h-13 w-13 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-brand-600 group-hover:to-cyber-500 group-hover:text-white group-hover:shadow-[0_0_24px_-4px_rgba(34,211,238,0.65)]">
                  <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    aria-hidden="true"
                    className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="47"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="dash-flow text-cyber-400"
                      strokeLinecap="round"
                    />
                  </svg>
                  <ContentIcon
                    name={feature.icon}
                    className="h-6.5 w-6.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                  />
                </span>

                <h3 className="relative z-10 mt-5 text-lg font-extrabold text-ink">
                  {feature.title}
                </h3>
                <p className="relative z-10 mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function TrainingModes() {
  const modes = useCollection<TrainingMode>("trainingModes");
  const section = useSection("modes");
  if (section.hidden || modes.length === 0) return null;

  return (
    <section
      className="bg-white py-16 sm:py-20"
      aria-labelledby="training-modes-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 [perspective:1400px] md:grid-cols-2">
          {modes.map((mode, i) => (
            <Reveal key={mode.id} delay={i * 0.1}>
              <div
                {...tiltHandlers(4)}
                className={
                  mode.style === "dark"
                    ? "tilt-card spotlight-card spotlight-dark card-glow-dark relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-950 to-space p-7 text-white shadow-xl shadow-brand-900/20"
                    : "tilt-card spotlight-card card-glow relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                }
              >
                {/* futuristic inner decor for the dark card */}
                {mode.style === "dark" ? (
                  <>
                    <Aurora className="opacity-60" />
                    <LightBeam />
                  </>
                ) : null}
                <HudCorners dark={mode.style === "dark"} />
                <ScanSweep />

                {/* Icon chip */}
                <span
                  className={
                    mode.style === "dark"
                      ? "relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-brand-200 ring-1 ring-white/15 transition-transform duration-300 hover:scale-110"
                      : "relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-transform duration-300 hover:scale-110"
                  }
                >
                  <ContentIcon name={mode.icon} className="h-6 w-6" />
                </span>

                <h3
                  className={
                    mode.style === "dark"
                      ? "mt-4 text-xl font-extrabold text-white"
                      : "mt-4 text-xl font-extrabold text-ink"
                  }
                >
                  {mode.name}
                </h3>
                <p
                  className={
                    mode.style === "dark"
                      ? "mt-1 text-sm text-brand-200"
                      : "mt-1 text-sm text-brand-700"
                  }
                >
                  {mode.tagline}
                </p>
                <ul className="mt-5 flex-1 space-y-3">
                  {mode.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 transition-transform duration-300 hover:translate-x-1.5"
                    >
                      <CheckIcon dark={mode.style === "dark"} />
                      <span
                        className={
                          mode.style === "dark"
                            ? "text-sm leading-relaxed text-slate-200"
                            : "text-sm leading-relaxed text-slate-700"
                        }
                      >
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => useSiteStore.getState().navigate("contact")}
                  className={
                    mode.style === "dark"
                      ? "btn-shine mt-6 h-11 w-full rounded-full bg-white text-sm font-bold text-brand-900 transition-all hover:-translate-y-0.5 hover:bg-brand-100"
                      : "mt-6 h-11 w-full rounded-full border-2 border-brand-700 text-sm font-bold text-brand-700 transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:text-white"
                  }
                >
                  {mode.cta}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ dark }: { dark?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={
        dark
          ? "mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-300"
          : "mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-600"
      }
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}
