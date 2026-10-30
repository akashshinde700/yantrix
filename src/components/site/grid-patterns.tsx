"use client";

import { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATED GRID PATTERN — grid with randomly glowing cells
   ═══════════════════════════════════════════════════════════════════════ */

interface AnimatedGridPatternProps {
  className?: string;
  width?: number;
  height?: number;
  cellSize?: number;
  gap?: number;
  color?: string;
  direction?: "horizontal" | "vertical" | "both";
}

export function AnimatedGridPattern({
  className,
  width = 40,
  height = 40,
  cellSize = 20,
  gap = 8,
  color = "rgba(34, 211, 238, 0.3)",
  direction = "both",
}: AnimatedGridPatternProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    const grid = gridRef.current;
    const totalCells = width * height;

    // Create SVG pattern
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${width * (cellSize + gap)} ${height * (cellSize + gap)}`);
    svg.setAttribute("preserveAspectRatio", "none");

    // Create cells
    for (let i = 0; i < totalCells; i++) {
      const row = Math.floor(i / width);
      const col = i % width;
      const x = col * (cellSize + gap);
      const y = row * (cellSize + gap);

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x.toString());
      rect.setAttribute("y", y.toString());
      rect.setAttribute("width", cellSize.toString());
      rect.setAttribute("height", cellSize.toString());
      rect.setAttribute("rx", "2");
      rect.setAttribute("fill", color);
      rect.setAttribute("class", "animate-grid-cell");
      rect.style.opacity = (0.1 + Math.random() * 0.4).toString();
      rect.style.animationDelay = `${(Math.random() * 5).toString()}s`;
      rect.style.animationDuration = `${3 + Math.random() * 4}s`;

      // Add glow filter
      rect.setAttribute("filter", `url(#glow-${i})`);
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", `glow-${i}`);
      const blur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
      blur.setAttribute("stdDeviation", "2");
      filter.appendChild(blur);
      defs.appendChild(filter);
      svg.appendChild(defs);

      svg.appendChild(rect);
    }

    grid.appendChild(svg);

    // Add animation styles
    const styleId = "grid-cell-animations";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .animate-grid-cell {
          animation: grid-glow 4s ease-in-out infinite alternate;
        }
        @keyframes grid-glow {
          0% { opacity: 0.1; }
          100% { opacity: 0.5; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-grid-cell { animation: none !important; }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      // Cleanup handled by React unmount
    };
  }, [width, height, cellSize, gap, color]);

  return (
    <div
      ref={gridRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        opacity: 0.6,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DOT PATTERN — repeating SVG dot pattern background
   ═══════════════════════════════════════════════════════════════════════ */

interface DotPatternProps {
  className?: string;
  colors?: [string, string];
  size?: number;
  gap?: number;
}

export function DotPattern({
  className,
  colors = ["#000", "#ffffff"],
  size = 16,
  gap = 4,
}: DotPatternProps) {
  return (
    <div
      className={className}
      style={{
        backgroundImage: `radial-gradient(circle, ${colors[1]} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        opacity: 0.3,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
