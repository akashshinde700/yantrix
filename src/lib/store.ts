"use client";

import { create } from "zustand";
import type { SiteView } from "@/lib/site-config";

interface SiteState {
  view: SiteView;
  /** Course title pre-selected on the contact form (via "Enquire Now") */
  preselectedCourse: string | null;
  /** Optional section id to scroll to after navigation (e.g. "faqs") */
  pendingSection: string | null;
  navigate: (view: SiteView, options?: { course?: string; section?: string }) => void;
  clearPendingSection: () => void;
  setPreselectedCourse: (course: string | null) => void;
}

export const useSiteStore = create<SiteState>((set) => ({
  view: "home",
  preselectedCourse: null,
  pendingSection: null,
  navigate: (view, options) =>
    set({
      view,
      preselectedCourse: options?.course ?? null,
      pendingSection: options?.section ?? null,
    }),
  clearPendingSection: () => set({ pendingSection: null }),
  setPreselectedCourse: (course) => set({ preselectedCourse: course }),
}));
