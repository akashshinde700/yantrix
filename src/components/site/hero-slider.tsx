"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Handshake, MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteStore } from "@/lib/store";
import { heroSlides } from "@/lib/data";
import { cn } from "@/lib/utils";
import { CircuitLines, GridDots, OrbitRings } from "@/components/site/svg-decor";

const AUTOPLAY_MS = 6000;

/* Staggered entrance for slide text */
const textContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};
const textItem = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export function HeroSlider() {
  const navigate = useSiteStore((s) => s.navigate);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((dir: 1 | -1) => {
    setIndex((i) => (i + dir + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % heroSlides.length), AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, index]);

  const slide = heroSlides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Yantrix Technology highlights"
      className="relative isolate overflow-hidden bg-brand-950"
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

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-950/70 to-brand-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent" />
        <GridDots className="opacity-40" />

        {/* Animated SVG decorations */}
        <CircuitLines className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-44 w-full text-brand-400/25 lg:block" />
        <OrbitRings className="pointer-events-none absolute -right-20 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 text-brand-300/30 xl:block" />

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
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-200 ring-1 ring-white/15 backdrop-blur-sm"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    {slide.eyebrow}
                  </motion.span>

                  <motion.h1
                    variants={textItem}
                    className="text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]"
                  >
                    <span className="text-gradient">{slide.title}</span>
                  </motion.h1>

                  <motion.p
                    variants={textItem}
                    className="max-w-xl text-base leading-relaxed text-slate-200 text-pretty sm:text-lg"
                  >
                    {slide.description}
                  </motion.p>

                  <motion.div variants={textItem} className="mt-1 flex flex-wrap items-center gap-3">
                    <Button
                      onClick={() => navigate("courses")}
                      className="btn-shine h-12 rounded-full bg-brand-600 px-7 text-base font-bold shadow-lg shadow-brand-600/40 transition-all hover:-translate-y-0.5 hover:bg-brand-500"
                    >
                      Explore Courses
                    </Button>
                    <Button
                      onClick={() => navigate("contact")}
                      variant="outline"
                      className="h-12 rounded-full border-white/30 bg-white/5 px-7 text-base font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/15 hover:text-white"
                    >
                      Contact for Admission
                    </Button>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Floating trust chips (desktop) */}
            <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-4 xl:flex">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="animate-float flex items-center gap-3 rounded-2xl bg-white/10 p-4 pr-6 ring-1 ring-white/15 backdrop-blur-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Handshake className="h-5.5 w-5.5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Placement Assistance</p>
                  <p className="text-xs text-slate-300">Support at every career step</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="animate-float-slow flex items-center gap-3 rounded-2xl bg-white/10 p-4 pr-6 ring-1 ring-white/15 backdrop-blur-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/25 text-brand-200">
                  <MonitorSmartphone className="h-5.5 w-5.5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Online &amp; Offline Batches</p>
                  <p className="text-xs text-slate-300">Learn your way, anywhere</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={() => go(-1)}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/25 sm:left-5"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/25 sm:right-5"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 gap-2.5 sm:bottom-14">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                i === index ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70"
              )}
            />
          ))}
        </div>

        {/* Autoplay progress bar (synced with the 6s timer) */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-1 bg-white/10" aria-hidden="true">
          {!paused ? (
            <motion.div
              key={`progress-${index}`}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
              className="h-full bg-gradient-to-r from-brand-400 via-brand-500 to-emerald-400"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-brand-400 via-brand-500 to-emerald-400 opacity-40" />
          )}
        </div>
      </div>
    </section>
  );
}
