import type { SiteView } from "@/lib/content/types";

/**
 * Home page chapters, in scroll order. Each one is a section id on the page
 * and a destination (planet / object) in the 3D universe.
 */
export const CHAPTERS = [
  { id: "home-hero", label: "Start" },
  { id: "chapter-skills", label: "Skills" },
  { id: "chapter-why", label: "Why Us" },
  { id: "chapter-modes", label: "Modes" },
  { id: "chapter-about", label: "About" },
  { id: "chapter-placement", label: "Placement" },
  { id: "chapter-faq", label: "FAQ" },
  { id: "chapter-cta", label: "Join" },
] as const;

/** Where the camera parks for the other pages. */
export const VIEW_CHAPTER: Record<SiteView, number> = {
  home: 0,
  courses: 2,
  about: 4,
  contact: 7,
};

/** Fired on window once the visitor has walked through the entrance door. */
export const ENTERED_EVENT = "yantrix:entered";
export const ENTERED_KEY = "yantrix_entered";
