"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteStore } from "@/lib/store";
import { useCollection, useSettings, useSiteContent } from "@/lib/content/provider";
import { ContentIcon } from "@/components/site/content-icon";
import { HeroField } from "@/components/site/hero-field";
import { cn } from "@/lib/utils";
import type { HeroSlide, TrustChip } from "@/lib/content/types";

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
      aria-roledescription="carousel"
      aria-label={`${settings.name} — highlights`}
      className="relative isolate flex min-h-[560px] items-center overflow-hidden bg-space text-white lg:min-h-[calc(100svh-7rem)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Base glow — also the fallback when WebGL is unavailable */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_80%_60%_at_70%_75%,rgba(37,99,235,0.35),transparent_70%),radial-gradient(ellipse_50%_40%_at_85%_30%,rgba(34,211,238,0.14),transparent_70%)]"
      />

      {/* The one interactive moment */}
      <HeroField className="absolute inset-0 -z-10" />

      {/* Readability: keep the copy side calm, let the field show on the right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-space via-space/80 to-space/10 lg:via-space/60 lg:to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-space to-transparent"
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

                <motion.h1
                  variants={textItem}
                  className="text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]"
                >
                  <span className="text-gradient-cyber">{slide.title}</span>
                </motion.h1>

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
