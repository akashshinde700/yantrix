"use client";

/**
 * Page scroll locking that works with Lenis.
 *
 * `document.body.style.overflow = "hidden"` alone does not stop Lenis: it
 * drives `window.scrollTo` from its own rAF loop, so a wheel over the overlay
 * still moved the page behind it. Both paths are stopped here, and the lock
 * is reference counted so nested overlays (lightbox inside a page, guide
 * panel) cannot unlock each other.
 */

type LenisLike = {
  stop: () => void;
  start: () => void;
  scrollTo: (target: number | HTMLElement | string, options?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    __yantrixLenis?: LenisLike;
  }
}

let locks = 0;
let stoppedLenis = false;
let previousOverflow: string | null = null;

export function lockScroll() {
  locks += 1;
  if (locks > 1) return;

  const lenis = typeof window === "undefined" ? undefined : window.__yantrixLenis;
  if (lenis && !stoppedLenis) {
    lenis.stop();
    stoppedLenis = true;
  }
  if (typeof document !== "undefined") {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.setAttribute("data-scroll-locked", "");
  }
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;

  const lenis = typeof window === "undefined" ? undefined : window.__yantrixLenis;
  // The entrance door also parks Lenis; only restart it if the visitor is in.
  if (lenis && stoppedLenis && document.documentElement.hasAttribute("data-entered")) {
    lenis.start();
  }
  stoppedLenis = false;

  if (typeof document !== "undefined") {
    document.body.style.overflow = previousOverflow ?? "";
    previousOverflow = null;
    document.documentElement.removeAttribute("data-scroll-locked");
  }
}

/* ── programmatic scrolling ────────────────────────────────────────────────
   Lenis owns the scroll position, so a plain `window.scrollTo` is undone on
   its next frame and `scrollIntoView` fights the easing. These helpers drive
   Lenis when it is running and fall back to the native API otherwise.
   ------------------------------------------------------------------------ */

export function scrollToTop(behavior: "smooth" | "instant" = "smooth") {
  const lenis = typeof window === "undefined" ? undefined : window.__yantrixLenis;
  if (lenis) {
    lenis.scrollTo(0, { immediate: behavior === "instant" });
    return;
  }
  window.scrollTo({ top: 0, behavior: behavior === "instant" ? "auto" : "smooth" });
}

/** Scrolls to an element id, leaving room for the sticky header. */
export function scrollToId(id: string, offset = -88) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = window.__yantrixLenis;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 0.9 });
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: "smooth" });
}
