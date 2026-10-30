"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   NUMBER TICKER — animated number counter triggered on scroll
   ═══════════════════════════════════════════════════════════════════════ */

interface NumberTickerProps {
  value: number;
  className?: string;
  delay?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  thousandSeparator?: boolean;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
}

export function NumberTicker({
  value,
  className,
  delay = 0,
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
  thousandSeparator = true,
  color = "text-white",
  fontSize = "text-4xl",
  fontWeight = "font-extrabold",
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  // Format number with thousand separators
  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    if (thousandSeparator) {
      return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return fixed;
  };

  // Animate from 0 to value
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (!inView) return;

    let startTime: number | null = null;
    const startValue = 0;
    const endValue = value;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, value, duration]);

  return (
    <motion.span
      ref={ref}
      className={`${color} ${fontSize} ${fontWeight} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
    >
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </motion.span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   COUNTER STATS — stats section with multiple animated counters
   ═══════════════════════════════════════════════════════════════════════ */

interface CounterStatsProps {
  stats: Array<{ value: number; label: string; prefix?: string; suffix?: string }>;
  className?: string;
}

export function CounterStats({ stats, className }: CounterStatsProps) {
  return (
    <div className={className}>
      <div className="grid gap-8 md:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
          >
            <NumberTicker
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              delay={index * 0.15}
              className="text-4xl font-extrabold text-white"
            />
            <p className="mt-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
