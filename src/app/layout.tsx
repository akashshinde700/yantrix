import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { getContent } from "@/lib/content/store";
import { absoluteUrl } from "@/lib/seo";

/**
 * All metadata is generated from the admin-editable content document, so
 * titles, descriptions, keywords, OpenGraph images and verification tokens can
 * be changed without touching code.
 */
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
    themeColor: content.seo.global.themeColor || "#1e40af",
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
  const { gaMeasurementId, clarityId } = content.seo.global;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
