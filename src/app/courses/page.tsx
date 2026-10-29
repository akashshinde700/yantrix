import type { Metadata } from "next";
import { SitePage } from "@/components/site/site-page";
import { getContent } from "@/lib/content/store";
import { absoluteUrl, pageDescription, pageTitle } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const page = content.seo.pages.courses;
  return {
    title: page.title,
    description: pageDescription(content, "courses"),
    keywords: page.keywords,
    alternates: { canonical: absoluteUrl(content, page.path) },
    openGraph: {
      title: pageTitle(content, "courses"),
      description: pageDescription(content, "courses"),
      url: absoluteUrl(content, page.path),
      images: [{ url: absoluteUrl(content, page.ogImage || content.seo.global.ogImage) }],
    },
    robots: { index: !page.noindex && content.seo.global.robotsIndex, follow: content.seo.global.robotsFollow },
  };
}

export default function CoursesPage() {
  return <SitePage view="courses" />;
}
