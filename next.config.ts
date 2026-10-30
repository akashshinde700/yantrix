import type { NextConfig } from "next";

/**
 * Baseline security headers.
 *
 * Nothing in the project set any, so every response went out bare: the admin
 * panel could be framed by another site (clickjacking), browsers sniffed
 * content types, and no referrer policy was advertised.
 *
 * The CSP is deliberately permissive about inline code — Next.js streams the
 * RSC payload through inline <script> tags and the site sets a handful of
 * inline styles — but it still blocks third-party script injection and
 * framing, which are the attacks that matter here. GA4 / Clarity are only
 * added when their IDs are configured, so their hosts are allow-listed.
 */
const isDev = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  // 'unsafe-inline' is required for the RSC bootstrap and framer-motion styles.
  // 'unsafe-eval' is only needed by the dev-server source maps.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.clarity.ms https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss: ws:",
  "worker-src 'self' blob:",
  "frame-src 'self' https://www.googletagmanager.com",
  "manifest-src 'self'",
  // only in production: it would force the http:// dev preview to https
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Ignored over plain HTTP; makes the first HTTPS response sticky.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  /* Stop advertising the framework version on every response. */
  poweredByHeader: false,
  /*
   * Keep the build honest. `ignoreBuildErrors: true` meant type errors could
   * never break a deploy, so the types in this project were advisory only.
   */
  typescript: {
    ignoreBuildErrors: false,
  },
  /*
   * Strict mode double-invokes effects in development, which is how missing
   * cleanup functions and non-idempotent effects get caught before production.
   */
  reactStrictMode: true,

  /*
   * Next 16 blocks dev-server requests whose Origin/Host is not listed here.
   * Without this the dev server refuses the HMR websocket (and client chunks)
   * for anything but `localhost`, which leaves the page un-hydrated — dead
   * buttons, frozen animations — when the preview is opened through a proxy
   * or by IP. Keep the sandbox/preview hosts below.
   */
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "*.e2b.app",
    "*.arena.ai",
    "*.ngrok-free.app",
    ...(process.env.ALLOWED_DEV_ORIGINS?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []),
  ],

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // The admin panel must never be indexed or cached by a shared proxy.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
