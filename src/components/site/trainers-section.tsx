"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Briefcase, Building2, Code2, GraduationCap, Linkedin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SectionHeading } from "@/components/site/section-heading";
import { useCollection, useSection } from "@/lib/content/provider";
import type { Trainer } from "@/lib/content/types";

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Photo with a graceful initials fallback (uploads live at /media/<id>). */
export function PersonPhoto({ src, name, className }: { src?: string; name: string; className?: string }) {
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className={`flex items-center justify-center bg-[radial-gradient(circle_at_30%_25%,#2563eb,#0b1230_70%)] font-extrabold text-white ${className ?? ""}`}
      >
        <span className="text-[2.2em] tracking-tight">{initials(name)}</span>
      </div>
    );
  }
  return <img src={src} alt={`Photo of ${name}`} loading="lazy" decoding="async" className={`object-cover ${className ?? ""}`} />;
}

function Chips({ items, tone = "cyan" }: { items: string[]; tone?: "cyan" | "violet" }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className={
            tone === "cyan"
              ? "rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-100"
              : "rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] font-semibold text-violet-100"
          }
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function ProfileBlock({ icon: Icon, title, children }: { icon: typeof Briefcase; title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h4 className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-cyber-300">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {title}
      </h4>
      {children}
    </section>
  );
}

function TrainerProfile({ trainer }: { trainer: Trainer }) {
  const has = (list?: string[]) => Array.isArray(list) && list.filter(Boolean).length > 0;
  return (
    <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
      <div className="space-y-3">
        <PersonPhoto src={trainer.photo} name={trainer.name} className="aspect-[4/5] w-full rounded-2xl text-[28px]" />
        {trainer.experienceYears > 0 && (
          <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-slate-300">
            <span className="text-xl font-extrabold text-white">{trainer.experienceYears}+</span> years experience
          </p>
        )}
        {trainer.linkedin && (
          <a
            href={trainer.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-300/50 hover:text-white"
          >
            <Linkedin className="h-4 w-4" aria-hidden="true" />
            LinkedIn
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </div>
      <div className="space-y-6">
        {trainer.bio && <p className="text-sm leading-relaxed text-slate-300">{trainer.bio}</p>}
        {has(trainer.professionalExperience) && (
          <ProfileBlock icon={Briefcase} title="Professional experience">
            <ol className="relative space-y-3 border-l border-white/10 pl-5">
              {trainer.professionalExperience.filter(Boolean).map((role) => (
                <li key={role} className="relative text-sm text-slate-200">
                  <span aria-hidden="true" className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border border-cyan-300 bg-[#050a1c] shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                  {role}
                </li>
              ))}
            </ol>
          </ProfileBlock>
        )}
        {has(trainer.education) && (
          <ProfileBlock icon={GraduationCap} title="Education">
            <ul className="space-y-1.5 text-sm text-slate-200">
              {trainer.education.filter(Boolean).map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </ProfileBlock>
        )}
        {has(trainer.skills) && (
          <ProfileBlock icon={Code2} title="Technical skills">
            <Chips items={trainer.skills.filter(Boolean)} />
          </ProfileBlock>
        )}
        {has(trainer.industryExperience) && (
          <ProfileBlock icon={Building2} title="Industry experience">
            <Chips items={trainer.industryExperience.filter(Boolean)} tone="violet" />
          </ProfileBlock>
        )}
      </div>
    </div>
  );
}

/**
 * Trainer profiles (admin: /admin/trainers). Hidden when the section is
 * switched off or no trainer is published.
 */
export function TrainersSection() {
  const section = useSection("trainers");
  const trainers = useCollection<Trainer>("trainers");
  if (section.hidden || trainers.length === 0) return null;

  return (
    <section className="relative py-16 sm:py-20" aria-label={section.eyebrow || "Our trainers"}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} description={section.description} />
        <ul className="mt-12 flex flex-wrap justify-center gap-6">
          {trainers.map((trainer, i) => {
            const skills = (trainer.skills ?? []).filter(Boolean);
            return (
              <motion.li
                key={trainer.id}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Dialog>
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a1230]/80 transition-colors duration-300 hover:border-cyan-300/40">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <PersonPhoto
                        src={trainer.photo}
                        name={trainer.name}
                        className="h-full w-full text-[34px] transition-transform duration-700 group-hover:scale-105"
                      />
                      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0a1230] via-[#0a1230]/10 to-transparent" />
                      {trainer.experienceYears > 0 && (
                        <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                          {trainer.experienceYears}+ yrs exp
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-5 pt-1">
                      <div>
                        <h3 className="text-lg font-extrabold text-white">{trainer.name}</h3>
                        {trainer.designation && <p className="mt-0.5 text-sm font-medium text-cyber-200">{trainer.designation}</p>}
                      </div>
                      {trainer.bio && <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">{trainer.bio}</p>}
                      {skills.length > 0 && <Chips items={skills.slice(0, 5).concat(skills.length > 5 ? [`+${skills.length - 5}`] : [])} />}
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="mt-auto inline-flex items-center gap-1.5 self-start pt-2 text-sm font-bold text-cyber-300 transition-colors hover:text-white"
                        >
                          View full profile
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                          <span className="sr-only"> of {trainer.name}</span>
                        </button>
                      </DialogTrigger>
                    </div>
                  </article>
                  <DialogContent
                    data-lenis-prevent
                    className="max-h-[88svh] overflow-y-auto border-white/10 bg-[#070d22] text-white sm:max-w-3xl"
                  >
                    <div className="mb-2">
                      <DialogTitle className="text-2xl font-extrabold">{trainer.name}</DialogTitle>
                      <DialogDescription className={trainer.designation ? "mt-1 text-sm font-medium text-cyber-200" : "sr-only"}>
                        {trainer.designation || `Trainer profile of ${trainer.name}`}
                      </DialogDescription>
                    </div>
                    <TrainerProfile trainer={trainer} />
                  </DialogContent>
                </Dialog>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
