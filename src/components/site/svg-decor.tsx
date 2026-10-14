"use client";

import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────
   FUTURISTIC SVG & MOTION DECOR — aurora blobs, cyber grid, hex rings,
   circuit lines with traveling energy pulses, rising particles, beams.
   All decorative elements are aria-hidden and pointer-events-none.
   ──────────────────────────────────────────────────────────────────── */

/** Three slow-drifting blurred energy blobs — the "aurora" of dark bands. */
export function Aurora({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <span className="animate-aurora-a absolute -left-32 top-[-25%] h-[420px] w-[420px] rounded-full bg-brand-600/30 blur-[110px]" />
      <span className="animate-aurora-b absolute right-[-12%] top-[5%] h-[380px] w-[380px] rounded-full bg-cyber-500/25 blur-[100px]" />
      <span className="animate-aurora-c absolute bottom-[-35%] left-[32%] h-[330px] w-[540px] rounded-full bg-brand-500/20 blur-[120px]" />
    </div>
  );
}

/** Animated dashed "circuit" lines with flowing energy + traveling light pulses. */
export function CircuitLines({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 300"
      fill="none"
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
    >
      <defs>
        <filter id="pulse-glow" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* flowing energy lines */}
      <path
        id="yx-circuit-1"
        d="M0 60 H140 L180 100 H320 L360 60 H600"
        stroke="currentColor"
        strokeWidth="1.5"
        className="dash-flow-slow"
        strokeLinecap="round"
      />
      <path
        id="yx-circuit-2"
        d="M0 150 H90 L130 190 H260 L300 150 H470 L510 190 H600"
        stroke="currentColor"
        strokeWidth="1.5"
        className="dash-flow"
        strokeLinecap="round"
      />
      <path
        id="yx-circuit-3"
        d="M0 250 H200 L240 210 H420 L460 250 H600"
        stroke="currentColor"
        strokeWidth="1.5"
        className="dash-flow-slow"
        strokeLinecap="round"
      />

      {/* traveling light pulses along the circuit paths */}
      <circle r="3.2" fill="#67e8f9" filter="url(#pulse-glow)">
        <animateMotion dur="5s" repeatCount="indefinite" rotate="auto">
          <mpath href="#yx-circuit-1" />
        </animateMotion>
      </circle>
      <circle r="2.6" fill="#a5f3fc" filter="url(#pulse-glow)">
        <animateMotion dur="6.5s" begin="1.2s" repeatCount="indefinite">
          <mpath href="#yx-circuit-2" />
        </animateMotion>
      </circle>
      <circle r="2.6" fill="#609afa" filter="url(#pulse-glow)">
        <animateMotion dur="7s" begin="2.4s" repeatCount="indefinite">
          <mpath href="#yx-circuit-3" />
        </animateMotion>
      </circle>

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

/** Rotating double-hexagon "reactor" ring with pulsing core. */
export function HexRing({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
    >
      <svg viewBox="0 0 200 200" fill="none" className="h-full w-full">
        <g className="animate-spin-slow origin-center">
          <path
            d="M192 100 L146 179.7 L54 179.7 L8 100 L54 20.3 L146 20.3 Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeDasharray="10 12"
            strokeLinecap="round"
          />
        </g>
        <g className="animate-spin-slow-rev origin-center">
          <path
            d="M150.2 129 L100 158 L49.8 129 L49.8 71 L100 42 L150.2 71 Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="4 8"
            strokeLinecap="round"
          />
        </g>
        <circle cx="100" cy="100" r="22" stroke="currentColor" strokeWidth="1.2" className="dash-flow" />
        <circle cx="100" cy="100" r="5" fill="currentColor">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="r" values="4.4;5.6;4.4" dur="2.4s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
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

/** Cyber grid background + vertical scanning line sweeping downward. */
export function PulseGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="bg-grid-futur absolute inset-0" />
      <span className="scan-line absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyber-400/10 to-transparent" />
    </div>
  );
}

/** Small glowing particles rising from the bottom (deterministic layout). */
const PARTICLES: Array<[left: number, delay: number, duration: number, size: number]> = [
  [6, 0, 9, 3],
  [14, 2.6, 11, 2],
  [23, 1.1, 8.5, 3],
  [34, 3.4, 12, 2],
  [45, 0.7, 9.5, 3],
  [53, 2.1, 10, 2],
  [64, 1.6, 8, 3],
  [73, 3.1, 11.5, 2],
  [82, 0.4, 9, 3],
  [91, 2.9, 10.5, 2],
  [29, 4.4, 10, 2],
  [59, 4.9, 8.5, 3],
];

export function Particles({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {PARTICLES.map(([left, delay, duration, size], i) => (
        <span
          key={i}
          className="animate-rise absolute rounded-full bg-cyber-300"
          style={{
            left: `${left}%`,
            bottom: "-8px",
            width: size,
            height: size,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            boxShadow: "0 0 8px 1px rgba(34,211,238,0.65)",
          }}
        />
      ))}
    </div>
  );
}

/** Diagonal light beam that periodically sweeps across a panel. */
export function LightBeam({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <span className="light-beam absolute inset-y-[-20%] left-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
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
            "absolute rounded-xl bg-white/[0.06] px-3 py-2 font-mono text-sm font-bold text-cyber-200/80 ring-1 ring-white/10 shadow-[0_0_18px_-4px_rgba(34,211,238,0.35)] backdrop-blur-md",
            chip.className
          )}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

/** Combined decorative layer for dark page-hero bands — aurora, cyber
 *  grid + scan, circuit with pulses, hex ring, orbit rings and glow orbs. */
export function HeroDecor({
  orbitClassName = "-right-16 -top-16 h-72 w-72 text-cyber-300/30",
  hexClassName = "right-[24%] -bottom-10 h-40 w-40 text-cyber-400/25",
  circuitClassName = "absolute inset-x-0 bottom-0 h-40 w-full text-brand-400/30",
}: {
  orbitClassName?: string;
  hexClassName?: string;
  circuitClassName?: string;
}) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Aurora />
      <PulseGrid className="opacity-70" />
      <CircuitLines className={circuitClassName} />
      <HexRing className={hexClassName} />
      <OrbitRings className={orbitClassName} />
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
    </div>
  );
}
