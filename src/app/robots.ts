import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const content = await getContent();
  const { robotsIndex, robotsFollow } = content.seo.global;
  const base = content.settings.url.replace(/\/$/, "");

  return {
    rules: [
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      robotsIndex
        ? { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }
        : { userAgent: "*", disallow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
