"use client";

import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
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
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-800 to-brand-950 px-6 py-12 text-center shadow-2xl shadow-brand-900/25 sm:px-12">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl"
              aria-hidden="true"
            />
            <h2 className="relative text-2xl font-extrabold tracking-tight text-white text-balance sm:text-3xl">
              {title}
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-100 sm:text-base">
              {description}
            </p>
            <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate("courses")}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-brand-900 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-50"
              >
                Explore Courses
                <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
              <button
                onClick={() => navigate("contact")}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 text-sm font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/15"
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
