import { PageHeader } from "@/components/admin/page-header";
import { SchemaForm } from "@/components/admin/schema-form";
import { LABEL_GROUPS } from "@/lib/content/labels";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

/**
 * Interface text editor.
 *
 * Every button, badge and micro-copy string on the public site is stored in
 * `content.labels`; this screen is generated from `LABEL_GROUPS`, the same list
 * that produces the defaults — so the form can never drift from the code.
 */
export default async function LabelsAdminPage() {
  const content = await getContent();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Interface text"
        description="Rewrite any button, badge or small line of copy on the website without a developer. Leave a field empty to fall back to the default wording."
      />

      <SchemaForm
        op="updateLabels"
        flatKeys
        initial={content.labels as unknown as Record<string, unknown>}
        intro="These strings are shared across pages — one edit updates every place the label appears. Menu links and headings are under Pages & navigation and Page sections."
        groups={LABEL_GROUPS.map((group) => ({
          title: group.title,
          description: group.description,
          fields: group.fields.map((field) => ({
            name: field.key,
            label: field.label,
            placeholder: field.value,
            type: field.type === "textarea" ? ("textarea" as const) : ("text" as const),
            help: field.help,
          })),
        }))}
      />
    </div>
  );
}
