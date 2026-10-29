import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content/store";
import { absoluteUrl } from "@/lib/seo";
import type { SiteView } from "@/lib/content/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  const lastModified = new Date(content.updatedAt);
  const views: SiteView[] = ["home", "courses", "about", "contact"];

  const pages = views
    .filter((view) => !content.seo.pages[view].noindex)
    .map((view) => ({
      url: absoluteUrl(content, content.seo.pages[view].path),
      lastModified,
      changeFrequency: view === "home" ? ("weekly" as const) : ("monthly" as const),
      priority: content.seo.pages[view].priority ?? 0.7,
    }));

  return [
    ...pages,
    {
      url: absoluteUrl(content, "/privacy"),
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: absoluteUrl(content, "/terms"),
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];
}
