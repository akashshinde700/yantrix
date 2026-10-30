import { useSettings } from "@/lib/content/provider";
import { cn } from "@/lib/utils";

/**
 * Official logo artwork (public/brand): icon + "YANTRIX" only — the
 * "TECHNOLOGY" line and the "Code | Create | Conquer" tagline are left out
 * (full versions stay in public/brand/yantrix-logo*.svg). Lettering is
 * outlined paths, so it renders identically everywhere.
 */
const LOGO = {
  /** dark lettering — for light backgrounds */
  light: "/brand/yantrix-wordmark.svg",
  /** white lettering — for dark backgrounds */
  dark: "/brand/yantrix-wordmark-dark.svg",
};
const RATIO = 2980 / 830; // artwork viewBox width / height

export function Logo({
  variant = "dark",
  className,
  height = 44,
}: {
  /** the background the logo sits on */
  variant?: "light" | "dark";
  className?: string;
  /** rendered height in px (width follows the artwork ratio) */
  height?: number;
}) {
  const settings = useSettings();
  return (
    <img
      src={LOGO[variant]}
      alt={settings.name}
      width={Math.round(height * RATIO)}
      height={height}
      decoding="async"
      className={cn("block h-auto max-w-full select-none transition-[filter] duration-300 group-hover:brightness-110", className)}
      style={{ height, width: "auto" }}
    />
  );
}
