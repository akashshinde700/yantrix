"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";
import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   SCROLL PARALLAX — 3D depth parallax effect (Instagram reel style)
   ═══════════════════════════════════════════════════════════════════════ */

interface ScrollParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  invert?: boolean;
}

export function ScrollParallax({
  children,
  className,
  speed = 0.5,
  invert = false,
}: ScrollParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    invert ? [speed * 100, 0] : [0, -speed * 100]
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y, willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SCROLL REVEAL — elements reveal on scroll with multiple effects
   ═══════════════════════════════════════════════════════════════════════ */

type RevealEffect = "fade" | "slide-up" | "slide-left" | "slide-right" | "scale" | "blur" | "rotate" | "flip";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  effect?: RevealEffect;
  delay?: number;
  duration?: number;
  threshold?: number;
}

export function ScrollReveal({
  children,
  className,
  effect = "fade",
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  const variants: Record<RevealEffect, { hidden: any; visible: any }> = {
    "fade": {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration, delay } },
    },
    "slide-up": {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0, transition: { duration, delay, ease: "easeOut" } },
    },
    "slide-left": {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0, transition: { duration, delay, ease: "easeOut" } },
    },
    "slide-right": {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0, transition: { duration, delay, ease: "easeOut" } },
    },
    "scale": {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1, transition: { duration, delay, ease: "backOut" } },
    },
    "blur": {
      hidden: { opacity: 0, filter: "blur(10px)" },
      visible: { opacity: 1, filter: "blur(0px)", transition: { duration, delay } },
    },
    "rotate": {
      hidden: { opacity: 0, rotate: -15 },
      visible: { opacity: 1, rotate: 0, transition: { duration, delay, ease: "easeOut" } },
    },
    "flip": {
      hidden: { opacity: 0, rotateY: 90 },
      visible: { opacity: 1, rotateY: 0, transition: { duration, delay, ease: "easeOut" } },
    },
  };

  const variant = variants[effect] || variants["fade"];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={variant}
      style={{ perspective: effect === "flip" ? "1000px" : undefined }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STARDUST EFFECT — particles that burst/reveal on scroll (Instagram trend)
   ═══════════════════════════════════════════════════════════════════════
   Creates a magical effect where elements are surrounded by floating particles
   that react to scroll position.
   ═══════════════════════════════════════════════════════════════════════ */

interface StardustEffectProps {
  className?: string;
  particleCount?: number;
  color?: string;
  size?: number;
  intensity?: number;
}

export function StardustEffect({
  className,
  particleCount = 50,
  color = "rgba(255, 255, 255, 0.8)",
  size = 3,
  intensity = 1,
}: StardustEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    delay: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * size,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 4,
    }));
    setParticles(newParticles);

    // Inject keyframes
    const styleId = "stardust-animation";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes stardust-float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(10px, -15px) scale(1.2); opacity: 0.8; }
          50% { transform: translate(-10px, 10px) scale(1); opacity: 0.5; }
          75% { transform: translate(5px, 5px) scale(1.1); opacity: 0.7; }
        }
        @keyframes stardust-twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @media (prefers-reduced-motion: reduce) {
          div[class*="stardust-particle"] { animation: none !important; }
        }
      `;
      document.head.appendChild(style);
    }
  }, [particleCount, size]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="stardust-particle absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: color,
            boxShadow: `0 0 ${particle.size * 2}px ${color}`,
            borderRadius: "50%",
          }}
          animate={{
            y: [
              0,
              -20 - Math.random() * 30,
              0,
            ],
            x: [
              0,
              (Math.random() - 0.5) * 20,
              0,
            ],
            opacity: [
              0.3,
              0.8,
              0.3,
            ],
            scale: [
              1,
              1.3,
              1,
            ],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Glow orbs */}
      {[0, 1, 2].map((i) => (
        <div
          key={`glow-${i}`}
          className="absolute rounded-full"
          style={{
            width: size * 3,
            height: size * 3,
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            left: `${20 + i * 25}%`,
            top: `${30 + i * 20}%`,
            filter: "blur(10px)",
            opacity: 0.3 * intensity,
            animation: `stardust-float ${4 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SCROLL PROGRESS — animated progress bar that follows scroll
   ═══════════════════════════════════════════════════════════════════════ */

interface ScrollProgressBarProps {
  className?: string;
  color?: string;
  height?: number;
}

export function ScrollProgressBar({
  className,
  color = "rgba(34, 211, 238, 0.8)",
  height = 3,
}: ScrollProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const width = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div
      ref={ref}
      className={`fixed top-0 left-0 z-50 ${className || ""}`}
      style={{ pointerEvents: "none" }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{
          width,
          height: height,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          boxShadow: `0 0 10px ${color}`,
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FLOATING PARTICLES — ambient floating particles that move with scroll
   ═══════════════════════════════════════════════════════════════════════ */

interface FloatingParticlesProps {
  className?: string;
  count?: number;
  color?: string;
  size?: number;
  layerCount?: number;
}

export function FloatingParticles({
  className,
  count = 30,
  color = "rgba(255, 255, 255, 0.6)",
  size = 4,
  layerCount = 3,
}: FloatingParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Inject keyframe animations
    const styleId = "floating-particles-anim";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      let css = `
        @keyframes float-layer-0 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(15px, -20px) scale(1.1); }
          66% { transform: translate(-10px, 15px) scale(0.95); }
        }
        @keyframes float-layer-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 10px) scale(1.05); }
        }
        @keyframes float-layer-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(10px, 20px) scale(1.15); }
          75% { transform: translate(-15px, -10px) scale(0.9); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[class*="float-particle"] { animation: none !important; }
        }
      `;
      for (let i = 0; i < layerCount; i++) {
        css += `
          @keyframes float-layer-${i} {
            0%, 100% { transform: translate(0, 0) scale(1); }
            ${50 + i * 10}% { transform: translate(${(i % 2 === 0 ? 1 : -1) * (10 + i * 5)}px, ${(i % 2 === 0 ? 1 : -1) * (10 + i * 3)}px) scale(${1 + i * 0.05}); }
          }
        `;
      }
      style.textContent = css;
      document.head.appendChild(style);
    }
  }, [layerCount]);

  const createParticles = (layer: number, total: number) => {
    return Array.from({ length: total }, (_, i) => ({
      id: `${layer}-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: size * (0.5 + Math.random() * 0.5),
      delay: Math.random() * 2,
      duration: 4 + Math.random() * 4 + layer * 2,
      opacity: 0.2 + Math.random() * 0.4 - layer * 0.08,
    }));
  };

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
    >
      {Array.from({ length: layerCount }, (_, layer) => (
        createParticles(layer, count / layerCount).map((p) => (
          <motion.div
            key={p.id}
            className="float-particle absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: color,
              borderRadius: "50%",
              opacity: p.opacity,
              boxShadow: `0 0 ${p.size}px ${color}`,
            }}
            animate={{
              y: [
                0,
                -10 - layer * 5,
                0,
              ],
              x: [
                0,
                (Math.random() - 0.5) * (10 + layer * 5),
                0,
              ],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   GLOWING BORDER SCROLL — border glow activates on scroll
   ═══════════════════════════════════════════════════════════════════════ */

interface GlowingBorderScrollProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  glowIntensity?: number;
}

export function GlowingBorderScroll({
  children,
  className,
  color = "rgba(34, 211, 238, 0.6)",
  glowIntensity = 1,
}: GlowingBorderScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.8, 0.4]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Border glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          boxShadow: `inset 0 0 30px -5px ${color}`,
          border: `1px solid ${color}`,
          opacity,
        }}
      />

      {/* Content */}
      <div className="relative z-10 rounded-xl">{children}</div>
    </div>
  );
}
