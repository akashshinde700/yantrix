import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getContent } from "@/lib/content/store";
import { fullAddress } from "@/lib/content/helpers";
import { serializeJsonLd } from "@/lib/seo";

/**
 * Body of the two legal pages. It is rendered as the `detail` of the site
 * shell (see /privacy and /terms), so it must not render its own <main>,
 * header or footer — the shell already provides them, along with the dark
 * "universe" theme and the site navigation.
 */
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
          {
            "@type": "ListItem",
            position: 2,
            name: title,
            item: `${base}${path}`,
          },
        ],
      },
    ],
  };

  return (
    /* The 3D universe drifts behind every page, so long-form text needs an
       opaque-enough panel of its own — otherwise a planet passes under the
       paragraph and the copy becomes unreadable. */
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="rounded-3xl border border-white/10 bg-[#050a1c]/85 p-6 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-9">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-cyber-300 underline-offset-4 hover:text-white hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to{" "}
          {settings.name}
        </Link>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Last updated:{" "}
          {new Date(content.updatedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-slate-300">
          {body
            .split("\n")
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
        </div>
        <h2 className="mt-12 text-lg font-extrabold text-white">
          Contact us about this page
        </h2>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
          <p className="font-bold text-white">{settings.name}</p>
          <p className="mt-1">{fullAddress(settings.contact)}</p>
          <p>
            <a
              href={`mailto:${settings.contact.email}`}
              className="underline-offset-4 hover:text-white hover:underline"
            >
              {settings.contact.email}
            </a>
            {settings.contact.phone ? (
              <>
                {" · "}
                <a
                  href={`tel:${settings.contact.phone.replace(/[^+\d]/g, "")}`}
                  className="underline-offset-4 hover:text-white hover:underline"
                >
                  {settings.contact.phone}
                </a>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
}
