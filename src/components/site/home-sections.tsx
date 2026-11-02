"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Clock,
  Download,
  MapPin,
  Phone,
  Play,
  Quote,
  Smartphone,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { ContentIcon } from "@/components/site/content-icon";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { useCollection, useLabels, useSection, useSettings, useSiteContent } from "@/lib/content/provider";
import { whatsappUrl } from "@/lib/content/helpers";
import { useSiteStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useMarqueeSpeed, usePauseOffscreen } from "@/components/site/use-marquee";
import { GalleryLightbox } from "@/components/site/gallery-lightbox";
import type {
  Announcement,
  Centre,
  GalleryPhoto,
  Partner,
  Testimonial,
  VideoItem,
} from "@/lib/content/types";

/* ══════════════════════════════ offer ticker ══════════════════════════════ */

/**
 * The scrolling strip above the header (offers, new batches, admissions
 * notices). Duplicated once so the loop never shows a gap; pauses on hover and
 * stands still when the visitor prefers reduced motion.
 */
export function AnnouncementTicker() {
  const items = useCollection<Announcement>("announcements");
  const [marqueeRef, marqueeStyle] = useMarqueeSpeed(52);
  const [observerRef, onScreen] = usePauseOffscreen<HTMLDivElement>();
  if (!items.length) return null;

  const row = (ariaHidden: boolean) => (
    <div
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12"
    >
      {items.map((item) => (
        <span
          key={`${item.id}-${ariaHidden}`}
          className="flex min-w-[240px] items-center gap-2.5 whitespace-nowrap sm:min-w-[300px]"
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyber-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          {item.highlight ? (
            <span className="rounded-full bg-gradient-to-r from-brand-600 to-cyber-500 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              {item.highlight}
            </span>
          ) : null}
          <ContentIcon name={item.icon} className="hidden h-3.5 w-3.5 text-cyber-300 sm:block" />
          <span className="text-[11px] font-semibold tracking-wide text-slate-200 sm:text-xs">
            {item.text}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-[#04070f] py-2">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#04070f] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#04070f] to-transparent"
      />
      <div
        ref={(node) => {
          marqueeRef(node);
          observerRef(node);
        }}
        style={{ ...marqueeStyle, animationPlayState: onScreen ? undefined : "paused" }}
        className="ticker-track group"
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

/* ══════════════════════════════ gallery ══════════════════════════════ */

export function CampusGallery() {
  const t = useLabels();
  const photos = useCollection<GalleryPhoto>("gallery");
  const section = useSection("gallery");
  const [filter, setFilter] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const photo of photos) if (photo.category) set.add(photo.category);
    return ["All", ...Array.from(set)];
  }, [photos]);

  const visible = useMemo(
    () => (filter === "All" ? photos : photos.filter((photo) => photo.category === filter)),
    [photos, filter]
  );

  if (section.hidden || photos.length === 0) return null;

  return (
    <section
      id="gallery"
      className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20"
    >
      <div
        aria-hidden="true"
        className="grid-veil pointer-events-none absolute inset-x-4 top-8 -z-10 h-56 opacity-60 sm:inset-x-6"
      />
      <SectionHeading
        dark
        align="center"
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.description}
      />

      {categories.length > 2 ? (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {categories.map((category) => {
            const active = filter === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(category)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-bold transition-all",
                  active
                    ? "border-transparent bg-gradient-to-r from-brand-600 to-cyber-500 text-white shadow-[0_8px_24px_-10px_rgba(34,211,238,0.8)]"
                    : "border-white/12 bg-white/[0.04] text-slate-300 hover:border-cyber-300/50 hover:text-white"
                )}
              >
                {category === "All" ? t("gallery.photoLabel") : category}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((photo, index) => (
          <Reveal key={photo.id} delay={(index % 4) * 0.05}>
            <button
              type="button"
              onClick={() => setLightboxIndex(visible.indexOf(photo))}
              className={cn(
                "aurora-card sweep-card media-frame media-tone group relative block h-full w-full overflow-hidden rounded-2xl border border-white/10",
                index % 5 === 0 ? "aspect-[4/5]" : "aspect-[4/3]"
              )}
            >
              <img
                src={photo.image}
                alt={photo.alt || photo.title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#04070f] via-transparent to-transparent opacity-90"
              />
              <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-0.5 p-3 text-left">
                {photo.category ? (
                  <span className="rounded-full border border-white/15 bg-black/40 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-cyber-200 backdrop-blur">
                    {photo.category}
                  </span>
                ) : null}
                <span className="text-xs font-bold text-white sm:text-sm">{photo.title}</span>
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      <GalleryLightbox
        photos={visible}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />

    </section>
  );
}

/* ══════════════════════════════ partners ══════════════════════════════ */

/**
 * Deterministic colour pair per partner name. Placeholder partners ship without
 * a logo, so the tile falls back to a monogram — giving each one its own tint
 * keeps the wall from looking like eight copies of the same grey square.
 */
const MONOGRAM_TONES = [
  "from-sky-500/25 to-cyan-400/25 text-cyan-100 ring-cyan-300/30",
  "from-violet-500/25 to-fuchsia-400/25 text-fuchsia-100 ring-fuchsia-300/30",
  "from-emerald-500/25 to-teal-400/25 text-emerald-100 ring-emerald-300/30",
  "from-amber-500/25 to-orange-400/25 text-amber-100 ring-amber-300/30",
  "from-rose-500/25 to-pink-400/25 text-rose-100 ring-rose-300/30",
  "from-indigo-500/25 to-blue-400/25 text-indigo-100 ring-indigo-300/30",
];

function monogramTone(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 9973;
  return MONOGRAM_TONES[hash % MONOGRAM_TONES.length];
}


export function PartnersSection() {
  const partners = useCollection<Partner>("partners");
  const section = useSection("partners");
  const t = useLabels();
  const [marqueeRef, marqueeStyle] = useMarqueeSpeed(48);
  const [observerRef, onScreen] = usePauseOffscreen<HTMLDivElement>();
  if (section.hidden || partners.length === 0) return null;

  /** One logo tile: uploaded logo, or a clean monogram + name when there is none. */
  const tile = (partner: Partner, duplicate: boolean) => {
    const body = (
      <>
        {partner.logo ? (
          <img
            src={partner.logo}
            alt={duplicate ? "" : partner.name}
            loading="lazy"
            decoding="async"
            className="h-9 w-auto max-w-[132px] object-contain opacity-85 transition-opacity group-hover/tile:opacity-100"
          />
        ) : (
          <span className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-black ring-1",
                monogramTone(partner.name)
              )}
            >
              {partner.name.trim().charAt(0).toUpperCase()}
            </span>
            <span className="whitespace-nowrap text-sm font-extrabold text-slate-200">
              {partner.name}
            </span>
          </span>
        )}
        <span className="pointer-events-none absolute inset-x-0 -bottom-6 text-center text-[9px] font-bold uppercase tracking-[0.18em] text-cyber-300 opacity-0 transition-opacity group-hover/tile:opacity-100">
          {partner.kind}
        </span>
      </>
    );

    const className =
      "group/tile relative flex h-[74px] min-w-[168px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 transition-colors hover:border-cyber-300/45 hover:bg-white/[0.08]";

    return partner.link && !duplicate ? (
      <a
        key={`${partner.id}-${duplicate}`}
        href={partner.link}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={`${partner.name} — ${partner.kind}`}
      >
        {body}
      </a>
    ) : (
      <span key={`${partner.id}-${duplicate}`} className={className} aria-hidden={duplicate || undefined}>
        {body}
      </span>
    );
  };

  return (
    <section
      id="partners"
      className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16"
    >
      <SectionHeading
        dark
        align="center"
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.description}
      />

      {/* Scrolling company wall — the part the reference site leads with. */}
      <div className="relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#070d22]/60 py-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#070d22] to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#070d22] to-transparent"
        />
        <div
          ref={(node) => {
            marqueeRef(node);
            observerRef(node);
          }}
          style={{ ...marqueeStyle, animationPlayState: onScreen ? undefined : "paused" }}
          className="ticker-track"
        >
          <div className="flex shrink-0 items-center gap-3 pr-3">
            {partners.map((partner) => tile(partner, false))}
          </div>
          <div className="flex shrink-0 items-center gap-3 pr-3" aria-hidden="true">
            {partners.map((partner) => tile(partner, true))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((partner, index) => {
          const inner = (
            <>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1",
                    partner.logo
                      ? "border border-white/10 bg-white/[0.06]"
                      : `bg-gradient-to-br ${monogramTone(partner.name)}`
                  )}
                >
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <span className="text-sm font-black">
                      {partner.name.trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <div className="min-w-0">
                  {partner.kind ? (
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-cyber-300">
                      {partner.kind}
                    </p>
                  ) : null}
                  <p className="truncate text-sm font-extrabold text-white">{partner.name}</p>
                </div>
                {partner.link ? (
                  <ArrowUpRight
                    className="ml-auto h-4 w-4 shrink-0 text-slate-500 transition-colors group-hover:text-cyber-300"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
              {partner.description ? (
                <p className="mt-3 text-xs leading-relaxed text-slate-400">{partner.description}</p>
              ) : null}
            </>
          );

          return (
            <Reveal key={partner.id} delay={index * 0.05}>
              {partner.link ? (
                <a
                  href={partner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aurora-card group flex h-full flex-col rounded-2xl border border-white/10 bg-[#0a1230]/80 p-4 transition-colors hover:border-cyber-300/40 hover:bg-white/[0.05]"
                >
                  {inner}
                </a>
              ) : (
                <div className="aurora-card group flex h-full flex-col rounded-2xl border border-white/10 bg-[#0a1230]/80 p-4">
                  {inner}
                </div>
              )}
            </Reveal>
          );
        })}
      </div>

      <p className="mt-5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        {t("partners.note")}
      </p>
    </section>
  );
}

/* ══════════════════════════════ videos ══════════════════════════════ */

/** Accepts a full YouTube link or a bare id and returns just the id. */
function youtubeId(raw: string): string {
  const value = (raw || "").trim();
  if (!value) return "";
  const match = value.match(
    /(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/
  );
  if (match) return match[1];
  return /^[A-Za-z0-9_-]{11}$/.test(value) ? value : "";
}

function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function VideosSection() {
  const t = useLabels();
  const videos = useCollection<VideoItem>("videos");
  const section = useSection("videos");
  const settings = useSettings();
  const [playing, setPlaying] = useState<string | null>(null);
  const channel = settings.social.youtube;
  if (section.hidden || videos.length === 0) return null;

  return (
    <section
      id="videos"
      className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          dark
          align="left"
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />
        {channel ? (
          <a
            href={channel}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-xs font-bold text-white transition-colors hover:border-cyber-300/60 hover:bg-white/10"
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            {t("videos.viewMore")}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video, index) => {
          const id = youtubeId(video.youtubeId);
          const poster = video.thumbnail || (id ? youtubeThumb(id) : "");
          const active = playing === video.id;

          return (
            <Reveal key={video.id} delay={index * 0.06}>
              <article className="aurora-card group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a1230]/80">
                <div className="media-frame aspect-video w-full">
                  {active && id ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => (id ? setPlaying(video.id) : undefined)}
                      disabled={!id}
                      aria-label={
                        id
                          ? `${t("videos.play")} ${video.title}`
                          : `${video.title} — ${t("videos.comingSoon")}`
                      }
                      className="media-tone group/play relative block h-full w-full"
                    >
                      {poster ? (
                        <img
                          src={poster}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="block h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.25),transparent_60%),linear-gradient(135deg,#070d22,#0b1433)]"
                        />
                      )}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-[#04070f] via-[#04070f]/20 to-transparent"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span
                          className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur transition-all",
                            id
                              ? "group-hover/play:scale-110 group-hover/play:border-cyber-300/70 group-hover/play:bg-cyber-500/30"
                              : "opacity-60"
                          )}
                        >
                          <Play className="ml-0.5 h-6 w-6" aria-hidden="true" />
                        </span>
                      </span>
                      {video.duration ? (
                        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {video.duration}
                        </span>
                      ) : null}
                    </button>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-extrabold text-white">{video.title}</h3>
                  {video.description ? (
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                      {video.description}
                    </p>
                  ) : null}
                  {!id ? (
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {t("videos.comingSoon")}
                    </p>
                  ) : null}
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ══════════════════════════════ testimonials ══════════════════════════════ */

export function TestimonialsSection() {
  const t = useLabels();
  const testimonials = useCollection<Testimonial>("testimonials");
  const section = useSection("testimonials");
  const [playing, setPlaying] = useState<string | null>(null);
  if (section.hidden || testimonials.length === 0) return null;

  return (
    <section
      id="testimonials"
      className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16"
    >
      <SectionHeading
        dark
        align="center"
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.description}
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => {
          const id = youtubeId(testimonial.youtubeId);
          const rating = Math.max(0, Math.min(5, Number(testimonial.rating) || 0));
          const active = playing === testimonial.id;

          return (
            <Reveal key={testimonial.id} delay={index * 0.06}>
              <figure className="aurora-card flex h-full flex-col rounded-2xl border border-white/10 bg-[#0a1230]/80 p-5">
                {active && id ? (
                  <div className="mb-4 aspect-video w-full overflow-hidden rounded-xl">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
                      title={`${testimonial.name} — student testimonial`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                ) : null}

                {rating > 0 ? (
                  <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className={cn(
                          "h-3.5 w-3.5",
                          starIndex < rating
                            ? "fill-amber-300 text-amber-300"
                            : "text-slate-600"
                        )}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                ) : (
                  <Quote className="h-6 w-6 text-cyber-300/70" aria-hidden="true" />
                )}

                {testimonial.quote ? (
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-200">
                    “{testimonial.quote}”
                  </blockquote>
                ) : null}

                {id && !active ? (
                  <button
                    type="button"
                    onClick={() => setPlaying(testimonial.id)}
                    className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-cyber-300/40 bg-cyber-500/10 px-3.5 py-1.5 text-[11px] font-bold text-cyber-200 transition-colors hover:bg-cyber-500/20"
                  >
                    <Play className="h-3 w-3" aria-hidden="true" />
                    {t("testimonials.watch")}
                  </button>
                ) : null}

                <figcaption className="mt-4 flex items-center gap-3 border-t border-white/10 pt-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-600 to-cyber-500 text-xs font-black text-white">
                    {testimonial.photo ? (
                      <img
                        src={testimonial.photo}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      testimonial.name.trim().charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">
                      {testimonial.name}
                    </span>
                    {testimonial.role ? (
                      <span className="block truncate text-xs text-slate-400">{testimonial.role}</span>
                    ) : null}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ══════════════════════════════ brochure ══════════════════════════════ */

export function BrochureSection() {
  const t = useLabels();
  const section = useSection("brochure");
  const copy = useSiteContent().pages.home;
  const settings = useSettings();
  const navigate = useSiteStore((s) => s.navigate);

  const hasContent = Boolean(copy.brochureTitle || copy.brochureText || copy.brochureUrl);
  if (section.hidden || !hasContent) return null;

  const points = copy.brochurePoints ?? [];

  return (
    <section
      id="brochure"
      aria-labelledby="brochure-heading"
      className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16"
    >
      <div className="aurora-card grid items-center gap-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1738] via-[#081128] to-[#070d22] p-6 sm:p-9 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-cyber-300">
            {section.eyebrow}
          </p>
          <h2
            id="brochure-heading"
            className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-white text-balance sm:text-3xl"
          >
            {copy.brochureTitle || section.title}
          </h2>
          {copy.brochureText ? (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
              {copy.brochureText}
            </p>
          ) : null}

          {points.length ? (
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {points.filter(Boolean).map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-slate-200">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyber-300" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {copy.brochureUrl ? (
              <a
                href={copy.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-futur inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-bold text-white"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {copy.brochureCta || "Download the brochure"}
              </a>
            ) : (
              <Button
                onClick={() => navigate("contact")}
                className="btn-futur h-11 rounded-full px-6 text-sm font-bold text-white"
              >
                {t("brochure.request")}
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Button>
            )}
            <a
              href={whatsappUrl(settings, `Hi ${settings.name}, please share your course brochure.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-bold text-white transition-colors hover:border-cyber-300/60 hover:bg-white/10"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {t("brochure.whatsapp")}
            </a>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          {copy.brochureImage ? (
            <img
              src={copy.brochureImage}
              alt={t("brochure.coverAlt")}
              loading="lazy"
              decoding="async"
              className="max-h-72 w-auto rounded-xl border border-white/10 shadow-[0_24px_60px_-24px_rgba(2,8,23,0.9)]"
            />
          ) : (
            <div className="relative w-full max-w-[260px] rotate-2 rounded-2xl border border-white/15 bg-white/[0.06] p-5 shadow-[0_24px_60px_-24px_rgba(2,8,23,0.9)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyber-300">
                  {t("brochure.badge")}
                </span>
                <Download className="h-4 w-4 text-cyber-300" aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm font-extrabold leading-tight text-white">
                {settings.shortName || settings.name}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                {t("brochure.coverLines")}
              </p>
              <div aria-hidden="true" className="mt-4 space-y-1.5">
                {[90, 76, 84, 62, 70].map((width, index) => (
                  <span
                    key={index}
                    className="block h-1.5 rounded-full bg-white/10"
                    style={{ width: `${width}%` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════ mobile app ══════════════════════════════ */

export function AppSection() {
  const t = useLabels();
  const section = useSection("app");
  const copy = useSiteContent().pages.home;
  const settings = useSettings();
  const navigate = useSiteStore((s) => s.navigate);

  const hasContent = Boolean(copy.appTitle || copy.appText || copy.appUrl);
  if (section.hidden || !hasContent) return null;

  return (
    <section
      id="app"
      aria-labelledby="app-heading"
      className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16"
    >
      <div className="aurora-card grid items-center gap-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0a1230]/80 p-6 sm:p-9 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-cyber-300">
            {section.eyebrow}
          </p>
          <h2
            id="app-heading"
            className="mt-3 flex items-center gap-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
          >
            <Smartphone className="h-6 w-6 text-cyber-300" aria-hidden="true" />
            {copy.appTitle || section.title}
          </h2>
          {copy.appText ? (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">{copy.appText}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {copy.appUrl ? (
              <a
                href={copy.appUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-futur inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-bold text-white"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {copy.appCta || "Get the app"}
              </a>
            ) : (
              <Button
                onClick={() => navigate("contact")}
                className="btn-futur h-11 rounded-full px-6 text-sm font-bold text-white"
              >
                {t("app.ask")}
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Button>
            )}
            <a
              href={whatsappUrl(settings, `Hi ${settings.name}, how do I get the learning app?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-bold text-white transition-colors hover:border-cyber-300/60 hover:bg-white/10"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {t("app.whatsapp")}
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-[190px]">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#050914] p-2 shadow-[0_28px_60px_-28px_rgba(34,211,238,0.55)]">
            <div className="overflow-hidden rounded-[1.5rem] bg-[#070d22]">
              {copy.appImage ? (
                <img
                  src={copy.appImage}
                  alt={t("app.imageAlt")}
                  loading="lazy"
                  decoding="async"
                  className="h-[300px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[300px] w-full flex-col justify-between bg-[radial-gradient(circle_at_30%_15%,rgba(34,211,238,0.28),transparent_60%),linear-gradient(160deg,#0a1230,#050914)] p-4">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-cyber-300">
                      {settings.shortName || "Yantrix"}
                    </p>
                    <p className="mt-1 text-xs font-bold text-white">{t("app.previewTitle")}</p>
                  </div>
                  <div className="space-y-2">
                    {[t("app.previewRow1"), t("app.previewRow2"), t("app.previewRow3"), t("app.previewRow4")].map(
                      (row) => (
                        <div
                          key={row}
                          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-cyber-300" />
                          <span className="text-[10px] font-semibold text-slate-200">{row}</span>
                        </div>
                      )
                    )}
                  </div>
                  <p className="text-[9px] text-slate-500">{t("app.previewNote")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════ centres ══════════════════════════════ */

export function CentresSection() {
  const t = useLabels();
  const centres = useCollection<Centre>("centres");
  const section = useSection("centres");
  if (section.hidden || centres.length === 0) return null;

  return (
    <section
      id="centres"
      className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16"
    >
      <SectionHeading
        dark
        align="center"
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.description}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {centres.map((centre, index) => (
          <Reveal key={centre.id} delay={index * 0.05}>
            <article className="aurora-card group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a1230]/80">
              {centre.image ? (
                <div className="media-frame media-tone aspect-[16/9] w-full">
                  <img
                    src={centre.image}
                    alt={`${centre.name} ${t("centres.imageAlt")}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div
                  aria-hidden="true"
                  className="flex aspect-[16/9] w-full items-center justify-center bg-[radial-gradient(circle_at_30%_25%,rgba(34,211,238,0.22),transparent_60%),linear-gradient(135deg,#070d22,#0b1433)]"
                >
                  <Building2 className="h-8 w-8 text-cyber-300/80" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-extrabold text-white">{centre.name}</h3>
                {centre.address ? (
                  <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-slate-400">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyber-300" aria-hidden="true" />
                    {centre.address}
                  </p>
                ) : null}
                {centre.hours ? (
                  <p className="mt-2 flex items-start gap-2 text-xs text-slate-400">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyber-300" aria-hidden="true" />
                    {centre.hours}
                  </p>
                ) : null}

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                  {centre.phone ? (
                    <a
                      href={`tel:${centre.phone.replace(/[^\d+]/g, "")}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 text-xs font-bold text-white transition-colors hover:border-cyber-300/60 hover:bg-white/10"
                    >
                      <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                      {centre.phone}
                    </a>
                  ) : null}
                  {centre.mapLink ? (
                    <a
                      href={centre.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-cyber-300/40 bg-cyber-500/10 px-3.5 text-xs font-bold text-cyber-200 transition-colors hover:bg-cyber-500/20"
                    >
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {t("centres.call")}
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
