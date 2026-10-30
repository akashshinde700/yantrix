import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const content = await getContent();
  return {
    name: content.settings.name,
    short_name: content.settings.shortName,
    description: content.seo.global.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#02040c",
    theme_color: content.seo.global.themeColor || "#02040c",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
