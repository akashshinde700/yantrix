import { getContent } from "@/lib/content/store";
import { buildLlmsTxt } from "@/lib/seo";

/**
 * /llms-full.txt — the long form of /llms.txt: every course with its topics
 * and question/answer pairs, so AI assistants can answer course questions
 * accurately and cite the right course page (GEO).
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getContent();
  if (!content.seo.aeo.llmsTxtEnabled) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(buildLlmsTxt(content, { full: true }), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
