import { PageHeader } from "@/components/admin/page-header";
import { SchemaForm } from "@/components/admin/schema-form";
import {
  ChangePasswordForm,
  ResetContentButton,
} from "@/components/admin/account-forms";
import { getSessionAdmin, isOwner } from "@/lib/admin/auth";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  const [content, admin] = await Promise.all([getContent(), getSessionAdmin()]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Site settings"
        description="Business details, contact information, social links and legal text. These values are used across the site, in structured data and in llms.txt."
      />

      <SchemaForm
        op="updateSettings"
        initial={content.settings as unknown as Record<string, unknown>}
        groups={[
          {
            title: "Brand",
            fields: [
              { name: "name", label: "Business name" },
              {
                name: "shortName",
                label: "Short name",
                help: "Used in the logo lockup.",
              },
              {
                name: "domain",
                label: "Displayed domain",
                placeholder: "YantrixTechnology.com",
              },
              {
                name: "url",
                label: "Website URL",
                placeholder: "https://yantrixtechnology.com",
              },
              { name: "tagline", label: "Tagline" },
              { name: "foundedYear", label: "Founded year", type: "number" },
              {
                name: "positioning",
                label: "Positioning statement",
                type: "textarea",
              },
            ],
          },
          {
            title: "Contact details",
            description:
              "Shown in the header, footer, contact page and organisation schema.",
            fields: [
              { name: "contact.phone", label: "Phone number" },
              { name: "contact.email", label: "Public email" },
              { name: "contact.hours", label: "Working hours" },
              { name: "contact.address", label: "Street address" },
              { name: "contact.addressLine2", label: "Address line 2" },
              { name: "contact.city", label: "City" },
              { name: "contact.state", label: "State" },
              { name: "contact.postalCode", label: "PIN code" },
              {
                name: "contact.country",
                label: "Country code",
                placeholder: "IN",
              },
              { name: "contact.mapLink", label: "Google Maps link" },
              { name: "contact.mapEmbedUrl", label: "Map embed URL" },
            ],
          },
          {
            title: "WhatsApp & enquiries",
            fields: [
              {
                name: "whatsappNumber",
                label: "WhatsApp number",
                help: "Digits only, with country code — e.g. 918806003000",
              },
              {
                name: "whatsappMessage",
                label: "Pre-filled WhatsApp message",
                type: "textarea",
              },
              { name: "supportEmail", label: "Support email" },
            ],
          },
          {
            title: "Social profiles",
            description:
              "Leave blank to hide. Links feed the schema.org sameAs property.",
            fields: [
              { name: "social.instagram", label: "Instagram URL" },
              { name: "social.facebook", label: "Facebook URL" },
              { name: "social.linkedin", label: "LinkedIn URL" },
              { name: "social.youtube", label: "YouTube URL" },
              { name: "social.twitter", label: "X / Twitter URL" },
              {
                name: "social.googleBusiness",
                label: "Google Business Profile URL",
              },
            ],
          },
          {
            title: "Top bar & footer",
            fields: [
              { name: "topBar.badge", label: "Top bar badge" },
              { name: "topBar.note", label: "Top bar note" },
              { name: "topBar.extra", label: "Top bar extra text" },
              { name: "footer.ctaTitle", label: "Footer CTA heading" },
              { name: "footer.ctaText", label: "Footer CTA text" },
              {
                name: "footer.disclaimer",
                label: "Placement disclaimer",
                type: "textarea",
              },
              { name: "footer.copyright", label: "Extra copyright text" },
            ],
          },
          {
            title: "Legal pages",
            fields: [
              { name: "legal.privacyTitle", label: "Privacy policy heading" },
              {
                name: "legal.privacyText",
                label: "Privacy policy text",
                type: "textarea",
              },
              { name: "legal.termsTitle", label: "Terms heading" },
              {
                name: "legal.termsText",
                label: "Terms text",
                type: "textarea",
              },
            ],
          },
        ]}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-ink">Your sign-in password</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Change the password for {admin?.email}.
        </p>
        {admin ? <ChangePasswordForm adminId={admin.id} /> : null}
      </section>

      {isOwner(admin?.role) ? (
        <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <h2 className="text-base font-bold text-red-700">Danger zone</h2>
          <p className="mt-1 mb-4 text-sm text-red-800">
            Restores the original website copy. Only use this if you want to
            start over.
          </p>
          <ResetContentButton />
        </section>
      ) : null}
    </div>
  );
}
