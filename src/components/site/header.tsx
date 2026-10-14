"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, GraduationCap, MonitorSmartphone, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { useSiteStore } from "@/lib/store";
import { siteConfig, whatsappUrl, type SiteView } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const navItems: { view: SiteView; label: string }[] = [
  { view: "home", label: "Home" },
  { view: "courses", label: "Courses" },
  { view: "about", label: "About Us" },
  { view: "contact", label: "Contact Us" },
];

export function Header() {
  const view = useSiteStore((s) => s.view);
  const navigate = useSiteStore((s) => s.navigate);
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (v: SiteView) => {
    setMobileOpen(false);
    navigate(v);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top utility bar */}
      <div className="hidden bg-brand-950 text-white md:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs sm:px-6">
          <p className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <MonitorSmartphone className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
            Online &amp; Offline Training Available
          </p>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-brand-100">
              <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
              Placement Assistance
            </span>
            <span className="flex items-center gap-1.5 text-brand-100">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              New Batches Enrolling — Enquire Now
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="border-b border-slate-200/80 bg-white/90 shadow-[0_1px_12px_rgba(15,31,78,0.04)] backdrop-blur-md">
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[72px]"
          aria-label="Main navigation"
        >
          <button
            onClick={() => go("home")}
            className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
            aria-label={`${siteConfig.name} — go to home page`}
          >
            <Logo />
          </button>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <li key={item.view}>
                <button
                  onClick={() => go(item.view)}
                  aria-current={view === item.view ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    view === item.view
                      ? "text-brand-700"
                      : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                  )}
                >
                  {item.label}
                  {view === item.view ? (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-4 -bottom-[3px] h-[3px] rounded-full bg-brand-600"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2.5">
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 transition-colors hover:bg-emerald-100 sm:flex"
              aria-label="Chat with us on WhatsApp"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <Button
              onClick={() => go("contact")}
              className="hidden h-10 rounded-full bg-brand-700 px-5 text-sm font-bold shadow-md shadow-brand-700/25 hover:bg-brand-800 sm:inline-flex"
            >
              Contact for Admission
            </Button>

            {/* Mobile hamburger */}
            <button
              className="flex h-11 w-11 items-center justify-center rounded-xl text-ink ring-1 ring-slate-200 transition-colors hover:bg-slate-50 lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              id="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-slate-100 bg-white lg:hidden"
            >
              <ul className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
                {navItems.map((item) => (
                  <li key={item.view}>
                    <button
                      onClick={() => go(item.view)}
                      aria-current={view === item.view ? "page" : undefined}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 text-left text-base font-semibold transition-colors",
                        view === item.view
                          ? "bg-brand-50 text-brand-700"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
                <li className="flex flex-col gap-2 pt-2">
                  <Button
                    onClick={() => go("contact")}
                    className="h-12 rounded-xl bg-brand-700 text-base font-bold hover:bg-brand-800"
                  >
                    Contact for Admission
                  </Button>
                  <a
                    href={whatsappUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-base font-bold text-white hover:bg-emerald-600"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    Chat on WhatsApp
                  </a>
                </li>
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
