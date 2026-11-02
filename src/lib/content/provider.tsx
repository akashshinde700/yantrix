"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { DEFAULT_CONTENT } from "@/lib/content/defaults";
import { defaultLabel } from "@/lib/content/labels";
import { activeItems, allItems } from "@/lib/content/helpers";
import type {
  BaseItem,
  CollectionKey,
  SectionCopy,
  SectionKey,
  SiteContent,
  SiteSettings,
} from "@/lib/content/types";

const ContentContext = createContext<SiteContent>(DEFAULT_CONTENT);

export function SiteContentProvider({
  content,
  children,
}: {
  content: SiteContent;
  children: ReactNode;
}) {
  const value = useMemo(() => content ?? DEFAULT_CONTENT, [content]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

/** Full content document (settings, SEO, sections, pages, collections). */
export function useSiteContent(): SiteContent {
  return useContext(ContentContext);
}

/** Business / contact settings. */
export function useSettings(): SiteSettings {
  return useContext(ContentContext).settings;
}

/** Active + ordered items of a collection. */
export function useCollection<T extends BaseItem = BaseItem>(key: CollectionKey): T[] {
  const content = useContext(ContentContext);
  return activeItems<T>(content, key);
}

/** Every item of a collection (admin panel). */
export function useAllItems(key: CollectionKey): BaseItem[] {
  const content = useContext(ContentContext);
  return allItems(content, key);
}

/** Copy for one page section. */
export function useSection(key: SectionKey): SectionCopy {
  return useContext(ContentContext).sections[key];
}

/**
 * Interface text lookup: `const t = useLabels(); t("footer.explore")`.
 *
 * Falls back to the built-in default for a key that is not in the document yet
 * (a label added in a newer release, before the admin saves anything), so a
 * missing key can never render `undefined` on the site.
 */
export function useLabels() {
  const labels = useContext(ContentContext).labels;
  return useMemo(() => {
    const table = labels ?? {};
    return (key: string) => {
      const value = table[key];
      return typeof value === "string" && value.trim() ? value : defaultLabel(key);
    };
  }, [labels]);
}
