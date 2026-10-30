"use client";

/* ═══════════════════════════════════════════════════════════════════════
   PREMIUM EFFECTS — Magnetic buttons, Marquee, Film Grain, Text Scramble
   ═══════════════════════════════════════════════════════════════════════ */

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────
   MAGNETIC BUTTON — cursor ke taraf attract hota hai (premium feel)
   ──────────────────────────────────────────────────────────────────── */

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function MagneticButton({
  children,
  className,
  onClick,
  variant = "default",
  size = "md",
}: MagneticButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.bottom;

    setPosition({
      x: Math.min(8, Math.max(-8, x * 0.15)),
      y: Math.min(8, Math.max(-8, y * 0.15)),
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variantClasses = {
    default:
      "bg-cyber-500/10 border border-cyber-500/20 text-white hover:bg-cyber-500/20 hover:border-cyber-500/40 hover:shadow-[0_0_30px_-8px_rgba(34,211,238,0.5)]",
    outline:
      "border border-cyber-500/30 bg-transparent text-white hover:bg-cyber-500/10 hover:border-cyber-500/50 hover:text-cyber-200",
    ghost:
      "bg-transparent border-transparent text-white hover:bg-white/5 hover:text-cyber-200",
  };

  return (
    <motion.button
      ref={ref}
      className={cn(
        "group relative overflow-hidden font-bold tracking-wide transition-all duration-300",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Shimmer effect */}
      <span
        className="pointer-events-none absolute -right-1 h-full w-1 rounded-r-full bg-white/20"
        style={{
          transform: "translateX(-100%)",
          transition: "transform 0.5s ease",
        }}
      />

      {/* Children */}
      <span className="relative z-10">{children}</span>

      {/* Hover glow */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300",
          variant === "default" ? "bg-cyber-400/10" : "bg-cyber-500/5"
        )}
        style={{
          filter: "blur(20px)",
        }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
        />
      </span>
    </motion.button>
  );
}

/* ────────────────────────────────────────────────────────────────────
   INFINITE MARQUEE — scrolling text/logos (brand momentum)
   ──────────────────────────────────────────────────────────────────── */

interface MarqueeProps {
  items: React.ReactNode[];
  className?: string;
  direction?: "left" | "right";
  speed?: number;
  pauseOnHover?: boolean;
  showFade?: boolean;
}

export function Marquee({
  items,
  className,
  direction = "left",
  speed = 30,
  pauseOnHover = true,
  showFade = true,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        showFade && "mask-[linear-gradient(to_right,transparent_0%,#000_15%,#000_85%,transparent_100%)]",
        className
      )}
      aria-label="Scrolling content"
    >
      <div
        className={cn(
          "flex animate-marquee",
          direction === "right" ? "-translate-x-full" : "translate-x-full",
          pauseOnHover && "hover:pause-animation"
        )}
        style={{
          animationDuration: `${speed}s`,
          animationDirection: direction === "right" ? "normal" : "reverse",
        }}
      >
        {/* Duplicate items for seamless loop */}
        {[...items, ...items, ...items].map((item, i) => (
          <div
            key={i}
            className="flex items-center px-8"
            style={{ flexShrink: 0 }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   FILM GRAIN OVERLAY — premium noise texture
   ──────────────────────────────────────────────────────────────────── */

interface FilmGrainProps {
  className?: string;
  intensity?: number;
  visible?: boolean;
}

export function FilmGrain({
  className,
  intensity = 0.03,
  visible = true,
}: FilmGrainProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const generateNoise = () => {
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);
    };

    generateNoise();
    const interval = setInterval(generateNoise, 100);

    return () => clearInterval(interval);
  }, [intensity]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-50",
        className
      )}
      style={{
        opacity: intensity,
      }}
    >
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="h-full w-full animate-grain"
        style={{
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   TEXT SCRAMBLE — glitchy text effect on hover
   ──────────────────────────────────────────────────────────────────── */

interface TextScrambleProps {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
  showOnHover?: boolean;
}

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=?";

export function TextScramble({
  text,
  className,
  duration = 0.5,
  delay = 0.2,
  showOnHover = false,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = React.useState(text);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const scramble = () => {
    setIsAnimating(true);
    let iteration = 0;
    const maxIterations = 10;
    const randomChars = text.split("").map(() =>
      letters[Math.floor(Math.random() * letters.length)]
    );

    const interval = setInterval(() => {
      const currentText = text.split("").map((char, index) => {
        if (char === " ") return " ";

        // Gradually reveal correct letters
        const revealProgress = iteration / maxIterations;
        if (revealProgress > index / text.length) {
          return char;
        }

        return randomChars[index];
      });

      setDisplayText(currentText.join(""));
      iteration++;

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
        setIsAnimating(false);
      }
    }, duration / maxIterations);
  };

  React.useEffect(() => {
    if (showOnHover) return;
    // Auto-scramble on mount with delay
    const timer = setTimeout(scramble, delay * 1000);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <span
      className={cn(
        "inline-block font-mono text-[var(--font-weight)] tracking-wider",
        isAnimating && "animate-pulse",
        className
      )}
      onMouseEnter={showOnHover ? scramble : undefined}
      style={{
        textShadow: isAnimating
          ? "0 0 10px rgba(34, 211, 238, 0.5), 0 0 20px rgba(34, 211, 238, 0.3)"
          : undefined,
      }}
    >
      {displayText}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────
   CUSTOM CURSOR — premium cursor for desktop
   ──────────────────────────────────────────────────────────────────── */

interface CustomCursorProps {
  className?: string;
  color?: string;
  size?: number;
  activeColor?: string;
}

export function CustomCursor({
  className,
  color = "#22d3ee",
  size = 20,
  activeColor = "#22d3ee",
}: CustomCursorProps) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = React.useState(true);
  const [isClicked, setIsClicked] = React.useState(false);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseDown = () => {
      setIsClicked(true);
    };

    const handleMouseUp = () => {
      setIsClicked(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    // Hide default cursor on desktop
    document.body.style.cursor = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
    };
  }, []);

  if (!isVisible || typeof window !== "undefined" && window.innerWidth < 1024) {
    return null;
  }

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className={cn(
          "fixed top-0 left-0 z-50 pointer-events-none rounded-full border-2",
          className
        )}
        style={{
          width: size * 1.8,
          height: size * 1.8,
          borderColor: isClicked ? activeColor : color,
          backgroundColor: "rgba(34, 211, 238, 0.05)",
          transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
          transition: "border-color 0.1s ease",
        }}
        animate={{
          scale: isClicked ? 0.8 : 1,
          opacity: 0.8,
        }}
        transition={{ duration: 0.1 }}
      />

      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 z-50 pointer-events-none rounded-full bg-white"
        style={{
          width: size * 0.4,
          height: size * 0.4,
          backgroundColor: isClicked ? activeColor : color,
          transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
        }}
        animate={{
          scale: isClicked ? 1.5 : 1,
        }}
        transition={{ duration: 0.1 }}
      />
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────
   SPOTLIGHT CARD — mouse-tracking spotlight effect on cards
   ──────────────────────────────────────────────────────────────────── */

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  blur?: number;
  intensity?: number;
}

export function SpotlightCard({
  children,
  className,
  color = "#22d3ee",
  blur = 60,
  intensity = 0.3,
}: SpotlightCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = React.useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    setSpotlight({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      {/* Spotlight overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(200px circle at ${spotlight.x}% ${spotlight.y}%, ${color}${Math.round(intensity * 255).toString(16).padStart(2, "0")}, transparent 60%)`,
          opacity: 0.6,
          transition: "opacity 0.3s ease",
          mixBlendMode: "overlay",
        }}
      />

      {/* Border glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500"
        style={{
          boxShadow: `inset 0 0 60px 20px ${color}33, 0 0 40px ${color}22`,
        }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Bottom glow */}
      <div
        className="pointer-events-none absolute -bottom-1 left-1/2 h-16 w-full -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(ellipse, ${color}22 0%, transparent 70%)`,
          filter: "blur(20px)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
