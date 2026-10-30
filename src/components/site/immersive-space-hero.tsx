"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteStore } from "@/lib/store";
import { useCollection, useSettings, useSiteContent } from "@/lib/content/provider";
import { ContentIcon } from "@/components/site/content-icon";
import { cn } from "@/lib/utils";
import type { HeroSlide, Stat, TrustChip } from "@/lib/content/types";
import { WordReveal } from "@/components/site/word-reveal";

const AUTOPLAY_MS = 6500;

const textContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const textItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export function ImmersiveSpaceHero() {
  const navigate = useSiteStore((s) => s.navigate);
  const settings = useSettings();
  const heroSlides = useCollection<HeroSlide>("heroSlides");
  const trustChips = useCollection<TrustChip>("trustChips");
  const stats = useCollection<Stat>("stats");
  const home = useSiteContent().pages.home;
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = heroSlides.length;
  const go = useCallback(
    (dir: 1 | -1) => {
      if (total < 1) return;
      setIndex((i) => (i + dir + total) % total);
    },
    [total]
  );

  const autoplay = !paused && !reducedMotion && total > 1;
  useEffect(() => {
    if (!autoplay) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [autoplay, total]);

  if (total === 0) {
    return (
      <section className="relative isolate overflow-hidden bg-space py-24 text-center text-white">
        <p className="text-sm font-semibold text-slate-300">
          No hero slides yet — add one from the admin panel.
        </p>
      </section>
    );
  }

  const slide = heroSlides[Math.min(index, total - 1)];

  return (
    <section
      id="home-hero"
      aria-roledescription="carousel"
      aria-label={`${settings.name} — highlights`}
      className="relative isolate flex min-h-[600px] items-center overflow-hidden text-white lg:min-h-[calc(100svh-7rem)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* The 3D universe (site shell) shows through; keep the copy side readable */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#02040c]/90 via-[#02040c]/55 to-transparent max-lg:bg-gradient-to-b max-lg:from-[#02040c]/30 max-lg:via-[#02040c]/70 max-lg:to-[#02040c]/90"
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex items-center justify-between gap-10">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${index}`}
                variants={textContainer}
                initial={reducedMotion ? false : "hidden"}
                animate="show"
                className="flex flex-col items-start gap-5"
              >
                <motion.span
                  variants={textItem}
                  className="inline-flex items-center gap-2.5 rounded-full border border-cyber-400/25 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-cyber-200 backdrop-blur-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-400" aria-hidden="true" />
                  {slide.eyebrow}
                </motion.span>

                <h1 className="text-[2.5rem] font-extrabold leading-[1.04] tracking-tight text-balance sm:text-6xl lg:text-[4.1rem]">
                  <WordReveal text={slide.title} wordClassName="text-gradient-cyber" onMount delay={0.15} stagger={0.07} />
                </h1>

                <motion.p
                  variants={textItem}
                  className="max-w-xl text-base leading-relaxed text-slate-300 text-pretty sm:text-lg"
                >
                  {slide.description}
                </motion.p>

                <motion.div variants={textItem} className="mt-1 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => navigate("courses")}
                    className="btn-futur h-12 rounded-full px-7 text-base font-bold text-white"
                  >
                    {home.heroPrimaryCta}
                  </Button>
                  <Button
                    onClick={() => navigate("contact")}
                    variant="outline"
                    className="h-12 rounded-full border-white/20 bg-white/5 px-7 text-base font-bold text-white backdrop-blur-sm transition-colors hover:border-cyber-300/60 hover:bg-white/10 hover:text-white"
                  >
                    {home.heroSecondaryCta}
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Trust row — real figures from the stats collection */}
            {stats.length > 0 && (
              <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6">
                {stats.slice(0, 3).map((stat) => (
                  <div key={stat.id} className="flex items-baseline gap-2">
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="text-2xl font-extrabold tracking-tight text-white">
                      {stat.value}
                      <span className="text-cyber-300">{stat.suffix}</span>
                    </dd>
                    <span aria-hidden="true" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </dl>
            )}

            {/* Slide controls */}
            {total > 1 && (
              <div className="mt-10 flex items-center gap-4">
                <button
                  onClick={() => go(-1)}
                  aria-label="Previous slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-slate-200 transition-colors hover:border-cyber-300/60 hover:text-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-2">
                  {heroSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      aria-current={i === index ? "true" : undefined}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        i === index ? "w-8 bg-cyber-400" : "w-2 bg-white/30 hover:bg-white/60"
                      )}
                    />
                  ))}
                </div>
                <button
                  onClick={() => go(1)}
                  aria-label="Next slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-slate-200 transition-colors hover:border-cyber-300/60 hover:text-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Trust chips (desktop) */}
          {home.heroTrustChips && trustChips.length > 0 && (
            <div className="hidden shrink-0 flex-col gap-4 xl:flex">
              {trustChips.map((chip, i) => (
                <motion.div
                  key={chip.id}
                  initial={reducedMotion ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.12, duration: 0.5, ease: "easeOut" }}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-space/60 p-4 pr-6 backdrop-blur-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
                    <ContentIcon name={chip.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{chip.title}</p>
                    <p className="text-xs text-slate-300">{chip.subtitle}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-20 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-slate-400">Scroll to explore</span>
        <span className="relative h-9 w-5 rounded-full border border-white/25">
          <span className="scroll-cue-dot absolute left-1/2 top-1.5 h-2 w-0.5 -translate-x-1/2 rounded-full bg-cyber-300" />
        </span>
      </div>

      {/* Autoplay progress */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" aria-hidden="true">
        {autoplay && (
          <motion.div
            key={`progress-${index}`}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
            className="h-full bg-gradient-to-r from-brand-500 to-cyber-400"
          />
        )}
      </div>
    </section>
  );
}
