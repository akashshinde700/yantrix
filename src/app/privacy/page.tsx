import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { getContent } from "@/lib/content/store";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return {
    title: content.settings.legal.privacyTitle,
    description: `How ${content.settings.name} collects, uses and protects the details you submit on this website.`,
    alternates: { canonical: absoluteUrl(content, "/privacy") },
    robots: { index: true, follow: true },
  };
}

export default function PrivacyPage() {
  return <LegalPage kind="privacy" />;
}
