import type { ReactNode } from "react";
import { SiteShell } from "@/components/site/site-shell";
import { SiteContentProvider } from "@/lib/content/provider";
import { getContent } from "@/lib/content/store";
import { buildJsonLd, serializeJsonLd } from "@/lib/seo";
import type { Course, SiteView } from "@/lib/content/types";

/**
 * Server-rendered site page. Every route (/ , /courses, /about, /contact and
 * /courses/[slug]) renders the same shell with only its own content, so each
 * URL is unique, individually crawlable and has its own metadata. (The
 * canonical tag comes from each route's generateMetadata.)
 */
export async function SitePage({
  view,
  course,
  detail,
}: {
  view: SiteView;
  /** Set on course detail pages for course-specific structured data. */
  course?: Course;
  /** Page body that replaces the view (course detail pages). */
  detail?: ReactNode;
}) {
  const content = await getContent();
  const jsonLd = buildJsonLd(content, { view, course });

  return (
    <>
      {jsonLd.map((schema, index) => (
        <script
          key={`ld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        />
      ))}
      <SiteContentProvider content={content}>
        <SiteShell initialView={view} detail={detail} />
      </SiteContentProvider>
    </>
  );
}
