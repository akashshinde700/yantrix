"use client";

import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────
   Animated SVG decorations — circuit lines, orbit rings, dot grids
   and floating code chips. All decorative elements are aria-hidden
   and pointer-events-none so they never block interaction.
   ──────────────────────────────────────────────────────────────────── */

/** Animated dashed "circuit" lines with flowing energy (for dark bands). */
export function CircuitLines({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 300"
      fill="none"
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
    >
      {/* flowing energy lines */}
      <path
        d="M0 60 H140 L180 100 H320 L360 60 H600"
        stroke="currentColor"
        strokeWidth="1.5"
        className="dash-flow-slow"
        strokeLinecap="round"
      />
      <path
        d="M0 150 H90 L130 190 H260 L300 150 H470 L510 190 H600"
        stroke="currentColor"
        strokeWidth="1.5"
        className="dash-flow"
        strokeLinecap="round"
      />
      <path
        d="M0 250 H200 L240 210 H420 L460 250 H600"
        stroke="currentColor"
        strokeWidth="1.5"
        className="dash-flow-slow"
        strokeLinecap="round"
      />
      {/* nodes */}
      {[
        [140, 60],
        [320, 100],
        [90, 150],
        [300, 150],
        [470, 150],
        [240, 210],
        [200, 250],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="currentColor" opacity={0.9}>
          <animate
            attributeName="opacity"
            values="0.35;1;0.35"
            dur={`${2 + (i % 3)}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

/** Concentric dashed orbit rings with counter-rotating dots. */
export function OrbitRings({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
    >
      <svg viewBox="0 0 200 200" fill="none" className="h-full w-full">
        <g className="animate-spin-slow origin-center">
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 10"
            strokeLinecap="round"
          />
          <circle cx="100" cy="10" r="4" fill="currentColor" />
        </g>
        <g className="animate-spin-slow-rev origin-center">
          <circle
            cx="100"
            cy="100"
            r="62"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 8"
            strokeLinecap="round"
          />
          <circle cx="162" cy="100" r="3" fill="currentColor" />
        </g>
        <circle
          cx="100"
          cy="100"
          r="34"
          stroke="currentColor"
          strokeWidth="1"
          className="dash-flow"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/** Subtle dotted grid background layer. */
export function GridDots({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("bg-dots-dark pointer-events-none absolute inset-0", className)}
    />
  );
}

/** Floating code symbol chips (`</>`, `{ }`, `#`) used on dark hero bands. */
export function FloatingCodeChips({ className }: { className?: string }) {
  const chips = [
    { label: "</>", className: "left-[6%] top-[22%] animate-float", delay: "0s" },
    { label: "{ }", className: "left-[16%] bottom-[18%] animate-float-slow", delay: "0.6s" },
    { label: "#", className: "right-[10%] top-[30%] animate-float-slow", delay: "0.3s" },
    { label: "01", className: "right-[20%] bottom-[24%] animate-float", delay: "1s" },
  ];
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      {chips.map((chip) => (
        <span
          key={chip.label}
          style={{ animationDelay: chip.delay }}
          className={cn(
            "absolute rounded-xl bg-white/[0.07] px-3 py-2 font-mono text-sm font-bold text-brand-200/80 ring-1 ring-white/10 backdrop-blur-sm",
            chip.className
          )}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

/** Combined decorative layer for dark page-hero bands (dots + circuit + orbit). */
export function HeroDecor({
  orbitClassName = "-right-16 -top-16 h-72 w-72 text-brand-400/40",
  circuitClassName = "absolute inset-x-0 bottom-0 h-40 w-full text-brand-400/30",
}: {
  orbitClassName?: string;
  circuitClassName?: string;
}) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <GridDots className="opacity-60" />
      <CircuitLines className={circuitClassName} />
      <OrbitRings className={orbitClassName} />
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl" />
    </div>
  );
}
