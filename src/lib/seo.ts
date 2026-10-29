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

/** Simple on-page SEO health checks shown in the admin SEO screen. */
export function seoAudit(content: SiteContent) {
  const { settings, seo } = content;
  const checks: { label: string; ok: boolean; hint: string }[] = [];
  const pages = Object.entries(seo.pages) as [SiteView, typeof seo.pages.home][];

  for (const [view, page] of pages) {
    checks.push({
      label: `${view}: title length`,
      ok: page.title.length >= 30 && page.title.length <= 70,
      hint: `${page.title.length} characters (aim for 30–70)`,
    });
    checks.push({
      label: `${view}: meta description length`,
      ok: page.description.length >= 70 && page.description.length <= 170,
      hint: `${page.description.length} characters (aim for 70–170)`,
    });
    checks.push({
      label: `${view}: not set to noindex`,
      ok: !page.noindex,
      hint: page.noindex ? "This page is hidden from search engines" : "Indexable",
    });
  }

  checks.push({
    label: "Site URL configured",
    ok: /^https?:\/\//.test(settings.url),
    hint: settings.url,
  });
  checks.push({
    label: "Google Search Console verification",
    ok: Boolean(seo.global.googleSiteVerification),
    hint: seo.global.googleSiteVerification ? "Configured" : "Add the verification token in SEO settings",
  });
  checks.push({
    label: "Open Graph image",
    ok: Boolean(seo.global.ogImage),
    hint: seo.global.ogImage || "Add a social share image",
  });
  checks.push({
    label: "Analytics connected",
    ok: Boolean(seo.global.gaMeasurementId || seo.global.clarityId),
    hint: seo.global.gaMeasurementId || seo.global.clarityId || "No analytics ID yet",
  });
  checks.push({
    label: "FAQ schema (AEO)",
    ok: seo.aeo.enableFaqSchema && content.collections.faqs.some((f) => f.active !== false),
    hint: "Structured Q&A helps AI answer engines quote your site",
  });
  checks.push({
    label: "Course schema",
    ok: seo.aeo.enableCourseSchema && content.collections.courses.some((c) => c.active !== false),
    hint: "Enables course rich results",
  });
  checks.push({
    label: "llms.txt for AI crawlers",
    ok: seo.aeo.llmsTxtEnabled,
    hint: "/llms.txt",
  });
  checks.push({
    label: "Street address + locality",
    ok: Boolean(settings.contact.address && settings.contact.city),
    hint: "Local SEO / GEO needs a complete address",
  });
  checks.push({
    label: "Geo coordinates",
    ok: Boolean(seo.global.geoLatitude && seo.global.geoLongitude),
    hint: "Used by local search and map results",
  });

  return checks;
}
