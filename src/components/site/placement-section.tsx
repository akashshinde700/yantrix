"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { HeroDecor } from "@/components/site/svg-decor";
import { tiltHandlers } from "@/components/site/fx";
import { placementPoints } from "@/lib/data";

export function PlacementSection() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-950 to-ink py-16 sm:py-20"
      aria-labelledby="placement-heading"
    >
      {/* Decorative glows + animated SVG decor */}
      <HeroDecor
        orbitClassName="-left-20 top-10 h-64 w-64 text-brand-400/30"
        circuitClassName="absolute inset-x-0 bottom-0 h-36 w-full text-brand-400/20"
      />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          dark
          eyebrow="Placement Assistance"
          title="Placement assistance that works for you, step by step"
          description="We prepare you for the hiring process with structured, honest support — from your resume to your final interview rounds."
        />
        <div className="mt-12 grid gap-5 [perspective:1400px] sm:grid-cols-2 lg:grid-cols-4">
          {placementPoints.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              {...tiltHandlers(4)}
              className="tilt-card spotlight-card spotlight-dark group rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/[0.1] hover:ring-white/20"
            >
              <span className="inline-block text-sm font-black tracking-widest text-brand-300 transition-transform duration-300 group-hover:scale-110">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-base font-extrabold text-white">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{point.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Honest disclaimer (AEO/GEO-friendly) */}
        <p className="mx-auto mt-10 flex max-w-3xl items-start justify-center gap-2 rounded-xl bg-white/[0.05] px-5 py-4 text-center text-[13px] leading-relaxed text-slate-300 ring-1 ring-white/10">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
          <span>
            <strong className="font-bold text-white">Please note:</strong> Yantrix Technology
            provides <em className="not-italic font-semibold text-brand-200">placement assistance</em> to
            all eligible students. We do not offer a 100% placement guarantee.
          </span>
        </p>
      </div>
    </section>
  );
}
