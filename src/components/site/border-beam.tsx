"use client";

import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   BORDER BEAM — light beam traveling around element borders
   ═══════════════════════════════════════════════════════════════════════ */

interface BorderBeamProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  duration?: number;
  delay?: number;
  size?: number;
}

export function BorderBeam({
  children,
  className,
  color = "rgba(34, 211, 238, 0.8)",
  duration = 4,
  delay = 0,
  size = 2,
}: BorderBeamProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{
        background: "transparent",
      }}
    >
      {/* Border beam wrapper */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-xl"
        style={{
          border: `${size}px solid ${color}`,
          boxShadow: `0 0 20px ${color}`,
        }}
      >
        {/* Traveling beam via clip-path */}
        <motion.div
          className="absolute inset-0 rounded-xl overflow-hidden"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0 0 0)" }}
          transition={{
            duration: duration,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            delay: delay,
          }}
        >
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(
                90deg,
                transparent,
                ${color} 50%,
                transparent
              )`,
              opacity: 0.5,
            }}
          />
        </motion.div>

        {/* Second beam for opposite direction */}
        <motion.div
          className="absolute inset-0 rounded-xl overflow-hidden"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0 0)" }}
          transition={{
            duration: duration,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            delay: duration / 2,
          }}
        >
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(
                270deg,
                transparent,
                ${color} 50%,
                transparent
              )`,
              opacity: 0.3,
            }}
          />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 rounded-xl">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   GLOWING BORDER — pulsing glow effect around elements
   ═══════════════════════════════════════════════════════════════════════ */

interface GlowingBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  intensity?: number;
}

export function GlowingBorder({
  children,
  className,
  color = "rgba(34, 211, 238, 0.5)",
  intensity = 1,
}: GlowingBorderProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Animated border glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 rounded-xl"
        style={{
          background: `radial-gradient(
            circle at 50% 0%,
            ${color} 0%,
            transparent 50%
          )`,
          opacity: 0,
          transition: "opacity 0.3s ease",
        }}
        whileHover={{ opacity: 0.6 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{
          duration: 3 * intensity,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Static border with glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          boxShadow: `inset 0 0 20px -5px ${color}`,
          opacity: 0.5,
        }}
      />

      {/* Content */}
      <div className="relative z-10 rounded-xl">{children}</div>
    </div>
  );
}
