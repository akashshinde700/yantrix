import { useSettings } from "@/lib/content/provider";
import { cn } from "@/lib/utils";

export function Logo({
  variant = "light",
  className,
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const settings = useSettings();
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 via-brand-800 to-space shadow-md shadow-brand-900/20 ring-1 ring-cyber-400/25 transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110 group-hover:shadow-[0_0_24px_-2px_rgba(34,211,238,0.55)]"
      >
        <svg viewBox="0 0 64 64" className="h-6 w-6" fill="none">
          <path
            d="M18 17h11l3 9 3-9h11l-9.5 19.5V47h-9V36.5L18 17z"
            fill="#ffffff"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-lg font-extrabold tracking-tight",
            variant === "light" ? "text-ink" : "text-white"
          )}
        >
          {settings.shortName} <span className="text-brand-600">{settings.name.replace(settings.shortName, "").trim() || "Technology"}</span>
        </span>
        <span
          className={cn(
            "mt-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
            variant === "light" ? "text-muted-foreground" : "text-brand-200"
          )}
        >
          {settings.domain}
        </span>
      </span>
    </span>
  );
}
