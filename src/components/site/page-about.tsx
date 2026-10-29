"use client";

import Image from "next/image";
import { Eye, Flag, GraduationCap } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { CtaBand } from "@/components/site/cta-band";
import { HeroDecor } from "@/components/site/svg-decor";
import { useCollection, useSection, useSettings, useSiteContent } from "@/lib/content/provider";
import { ContentIcon } from "@/components/site/content-icon";
import type { ApproachStep, QuickFact } from "@/lib/content/types";

export function PageAbout() {
  const settings = useSettings();
  const copy = useSiteContent().pages.about;
  const heroSection = useSection("aboutPage");
  const storySection = useSection("about");
  const approachSteps = useCollection<ApproachStep>("approachSteps");
  const quickFacts = useCollection<QuickFact>("quickFacts");

  return (
    <>
      {/* Page hero band */}
      <section className="relative overflow-hidden bg-space py-16 sm:py-20">
        <HeroDecor
          orbitClassName="-right-24 -top-20 h-72 w-72 text-brand-400/35"
          circuitClassName="absolute inset-x-0 bottom-0 h-36 w-full text-brand-400/25"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            dark
            align="left"
            eyebrow={
              heroSection.eyebrow
                ? `${heroSection.eyebrow} · Since ${settings.foundedYear}`
                : `${settings.name} · Since ${settings.foundedYear}`
            }
            title={heroSection.title}
            description={heroSection.description || settings.positioning}
          />
        </div>
      </section>

      {/* Story + quick facts (GEO summary block) */}
      <section className="bg-white py-16 sm:py-20" aria-labelledby="about-story-heading">
        <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-brand-950/10">
              <Image
                src="/images/about-institute.png"
                alt="Yantrix Technology training centre — students working on live projects"
                width={1152}
                height={864}
                className="h-auto w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 to-transparent" />
              <p className="absolute bottom-5 left-5 right-5 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md ring-1 ring-white/15">
                {copy.imageCaption}
              </p>
            </div>
          </Reveal>

          <div>
            <SectionHeading
              align="left"
              eyebrow={storySection.eyebrow}
              title={copy.storyTitle || storySection.title}
              description={copy.storyParagraphs[0] ?? storySection.description}
            />
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-slate-700">
              {copy.storyParagraphs.slice(1).map((paragraph, index) => (
                <p key={`story-${index}`}>{paragraph}</p>
              ))}
            </div>

            {/* Quick facts — structured for AI search engines (GEO) */}
            <div className="mt-8 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-800">
                {settings.name} at a glance
              </h3>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {quickFacts.map((fact) => (
                  <div key={fact.id} className="flex items-start gap-2.5">
                    <ContentIcon name={fact.icon} className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <div>
                      <dt className="text-xs font-semibold text-slate-500">{fact.label}</dt>
                      <dd className="text-sm font-bold text-ink">{fact.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-slate-50 py-16 sm:py-20" aria-labelledby="mission-vision-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Mission & Vision"
            title="What drives us every day"
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            <Reveal>
              <div className="spotlight-card card-glow group h-full rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-900/[0.08]">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-cyber-500 text-white shadow-lg shadow-cyber-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <Flag className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-extrabold text-ink">{copy.missionTitle}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  {copy.missionText}
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="spotlight-card card-glow group h-full rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-900/[0.08]">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-cyber-300 shadow-lg shadow-ink/25 ring-1 ring-cyber-400/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_0_26px_-4px_rgba(34,211,238,0.55)]">
                  <Eye className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-extrabold text-ink">{copy.visionTitle}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  {copy.visionText}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Training approach */}
      <section className="bg-white py-16 sm:py-20" aria-labelledby="approach-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Training Approach"
            title="How we take you from beginner to job-ready"
            description="A proven four-step journey that every Yantrix student follows."
          />
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {approachSteps.map((step, i) => (
              <Reveal key={step.id} delay={i * 0.08}>
                <li className="group relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-brand-900/[0.07]">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-brand-500 via-cyber-400 to-brand-700 transition-transform duration-500 group-hover:scale-x-100"
                  />
                  <span
                    aria-hidden="true"
                    className="font-mono text-3xl font-black text-brand-200 transition-colors duration-300 group-hover:text-cyber-500"
                  >
                    {step.step}
                  </span>
                  <h3 className="mt-3 text-base font-extrabold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.2}>
            <p className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-2 rounded-xl bg-brand-50 px-5 py-4 text-center text-[13px] leading-relaxed text-brand-900 ring-1 ring-brand-100">
              <GraduationCap className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              {copy.disclaimer}
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
