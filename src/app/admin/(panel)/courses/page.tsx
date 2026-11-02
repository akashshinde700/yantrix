import { PageHeader } from "@/components/admin/page-header";
import { CourseList } from "@/components/admin/course-list";
import { getContent } from "@/lib/content/store";
import type { Course } from "@/lib/content/types";

export const dynamic = "force-dynamic";

/**
 * Admin → Courses.
 *
 * Each course here owns a full public page (`/courses/<slug>`), so this screen
 * is the entry point to the dedicated course editor rather than the generic
 * key/value collection editor used by smaller lists.
 */
export default async function CoursesAdminPage() {
  const content = await getContent();
  const courses = content.collections.courses as unknown as Course[];
  const published = courses.filter((course) => course.active !== false).length;

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Add a course once and it appears as a card on the Courses page, in the footer, in the enquiry dropdown — and gets its own page with syllabus, tools, reviews and FAQs."
      >
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
          {published} published
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
          {courses.length - published} hidden
        </span>
      </PageHeader>

      <CourseList items={courses} />
    </div>
  );
}
