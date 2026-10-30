"use client";

import { useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   SPOTLIGHT CARD — card with mouse-tracking radial spotlight (Linear-style)
   ═══════════════════════════════════════════════════════════════════════ */

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  glowColor?: string;
}

export function SpotlightCard({
  children,
  className,
  color = "rgba(34, 211, 238, 0.15)",
  glowColor = "rgba(34, 211, 238, 0.4)",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Spotlight effect */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `radial-gradient(
            300px circle at ${mousePos.x}% ${mousePos.y}%,
            ${glowColor} 0%,
            ${color} 30%,
            transparent 60%
          )`,
          opacity: 0.8,
          transition: "opacity 0.3s ease",
          mixBlendMode: "screen",
        }}
      />

      {/* Border glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-lg transition-opacity duration-300"
        style={{
          boxShadow: `0 0 30px -10px ${glowColor}`,
          opacity: 0.5,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SPOTLIGHT BORDER CARD — spotlight effect on card border only
   ═══════════════════════════════════════════════════════════════════════ */

interface SpotlightBorderCardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  borderWidth?: number;
}

export function SpotlightBorderCard({
  children,
  className,
  color = "rgba(34, 211, 238, 0.5)",
  borderWidth = 2,
}: SpotlightBorderCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-xl ${className}`}
      onMouseMove={handleMouseMove}
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid rgba(255, 255, 255, 0.1)`,
      }}
    >
      {/* Border spotlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          background: `radial-gradient(
            ${borderWidth}px circle at ${mousePos.x}% ${mousePos.y}%,
            ${color} 0%,
            transparent 60%
          )`,
          mask: `radial-gradient(
            circle at ${mousePos.x}% ${mousePos.y}%,
            black 0%,
            transparent 100%
          )`,
          WebkitMask: `radial-gradient(
            circle at ${mousePos.x}% ${mousePos.y}%,
            black 0%,
            transparent 100%
          )`,
          transition: "opacity 0.2s ease",
        }}
      />

      {/* Inner content */}
      <div className="relative z-10 rounded-xl">{children}</div>
    </div>
  );
}
