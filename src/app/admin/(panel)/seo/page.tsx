import Link from "next/link";
import { CheckCircle2, ExternalLink, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { SchemaForm } from "@/components/admin/schema-form";
import { getContent } from "@/lib/content/store";
import { seoAudit } from "@/lib/seo";
import type { SiteView } from "@/lib/content/types";

export const dynamic = "force-dynamic";

const VIEWS: SiteView[] = ["home", "courses", "about", "contact"];

export default async function SeoAdminPage() {
  const content = await getContent();
  const audit = seoAudit(content);
  const base = content.settings.url.replace(/\/$/, "");

  return (
    <div className="space-y-8">
      <PageHeader
        title="SEO · AEO · GEO"
        description="Search engine optimisation, Answer Engine Optimisation and Generative Engine Optimisation — all generated from the values below."
      >
        <Link
          href="/sitemap.xml"
          target="_blank"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          sitemap.xml <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/robots.txt"
          target="_blank"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          robots.txt <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/llms.txt"
          target="_blank"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          llms.txt <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </PageHeader>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-ink">SEO health checklist</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {audit.filter((check) => check.level === "ok").length} passing ·{" "}
          {audit.filter((check) => check.level === "warn").length} recommended ·{" "}
          {audit.filter((check) => check.level === "fail").length} to fix
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {audit.map((check) => (
            <li key={check.label} className="flex items-start gap-2 text-sm">
              {check.level === "ok" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <TriangleAlert
                  className={
                    check.level === "fail"
                      ? "mt-0.5 h-4 w-4 shrink-0 text-destructive"
                      : "mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                  }
                />
              )}
              <span>
                <strong
                  className={
                    check.level === "ok"
                      ? "font-semibold text-ink"
                      : check.level === "fail"
                        ? "font-semibold text-destructive"
                        : "font-semibold text-amber-700"
                  }
                >
                  {check.label}
                </strong>
                <span className="block text-xs text-muted-foreground">{check.hint}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <SchemaForm
        op="updateSeo"
        initial={content.seo as unknown as Record<string, unknown>}
        intro={`Structured data is emitted automatically for: organisation, local business, website, courses, FAQs and breadcrumbs. URLs resolve against ${base}.`}
        groups={[
          {
            title: "Global SEO",
            description: "Defaults used across the site and in search results.",
            fields: [
              { name: "global.defaultTitle", label: "Default title", span: 2 },
              {
                name: "global.titleTemplate",
                label: "Title template",
                help: "Use %s where the page title should go.",
              },
              { name: "global.locale", label: "Locale", placeholder: "en_IN" },
              {
                name: "global.defaultDescription",
                label: "Default meta description",
                type: "textarea",
              },
              { name: "global.keywords", label: "Site keywords", type: "stringList" },
              { name: "global.ogImage", label: "Social share image", placeholder: "/images/hero-1.png" },
              { name: "global.twitterHandle", label: "X / Twitter handle", placeholder: "@yantrix" },
              { name: "global.themeColor", label: "Browser theme colour", placeholder: "#1e40af" },
              { name: "global.robotsIndex", label: "Allow search indexing", type: "boolean" },
              { name: "global.robotsFollow", label: "Allow link following", type: "boolean" },
              { name: "global.googleSiteVerification", label: "Google Search Console token" },
              { name: "global.bingSiteVerification", label: "Bing verification token" },
              { name: "global.gaMeasurementId", label: "Google Analytics ID", placeholder: "G-XXXXXXX" },
              { name: "global.clarityId", label: "Microsoft Clarity ID" },
            ],
          },
          {
            title: "Local SEO / GEO",
            description: "Used for map results and generative engine answers about your location.",
            fields: [
              {
                name: "global.organizationType",
                label: "Schema.org organisation type",
                placeholder: "EducationalOrganization",
              },
              { name: "global.priceRange", label: "Price range", placeholder: "₹₹" },
              { name: "global.areaServed", label: "Areas served", type: "stringList" },
              { name: "global.languages", label: "Languages", type: "stringList" },
              { name: "global.geoLatitude", label: "Latitude" },
              { name: "global.geoLongitude", label: "Longitude" },
              { name: "global.geoPlacename", label: "Place name", placeholder: "Dhanori, Pune" },
            ],
          },
          ...VIEWS.map((view) => ({
            title: `Page SEO — ${view}`,
            fields: [
              { name: `pages.${view}.path`, label: "URL path", placeholder: "/" },
              { name: `pages.${view}.title`, label: "Title tag (30–70 chars)", span: 2 as const },
              {
                name: `pages.${view}.description`,
                label: "Meta description (70–170 chars)",
                type: "textarea" as const,
              },
              { name: `pages.${view}.keywords`, label: "Keywords", type: "stringList" as const },
              { name: `pages.${view}.ogImage`, label: "Share image" },
              { name: `pages.${view}.noindex`, label: "Hide from search (noindex)", type: "boolean" as const },
              { name: `pages.${view}.priority`, label: "Sitemap priority (0–1)", type: "number" as const },
            ],
          })),
          {
            title: "AEO / GEO — AI answer engines",
            description:
              "These values power /llms.txt and the FAQ/course structured data that AI assistants read.",
            fields: [
              { name: "aeo.llmsTxtEnabled", label: "Publish /llms.txt", type: "boolean" },
              { name: "aeo.llmsIntro", label: "Introduction for AI crawlers", type: "textarea" },
              {
                name: "aeo.keyFacts",
                label: "Key facts (Label | Value per line)",
                type: "pairs",
                help: "Short, factual statements that AI engines can quote directly.",
              },
              { name: "aeo.citationSummary", label: "One-line citation summary", type: "textarea" },
              { name: "aeo.speakableSelectors", label: "Speakable CSS selectors", type: "stringList" },
              { name: "aeo.enableOrganizationSchema", label: "Organisation schema", type: "boolean" },
              { name: "aeo.enableLocalBusinessSchema", label: "Local business schema", type: "boolean" },
              { name: "aeo.enableWebsiteSchema", label: "Website schema", type: "boolean" },
              { name: "aeo.enableCourseSchema", label: "Course schema", type: "boolean" },
              { name: "aeo.enableFaqSchema", label: "FAQ schema", type: "boolean" },
              { name: "aeo.enableBreadcrumbSchema", label: "Breadcrumb schema", type: "boolean" },
            ],
          },
        ]}
      />
    </div>
  );
}
