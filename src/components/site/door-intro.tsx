"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "@/lib/content/provider";
import { ENTERED_EVENT, ENTERED_KEY } from "@/components/site/universe/chapters";
import { cn } from "@/lib/utils";
import { soundPreference, startAmbient } from "@/components/site/universe/ambient-sound";

/**
 * Entrance door shown once per browser session, before the welcome popup.
 *
 * Look: obsidian-sapphire metal doors with brushed sheen, recessed panels,
 * champagne-gold trim, cyan energy traces flowing into the seam, glowing
 * handles, three lock bolts across the seam and the brand emblem split
 * between both doors.
 *
 * Sequence: idle → unlocking (bolts retract one by one, emblem spins up,
 * light leaks through the seam and under the doors) → opening (doors swing
 * away in 3D, light rays burst, the emblem splits) → gone.
 *
 * Server-rendered so there is no flash of the site underneath; an inline
 * script in <head> sets `html[data-entered]` for repeat visits in the
 * session, search/AI-engine referrals and bots, and CSS hides the door for
 * them (and for no-JS visitors).
 */

type Phase = "idle" | "unlocking" | "opening" | "gone";

const UNLOCK_MS = 1100;
const OPEN_MS = 2000;

/* Circuit traces on each door, drawn toward the seam (x = 100). */
const TRACES = [
  "M0 118 H38 L54 134 H100",
  "M0 206 H24 L44 226 H76 L88 238 H100",
  "M12 0 V58 L30 76 V150 L46 166 H100",
  "M0 312 H58 L74 328 H100",
  "M0 488 H34 L50 472 H100",
  "M22 640 V588 L40 570 H70 L84 556 H100",
  "M0 700 H46 L62 684 H100",
  "M60 800 V744 L76 728 H100",
];

/* WebAudio: bolt clacks, a whoosh and a rising chord — only ever on the click. */
function playDoorSound() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const now = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.value = 0.9;
    out.connect(ctx.destination);

    const noise = (start: number, length: number, freq: number, q: number, gain: number, sweepTo?: number) => {
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(freq, start);
      if (sweepTo) bp.frequency.exponentialRampToValueAtTime(sweepTo, start + length);
      bp.Q.value = q;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.02, length / 4));
      g.gain.exponentialRampToValueAtTime(0.0001, start + length);
      src.connect(bp).connect(g).connect(out);
      src.start(start);
      src.stop(start + length + 0.05);
    };

    // three bolt clacks
    [0.1, 0.32, 0.54].forEach((t) => noise(now + t, 0.09, 1800, 6, 0.35));
    // air whoosh as the doors swing
    noise(now + UNLOCK_MS / 1000, 1.6, 300, 0.8, 0.28, 2400);
    // rising chord
    const chord = ctx.createGain();
    chord.gain.setValueAtTime(0.0001, now + 0.8);
    chord.gain.exponentialRampToValueAtTime(0.09, now + 1.4);
    chord.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);
    chord.connect(out);
    [220, 277.18, 329.63, 440, 659.25].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(f, now + 0.8);
      o.frequency.exponentialRampToValueAtTime(f * 1.5, now + 3);
      const g = ctx.createGain();
      g.gain.value = 0.3 / (i + 1);
      o.connect(g).connect(chord);
      o.start(now + 0.8 + i * 0.05);
      o.stop(now + 3.7);
    });
    setTimeout(() => ctx.close(), 4200);
  } catch {
    /* audio is optional */
  }
}

function Emblem({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="door-core" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#7dd3fc" />
          <stop offset="75%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0b1230" />
        </radialGradient>
        <linearGradient id="door-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6e3b4" />
          <stop offset="45%" stopColor="#c9a25e" />
          <stop offset="100%" stopColor="#8a6a32" />
        </linearGradient>
        <linearGradient id="door-energy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* plate */}
      <circle cx="100" cy="100" r="97" fill="#060a1c" />
      <circle cx="100" cy="100" r="96" fill="none" stroke="url(#door-gold)" strokeWidth="2" />
      <circle cx="100" cy="100" r="90" fill="none" stroke="url(#door-gold)" strokeOpacity="0.45" strokeWidth="0.75" />
      {/* tick ring */}
      <g className={cn("emblem-spin", lit && "emblem-spin-fast")} style={{ transformOrigin: "100px 100px" }}>
        {Array.from({ length: 48 }, (_, i) => (
          <line
            key={i}
            x1="100"
            y1="14"
            x2="100"
            y2={i % 4 === 0 ? 24 : 19}
            stroke={i % 4 === 0 ? "#f6e3b4" : "#67e8f9"}
            strokeOpacity={i % 4 === 0 ? 0.9 : 0.45}
            strokeWidth={i % 4 === 0 ? 1.4 : 0.8}
            transform={`rotate(${i * 7.5} 100 100)`}
          />
        ))}
      </g>
      {/* energy ring */}
      <g className={cn("emblem-spin-rev", lit && "emblem-spin-fast")} style={{ transformOrigin: "100px 100px" }}>
        <circle cx="100" cy="100" r="72" fill="none" stroke="url(#door-energy)" strokeWidth="2.5" strokeDasharray="70 18 6 18" strokeLinecap="round" />
      </g>
      {/* hexagon */}
      <polygon points="100,44 148.5,72 148.5,128 100,156 51.5,128 51.5,72" fill="none" stroke="url(#door-gold)" strokeOpacity="0.8" strokeWidth="1.2" />
      {/* core: dark lens with a blue glow, holding the official Yantrix icon */}
      <circle
        cx="100"
        cy="100"
        r="40"
        fill="#050a1e"
        stroke="url(#door-core)"
        strokeWidth="2"
        className="transition-[filter] duration-700"
        style={{ filter: lit ? "drop-shadow(0 0 24px #67e8f9) brightness(1.3)" : "drop-shadow(0 0 10px rgba(34,211,238,0.7))" }}
      />
      <svg x="73" y="73" width="54" height="54" viewBox="84 146 835 835">
        <defs>
          <linearGradient id="di-v" gradientUnits="userSpaceOnUse" x1="200" y1="186" x2="700" y2="480">
            <stop offset="0" stopColor="#03adff" />
            <stop offset="1" stopColor="#1228d8" />
          </linearGradient>
          <linearGradient id="di-l" gradientUnits="userSpaceOnUse" x1="124" y1="248" x2="455" y2="891">
            <stop offset="0" stopColor="#e9eaf5" />
            <stop offset="1" stopColor="#b0b6cd" />
          </linearGradient>
          <linearGradient id="di-r" gradientUnits="userSpaceOnUse" x1="540" y1="260" x2="879" y2="520">
            <stop offset="0" stopColor="#d9dcea" />
            <stop offset="1" stopColor="#bcc1d6" />
          </linearGradient>
          <linearGradient id="di-b" gradientUnits="userSpaceOnUse" x1="510" y1="560" x2="660" y2="800">
            <stop offset="0" stopColor="#14b0ff" />
            <stop offset="1" stopColor="#1640e2" />
          </linearGradient>
        </defs>
        <polygon points="124,248 124,344 340,572 340,792 455,891 455,523" fill="url(#di-l)" />
        <polygon points="879,240 524,496 562,519 712,519 879,352" fill="url(#di-r)" />
        <polygon points="170,186 503,479 839,186 655,186 504,323 360,186" fill="url(#di-v)" />
        <polygon points="659,524 545,535 510,590 510,935 659,796" fill="url(#di-b)" />
      </svg>
    </svg>
  );
}

function DoorPanel({ side, phase }: { side: "left" | "right"; phase: Phase }) {
  const left = side === "left";
  const lit = phase !== "idle";
  return (
    <div
      className={cn(
        "door-panel absolute inset-y-0 w-1/2 overflow-hidden",
        left ? "left-0 origin-left" : "right-0 origin-right",
        phase === "opening" && (left ? "door-open-left" : "door-open-right")
      )}
    >
      {/* obsidian-sapphire metal with a top light */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 60% at ${left ? "100%" : "0%"} 0%, rgba(56,189,248,0.10), transparent 60%),
             linear-gradient(${left ? "100deg" : "260deg"}, #03050f 0%, #081130 48%, #0d1a46 100%)`,
        }}
      />
      {/* brushed sheen */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-screen"
        style={{ backgroundImage: "repeating-linear-gradient(180deg, #fff 0 1px, transparent 1px 4px)" }}
      />
      {/* frame + recessed panels with gold hairlines */}
      <div className={cn("absolute inset-y-[4%] rounded-sm border border-[#c9a25e]/35", left ? "left-[6%] right-[3%]" : "left-[3%] right-[6%]")}>
        <div className="door-recess absolute inset-x-[7%] top-[5%] h-[38%] rounded-sm" />
        <div className="door-recess absolute inset-x-[7%] bottom-[5%] h-[38%] rounded-sm" />
      </div>

      {/* energy traces flowing into the seam */}
      <svg
        viewBox="0 0 100 800"
        preserveAspectRatio="none"
        aria-hidden="true"
        className={cn("absolute inset-0 h-full w-full", !left && "-scale-x-100")}
      >
        <defs>
          <linearGradient id={`trace-${side}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>
        </defs>
        {TRACES.map((d, i) => (
          <g key={d}>
            <path d={d} fill="none" stroke="rgba(125,211,252,0.13)" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
            <path
              d={d}
              fill="none"
              stroke={i % 3 === 1 ? "#a78bfa" : `url(#trace-${side})`}
              strokeWidth="1.6"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              pathLength={100}
              className={cn("door-trace", lit && "door-trace-fast")}
              style={{ animationDelay: `${(i * 0.41) % 2.6}s` }}
            />
          </g>
        ))}
      </svg>

      {/* handle near the seam */}
      <div
        className={cn(
          "door-handle absolute top-[44%] hidden h-[26%] w-2 -translate-y-1/2 rounded-full sm:block",
          left ? "right-[24%]" : "left-[24%]",
          lit && "door-handle-lit"
        )}
      />

      {/* seam edge */}
      <div
        className={cn(
          "absolute inset-y-0 w-[3px] transition-all duration-700",
          left ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r",
          lit ? "from-white via-cyan-200/80 to-transparent shadow-[0_0_40px_10px_rgba(103,232,249,0.85)]" : "from-cyan-300/70 to-transparent shadow-[0_0_16px_3px_rgba(34,211,238,0.45)]"
        )}
      />

      {/* half of the emblem — splits when the doors open */}
      <div
        className="door-emblem absolute -translate-y-1/2"
        style={{ [left ? "right" : "left"]: "calc(var(--emblem) / -2)" }}
      >
        <Emblem lit={lit} />
      </div>
    </div>
  );
}

export function DoorIntro() {
  const settings = useSettings();
  const [phase, setPhase] = useState<Phase>("idle");
  const [visible, setVisible] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(ENTERED_KEY, "1");
    } catch {
      /* private mode */
    }
    document.documentElement.setAttribute("data-entered", "");
    document.body.style.overflow = "";
    setPhase("gone");
    setVisible(false);
    window.dispatchEvent(new Event(ENTERED_EVENT));
  }, []);

  useEffect(() => {
    // Already entered this session (or a search/bot visit): CSS keeps the door hidden.
    if (document.documentElement.hasAttribute("data-entered")) return;
    document.body.style.overflow = "hidden";
    buttonRef.current?.focus({ preventScroll: true });
    const pending = timers.current;
    return () => {
      document.body.style.overflow = "";
      pending.forEach(clearTimeout);
    };
  }, []);

  const open = useCallback(() => {
    if (phase !== "idle") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    playDoorSound();
    // the click is the visitor's permission for audio: the space ambience swells in as the doors open
    if (soundPreference() !== "off") startAmbient({ delay: 2.6 });
    setPhase("unlocking");
    timers.current.push(setTimeout(() => setPhase("opening"), UNLOCK_MS));
    timers.current.push(setTimeout(finish, UNLOCK_MS + OPEN_MS));
  }, [phase, finish]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Welcome to ${settings.name}`}
      data-phase={phase}
      className={cn(
        "door-intro fixed inset-0 z-[200] overflow-hidden bg-[#010208] [perspective:1600px]",
        phase === "unlocking" && "door-shake",
        phase === "opening" && "door-intro-fade"
      )}
      onKeyDown={(e) => {
        if (e.key === "Escape") finish();
      }}
    >
      {/* light behind the doors + rays that burst on opening */}
      <div aria-hidden="true" className="door-light absolute inset-0" />
      <div aria-hidden="true" className="door-rays absolute left-1/2 top-1/2 h-[220vmax] w-[220vmax] -translate-x-1/2 -translate-y-1/2" />

      <DoorPanel side="left" phase={phase} />
      <DoorPanel side="right" phase={phase} />

      {/* lock bolts across the seam */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 w-0">
        {/* above the emblem so they never cross the logo or the copy */}
        {[8, 18, 28].map((top, i) => (
          <span
            key={top}
            className={cn("door-bolt absolute -left-7 h-2.5 w-14 rounded-full", phase !== "idle" && "door-bolt-open")}
            style={{ top: `${top}%`, transitionDelay: `${i * 220}ms` }}
          />
        ))}
      </div>

      {/* light leaking under the doors */}
      <div aria-hidden="true" className="door-floor pointer-events-none absolute inset-x-0 bottom-0 h-40" />

      {/* drifting dust */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {Array.from({ length: 30 }, (_, i) => (
          <span
            key={i}
            className="door-dust absolute rounded-full bg-cyan-100"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              width: 1 + (i % 3),
              height: 1 + (i % 3),
              animationDelay: `${(i * 0.7) % 9}s`,
              animationDuration: `${9 + (i % 5) * 2}s`,
            }}
          />
        ))}
      </div>

      {/* copy + action */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-[8%] flex flex-col items-center gap-4 px-6 text-center transition-all duration-500 sm:bottom-[10%]",
          phase !== "idle" && "pointer-events-none translate-y-4 opacity-0"
        )}
      >
        <p className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.5em] text-[#e8cf98]">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#c9a25e]" aria-hidden="true" />
          {settings.name}
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#c9a25e]" aria-hidden="true" />
        </p>
        <p className="max-w-2xl text-3xl font-extrabold tracking-tight text-white text-balance drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] sm:text-5xl">
          Your IT career starts{" "}
          <span className="door-title-glow bg-gradient-to-r from-cyan-200 via-sky-300 to-violet-300 bg-clip-text text-transparent">
            behind this door
          </span>
        </p>
        <button
          ref={buttonRef}
          onClick={open}
          className="door-cta group relative mt-2 inline-flex h-14 items-center gap-3 rounded-full px-9 text-base font-bold text-white transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#010208]"
        >
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" />
          </span>
          Open the door
        </button>
        <p className="text-xs text-slate-400">
          Press <kbd className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">Enter</kbd> to open ·{" "}
          <kbd className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">Esc</kbd> to skip
        </p>
      </div>

      <button
        onClick={finish}
        className={cn(
          "absolute right-5 top-5 rounded-full border border-[#c9a25e]/35 bg-black/30 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#e8cf98] backdrop-blur-sm transition-colors hover:border-[#e8cf98] hover:text-white",
          phase !== "idle" && "opacity-0"
        )}
      >
        Skip
      </button>
    </div>
  );
}
