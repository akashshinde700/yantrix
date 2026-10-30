"use client";

import { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATED GRADIENT — 3D glassy animated gradient background (SceneAI-style)
   ═══════════════════════════════════════════════════════════════════════
   Creates a stunning 3D glass-like animated gradient with:
   • Floating glass blobs with blur
   • Continuous color shifting
   • Light reflections and highlights
   • Smooth, premium animation
   ═══════════════════════════════════════════════════════════════════════ */

interface AnimatedGradientProps {
  className?: string;
  colors?: string[];
  speed?: number;
  intensity?: number;
  showLightReflection?: boolean;
}

export function AnimatedGradient({
  className,
  colors = [
    "rgba(99, 102, 241, 0.4)",    // indigo
    "rgba(168, 85, 247, 0.35)",   // purple
    "rgba(6, 182, 212, 0.3)",     // cyan
    "rgba(236, 72, 153, 0.25)",   // pink
  ],
  speed = 1,
  intensity = 1,
  showLightReflection = true,
}: AnimatedGradientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Inject keyframe animations
    const styleId = "sceneai-animated-gradient";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes blob-drift-0 {
          0%, 100% { transform: translate(-50%, -50%) translate(0, 0) scale(1) rotate(0deg); }
          25% { transform: translate(-50%, -50%) translate(30px, -20px) scale(1.15) rotate(90deg); }
          50% { transform: translate(-50%, -50%) translate(-20px, 30px) scale(0.9) rotate(180deg); }
          75% { transform: translate(-50%, -50%) translate(20px, 20px) scale(1.1) rotate(270deg); }
        }
        @keyframes blob-drift-1 {
          0%, 100% { transform: translate(-50%, -50%) translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(-50%, -50%) translate(-30px, 20px) scale(1.2) rotate(120deg); }
          66% { transform: translate(-50%, -50%) translate(20px, -30px) scale(0.85) rotate(240deg); }
        }
        @keyframes blob-drift-2 {
          0%, 100% { transform: translate(-50%, -50%) translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translate(25px, 25px) scale(1.1) rotate(180deg); }
        }
        @keyframes blob-drift-3 {
          0%, 100% { transform: translate(-50%, -50%) translate(0, 0) scale(1) rotate(0deg); }
          25% { transform: translate(-50%, -50%) translate(-25px, -15px) scale(1.15) rotate(-90deg); }
          75% { transform: translate(-50%, -50%) translate(15px, 25px) scale(0.95) rotate(90deg); }
        }
        @keyframes glass-shine {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @media (prefers-reduced-motion: reduce) {
          div[class*="blob-"] { animation: none !important; }
          div[class*="glass-shine"] { animation: none !important; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        isolation: "isolate",
      }}
      aria-hidden="true"
    >
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
          opacity: 0.6 * intensity,
        }}
      />

      {/* Floating glass blobs */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="blob"
          style={{
            position: "absolute",
            width: 300 + i * 50,
            height: 300 + i * 50,
            background: `radial-gradient(circle at 30% 30%, ${colors[i % colors.length]}, transparent 70%)`,
            filter: "blur(60px)",
            top: `${20 + i * 15}%`,
            left: `${20 + i * 20}%`,
            transform: "translate(-50%, -50%)",
            animation: `blob-drift-${i} ${12 / speed}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.5}s`,
            opacity: 0.5 * intensity,
          }}
        />
      ))}

      {/* Second layer of blobs (smaller, more transparent) */}
      {[0, 1].map((i) => (
        <div
          key={`small-${i}`}
          style={{
            position: "absolute",
            width: 150,
            height: 150,
            background: `radial-gradient(circle at 50% 50%, ${colors[(i + 2) % colors.length]}, transparent 60%)`,
            filter: "blur(40px)",
            top: `${30 + i * 20}%`,
            left: `${60 - i * 15}%`,
            transform: "translate(-50%, -50%)",
            animation: `blob-drift-${(i + 2) % 4} ${15 / speed}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.3}s`,
            opacity: 0.3 * intensity,
          }}
        />
      ))}

      {/* Light reflection effect */}
      {showLightReflection && (
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                135deg,
                transparent 0%,
                rgba(255, 255, 255, 0.05) 30%,
                transparent 50%,
                rgba(255, 255, 255, 0.08) 70%,
                transparent 100%
              )
            `,
            animation: `glass-shine ${8 / speed}s ease-in-out infinite`,
          }}
        />
      )}

      {/* Glass highlight overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 80% 50% at 30% 20%,
              rgba(255, 255, 255, 0.08) 0%,
              transparent 50%
            )
          `,
          mixBlendMode: "screen",
        }}
      />

      {/* Bottom subtle gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: `linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 100%)`,
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   GLASS HERO — SceneAI-style glass hero section
   ═══════════════════════════════════════════════════════════════════════ */

interface GlassHeroProps {
  children: React.ReactNode;
  className?: string;
  gradientColors?: string[];
}

export function GlassHero({
  children,
  className,
  gradientColors = [
    "from-indigo-600",
    "via-purple-600",
    "to-cyan-600",
  ],
}: GlassHeroProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradientColors.join(" ")} p-8 sm:p-12 lg:p-16 ${className}`}
      style={{
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Glass overlay */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Light streaks */}
      <div
        className="absolute inset-0 h-1/3"
        style={{
          background: `
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.15) 0%,
              transparent 50%,
              rgba(255, 255, 255, 0.05) 100%
            )
          `,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   GLOWING BALL — animated 3D glowing sphere (SceneAI-style)
   ═══════════════════════════════════════════════════════════════════════ */

interface GlowingBallProps {
  className?: string;
  color?: string;
  size?: number;
  glowIntensity?: number;
}

export function GlowingBall({
  className,
  color = "rgba(99, 102, 241, 0.6)",
  size = 200,
  glowIntensity = 1,
}: GlowingBallProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `
          radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.3) 0%,
            ${color} 30%,
            rgba(0, 0, 0, 0.3) 100%
          )
        `,
        boxShadow: `
          0 0 ${size * 0.3 * glowIntensity}px rgba(99, 102, 241, ${0.4 * glowIntensity}),
          0 0 ${size * 0.15 * glowIntensity}px rgba(168, 85, 247, ${0.3 * glowIntensity}),
          inset 0 0 ${size * 0.2 * glowIntensity}px rgba(255, 255, 255, 0.1)
        `,
        animation: "ball-pulse 6s ease-in-out infinite alternate",
      }}
      aria-hidden="true"
    />
  );
}
