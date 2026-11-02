/**
 * Full syllabus for every course, keyed by course slug.
 *
 * This is the source of truth for the curriculum accordions on
 * `/courses/<slug>` and for the downloadable syllabus PDFs in
 * `public/files/`. It is deliberately long: students and parents read the whole
 * outline before paying, so each module lists the lessons actually taught.
 *
 * Edit the JSON next to this file (or use **Admin -> Courses -> Curriculum**,
 * which stores the same shape in the content store). Regenerate the PDFs with
 * `python3 scripts/build-syllabus-pdfs.py` after a change.
 */

import rawCurriculum from "./curriculum/course-curriculum.json";

export type CurriculumModule = {
  title: string;
  /** Optional pacing hint, e.g. "Week 4". */
  duration?: string;
  topics: string[];
};

const CURRICULUM = rawCurriculum as Record<string, CurriculumModule[]>;

/** Modules for one course slug; empty array when a course has no outline yet. */
export function curriculumFor(slug: string): CurriculumModule[] {
  return CURRICULUM[slug] ?? [];
}

/** Display names used on the downloadable syllabus PDFs. */
const COURSE_NAMES: Record<string, string> = {
  "full-stack-development": "Full Stack Development",
  "web-development": "Web Development",
  "python-programming": "Python Programming",
  "java-programming": "Java Programming",
  "data-analytics": "Data Analytics",
  "digital-marketing": "Digital Marketing",
  "ui-ux-design": "UI / UX Design",
  "basic-computer-training": "Basic Computer Training",
};

/**
 * Brochure rows for one course: the printable syllabus built by
 * `scripts/build-syllabus-pdfs.py` from the same JSON the page renders.
 */
export function syllabusFiles(slug: string): { label: string; url: string }[] {
  if (!CURRICULUM[slug]) return [];
  const name = COURSE_NAMES[slug] ?? slug;
  return [{ label: `${name} syllabus (PDF)`, url: `/files/${slug}-syllabus.pdf` }];
}

/** Every course slug that ships with a written syllabus. */
export const CURRICULUM_SLUGS = Object.keys(CURRICULUM);
