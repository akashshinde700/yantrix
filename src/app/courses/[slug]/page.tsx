import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SitePage } from "@/components/site/site-page";
import { CourseDetail } from "@/components/site/course-detail";
import { getContent } from "@/lib/content/store";
import { absoluteUrl, courseHeadline, coursePath, findCourse } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const course = findCourse(content, slug);
  if (!course) return { title: "Course not found", robots: { index: false } };

  const headline = courseHeadline(content, course);
  /*
   * `absolute` bypasses the root "%s | Yantrix Technology" template: with the
   * brand suffix the tag ran to 90 characters and Google truncated the part
   * that actually matters (course + fees + syllabus).
   */
  const title = { absolute: `${headline} — Fees & Syllabus` };
  const description = [
    course.description,
    course.duration && `Duration: ${course.duration}.`,
    course.modes?.length && `${course.modes.join(" & ")} batches.`,
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 300);
  const url = absoluteUrl(content, coursePath(course));
  const { global } = content.seo;

  return {
    title,
    description,
    keywords: [
      course.title,
      `${course.title} course`,
      headline,
      ...(course.highlights ?? []),
      ...global.keywords.slice(0, 5),
    ],
    alternates: { canonical: url },
    openGraph: { type: "website", title: headline, description, url },
    twitter: { card: "summary_large_image", title: headline, description },
    robots: { index: global.robotsIndex, follow: global.robotsFollow },
  };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const content = await getContent();
  const course = findCourse(content, slug);
  if (!course) notFound();

  return (
    <SitePage
      view="courses"
      course={course}
      detail={<CourseDetail slug={slug} />}
    />
  );
}
