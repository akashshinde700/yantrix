import { CollectionEditor } from "@/components/admin/collection-editor";
import { PageHeader } from "@/components/admin/page-header";
import { COLLECTION_META } from "@/components/admin/collection-fields";
import { SchemaForm } from "@/components/admin/schema-form";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function TrainersAdminPage() {
  const content = await getContent();
  const section = content.sections.trainers;
  return (
    <div className="space-y-8">
      <PageHeader
        title="Trainers"
        description="Trainer profiles appear on the home page (About chapter) and the About page. Use Section settings to show or hide the whole section; use the eye switch on each trainer to show or hide one profile."
      />
      <SchemaForm
        op="updateSections"
        initial={{ trainers: section } as unknown as Record<string, unknown>}
        groups={[
          {
            title: "Section settings",
            description: "Heading shown above the section on the website. Turn on “Hide this section” to remove it from the website without deleting any profiles.",
            fields: [
              { name: "trainers.hidden", label: "Hide this section", type: "boolean" },
              { name: "trainers.eyebrow", label: "Eyebrow label" },
              { name: "trainers.title", label: "Heading", span: 2 },
              { name: "trainers.description", label: "Description", type: "textarea" },
            ],
          },
        ]}
      />
      <CollectionEditor collection="trainers" items={content.collections.trainers} {...COLLECTION_META.trainers} />
    </div>
  );
}
