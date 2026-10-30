/**
 * SEO / AEO / GEO helpers.
 *
 * Everything here is generated from the admin-editable content document, so
 * changing a title, FAQ or course in /admin immediately updates:
 *   • <title> / meta description / OpenGraph / Twitter cards
 *   • JSON-LD structured data (Organization, LocalBusiness, WebSite, Course,
 *     FAQPage, BreadcrumbList) — used by Google rich results and AI answer
 *     engines (AEO)
 *   • sitemap.xml, robots.txt, llms.txt and web app manifest
 */

import type { SiteContent, SiteView, Course, Faq, HeroSlide, Trainer } from "@/lib/content/types";
import { fullAddress } from "@/lib/content/helpers";

const active = <T extends { active: boolean; sortOrder: number }>(items: T[]): T[] =>
  items.filter((item) => item.active !== false).sort((a, b) => a.sortOrder - b.sortOrder);

export function absoluteUrl(content: SiteContent, pathname: string): string {
  const base = content.settings.url.replace(/\/$/, "");
  if (!pathname || pathname === "/") return `${base}/`;
  return `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

/** Compose a document title using the admin-configured template. */
export function pageTitle(content: SiteContent, view: SiteView): string {
  const page = content.seo.pages[view];
  const template = content.seo.global.titleTemplate || "%s";
  if (view === "home") return page.title || content.seo.global.defaultTitle;
  return template.includes("%s") ? template.replace("%s", page.title) : page.title;
}

export function pageDescription(content: SiteContent, view: SiteView): string {
  return content.seo.pages[view].description || content.seo.global.defaultDescription;
}

/* ─────────────────────────── courses ─────────────────────────── */

export function activeCourses(content: SiteContent): Course[] {
  return active(content.collections.courses) as unknown as Course[];
}

export function findCourse(content: SiteContent, slug: string): Course | undefined {
  return activeCourses(content).find((course) => course.slug === slug);
}

export function coursePath(course: Pick<Course, "slug">): string {
  return `/courses/${course.slug}`;
}

/** Search-friendly course title, e.g. "Python Programming Course in Pune". */
export function courseHeadline(content: SiteContent, course: Course): string {
  const city = content.settings.contact.city;
  const base = /\b(course|training|program)\b/i.test(course.title) ? course.title : `${course.title} Course`;
  return city ? `${base} in ${city}` : base;
}

/**
 * Question/answer pairs for a course page, built only from the course's own
 * fields (no invented claims). Shown on the page and used as FAQPage schema —
 * the "answer-first" format answer engines quote.
 */
export function courseFaqs(content: SiteContent, course: Course): { question: string; answer: string }[] {
  const { settings } = content;
  const city = settings.contact.city;
  const modes = (course.modes ?? []).join(" and ");
  const list: { question: string; answer: string }[] = [
    {
      question: `What is the ${course.title} course at ${settings.name}?`,
      answer: `${course.description}${course.highlights?.length ? ` You will cover ${course.highlights.slice(0, 4).join(", ")}.` : ""}`,
    },
  ];
  if (course.duration) {
    list.push({
      question: `How long is the ${course.title} course?`,
      answer: `The ${course.title} course runs for ${course.duration}. Exact batch timings are shared when you enquire.`,
    });
  }
  list.push({
    question: `What is the fee for the ${course.title} course${city ? ` in ${city}` : ""}?`,
    answer: course.fee && !/request|enquir/i.test(course.fee)
      ? `The fee for ${course.title} is ${course.fee}. Contact ${settings.name} for current offers.`
      : `The fee depends on the batch and mode. Call ${settings.contact.phone} or message on WhatsApp for the current fee and any offers.`,
  });
  if (modes) {
    list.push({
      question: `Is the ${course.title} course available online or offline?`,
      answer: `${course.title} is available ${modes === "Online and Offline" || modes === "Offline and Online" ? "both online and offline (classroom)" : modes.toLowerCase()}${city ? ` — classroom batches are held in ${city}` : ""}.`,
    });
  }
  if (course.level) {
    list.push({
      question: `Who can join the ${course.title} course?`,
      answer: `The course is designed for the ${course.level.toLowerCase()} level. ${settings.name} helps you check whether it fits your background before you enrol.`,
    });
  }
  return list;
}

/* ─────────────────────────── JSON-LD ─────────────────────────── */

const VIEW_LABEL: Record<SiteView, string> = {
  home: "Home",
  courses: "Courses",
  about: "About Us",
  contact: "Contact Us",
};

/**
 * Structured data for one page. Site-wide entities (organisation, local
 * business, website) are always included; page-specific ones only where the
 * matching content is visible, as Google requires.
 */
export function buildJsonLd(
  content: SiteContent,
  { view = "home", course }: { view?: SiteView; course?: Course } = {}
) {
  const { settings, seo } = content;
  const { global, aeo } = seo;
  const url = settings.url.replace(/\/$/, "");
  const courses = activeCourses(content);
  const faqs = active(content.collections.faqs) as unknown as Faq[];
  const orgId = `${url}/#organization`;
  const siteId = `${url}/#website`;
  const localId = `${url}/#localbusiness`;

  const graphs: Record<string, unknown>[] = [];

  const address = {
    "@type": "PostalAddress",
    streetAddress: [settings.contact.address, settings.contact.addressLine2]
      .filter(Boolean)
      .join(", "),
    addressLocality: settings.contact.city,
    addressRegion: settings.contact.state,
    postalCode: settings.contact.postalCode,
    addressCountry: settings.contact.country || "IN",
  };

  const sameAs = Object.values(settings.social).filter(Boolean);

  if (aeo.enableOrganizationSchema) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": global.organizationType || "EducationalOrganization",
      "@id": orgId,
      name: settings.name,
      alternateName: settings.shortName,
      url: `${url}/`,
      description: settings.positioning,
      slogan: settings.tagline,
      foundingDate: String(settings.foundedYear),
      email: settings.contact.email,
      telephone: settings.contact.phone,
      logo: absoluteUrl(content, global.ogImage || "/logo.svg"),
      image: absoluteUrl(content, global.ogImage || "/images/hero-1.png"),
      address,
      areaServed: global.areaServed,
      sameAs: sameAs.length > 0 ? sameAs : undefined,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: settings.contact.phone,
        email: settings.contact.email,
        contactType: "customer service",
        availableLanguage: global.languages,
      },
      knowsAbout: courses.map((course) => course.title),
    });
  }

  if (aeo.enableLocalBusinessSchema) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": ["EducationalOrganization", "LocalBusiness"],
      "@id": localId,
      name: settings.name,
      url: `${url}/`,
      telephone: settings.contact.phone,
      email: settings.contact.email,
      priceRange: global.priceRange,
      image: absoluteUrl(content, global.ogImage || "/images/hero-1.png"),
      address,
      geo:
        global.geoLatitude && global.geoLongitude
          ? {
              "@type": "GeoCoordinates",
              latitude: Number(global.geoLatitude),
              longitude: Number(global.geoLongitude),
            }
          : undefined,
      openingHours: settings.contact.hours,
      map: settings.contact.mapLink || undefined,
      areaServed: global.areaServed,
    });
  }

  if (aeo.enableWebsiteSchema) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": siteId,
      name: settings.name,
      url: `${url}/`,
      inLanguage: global.locale?.replace("_", "-") ?? "en-IN",
      publisher: { "@id": orgId },
      about: { "@id": orgId },
    });
  }

  const courseSchema = (c: Course) => ({
    "@type": "Course",
    "@id": `${absoluteUrl(content, coursePath(c))}#course`,
    name: c.title,
    description: c.description,
    url: absoluteUrl(content, coursePath(c)),
    inLanguage: global.locale?.replace("_", "-") ?? "en-IN",
    educationalLevel: c.level || undefined,
    teaches: c.highlights?.length ? c.highlights : undefined,
    timeRequired: c.duration || undefined,
    provider: { "@id": orgId, "@type": "EducationalOrganization", name: settings.name, url: `${url}/` },
    offers: {
      "@type": "Offer",
      category: c.fee && !/request|enquir/i.test(c.fee) ? "Paid" : "Paid — fee on enquiry",
      description: c.fee || undefined,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(content, coursePath(c)),
    },
    hasCourseInstance: (c.modes?.length ? c.modes : ["Online", "Offline"]).map((mode) => ({
      "@type": "CourseInstance",
      courseMode: /online/i.test(mode) ? "Online" : "Onsite",
      courseWorkload: c.duration || undefined,
      location: /online/i.test(mode) ? undefined : address,
    })),
  });

  if (aeo.enableCourseSchema && courses.length > 0 && !course && (view === "home" || view === "courses")) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `IT Courses at ${settings.name}`,
      itemListElement: courses.map((c, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(content, coursePath(c)),
        item: courseSchema(c),
      })),
    });
  }

  if (course && aeo.enableCourseSchema) {
    graphs.push({ "@context": "https://schema.org", ...courseSchema(course) });
  }

  // Trainers as Person entities (expertise signals) where the trainer section is shown
  const trainers = active(content.collections.trainers ?? []) as unknown as Trainer[];
  if (!course && (view === "home" || view === "about") && !content.sections.trainers?.hidden && trainers.length > 0) {
    graphs.push({
      "@context": "https://schema.org",
      "@graph": trainers.map((t) => ({
        "@type": "Person",
        name: t.name,
        jobTitle: t.designation || undefined,
        description: t.bio || undefined,
        image: t.photo ? absoluteUrl(content, t.photo) : undefined,
        knowsAbout: [...(t.skills ?? []), ...(t.industryExperience ?? [])].filter(Boolean),
        hasCredential: (t.education ?? []).filter(Boolean).map((e) => ({ "@type": "EducationalOccupationalCredential", name: e })),
        sameAs: t.linkedin ? [t.linkedin] : undefined,
        worksFor: { "@id": orgId },
      })),
    });
  }

  // FAQ markup only where the questions are visible: home FAQ section, or a course page's Q&A
  const pageFaqs = course
    ? courseFaqs(content, course)
    : view === "home"
      ? faqs.map((f) => ({ question: f.question, answer: f.answer }))
      : [];
  if (aeo.enableFaqSchema && pageFaqs.length > 0) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: pageFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  // WebPage with speakable parts (voice assistants read the title + answer-first summary)
  const pagePath = course ? coursePath(course) : content.seo.pages[view].path;
  graphs.push({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(content, pagePath)}#webpage`,
    url: absoluteUrl(content, pagePath),
    name: course ? courseHeadline(content, course) : pageTitle(content, view),
    description: course ? course.description : pageDescription(content, view),
    isPartOf: { "@id": siteId },
    about: { "@id": orgId },
    inLanguage: global.locale?.replace("_", "-") ?? "en-IN",
    dateModified: content.updatedAt,
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "[data-speakable]"] },
  });

  if (aeo.enableBreadcrumbSchema && (view !== "home" || course)) {
    const trail = [{ name: "Home", path: "/" }];
    if (view !== "home") trail.push({ name: VIEW_LABEL[view], path: content.seo.pages[view].path });
    if (course) trail.push({ name: course.title, path: coursePath(course) });
    graphs.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: trail.map((step, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: step.name,
        item: absoluteUrl(content, step.path),
      })),
    });
  }

  return graphs;
}

/* ─────────────────────────── llms.txt (AEO / GEO) ─────────────────────────── */

/**
 * llms.txt (summary) or llms-full.txt (`full: true`, adds every course's
 * syllabus highlights and Q&A) for AI assistants and answer engines.
 */
export function buildLlmsTxt(content: SiteContent, { full = false }: { full?: boolean } = {}): string {
  const { settings, seo } = content;
  const { aeo, global, pages } = seo;
  const courses = activeCourses(content);
  const faqs = active(content.collections.faqs) as unknown as Faq[];
  const slides = active(content.collections.heroSlides) as unknown as HeroSlide[];
  const views: SiteView[] = ["home", "courses", "about", "contact"];

  const lines: string[] = [];
  lines.push(`# ${settings.name}`);
  lines.push("");
  lines.push(`> ${aeo.llmsIntro || settings.positioning}`);
  lines.push("");
  lines.push(`Website: ${settings.url}`);
  lines.push(`Phone: ${settings.contact.phone}`);
  lines.push(`Email: ${settings.contact.email}`);
  lines.push(`Address: ${fullAddress(settings.contact)}, ${settings.contact.country}`);
  lines.push(`Hours: ${settings.contact.hours}`);
  lines.push("");

  if (aeo.keyFacts.length > 0) {
    lines.push("## Key facts");
    lines.push("");
    for (const fact of aeo.keyFacts) {
      if (fact.label || fact.value) lines.push(`- **${fact.label}:** ${fact.value}`);
    }
    lines.push("");
  }

  if (courses.length > 0) {
    lines.push("## Courses");
    lines.push("");
    for (const course of courses) {
      const modes = (course.modes ?? []).join(" & ");
      lines.push(`- [${courseHeadline(content, course)}](${absoluteUrl(content, coursePath(course))}) — ${course.description}`);
      lines.push(
        `  Duration: ${course.duration || "on enquiry"} · Mode: ${modes || "Online & Offline"}${
          course.level ? ` · Level: ${course.level}` : ""
        }${course.fee ? ` · Fee: ${course.fee}` : ""}`
      );
      if (full && course.highlights?.length) {
        lines.push(`  Topics: ${course.highlights.join("; ")}`);
      }
    }
    lines.push("");
  }

  if (full) {
    for (const course of courses) {
      lines.push(`## ${courseHeadline(content, course)}`);
      lines.push("");
      for (const qa of courseFaqs(content, course)) {
        lines.push(`### ${qa.question}`);
        lines.push(qa.answer);
        lines.push("");
      }
    }
  }

  if (faqs.length > 0) {
    lines.push("## Frequently asked questions");
    lines.push("");
    for (const faq of faqs) {
      lines.push(`### ${faq.question}`);
      lines.push(faq.answer);
      lines.push("");
    }
  }

  lines.push("## Pages");
  lines.push("");
  for (const view of views) {
    lines.push(`- [${pages[view].title}](${absoluteUrl(content, pages[view].path)}): ${pageDescription(content, view)}`);
  }
  if (!full && aeo.llmsTxtEnabled) {
    lines.push(`- [Full details for AI assistants](${absoluteUrl(content, "/llms-full.txt")}): every course with topics and Q&A`);
  }
  lines.push("");

  lines.push("## Contact");
  lines.push("");
  lines.push(
    `Call or WhatsApp ${settings.contact.phone}, or email ${settings.contact.email}. Enquiries are usually answered within 24 hours (Mon–Sat).`
  );
  lines.push("");

  if (slides.length > 0) {
    lines.push("## Summary for AI assistants");
    lines.push("");
    lines.push(aeo.citationSummary || settings.positioning);
    lines.push("");
  }

  return lines.join("\n");
}

export type AuditLevel = "ok" | "warn" | "fail";

export interface AuditCheck {
  label: string;
  /** true when the check passes ("ok" or an acceptable "warn") */
  ok: boolean;
  level: AuditLevel;
  hint: string;
}

/**
 * On-page SEO health checks shown in the admin panel.
 *
 * Title/description lengths follow Google's display guidance: longer text is
 * still indexed, it is only truncated in results, so it is reported as a
 * warning rather than a failure.
 */
export function seoAudit(content: SiteContent) {
  const { settings, seo } = content;
  const checks: AuditCheck[] = [];

  const push = (label: string, level: AuditLevel, hint: string) =>
    checks.push({ label, ok: level !== "fail", level, hint });
  const pages = Object.entries(seo.pages) as [SiteView, typeof seo.pages.home][];

  for (const [view, page] of pages) {
    const titleLength = page.title.length;
    push(
      `${view}: title length`,
      titleLength < 15
        ? "fail"
        : titleLength <= 65
          ? "ok"
          : titleLength <= 120
            ? "warn"
            : "fail",
      `${titleLength} characters — ${titleLength > 65 ? "long titles get truncated in search results" : "ideal range is 30–65"}`
    );

    const descriptionLength = page.description.length;
    push(
      `${view}: meta description length`,
      descriptionLength < 50
        ? "fail"
        : descriptionLength <= 160
          ? "ok"
          : descriptionLength <= 320
            ? "warn"
            : "fail",
      `${descriptionLength} characters — ${descriptionLength > 160 ? "descriptions over 160 characters are cut off" : "ideal range is 70–160"}`
    );

    push(
      `${view}: indexable`,
      page.noindex ? "fail" : "ok",
      page.noindex ? "This page is hidden from search engines (noindex)" : "Indexable"
    );
  }

  push(
    "Site URL configured",
    /^https?:\/\//.test(settings.url) ? "ok" : "fail",
    settings.url
  );
  push(
    "Google Search Console verification",
    seo.global.googleSiteVerification ? "ok" : "warn",
    seo.global.googleSiteVerification ? "Configured" : "Add the verification token in SEO settings"
  );
  push(
    "Open Graph image",
    seo.global.ogImage ? "ok" : "fail",
    seo.global.ogImage || "Add a social share image"
  );
  push(
    "Analytics connected",
    seo.global.gaMeasurementId || seo.global.clarityId ? "ok" : "warn",
    seo.global.gaMeasurementId || seo.global.clarityId || "No analytics ID yet"
  );
  push(
    "FAQ schema (AEO)",
    seo.aeo.enableFaqSchema && content.collections.faqs.some((f) => f.active !== false) ? "ok" : "fail",
    "Structured Q&A helps AI answer engines quote your site"
  );
  push(
    "Course schema",
    seo.aeo.enableCourseSchema && content.collections.courses.some((c) => c.active !== false)
      ? "ok"
      : "fail",
    "Enables course rich results"
  );
  push("llms.txt for AI crawlers", seo.aeo.llmsTxtEnabled ? "ok" : "warn", "/llms.txt");
  push(
    "Street address + locality",
    settings.contact.address && settings.contact.city ? "ok" : "fail",
    "Local SEO / GEO needs a complete address"
  );
  push(
    "Geo coordinates",
    seo.global.geoLatitude && seo.global.geoLongitude ? "ok" : "warn",
    "Used by local search and map results"
  );

  return checks;
}
