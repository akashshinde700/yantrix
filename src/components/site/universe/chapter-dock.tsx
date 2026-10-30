"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CHAPTERS } from "@/components/site/universe/chapters";
import { SoundButton } from "@/components/site/sound-button";
import { cn } from "@/lib/utils";

/** Index of the chapter currently in the middle of the viewport. */
function currentChapter(): number {
  const mid = window.innerHeight * 0.5;
  let idx = 0;
  CHAPTERS.forEach((c, i) => {
    const el = document.getElementById(c.id);
    if (el && el.getBoundingClientRect().top <= mid) idx = i;
  });
  return idx;
}

/**
 * Bottom navigation dock for the home page chapters (desktop: labels,
 * mobile: dots). Also hosts the ambient sound toggle.
 */
export function ChapterDock() {
  const [active, setActive] = useState(0);
  // progress is written straight to the DOM — no React render per scroll frame
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setActive(currentChapter()); // React skips the render when unchanged
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const go = (i: number) => {
    document.getElementById(CHAPTERS[i].id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Page chapters"
      className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 sm:bottom-5"
    >
      <div className="relative flex items-center gap-1 overflow-hidden rounded-full border border-white/10 bg-[#050a1c]/70 p-1 pl-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8),0_0_30px_-12px_rgba(34,211,238,0.5)] backdrop-blur-xl">
        {/* overall progress */}
        <span
          ref={progressRef}
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400"
        />

        {/* desktop: labelled chapters */}
        <ul className="hidden items-center md:flex">
          {CHAPTERS.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={active === i ? "true" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors",
                  active === i ? "text-white" : "text-slate-400 hover:text-slate-100"
                )}
              >
                {active === i && (
                  <motion.span
                    layoutId="dock-active"
                    className="absolute inset-0 rounded-full border border-cyan-300/40 bg-gradient-to-r from-cyan-400/20 to-violet-500/20 shadow-[0_0_18px_-4px_rgba(34,211,238,0.7)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{c.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* mobile: dots (current chapter announced to screen readers) */}
        <div className="flex items-center gap-2 px-1 md:hidden">
          <span className="sr-only" aria-live="polite">
            {CHAPTERS[active].label}
          </span>
          <ul className="flex items-center gap-1.5">
            {CHAPTERS.map((c, i) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={c.label}
                  aria-current={active === i ? "true" : undefined}
                  className={cn(
                    "block h-1.5 rounded-full transition-all",
                    active === i ? "w-5 bg-cyan-300" : "w-1.5 bg-white/30"
                  )}
                />
              </li>
            ))}
          </ul>
        </div>

        <span aria-hidden="true" className="mx-1 h-5 w-px bg-white/10" />
        <SoundButton />
      </div>
    </nav>
  );
}
