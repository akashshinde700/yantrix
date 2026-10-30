import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content/store";
import { absoluteUrl, activeCourses, coursePath } from "@/lib/seo";
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

  const courses = activeCourses(content).map((course) => ({
    url: absoluteUrl(content, coursePath(course)),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    ...pages,
    ...courses,
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
