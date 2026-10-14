import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  dark = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-3",
        align === "center" ? "mx-auto items-center text-center" : "items-start text-left"
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider",
            dark
              ? "bg-white/10 text-brand-200 ring-1 ring-white/15"
              : "bg-brand-50 text-brand-700 ring-1 ring-brand-100"
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", dark ? "bg-brand-300" : "bg-brand-600")} />
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          "text-3xl font-extrabold tracking-tight text-balance sm:text-4xl",
          dark ? "text-white" : "text-ink"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-base leading-relaxed text-pretty sm:text-lg",
            dark ? "text-slate-300" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
