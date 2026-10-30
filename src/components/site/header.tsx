"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, GraduationCap, MonitorSmartphone, Handshake, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { SoundButton } from "@/components/site/sound-button";
import { useSiteStore } from "@/lib/store";
import { useCollection, useSettings } from "@/lib/content/provider";
import { phoneHref, whatsappUrl } from "@/lib/content/helpers";
import type { NavLink, SiteView } from "@/lib/content/types";
import { cn } from "@/lib/utils";

export function Header() {
  const view = useSiteStore((s) => s.view);
  const navigate = useSiteStore((s) => s.navigate);
  const [mobileOpen, setMobileOpen] = useState(false);
  const settings = useSettings();
  const navItems = useCollection<NavLink>("navHeader");
  const waHref = whatsappUrl(settings);
  const telHref = phoneHref(settings);

  const go = (v: SiteView) => {
    setMobileOpen(false);
    navigate(v);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top utility bar */}
      <div className="hidden bg-gradient-to-r from-space via-brand-950 to-space text-white md:block">
        <div className="neon-line" aria-hidden="true" />
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs sm:px-6">
          <p className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <MonitorSmartphone className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
            {settings.topBar.badge}
          </p>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-brand-100">
              <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
              {settings.topBar.note}
            </span>
            <span className="hidden items-center gap-1.5 text-brand-100 lg:flex">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              {settings.topBar.extra}
            </span>
            <a
              href={telHref}
              className="group flex items-center gap-1.5 font-bold text-white transition-colors hover:text-cyber-200"
              aria-label={`Call us at ${settings.contact.phone}`}
            >
              <Phone className="h-3.5 w-3.5 text-cyber-300 transition-transform duration-300 group-hover:rotate-12" aria-hidden="true" />
              <span>{settings.contact.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="border-b border-slate-200/70 bg-white/85 shadow-[0_8px_32px_-12px_rgba(2,8,23,0.12)] backdrop-blur-xl">
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[72px]"
          aria-label="Main navigation"
        >
          <button
            onClick={() => go("home")}
            className="group rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
            aria-label={`${settings.name} — go to home page`}
          >
            <Logo height={48} className="max-sm:!h-10" />
          </button>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => go(item.view)}
                  aria-current={view === item.view ? "page" : undefined}
                  className={cn(
                    "nav-link relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
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
            <SoundButton className="h-10 w-10 ring-1 ring-white/10" />
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 transition-all hover:scale-110 hover:bg-emerald-100 sm:flex"
              aria-label="Chat with us on WhatsApp"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <Button
              onClick={() => go("contact")}
              className="btn-futur btn-shine hidden h-10 rounded-full px-5 text-sm font-bold text-white sm:inline-flex"
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
                  <li key={item.id}>
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
                    className="btn-futur h-12 rounded-xl text-base font-bold text-white"
                  >
                    Contact for Admission
                  </Button>
                  <a
                    href={waHref}
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
