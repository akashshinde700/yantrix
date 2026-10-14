"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────
   AI / ROBOTICS SVG DECOR — neural core, data streams, HUD corners,
   robot buddy, cyber divider, scan sweep, status chip.
   All decorative elements are aria-hidden and pointer-events-none.
   ──────────────────────────────────────────────────────────────────── */

/** The "AI core" — central chip with a neural network of pulsing neurons,
 *  synapse paths carrying traveling signal pulses and rotating HUD rings. */
export function NeuralCore({ className }: { className?: string }) {
  // 8 neurons on a circle around the core chip
  const neurons: Array<[number, number]> = [
    [310, 200],
    [278, 278],
    [200, 310],
    [122, 278],
    [90, 200],
    [122, 122],
    [200, 90],
    [278, 122],
  ];

  // circuit-style synapse paths from the chip to each neuron
  const synapses = [
    "M232 200 H310",
    "M214 214 L262 262 L278 278",
    "M200 232 V310",
    "M186 214 L138 262 L122 278",
    "M168 200 H90",
    "M186 186 L138 138 L122 122",
    "M200 168 V90",
    "M214 186 L262 138 L278 122",
  ];

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
    >
      <svg
        viewBox="0 0 400 400"
        fill="none"
        className="h-full w-full drop-shadow-[0_0_26px_rgba(34,211,238,0.3)]"
      >
        {/* outer HUD tick ring (rotating) */}
        <g className="animate-spin-slow origin-center">
          <circle cx="200" cy="200" r="188" stroke="currentColor" strokeWidth="1" strokeDasharray="2 14" strokeLinecap="round" opacity="0.55" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            // toFixed(2) keeps values identical between server & client (avoids hydration mismatch)
            const x1 = +(200 + 178 * Math.cos(a)).toFixed(2);
            const y1 = +(200 + 178 * Math.sin(a)).toFixed(2);
            const x2 = +(200 + 188 * Math.cos(a)).toFixed(2);
            const y2 = +(200 + 188 * Math.sin(a)).toFixed(2);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity={i % 3 === 0 ? 0.9 : 0.4}
              />
            );
          })}
        </g>

        {/* counter-rotating dashed ring */}
        <g className="animate-spin-slow-rev origin-center">
          <circle cx="200" cy="200" r="158" stroke="currentColor" strokeWidth="1" strokeDasharray="26 10 4 10" opacity="0.5" />
          <circle cx="200" cy="42" r="3.5" fill="#22d3ee" />
        </g>

        {/* faint crosshair */}
        <g opacity="0.18" stroke="currentColor" strokeWidth="1">
          <line x1="200" y1="26" x2="200" y2="70" />
          <line x1="200" y1="330" x2="200" y2="374" />
          <line x1="26" y1="200" x2="70" y2="200" />
          <line x1="330" y1="200" x2="374" y2="200" />
        </g>

        {/* synapse paths */}
        {synapses.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.4"
            strokeLinecap="round"
          />
        ))}

        {/* traveling signal pulses along synapses */}
        {synapses.map((d, i) => (
          <circle
            key={`p${i}`}
            r="2.6"
            fill={i % 2 === 0 ? "#22d3ee" : "#609afa"}
          >
            <animateMotion
              dur={`${3 + (i % 4) * 0.9}s`}
              begin={`${(i * 0.55) % 3}s`}
              repeatCount="indefinite"
              path={d}
            />
          </circle>
        ))}

        {/* neurons — pulsing nodes with dashed orbit rings */}
        {neurons.map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="9" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity="0.55" />
            <circle cx={cx} cy={cy} r="4.4" fill={i % 2 === 0 ? "#22d3ee" : "#60a5fa"}>
              <animate attributeName="opacity" values="0.35;1;0.35" dur={`${1.8 + (i % 3) * 0.7}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* central AI chip */}
        <rect x="164" y="164" width="72" height="72" rx="16" fill="rgba(14,165,233,0.16)" stroke="currentColor" strokeWidth="1.6" />
        <rect x="172" y="172" width="56" height="56" rx="11" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" opacity="0.6" />
        {/* chip pins */}
        {[
          [186, 156, 186, 164],
          [200, 156, 200, 164],
          [214, 156, 214, 164],
          [186, 236, 186, 244],
          [200, 236, 200, 244],
          [214, 236, 214, 244],
          [156, 186, 164, 186],
          [156, 200, 164, 200],
          [156, 214, 164, 214],
          [236, 186, 244, 186],
          [236, 200, 244, 200],
          [236, 214, 244, 214],
        ].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
        ))}
        <text
          x="200"
          y="204"
          textAnchor="middle"
          fontFamily="var(--font-geist-mono), monospace"
          fontSize="26"
          fontWeight="800"
          fill="#67e8f9"
        >
          AI
        </text>
        <text
          x="200"
          y="222"
          textAnchor="middle"
          fontFamily="var(--font-geist-mono), monospace"
          fontSize="8"
          letterSpacing="4"
          fill="#93bbfd"
          opacity="0.9"
        >
          CORE
        </text>

        {/* faint binary whispers */}
        <text x="34" y="60" fontFamily="var(--font-geist-mono), monospace" fontSize="9" fill="currentColor" opacity="0.3">10110</text>
        <text x="318" y="356" fontFamily="var(--font-geist-mono), monospace" fontSize="9" fill="currentColor" opacity="0.3">01101</text>
        <text x="300" y="52" fontFamily="var(--font-geist-mono), monospace" fontSize="9" fill="currentColor" opacity="0.22">&lt;/&gt;</text>
      </svg>
    </div>
  );
}

/** Matrix-style falling glyph columns — deterministic (SSR-safe). */
const DROP_COLS: Array<{ left: number; dur: number; delay: number }> = [
  { left: 4, dur: 11, delay: 0 },
  { left: 13, dur: 9, delay: 2.2 },
  { left: 24, dur: 12.5, delay: 1.1 },
  { left: 36, dur: 8.5, delay: 3.4 },
  { left: 47, dur: 10.5, delay: 0.6 },
  { left: 58, dur: 12, delay: 2.8 },
  { left: 69, dur: 9.5, delay: 1.7 },
  { left: 80, dur: 11.5, delay: 4.1 },
  { left: 91, dur: 10, delay: 0.9 },
];
const GLYPHS = "01<>/{}#;$+*";

export function DataStreams({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]",
        className
      )}
    >
      {DROP_COLS.map((col, ci) => (
        <div key={ci} className="absolute top-0 h-full" style={{ left: `${col.left}%` }}>
          <div
            className="animate-drop flex h-full flex-col items-center gap-3 font-mono text-[10px] font-semibold leading-none text-cyber-300"
            style={
              {
                "--drop-dur": `${col.dur}s`,
                "--drop-delay": `${col.delay}s`,
              } as CSSProperties
            }
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} style={{ opacity: 0.25 + ((i * 7 + ci * 3) % 6) * 0.12 }}>
                {GLYPHS[(i * 7 + ci * 5) % GLYPHS.length]}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Four HUD corner brackets that snap in when the parent `.group` is hovered. */
export function HudCorners({
  dark = false,
  className,
}: {
  dark?: boolean;
  className?: string;
}) {
  const color = dark ? "border-cyber-300" : "border-cyber-500";
  const shadow = dark
    ? "shadow-[0_0_10px_rgba(34,211,238,0.55)]"
    : "shadow-[0_0_10px_rgba(6,182,212,0.45)]";
  const corner =
    "absolute h-3.5 w-3.5 opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100";
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-20", className)}
    >
      <span className={cn(corner, color, shadow, "left-1.5 top-1.5 -translate-x-1 -translate-y-1 border-l-2 border-t-2 group-hover:translate-x-0 group-hover:translate-y-0")} />
      <span className={cn(corner, color, shadow, "right-1.5 top-1.5 -translate-y-1 translate-x-1 border-r-2 border-t-2 group-hover:translate-x-0 group-hover:translate-y-0")} />
      <span className={cn(corner, color, shadow, "bottom-1.5 left-1.5 -translate-x-1 translate-y-1 border-b-2 border-l-2 group-hover:translate-x-0 group-hover:translate-y-0")} />
      <span className={cn(corner, color, shadow, "bottom-1.5 right-1.5 translate-x-1 translate-y-1 border-b-2 border-r-2 group-hover:translate-x-0 group-hover:translate-y-0")} />
    </span>
  );
}

/** A skewed light bar that scans across the card once on group-hover. */
export function ScanSweep({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit]",
        className
      )}
    >
      <span className="animate-scan-x absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-cyber-300/25 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </span>
  );
}

/** Friendly robot head — blinking eyes, pulsing antenna, voice bars. */
export function RoboBuddy({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-float pointer-events-none select-none", className)}
    >
      <svg
        viewBox="0 0 140 140"
        fill="none"
        className="h-full w-full drop-shadow-[0_0_24px_rgba(34,211,238,0.35)]"
      >
        {/* antenna */}
        <line x1="70" y1="16" x2="70" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <circle cx="70" cy="13" r="4.5" fill="#22d3ee">
          <animate attributeName="r" values="3.6;5.2;3.6" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="70" cy="13" r="8" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2 4" opacity="0.5">
          <animate attributeName="r" values="7;12;7" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2.2s" repeatCount="indefinite" />
        </circle>

        {/* ears */}
        <rect x="18" y="56" width="12" height="26" rx="5" stroke="currentColor" strokeWidth="2" opacity="0.7" />
        <rect x="110" y="56" width="12" height="26" rx="5" stroke="currentColor" strokeWidth="2" opacity="0.7" />

        {/* head */}
        <rect x="30" y="34" width="80" height="66" rx="20" fill="rgba(255,255,255,0.05)" stroke="currentColor" strokeWidth="2" />
        {/* visor */}
        <rect x="42" y="48" width="56" height="32" rx="13" fill="#04101f" stroke="rgba(34,211,238,0.4)" strokeWidth="1.4" />
        {/* eyes (independent blinks) */}
        <circle cx="59" cy="64" r="6" fill="#67e8f9">
          <animate attributeName="ry" values="6;6;1;6;6" keyTimes="0;0.86;0.9;0.94;1" dur="3.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="81" cy="64" r="6" fill="#67e8f9">
          <animate attributeName="ry" values="6;6;1;6;6" keyTimes="0;0.86;0.9;0.94;1" dur="4.3s" repeatCount="indefinite" />
        </circle>
        <circle cx="61" cy="62" r="1.6" fill="#ffffff" opacity="0.9" />
        <circle cx="83" cy="62" r="1.6" fill="#ffffff" opacity="0.9" />

        {/* voice bars */}
        <rect x="61" y="88" width="3.5" height="6" rx="1.75" fill="#609afa">
          <animate attributeName="height" values="4;9;4" dur="1.1s" repeatCount="indefinite" />
        </rect>
        <rect x="68.5" y="88" width="3.5" height="6" rx="1.75" fill="#22d3ee">
          <animate attributeName="height" values="8;3;8" dur="0.9s" repeatCount="indefinite" />
        </rect>
        <rect x="76" y="88" width="3.5" height="6" rx="1.75" fill="#609afa">
          <animate attributeName="height" values="5;10;5" dur="1.3s" repeatCount="indefinite" />
        </rect>
      </svg>
    </div>
  );
}

/** Thin "circuit seam" divider with a traveling pulse — for light sections. */
export function CyberDivider({ className }: { className?: string }) {
  const mainPath = "M0 22 H470 L492 10 H708 L730 22 H1200";
  const subPath = "M0 36 H430 L452 42 H748 L770 36 H1200";
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none relative flex h-12 items-center justify-center overflow-hidden select-none", className)}
    >
      <svg viewBox="0 0 1200 48" fill="none" preserveAspectRatio="none" className="h-full w-full">
        <path d={subPath} stroke="currentColor" strokeWidth="1" opacity="0.3" className="dash-flow-slow" />
        <path d={mainPath} stroke="currentColor" strokeWidth="1.4" className="dash-flow-slow" strokeLinecap="round" />
        <circle r="3" fill="#22d3ee" filter="drop-shadow(0 0 5px rgba(34,211,238,0.9))">
          <animateMotion dur="6s" repeatCount="indefinite" path={mainPath} />
        </circle>
        <circle r="2.2" fill="#609afa" opacity="0.8">
          <animateMotion dur="8.5s" begin="2s" repeatCount="indefinite" path={subPath} />
        </circle>
        {/* center node */}
        <circle cx="600" cy="10" r="8.5" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <circle cx="600" cy="10" r="3.2" fill="#22d3ee">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* elbow nodes */}
        {[
          [470, 22],
          [492, 10],
          [708, 10],
          [730, 22],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="2.4" fill="currentColor" opacity="0.65">
            <animate attributeName="opacity" values="0.3;0.85;0.3" dur={`${1.6 + i * 0.4}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    </div>
  );
}

/** HUD status chip — "system online" readout with live coordinates. */
export function HudStatusChip({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "glass animate-flicker hidden items-center gap-2.5 rounded-full px-3.5 py-1.5 font-mono text-[10px] font-bold tracking-[0.18em] text-cyber-200/90 shadow-[0_0_20px_-6px_rgba(34,211,238,0.45)] xl:inline-flex",
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </span>
      SYS.ONLINE — PUNE · 18.58°N 73.93°E
    </div>
  );
}
