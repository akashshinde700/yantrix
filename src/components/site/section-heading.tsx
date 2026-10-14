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
              ? "glass text-cyber-200 shadow-[0_0_20px_-6px_rgba(34,211,238,0.4)]"
              : "bg-white text-brand-700 ring-1 ring-brand-100 shadow-[0_2px_14px_-4px_rgba(37,99,235,0.25)]"
          )}
        >
          <span
            className={cn(
              "dot-pulse h-1.5 w-1.5 rounded-full",
              dark ? "bg-cyber-400" : "bg-gradient-to-br from-brand-500 to-cyber-400"
            )}
          />
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
