"use client";

import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { useSiteStore } from "@/lib/store";
import { siteConfig } from "@/lib/site-config";

const checklist = [
  "Practical-first curriculum designed around real industry work",
  "Live projects that turn learning into a working portfolio",
  "Placement assistance with interview and resume preparation",
];

export function AboutPreview() {
  const navigate = useSiteStore((s) => s.navigate);

  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="home-about-heading">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        {/* Image side */}
        <Reveal className="group/reveal relative">
          <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-brand-950/10">
            <Image
              src="/images/about-institute.png"
              alt="Modern training environment at Yantrix Technology institute"
              width={1152}
              height={864}
              className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover/reveal:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/40 to-transparent transition-opacity duration-500 group-hover/reveal:opacity-0" />
          </div>
          {/* Floating since card */}
          <div className="absolute -bottom-6 left-6 right-6 sm:left-8 sm:right-auto">
            <div className="flex items-center gap-4 rounded-2xl bg-brand-950 p-5 shadow-2xl shadow-brand-950/30 ring-1 ring-white/10">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-black text-white">
                {siteConfig.foundedYear}
              </span>
              <div>
                <p className="text-base font-extrabold text-white">Established in {siteConfig.foundedYear}</p>
                <p className="text-xs text-slate-300">A new-age IT training institute</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Text side */}
        <div className="pt-8 lg:pt-0">
          <SectionHeading
            align="left"
            eyebrow="About Yantrix Technology"
            title="An institute built around practical learning and career growth"
            description={`${siteConfig.name} was started in ${siteConfig.foundedYear} with one simple belief — students learn best by doing. Our programs combine clear fundamentals, hands-on practice and live projects so learners walk out with skills they can actually use on the job.`}
          />
          <ul className="mt-6 space-y-3.5">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                <span className="text-[15px] leading-relaxed text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              onClick={() => navigate("about")}
              className="h-11 rounded-full bg-brand-700 px-6 font-bold shadow-md shadow-brand-700/25 hover:bg-brand-800"
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
