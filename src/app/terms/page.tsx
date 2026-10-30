import type { Metadata } from "next";
import { SitePage } from "@/components/site/site-page";
import { LegalPage } from "@/components/site/legal-page";
import { getContent } from "@/lib/content/store";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return {
    title: content.settings.legal.termsTitle,
    description: `Terms of use for the ${content.settings.name} website and course information.`,
    alternates: { canonical: absoluteUrl(content, "/terms") },
    robots: { index: true, follow: true },
  };
}

export default function TermsPage() {
  return (
    <SitePage view="home" jsonLd={false} detail={<LegalPage kind="terms" />} />
  );
}
