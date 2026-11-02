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
export type LegalKind = "privacy" | "terms" | "refund";

const PATHS: Record<LegalKind, string> = {
  privacy: "/privacy",
  terms: "/terms",
  refund: "/refund-policy",
};

type Block = { type: "p" | "h"; text: string } | { type: "ul"; items: string[] };

/**
 * Plain-text body -> blocks. Lines starting with "*", "-" or "•" become bullet
 * points (consecutive ones share a list); a short line without end punctuation,
 * such as "No Refund Policy", becomes a sub-heading; anything else is a paragraph.
 */
function toBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const bullet = line.match(/^[*\-•]\s+(.*)$/);
    const last = blocks[blocks.length - 1];
    if (bullet) {
      if (last?.type === "ul") last.items.push(bullet[1]);
      else blocks.push({ type: "ul", items: [bullet[1]] });
    } else if (line.length <= 80 && !/[.:;,!?]$/.test(line)) {
      blocks.push({ type: "h", text: line });
    } else {
      blocks.push({ type: "p", text: line });
    }
  }
  return blocks;
}

export async function LegalPage({ kind }: { kind: LegalKind }) {
  const content = await getContent();
  const { settings } = content;
  const legal = settings.legal;
  const title =
    kind === "privacy" ? legal.privacyTitle : kind === "refund" ? legal.refundTitle : legal.termsTitle;
  const body =
    kind === "privacy" ? legal.privacyText : kind === "refund" ? legal.refundText : legal.termsText;
  const base = settings.url.replace(/\/$/, "");
  const path = PATHS[kind];

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
          {toBlocks(body).map((block, index) =>
            block.type === "ul" ? (
              <ul key={index} className="space-y-3 pl-1">
                {block.items.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : block.type === "h" ? (
              <h2 key={index} className="pt-2 text-lg font-extrabold text-white">
                {block.text}
              </h2>
            ) : (
              <p key={index}>{block.text}</p>
            )
          )}
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
