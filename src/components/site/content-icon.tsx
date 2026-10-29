import { createElement } from "react";
import { getIcon } from "@/lib/content/icons";
import { cn } from "@/lib/utils";

/**
 * Renders a lucide icon chosen in the admin panel (stored as a string name).
 * `createElement` is used because the icon component is looked up at runtime
 * from a static registry.
 */
export function ContentIcon({
  name,
  className,
  strokeWidth,
}: {
  name: unknown;
  className?: string;
  strokeWidth?: number;
}) {
  return createElement(getIcon(name), {
    className: cn(className),
    "aria-hidden": true,
    strokeWidth,
  });
}
