"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   LIQUID GLASS — Aceternity-style iOS liquid glass effect
   ═══════════════════════════════════════════════════════════════════════ */

interface LiquidGlassProps {
  className?: string;
  children?: React.ReactNode;
  borderOpacity?: number;
  blur?: number;
  highlight?: boolean;
}

export function LiquidGlass({
  className,
  children,
  borderOpacity = 0.15,
  blur = 20,
  highlight = true,
}: LiquidGlassProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px",
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {/* Specular highlight (mouse-tracking) */}
      {highlight && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background: `
              radial-gradient(
                300px circle at ${mouseX.get()} * 100% ${mouseY.get()} * 100%,
                rgba(255, 255, 255, 0.2) 0%,
                rgba(255, 255, 255, 0.05) 30%,
                transparent 50%
              )
            `,
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* Inner shadow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          boxShadow: "inset 0 0 30px rgba(0, 0, 0, 0.2)",
        }}
      />

      {/* Content */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   BACKGROUND BEAMS — Aceternity-style SVG beam animations
   ═══════════════════════════════════════════════════════════════════════ */

interface BackgroundBeamsProps {
  className?: string;
  color?: string;
  count?: number;
  opacity?: number;
  blur?: number;
}

export function BackgroundBeams({
  className,
  color = "rgba(34, 211, 238, 0.4)",
  count = 5,
  opacity = 0.8,
  blur = 2,
}: BackgroundBeamsProps) {
  // Generate beam paths
  const beams = Array.from({ length: count }, (_, i) => {
    const x1 = Math.random() * 100;
    const y1 = Math.random() * 100;
    const x2 = Math.random() * 100;
    const y2 = Math.random() * 100;
    const x3 = Math.random() * 100;
    const y3 = Math.random() * 100;
    const delay = Math.random() * 2;
    return { id: i, x1, y1, x2, y2, x3, y3, delay };
  });

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      {/* Base gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 50%, rgba(6,182,212,0.1) 100%)`,
        }}
      />

      {/* Animated beams */}
      {beams.map((beam) => (
        <svg
          key={beam.id}
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`beam-gradient-${beam.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="transparent" stopOpacity="0" />
              <stop offset="50%" stopColor={color} stopOpacity={opacity} />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            <filter id={`beam-glow-${beam.id}`}>
              <feGaussianBlur stdDeviation={blur.toString()} />
            </filter>
          </defs>
          <motion.path
            d={`M ${beam.x1} ${beam.y1} L ${beam.x2} ${beam.y2} L ${beam.x3} ${beam.y3}`}
            stroke={`url(#beam-gradient-${beam.id})`}
            strokeWidth="0.5"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              delay: beam.delay,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            filter={`url(#beam-glow-${beam.id})`}
          />
        </svg>
      ))}

      {/* Moving particles along beams */}
      {beams.map((beam) => (
        <motion.circle
          key={`particle-${beam.id}`}
          r="0.3"
          fill="#ffffff"
          filter={`url(#beam-glow-${beam.id})`}
          cx={beam.x1}
          cy={beam.y1}
          initial={{ opacity: 0 }}
          animate={{
            cx: [beam.x1, beam.x2, beam.x3],
            cy: [beam.y1, beam.y2, beam.y3],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 3,
            delay: beam.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   WOBBLE CARD — card that translates and scales on mouse move
   ═══════════════════════════════════════════════════════════════════════ */

interface WobbleCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  radius?: number;
}

export function WobbleCard({
  children,
  className,
  intensity = 8,
  radius = 16,
}: WobbleCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState([0, 0]);
  const [scale, setScale] = useState(1);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setRotate([
      (y - 0.5) * -intensity,
      (x - 0.5) * intensity,
    ]);
    setScale(1 + (1 - Math.abs(x - 0.5) * 2) * 0.1);
  };

  const handleMouseLeave = () => {
    setRotate([0, 0]);
    setScale(1);
  };

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        transformStyle: "preserve-3d",
        transition: "box-shadow 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* 3D transformed content */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          transform: `rotateX(${rotate[0]}deg) rotateY(${rotate[1]}deg) scale(${scale})`,
          transformOrigin: "center",
          willChange: "transform",
        }}
      >
        {/* Border glow on hover */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            boxShadow: `0 0 30px -5px rgba(34, 211, 238, 0.3)`,
            border: "1px solid rgba(34, 211, 238, 0.3)",
          }}
        />

        {/* Specular highlight */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background: `
              radial-gradient(
                200px circle at ${50 + (rotate[1] / intensity) * 20}% ${50 + (rotate[0] / intensity) * 20}%,
                rgba(255, 255, 255, 0.15) 0%,
                transparent 50%
              )
            `,
            mixBlendMode: "overlay",
          }}
        />
      </motion.div>

      {/* Content layer */}
      <div className="relative z-10 rounded-2xl p-6">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HERO HIGHLIGHT — background effect with text highlight (Aceternity-style)
   ═══════════════════════════════════════════════════════════════════════ */

interface HeroHighlightProps {
  className?: string;
  highlightText?: string;
  color?: string;
}

export function HeroHighlight({
  className,
  highlightText = "Highlight",
  color = "rgba(34, 211, 238, 0.8)",
}: HeroHighlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 50%, rgba(6,182,212,0.1) 100%)`,
        }}
      />

      {/* Text highlight ring that follows mouse */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{
          width: "200px",
          height: "80px",
          transform: `translate(${mouseX.get() * 100 - 100}px, ${mouseY.get() * 100 - 40}px)`,
        }}
      >
        <div
          className="rounded-lg border-2 border-white/20 bg-white/5 backdrop-blur-md p-4"
          style={{
            boxShadow: `0 0 30px -5px ${color}`,
          }}
        >
          <span
            className="text-lg font-bold text-white"
            style={{
              background: `linear-gradient(90deg, #fff 0%, ${color} 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {highlightText}
          </span>
        </div>
      </motion.div>

      {/* Content goes here */}
      <div className="relative z-10">
        {/* Your content */}
        {highlightText}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   IMAGE CURSOR TRAIL — Skiper-style cursor trail effect
   ═══════════════════════════════════════════════════════════════════════ */

interface ImageCursorTrailProps {
  className?: string;
  imageUrl?: string;
  trailLength?: number;
  opacity?: number;
}

export function ImageCursorTrail({
  className,
  imageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%2322d3ee' opacity='0.5'/%3E%3C/svg%3E",
  trailLength = 10,
  opacity = 0.6,
}: ImageCursorTrailProps) {
  const [trail, setTrail] = useState<Array<{ x: number; y: number }>>([]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setTrail((prev) => {
      const newTrail = [...prev, { x: e.clientX, y: e.clientY }];
      return newTrail.length > trailLength ? newTrail.slice(1) : newTrail;
    });
  };

  const handleMouseLeave = () => {
    setTrail([]);
  };

  return (
    <div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: "none",
      }}
    >
      {/* Trail images */}
      {trail.map((pos, i) => (
        <motion.img
          key={i}
          src={imageUrl}
          alt=""
          className="pointer-events-none absolute rounded-full"
          style={{
            left: pos.x - 15,
            top: pos.y - 15,
            width: 30 - i * 2,
            height: 30 - i * 2,
            opacity: opacity * (1 - i / trailLength),
            pointerEvents: "none",
            filter: "blur(1px)",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1 - i / trailLength,
            opacity: opacity * (1 - i / trailLength),
          }}
          transition={{ duration: 0.3 }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10">
        {/* Your content */}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MESH GRADIENT — fluid animated mesh gradient background
   ═══════════════════════════════════════════════════════════════════════ */

interface MeshGradientProps {
  className?: string;
  colors?: string[];
  speed?: number;
}

export function MeshGradient({
  className,
  colors = [
    "rgba(99, 102, 241, 0.4)",    // indigo
    "rgba(168, 85, 247, 0.35)",   // purple
    "rgba(6, 182, 212, 0.3)",     // cyan
    "rgba(236, 72, 153, 0.25)",   // pink
  ],
  speed = 1,
}: MeshGradientProps) {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {/* Layer 1 */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 80% 50% at 10% 20%,
              ${colors[0]} 0%,
              transparent 50%
            ),
            radial-gradient(
              ellipse 60% 40% at 90% 80%,
              ${colors[1]} 0%,
              transparent 50%
            ),
            radial-gradient(
              ellipse 50% 60% at 50% 50%,
              ${colors[2]} 0%,
              transparent 50%
            )
          `,
          animation: `mesh-drift-1 ${10 / speed}s ease-in-out infinite alternate`,
        }}
      />

      {/* Layer 2 */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 70% 60% at 30% 80%,
              ${colors[3]} 0%,
              transparent 50%
            ),
            radial-gradient(
              ellipse 50% 70% at 70% 20%,
              ${colors[0]} 0%,
              transparent 50%
            )
          `,
          animation: `mesh-drift-2 ${12 / speed}s ease-in-out infinite alternate`,
        }}
      />

      {/* Layer 3 - subtle overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.05) 0%,
              transparent 50%,
              rgba(255, 255, 255, 0.03) 100%
            )
          `,
          animation: `mesh-shine ${8 / speed}s ease-in-out infinite`,
        }}
      />
    </div>
  );
}
