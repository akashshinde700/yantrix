import type { ContactDetails, SiteSettings, CollectionKey, SiteContent, BaseItem } from "@/lib/content/types";

/** `tel:` link with spaces / dashes removed. */
export function phoneHref(settings: SiteSettings): string {
  const digits = settings.contact.phone.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}

/** `mailto:` link for the public email address. */
export function emailHref(settings: SiteSettings): string {
  return `mailto:${settings.contact.email}`;
}

/** wa.me deep-link with a pre-filled message. */
export function whatsappUrl(settings: SiteSettings, message?: string): string {
  const number = settings.whatsappNumber.replace(/\D/g, "");
  const text = encodeURIComponent(message ?? settings.whatsappMessage);
  return `https://wa.me/${number}?text=${text}`;
}

/** Human readable address, skipping empty lines. */
export function fullAddress(contact: ContactDetails): string {
  return [
    contact.address,
    contact.addressLine2,
    contact.city,
    contact.state,
    contact.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
}

/** Active items of one collection, ordered by `sortOrder`. */
export function activeItems<T extends BaseItem = BaseItem>(
  content: SiteContent,
  key: CollectionKey
): T[] {
  return (content.collections[key] ?? [])
    .filter((item) => item.active !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder) as unknown as T[];
}

/** All items of one collection (used by the admin panel). */
export function allItems(content: SiteContent, key: CollectionKey): BaseItem[] {
  return [...(content.collections[key] ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Convert a label into a url-safe slug. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
