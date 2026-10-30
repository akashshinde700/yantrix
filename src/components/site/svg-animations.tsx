"use client";

/* ═══════════════════════════════════════════════════════════════════════
   SVG ANIMATIONS — Premium lightweight SVG animations
   ═══════════════════════════════════════════════════════════════════════
   Includes:
   • Animated orbit rings with particles
   • Morphing SVG shapes
   • Animated path drawing
   • Rotating geometric patterns
   • Interactive SVG elements
   ═══════════════════════════════════════════════════════════════════════ */

import { motion } from "framer-motion";
import { useState } from "react";

/* ────────────────────────────────────────────────────────────────────
   ANIMATED ORBIT SYSTEM — 3D-looking orbit rings with planets
   ──────────────────────────────────────────────────────────────────── */

interface AnimatedOrbitProps {
  className?: string;
  planetCount?: number;
  orbitCount?: number;
  size?: number;
  color?: string;
  speed?: number;
}

export function AnimatedOrbit({
  className,
  planetCount = 3,
  orbitCount = 2,
  size = 200,
  color = "#22d3ee",
  speed = 1,
}: AnimatedOrbitProps) {
  const planets = Array.from({ length: planetCount }, (_, i) => ({
    id: i,
    orbit: i % orbitCount,
    angle: (i / planetCount) * Math.PI * 2,
    speed: 0.5 + Math.random() * 0.5,
    size: 4 + Math.random() * 6,
    delay: i * 0.2,
  }));

  const orbits = Array.from({ length: orbitCount }, (_, i) => ({
    id: i,
    radius: 60 + i * 40,
    speed: 3 + i * 0.5,
    delay: i * 0.5,
  }));

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: "relative",
        transform: "rotateX(60deg)",
      }}
      aria-hidden="true"
    >
      {/* Orbit rings */}
      {orbits.map((orbit) => (
        <div
          key={orbit.id}
          className="absolute inset-0 rounded-full border-2 border-dashed"
          style={{
            width: orbit.radius * 2,
            height: orbit.radius * 2,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            borderColor: "rgba(34, 211, 238, 0.2)",
            borderRadius: "50%",
            animation: `orbit-spin ${orbit.speed / speed}s linear infinite`,
            animationDelay: `${orbit.delay}s`,
          }}
        />
      ))}

      {/* Planets */}
      {planets.map((planet) => {
        const x = Math.cos(planet.angle) * (40 + planet.orbit * 40);
        const y = Math.sin(planet.angle) * (40 + planet.orbit * 40);

        return (
          <motion.div
            key={planet.id}
            className="absolute rounded-full"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              width: planet.size,
              height: planet.size,
              background: `radial-gradient(circle, ${color} 0%, ${color}88 100%)`,
              boxShadow: `0 0 ${planet.size * 2}px ${color}`,
              willChange: "transform",
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 10 / speed,
              repeat: Infinity,
              ease: "linear",
              delay: planet.delay,
            }}
          >
            {/* Planet glow */}
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
                filter: "blur(2px)",
              }}
            />
          </motion.div>
        );
      })}

      {/* Center glow */}
      <div
        className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          filter: "blur(20px)",
          opacity: 0.6,
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, #fff 0%, ${color} 50%, transparent 70%)`,
        }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   SVG PATH DRAWING — animated SVG path drawing effect
   ──────────────────────────────────────────────────────────────────── */

interface SvgPathDrawingProps {
  className?: string;
  path?: string;
  color?: string;
  duration?: number;
  strokeWidth?: number;
  repeat?: boolean;
}

export function SvgPathDrawing({
  className,
  path = "M 10 100 Q 50 10 90 100 Q 130 190 170 100",
  color = "#22d3ee",
  duration = 2,
  strokeWidth = 2,
  repeat = true,
}: SvgPathDrawingProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      style={{ width: "100%", height: "auto" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
        <filter id="path-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background path (always visible) */}
      <path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={0.2}
        strokeDasharray="4 4"
      />

      {/* Animated drawing path */}
      <motion.path
        d={path}
        stroke="url(#path-gradient)"
        strokeWidth={strokeWidth + 1}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration,
          repeat: repeat ? Infinity : 0,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        filter="url(#path-glow)"
      />

      {/* Animated dots along path */}
      <motion.circle
        r="3"
        fill={color}
        filter="url(#path-glow)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration,
          repeat: repeat ? Infinity : 0,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <animateMotion
          dur={`${duration}s`}
          repeatCount={repeat ? "indefinite" : "1"}
          path={path}
        />
      </motion.circle>

      <motion.circle
        r="1.5"
        fill="#ffffff"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration,
          repeat: repeat ? Infinity : 0,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <animateMotion
          dur={`${duration}s`}
          begin={`${duration / 2}s`}
          repeatCount={repeat ? "indefinite" : "1"}
          path={path}
        />
      </motion.circle>
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────
   SVG MORPHING SHAPE — shape morphing animation
   ──────────────────────────────────────────────────────────────────── */

interface SvgMorphingShapeProps {
  className?: string;
  color?: string;
  size?: number;
  duration?: number;
}

export function SvgMorphingShape({
  className,
  color = "#22d3ee",
  size = 200,
  duration = 4,
}: SvgMorphingShapeProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id="morph-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </linearGradient>
          <filter id="morph-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Morphing shapes */}
        <motion.path
          d="M 100 10 L 190 100 L 100 190 L 10 100 Z"
          stroke="url(#morph-gradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{
            d: [
              "M 100 10 L 190 100 L 100 190 L 10 100 Z", // Diamond
              "M 10 100 Q 100 10 190 100 Q 100 190 10 100 Z", // Curved diamond
              "M 50 100 A 50 50 0 1 1 150 100 A 50 50 0 1 1 50 100 Z", // Circle
              "M 100 20 L 180 100 L 100 180 L 20 100 Z", // Smaller diamond
              "M 100 10 L 190 100 L 100 190 L 10 100 Z", // Back to diamond
            ],
            pathLength: [0, 1, 1, 1, 0],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          filter="url(#morph-glow)"
        />

        {/* Inner shape */}
        <motion.circle
          cx="100"
          cy="100"
          r="20"
          fill={color}
          opacity={0.3}
          initial={{ scale: 0 }}
          animate={{
            scale: [0, 1, 1.2, 1, 0],
            opacity: [0, 0.3, 0.5, 0.3, 0],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   SVG PARTICLE BURST — particle explosion effect
   ──────────────────────────────────────────────────────────────────── */

interface SvgParticleBurstProps {
  className?: string;
  color?: string;
  count?: number;
  triggerOnMount?: boolean;
}

export function SvgParticleBurst({
  className,
  color = "#22d3ee",
  count = 20,
  triggerOnMount = true,
}: SvgParticleBurstProps) {
  const [visible, setVisible] = useState(triggerOnMount);

  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * Math.PI * 2,
    distance: 50 + Math.random() * 80,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 0.3,
  }));

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <radialGradient id="burst-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <filter id="burst-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Center glow */}
        <motion.circle
          cx="100"
          cy="100"
          r="10"
          fill={color}
          opacity={visible ? 0.5 : 0}
          animate={{ r: [5, 20, 5], opacity: [0.8, 0.2, 0.8] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Particles */}
        {particles.map((p) => (
          <motion.circle
            key={p.id}
            cx="100"
            cy="100"
            r={p.size}
            fill={color}
            opacity={0.8}
            filter="url(#burst-glow)"
            initial={{
              cx: 100,
              cy: 100,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              cx: 100 + Math.cos(p.angle) * p.distance,
              cy: 100 + Math.sin(p.angle) * p.distance,
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: p.delay,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeOut",
            }}
          />
        ))}
      </svg>

      {/* Click to trigger */}
      {!triggerOnMount && (
        <button
          onClick={() => setVisible(!visible)}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-transparent text-white/50 hover:text-white transition-colors"
          aria-label="Toggle animation"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   SVG GEOMETRIC PATTERN — rotating geometric pattern
   ──────────────────────────────────────────────────────────────────── */

interface SvgGeometricPatternProps {
  className?: string;
  color?: string;
  size?: number;
  speed?: number;
}

export function SvgGeometricPattern({
  className,
  color = "#22d3ee",
  size = 300,
  speed = 1,
}: SvgGeometricPatternProps) {
  const shapes = [
    { cx: 100, cy: 100, r: 80, type: "circle" },
    { cx: 100, cy: 100, r: 50, type: "circle" },
    { cx: 100, cy: 100, r: 20, type: "circle" },
    { x1: 100, y1: 10, x2: 100, y2: 190, type: "line" },
    { x1: 10, y1: 100, x2: 190, y2: 100, type: "line" },
    { x1: 40, y1: 40, x2: 160, y2: 160, type: "line" },
    { x1: 160, y1: 40, x2: 40, y2: 160, type: "line" },
  ];

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id="geom-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
          <filter id="geom-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer rotating ring */}
        <motion.g
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8 / speed, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 100px" }}
        >
          <circle cx="100" cy="100" r="80" stroke={color} strokeWidth="0.5" opacity={0.3} />
          <circle cx="100" cy="100" r="75" stroke={color} strokeWidth="0.3" strokeDasharray="4 8" opacity={0.2} />
        </motion.g>

        {/* Inner rotating ring (reverse) */}
        <motion.g
          initial={{ rotate: 360 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 6 / speed, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 100px" }}
        >
          <circle cx="100" cy="100" r="50" stroke={color} strokeWidth="0.5" opacity={0.4} />
          <circle cx="100" cy="100" r="45" stroke={color} strokeWidth="0.3" strokeDasharray="2 6" opacity={0.3} />
        </motion.g>

        {/* Cross lines */}
        <motion.g
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10 / speed, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 100px" }}
        >
          <line x1="100" y1="10" x2="100" y2="190" stroke={color} strokeWidth="1" opacity={0.5} />
          <line x1="10" y1="100" x2="190" y2="100" stroke={color} strokeWidth="1" opacity={0.5} />
        </motion.g>

        {/* Diagonal lines (reverse) */}
        <motion.g
          initial={{ rotate: 360 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 12 / speed, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 100px" }}
        >
          <line x1="40" y1="40" x2="160" y2="160" stroke={color} strokeWidth="0.8" opacity={0.3} />
          <line x1="160" y1="40" x2="40" y2="160" stroke={color} strokeWidth="0.8" opacity={0.3} />
        </motion.g>

        {/* Center glow */}
        <circle cx="100" cy="100" r="20" fill={color} opacity={0.2} filter="url(#geom-glow)" />
        <circle cx="100" cy="100" r="8" fill="#ffffff" opacity={0.6} />
        <circle cx="100" cy="100" r="3" fill="#ffffff" />

        {/* Orbiting dots */}
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <motion.circle
            key={i}
            cx={100 + Math.cos((angle * Math.PI) / 180) * 60}
            cy={100 + Math.sin((angle * Math.PI) / 180) * 60}
            r="3"
            fill={color}
            filter="url(#geom-glow)"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{
              duration: 2 / speed,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   ANIMATED LOGO SVG — animated logo/icon
   ──────────────────────────────────────────────────────────────────── */

interface AnimatedLogoSvgProps {
  className?: string;
  color?: string;
  size?: number;
  logoType?: "globe" | "hexagon" | "orbit" | "custom";
}

export function AnimatedLogoSvg({
  className,
  color = "#22d3ee",
  size = 64,
  logoType = "globe",
}: AnimatedLogoSvgProps) {
  const logos: Record<string, React.ReactNode> = {
    globe: (
      <svg viewBox="0 0 100 100" fill="none" className={className} style={{ width: size, height: size }}>
        <defs>
          <linearGradient id="logo-globe-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Outer ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          stroke={color}
          strokeWidth="1.5"
          opacity={0.3}
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="35"
          stroke={color}
          strokeWidth="1"
          opacity={0.5}
          strokeDasharray="4 6"
          initial={{ rotate: 360 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Globe lines */}
        <motion.path
          d="M 50 5 L 50 95"
          stroke={color}
          strokeWidth="0.8"
          opacity={0.4}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M 5 50 L 95 50"
          stroke={color}
          strokeWidth="0.8"
          opacity={0.4}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Ellipse lines (longitude) */}
        <motion.ellipse
          cx="50"
          cy="50"
          rx="45"
          ry="15"
          stroke={color}
          strokeWidth="0.5"
          opacity={0.3}
          initial={{ rotate: -20 }}
          animate={{ rotate: 20 }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.ellipse
          cx="50"
          cy="50"
          rx="45"
          ry="15"
          stroke={color}
          strokeWidth="0.5"
          opacity={0.3}
          initial={{ rotate: 20 }}
          animate={{ rotate: -20 }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Center dot */}
        <circle cx="50" cy="50" r="5" fill={color} />
        <circle cx="50" cy="50" r="2" fill="#ffffff" />
      </svg>
    ),
    hexagon: (
      <svg viewBox="0 0 100 100" fill="none" className={className} style={{ width: size, height: size }}>
        <defs>
          <linearGradient id="logo-hex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Hexagon outline */}
        <motion.path
          d="M 50 5 L 93.3 25 L 93.3 75 L 50 95 L 6.7 75 L 6.7 25 Z"
          stroke={color}
          strokeWidth="2"
          opacity={0.4}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />

        {/* Inner hexagon */}
        <motion.path
          d="M 50 20 L 78 37.5 L 78 62.5 L 50 80 L 22 62.5 L 22 37.5 Z"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity={0.5}
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner elements */}
        <circle cx="50" cy="50" r="8" stroke={color} strokeWidth="1" opacity={0.6} />
        <circle cx="50" cy="50" r="3" fill={color} />

        {/* Corner dots */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <motion.circle
            key={i}
            cx={50 + Math.cos((angle * Math.PI) / 180) * 42}
            cy={50 + Math.sin((angle * Math.PI) / 180) * 42}
            r="2.5"
            fill={color}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </svg>
    ),
    orbit: (
      <svg viewBox="0 0 100 100" fill="none" className={className} style={{ width: size, height: size }}>
        <defs>
          <linearGradient id="logo-orbit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Outer orbit */}
        <motion.ellipse
          cx="50"
          cy="50"
          rx="45"
          ry="20"
          stroke={color}
          strokeWidth="1"
          opacity={0.3}
          strokeDasharray="4 6"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner orbit (reverse) */}
        <motion.ellipse
          cx="50"
          cy="50"
          rx="35"
          ry="15"
          stroke={color}
          strokeWidth="0.8"
          opacity={0.4}
          strokeDasharray="2 4"
          initial={{ rotate: 360 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        {/* Orbiting dot 1 */}
        <motion.circle
          cx="95"
          cy="50"
          r="4"
          fill={color}
          filter="url(#logo-orbit-gradient)"
          initial={{ opacity: 0 }}
          animate={{
            cx: [95, 5, 95],
            cy: [50, 50, 50],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Orbiting dot 2 */}
        <motion.circle
          cx="15"
          cy="50"
          r="3"
          fill="#ffffff"
          initial={{ opacity: 0 }}
          animate={{
            cx: [15, 85, 15],
            cy: [50, 50, 50],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
            delay: 0.5,
          }}
        />

        {/* Center */}
        <circle cx="50" cy="50" r="6" stroke={color} strokeWidth="1" opacity={0.6} />
      </svg>
    ),
  };

  return logos[logoType] || logos["globe"];
}
