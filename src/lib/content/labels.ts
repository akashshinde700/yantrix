/**
 * Interface text ("labels").
 *
 * Every button, badge and micro-copy string that used to be hard-coded in a
 * component lives here, so the admin panel can rewrite any of them without a
 * deploy — see **Admin → Interface text**.
 *
 * How it is wired:
 *   - `LABEL_DEFAULTS` is merged into the content document (`content.labels`)
 *     by `DEFAULT_CONTENT`, and `mergeDeep` in the store backfills any key that
 *     is missing from older saved content, so new keys appear for existing
 *     installs automatically.
 *   - Components read them with `useLabels()` from `@/lib/content/provider`.
 *   - `LABEL_GROUPS` is the single source of truth for both the defaults and
 *     the admin form, so a key can never exist in one without the other.
 *
 * Keys are flat and dotted-free (`footer.explore`) because the admin form uses
 * dot-notation paths to address nested objects — flat keys keep them verbatim.
 */

export interface LabelField {
  /** Stored key — also the label's identity in the content document. */
  key: string;
  /** Human name shown in the admin panel. */
  label: string;
  /** Default value; also the placeholder text. */
  value: string;
  type?: "text" | "textarea";
  help?: string;
}

export interface LabelGroup {
  id: string;
  title: string;
  description?: string;
  fields: LabelField[];
}

export const LABEL_GROUPS: LabelGroup[] = [
  {
    id: "navigation",
    title: "Header & footer",
    description:
      "Buttons and column headings in the sticky header and the footer. Menu links themselves live under Pages & navigation.",
    fields: [
      { key: "header.ctaContact", label: "Header · enquiry button", value: "Contact for Admission" },
      { key: "header.ctaWhatsapp", label: "Header · WhatsApp button", value: "Chat on WhatsApp" },
      { key: "footer.exploreHeading", label: "Footer · first column heading", value: "Explore" },
      { key: "footer.coursesHeading", label: "Footer · courses column heading", value: "Courses" },
      { key: "footer.visitHeading", label: "Footer · contact column heading", value: "Visit or call" },
      { key: "footer.followHeading", label: "Footer · social links label", value: "Social media" },
      { key: "footer.ctaExplore", label: "Footer · CTA primary button", value: "Explore Courses" },
      { key: "footer.ctaWhatsapp", label: "Footer · CTA WhatsApp button", value: "WhatsApp Us" },
      { key: "footer.backToOrbit", label: "Footer · back to top link", value: "Back to orbit" },
      { key: "footer.adminLink", label: "Footer · admin link", value: "Admin" },
    ],
  },
  {
    id: "common",
    title: "Reused buttons",
    description: "These strings appear in several places — edit once, it changes everywhere.",
    fields: [
      { key: "common.exploreCourses", label: "Explore courses button", value: "Explore Courses" },
      { key: "common.askWhatsapp", label: "Ask on WhatsApp button", value: "Ask on WhatsApp" },
      { key: "common.skipToContent", label: "Accessibility skip link", value: "Skip to main content" },
    ],
  },
  {
    id: "hero",
    title: "Hero & popup",
    fields: [
      { key: "hero.scrollHint", label: "Hero · scroll hint", value: "Scroll to explore" },
      { key: "popup.title", label: "Welcome popup · title", value: "Talk to Us on WhatsApp" },
      { key: "popup.explore", label: "Welcome popup · courses button", value: "Explore Courses" },
      { key: "popup.dismiss", label: "Welcome popup · dismissal note", value: "You can dismiss anytime" },
      { key: "door.open", label: "Intro door · button", value: "Open the door" },
      { key: "door.autoOpen", label: "Intro door · auto-open note", value: "Opens automatically in" },
    ],
  },
  {
    id: "home",
    title: "Home page",
    description: "Micro-copy inside the home page blocks. Section headings live under Page sections.",
    fields: [
      { key: "home.moreAbout", label: "About block · secondary button", value: "More About Us" },
      { key: "home.talkCounsellor", label: "About block · primary button", value: "Talk to a Counsellor" },
      { key: "home.ctaEyebrow", label: "Closing CTA · eyebrow", value: "Your next step" },
      { key: "home.ctaContact", label: "Closing CTA · contact button", value: "Contact for Admission" },
      { key: "home.ctaWhatsapp", label: "Closing CTA · WhatsApp button", value: "WhatsApp Us" },
      { key: "partners.note", label: "Partners · footnote under the wall", value: "Partner & certification logos shown with permission" },
      { key: "gallery.photoLabel", label: "Gallery · show-all chip", value: "All" },
      { key: "gallery.close", label: "Gallery · close lightbox label", value: "Close photo" },
      { key: "videos.viewMore", label: "Videos · channel link", value: "View more on YouTube" },
      { key: "videos.play", label: "Videos · play label", value: "Play" },
      { key: "videos.comingSoon", label: "Videos · empty state", value: "Video coming soon" },
      { key: "testimonials.watch", label: "Testimonials · video button", value: "Watch story" },
      { key: "brochure.request", label: "Brochure · fallback button", value: "Request the brochure" },
      { key: "brochure.whatsapp", label: "Brochure · WhatsApp button", value: "Get it on WhatsApp" },
      { key: "brochure.badge", label: "Brochure · cover badge", value: "Brochure" },
      { key: "brochure.coverLines", label: "Brochure · cover subtitle", value: "Programs · Batches · Fees · Placement" },
      { key: "brochure.coverAlt", label: "Brochure · cover image alt text", value: "Course brochure cover" },
      { key: "app.ask", label: "App · fallback button", value: "Ask about the app" },
      { key: "app.whatsapp", label: "App · WhatsApp button", value: "Ask on WhatsApp" },
      { key: "app.previewTitle", label: "App · mock-up title", value: "My batch" },
      { key: "app.previewRow1", label: "App · mock-up row 1", value: "Recorded classes" },
      { key: "app.previewRow2", label: "App · mock-up row 2", value: "Notes & PDFs" },
      { key: "app.previewRow3", label: "App · mock-up row 3", value: "Assignments" },
      { key: "app.previewRow4", label: "App · mock-up row 4", value: "Doubt support" },
      { key: "app.previewNote", label: "App · mock-up footnote", value: "App preview" },
      { key: "app.imageAlt", label: "App · screenshot alt text", value: "Learning app screenshot" },
      { key: "centres.call", label: "Centres · directions button", value: "Directions" },
      { key: "centres.imageAlt", label: "Centres · photo suffix", value: "centre" },
      { key: "faq.helpTitle", label: "FAQ · help prompt", value: "Still have a question?" },
      { key: "placed.searchPlaceholder", label: "Placed students · search placeholder", value: "Search placed students" },
      { key: "placed.searchHelp", label: "Placed students · search description", value: "Search by name or company, or pick a company below." },
      { key: "placed.filterAll", label: "Placed students · show-all filter", value: "All placed students" },
      { key: "placed.empty", label: "Placed students · empty result", value: "No students match your search." },
      { key: "trainers.linkedin", label: "Mentors · LinkedIn link", value: "LinkedIn" },
      { key: "trainers.profile", label: "Mentors · profile link", value: "View full profile" },
      { key: "trainers.years", label: "Mentors · years (profile panel)", value: "years experience" },
      { key: "trainers.yearsShort", label: "Mentors · years badge", value: "yrs" },
      { key: "trainers.yearsLabel", label: "Mentors · experience caption", value: "years of experience" },
      { key: "trainers.countLabel", label: "Mentors · count chip", value: "mentors" },
      { key: "trainers.tracksLabel", label: "Mentors · tracks chip", value: "specialisations" },
      { key: "trainers.filterAll", label: "Mentors · show-all filter", value: "All mentors" },
      { key: "trainers.sectionLabel", label: "Mentors · section aria label", value: "Meet your mentors" },
    ],
  },
  {
    id: "courses",
    title: "Courses page",
    fields: [
      { key: "courses.all", label: "Filter chip · all courses", value: "All courses" },
      { key: "courses.duration", label: "Card · duration label", value: "Duration" },
      { key: "courses.fee", label: "Card · fee label", value: "Course fee" },
      { key: "courses.details", label: "Card · details label", value: "Details" },
      { key: "courses.viewDetails", label: "Card · details button", value: "View details" },
      { key: "courses.enquire", label: "Card · enquire button", value: "Enquire now" },
      { key: "courses.talkToUs", label: "Page · counselling button", value: "Talk to us" },
      { key: "courses.whatsapp", label: "Page · WhatsApp button", value: "WhatsApp Us" },
    ],
  },
  {
    id: "course-detail",
    title: "Course detail page",
    description:
      "Labels around the course page. The course content itself (curriculum, batches, projects…) is edited per course.",
    fields: [
      { key: "course.breadcrumb", label: "Breadcrumb · parent label", value: "Courses" },
      { key: "course.batchStarts", label: "Batch strip · countdown label", value: "Batch starts in" },
      { key: "course.instructor", label: "Facts · instructor label", value: "Instructor" },
      { key: "course.language", label: "Facts · language label", value: "Language" },
      { key: "course.location", label: "Facts · location label", value: "Location" },
      { key: "course.fee", label: "Price · fee label", value: "Course fee" },
      { key: "course.enquire", label: "Price · primary button", value: "Enquire for this course" },
      { key: "course.askWhatsapp", label: "Price · WhatsApp button", value: "Ask on WhatsApp" },
      { key: "course.enquireNow", label: "Enquiry form · submit", value: "Enquire now" },
      { key: "course.specialisations", label: "Specialisations block · heading", value: "Specialisations inside this program" },
      { key: "course.helpTitle", label: "FAQ · help prompt", value: "Still have questions?" },
      { key: "course.contactUs", label: "FAQ · contact button", value: "Contact us" },
      { key: "course.whatsapp", label: "FAQ · WhatsApp button", value: "WhatsApp" },
      { key: "course.viewCourse", label: "Related · card button", value: "View course" },
      { key: "course.capstone", label: "Projects · capstone badge", value: "Capstone" },
      { key: "course.miniProjects", label: "Projects · mini projects badge", value: "Mini projects along the way" },
      { key: "course.bookSeat", label: "Batches · book button", value: "Book a seat" },
      { key: "course.talkSupport", label: "Placement · support button", value: "Talk to us about the support" },
      { key: "course.smallBatches", label: "Batches · note", value: "Small batches, personal feedback" },
      { key: "course.brochureText", label: "Brochure · card text", value: "Module list, tools and project details in one PDF." },
      { key: "course.downloadBrochure", label: "Brochure · download button", value: "Download brochure" },
      { key: "course.getSyllabus", label: "Brochure · fallback button", value: "Get the syllabus" },
    ],
  },
  {
    id: "course-page",
    title: "Course page headings",
    description:
      "Eyebrows, headings and the short intros on every course detail page. Course-specific text (curriculum, batches, projects) is edited per course under Courses.",
    fields: [
      { key: "cp.aboutEyebrow", label: "About · eyebrow", value: "About the course" },
      { key: "cp.overviewLabel", label: "Section nav · first link", value: "Overview" },
      { key: "cp.offerEyebrow", label: "What we offer · eyebrow", value: "What do we offer" },
      { key: "cp.offerTitle", label: "What we offer · default heading", value: "What this program gives you" },
      { key: "cp.toolsEyebrow", label: "Tools · eyebrow", value: "Tools covered" },
      { key: "cp.toolsTitle", label: "Tools · heading", value: "The stack you will work with" },
      { key: "cp.toolsText", label: "Tools · intro", type: "textarea", value: "Everything here is introduced in class and used in a project — no theory-only tours." },
      { key: "cp.outcomesEyebrow", label: "Outcomes · eyebrow", value: "Learning outcomes" },
      { key: "cp.outcomesText", label: "Outcomes · intro", type: "textarea", value: "Each point below is something you will have built, practised or shipped by the end of the program." },
      { key: "cp.reviewsEyebrow", label: "Reviews · eyebrow", value: "Student reviews" },
      { key: "cp.reviewsTitle", label: "Reviews · heading", value: "What our students say" },
      { key: "cp.reviewsText", label: "Reviews · intro", type: "textarea", value: "Feedback from learners who completed this program." },
      { key: "cp.faqEyebrow", label: "FAQ · eyebrow", value: "FAQ" },
      { key: "cp.faqText", label: "FAQ · intro", type: "textarea", value: "Straight answers. If yours is not here, message us on WhatsApp and we will reply the same day." },
      { key: "cp.relatedEyebrow", label: "Related · eyebrow", value: "Keep exploring" },
      { key: "cp.projectsEyebrow", label: "Projects · eyebrow", value: "Projects" },
      { key: "cp.projectsText", label: "Projects · intro", type: "textarea", value: "Build-along practice projects during the modules, then one portfolio-grade capstone you can demo in interviews." },
      { key: "cp.includedEyebrow", label: "Included · eyebrow", value: "What's included" },
      { key: "cp.includedTitle", label: "Included · heading", value: "Everything that comes with the program" },
      { key: "cp.includedText", label: "Included · intro", type: "textarea", value: "Not just lectures — the notes, practice, feedback and support that turn classes into skills." },
      { key: "cp.batchesEyebrow", label: "Batches · eyebrow", value: "Batches & timings" },
      { key: "cp.batchesTitle", label: "Batches · heading", value: "Pick the batch that fits your week" },
      { key: "cp.batchesText", label: "Batches · intro", type: "textarea", value: "Seats are limited per batch so every learner gets attention. Ask us before a batch fills up." },
      { key: "cp.careerEyebrow", label: "Career support · eyebrow", value: "Career support" },
      { key: "cp.careerTitle", label: "Career support · default heading", value: "Placement & career support" },
      { key: "cp.trainerEyebrow", label: "Trainer · eyebrow", value: "Your mentor" },
      { key: "cp.trainerTitle", label: "Trainer · heading", value: "Learn from certified experts" },
      { key: "cp.audienceEyebrow", label: "Who should attend · eyebrow", value: "Who should attend?" },
      { key: "cp.audienceTitle", label: "Who should attend · default heading", value: "Is this course right for you?" },
      { key: "cp.audienceText", label: "Who should attend · intro", type: "textarea", value: "This program is built for people who want job-ready skills, not just another certificate. It fits you if you are one of these:" },
      { key: "cp.audienceNote", label: "Who should attend · closing note", type: "textarea", value: "Not sure? Ask us — we will tell you honestly whether this course fits your goal." },
      { key: "cp.certificateEyebrow", label: "Certification · eyebrow", value: "Certification" },
      { key: "cp.certificateTitle", label: "Certification · default heading", value: "Stand out with an industry-recognized certification" },
      { key: "cp.certificateText", label: "Certification · default text", type: "textarea", value: "Finish the modules, assignments and the final project to earn a certificate you can add to your resume and LinkedIn profile." },
      { key: "cp.capstoneHeading", label: "Projects · capstone heading", value: "Capstone projects" },
      { key: "cp.projectCount", label: "Projects · count suffix", value: "projects" },
      { key: "cp.certificatePoint1", label: "Certification · point 1", value: "Verifiable certificate" },
      { key: "cp.certificatePoint2", label: "Certification · point 2", value: "Resume & LinkedIn ready" },
      { key: "cp.certificatePoint3", label: "Certification · point 3", value: "Project-based assessment" },
      { key: "cp.certificateAlt", label: "Certification · image alt text", value: "Course certificate" },
      { key: "cp.capstoneText", label: "Projects · capstone note", value: "Portfolio-grade builds you can demo in an interview." },
      { key: "cp.miniHeading", label: "Projects · mini projects heading", value: "Mini projects" },
      { key: "cp.miniText", label: "Projects · mini projects note", value: "Short build-along exercises during the modules." },
      { key: "cp.curriculumEyebrow", label: "Curriculum · eyebrow", value: "Course curriculum" },
    ],
  },
  {
    id: "contact",
    title: "Contact page",
    fields: [
      { key: "contact.message", label: "Form · message label", value: "Message" },
      { key: "contact.send", label: "Form · submit button", value: "Send Enquiry" },
      { key: "contact.sendAnother", label: "Form · success button", value: "Send Another Enquiry" },
      { key: "contact.startWhatsapp", label: "WhatsApp panel · button", value: "Start WhatsApp Chat" },
      { key: "contact.chatWhatsapp", label: "WhatsApp panel · link", value: "Chat on WhatsApp" },
    ],
  },
  {
    id: "floating",
    title: "Floating helpers",
    fields: [
      { key: "float.chat", label: "WhatsApp bubble label", value: "Chat with us" },
      { key: "legal.contact", label: "Legal pages · contact heading", value: "Contact us about this page" },
      { key: "guide.title", label: "Course guide · title", value: "Ask Yantra" },
      { key: "guide.subtitle", label: "Course guide · subtitle", value: "Your course guide" },
      { key: "guide.placeholder", label: "Course guide · placeholder", value: "Ask Yantra, the course guide" },
      { key: "guide.ask", label: "Course guide · send button", value: "Ask a question" },
    ],
  },
];

/** Flat map of every label key → default value. */
export const LABEL_DEFAULTS: Record<string, string> = Object.fromEntries(
  LABEL_GROUPS.flatMap((group) => group.fields.map((field) => [field.key, field.value]))
);

/** Fallback for a key that is not in the content document (older installs). */
export function defaultLabel(key: string): string {
  return LABEL_DEFAULTS[key] ?? key;
}
