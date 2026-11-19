"use client";

import {
  AtSign,
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  MessageCircle,
  Send,
  Twitter,
  Youtube,
} from "lucide-react";
import type { SiteSettings } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/** Every social profile the admin can fill in (Admin → Site settings → Social links). */
export const SOCIAL: {
  key: keyof SiteSettings["social"];
  label: string;
  Icon: typeof Instagram;
}[] = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "youtube", label: "YouTube", Icon: Youtube },
  { key: "twitter", label: "X (Twitter)", Icon: Twitter },
  { key: "telegram", label: "Telegram", Icon: Send },
  { key: "whatsappChannel", label: "WhatsApp channel", Icon: MessageCircle },
  { key: "threads", label: "Threads", Icon: AtSign },
  { key: "googleBusiness", label: "Google Business Profile", Icon: MapPin },
];

/** Only the profiles that have a URL, so an empty field never shows a dead icon. */
export function activeSocial(settings: SiteSettings) {
  return SOCIAL.filter((s) => settings.social[s.key]?.trim());
}

/** A row of icon links to the institute's social profiles; renders nothing when none are set. */
export function SocialLinks({
  settings,
  label,
  className,
  linkClassName,
  iconClassName = "h-4 w-4",
}: {
  settings: SiteSettings;
  label: string;
  className?: string;
  linkClassName?: string;
  iconClassName?: string;
}) {
  const items = activeSocial(settings);
  if (items.length === 0) return null;
  return (
    <ul className={cn("flex items-center", className)} aria-label={label}>
      {items.map(({ key, label: name, Icon }) => (
        <li key={key}>
          <a
            href={settings.social[key].trim()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            title={name}
            className={linkClassName}
          >
            <Icon className={iconClassName} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
