"use client";

import { useEffect, useState } from "react";

/**
 * Keeps every marquee at the same perceived speed.
 *
 * The ticker CSS used a hard-coded duration, so a row with three items crawled
 * while a row with twelve items flew. This measures the real track width (the
 * animation loops over exactly one copy, i.e. half the track) and derives a
 * duration from a constant pixels-per-second speed.
 *
 * The duration is `undefined` until the first measurement, which keeps the CSS
 * default for the server render and the first paint.
 *
 * It returns a state callback ref instead of a `useRef` object: a callback ref
 * re-runs the measurement when the node appears after hydration.
 */
export function useMarqueeSpeed(pxPerSecond = 60) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [duration, setDuration] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!node) return;

    const measure = () => {
      const half = node.scrollWidth / 2;
      if (half > 0) setDuration(Math.min(160, Math.max(14, half / pxPerSecond)));
    };

    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, pxPerSecond]);

  return [setNode, duration ? { animationDuration: `${duration.toFixed(2)}s` } : undefined] as const;
}

/**
 * Reports whether an element is on screen (with a little margin), so infinite
 * animations can be paused while nobody is looking at them — three marquees
 * and the aurora rings kept animating after the visitor had scrolled past.
 */
export function usePauseOffscreen<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [setNode, visible] as const;
}
