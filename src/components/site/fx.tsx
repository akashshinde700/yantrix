"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { ArrowUp } from "lucide-react";

/* ────────────────────────────────────────────────────────────────────
   Interaction FX helpers — mouse spotlight, 3D tilt, animated counter,
   scroll progress bar and back-to-top button with SVG progress ring.
   ──────────────────────────────────────────────────────────────────── */

/** Sets --mx/--my CSS vars for the .spotlight-card radial highlight. */
export function spotlightMove(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  el.style.setProperty("--my", `${e.clientY - rect.top}px`);
}

/**
 * 3D tilt + spotlight handlers for cards.
 * Usage: <article {...tiltHandlers(6)} className="tilt-card spotlight-card …">
 */
export function tiltHandlers(max = 6) {
  return {
    onMouseMove: (e: MouseEvent<HTMLElement>) => {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
      el.style.transform = `perspective(1000px) rotateX(${(-py * max).toFixed(
        2
      )}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-4px)`;
    },
    onMouseLeave: (e: MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = "";
    },
  };
}

/** Number that counts up from 0 when scrolled into view. */
export function Counter({
  to,
  duration = 1.8,
  className,
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toString();
      },
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}

/** Thin gradient progress bar fixed at the very top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-brand-500 via-cyber-400 to-brand-700 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
    />
  );
}

/** Floating back-to-top button with an SVG scroll-progress ring. */
export function BackToTop() {
  const { scrollYProgress, scrollY } = useScroll();
  const ringProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setVisible(v > 550));

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 16 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="group fixed bottom-5 left-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-700 shadow-xl shadow-brand-950/15 ring-1 ring-slate-200 transition-colors hover:bg-brand-50 sm:bottom-6 sm:left-6"
        >
          <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <motion.circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ pathLength: ringProgress }}
            />
          </svg>
          <ArrowUp className="relative h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden="true" />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * Scroll-linked vertical parallax for decorative elements.
 * Returns a ref to attach and a style object usable on any element.
 */
export function useParallax(distance = 40) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  const [offset, setOffset] = useState(0);
  useMotionValueEvent(y, "change", (v) => setOffset((v - 0.5) * distance * 2));
  return { ref, style: { translateY: offset } };
}
