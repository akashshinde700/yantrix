"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   COSMIC SECTION DIVIDER — animated galaxy / nebula separator between
   page sections. Creates a sense of traveling through space.
   ═══════════════════════════════════════════════════════════════════════ */

export function CosmicDivider({
  className,
  direction = "horizontal",
}: {
  className?: string;
  direction?: "horizontal" | "vertical";
}) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Moving star field (small dots traveling across) */}
      <div
        style={{
          position: "absolute",
          width: direction === "horizontal" ? "200%" : "100%",
          height: direction === "vertical" ? "200%" : "100%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.4,
          animation: direction === "horizontal" ? "marquee 25s linear infinite" : "none",
          transform: direction === "vertical" ? "scale(1)" : undefined,
        }}
      >
        {direction === "vertical" && (
          <style>{`.animate-marquee-v { animation: marquee-v 30s linear infinite; } @keyframes marquee-v { from { transform: translateY(0); } to { transform: translateY(-50%); } }`}</style>
        )}
      </div>

      {/* Central glow orb */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-3xl"
        style={{ zIndex: 1 }}
      />
      <motion.div
        animate={{
          scale: [1.4, 1, 1.4],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyber-400/10 blur-3xl"
        style={{ zIndex: 2 }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STAR FIELD OVERLAY — subtle twinkling stars overlay for any section
   ═══════════════════════════════════════════════════════════════════════ */

const STAR_POSITIONS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1 + Math.random() * 2,
  delay: Math.random() * 5,
  duration: 2 + Math.random() * 4,
  opacity: 0.3 + Math.random() * 0.7,
}));

export function StarFieldOverlay({
  className,
  count = 40,
}: {
  className?: string;
  count?: number;
}) {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2.5,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 4,
    opacity: 0.3 + Math.random() * 0.7,
  }));

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}
    >
      {stars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: 0,
            boxShadow: "0 0 6px 1px rgba(200, 220, 255, 0.6)",
          }}
          animate={{ opacity: [0, star.opacity, 0] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   NEBULA SMOKE — soft drifting smoke/nebula cloud (pure CSS)
   ═══════════════════════════════════════════════════════════════════════ */

export function NebulaSmoke({
  className,
  color = "rgba(99, 102, 241, 0.12)",
  color2 = "rgba(168, 85, 247, 0.10)",
  vertical = true,
}: {
  className?: string;
  color?: string;
  color2?: string;
  vertical?: boolean;
}) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: vertical ? "100%" : "60%",
          height: vertical ? "60%" : "100%",
          background: `radial-gradient(ellipse at 30% 40%, ${color} 0%, ${color2} 40%, transparent 70%)`,
          filter: "blur(40px)",
          animation: "drift 12s ease-in-out infinite alternate",
          transform: "scale(1)",
          top: vertical ? "20%" : "0",
          left: vertical ? "0" : "20%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: vertical ? "80%" : "50%",
          height: vertical ? "50%" : "80%",
          background: `radial-gradient(ellipse at 70% 60%, ${color2} 0%, ${color} 35%, transparent 65%)`,
          filter: "blur(50px)",
          animation: "drift2 15s ease-in-out infinite alternate",
          top: vertical ? "50%" : "30%",
          right: vertical ? "5%" : "0",
        }}
      />

      <style>{`
        @keyframes drift {
          0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          50% { transform: translate(20px, -15px) scale(1.1); opacity: 0.9; }
          100% { transform: translate(-10px, 10px) scale(0.95); opacity: 0.6; }
        }
        @keyframes drift2 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(-25px, 20px) scale(1.15); opacity: 0.8; }
          100% { transform: translate(15px, -10px) scale(0.9); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SHOOTING STAR — decorative shooting star across a section
   ═══════════════════════════════════════════════════════════════════════ */

export function ShootingStarDecoration({
  className,
  delay = 0,
  direction = "left-to-right",
}: {
  className?: string;
  delay?: number;
  direction?: "left-to-right" | "right-to-left" | "top-to-bottom" | "bottom-to-top";
}) {
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const trigger = () => {
      setActive(true);
      timer.current = setTimeout(() => setActive(false), 1500);
    };
    timer.current = setTimeout(trigger, delay);
    return () => {
      if (timer.current) clearTimeout(timer.current as ReturnType<typeof setTimeout>);
    };
  }, [delay]);

  const getTransform = () => {
    switch (direction) {
      case "left-to-right":
        return "translateX(-100%)";
      case "right-to-left":
        return "translateX(100%)";
      case "top-to-bottom":
        return "translateY(-100%)";
      case "bottom-to-top":
        return "translateY(100%)";
      default:
        return "translateX(-100%)";
    }
  };

  const getTarget = () => {
    switch (direction) {
      case "left-to-right":
      case "right-to-left":
        return { x: "50%", y: "30%" };
      case "top-to-bottom":
      case "bottom-to-top":
        return { x: "70%", y: "50%" };
      default:
        return { x: "50%", y: "30%" };
    }
  };

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}
    >
      <motion.div
        className="absolute rounded-full bg-white shadow-[0_0_20px_5px_rgba(255,255,255,0.8)]"
        style={{
          ...getTarget(),
          width: 2,
          height: 2,
          ...({ transform: getTransform() } as React.CSSProperties),
        }}
        animate={active ? { x: 400, y: -200, opacity: 0 } : { x: 0, y: 0, opacity: 0 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
      {/* Tail */}
      <motion.div
        className="absolute h-1 w-16 bg-gradient-to-r from-white/80 to-transparent rounded-full"
        style={{
          ...getTarget(),
          ...({ transform: `translateX(-50%) ${getTransform()}` } as React.CSSProperties),
        }}
        animate={active ? { x: 400, y: -200, opacity: 0, width: 0 } : { x: 0, y: 0, opacity: 0, width: 64 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
    </div>
  );
}
