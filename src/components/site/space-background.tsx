"use client";

import { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   SPACE BACKGROUND — Canvas-based deep-space starfield + nebula + aurora
   ═══════════════════════════════════════════════════════════════════════
   Renders:
     • 400–800 twinkling stars (variable size, brightness, warp drift)
     • Nebula cloud blobs (3 layers, slow drift, blur, radial gradients)
     *   aurora ribbons (colorful, undulating)
     • Occasional shooting stars (random intervals, long streaks)
     • Deep-space warp particles drifting outward
   All parameters are tuned for a premium, cinematic feel.
   ═══════════════════════════════════════════════════════════════════════ */

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  warpX: number;
  warpY: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  angle: number;
  speed: number;
  alpha: number;
  active: boolean;
}

export function SpaceBackground({
  className,
  intensity = 1,
  starCount = 0, // 0 → auto (device dependent)
  showShootingStars = true,
  showNebula = true,
  showAurora = true,
}: {
  className?: string;
  intensity?: number;
  starCount?: number;
  showShootingStars?: boolean;
  showNebula?: boolean;
  showAurora?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const shootingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const neonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const nebulaOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Compute star count inside useEffect to avoid SSR mismatch
    const isClient = typeof window !== "undefined";
    const effectiveStarCount = starCount || (isClient
      ? (window.devicePixelRatio! > 2 ? 800 : window.innerWidth! > 1280 ? 600 : 400)
      : 500);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: false });
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-seed stars for new dimensions
      const count = starCount || effectiveStarCount;
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.4 + Math.random() * 1.8,
        baseAlpha: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 0.5 + Math.random() * 2.5,
        twinklePhase: Math.random() * Math.PI * 2,
        warpX: (Math.random() - 0.5) * 0.0008,
        warpY: (Math.random() - 0.5) * 0.0006,
      }));
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / width, y: e.clientY / height };
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      mouseRef.current = { x: t.clientX / width, y: t.clientY / height };
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    resize();

    // Shooting star spawn helper
    const spawnShootingStar = () => {
      const ss: ShootingStar = {
        x: Math.random() * width * 1.2 - width * 0.1,
        y: Math.random() * height * 0.4,
        length: 80 + Math.random() * 160,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.4,
        speed: 4 + Math.random() * 4,
        alpha: 0,
        active: false,
      };
      shootingStarsRef.current.push(ss);
    };

    const scheduleShootingStar = () => {
      if (!showShootingStars) return;
      const delay = 2500 + Math.random() * 9000;
      shootingTimerRef.current = setTimeout(() => {
        spawnShootingStar();
        scheduleShootingStar();
      }, delay);
    };
    scheduleShootingStar();

    // Neon twinkle boost — randomly brighten a star cluster
    const scheduleNeonBoost = () => {
      neonTimerRef.current = setTimeout(() => {
        // Pick a random star and boost its alpha temporarily
        const stars = starsRef.current;
        if (stars.length === 0) return;
        const idx = Math.floor(Math.random() * stars.length);
        stars[idx].baseAlpha = Math.min(1, stars[idx].baseAlpha + 0.4);
        setTimeout(() => {
          stars[idx].baseAlpha = Math.max(0.3, stars[idx].baseAlpha - 0.4);
        }, 600);
        scheduleNeonBoost();
      }, 3000 + Math.random() * 7000);
    };
    scheduleNeonBoost();

    // ── Animation loop ──
    const animate = () => {
      timeRef.current += 0.004;
      const t = timeRef.current;
      const w = width;
      const h = height;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Nebula drift offsets
      if (showNebula) {
        nebulaOffsetRef.current = {
          x: Math.sin(t * 0.15) * 30 + Math.sin(t * 0.07) * 20,
          y: Math.cos(t * 0.12) * 25 + Math.cos(t * 0.05) * 15,
        };
      }

      // Clear with deep space gradient (performance: fillRect solid color + subtle gradient only when needed)
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, "#02050f");
      gradient.addColorStop(0.5, "#050a18");
      gradient.addColorStop(1, "#080c1c");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // ── Nebula clouds ──
      if (showNebula) {
        const no = nebulaOffsetRef.current;
        const nebulaColors = [
          { cx: 0.2, cy: 0.3, r: 0.5, color: "rgba(80, 40, 180, 0.09)", color2: "rgba(180, 80, 220, 0.05)" },
          { cx: 0.8, cy: 0.2, r: 0.6, color: "rgba(20, 100, 180, 0.08)", color2: "rgba(60, 180, 220, 0.04)" },
          { cx: 0.5, cy: 0.7, r: 0.55, color: "rgba(180, 60, 120, 0.07)", color2: "rgba(220, 120, 180, 0.04)" },
        ];
        for (const n of nebulaColors) {
          const cx = (n.cx + no.x / w * 0.1) * w;
          const cy = (n.cy + no.y / h * 0.1) * h;
          const r = n.r * Math.min(w, h) * 0.5;

          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          grad.addColorStop(0, n.color);
          grad.addColorStop(0.5, n.color2);
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
        }
      }

      // ── Aurora ribbons ──
      if (showAurora) {
        const auroraGrad = ctx.createLinearGradient(0, 0, w * 0.7, 0);
        auroraGrad.addColorStop(0, "rgba(30, 180, 200, 0.04)");
        auroraGrad.addColorStop(0.4, "rgba(100, 60, 220, 0.06)");
        auroraGrad.addColorStop(0.7, "rgba(60, 200, 160, 0.04)");
        auroraGrad.addColorStop(1, "transparent");
        ctx.fillStyle = auroraGrad;
        ctx.fillRect(0, 0, w, h);

        // Aurora ribbon curves
        ctx.beginPath();
        ctx.moveTo(0, h * 0.55);
        for (let x = 0; x <= w; x += 8) {
          const y =
            h * 0.55 +
            Math.sin(x * 0.004 + t * 0.8) * 40 +
            Math.sin(x * 0.01 + t * 0.4) * 25 +
            Math.cos(x * 0.006 + t * 0.6) * 15;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(80, 200, 220, 0.06)";
        ctx.lineWidth = 80;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, h * 0.65);
        for (let x = 0; x <= w; x += 8) {
          const y =
            h * 0.65 +
            Math.sin(x * 0.005 + t * 1.1 + 1) * 35 +
            Math.sin(x * 0.008 + t * 0.5) * 20;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(180, 100, 240, 0.05)";
        ctx.lineWidth = 70;
        ctx.stroke();
      }

      // ── Stars ──
      const stars = starsRef.current;
      const mouseInfluence = 0.15;
      for (const star of stars) {
        // Twinkle
        const twinkle = 0.5 + 0.5 * Math.sin(t * star.twinkleSpeed * 3 + star.twinklePhase);
        let alpha = star.baseAlpha * twinkle;

        // Warp drift
        star.x += star.warpX * w * intensity;
        star.y += star.warpY * h * intensity;
        if (star.x < -10) star.x = w + 10;
        if (star.x > w + 10) star.x = -10;
        if (star.y < -10) star.y = h + 10;
        if (star.y > h + 10) star.y = -10;

        // Mouse parallax – subtle glow toward cursor
        const dx = star.x / w - mx;
        const dy = star.y / h - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.25) {
          alpha += (1 - dist / 0.25) * 0.3 * intensity;
        }

        // Size pulse for larger stars
        const drawSize = star.size * (1 + 0.2 * Math.sin(t * 2 + star.twinklePhase));

        // Glow for bright stars
        if (drawSize > 1.2 && alpha > 0.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, drawSize * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180, 200, 255, ${alpha * 0.12})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, drawSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 235, 255, ${Math.min(1, alpha)})`;
        ctx.fill();
      }

      // ── Shooting stars ──
      const toRemove: number[] = [];
      for (let i = 0; i < shootingStarsRef.current.length; i++) {
        const ss = shootingStarsRef.current[i];
        if (!ss.active) {
          ss.alpha = 0.8 + Math.random() * 0.2;
          ss.active = true;
        }
        // Move
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.alpha *= 0.985;

        if (ss.alpha < 0.01 || ss.y > h + 20 || ss.x > w + 20 || ss.y < -20) {
          toRemove.push(i);
          continue;
        }

        // Streak
        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        // Glow
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ss.alpha * 0.3})`;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();

        // Core
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX + Math.cos(ss.angle) * ss.length * 0.15, tailY + Math.sin(ss.angle) * ss.length * 0.15);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ss.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      for (let i = toRemove.length - 1; i >= 0; i--) {
        shootingStarsRef.current.splice(toRemove[i], 1);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      if (shootingTimerRef.current) clearTimeout(shootingTimerRef.current);
      if (neonTimerRef.current) clearTimeout(neonTimerRef.current);
      cancelAnimationFrame(animationRef.current);
    };
  }, [starCount, showShootingStars, showNebula, showAurora, intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ position: "fixed", inset: 0, zIndex: 0, width: "100%", height: "100%" }}
    />
  );
}
