import { getContent } from "@/lib/content/store";
import { buildLlmsTxt } from "@/lib/seo";

/**
 * /llms.txt — a plain-text summary for AI assistants and answer engines
 * (ChatGPT, Perplexity, Claude, Google AI Overviews …).
 * This is the AEO/GEO counterpart of a sitemap.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getContent();
  if (!content.seo.aeo.llmsTxtEnabled) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(buildLlmsTxt(content), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
