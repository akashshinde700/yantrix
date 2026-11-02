import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseEditor } from "@/components/admin/course-editor";
import { getContent } from "@/lib/content/store";
import type { Course } from "@/lib/content/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Course editor",
  robots: { index: false, follow: false },
};

/** Sensible starting values for a brand-new course (id "new"). */
const NEW_COURSE = {
  title: "",
  slug: "",
  icon: "Sparkles",
  description: "",
  tagline: "",
  duration: "",
  fee: "On request",
  level: "Beginner",
  modes: ["Online", "Offline"],
  highlights: [],
  heroStats: [],
  learn: [],
  tools: [],
  aboutParagraphs: [],
  tracks: [],
  benefits: [],
  curriculum: [],
  reviews: [],
  faqs: [],
  active: true,
};

export default async function CourseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "new") {
    return <CourseEditor isNew initial={NEW_COURSE} />;
  }

  const content = await getContent();
  const course = (content.collections.courses as unknown as Course[]).find(
    (item) => item.id === id
  );
  if (!course) notFound();

  return (
    <CourseEditor
      isNew={false}
      courseId={course.id}
      initial={course as unknown as Record<string, unknown>}
    />
  );
}
