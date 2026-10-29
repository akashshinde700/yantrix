"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Fade-up reveal when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      // Reveal as soon as any part of the element enters the viewport, so a
      // section that is already partly visible on load is never left hidden.
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
