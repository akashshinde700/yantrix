"use client";

import { GraduationCap, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { useSiteStore } from "@/lib/store";
import { siteConfig, whatsappUrl, phoneHref, emailHref, type SiteView } from "@/lib/site-config";
import { courses } from "@/lib/data";

const quickLinks: { view: SiteView; label: string }[] = [
  { view: "home", label: "Home" },
  { view: "courses", label: "Courses" },
  { view: "about", label: "About Us" },
  { view: "contact", label: "Contact Us" },
];

export function Footer() {
  const navigate = useSiteStore((s) => s.navigate);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-space text-slate-300">
      {/* Top neon edge */}
      <div className="neon-line" aria-hidden="true" />

      {/* Top strip */}
      <div className="border-b border-white/10 bg-gradient-to-r from-space-2 via-brand-950/60 to-space-2">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:px-6 md:flex-row md:text-left">
          <div>
            <h2 className="text-xl font-extrabold text-white sm:text-2xl">
              Ready to build your IT career?
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Talk to us about the right course for your goals — online or offline.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate("courses")}
              className="h-11 rounded-full bg-white px-6 text-sm font-bold text-brand-900 transition-all hover:-translate-y-0.5 hover:bg-cyber-200"
            >
              Explore Courses
            </button>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center gap-2 rounded-full bg-emerald-500 px-6 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-[0_0_26px_-6px_rgba(16,185,129,0.7)]"
            >
              <WhatsAppIcon className="h-4.5 w-4.5" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:py-16">
        {/* Brand */}
        <div className="space-y-4">
          <Logo variant="dark" />
          <p className="text-sm leading-relaxed text-slate-400">{siteConfig.positioning}</p>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-brand-200 ring-1 ring-white/10">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
            IT Training Institute · Since {siteConfig.foundedYear}
          </span>
        </div>

        {/* Quick links */}
        <nav aria-label="Footer navigation">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2.5">
            {quickLinks.map((link) => (
              <li key={link.view}>
                <button
                  onClick={() => navigate(link.view)}
                  className="group flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                >
                  <span
                    aria-hidden="true"
                    className="h-px w-0 bg-brand-300 transition-all duration-300 group-hover:w-4"
                  />
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Popular courses */}
        <nav aria-label="Popular courses">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Popular Courses</h3>
          <ul className="mt-4 space-y-2.5">
            {courses.slice(0, 5).map((course) => (
              <li key={course.slug}>
                <button
                  onClick={() => navigate("courses", { section: "course-grid" })}
                  className="group flex items-center gap-2 text-left text-sm text-slate-400 transition-colors hover:text-white"
                >
                  <span
                    aria-hidden="true"
                    className="h-px w-0 bg-brand-300 transition-all duration-300 group-hover:w-4"
                  />
                  {course.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
              <a
                href={phoneHref}
                className="text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {siteConfig.contact.phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
              <a
                href={emailHref}
                className="break-words text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {siteConfig.contact.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
              <span className="text-slate-400">{siteConfig.contact.address}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
              <span className="text-slate-400">{siteConfig.contact.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="neon-line" aria-hidden="true" />
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-slate-500 sm:px-6 md:flex-row">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>Placement assistance is provided — not a guarantee of employment.</p>
        </div>
      </div>
    </footer>
  );
}
