"use client";

import Image from "next/image";
import { Eye, Flag, GraduationCap, Building2, CalendarDays, Laptop, MonitorSmartphone, Handshake, Globe } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { CtaBand } from "@/components/site/cta-band";
import { HeroDecor } from "@/components/site/svg-decor";
import { approachSteps } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

const quickFacts = [
  { label: "Institute", value: siteConfig.name, icon: Building2 },
  { label: "Founded", value: String(siteConfig.foundedYear), icon: CalendarDays },
  { label: "Focus", value: "Practical IT training & career growth", icon: Laptop },
  { label: "Training modes", value: "Online & Offline batches", icon: MonitorSmartphone },
  { label: "Placement support", value: "Assistance (not a guarantee)", icon: Handshake },
  { label: "Website", value: siteConfig.domain, icon: Globe },
];

export function PageAbout() {
  return (
    <>
      {/* Page hero band */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-950 to-ink py-16 sm:py-20">
        <HeroDecor
          orbitClassName="-right-24 -top-20 h-72 w-72 text-brand-400/35"
          circuitClassName="absolute inset-x-0 bottom-0 h-36 w-full text-brand-400/25"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            dark
            align="left"
            eyebrow={`About Us · Since ${siteConfig.foundedYear}`}
            title="We train people for real IT careers"
            description={siteConfig.positioning}
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
                Practical learning space — built for hands-on IT training.
              </p>
            </div>
          </Reveal>

          <div>
            <SectionHeading
              align="left"
              eyebrow="Our Story"
              title={`Started in ${siteConfig.foundedYear} with a simple belief`}
              description="Yantrix Technology was founded in 2024 as an IT training institute focused on practical learning and career growth. We saw a gap between what students study and what companies actually expect — so we built programs that close it."
            />
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-slate-700">
              <p>
                Every course at Yantrix Technology is designed around doing: clear fundamentals,
                guided practice, and live projects that learners can show in interviews. Our
                trainers come with real industry experience and mentor each student personally.
              </p>
              <p>
                Whether you are a student starting your career, a graduate switching to IT, or a
                working professional upgrading your skills — you get the same commitment: honest
                guidance, practical training and support until you are job-ready.
              </p>
            </div>

            {/* Quick facts — structured for AI search engines (GEO) */}
            <div className="mt-8 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-800">
                Yantrix Technology at a glance
              </h3>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {quickFacts.map((fact) => (
                  <div key={fact.label} className="flex items-start gap-2.5">
                    <fact.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
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
              <div className="spotlight-card group h-full rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/[0.08]">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-lg shadow-brand-700/25 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <Flag className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-extrabold text-ink">Our Mission</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  To make practical, career-oriented IT education accessible to every student and
                  professional — teaching real skills through hands-on training, live projects and
                  mentorship that translates directly into job readiness.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="spotlight-card group h-full rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/[0.08]">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white shadow-lg shadow-ink/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Eye className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-extrabold text-ink">Our Vision</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  To become a trusted destination for IT learning — known for honest guidance,
                  industry-relevant courses and learners who step into the industry confident,
                  skilled and ready to contribute from day one.
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
              <Reveal key={step.step} delay={i * 0.08}>
                <li className="group relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:bg-white hover:shadow-lg hover:shadow-brand-900/[0.07]">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-brand-500 to-ink transition-transform duration-500 group-hover:scale-x-100"
                  />
                  <span
                    aria-hidden="true"
                    className="text-3xl font-black text-brand-200 transition-colors duration-300 group-hover:text-brand-500"
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
              Every program ends with placement assistance — resume building, interview preparation
              and job-search guidance. Assistance, honestly provided; never a guaranteed placement.
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Want to visit us or know more about our programs?"
        description="Reach out through the enquiry form or WhatsApp — we're happy to walk you through the courses, batches and fees."
      />
    </>
  );
}
