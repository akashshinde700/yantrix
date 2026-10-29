import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

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
    ...(process.env.ALLOWED_DEV_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? []),
  ],
};

export default nextConfig;
