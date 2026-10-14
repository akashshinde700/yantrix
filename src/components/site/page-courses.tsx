"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, MapPin, MessageCircleQuestion, Monitor, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBand } from "@/components/site/cta-band";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { HeroDecor } from "@/components/site/svg-decor";
import { HudCorners, ScanSweep } from "@/components/site/ai-decor";
import { tiltHandlers } from "@/components/site/fx";
import { courses, type Course } from "@/lib/data";
import { useSiteStore } from "@/lib/store";
import { whatsappUrl } from "@/lib/site-config";

function CourseCard({ course, index }: { course: Course; index: number }) {
  const navigate = useSiteStore((s) => s.navigate);
  const Icon = course.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07, ease: "easeOut" }}
      {...tiltHandlers(5)}
      className="tilt-card spotlight-card card-glow group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/[0.1]"
    >
      {/* Animated top gradient bar — sweeps in on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 rounded-t-2xl bg-gradient-to-r from-brand-500 via-cyber-400 to-brand-700 transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
      <HudCorners />
      <ScanSweep />

      <div className="relative z-10 flex items-start justify-between gap-3">
        {/* Icon with animated dash-flow ring on hover */}
        <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-brand-600 group-hover:to-cyber-500 group-hover:text-white group-hover:shadow-[0_0_22px_-4px_rgba(34,211,238,0.65)]">
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
              className="dash-flow text-cyber-400"
              strokeLinecap="round"
            />
          </svg>
          <Icon
            className="h-6 w-6 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
            aria-hidden="true"
          />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {course.modes.map((mode) => (
            <Badge
              key={mode}
              variant="secondary"
              className="rounded-full bg-brand-50 text-[11px] font-bold text-brand-800 ring-1 ring-brand-100"
            >
              {mode === "Online" ? (
                <Monitor className="mr-1 h-3 w-3" aria-hidden="true" />
              ) : (
                <MapPin className="mr-1 h-3 w-3" aria-hidden="true" />
              )}
              {mode}
            </Badge>
          ))}
        </div>
      </div>

      <h3 className="relative z-10 mt-4 text-lg font-extrabold text-ink">{course.title}</h3>
      <p className="relative z-10 mt-2 text-sm leading-relaxed text-muted-foreground">
        {course.description}
      </p>

      {/* Technology chips (Fusion-style) */}
      <div className="relative z-10 mt-4 flex flex-wrap gap-1.5">
        {course.highlights.map((h, hi) => (
          <span
            key={h}
            className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 transition-all duration-300 group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-800 group-hover:ring-brand-200"
            style={{ transitionDelay: `${hi * 40}ms` }}
          >
            {h}
          </span>
        ))}
      </div>

      <div className="relative z-10 mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Clock className="h-3.5 w-3.5 text-brand-600 transition-transform duration-300 group-hover:rotate-12" aria-hidden="true" />
          {course.duration}
        </span>
        <span
          aria-hidden="true"
          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-600 opacity-0 transition-all duration-300 group-hover:opacity-100"
        >
          Hover to learn more
        </span>
      </div>

      <Button
        onClick={() => navigate("contact", { course: course.title })}
        className="btn-futur btn-shine relative z-10 mt-4 h-11 w-full rounded-xl font-bold text-white"
      >
        Enquire Now
        <ArrowRight
          className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Button>
    </motion.article>
  );
}

export function PageCourses() {
  return (
    <>
      {/* Page hero band */}
      <section className="relative overflow-hidden bg-space py-16 sm:py-20">
        <HeroDecor
          orbitClassName="-right-20 -top-24 h-80 w-80 text-brand-400/40"
          circuitClassName="absolute inset-x-0 bottom-0 h-40 w-full text-brand-400/25"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            dark
            align="left"
            eyebrow="Our Courses"
            title="Career-oriented IT courses, taught the practical way"
            description="Choose from in-demand programs across development, data, design and marketing — with online and offline batches, live projects and placement assistance."
          />
          <div className="mt-6 flex flex-wrap gap-2.5">
            {["Online & Offline Batches", "Live Projects", "Placement Assistance", "Experienced Trainers"].map(
              (chip) => (
                <span
                  key={chip}
                  className="glass rounded-full px-4 py-1.5 text-xs font-bold text-cyber-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white hover:shadow-[0_0_18px_-4px_rgba(34,211,238,0.5)]"
                >
                  {chip}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Course grid */}
      <section id="course-grid" className="scroll-mt-28 bg-slate-50 py-14 sm:py-16" aria-label="All courses">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-5 [perspective:1400px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course, i) => (
              <CourseCard key={course.slug} course={course} index={i} />
            ))}
          </div>

          {/* Editable-content + disclaimer notes */}
          <div className="mx-auto mt-10 max-w-3xl space-y-2 text-center">
            <p className="text-xs leading-relaxed text-slate-500">
              * Durations shown are typical ranges and may vary by batch and track. Contact us for
              the current batch schedule and detailed syllabus.
            </p>
            <p className="text-xs leading-relaxed text-slate-500">
              Looking for something specific or corporate training for your team?{" "}
              <button
                onClick={() => useSiteStore.getState().navigate("contact")}
                className="font-bold text-brand-700 underline-offset-2 hover:underline"
              >
                Talk to us
              </button>{" "}
              — we regularly add new programs.
            </p>
          </div>
        </div>
      </section>

      {/* Help choose section */}
      <section className="bg-white py-14 sm:py-16" aria-labelledby="course-help-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-8 rounded-3xl border border-slate-100 bg-slate-50/80 p-8 sm:p-10 lg:grid-cols-[auto_1fr_auto]">
            <span className="hover-wiggle mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-cyber-500 text-white shadow-lg shadow-cyber-500/30 lg:mx-0">
              <MessageCircleQuestion className="h-8 w-8" aria-hidden="true" />
            </span>
            <div className="text-center lg:text-left">
              <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
                Not sure which course is right for you?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Share your background and goals — our counsellors will suggest the best starting
                point, batch timing and mode of learning for you.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button
                onClick={() => useSiteStore.getState().navigate("contact")}
                className="btn-futur btn-shine h-11 rounded-full px-6 font-bold text-white"
              >
                <Users className="mr-1 h-4.5 w-4.5" aria-hidden="true" />
                Get Free Counselling
              </Button>
              <a
                href={whatsappUrl("Hello Yantrix Technology, I need help choosing the right course.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600"
              >
                <WhatsAppIcon className="h-4.5 w-4.5" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
