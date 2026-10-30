"use client";

import { ArrowRight, BarChart3, CheckCircle2, ChevronDown, Clock, IndianRupee, MapPin, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { ContentIcon } from "@/components/site/content-icon";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { CtaBand } from "@/components/site/cta-band";
import { useCollection, useSettings, useSiteContent } from "@/lib/content/provider";
import { whatsappUrl } from "@/lib/content/helpers";
import { courseFaqs, courseHeadline, coursePath } from "@/lib/seo";
import { useSiteStore } from "@/lib/store";
import type { Course } from "@/lib/content/types";

/**
 * /courses/[slug] — one page per course, written for search and answer
 * engines: a keyword-led <h1>, an answer-first summary (marked speakable),
 * quick facts, topics, Q&A that mirrors the FAQPage schema, and internal
 * links to related courses.
 */
export function CourseDetail({ slug }: { slug: string }) {
  const content = useSiteContent();
  const settings = useSettings();
  const courses = useCollection<Course>("courses");
  const navigate = useSiteStore((s) => s.navigate);
  const course = courses.find((c) => c.slug === slug);
  if (!course) return null;

  const city = settings.contact.city;
  const modes = course.modes?.length ? course.modes : ["Online", "Offline"];
  const faqs = courseFaqs(content, course);
  const related = courses.filter((c) => c.slug !== slug).slice(0, 3);
  const summary = [
    `${course.title} at ${settings.name} is a${course.duration ? ` ${course.duration}` : ""} course`,
    course.level ? ` for ${course.level.toLowerCase()} learners` : "",
    `, available ${modes.join(" and ").toLowerCase()}${city ? ` in ${city}` : ""}. `,
    course.description,
  ].join("");

  const facts = [
    { icon: Clock, label: "Duration", value: course.duration || "On enquiry" },
    { icon: BarChart3, label: "Level", value: course.level || "All levels" },
    { icon: Monitor, label: "Mode", value: modes.join(" / ") },
    { icon: IndianRupee, label: "Fee", value: course.fee || "On request" },
  ];

  return (
    <article className="relative">
      {/* Header */}
      <header className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-400">
            <li>
              <a href="/" className="hover:text-white">Home</a>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <a href="/courses" className="hover:text-white">Courses</a>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-cyber-200">{course.title}</li>
          </ol>
        </nav>

        <div className="grid items-start gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyber-400/25 bg-white/5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-cyber-200">
              <ContentIcon name={course.icon} className="h-3.5 w-3.5" />
              {[course.level, city].filter(Boolean).join(" · ") || "Course"}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-5xl">
              <span className="text-gradient-cyber">{courseHeadline(content, course)}</span>
            </h1>
            <p data-speakable className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {summary}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("contact", { course: course.title })}
                className="btn-futur h-12 rounded-full px-7 text-base font-bold text-white"
              >
                Enquire for this course
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Button>
              <a
                href={whatsappUrl(settings, `Hi ${settings.name}, I'm interested in the ${course.title} course. Please share fees and batch details.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp inline-flex h-12 items-center gap-2 rounded-full px-6 text-base font-bold text-white"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Ask on WhatsApp
              </a>
            </div>
          </div>

          {/* Quick facts */}
          <dl className="grid grid-cols-2 gap-3">
            {facts.map((f) => (
              <div key={f.label} className="rounded-2xl border border-white/10 bg-[#0a1230]/80 p-4 ">
                <dt className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <f.icon className="h-3.5 w-3.5 text-cyber-300" aria-hidden="true" />
                  {f.label}
                </dt>
                <dd className="mt-1.5 text-base font-bold text-white">{f.value}</dd>
              </div>
            ))}
            <div className="col-span-2 flex items-start gap-2 rounded-2xl border border-white/10 bg-[#0a1230]/80 p-4 text-sm text-slate-300">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyber-300" aria-hidden="true" />
              <span>
                Classroom batches at {settings.name}, {[settings.contact.address, city].filter(Boolean).join(", ")} · Online batches live from anywhere.
              </span>
            </div>
          </dl>
        </div>
      </header>

      {/* What you'll learn */}
      {course.highlights?.length > 0 && (
        <section aria-labelledby="learn-heading" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h2 id="learn-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            What you&apos;ll learn in {course.title}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {course.highlights.map((h, i) => (
              <Reveal key={h} delay={i * 0.05}>
                <li className="flex h-full items-start gap-3 rounded-2xl border border-white/10 bg-[#0a1230]/80 p-4 ">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyber-300" aria-hidden="true" />
                  <span className="text-sm font-semibold text-slate-100">{h}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* Q&A — mirrors the FAQPage schema */}
      <section aria-labelledby="course-faq-heading" className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h2 id="course-faq-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {course.title} — questions students ask
        </h2>
        <div className="mt-6 space-y-3">
          {faqs.map((qa, i) => (
            <details
              key={qa.question}
              open={i === 0}
              className="group rounded-2xl border border-white/10 bg-[#0a1230]/80 px-5 open:border-cyber-400/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[15px] font-bold text-white [&::-webkit-details-marker]:hidden">
                {qa.question}
                <ChevronDown className="h-4 w-4 shrink-0 text-cyber-300 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-slate-300">{qa.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related courses — internal links */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h2 id="related-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Other courses at {settings.shortName}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {related.map((c) => (
              <a
                key={c.id}
                href={coursePath(c)}
                className="group flex flex-col rounded-2xl border border-white/10 bg-[#0a1230]/80 p-5  transition-colors hover:border-cyber-400/40"
              >
                <span className="flex items-center gap-2 text-cyber-300">
                  <ContentIcon name={c.icon} className="h-5 w-5" />
                  <span className="text-xs font-semibold text-slate-400">{c.duration}</span>
                </span>
                <span className="mt-3 text-lg font-extrabold text-white">{c.title}</span>
                <span className="mt-1 line-clamp-2 text-sm text-slate-400">{c.description}</span>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-cyber-300">
                  View course <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      <CtaBand />
    </article>
  );
}
