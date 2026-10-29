import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Mail,
  Search,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { getContent, getEnquiries } from "@/lib/content/store";
import { seoAudit } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [content, enquiries] = await Promise.all([getContent(), getEnquiries()]);
  const audit = seoAudit(content);
  const passed = audit.filter((check) => check.level === "ok").length;
  const toFix = audit.filter((check) => check.level !== "ok");
  const newEnquiries = enquiries.filter((enquiry) => enquiry.status === "new");
  const courses = content.collections.courses.filter((course) => course.active !== false);
  const faqs = content.collections.faqs.filter((faq) => faq.active !== false);
  const slides = content.collections.heroSlides.filter((slide) => slide.active !== false);

  const cards = [
    { label: "Live courses", value: courses.length, href: "/admin/courses", icon: BookOpen },
    { label: "Published FAQs", value: faqs.length, href: "/admin/faqs", icon: Sparkles },
    { label: "Hero slides", value: slides.length, href: "/admin/hero", icon: Sparkles },
    { label: "New enquiries", value: newEnquiries.length, href: "/admin/enquiries", icon: Mail },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Everything on the website is editable from this panel — changes go live instantly."
      >
        <Link
          href="/"
          target="_blank"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800"
        >
          View website <ArrowRight className="h-4 w-4" />
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              <card.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-3xl font-black text-ink">{card.value}</p>
            <p className="text-sm font-semibold text-muted-foreground">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="text-base font-bold text-ink">Latest enquiries</h2>
              <p className="text-sm text-muted-foreground">New course enquiries from the website.</p>
            </div>
            <Link href="/admin/enquiries" className="text-sm font-bold text-brand-700 hover:underline">
              View all
            </Link>
          </header>
          {enquiries.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No enquiries yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {enquiries.slice(0, 6).map((enquiry) => (
                <li key={enquiry.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{enquiry.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {enquiry.course} · {enquiry.mobile}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold capitalize text-brand-700">
                    {enquiry.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-100 p-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <Search className="h-4 w-4 text-brand-600" /> SEO / AEO health
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {passed}/{audit.length} checks passing
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyber-500"
                style={{ width: `${Math.round((passed / audit.length) * 100)}%` }}
              />
            </div>
          </header>
          <ul className="space-y-2 p-5">
            {toFix
              .slice(0, 5)
              .map((check) => (
                <li key={check.label} className="flex items-start gap-2 text-sm">
                  <TriangleAlert
                    className={
                      check.level === "fail"
                        ? "mt-0.5 h-4 w-4 shrink-0 text-destructive"
                        : "mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                    }
                  />
                  <span>
                    <strong className="font-semibold text-ink">{check.label}</strong>
                    <span className="block text-xs text-muted-foreground">{check.hint}</span>
                  </span>
                </li>
              ))}
            {toFix.length === 0 ? (
              <li className="flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Everything looks good.
              </li>
            ) : null}
          </ul>
          <div className="border-t border-slate-100 p-4">
            <Link
              href="/admin/seo"
              className="text-sm font-bold text-brand-700 hover:underline"
            >
              Open SEO settings →
            </Link>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-900">
          What you can edit here
        </h2>
        <div className="mt-3 grid gap-2 text-sm text-brand-900/80 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Hero slides, images and CTAs",
            "Courses, highlights, duration & fees",
            "FAQs (also feed FAQ structured data)",
            "Every section heading & description",
            "Page copy for Home / Courses / About / Contact",
            "Navigation & footer links",
            "Business details, WhatsApp, socials",
            "SEO titles, descriptions, keywords & schema",
            "llms.txt for AI answer engines",
            "Enquiry inbox with statuses",
            "Admin users & roles",
          ].map((item) => (
            <span key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
