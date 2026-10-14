"use client";

import { GraduationCap, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { useSiteStore } from "@/lib/store";
import { siteConfig, whatsappUrl, type SiteView } from "@/lib/site-config";
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
    <footer className="mt-auto bg-brand-950 text-slate-300">
      {/* Top strip */}
      <div className="border-b border-white/10 bg-gradient-to-r from-brand-900 via-brand-950 to-brand-900">
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
              className="h-11 rounded-full bg-white px-6 text-sm font-bold text-brand-900 transition-colors hover:bg-brand-100"
            >
              Explore Courses
            </button>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center gap-2 rounded-full bg-emerald-500 px-6 text-sm font-bold text-white transition-colors hover:bg-emerald-600"
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
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
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
                  className="text-left text-sm text-slate-400 transition-colors hover:text-white"
                >
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
              <span className="text-slate-400">{siteConfig.contact.phone}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
              <span className="text-slate-400">{siteConfig.contact.email}</span>
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
