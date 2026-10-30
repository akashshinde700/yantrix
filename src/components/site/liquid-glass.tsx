"use client";

import { useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   LIQUID GLASS — iOS-style glassmorphism with 3D tilt
   ═══════════════════════════════════════════════════════════════════════ */

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  tiltEnabled?: boolean;
  borderColor?: string;
  backgroundBlur?: number;
}

export function LiquidGlass({
  children,
  className,
  tiltEnabled = true,
  borderColor = "rgba(255, 255, 255, 0.15)",
  backgroundBlur = 20,
}: LiquidGlassProps) {
  const glassRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Mouse tracking for tilt and spotlight
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!glassRef.current || !tiltEnabled) return;

    const rect = glassRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePos({ x, y });

    // Calculate tilt angles (-15 to 15 degrees)
    const centerX = 50;
    const centerY = 50;
    const angleX = ((y - centerY) / 50) * 15;
    const angleY = ((x - centerX) / 50) * -15;

    setTilt({ x: angleX, y: angleY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setMousePos({ x: 50, y: 50 });
  };

  return (
    <div
      ref={glassRef}
      className={`group relative overflow-hidden rounded-2xl ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Glass panel with 3D transform */}
      <div
        className="absolute inset-0 rounded-2xl transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          background: `rgba(255, 255, 255, 0.08)`,
          backdropFilter: `blur(${backgroundBlur}px)`,
          WebkitBackdropFilter: `blur(${backgroundBlur}px)`,
          border: `1px solid ${borderColor}`,
        }}
      >
        {/* Specular highlight top-left */}
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
          style={{
            background: `radial-gradient(
              300px circle at ${mousePos.x}% ${mousePos.y}%,
              rgba(255, 255, 255, 0.15) 0%,
              rgba(255, 255, 255, 0.05) 30%,
              transparent 50%
            )`,
            mixBlendMode: "overlay",
          }}
        />

        {/* Edge highlight */}
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
          style={{
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        />

        {/* Inner shadow to enhance depth */}
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
          style={{
            boxShadow: "inset 0 0 30px rgba(0, 0, 0, 0.3)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 rounded-2xl">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   GLASS CARD — simple glassmorphism card with optional tilt
   ═══════════════════════════════════════════════════════════════════════ */

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
  borderOpacity?: number;
}

export function GlassCard({
  children,
  className,
  hoverLift = true,
  borderOpacity = 0.1,
}: GlassCardProps) {
  return (
    <div
      className={`group relative rounded-2xl bg-white/5 p-6 ${className}`}
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
        transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Hover lift effect */}
      {hoverLift && (
        <style>{`
          .glass-card-hover {
            transform: translateY(0);
          }
          .glass-card-hover:hover {
            transform: translateY(-4px);
          }
        `}</style>
      )}

      {/* Hover border glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          boxShadow: `0 0 20px -5px rgba(34, 211, 238, 0.3)`,
          opacity: 0,
          border: `1px solid rgba(34, 211, 238, ${borderOpacity * 2})`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
