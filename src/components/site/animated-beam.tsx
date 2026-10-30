"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATED BEAM — Vercel-style SVG beam connecting two points
   ═══════════════════════════════════════════════════════════════════════ */

interface AnimatedBeamProps {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  className?: string;
  delay?: number;
  duration?: number;
  color?: string;
}

export function AnimatedBeam({
  startPoint,
  endPoint,
  className,
  delay = 0,
  duration = 2,
  color = "rgba(34, 211, 238, 0.6)",
}: AnimatedBeamProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate control points for bezier curve
  const midY = (startPoint.y + endPoint.y) / 2;
  const controlOffset = Math.abs(endPoint.x - startPoint.x) * 0.3;

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        transform: "rotate(0deg)",
      }}
    >
      <defs>
        <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor={color} stopOpacity={0.8} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
        <filter id="beam-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Animated beam path */}
      <motion.path
        d={`M ${startPoint.x} ${startPoint.y} C ${startPoint.x + controlOffset} ${midY}, ${endPoint.x - controlOffset} ${midY}, ${endPoint.x} ${endPoint.y}`}
        stroke="url(#beam-gradient)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: duration,
          delay: delay,
          ease: "easeInOut",
        }}
        filter="url(#beam-glow)"
      />

      {/* Traveling particle along the beam */}
      <motion.circle
        r="3"
        fill="#ffffff"
        filter="url(#beam-glow)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: duration + 0.5,
          delay: delay,
          ease: "easeInOut",
        }}
        style={{
          offsetPath: `path("M ${startPoint.x} ${startPoint.y} C ${startPoint.x + controlOffset} ${midY}, ${endPoint.x - controlOffset} ${midY}, ${endPoint.x} ${endPoint.y}")`,
        }}
      >
        <animateMotion
          dur={`${duration + 0.5}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
          path={`M ${startPoint.x} ${startPoint.y} C ${startPoint.x + controlOffset} ${midY}, ${endPoint.x - controlOffset} ${midY}, ${endPoint.x} ${endPoint.y}`}
        />
      </motion.circle>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   BEAM CONNECTOR — connects multiple points with animated beams
   ═══════════════════════════════════════════════════════════════════════ */

interface BeamConnectorProps {
  points: Array<{ x: number; y: number }>;
  className?: string;
  color?: string;
  dashArray?: string;
}

export function BeamConnector({
  points,
  className,
  color = "rgba(34, 211, 238, 0.4)",
  dashArray = "4 6",
}: BeamConnectorProps) {
  if (points.length < 2) return null;

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <defs>
        <filter id="connector-glow">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>
      {points.slice(0, -1).map((point, i) => {
        const nextPoint = points[i + 1];
        return (
          <motion.path
            key={i}
            d={`M ${point.x} ${point.y} L ${nextPoint.x} ${nextPoint.y}`}
            stroke={color}
            strokeWidth="1"
            fill="none"
            strokeDasharray={dashArray}
            className="dash-flow"
            filter="url(#connector-glow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: i * 0.2 }}
          />
        );
      })}

      {/* Connection nodes */}
      {points.map((point, i) => (
        <motion.circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="2.5"
          fill="#22d3ee"
          filter="url(#connector-glow)"
          initial={{ r: 0, opacity: 0 }}
          animate={{ r: 2.5, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
        />
      ))}
    </svg>
  );
}
