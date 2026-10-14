"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────
   AI-FLAVoured INTERACTION FX — typing terminal, cursor glow, text
   scramble "decoding" effect and magnetic hover wrapper.
   ──────────────────────────────────────────────────────────────────── */

const SESSION = [
  { cmd: "yantrix init --career", out: "booting future ... OK" },
  { cmd: "import { skills } from 'yantrix'", out: "dev · data · design · marketing" },
  { cmd: "ai.train(you, { mode: 'practical' })", out: "job_ready = true" },
  { cmd: "you.join('Yantrix Technology')", out: "success() — welcome aboard" },
];

/** Glassy terminal window that types AI-flavoured commands on a loop. */
export function TerminalTyper({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const [li, setLi] = useState(0);
  const [ch, setCh] = useState(0);
  const [showOut, setShowOut] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const line = SESSION[li];
    if (ch < line.cmd.length) {
      const t = setTimeout(() => setCh((c) => c + 1), 36);
      return () => clearTimeout(t);
    }
    if (!showOut) {
      const t = setTimeout(() => setShowOut(true), 320);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLi((i) => (i + 1) % SESSION.length);
      setCh(0);
      setShowOut(false);
    }, 2200);
    return () => clearTimeout(t);
  }, [li, ch, showOut, reduced]);

  const line = SESSION[li];
  const prev = SESSION[(li + SESSION.length - 1) % SESSION.length];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "glass overflow-hidden rounded-xl shadow-[0_0_34px_-8px_rgba(34,211,238,0.45)]",
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.04] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-rose-400/80" />
        <span className="h-2 w-2 rounded-full bg-amber-300/80" />
        <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
        <span className="ml-2 font-mono text-[9px] tracking-widest text-slate-400">
          yantrix@ai-core:~
        </span>
      </div>
      <div className="h-[76px] px-3 py-2.5 font-mono text-[11px] leading-relaxed">
        <p className="truncate text-slate-500">
          <span className="text-emerald-400/70">➜</span> {prev.cmd}
        </p>
        <p className="truncate text-cyber-200">
          <span className="text-emerald-400">➜</span>{" "}
          {reduced ? line.cmd : line.cmd.slice(0, ch)}
          {!reduced ? (
            <span className="animate-caret ml-0.5 inline-block h-3 w-[6px] translate-y-[3px] bg-cyber-300" />
          ) : null}
        </p>
        {showOut || reduced ? <p className="truncate text-brand-300">{line.out}</p> : null}
      </div>
    </div>
  );
}

/** Soft cyan glow that trails the cursor — desktop pointers only. */
export function CursorGlow() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const shownRef = useRef(false);
  const x = useMotionValue(-500);
  const y = useMotionValue(-500);
  const sx = useSpring(x, { stiffness: 130, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 130, damping: 22, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || reduced) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!shownRef.current) {
        shownRef.current = true;
        setEnabled(true); // first real pointer event — start showing the glow
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y, reduced]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-[-210px] top-[-210px] z-[3] h-[420px] w-[420px] rounded-full mix-blend-screen"
      style={{
        x: sx,
        y: sy,
        background:
          "radial-gradient(circle, rgba(34,211,238,0.08) 0%, rgba(96,165,250,0.05) 35%, transparent 65%)",
      }}
    />
  );
}

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]#$*";

/** Text that "decodes" — random glyphs settle into the real string. */
export function ScrambleText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(text);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return; // render the real text directly (see JSX below)
    let frame = 0;
    const tick = () => {
      frame += 1;
      const settled = Math.floor(frame / 2.2);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (i < settled || c === " ") out += c;
        else out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      setDisplay(out);
      if (settled < text.length) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [text, reduced]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{reduced ? text : display}</span>
    </span>
  );
}

/** Magnetic hover — children are gently attracted towards the cursor. */
export function Magnetic({
  children,
  className,
  strength = 0.22,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 320, damping: 22 });
  const sy = useSpring(y, { stiffness: 320, damping: 22 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}
