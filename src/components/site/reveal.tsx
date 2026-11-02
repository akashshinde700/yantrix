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
      // Reveal as soon as a sliver of the element enters the viewport (and a
      // little before it, via the margin), so a section that is already partly
      // visible on load — or scrolled past quickly — is never left hidden.
      viewport={{ once: true, amount: 0.01, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
