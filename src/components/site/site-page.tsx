import { SiteShell } from "@/components/site/site-shell";
import { SiteContentProvider } from "@/lib/content/provider";
import { getContent } from "@/lib/content/store";
import { buildJsonLd } from "@/lib/seo";
import type { SiteView } from "@/lib/content/types";

const PATHS: Record<SiteView, string> = {
  home: "/",
  courses: "/courses",
  about: "/about",
  contact: "/contact",
};

/**
 * Server-rendered site page. Every route (/ , /courses, /about, /contact)
 * renders the same shell with the correct view active, so each URL is
 * individually crawlable and has its own metadata.
 */
export async function SitePage({ view }: { view: SiteView }) {
  const content = await getContent();
  const jsonLd = buildJsonLd(content);

  return (
    <>
      {jsonLd.map((schema, index) => (
        <script
          key={`ld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <link rel="canonical" href={`${content.settings.url.replace(/\/$/, "")}${PATHS[view]}`} />
      <SiteContentProvider content={content}>
        <SiteShell initialView={view} />
      </SiteContentProvider>
    </>
  );
}
