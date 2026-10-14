"use client";

import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { Aurora, FloatingCodeChips, LightBeam, OrbitRings, PulseGrid } from "@/components/site/svg-decor";
import { DataStreams, HudCorners, RoboBuddy } from "@/components/site/ai-decor";
import { useSiteStore } from "@/lib/store";

/** Reusable call-to-action band shown at the bottom of pages. */
export function CtaBand({
  title = "Start your IT journey with Yantrix Technology today",
  description = "Not sure which course fits you? Talk to our team — we'll help you choose based on your goals and background.",
}: {
  title?: string;
  description?: string;
}) {
  const navigate = useSiteStore((s) => s.navigate);

  return (
    <section className="bg-white py-14 sm:py-16" aria-label="Call to action">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-space px-6 py-12 shadow-2xl shadow-brand-950/30 ring-1 ring-white/10 sm:px-12">
            {/* futuristic decor */}
            <Aurora className="opacity-90" />
            <PulseGrid className="opacity-50" />
            <DataStreams className="opacity-[0.12]" />
            <LightBeam />
            <HudCorners dark className="rounded-3xl" />
            <OrbitRings
              className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 text-cyber-300/25"
            />
            <OrbitRings
              className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 text-brand-400/20"
            />
            <FloatingCodeChips className="hidden md:block" />
            <RoboBuddy className="absolute -left-7 bottom-4 hidden h-32 w-32 text-cyber-300/80 lg:block" />

            <h2 className="relative text-2xl font-extrabold tracking-tight text-white text-balance sm:text-3xl">
              <span className="sr-only">{title}</span>
              <span aria-hidden="true" className="text-gradient-cyber glitch-hover" data-text={title}>
                {title}
              </span>
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              {description}
            </p>
            <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate("courses")}
                className="btn-futur btn-shine inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-bold text-white"
              >
                Explore Courses
                <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 hover:translate-x-0.5" aria-hidden="true" />
              </button>
              <button
                onClick={() => navigate("contact")}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-cyber-400/40 bg-white/5 px-7 text-sm font-bold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-cyber-300/70 hover:bg-white/10 hover:text-cyber-200 hover:shadow-[0_0_28px_-6px_rgba(34,211,238,0.5)]"
              >
                Contact for Admission
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
