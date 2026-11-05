import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SitePage } from "@/components/site/site-page";
import { LegalPage } from "@/components/site/legal-page";
import { getContent } from "@/lib/content/store";
import { absoluteUrl, brandedTitle } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return {
    title: content.settings.legal.refundTitle,
    description: `Fee and refund policy for courses and services at ${content.settings.name}.`,
    alternates: { canonical: absoluteUrl(content, "/refund-policy") },
    openGraph: {
      title: brandedTitle(content, content.settings.legal.refundTitle),
      url: absoluteUrl(content, "/refund-policy"),
    },
    robots: { index: true, follow: true },
  };
}

export default async function RefundPolicyPage() {
  // hidden from the admin panel (Settings -> Legal pages)
  const content = await getContent();
  if (!content.settings.legal.refundEnabled) notFound();
  return (
    <SitePage
      view="home"
      jsonLd={false}
      detail={<LegalPage kind="refund" />}
    />
  );
}
