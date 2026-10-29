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

import type { SiteContent, SiteView, Course, Faq, HeroSlide } from "@/lib/content/types";
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

/* ─────────────────────────── JSON-LD ─────────────────────────── */

export function buildJsonLd(content: SiteContent) {
  const { settings, seo } = content;
  const { global, aeo } = seo;
  const url = settings.url.replace(/\/$/, "");
  const courses = active(content.collections.courses) as unknown as Course[];
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

  if (aeo.enableCourseSchema && courses.length > 0) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `IT Courses at ${settings.name}`,
      itemListElement: courses.map((course, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Course",
          name: course.title,
          description: course.description,
          url: absoluteUrl(content, `${content.seo.pages.courses.path}#course-grid`),
          provider: {
            "@type": "EducationalOrganization",
            name: settings.name,
            url: `${url}/`,
          },
          offers: course.fee
            ? {
                "@type": "Offer",
                category: course.fee,
                availability: "https://schema.org/InStock",
                url: absoluteUrl(content, content.seo.pages.contact.path),
              }
            : undefined,
          hasCourseInstance: (course.modes ?? []).map((mode) => ({
            "@type": "CourseInstance",
            courseMode: mode === "Online" ? "Online" : "Onsite",
            courseWorkload: course.duration || undefined,
          })),
        },
      })),
    });
  }

  if (aeo.enableFaqSchema && faqs.length > 0) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  if (aeo.enableBreadcrumbSchema) {
    const views: SiteView[] = ["home", "courses", "about", "contact"];
    graphs.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: views.map((view, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name:
          view === "home"
            ? "Home"
            : content.seo.pages[view].title.split(/[—|·-]/)[0].trim(),
        item: absoluteUrl(content, content.seo.pages[view].path),
      })),
    });
  }

  return graphs;
}

/* ─────────────────────────── llms.txt (AEO / GEO) ─────────────────────────── */

export function buildLlmsTxt(content: SiteContent): string {
  const { settings, seo } = content;
  const { aeo, global, pages } = seo;
  const courses = active(content.collections.courses) as unknown as Course[];
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
      lines.push(`- **${course.title}** — ${course.description}`);
      lines.push(
        `  Duration: ${course.duration || "on enquiry"} · Mode: ${modes || "Online & Offline"}${
          course.level ? ` · Level: ${course.level}` : ""
        }`
      );
    }
    lines.push("");
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
