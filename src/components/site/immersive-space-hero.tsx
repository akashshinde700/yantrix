"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteStore } from "@/lib/store";
import { useCollection, useSettings, useSiteContent } from "@/lib/content/provider";
import { ContentIcon } from "@/components/site/content-icon";
import { cn } from "@/lib/utils";
import { Magnetic, ScrambleText } from "@/components/site/ai-fx";
import type { HeroSlide, TrustChip } from "@/lib/content/types";
import { SpaceBackground } from "@/components/site/space-background";
import { NebulaOrb, GalaxySpiral } from "@/components/site/nebula-orb";
import { OrbitRings } from "@/components/site/svg-decor";

const AUTOPLAY_MS = 6500;

const textContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const textItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function ImmersiveSpaceHero() {
  const navigate = useSiteStore((s) => s.navigate);
  const settings = useSettings();
  const heroSlides = useCollection<HeroSlide>("heroSlides");
  const trustChips = useCollection<TrustChip>("trustChips");
  const home = useSiteContent().pages.home;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ w: 1, h: 1 });
  const [glowOffset, setGlowOffset] = useState({ x: 0, y: 0 });
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
  }, [paused, total]);

  useEffect(() => {
    setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    const onMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setGlowOffset({
        x: ((e.clientX / window.innerWidth - 0.5) * -60),
        y: ((e.clientY / window.innerHeight - 0.5) * -60),
      });
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

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
      aria-label={`${settings.name} — cosmic experience`}
      className="relative isolate overflow-hidden bg-space"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ═══════════════════════════════════════════════════════════════
         LAYER 1: Deep space background (canvas starfield)
         ═══════════════════════════════════════════════════════════════ */}
      <SpaceBackground
        className="absolute inset-0"
        intensity={1.2}
        showShootingStars
        showNebula
        showAurora
      />

      {/* ═══════════════════════════════════════════════════════════════
         LAYER 2: Dark overlay for readability
         ═══════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 bg-gradient-to-r from-space/95 via-[#02050f]/85 to-brand-900/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-space via-space/40 to-transparent" />

      {/* ═══════════════════════════════════════════════════════════════
         LAYER 3: Nebula orbs (distant cosmic clouds)
         ═══════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <NebulaOrb
          size={500}
          color="#4f46e5"
          color2="#7c3aed"
          color3="#06b6d4"
          opacity={0.12}
          animate={false}
          style={{
            position: "absolute",
            top: "10%",
            left: "-10%",
            transform: "translate(0, 0)",
          }}
        />
        <NebulaOrb
          size={400}
          color="#0891b2"
          color2="#2563eb"
          color3="#6366f1"
          opacity={0.1}
          animate={false}
          style={{
            position: "absolute",
            bottom: "5%",
            right: "-8%",
            transform: "translate(0, 0)",
          }}
        />
        <NebulaOrb
          size={350}
          color="#a855f7"
          color2="#ec4899"
          color3="#06b6d4"
          opacity={0.08}
          animate={false}
          style={{
            position: "absolute",
            top: "40%",
            right: "20%",
          }}
        />

        {/* ═══════════════════════════════════════════════════════════
           LAYER 4: Animated galaxy spiral (far background)
           ═══════════════════════════════════════════════════════════ */}
        <GalaxySpiral
          size={300}
          color="rgba(100, 180, 255, 0.08)"
          glowColor="rgba(99, 102, 241, 0.15)"
          style={{ position: "absolute", top: "30%", left: "60%", opacity: 0.6 }}
        />
        <GalaxySpiral
          size={180}
          color="rgba(168, 85, 247, 0.06)"
          glowColor="rgba(168, 85, 247, 0.12)"
          style={{ position: "absolute", top: "60%", left: "10%", opacity: 0.4 }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         LAYER 5: Orbit rings + decorative elements
         ═══════════════════════════════════════════════════════════════ */}
      <OrbitRings className="pointer-events-none absolute -right-32 top-1/2 hidden h-[500px] w-[500px] -translate-y-1/2 text-cyber-300/20 xl:block" />
      <OrbitRings className="pointer-events-none absolute -left-16 -bottom-20 hidden h-72 w-72 text-brand-400/20 lg:block" />

      {/* ═══════════════════════════════════════════════════════════════
         LIVE MOUSE-TRACKED GLOW ORB
         ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ transform: `translate(${glowOffset.x}px, ${glowOffset.y}px)` }}
      >
        <div
          className="absolute h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-[100px]"
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
         CONTENT: Slide text with staggered entrance
         ═══════════════════════════════════════════════════════════════ */}
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
                {/* Eyebrow chip */}
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

                {/* Title with cosmic glow */}
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

                {/* Description */}
                <motion.p
                  variants={textItem}
                  className="max-w-xl text-base leading-relaxed text-slate-300 text-pretty sm:text-lg"
                >
                  {slide.description}
                </motion.p>

                {/* CTAs */}
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

          {/* Floating trust chips (desktop) */}
          {home.heroTrustChips && trustChips.length > 0 && (
            <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-4 xl:flex">
              {trustChips.map((chip, i) => (
                <motion.div
                  key={chip.id}
                  initial={{ opacity: 0, x: 40, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.15, duration: 0.6, ease: "easeOut" }}
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* HUD status readout */}
      <div className="absolute right-6 top-6 z-10">
        <div className="glass animate-flicker rounded-xl px-3 py-2 text-[10px] font-mono text-cyber-300 shadow-[0_0_18px_-4px_rgba(34,211,238,0.3)]">
          <div className="flex items-center gap-2">
            <Star className="h-3.5 w-3.5 fill-cyber-400 text-cyber-400" />
            <span className="font-bold tracking-wider">{settings.name}</span>
          </div>
          <div className="mt-1 h-[1px] w-full bg-gradient-to-r from-cyber-400/50 via-transparent to-cyber-400/50" />
          <div className="mt-1.5 flex justify-between">
            <span className="text-cyber-400/70">SECTOR</span>
            <span className="text-white font-bold">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
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
        className="glass absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition-all hover:scale-110 hover:border-cyber-400/50 hover:text-cyber-200 hover:shadow-[0_0_22px_-6px_rgba(34,211,238,0.6)] sm:right-5"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Slide counter + dots */}
      <div className="absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-14">
        <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-cyber-300/70">
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

      {/* Autoplay progress bar */}
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
    </section>
  );
}
