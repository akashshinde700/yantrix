"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { useCollection, useSection, useSettings } from "@/lib/content/provider";
import type { PlacementPoint } from "@/lib/content/types";

/**
 * Placement support as a journey: numbered nodes on a line that draws itself
 * across the steps as the section scrolls into view.
 */
export function PlacementSection() {
  const points = useCollection<PlacementPoint>("placementPoints");
  const section = useSection("placement");
  const settings = useSettings();
  if (section.hidden || points.length === 0) return null;

  return (
    <section className="relative py-16 sm:py-20" aria-labelledby="placement-heading">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading dark eyebrow={section.eyebrow} title={section.title} description={section.description} />

        <div className="relative mt-14">
          {/* the path — desktop: horizontal through the nodes; mobile: vertical */}
          <motion.span
            aria-hidden="true"
            className="absolute left-5 right-5 top-5 hidden h-px origin-left bg-gradient-to-r from-cyan-400/0 via-cyan-300/80 to-violet-400/0 lg:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.span
            aria-hidden="true"
            className="absolute bottom-5 left-5 top-5 w-px origin-top bg-gradient-to-b from-cyan-300/80 via-cyan-300/40 to-violet-400/0 lg:hidden"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          />

          <ol className="relative grid gap-6 lg:grid-cols-4 lg:gap-5">
            {points.map((point, i) => (
              <motion.li
                key={point.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: 0.25 + i * 0.18, ease: "easeOut" }}
                className="group flex gap-5 lg:block"
              >
                <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-300/50 bg-[#050a1c] font-mono text-sm font-black text-cyan-200 shadow-[0_0_22px_-4px_rgba(34,211,238,0.75)] transition-transform duration-300 group-hover:scale-110">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 rounded-2xl border border-white/10 bg-[#0a1230]/80 p-5 transition-colors duration-300 group-hover:border-cyan-300/40 lg:mt-5">
                  <h3 className="text-base font-extrabold text-white">{point.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{point.description}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Honest disclaimer (AEO/GEO-friendly) */}
        <p className="mx-auto mt-10 flex max-w-3xl items-start justify-center gap-2 rounded-xl bg-white/[0.05] px-5 py-4 text-center text-[13px] leading-relaxed text-slate-300 ring-1 ring-white/10">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
          <span>
            <strong className="font-bold text-white">Please note:</strong> {settings.name} {settings.footer.disclaimer}
          </span>
        </p>
      </div>
    </section>
  );
}
