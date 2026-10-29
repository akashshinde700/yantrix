import { CollectionEditor } from "@/components/admin/collection-editor";
import { PageHeader } from "@/components/admin/page-header";
import { COLLECTION_META } from "@/components/admin/collection-fields";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function HeroAdminPage() {
  const content = await getContent();
  return (
    <div>
      <PageHeader
        title="Hero slides"
        description="The rotating banner at the top of the home page. Reorder, hide or replace slides — and edit the CTA buttons in Pages & navigation."
      />
      <CollectionEditor
        collection="heroSlides"
        items={content.collections.heroSlides}
        {...COLLECTION_META.heroSlides}
      />
    </div>
  );
}
