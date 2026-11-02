"use client";

import { type ReactNode, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Briefcase, Building2, Code2, GraduationCap, Linkedin, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SectionHeading } from "@/components/site/section-heading";
import { useCollection, useLabels, useSection } from "@/lib/content/provider";
import { cn } from "@/lib/utils";
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
  const t = useLabels();
  const has = (list?: string[]) => Array.isArray(list) && list.filter(Boolean).length > 0;
  return (
    <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
      <div className="space-y-3">
        <PersonPhoto src={trainer.photo} name={trainer.name} className="aspect-[4/5] w-full rounded-2xl text-[28px]" />
        {trainer.experienceYears > 0 && (
          <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-slate-300">
            <span className="text-xl font-extrabold text-white">{trainer.experienceYears}+</span>{" "}
            {t("trainers.years")}
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
            {t("trainers.linkedin")}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </div>
      <div className="space-y-6">
        {(trainer.company || trainer.specialisation) && (
          <ul className="flex flex-wrap gap-1.5">
            {trainer.company ? (
              <li className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-slate-200">
                <Building2 className="h-3 w-3 text-cyber-300" aria-hidden="true" />
                {trainer.company}
              </li>
            ) : null}
            {trainer.specialisation ? (
              <li className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-100">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {trainer.specialisation}
              </li>
            ) : null}
          </ul>
        )}
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
  const t = useLabels();
  const [filter, setFilter] = useState<string>("all");

  /**
   * Filter chips only earn their space once there is a real spread of
   * specialisations — with two mentors a "filter" is just extra clicking.
   */
  const specialisations = useMemo(() => {
    const set = new Set<string>();
    for (const trainer of trainers) {
      const label = (trainer.specialisation || "").trim();
      if (label) set.add(label);
    }
    return Array.from(set);
  }, [trainers]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? trainers
        : trainers.filter((trainer) => (trainer.specialisation || "").trim() === filter),
    [trainers, filter]
  );

  if (section.hidden || trainers.length === 0) return null;

  const combinedYears = trainers.reduce(
    (sum, trainer) => sum + (Number(trainer.experienceYears) || 0),
    0
  );

  return (
    <section id="mentors" className="relative scroll-mt-24 py-16 sm:py-20" aria-label={section.eyebrow || t("trainers.sectionLabel")}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} description={section.description} />

        {/* Live count strip — the reference site lists mentors with their years
            and specialisations, so surface those numbers up front. */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="hud-chip">
            {trainers.length} {t("trainers.countLabel")}
          </span>
          {combinedYears > 0 ? (
            <span className="hud-chip">
              {combinedYears}+ {t("trainers.yearsLabel")}
            </span>
          ) : null}
          {specialisations.length > 1 ? (
            <span className="hud-chip">
              {specialisations.length} {t("trainers.tracksLabel")}
            </span>
          ) : null}
        </div>

        {specialisations.length > 1 && trainers.length > 3 ? (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              { value: "all", label: t("trainers.filterAll") },
              ...specialisations.map((label) => ({ value: label, label })),
            ].map((option) => {
              const active = filter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-xs font-bold transition-all",
                    active
                      ? "border-transparent bg-gradient-to-r from-brand-600 to-cyber-500 text-white shadow-[0_8px_24px_-10px_rgba(34,211,238,0.8)]"
                      : "border-white/12 bg-white/[0.04] text-slate-300 hover:border-cyber-300/50 hover:text-white"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : null}

        <ul className="mt-10 flex flex-wrap justify-center gap-5">
          {visible.map((trainer, i) => {
            const company = (trainer.company || trainer.designation || "").trim();
            const specialisation = (trainer.specialisation || "").trim();
            const years = Number(trainer.experienceYears) || 0;
            return (
              <motion.li
                key={trainer.id}
                className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] xl:w-[calc(25%-15px)]"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <Dialog>
                  <article className="aurora-card sweep-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a1230]/85 transition-colors duration-300 hover:border-cyan-300/40">
                    {/* portrait photo, like the reference mentor wall */}
                    <div className="media-frame relative aspect-[3/4] overflow-hidden">
                      <PersonPhoto
                        src={trainer.photo}
                        name={trainer.name}
                        className="h-full w-full text-[40px] transition-transform duration-700 group-hover:scale-[1.06]"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-[#0a1230] via-[#0a1230]/25 to-transparent"
                      />
                      {years > 0 ? (
                        <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                          {years}+ {t("trainers.yearsShort")}
                        </span>
                      ) : null}
                      {specialisation ? (
                        <span className="absolute left-3 top-3 rounded-full border border-cyan-300/40 bg-cyber-500/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-cyan-100 backdrop-blur-sm">
                          {specialisation}
                        </span>
                      ) : null}
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h3 className="text-base font-extrabold uppercase leading-tight tracking-wide text-white">
                          {trainer.name}
                        </h3>
                        {company ? (
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-cyber-200">
                            <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span className="truncate">{company}</span>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4 pt-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {years > 0
                          ? `${years}+ ${t("trainers.yearsLabel")}`
                          : trainer.designation || specialisation}
                      </p>
                      {trainer.bio ? (
                        <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">{trainer.bio}</p>
                      ) : null}
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="mt-auto inline-flex items-center gap-1.5 self-start pt-1 text-xs font-bold text-cyber-300 transition-colors hover:text-white"
                        >
                          {t("trainers.profile")}
                          <ArrowUpRight
                            className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
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
                      <DialogDescription
                        className={
                          trainer.designation ? "mt-1 text-sm font-medium text-cyber-200" : "sr-only"
                        }
                      >
                        {trainer.designation || `${t("trainers.profile")} ${trainer.name}`}
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
