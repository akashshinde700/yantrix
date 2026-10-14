import type { Metadata, Viewport } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/lib/site-config";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default:
      "Yantrix Technology | IT Training Institute — Online & Offline Courses with Placement Assistance",
    template: "%s | Yantrix Technology",
  },
  description:
    "Yantrix Technology is an IT training institute offering online and offline courses in Full Stack Development, Web Development, Python, Java, Data Analytics and more — with live projects and placement assistance.",
  keywords: [
    "IT training institute",
    "online IT courses",
    "offline IT courses",
    "programming courses",
    "web development course",
    "full stack development course",
    "career oriented IT training",
    "placement assistance IT courses",
    "Yantrix Technology",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "Education",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: siteConfig.name,
    title: "Yantrix Technology | IT Training Institute — Online & Offline Courses",
    description:
      "Learn practical, job-ready IT skills through online and offline training, live project-based learning, and placement assistance at Yantrix Technology.",
    images: [
      {
        url: "/images/hero-1.png",
        width: 1344,
        height: 768,
        alt: "Yantrix Technology IT training institute",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yantrix Technology | IT Training Institute",
    description:
      "Practical IT training with online & offline courses, live projects and placement assistance.",
    images: ["/images/hero-1.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${geistMono.variable} antialiased bg-background font-sans text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
