import { CollectionEditor } from "@/components/admin/collection-editor";
import { PageHeader } from "@/components/admin/page-header";
import { COLLECTION_META } from "@/components/admin/collection-fields";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function FaqsAdminPage() {
  const content = await getContent();
  return (
    <div>
      <PageHeader
        title="Frequently asked questions"
        description="FAQs appear on the home page and are also published as FAQPage structured data, which AI answer engines (ChatGPT, Perplexity, Google AI Overviews) use to quote your business."
      />
      <CollectionEditor
        collection="faqs"
        items={content.collections.faqs}
        {...COLLECTION_META.faqs}
      />
    </div>
  );
}
