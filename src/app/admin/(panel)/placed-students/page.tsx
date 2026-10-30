import { CollectionEditor } from "@/components/admin/collection-editor";
import { PageHeader } from "@/components/admin/page-header";
import { COLLECTION_META } from "@/components/admin/collection-fields";
import { SchemaForm } from "@/components/admin/schema-form";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function PlacedStudentsAdminPage() {
  const content = await getContent();
  const section = content.sections.placedStudents;
  return (
    <div className="space-y-8">
      <PageHeader
        title="Placed students"
        description="Placed students appear on the home page (Placement chapter) and the About page. Use Section settings to show or hide the whole section; use the eye switch on each student to show or hide one entry."
      />
      <SchemaForm
        op="updateSections"
        initial={{ placedStudents: section } as unknown as Record<string, unknown>}
        groups={[
          {
            title: "Section settings",
            description: "Heading shown above the section on the website. Turn on “Hide this section” to remove it from the website without deleting any profiles.",
            fields: [
              { name: "placedStudents.hidden", label: "Hide this section", type: "boolean" },
              { name: "placedStudents.eyebrow", label: "Eyebrow label" },
              { name: "placedStudents.title", label: "Heading", span: 2 },
              { name: "placedStudents.description", label: "Description", type: "textarea" },
            ],
          },
        ]}
      />
      <CollectionEditor collection="placedStudents" items={content.collections.placedStudents} {...COLLECTION_META.placedStudents} />
    </div>
  );
}
