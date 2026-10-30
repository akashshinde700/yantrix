import { CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { EmailTestButton } from "@/components/admin/email-test-button";
import { getContent } from "@/lib/content/store";
import { defaultFrom, mailConfigured } from "@/lib/mail/mailer";

export const dynamic = "force-dynamic";

export default async function EmailAdminPage() {
  const content = await getContent();
  const configured = mailConfigured();
  const admins = (process.env.ADMIN_NOTIFY_EMAIL || content.settings.contact.email || "").split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Email notifications"
        description="When someone sends the contact form, the student gets a confirmation email and your team gets an alert with one-tap call / WhatsApp / reply buttons."
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          {configured ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" /> : <XCircle className="mt-0.5 h-5 w-5 text-red-500" />}
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-slate-900">{configured ? "Email sending is configured" : "Email sending is not configured yet"}</p>
            {configured ? (
              <>
                <p className="text-slate-600">From: <span className="font-mono">{defaultFrom(content.settings.name)}</span></p>
                <p className="text-slate-600">Admin alerts go to: <span className="font-mono">{admins.join(", ") || "—"}</span></p>
              </>
            ) : (
              <p className="text-slate-600">
                Add <span className="font-mono">SMTP_HOST</span>, <span className="font-mono">SMTP_PORT</span>, <span className="font-mono">SMTP_USER</span> and{" "}
                <span className="font-mono">SMTP_PASS</span> to the server&apos;s <span className="font-mono">.env</span> and restart. Enquiries are still saved meanwhile.
              </p>
            )}
          </div>
        </div>
        <div className="mt-5">
          <EmailTestButton disabled={!configured} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {[
          { type: "student", title: "Confirmation the student receives" },
          { type: "admin", title: "Alert your team receives" },
        ].map((p) => (
          <div key={p.type} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <p className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">{p.title} <span className="font-normal text-slate-500">(sample data)</span></p>
            <iframe title={p.title} src={`/api/admin/email-preview?type=${p.type}`} className="h-[900px] w-full bg-[#02040c]" />
          </div>
        ))}
      </section>
    </div>
  );
}
