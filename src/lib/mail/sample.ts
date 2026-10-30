import type { Enquiry, SiteContent } from "@/lib/content/types";

/** Clearly-labelled sample enquiry for admin previews and test sends (never a real person). */
export function sampleEnquiry(content: SiteContent, to?: string): Enquiry {
  const course = (content.collections.courses as unknown as { title: string; active?: boolean }[]).find((c) => c.active !== false);
  const now = new Date().toISOString();
  return {
    id: "00000000-test-4000-8000-000000000000",
    name: "Sample Student",
    email: to || "student@example.com",
    mobile: "9876543210",
    course: course?.title ?? "Full Stack Development",
    message: "This is a sample enquiry for previewing the email design.\nI would like to know the weekend batch timings.",
    status: "new",
    notes: "",
    source: "website",
    createdAt: now,
    updatedAt: now,
  };
}
