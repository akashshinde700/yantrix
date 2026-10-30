"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   COSMIC TEXT REVEAL — dramatic text appearance with particle burst,
   glitter sparkle, and orbital sweep effects.
   ═══════════════════════════════════════════════════════════════════════ */

interface CosmicTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  variant?: "cosmic" | "glitch" | "orbit" | "sparkle";
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export function CosmicTextReveal({
  text,
  className,
  delay = 0,
  duration = 0.8,
  variant = "cosmic",
  as: Tag = "h1",
}: CosmicTextRevealProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Generate sparkles for sparkle variant
  useEffect(() => {
    if (variant === "sparkle" && visible) {
      const s: Array<{ id: number; x: number; y: number }> = [];
      for (let i = 0; i < 20; i++) {
        s.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
        });
      }
      setSparkles(s);
    }
  }, [visible, variant]);

  const cosmicVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const orbitVariants = {
    hidden: { opacity: 0, scale: 0.5, rotate: -180 },
    visible: { opacity: 1, scale: 1, rotate: 0 },
  };

  const glitchVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const MotionTag = Tag as keyof typeof motion;

  return (
    <div ref={ref} className={className} style={{ position: "relative", display: "inline-block" }}>
      {/* Sparkle particles */}
      {variant === "sparkle" && visible &&
        sparkles.map((s) => (
          <motion.span
            key={s.id}
            className="absolute inset-0 pointer-events-none"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: 2,
              height: 2,
              background: "white",
              borderRadius: "50%",
              boxShadow: "0 0 6px 2px rgba(255,255,255,0.8)",
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              y: [0, -20, -40],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: s.id * 0.1,
              ease: "easeOut",
            }}
          />
        ))}

      {/* Orbital ring for orbit variant */}
      {variant === "orbit" && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            width: "120%",
            height: "120%",
            top: "-10%",
            left: "-10%",
          }}
          animate={{ rotate: visible ? 360 : 0 }}
          transition={{ duration: 2, ease: "linear", delay }}
        >
          <span
            className="absolute inset-0 rounded-full border-2 border-cyber-400/30"
            style={{ boxShadow: "0 0 20px rgba(34,211,238,0.3)" }}
          />
          <span
            className="absolute top-0 left-1/2 h-1 w-1 rounded-full bg-cyber-300"
            style={{ boxShadow: "0 0 10px rgba(34,211,238,0.8)" }}
          />
        </motion.div>
      )}

      {/* Main text */}
      <motion.div
        className="text-gradient-cyber"
        variants={variant === "cosmic" ? cosmicVariants : variant === "orbit" ? orbitVariants : glitchVariants}
        initial="hidden"
        animate={visible ? "visible" : "hidden"}
        transition={{ duration, delay, ease: "easeOut" }}
      >
        {text}
      </motion.div>

      {/* RGB split layers for glitch variant */}
      {variant === "glitch" && visible && (
        <>
          <motion.span
            className="absolute inset-0 pointer-events-none"
            style={{
              color: "#22d3ee",
              top: "2px",
              left: "2px",
              opacity: 0.6,
            }}
            animate={{ clipPath: ["polygon(0 0, 100% 0, 100% 100%, 0 100%)", "polygon(0 20%, 100% 0, 100% 80%, 0 100%)", "polygon(0 0, 100% 0, 100% 100%, 0 100%)"] }}
            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
          >
            {text}
          </motion.span>
          <motion.span
            className="absolute inset-0 pointer-events-none"
            style={{
              color: "#60a5fa",
              top: "-1px",
              left: "-2px",
              opacity: 0.4,
            }}
            animate={{ clipPath: ["polygon(0 0, 100% 0, 100% 100%, 0 100%)", "polygon(0 30%, 100% 70%, 100% 100%, 0 30%)", "polygon(0 0, 100% 0, 100% 100%, 0 100%)"] }}
            transition={{ duration: 0.25, repeat: Infinity, repeatDelay: 1.5 }}
          >
            {text}
          </motion.span>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   NEBULA GLOW BEHIND TEXT — soft glowing halo behind headings
   ═══════════════════════════════════════════════════════════════════════ */

export function NebulaTextGlow({
  className,
  color = "rgba(99, 102, 241, 0.15)",
  size = 160,
}: {
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(20px)",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    />
  );
}
