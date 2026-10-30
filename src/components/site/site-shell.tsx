"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { PageHome } from "@/components/site/page-home";
import { PageCourses } from "@/components/site/page-courses";
import { PageAbout } from "@/components/site/page-about";
import { PageContact } from "@/components/site/page-contact";
import { ScrollProgress, BackToTop } from "@/components/site/fx";
import { useSiteStore } from "@/lib/store";
import { useSiteContent } from "@/lib/content/provider";
import type { SiteView } from "@/lib/content/types";

/**
 * Single-page shell hosting all four "pages" (Home / Courses / About / Contact).
 * Views are server-rendered together and toggled via the `hidden` attribute so
 * every page's content stays crawlable, while navigation is instant.
 */
const VIEW_PATHS: Record<SiteView, string> = {
  home: "/",
  courses: "/courses",
  about: "/about",
  contact: "/contact",
};

export function SiteShell({ initialView = "home" }: { initialView?: SiteView }) {
  const view = useSiteStore((s) => s.view);
  const navigate = useSiteStore((s) => s.navigate);
  const [mounted, setMounted] = useState(false);
  const pendingSection = useSiteStore((s) => s.pendingSection);
  const clearPendingSection = useSiteStore((s) => s.clearPendingSection);
  const seoPages = useSiteContent().seo.pages;

  /* Keep the active view in sync with the URL the visitor landed on. */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (useSiteStore.getState().view !== initialView) {
      navigate(initialView);
    }
  }, [initialView, navigate]);

  /* Reflect client-side tab navigation in the address bar. */
  useEffect(() => {
    if (!mounted) return;
    if (window.location.pathname !== VIEW_PATHS[view]) {
      window.history.replaceState(null, "", VIEW_PATHS[view]);
    }
  }, [view, mounted]);

  /* Update document title + meta description on view change */
  useEffect(() => {
    const seo = seoPages[view];
    document.title = seo.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", seo.description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", seo.title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", seo.description);

    if (pendingSection) {
      // Wait a tick for the view to become visible, then scroll to the section
      requestAnimationFrame(() => {
        document
          .getElementById(pendingSection)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      clearPendingSection();
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [view, pendingSection, clearPendingSection, seoPages]);

  /* Before hydration, trust the server-rendered view so crawlers see the right page. */
  const activeView = mounted ? view : initialView;

  // Page transition variants (door/cinematic effect)
  const pageVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.98 },
  };

  const pageTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 1,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <ScrollProgress />
      <Header />

      <main id="main-content" className="flex-1 relative z-10">
        {/* ═══════════════════════════════════════════════════════════════
           PAGE TRANSITION — animated view switching with door effect
           ═══════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait" custom={view}>
          <motion.div
            key={view}
            custom={view}
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={pageTransition}
            className="mx-auto min-w-full"
          >
            <div
              className="view-panel"
              hidden={activeView !== "home"}
            >
              <PageHome />
            </div>
            <div
              className="view-panel"
              hidden={activeView !== "courses"}
            >
              <PageCourses />
            </div>
            <div
              className="view-panel"
              hidden={activeView !== "about"}
            >
              <PageAbout />
            </div>
            <div
              className="view-panel"
              hidden={activeView !== "contact"}
            >
              <PageContact />
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <WhatsAppFloat />
      <BackToTop />
    </div>
  );
}
