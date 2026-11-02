"use client";

import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLabels } from "@/lib/content/provider";
import { lockScroll, unlockScroll } from "@/components/site/scroll-lock";
import type { GalleryPhoto } from "@/lib/content/types";

/**
 * Full-screen photo viewer.
 *
 * Accessibility is the reason this is a component of its own: it traps focus
 * while open, restores focus to the thumbnail that opened it, supports
 * Escape / ← / → / Home / End, and locks the page (including Lenis) behind it.
 */
export function GalleryLightbox({
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  photos: GalleryPhoto[];
  /** `null` keeps the dialog closed. */
  index: number | null;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const t = useLabels();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const open = index !== null;

  const photo = open ? photos[index] : undefined;
  const total = photos.length;
  const step = useCallback(
    (delta: number) => {
      if (index === null || total === 0) return;
      onIndexChange((index + delta + total) % total);
    },
    [index, total, onIndexChange]
  );

  /* Remember the trigger, lock the page, focus the close button. */
  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;
    lockScroll();
    const frame = requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      unlockScroll();
      restoreTo.current?.focus?.();
    };
  }, [open]);

  /* Keyboard: close, navigate, and keep Tab inside the dialog. */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, step]);

  return (
    <AnimatePresence>
      {open && photo ? (
        <motion.div
          key="lightbox"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={photo.title || t("gallery.photoLabel")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
          onClick={onClose}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("gallery.close")}
            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-5 sm:top-5"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous photo"
                className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-5"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  step(1);
                }}
                aria-label="Next photo"
                className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-5"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          ) : null}

          <motion.figure
            key={photo.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex max-h-full w-full max-w-4xl flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={photo.image}
              alt={photo.alt || photo.title}
              className="max-h-[76svh] w-auto max-w-full rounded-2xl object-contain"
            />
            <figcaption className="mt-3 text-center text-sm font-semibold text-slate-200">
              {photo.title}
              {photo.category ? (
                <span className="ml-2 text-xs font-normal text-slate-400">· {photo.category}</span>
              ) : null}
              {total > 1 ? (
                <span className="ml-2 font-mono text-[11px] font-normal text-slate-500">
                  {(index ?? 0) + 1}/{total}
                </span>
              ) : null}
            </figcaption>
          </motion.figure>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
