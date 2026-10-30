"use client";

import { ArrowRight, Clock, Phone } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { WordReveal } from "@/components/site/word-reveal";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { useSiteStore } from "@/lib/store";
import { useSection, useSettings } from "@/lib/content/provider";
import { phoneHref, whatsappUrl } from "@/lib/content/helpers";

/**
 * The closing scene of a page: a large, calm finale over the universe (the
 * spiral galaxy on the home page) with every next step in one place.
 * Pages that end with it tell the footer to skip its own CTA strip (site-shell).
 */
export function CtaBand({ title, description }: { title?: string; description?: string }) {
  const navigate = useSiteStore((s) => s.navigate);
  const section = useSection("cta");
  const settings = useSettings();
  if (section.hidden) return null;
  const heading = title ?? section.title;
  const body = description ?? section.description;

  return (
    <section className="relative py-20 sm:py-28" aria-labelledby="cta-heading">
      {/* soft light so the copy reads over the galaxy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_50%_50%,rgba(2,4,12,0.75),transparent_75%)]"
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6">
        <span className="inline-flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.45em] text-cyber-300">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-cyber-400" aria-hidden="true" />
          Your next step
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-cyber-400" aria-hidden="true" />
        </span>
        <h2 id="cta-heading" className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-white text-balance sm:text-6xl">
          <WordReveal text={heading} wordClassName="text-gradient-cyber" />
        </h2>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{body}</p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("courses")}
              className="btn-futur inline-flex h-13 items-center gap-2 rounded-full px-8 text-base font-bold text-white"
            >
              Explore Courses
              <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
            <a
              href={whatsappUrl(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp inline-flex h-13 items-center gap-2 rounded-full px-7 text-base font-bold text-white"
            >
              <WhatsAppIcon className="h-5 w-5" />
              WhatsApp Us
            </a>
            <button
              onClick={() => navigate("contact")}
              className="inline-flex h-13 items-center rounded-full border border-white/20 bg-white/5 px-7 text-base font-bold text-white transition-colors hover:border-cyber-300/60 hover:bg-white/10"
            >
              Contact for Admission
            </button>
          </div>
        </Reveal>
        <Reveal delay={0.4}>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
            <a href={phoneHref(settings)} className="inline-flex items-center gap-2 transition-colors hover:text-white">
              <Phone className="h-4 w-4 text-cyber-300" aria-hidden="true" />
              {settings.contact.phone}
            </a>
            {settings.contact.hours && (
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyber-300" aria-hidden="true" />
                {settings.contact.hours}
              </span>
            )}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
