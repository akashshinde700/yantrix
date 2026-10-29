"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteStore } from "@/lib/store";
import { useCollection, useSettings, useSiteContent } from "@/lib/content/provider";
import { ContentIcon } from "@/components/site/content-icon";
import type { HeroSlide, TrustChip } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { CircuitLines, GridDots, HexRing, OrbitRings, Particles, PulseGrid, Aurora } from "@/components/site/svg-decor";
import { DataStreams, HudStatusChip, NeuralCore } from "@/components/site/ai-decor";
import { Magnetic, ScrambleText, TerminalTyper } from "@/components/site/ai-fx";

const AUTOPLAY_MS = 6000;

/* Staggered entrance for slide text */
const textContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};
const textItem: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export function HeroSlider() {
  const navigate = useSiteStore((s) => s.navigate);
  const settings = useSettings();
  const heroSlides = useCollection<HeroSlide>("heroSlides");
  const trustChips = useCollection<TrustChip>("trustChips");
  const home = useSiteContent().pages.home;
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

  useEffect(() => {
    if (paused || total < 2) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, index, total]);

  /* Guard: nothing to show if every slide was removed in the admin panel */
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
      aria-label={`${settings.name} highlights`}
      className="relative isolate overflow-hidden bg-space"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div className="relative h-[560px] sm:h-[600px] lg:h-[660px]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* Ken Burns slow zoom on the active image */}
            <div key={`kb-${index}`} className="animate-kenburns absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 640px) 640px, (max-width: 1280px) 1280px, 1344px"
                className="object-cover"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Futuristic dark overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-space/97 via-[#070c1e]/78 to-brand-900/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-space via-space/25 to-transparent" />

        {/* Animated futuristic layers */}
        <Aurora className="opacity-90" />
        <PulseGrid className="opacity-60" />
        <GridDots className="opacity-30" />
        <DataStreams className="opacity-[0.13]" />
        <CircuitLines className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-44 w-full text-cyber-400/25 lg:block" />
        <OrbitRings className="pointer-events-none absolute -right-24 top-1/2 hidden h-[440px] w-[440px] -translate-y-1/2 text-cyber-300/25 xl:block" />
        <HexRing className="pointer-events-none absolute -left-16 -bottom-20 hidden h-72 w-72 text-brand-400/25 lg:block" />
        <NeuralCore className="pointer-events-none absolute -right-28 top-1/2 hidden h-[560px] w-[560px] -translate-y-1/2 text-cyber-300/45 xl:block" />
        <Particles className="opacity-80" />

        {/* Content */}
        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6">
            <div className="max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`text-${index}`}
                  variants={textContainer}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col items-start gap-5"
                >
                  <motion.span
                    variants={textItem}
                    className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-cyber-200 shadow-[0_0_24px_-6px_rgba(34,211,238,0.45)]"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyber-400 opacity-75" />
                      <span className="dot-pulse relative inline-flex h-1.5 w-1.5 rounded-full bg-cyber-400" />
                    </span>
                    <ScrambleText text={slide.eyebrow} />
                  </motion.span>

                  <motion.h1
                    variants={textItem}
                    className="text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]"
                  >
                    <span className="sr-only">{slide.title}</span>
                    <span
                      aria-hidden="true"
                      className="text-gradient-cyber glitch-hover"
                      data-text={slide.title}
                    >
                      {slide.title}
                    </span>
                  </motion.h1>

                  <motion.p
                    variants={textItem}
                    className="max-w-xl text-base leading-relaxed text-slate-300 text-pretty sm:text-lg"
                  >
                    {slide.description}
                  </motion.p>

                  <motion.div variants={textItem} className="mt-1 flex flex-wrap items-center gap-3">
                    <Magnetic>
                      <Button
                        onClick={() => navigate("courses")}
                        className="btn-futur btn-shine h-12 rounded-full px-7 text-base font-bold text-white"
                      >
                        {home.heroPrimaryCta}
                      </Button>
                    </Magnetic>
                    <Magnetic>
                      <Button
                        onClick={() => navigate("contact")}
                        variant="outline"
                        className="h-12 rounded-full border-cyber-400/40 bg-white/5 px-7 text-base font-bold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-cyber-300/70 hover:bg-white/10 hover:text-cyber-200 hover:shadow-[0_0_28px_-6px_rgba(34,211,238,0.5)]"
                      >
                        {home.heroSecondaryCta}
                      </Button>
                    </Magnetic>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Floating glass trust chips (desktop) — editable in /admin/pages */}
            {home.heroTrustChips && trustChips.length > 0 ? (
              <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-4 xl:flex">
                {trustChips.map((chip, i) => {
                  return (
                    <motion.div
                      key={chip.id}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.15, duration: 0.6 }}
                      className="glass animate-float flex items-center gap-3 rounded-2xl p-4 pr-6 shadow-[0_0_30px_-8px_rgba(34,211,238,0.35)]"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30 shadow-[0_0_18px_-4px_rgba(16,185,129,0.6)]">
                        <ContentIcon name={chip.icon} className="h-5.5 w-5.5" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white">{chip.title}</p>
                        <p className="text-xs text-slate-300">{chip.subtitle}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {/* HUD status readout (top-right) + live AI terminal (bottom-right) */}
        <HudStatusChip className="absolute right-6 top-6 z-10" />
        <TerminalTyper className="absolute bottom-14 right-6 z-10 hidden w-80 xl:block" />

        {/* Arrows */}
        <button
          onClick={() => go(-1)}
          aria-label="Previous slide"
          className="glass absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition-all hover:scale-110 hover:border-cyber-400/50 hover:text-cyber-200 hover:shadow-[0_0_22px_-4px_rgba(34,211,238,0.6)] sm:left-5"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Next slide"
          className="glass absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition-all hover:scale-110 hover:border-cyber-400/50 hover:text-cyber-200 hover:shadow-[0_0_22px_-4px_rgba(34,211,238,0.6)] sm:right-5"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Slide counter + dots */}
        <div className="absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-14">
          <span
            aria-hidden="true"
            className="font-mono text-[10px] font-bold tracking-[0.3em] text-cyber-300/70"
          >
            {String(Math.min(index, total - 1) + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <div className="flex gap-2.5">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300",
                  i === index
                    ? "w-8 bg-cyber-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                    : "w-2.5 bg-white/35 hover:bg-white/65"
                )}
              />
            ))}
          </div>
        </div>

        {/* Autoplay progress bar (synced with the 6s timer) */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-1 bg-white/10" aria-hidden="true">
          {!paused ? (
            <motion.div
              key={`progress-${index}`}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
              className="h-full bg-gradient-to-r from-brand-500 via-cyber-400 to-cyber-300 shadow-[0_0_14px_rgba(34,211,238,0.8)]"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-brand-500 via-cyber-400 to-cyber-300 opacity-40" />
          )}
        </div>
      </div>
    </section>
  );
}
