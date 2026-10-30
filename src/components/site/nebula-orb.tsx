"use client";

import React, { type CSSProperties } from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   NEBULA ORB — floating glowing gas cloud orb (CSS-based nebula effect)
   ═══════════════════════════════════════════════════════════════════════ */

export function NebulaOrb({
  size = 300,
  color = "#6366f1",
  color2 = "#a855f7",
  color3 = "#06b6d4",
  opacity = 0.6,
  animate = true,
  className,
  style,
}: {
  size?: number;
  color?: string;
  color2?: string;
  color3?: string;
  opacity?: number;
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      animate={animate ? { scale: [1, 1.12, 1], rotate: [0, 360] } : {}}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, ${color} 0%, ${color2} 35%, ${color3} 65%, transparent 72%)`,
        boxShadow: `0 0 ${size * 0.4}px rgba(99,102,241,0.4), 0 0 ${size * 0.2}px rgba(168,85,247,0.25)`,
        opacity,
        filter: "blur(6px)",
        ...style,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   COSMIC RAYS — animated light rays from a point (sun/star effect)
   ═══════════════════════════════════════════════════════════════════════ */

export function CosmicRays({
  origin = "bottom-center",
  count = 12,
  length = 300,
  color = "rgba(255,255,255,0.08)",
  animate = true,
  className,
}: {
  origin?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right" | "center";
  count?: number;
  length?: number;
  color?: string;
  animate?: boolean;
  className?: string;
}) {
  const angleStep = (Math.PI * 2) / count;
  const baseAngle: Record<string, number> = {
    "top-left": 0,
    "top-center": Math.PI / 2,
    "top-right": Math.PI,
    "bottom-left": -Math.PI / 2,
    "bottom-center": 0,
    "bottom-right": Math.PI / 2,
  };

  const rays = Array.from({ length: count }, (_, i) => {
    const angle = baseAngle[origin] + i * angleStep;
    return {
      id: i,
      angle,
      delay: (i / count) * 0.6,
      length,
    };
  });

  return (
    <div
      className={className}
      style={{ position: "absolute", width: 0, height: 0, transformOrigin: "center" }}
    >
      {rays.map((ray) => (
        <motion.div
          key={ray.id}
          animate={animate ? { opacity: [0.3, 0.8, 0.3] } : {}}
          transition={{ duration: 3 + ray.id * 0.2, repeat: Infinity, delay: ray.delay, ease: "easeInOut" }}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 1,
            height: ray.length,
            transform: `rotate(${ray.angle}rad)`,
            background: `linear-gradient(to top, ${color}, transparent)`,
            opacity: 0.4,
            transformOrigin: "bottom center",
            willChange: "opacity",
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   GALAXY SPIRAL — rotating spiral galaxy silhouette
   ═══════════════════════════════════════════════════════════════════════ */

const SPIRAL_POINTS: [number, number][] = (() => {
  const pts: [number, number][] = [];
  const arms = 3;
  const turns = 3;
  const pointsPerArm = 60;
  for (let a = 0; a < arms; a++) {
    const offset = (a / arms) * Math.PI * 2;
    for (let i = 0; i < pointsPerArm; i++) {
      const t = i / pointsPerArm;
      const r = t * 120;
      const theta = t * turns * Math.PI * 2 + offset;
      pts.push([Math.cos(theta) * r, Math.sin(theta) * r]);
    }
  }
  return pts;
})();

export function GalaxySpiral({
  size = 240,
  color = "rgba(100, 180, 255, 0.15)",
  glowColor = "rgba(99, 102, 241, 0.25)",
  className,
  style,
}: {
  size?: number;
  color?: string;
  glowColor?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: "absolute",
        transform: "translate(-50%, -50%)",
        ...style,
      }}
      aria-hidden="true"
    >
      {/* Glow halo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 60%)`,
          filter: "blur(20px)",
        }}
      />

      {/* Spiral arms */}
      <svg
        viewBox="-140 -140 280 280"
        fill="none"
        style={{ width: "100%", height: "100%", position: "absolute", top: "50%", left: "50%", marginTop: -size / 2, marginLeft: -size / 2 }}
      >
        <defs>
          <filter id="galaxy-glow">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        >
          {SPIRAL_POINTS.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={1.2 + Math.random() * 0.8}
              fill={color}
              filter="url(#galaxy-glow)"
            />
          ))}
        </motion.g>
      </svg>

      {/* Center bright core */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 12,
          height: 12,
          marginLeft: -6,
          marginTop: -6,
          borderRadius: "50%",
          background: "radial-gradient(circle, white 0%, rgba(180,200,255,0.8) 40%, transparent 70%)",
          boxShadow: "0 0 20px rgba(150, 180, 255, 0.6)",
        }}
      />
    </div>
  );
}
