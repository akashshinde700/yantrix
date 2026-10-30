import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
// Self-hosted fonts (bundled by Next from node_modules) — no build-time request
// to fonts.googleapis.com, so air-gapped CI and proxied builders work.
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import { Toaster } from "@/components/ui/toaster";
import { getContent } from "@/lib/content/store";
import { absoluteUrl, safeClarityId, safeMeasurementId } from "@/lib/seo";

/**
 * All metadata is generated from the admin-editable content document, so
 * titles, descriptions, keywords, OpenGraph images and verification tokens can
 * be changed without touching code.
 */
/* Fonts are self-hosted and preloaded — no render-blocking request to Google. */

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const { global, pages } = content.seo;
  const { settings } = content;
  const home = pages.home;
  const ogImage = absoluteUrl(content, home.ogImage || global.ogImage);

  return {
    metadataBase: new URL(settings.url),
    title: {
      default: home.title || global.defaultTitle,
      template: global.titleTemplate || "%s",
    },
    description: home.description || global.defaultDescription,
    keywords: [...new Set([...global.keywords, ...home.keywords])],
    applicationName: settings.name,
    authors: [{ name: settings.name, url: settings.url }],
    creator: settings.name,
    publisher: settings.name,
    category: "Education",
    alternates: {
      canonical: absoluteUrl(content, home.path || "/"),
    },
    verification: {
      google: global.googleSiteVerification || undefined,
      other: global.bingSiteVerification
        ? { "msvalidate.01": global.bingSiteVerification }
        : undefined,
    },
    openGraph: {
      type: "website",
      locale: global.locale || "en_IN",
      url: absoluteUrl(content, home.path || "/"),
      siteName: settings.name,
      title: home.title || global.defaultTitle,
      description: home.description || global.defaultDescription,
      images: [{ url: ogImage, width: 1344, height: 768, alt: settings.name }],
    },
    twitter: {
      card: "summary_large_image",
      site: global.twitterHandle || undefined,
      creator: global.twitterHandle || undefined,
      title: home.title || global.defaultTitle,
      description: home.description || global.defaultDescription,
      images: [ogImage],
    },
    robots: {
      index: global.robotsIndex && !home.noindex,
      follow: global.robotsFollow,
      googleBot: {
        index: global.robotsIndex && !home.noindex,
        follow: global.robotsFollow,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const content = await getContent();
  return {
    themeColor: content.seo.global.themeColor || "#02040c",
    width: "device-width",
    initialScale: 1,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getContent();
  // Admin-editable: allow-list before interpolating into an inline script.
  const gaMeasurementId = safeMeasurementId(content.seo.global.gaMeasurementId);
  const clarityId = safeClarityId(content.seo.global.clarityId);

  return (
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/*
          Fail-safe: Framer Motion entrance animations start from
          `opacity: 0`. If the browser never produces animation frames
          (JS disabled, background tab at load, headless renderers, some
          crawlers) the content would stay invisible, so we mark the
          document and globals.css reveals it instantly.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var n=0,last=0,done=false,' +
              'r=window.requestAnimationFrame||function(c){return setTimeout(c,16)};' +
              'function t(){n++;if(!done)r(t)}' +
              'r(t);' +
              'var iv=setInterval(function(){' +
              'if(done)return clearInterval(iv);' +
              'var progressed=n-last;last=n;' +
              'if(progressed<5){done=true;document.documentElement.setAttribute("data-motion","off");clearInterval(iv)}' +
              '},400);' +
              'setTimeout(function(){if(!done)clearInterval(iv)},20000)' +
              '}catch(e){document.documentElement.setAttribute("data-motion","off")}})();',
          }}
        />
        {/*
          Skip the entrance door for: visitors who already came in this session,
          visitors arriving from a search / answer engine (Google treats a
          full-screen intro as an intrusive interstitial for search traffic),
          and crawlers / audit tools. Direct and shared-link visits get the door.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var d=document.documentElement;' +
              // public site theme hook (replaces an expensive html:has(.universe) selector)
              'if(!/^\\/admin/.test(location.pathname))d.classList.add("site-universe");' +
              'if(sessionStorage.getItem("yantrix_entered")' +
              '||/bot|crawl|spider|slurp|lighthouse|pagespeed|headless|preview|inspect/i.test(navigator.userAgent)' +
              '||/(google|bing|yahoo|duckduckgo|yandex|baidu|ecosia|perplexity|chatgpt|openai|claude|gemini|copilot)\\./i.test(document.referrer))' +
              'd.setAttribute("data-entered","");' +
              // safety net: if the door never became interactive (JS failed / blocked), hide it so the site is usable.
              // Injects its own <style> instead of touching React-rendered elements, so a late hydration still matches.
              'setTimeout(function(){if(!d.hasAttribute("data-door-ready")){d.setAttribute("data-entered","");' +
              'var s=document.createElement("style");s.textContent=".door-intro{display:none!important}";' +
              'document.head.appendChild(s)}},6000)' +
              '}catch(e){}})();',
          }}
        />
        <noscript>
          <style>{`[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important}[style*="translateY"],[style*="translateX"]{transform:none!important}.door-intro{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="antialiased bg-background font-sans text-foreground">
        {children}
        <Toaster />

        {/* Google Analytics (set the ID in /admin/seo) */}
        {gaMeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');`}
            </Script>
          </>
        ) : null}

        {/* Microsoft Clarity (heatmaps) */}
        {clarityId ? (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${clarityId}");`}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
