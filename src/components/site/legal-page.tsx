import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getContent } from "@/lib/content/store";
import { fullAddress } from "@/lib/content/helpers";

export async function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const content = await getContent();
  const { settings } = content;
  const legal = settings.legal;
  const title = kind === "privacy" ? legal.privacyTitle : legal.termsTitle;
  const body = kind === "privacy" ? legal.privacyText : legal.termsText;
  const base = settings.url.replace(/\/$/, "");
  const path = kind === "privacy" ? "/privacy" : "/terms";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${base}${path}#webpage`,
        url: `${base}${path}`,
        name: title,
        inLanguage: "en-IN",
        isPartOf: { "@id": `${base}/#website` },
        about: { "@id": `${base}/#organization` },
        publisher: { "@id": `${base}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${base}/`,
          },
          { "@type": "ListItem", position: 2, name: title, item: `${base}${path}` },
        ],
      },
    ],
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-14 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {settings.name}
      </Link>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {new Date(content.updatedAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-slate-700">
        {body.split("\n").filter(Boolean).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        <p className="font-bold text-ink">{settings.name}</p>
        <p className="mt-1">{fullAddress(settings.contact)}</p>
        <p>{settings.contact.email} · {settings.contact.phone}</p>
      </div>
    </main>
  );
}
