"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Cinematic heading reveal: each word rises in from a soft blur, staggered.
 *
 * - default: plays the first time the heading scrolls into view (framer-motion)
 * - `onMount`: pure CSS animation from the first paint — for above-the-fold
 *   headlines (often the LCP element), so they never wait for hydration
 *
 * The full text stays in the DOM (one node per word plus spaces) for screen
 * readers and crawlers. prefers-reduced-motion is handled in CSS
 * ([data-word] is forced visible), so server and client render the same markup.
 */
export function WordReveal({
  text,
  wordClassName,
  delay = 0,
  stagger = 0.06,
  onMount = false,
}: {
  text: string;
  /** Classes applied to every word (e.g. a gradient). */
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  /** Animate on first paint instead of on scroll. */
  onMount?: boolean;
}) {
  const words = text.split(/\s+/).filter(Boolean);

  if (onMount) {
    return (
      <span>
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            <span
              data-word
              className={cn("word-rise inline-block", wordClassName)}
              style={{ animationDelay: `${delay + i * stagger}s` }}
            >
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    );
  }

  return (
    <motion.span
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <motion.span
            data-word
            className={cn("inline-block will-change-transform", wordClassName)}
            variants={{
              hidden: { opacity: 0, y: "0.45em", filter: "blur(10px)" },
              show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </motion.span>
  );
}
