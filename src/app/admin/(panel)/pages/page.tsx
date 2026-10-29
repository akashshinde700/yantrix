import { CollectionEditor } from "@/components/admin/collection-editor";
import { PageHeader } from "@/components/admin/page-header";
import { COLLECTION_META } from "@/components/admin/collection-fields";
import { SchemaForm } from "@/components/admin/schema-form";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function PagesAdminPage() {
  const content = await getContent();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pages & navigation"
        description="Edit the copy of every page and control the header / footer links."
      />

      <SchemaForm
        op="updatePages"
        initial={content.pages as unknown as Record<string, unknown>}
        intro="Only page-specific copy lives here. Section headings and card content are under Page sections."
        groups={[
          {
            title: "Home page",
            fields: [
              { name: "home.heroPrimaryCta", label: "Hero primary button label" },
              { name: "home.heroSecondaryCta", label: "Hero secondary button label" },
              { name: "home.heroTrustChips", label: "Show hero trust chips", type: "boolean" },
              { name: "home.aboutBadgeTitle", label: "About badge title" },
              { name: "home.aboutBadgeText", label: "About badge caption" },
              { name: "home.aboutImage", label: "About image path", placeholder: "/images/about-institute.png" },
              { name: "home.aboutImageAlt", label: "About image alt text" },
            ],
          },
          {
            title: "Courses page",
            fields: [
              { name: "courses.note", label: "Note under the course grid", type: "textarea" },
              { name: "courses.helpTitle", label: "Help box heading" },
              { name: "courses.helpCta", label: "Help box button label" },
              { name: "courses.helpText", label: "Help box text", type: "textarea" },
            ],
          },
          {
            title: "About page",
            fields: [
              { name: "about.storyTitle", label: "Story heading" },
              { name: "about.image", label: "Image path" },
              { name: "about.imageAlt", label: "Image alt text" },
              { name: "about.imageCaption", label: "Image caption", type: "textarea" },
              {
                name: "about.storyParagraphs",
                label: "Story paragraphs",
                type: "stringList",
                help: "First paragraph is used as the section description; the rest appear below it.",
              },
              { name: "about.missionTitle", label: "Mission heading" },
              { name: "about.visionTitle", label: "Vision heading" },
              { name: "about.missionText", label: "Mission text", type: "textarea" },
              { name: "about.visionText", label: "Vision text", type: "textarea" },
              { name: "about.disclaimer", label: "Placement disclaimer", type: "textarea" },
            ],
          },
          {
            title: "Contact page",
            fields: [
              { name: "contact.formTitle", label: "Form heading" },
              { name: "contact.formSubtitle", label: "Form subtitle" },
              { name: "contact.successTitle", label: "Success heading" },
              { name: "contact.successText", label: "Success text", type: "textarea" },
              { name: "contact.infoTitle", label: "Contact info heading" },
              { name: "contact.whatsappTitle", label: "WhatsApp card heading" },
              { name: "contact.whatsappText", label: "WhatsApp card text", type: "textarea" },
              { name: "contact.afterTitle", label: "After-enquiry heading" },
              { name: "contact.responseNote", label: "Response time note" },
            ],
          },
        ]}
      />

      <div className="grid gap-6">
        <CollectionEditor
          collection="navHeader"
          items={content.collections.navHeader}
          {...COLLECTION_META.navHeader}
        />
        <CollectionEditor
          collection="navFooter"
          items={content.collections.navFooter}
          {...COLLECTION_META.navFooter}
        />
      </div>
    </div>
  );
}
