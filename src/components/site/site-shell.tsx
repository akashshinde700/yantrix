"use client";

import { useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { DoorIntro } from "@/components/site/door-intro";
import { CosmicPopup } from "@/components/site/cosmic-popup";
import { YantrixGuide } from "@/components/site/yantrix-guide";
import { ChapterDock } from "@/components/site/universe/chapter-dock";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { PageHome } from "@/components/site/page-home";
import { PageCourses } from "@/components/site/page-courses";
import { PageAbout } from "@/components/site/page-about";
import { PageContact } from "@/components/site/page-contact";
import { ScrollProgress, BackToTop } from "@/components/site/fx";
import { useSiteStore } from "@/lib/store";
import { useSiteContent } from "@/lib/content/provider";
import type { SiteView } from "@/lib/content/types";

/* The 3D universe is client-only and loads after first paint. */
const UniverseScene = dynamic(() => import("@/components/site/universe/universe-scene"), { ssr: false });

/**
 * Single-page shell hosting the four "pages" (Home / Courses / About / Contact)
 * plus optional detail pages (e.g. /courses/[slug]). Only the active page is
 * rendered, so every URL serves its own unique content to crawlers, while
 * navigation between pages stays instant on the client.
 */
const VIEW_PATHS: Record<SiteView, string> = {
  home: "/",
  courses: "/courses",
  about: "/about",
  contact: "/contact",
};

const VIEWS: Record<SiteView, () => ReactNode> = {
  home: () => <PageHome />,
  courses: () => <PageCourses />,
  about: () => <PageAbout />,
  contact: () => <PageContact />,
};

export function SiteShell({
  initialView = "home",
  detail,
}: {
  initialView?: SiteView;
  /** Server-rendered page body that replaces the view (course detail pages). */
  detail?: ReactNode;
}) {
  const view = useSiteStore((s) => s.view);
  const navId = useSiteStore((s) => s.navId);
  const [mounted, setMounted] = useState(false);
  const pendingSection = useSiteStore((s) => s.pendingSection);
  const clearPendingSection = useSiteStore((s) => s.clearPendingSection);
  const seoPages = useSiteContent().seo.pages;

  /* A detail page stays up until the visitor navigates anywhere. */
  const showDetail = Boolean(detail) && navId === 0;

  /* Keep the active view in sync with the URL the visitor landed on (without counting as a navigation). */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (useSiteStore.getState().view !== initialView) {
      useSiteStore.setState({ view: initialView });
    }
  }, [initialView]);

  /* Reflect client-side tab navigation in the address bar. */
  useEffect(() => {
    if (!mounted || showDetail) return;
    if (window.location.pathname !== VIEW_PATHS[view]) {
      window.history.pushState(null, "", VIEW_PATHS[view]);
    }
  }, [view, mounted, showDetail]);

  /* Browser back/forward between views */
  useEffect(() => {
    const onPop = () => {
      const match = (Object.keys(VIEW_PATHS) as SiteView[]).find((v) => VIEW_PATHS[v] === window.location.pathname);
      if (match) useSiteStore.getState().navigate(match);
      else window.location.reload();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* Update document title + meta description on view change */
  useEffect(() => {
    if (showDetail) return;
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
  }, [view, pendingSection, clearPendingSection, seoPages, showDetail]);

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
    <div className="universe flex min-h-screen flex-col bg-[#02040c] text-white">
      {/* CSS backdrop until (or instead of, without WebGL) the 3D universe */}
      <div aria-hidden="true" className="universe-backdrop pointer-events-none fixed inset-0 z-0" />
      <UniverseScene view={activeView} />
      <DoorIntro />
      <SmoothScroll />
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
        <AnimatePresence mode="wait">
          <motion.div
            key={showDetail ? "detail" : activeView}
            variants={pageVariants}
            // first paint is visible immediately (LCP / crawlers); later page switches animate
            initial={mounted ? "hidden" : false}
            animate="visible"
            exit="exit"
            transition={pageTransition}
            className="mx-auto min-w-full"
          >
            {showDetail ? detail : VIEWS[activeView]()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <WhatsAppFloat />
      <BackToTop />
      {activeView === "home" && !showDetail && <ChapterDock />}
      <YantrixGuide />
      <CosmicPopup />
    </div>
  );
}
