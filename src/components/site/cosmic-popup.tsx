"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X, Star, Zap, Users, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/content/provider";
import { whatsappUrl } from "@/lib/content/helpers";
import { ENTERED_EVENT } from "@/components/site/universe/chapters";

/* ═══════════════════════════════════════════════════════════════════════
   COSMIC POPUP — animated modal that appears when user visits the site.
   Similar to skillected.com popup but with immersive space animations.
   ═══════════════════════════════════════════════════════════════════════
   Features:
   • Opens shortly after the visitor comes through the entrance door
   • Star field burst on open
   • Nebula glow behind modal
   • Sliding glass-morphism panel
   • Animated close with star particles
   • Auto-close after 30 seconds or on interaction
   • Shows on every new visit; closing hides it for the rest of that visit (sessionStorage)
   ═══════════════════════════════════════════════════════════════════════ */

const POPUP_DELAY = 1600; // Show popup this long after the door opens
const AUTO_CLOSE_DELAY = 25000; // Auto-close after 25 seconds
const STORAGE_KEY = "yantrix_cosmic_popup_dismissed";

const slideVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    pointerEvents: "none",
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    pointerEvents: "auto",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }, // spring-like
  },
  exit: {
    opacity: 0,
    x: 80,
    scale: 0.92,
    transition: { duration: 0.4, ease: "easeIn" },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

type Star = { x: number; y: number; size: number; delay: number };

/** Star burst for the open animation — regenerated inside the `isOpen` event handlers. */
function makeStarBurst(): Star[] {
  return Array.from({ length: 30 }, () => ({
    x: 30 + Math.random() * 40, // centre of the screen, roughly
    y: 30 + Math.random() * 40,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 0.3,
  }));
}

/** Closed already in this visit? Safe during SSR (no `sessionStorage` on the server). */
function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function CosmicPopup() {
  const router = useRouter();
  const settings = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  // Read the session flag while initialising state instead of in an effect, so the
  // popup never renders once just to be dismissed (set-state-in-effect).
  const [dismissed, setDismissed] = useState(readDismissed);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [starBurst, setStarBurst] = useState<Star[]>([]);

  const closePopup = () => {
    setIsOpen(false);
    setStarBurst([]);
  };

  // Open popup a moment after the visitor has come through the entrance door
  useEffect(() => {
    if (dismissed) return;
    const show = () => {
      setStarBurst(makeStarBurst());
      setIsOpen(true);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = setTimeout(() => setIsOpen(false), AUTO_CLOSE_DELAY);
    };
    const schedule = () => {
      timerRef.current = setTimeout(show, POPUP_DELAY);
    };
    if (document.documentElement.hasAttribute("data-entered")) schedule();
    else window.addEventListener(ENTERED_EVENT, schedule, { once: true });

    return () => {
      window.removeEventListener(ENTERED_EVENT, schedule);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, [dismissed]);

  // Handle dismiss (not again during this visit)
  const handleDismiss = () => {
    closePopup();
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* private mode — the popup simply greets the next page load too */
    }
    setDismissed(true);
  };

  const waHref = whatsappUrl(settings);

  // Esc closes the popup
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setIsOpen(false);
      setStarBurst([]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Welcome to ${settings.name}`}
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center bg-space/80 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={closePopup}
        >
          {/* ═══════════════════════════════════════════════════════
             Star burst effect on open
             ═══════════════════════════════════════════════════════ */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {starBurst.map((star, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: star.size,
                  height: star.size,
                  boxShadow: "0 0 8px 2px rgba(255,255,255,0.8)",
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 200],
                  y: [0, (Math.random() - 0.5) * 200],
                  opacity: [1, 0],
                  scale: [1, 0.2],
                }}
                transition={{
                  duration: 1.5,
                  delay: star.delay,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* Nebula glow behind modal */}
            <div
              className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/20 blur-[120px]"
              style={{ opacity: 0.6 }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/15 blur-[80px]"
              style={{ opacity: 0.4 }}
            />
          </div>

          {/* ═══════════════════════════════════════════════════════
             Modal panel with cosmic glassmorphism
             ═══════════════════════════════════════════════════════ */}
          <motion.div
            className="relative w-full max-w-lg transform-gpu"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative cosmic elements */}
            <div className="pointer-events-none absolute -top-20 left-10 h-20 w-20 rounded-full bg-purple-500/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 right-10 h-20 w-20 rounded-full bg-cyan-500/20 blur-2xl" />

            {/* Orbit ring decoration */}
            <div className="pointer-events-none absolute -right-16 top-1/2 h-24 w-24 -translate-y-1/2 rotate-45">
              <div
                className="h-full w-0 border-t-2 border-dashed border-cyber-400/40"
                style={{ transform: "rotate(45deg)" }}
              />
            </div>

            {/* Header with cosmic icon */}
            <div className="flex items-start justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/[0.07] to-white/5 p-6 pb-5 backdrop-blur-xl shadow-2xl shadow-purple-900/30">
              {/* Icon + title */}
              <div className="flex items-start gap-4">
                <motion.div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#060a1c] p-2 shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "backOut" }}
                >
                  <img src="/brand/yantrix-icon.svg" alt="" width={40} height={40} className="h-full w-full" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">
                    Welcome to {settings.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">
                    {settings.positioning || "Your journey to the cosmos of knowledge starts here."}
                  </p>
                </div>
              </div>

              {/* Close button with hover animation */}
              <motion.button
                onClick={handleDismiss}
                aria-label="Close welcome message"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-slate-400 transition-all hover:bg-white/20 hover:text-white hover:scale-110"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Content with staggered reveal */}
            <div className="mt-5 space-y-4 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent p-6">
              {/* Option cards */}
              <div className="grid gap-3">
                {[
                  { icon: Zap, title: "Fast Track Courses", desc: "Learn at your own pace with expert mentors", delay: 0 },
                  { icon: Users, title: "Expert Mentorship", desc: "One-on-one guidance from industry pros", delay: 0.1 },
                  { icon: GraduationCap, title: "Career Support", desc: "Placement assistance & career guidance", delay: 0.2 },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    className="flex items-start gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/5 transition-all hover:bg-white/10 hover:ring-white/20 pointer-events-none"
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 + item.delay, ease: "easeOut" }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/20 text-brand-300 ring-1 ring-brand-400/30">
                      <item.icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
                >
                  <Button
                    onClick={() => window.open(waHref, "_blank")}
                    className="btn-futur btn-shine h-12 w-full rounded-xl text-base font-bold text-white"
                  >
                    <span className="mr-2 flex h-5 w-5 items-center justify-center">
                      <Zap className="h-4 w-4" />
                    </span>
                    Talk to Us on WhatsApp
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7, ease: "easeOut" }}
                >
                  <Button
                    onClick={() => {
                      closePopup();
                      router.push("/courses");
                    }}
                    variant="outline"
                    className="h-11 w-full rounded-xl border-white/20 bg-white/5 px-6 text-base font-semibold text-white transition-all hover:bg-white/10 hover:border-white/40"
                  >
                    Explore Courses
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Footer dismiss hint */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Star className="h-3 w-3 fill-cyan-400 text-cyan-400/60" />
              <span>You can dismiss anytime</span>
              <Star className="h-3 w-3 fill-cyan-400 text-cyan-400/60" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
