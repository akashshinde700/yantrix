import { CollectionEditor } from "@/components/admin/collection-editor";
import { PageHeader } from "@/components/admin/page-header";
import { COLLECTION_META } from "@/components/admin/collection-fields";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function CoursesAdminPage() {
  const content = await getContent();
  return (
    <div>
      <PageHeader
        title="Courses"
        description="Add, edit, reorder or hide courses. These cards appear on the Courses page, the footer and in the enquiry form dropdown."
      />
      <CollectionEditor
        collection="courses"
        items={content.collections.courses}
        {...COLLECTION_META.courses}
      />
    </div>
  );
}
