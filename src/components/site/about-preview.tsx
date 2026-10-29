"use client";

import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { useSiteStore } from "@/lib/store";
import { useCollection, useSection, useSettings, useSiteContent } from "@/lib/content/provider";
import type { SimpleItem } from "@/lib/content/types";

export function AboutPreview() {
  const navigate = useSiteStore((s) => s.navigate);
  const settings = useSettings();
  const section = useSection("about");
  const homeCopy = useSiteContent().pages.home;
  const checklist = useCollection<SimpleItem>("checklist").map((item) => item.label);
  if (section.hidden) return null;

  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="home-about-heading">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        {/* Image side */}
        <Reveal className="group/reveal relative">
          <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-brand-950/10">
            <Image
              src={homeCopy.aboutImage}
              alt={homeCopy.aboutImageAlt}
              width={1152}
              height={864}
              className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover/reveal:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/40 to-transparent transition-opacity duration-500 group-hover/reveal:opacity-0" />
          </div>
          {/* Floating since card */}
          <div className="absolute -bottom-6 left-6 right-6 sm:left-8 sm:right-auto">
            <div className="glass flex items-center gap-4 rounded-2xl p-5 shadow-2xl shadow-space/40 ring-1 ring-cyber-400/30 shadow-[0_0_36px_-8px_rgba(34,211,238,0.4)]">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-cyber-500 text-2xl font-black text-white shadow-[0_0_20px_-4px_rgba(34,211,238,0.7)]">
                {settings.foundedYear}
              </span>
              <div>
                <p className="text-base font-extrabold text-white">{homeCopy.aboutBadgeTitle}</p>
                <p className="text-xs text-slate-300">{homeCopy.aboutBadgeText}</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Text side */}
        <div className="pt-8 lg:pt-0">
          <SectionHeading
            align="left"
            eyebrow={section.eyebrow}
            title={section.title}
            description={
              section.description ||
              `${settings.name} was started in ${settings.foundedYear} with one simple belief — students learn best by doing. Our programs combine clear fundamentals, hands-on practice and live projects so learners walk out with skills they can actually use on the job.`
            }
          />
          <ul className="mt-6 space-y-3.5">
            {checklist.map((item, index) => (
              <li key={`${item}-${index}`} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                <span className="text-[15px] leading-relaxed text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              onClick={() => navigate("about")}
              className="btn-futur btn-shine h-11 rounded-full px-6 font-bold text-white"
            >
              More About Us
            </Button>
            <Button
              onClick={() => navigate("contact")}
              variant="outline"
              className="h-11 rounded-full border-brand-200 px-6 font-bold text-brand-700 hover:bg-brand-50 hover:text-brand-800"
            >
              Talk to a Counsellor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
