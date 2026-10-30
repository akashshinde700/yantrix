import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

/** Search engines and AI answer engines (ChatGPT, Claude, Perplexity, Gemini, Apple…) are welcome. */
const CRAWLERS = [
  "Googlebot",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "Google-Extended",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "DuckAssistBot",
  "Amazonbot",
  "meta-externalagent",
  "cohere-ai",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const content = await getContent();
  const { robotsIndex } = content.seo.global;
  const base = content.settings.url.replace(/\/$/, "");
  // A named user-agent group replaces the "*" group for that bot, so each one repeats the private paths.
  const privatePaths = ["/admin", "/api"];

  return {
    rules: robotsIndex
      ? [
          { userAgent: CRAWLERS, allow: "/", disallow: privatePaths },
          { userAgent: "*", allow: "/", disallow: privatePaths },
        ]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
