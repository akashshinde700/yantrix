"use client";

import { motion } from "framer-motion";
import { Building2, MonitorSmartphone } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { tiltHandlers } from "@/components/site/fx";
import { badges, whyChooseUs } from "@/lib/data";
import { useSiteStore } from "@/lib/store";

export function BadgesStrip() {
  return (
    <section className="relative z-10 bg-white pb-4" aria-label="Key highlights">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid -translate-y-12 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-lg shadow-brand-950/[0.06] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-900/10"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-md shadow-brand-700/25 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <badge.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-ink">{badge.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {badge.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyChooseUs() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20" aria-labelledby="why-choose-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Everything you need to go from beginner to job-ready"
          description="We focus on the things that actually move your career forward — practical skills, real projects and honest guidance."
        />
        <div className="mt-12 grid gap-5 [perspective:1400px] sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((feature, i) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: "easeOut" }}
              {...tiltHandlers(4)}
              className="tilt-card spotlight-card group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/[0.08]"
            >
              {/* animated corner glow */}
              <span
                aria-hidden="true"
                className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-brand-100/0 blur-2xl transition-all duration-500 group-hover:bg-brand-300/40"
              />

              {/* Icon with dash-flow ring + wiggle on hover */}
              <span className="relative z-10 flex h-13 w-13 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-colors duration-300 group-hover:bg-brand-700 group-hover:text-white">
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  aria-hidden="true"
                  className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="47"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="dash-flow text-brand-500"
                    strokeLinecap="round"
                  />
                </svg>
                <feature.icon
                  className="h-6.5 w-6.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                  aria-hidden="true"
                />
              </span>

              <h3 className="relative z-10 mt-5 text-lg font-extrabold text-ink">{feature.title}</h3>
              <p className="relative z-10 mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrainingModes() {
  const modes = [
    {
      name: "Online Training",
      tagline: "Learn from anywhere, live.",
      points: [
        "Live, interactive sessions with trainers",
        "Join from home — save travel time",
        "Recorded backup for revision",
        "Same curriculum as classroom batches",
      ],
      cta: "Enquire for Online Batch",
      icon: MonitorSmartphone,
      style: "light" as const,
    },
    {
      name: "Offline Training",
      tagline: "Learn in the classroom, together.",
      points: [
        "In-person, practical classroom sessions",
        "Hands-on computer lab access",
        "Face-to-face mentoring and doubt-solving",
        "Peer learning with batchmates",
      ],
      cta: "Enquire for Offline Batch",
      icon: Building2,
      style: "dark" as const,
    },
  ];

  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="training-modes-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Flexible Learning"
          title="Online & offline training — pick what fits your life"
          description="Both modes follow the same practical curriculum with live projects and placement assistance."
        />
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 [perspective:1400px] md:grid-cols-2">
          {modes.map((mode, i) => (
            <Reveal key={mode.name} delay={i * 0.1}>
              <div
                {...tiltHandlers(4)}
                className={
                  mode.style === "dark"
                    ? "tilt-card spotlight-card spotlight-dark relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 p-7 text-white shadow-xl shadow-brand-900/20"
                    : "tilt-card spotlight-card relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                }
              >
                {/* Icon chip */}
                <span
                  className={
                    mode.style === "dark"
                      ? "relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-brand-200 ring-1 ring-white/15 transition-transform duration-300 hover:scale-110"
                      : "relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-transform duration-300 hover:scale-110"
                  }
                >
                  <mode.icon className="h-6 w-6" aria-hidden="true" />
                </span>

                <h3
                  className={
                    mode.style === "dark"
                      ? "mt-4 text-xl font-extrabold text-white"
                      : "mt-4 text-xl font-extrabold text-ink"
                  }
                >
                  {mode.name}
                </h3>
                <p className={mode.style === "dark" ? "mt-1 text-sm text-brand-200" : "mt-1 text-sm text-brand-700"}>
                  {mode.tagline}
                </p>
                <ul className="mt-5 flex-1 space-y-3">
                  {mode.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 transition-transform duration-300 hover:translate-x-1.5"
                    >
                      <CheckIcon dark={mode.style === "dark"} />
                      <span
                        className={
                          mode.style === "dark"
                            ? "text-sm leading-relaxed text-slate-200"
                            : "text-sm leading-relaxed text-slate-700"
                        }
                      >
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => useSiteStore.getState().navigate("contact")}
                  className={
                    mode.style === "dark"
                      ? "btn-shine mt-6 h-11 w-full rounded-full bg-white text-sm font-bold text-brand-900 transition-all hover:-translate-y-0.5 hover:bg-brand-100"
                      : "mt-6 h-11 w-full rounded-full border-2 border-brand-700 text-sm font-bold text-brand-700 transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:text-white"
                  }
                >
                  {mode.cta}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ dark }: { dark?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={
        dark
          ? "mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-300"
          : "mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-600"
      }
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}
