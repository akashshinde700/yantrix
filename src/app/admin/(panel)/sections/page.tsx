import { CollectionEditor } from "@/components/admin/collection-editor";
import { PageHeader } from "@/components/admin/page-header";
import { COLLECTION_META } from "@/components/admin/collection-fields";
import { SchemaForm } from "@/components/admin/schema-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getContent } from "@/lib/content/store";
import { SECTION_KEYS, type SectionKey } from "@/lib/content/types";

export const dynamic = "force-dynamic";

const SECTION_LABELS: Record<SectionKey, string> = {
  badges: "Highlight cards",
  why: "Why choose us",
  modes: "Training modes",
  stats: "Stats band",
  about: "About preview",
  placement: "Placement assistance",
  faq: "FAQ section",
  cta: "Call-to-action band",
  trainers: "Trainers section",
  placedStudents: "Placed students section",
  coursesPage: "Courses page hero",
  aboutPage: "About page hero",
  contactPage: "Contact page hero",
};

const COLLECTIONS = [
  "features",
  "badges",
  "stats",
  "techStack",
  "trainingModes",
  "trustChips",
  "approachSteps",
  "placementPoints",
  "checklist",
  "quickFacts",
  "contactSteps",
  "courseChips",
  "courseIncludes",
] as const;

export default async function SectionsAdminPage() {
  const content = await getContent();

  return (
    <div>
      <PageHeader
        title="Page sections"
        description="Edit the heading of every section and the cards inside each one. Hide a section to remove it from the website without deleting its content."
      />

      <Tabs defaultValue="headings" className="w-full">
        <TabsList className="mb-5 flex h-auto flex-wrap justify-start gap-1 bg-white p-1.5 shadow-sm">
          <TabsTrigger value="headings">Section headings</TabsTrigger>
          {COLLECTIONS.map((key) => (
            <TabsTrigger key={key} value={key}>
              {COLLECTION_META[key].title}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="headings">
          <SchemaForm
            op="updateSections"
            initial={content.sections as unknown as Record<string, unknown>}
            intro="These headings sit above the cards in each section of the website."
            groups={SECTION_KEYS.map((key) => ({
              title: SECTION_LABELS[key],
              fields: [
                { name: `${key}.eyebrow`, label: "Eyebrow label" },
                {
                  name: `${key}.hidden`,
                  label: "Hide this section",
                  type: "boolean" as const,
                },
                { name: `${key}.title`, label: "Heading", span: 2 as const },
                {
                  name: `${key}.description`,
                  label: "Description",
                  type: "textarea" as const,
                },
              ],
            }))}
          />
        </TabsContent>

        {COLLECTIONS.map((key) => (
          <TabsContent key={key} value={key}>
            <CollectionEditor
              collection={key}
              items={content.collections[key]}
              {...COLLECTION_META[key]}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
