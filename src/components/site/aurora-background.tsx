"use client";

import { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   AURORA BACKGROUND — enhanced aurora borealis effect (MagicUI style)
   ═══════════════════════════════════════════════════════════════════════ */

interface AuroraBackgroundProps {
  className?: string;
  colors?: string[];
  blur?: number;
  speed?: number;
  scale?: number;
}

export function AuroraBackground({
  className,
  colors = [
    "rgba(99, 102, 241, 0.25)",   // indigo
    "rgba(168, 85, 247, 0.2)",    // purple
    "rgba(6, 182, 212, 0.2)",     // cyan
    "rgba(236, 72, 153, 0.15)",   // pink
  ],
  blur = 80,
  speed = 1,
  scale = 1.5,
}: AuroraBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Create blobs
    const blobCount = 3;
    for (let i = 0; i < blobCount; i++) {
      const blob = document.createElement("div");
      blob.style.position = "absolute";
      blob.style.width = `${Math.min(rect.width, rect.height) * 0.5 * scale}px`;
      blob.style.height = `${Math.min(rect.width, rect.height) * 0.5 * scale}px`;
      blob.style.background = colors[i % colors.length];
      blob.style.filter = `blur(${blur}px)`;
      blob.style.borderRadius = "50%";
      blob.style.position = "absolute";
      blob.style.top = `${30 + i * 20}%`;
      blob.style.left = `${20 + i * 30}%`;
      blob.style.transform = "translate(-50%, -50%)";
      blob.style.animation = `aurora-blob-${i} ${12 / speed}s ease-in-out infinite alternate`;
      blob.style.willChange = "transform, opacity";
      container.appendChild(blob);
      blobsRef.current[i] = blob;
    }

    // Inject keyframe animations
    const styleId = "aurora-keyframes";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes aurora-blob-0 {
          0% { transform: translate(-50%, -50%) translate(0, 0) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) translate(30px, -20px) scale(1.2); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) translate(-20px, 15px) scale(0.9); opacity: 0.5; }
        }
        @keyframes aurora-blob-1 {
          0% { transform: translate(-50%, -50%) translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) translate(-25px, 20px) scale(1.3); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) translate(30px, -10px) scale(0.85); opacity: 0.6; }
        }
        @keyframes aurora-blob-2 {
          0% { transform: translate(-50%, -50%) translate(0, 0) scale(1); opacity: 0.7; }
          50% { transform: translate(-50%, -50%) translate(20px, 15px) scale(1.15); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) translate(-30px, -20px) scale(1.05); opacity: 0.7; }
        }
        @media (prefers-reduced-motion: reduce) {
          div[id^="aurora-blob"] { animation: none !important; }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      blobsRef.current.forEach((blob) => {
        if (blob && blob.parentNode) blob.parentNode.removeChild(blob);
      });
    };
  }, [colors, blur, speed, scale]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   WATERMELON AURORA — pink/blue aurora specifically (popular trend)
   ═══════════════════════════════════════════════════════════════════════ */

export function WatermelonAurora({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Pink blob */}
      <div
        className="absolute h-[500px] w-[500px] rounded-full bg-pink-500/25 blur-[100px] animate-pulse-slow"
        style={{
          top: "10%",
          left: "20%",
          animation: "aurora-drift 15s ease-in-out infinite alternate",
        }}
      />
      {/* Blue blob */}
      <div
        className="absolute h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-[80px] animate-pulse-slow"
        style={{
          top: "30%",
          right: "10%",
          animation: "aurora-drift-reverse 12s ease-in-out infinite alternate",
        }}
      />
      {/* Purple blob */}
      <div
        className="absolute h-[350px] w-[350px] rounded-full bg-purple-500/15 blur-[70px] animate-pulse-slow"
        style={{
          bottom: "10%",
          left: "40%",
          animation: "aurora-drift 14s ease-in-out infinite alternate",
        }}
      />
    </div>
  );
}
