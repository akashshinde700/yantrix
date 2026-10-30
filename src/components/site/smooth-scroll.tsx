"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { ENTERED_EVENT } from "@/components/site/universe/chapters";

/**
 * Inertial smooth scrolling (Lenis) for the public site — wheel/trackpad
 * scrolling glides instead of jumping, which keeps the 3D camera flight and
 * reveal animations fluid. Touch scrolling stays native. Off for
 * prefers-reduced-motion. Paused while the entrance door is closed.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      wheelMultiplier: 1,
      anchors: { offset: -80 },
      stopInertiaOnNavigate: true,
      // panels with their own scroll (assistant, popup, menus) scroll natively
      prevent: (node) => node.closest?.("[data-lenis-prevent], [role='dialog'], [data-radix-popper-content-wrapper]") != null,
    });

    const html = document.documentElement;
    if (!html.hasAttribute("data-entered")) lenis.stop();
    const onEntered = () => lenis.start();
    window.addEventListener(ENTERED_EVENT, onEntered);

    return () => {
      window.removeEventListener(ENTERED_EVENT, onEntered);
      lenis.destroy();
    };
  }, []);

  return null;
}
