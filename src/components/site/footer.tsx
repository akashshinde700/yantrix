"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ArrowUp,
  ArrowUpRight,
  Clock,
  Facebook,
  GraduationCap,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { useSiteStore } from "@/lib/store";
import { useCollection, useSettings } from "@/lib/content/provider";
import {
  emailHref,
  fullAddress,
  phoneHref,
  whatsappUrl,
} from "@/lib/content/helpers";
import type { Course, NavLink, SiteSettings } from "@/lib/content/types";

/* ───────────── live "open now" status from the admin-entered hours ───────────── */

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** Parses e.g. "Mon – Sat · 9:00 AM – 7:00 PM". Returns null if the format is unknown. */
function parseHours(text: string) {
  const days = text
    .toLowerCase()
    .match(/\b(sun|mon|tue|wed|thu|fri|sat)[a-z]*\b/g);
  const times = [...text.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/gi)];
  if (!days || days.length < 1 || times.length < 2) return null;
  const toMin = (m: RegExpMatchArray) =>
    ((Number(m[1]) % 12) + (m[3].toLowerCase() === "pm" ? 12 : 0)) * 60 +
    Number(m[2] ?? 0);
  const from = DAYS.indexOf(days[0].slice(0, 3));
  const to = DAYS.indexOf((days[1] ?? days[0]).slice(0, 3));
  const open = new Set<number>();
  for (let d = from; ; d = (d + 1) % 7) {
    open.add(d);
    if (d === to) break;
  }
  return {
    open,
    start: toMin(times[0]),
    end: toMin(times[1]),
    closeLabel: times[1][0].replace(/:00/, "").toUpperCase(),
  };
}

function useOpenStatus(settings: SiteSettings) {
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(
    null,
  );
  useEffect(() => {
    const hours = parseHours(settings.contact.hours);
    if (!hours) return;
    const update = () => {
      // business hours are in India time, whatever the visitor's timezone
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).formatToParts(new Date());
      const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
      const day = DAYS.indexOf(get("weekday").toLowerCase().slice(0, 3));
      const minutes = Number(get("hour")) * 60 + Number(get("minute"));
      const open =
        hours.open.has(day) && minutes >= hours.start && minutes < hours.end;
      setStatus({
        open,
        label: open
          ? `Open now · until ${hours.closeLabel}`
          : "Closed now · message us anytime",
      });
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [settings.contact.hours]);
  return status;
}

/* ───────────── animation presets ───────────── */

const column: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.1 + i * 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const SOCIAL: {
  key: keyof SiteSettings["social"];
  label: string;
  Icon: typeof Instagram;
}[] = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "youtube", label: "YouTube", Icon: Youtube },
  { key: "twitter", label: "X (Twitter)", Icon: Twitter },
  { key: "googleBusiness", label: "Google Business Profile", Icon: MapPin },
];

/** Client-side routes behind the SPA views. */
const VIEW_PATHS = {
  home: "/",
  courses: "/courses",
  about: "/about",
  contact: "/contact",
} as const;

function FooterLink({
  children,
  onClick,
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const inner = (
    <>
      <span
        aria-hidden="true"
        className="h-px w-0 bg-gradient-to-r from-cyan-300 to-violet-300 transition-all duration-300 group-hover:w-4"
      />
      <span className="transition-transform duration-300 group-hover:translate-x-0.5">
        {children}
      </span>
    </>
  );
  const cls =
    "group flex items-center gap-2 text-left text-sm text-slate-400 transition-colors hover:text-white";
  return href ? (
    <a
      href={href}
      className={cls}
      onClick={(event) => {
        if (!onClick) return;
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        )
          return;
        event.preventDefault();
        onClick();
      }}
    >
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

/**
 * Footer as the "landing" of the journey: the universe fades into it under a
 * glowing orbit horizon (a light travels along it), columns rise in one by
 * one, a live open/closed status, and a giant brand wordmark that sweeps with
 * light on hover. The CTA strip hides itself on pages that end with the
 * CtaBand finale (see globals.css).
 */
export function Footer({ showCta = true }: { showCta?: boolean }) {
  const navigate = useSiteStore((s) => s.navigate);
  const settings = useSettings();
  const quickLinks = useCollection<NavLink>("navFooter");
  const courses = useCollection<Course>("courses");
  const status = useOpenStatus(settings);
  const year = new Date().getFullYear();
  const waHref = whatsappUrl(settings);
  const social = SOCIAL.filter((s) => settings.social[s.key]);
  const wordmark = (settings.shortName || settings.name).toUpperCase();

  return (
    <footer className="site-footer relative mt-auto overflow-hidden text-slate-300">
      {/* the universe fades into the footer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(2,4,12,0.88)_18%,#02040c_40%)]"
      />

      {/* orbit horizon with a travelling light */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 w-full sm:h-40"
      >
        <defs>
          <linearGradient id="horizon-stroke" x1="0" x2="1">
            <stop offset="0" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="0.3" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#e0f2fe" />
            <stop offset="0.7" stopColor="#8b5cf6" stopOpacity="0.9" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="horizon-glow" cx="0.5" cy="1" r="0.6">
            <stop offset="0" stopColor="#38bdf8" stopOpacity="0.28" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M0 160 Q720 -40 1440 160 Z" fill="url(#horizon-glow)" />
        <motion.path
          id="horizon-arc"
          d="M0 160 Q720 -40 1440 160"
          fill="none"
          stroke="url(#horizon-stroke)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        />
        <circle r="3.5" fill="#e0f2fe" className="horizon-spark">
          <animateMotion
            dur="9s"
            repeatCount="indefinite"
            rotate="auto"
            path="M0 160 Q720 -40 1440 160"
          />
        </circle>
      </svg>

      <div className="relative pt-24 sm:pt-32">
        {/* CTA strip — only on pages without the CtaBand finale (the shell decides) */}
        {showCta && (
          <div className="footer-cta mx-auto mb-14 max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-5 rounded-3xl border border-white/10 bg-[#0a1230]/80 px-6 py-7 text-center md:flex-row md:text-left">
              <div>
                <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                  {settings.footer.ctaTitle}
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  {settings.footer.ctaText}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => navigate("courses")}
                  className="h-11 rounded-full bg-white px-6 text-sm font-bold text-brand-900 transition-transform hover:-translate-y-0.5"
                >
                  Explore Courses
                </button>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp flex h-11 items-center gap-2 rounded-full px-6 text-sm font-bold text-white"
                >
                  <WhatsAppIcon className="h-4.5 w-4.5" />
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Columns */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.4fr]"
        >
          {/* Brand */}
          <motion.div custom={0} variants={column} className="space-y-5">
            <Logo variant="dark" height={56} />
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              {settings.positioning}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-brand-200 ring-1 ring-white/10">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                IT Training Institute · Since {settings.foundedYear}
              </span>
              {status && (
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${
                    status.open
                      ? "bg-emerald-400/10 text-emerald-200 ring-emerald-400/30"
                      : "bg-white/5 text-slate-300 ring-white/10"
                  }`}
                >
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    {status.open && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    )}
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${status.open ? "bg-emerald-400" : "bg-slate-500"}`}
                    />
                  </span>
                  {status.label}
                </span>
              )}
            </div>
            {social.length > 0 && (
              <ul className="flex gap-2" aria-label="Social media">
                {social.map(({ key, label, Icon }) => (
                  <li key={key}>
                    <a
                      href={settings.social[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all hover:-translate-y-1 hover:border-cyan-300/50 hover:text-white hover:shadow-[0_0_20px_-4px_rgba(34,211,238,0.7)]"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Quick links */}
          <motion.nav
            custom={1}
            variants={column}
            aria-label="Footer navigation"
          >
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-cyber-300">
              Explore
            </h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  {/* real href for crawlers / new-tab, instant nav when JS runs */}
                  <FooterLink
                    href={VIEW_PATHS[link.view]}
                    onClick={() => navigate(link.view)}
                  >
                    {link.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* Courses — real course pages (crawlable links) */}
          <motion.nav custom={2} variants={column} aria-label="Popular courses">
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-cyber-300">
              Courses
            </h3>
            <ul className="mt-5 space-y-3">
              {courses.slice(0, 6).map((course) => (
                <li key={course.id}>
                  <FooterLink href={`/courses/${course.slug}`}>
                    {course.title}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* Contact */}
          <motion.div custom={3} variants={column}>
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-cyber-300">
              Visit or call
            </h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {[
                {
                  Icon: Phone,
                  text: settings.contact.phone,
                  href: phoneHref(settings),
                },
                {
                  Icon: Mail,
                  text: settings.contact.email,
                  href: emailHref(settings),
                },
                {
                  Icon: MapPin,
                  text: fullAddress(settings.contact),
                  href: settings.contact.mapLink || undefined,
                },
                { Icon: Clock, text: settings.contact.hours },
              ]
                .filter((row) => row.text)
                .map(({ Icon, text, href }) => {
                  const body = (
                    <>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-cyber-300 ring-1 ring-white/10 transition-colors group-hover:bg-cyan-400/15">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="break-words pt-1.5 text-slate-400 transition-colors group-hover:text-white">
                        {text}
                      </span>
                      {href && (
                        <ArrowUpRight
                          className="ml-auto mt-1.5 h-4 w-4 shrink-0 text-slate-600 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyber-300 group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      )}
                    </>
                  );
                  return (
                    <li key={text}>
                      {href ? (
                        <a
                          href={href}
                          target={
                            href.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="group -mx-2 flex items-start gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
                        >
                          {body}
                        </a>
                      ) : (
                        <div className="group -mx-2 flex items-start gap-3 px-2 py-1.5">
                          {body}
                        </div>
                      )}
                    </li>
                  );
                })}
            </ul>
          </motion.div>
        </motion.div>

        {/* Giant wordmark */}
        <div
          className="relative mx-auto mt-16 max-w-7xl overflow-hidden px-4 sm:px-6"
          aria-hidden="true"
        >
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            transition={{ staggerChildren: 0.06 }}
            className="footer-wordmark flex select-none justify-between font-extrabold leading-[0.8] tracking-tight"
          >
            {wordmark.split("").map((ch, i) => (
              <motion.span
                key={`${ch}-${i}`}
                className="inline-block"
                style={{ "--i": i } as CSSProperties}
                variants={{
                  hidden: { opacity: 0, y: "60%" },
                  show: {
                    opacity: 1,
                    y: "0%",
                    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.p>
        </div>

        {/* Bottom bar */}
        <div className="relative border-t border-white/10">
          {/* extra bottom room so the fixed dock / assistant / WhatsApp buttons never cover it */}
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 pb-28 pt-5 text-center text-xs text-slate-500 sm:px-6 md:flex-row md:pb-24">
            <p>
              © {year} {settings.name}. All rights reserved.
              {settings.footer.copyright ? ` ${settings.footer.copyright}` : ""}
            </p>
            <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <span>{settings.footer.disclaimer}</span>
              <a
                href="/privacy"
                className="underline-offset-4 hover:text-white hover:underline"
              >
                {settings.legal.privacyTitle}
              </a>
              <a
                href="/terms"
                className="underline-offset-4 hover:text-white hover:underline"
              >
                {settings.legal.termsTitle}
              </a>
              <a
                href="/admin"
                className="font-semibold text-slate-600 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Admin
              </a>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 font-semibold text-slate-300 transition-colors hover:border-cyan-300/50 hover:text-white"
              >
                Back to orbit
                <ArrowUp
                  className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </button>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
