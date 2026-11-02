/**
 * Shared content types for the Yantrix Technology website + admin panel.
 *
 * Every piece of text, contact detail, SEO setting and list shown on the
 * public site lives in a single `SiteContent` document. The website reads it
 * through a React context (see `provider.tsx`) and the admin panel edits it
 * through the `/api/admin/content` endpoint.
 */

export type SiteView = "home" | "courses" | "about" | "contact";

export const SITE_VIEWS: SiteView[] = ["home", "courses", "about", "contact"];

/* ───────────────────────────── settings ───────────────────────────── */

export interface SocialLinks {
  instagram: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  twitter: string;
  telegram: string;
  whatsappChannel: string;
  threads: string;
  googleBusiness: string;
}

export interface ContactDetails {
  phone: string;
  mobile: string;
  email: string;
  address: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  hours: string;
  mapLink: string;
  mapEmbedUrl: string;
}

export interface SiteSettings {
  name: string;
  shortName: string;
  domain: string;
  url: string;
  tagline: string;
  positioning: string;
  foundedYear: number;
  whatsappNumber: string;
  whatsappMessage: string;
  supportEmail: string;
  contact: ContactDetails;
  social: SocialLinks;
  topBar: {
    badge: string;
    note: string;
    extra: string;
  };
  footer: {
    ctaTitle: string;
    ctaText: string;
    disclaimer: string;
    copyright: string;
  };
  legal: {
    privacyTitle: string;
    privacyText: string;
    termsTitle: string;
    termsText: string;
    refundEnabled: boolean;
    refundTitle: string;
    refundText: string;
  };
}

/* ───────────────────────────── SEO / AEO / GEO ───────────────────────────── */

export interface SeoGlobal {
  /** Browser-tab title of the home page */
  defaultTitle: string;
  /** `%s` is replaced by the page title */
  titleTemplate: string;
  defaultDescription: string;
  keywords: string[];
  ogImage: string;
  twitterHandle: string;
  locale: string;
  themeColor: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  googleSiteVerification: string;
  bingSiteVerification: string;
  gaMeasurementId: string;
  clarityId: string;
  organizationType: string;
  priceRange: string;
  areaServed: string[];
  languages: string[];
  geoLatitude: string;
  geoLongitude: string;
  geoPlacename: string;
}

export interface SeoPageEntry {
  /** `path` is used for canonical + sitemap */
  path: string;
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  noindex: boolean;
  /** Priority in the generated sitemap (0.0 – 1.0) */
  priority: number;
}

export interface SeoAeoConfig {
  llmsTxtEnabled: boolean;
  llmsIntro: string;
  keyFacts: { label: string; value: string }[];
  enableOrganizationSchema: boolean;
  enableWebsiteSchema: boolean;
  enableLocalBusinessSchema: boolean;
  enableCourseSchema: boolean;
  enableFaqSchema: boolean;
  enableBreadcrumbSchema: boolean;
  speakableSelectors: string[];
  citationSummary: string;
}

export interface SeoConfig {
  global: SeoGlobal;
  pages: Record<SiteView, SeoPageEntry>;
  aeo: SeoAeoConfig;
}

/* ───────────────────────────── section copy ───────────────────────────── */

export const SECTION_KEYS = [
  "badges",
  "why",
  "modes",
  "stats",
  "about",
  "placement",
  "faq",
  "cta",
  "trainers",
  "placedStudents",
  "coursesPage",
  "aboutPage",
  "contactPage",
  "gallery",
  "partners",
  "videos",
  "testimonials",
  "brochure",
  "app",
  "centres",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export interface SectionCopy {
  eyebrow: string;
  title: string;
  description: string;
  hidden: boolean;
}

/* ───────────────────────────── page copy ───────────────────────────── */

export interface HomePageCopy {
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroTrustChips: boolean;
  /** Brochure download block */
  brochureTitle: string;
  brochureText: string;
  brochurePoints: string[];
  brochureCta: string;
  /** Public PDF / Drive link */
  brochureUrl: string;
  brochureImage: string;
  /** Mobile app block */
  appTitle: string;
  appText: string;
  appUrl: string;
  appCta: string;
  appImage: string;
  aboutImage: string;
  aboutImageAlt: string;
  aboutBadgeTitle: string;
  aboutBadgeText: string;
}

export interface CoursesPageCopy {
  note: string;
  helpTitle: string;
  helpText: string;
  helpCta: string;
}

export interface AboutPageCopy {
  storyTitle: string;
  storyParagraphs: string[];
  image: string;
  imageAlt: string;
  imageCaption: string;
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  disclaimer: string;
}

export interface ContactPageCopy {
  formTitle: string;
  formSubtitle: string;
  successTitle: string;
  successText: string;
  infoTitle: string;
  whatsappTitle: string;
  whatsappText: string;
  afterTitle: string;
  responseNote: string;
}

export interface PageCopy {
  home: HomePageCopy;
  courses: CoursesPageCopy;
  about: AboutPageCopy;
  contact: ContactPageCopy;
}

/* ───────────────────────────── collections ───────────────────────────── */

export interface BaseItem {
  id: string;
  sortOrder: number;
  active: boolean;
}

export interface HeroSlide extends BaseItem {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  alt: string;
}

/**
 * A specialisation / track inside a course (e.g. "MERN Stack with AI"), shown
 * as its own card on the course detail page.
 */
export interface CourseTrack {
  title: string;
  subtitle: string;
  points: string[];
}

/**
 * "Why this course" card. With `stat` + `tag` it renders as a highlighted
 * figure card (e.g. "2.5L+ · Jobs in India · Salary"), otherwise as a plain
 * benefit card.
 */
export interface CourseBenefit {
  title: string;
  description: string;
  stat?: string;
  tag?: string;
}

/** One row of the "what's included" icon grid. */
export interface CourseIncluded {
  label: string;
  icon?: string;
}

/** Mini project or capstone project card. */
export interface CourseProject {
  title: string;
  description: string;
  image?: string;
}

/** One upcoming batch shown in the batches table. */
export interface CourseBatch {
  label: string;
  timing: string;
  starts: string;
  seats: string;
  mode?: string;
  /** ISO date (YYYY-MM-DD) — powers the countdown and Course schema startDate. */
  startDate?: string;
}

/** Trainer card for the course page. */
export interface CourseTrainer {
  name: string;
  role: string;
  photo?: string;
  bio?: string;
}

/** One accordion section of the syllabus. */
export interface CourseModule {
  title: string;
  topics: string[];
}

/** A student review shown on the course detail page. */
export interface CourseReview {
  name: string;
  role: string;
  quote: string;
}

/** A course-specific question, merged with the generated Q&A for SEO. */
export interface CourseFaqItem {
  question: string;
  answer: string;
}

export interface Course extends BaseItem {
  slug: string;
  title: string;
  description: string;
  duration: string;
  fee: string;
  level: string;
  modes: string[];
  highlights: string[];
  icon: string;

  /*
   * Everything below is optional so content saved before the detail page
   * existed keeps rendering (the page falls back to the fields above), and the
   * admin panel can fill sections in gradually.
   */

  /** One-line promise under the headline */
  tagline?: string;
  /** Corner ribbon on the card, e.g. "Most popular" */
  badge?: string;
  coverImage?: string;
  coverAlt?: string;
  /** Trainer / mentor line */
  instructor?: string;
  /** "Hindi, English, Marathi" */
  language?: string;
  /** e.g. "New batch every month · weekday & weekend" */
  batchNote?: string;
  /** e.g. "Only 15 seats per batch" */
  seatsNote?: string;
  /** Third line of the price card, e.g. "2 instalments available" */
  priceNote?: string;
  /** Small stat chips under the headline */
  heroStats?: string[];
  /** e.g. "Designed for freshers & working professionals" */
  audience?: string;
  aboutTitle?: string;
  aboutParagraphs?: string[];
  aboutImage?: string;
  aboutImageAlt?: string;
  tracks?: CourseTrack[];
  benefits?: CourseBenefit[];
  /** Tools / technologies covered */
  tools?: string[];

  /* ── page sections that mirror a full course landing page ── */

  /** "What's included" icon grid (recordings, notes, certification…) */
  includes?: CourseIncluded[];
  /** Short practice builds */
  miniProjects?: CourseProject[];
  /** Portfolio / capstone projects */
  projects?: CourseProject[];
  /** Upcoming batches table */
  batches?: CourseBatch[];
  placementTitle?: string;
  placementText?: string;
  placementPoints?: string[];
  trainer?: CourseTrainer | null;
  certificateTitle?: string;
  certificateText?: string;
  certificateImage?: string;
  /** Announcement strip above the course page, e.g. "Admissions open" */
  urgencyNote?: string;
  /** ISO date the next batch starts — drives the countdown in that strip */
  batchStartDate?: string;
  /** "What you'll learn" list — falls back to `highlights` */
  learn?: string[];
  curriculum?: CourseModule[];
  brochureTitle?: string;
  brochureUrl?: string;
  reviews?: CourseReview[];
  faqs?: CourseFaqItem[];
  ctaTitle?: string;
  ctaText?: string;
  ctaLabel?: string;
  /** Pre-filled WhatsApp text for this course */
  whatsappMessage?: string;
  /** Optional search title / description override */
  seoTitle?: string;
  seoDescription?: string;
}

export interface Faq extends BaseItem {
  question: string;
  answer: string;
}

export interface Feature extends BaseItem {
  title: string;
  description: string;
  icon: string;
}

export interface Stat extends BaseItem {
  label: string;
  value: number;
  suffix: string;
  sub: string;
  icon: string;
}

export interface ApproachStep extends BaseItem {
  step: string;
  title: string;
  description: string;
}

export interface PlacementPoint extends BaseItem {
  title: string;
  description: string;
}

export interface TrainingMode extends BaseItem {
  name: string;
  tagline: string;
  points: string[];
  cta: string;
  icon: string;
  style: "light" | "dark";
}

export interface TrustChip extends BaseItem {
  title: string;
  subtitle: string;
  icon: string;
}

export interface QuickFact extends BaseItem {
  label: string;
  value: string;
  icon: string;
}

export interface ContactStep extends BaseItem {
  text: string;
}

export interface NavLink extends BaseItem {
  label: string;
  view: SiteView;
  /**
   * Optional section id on that page (e.g. "gallery"). When set, the link jumps
   * straight to that block instead of the top of the page.
   */
  hash?: string;
}

export interface Trainer extends BaseItem {
  name: string;
  /** /media/<id> upload or /images/... path */
  photo: string;
  designation: string;
  /**
   * Where the mentor works today — "Reliance Jio", "IIT Bombay", "Freelance".
   * Shown under the name on the mentor card, like the reference site's
   * "organisation" line.
   */
  company: string;
  /**
   * What they teach — "Full Stack", "Data Science", "AWS DevOps".
   * Drives the specialisation filter chips above the mentor grid.
   */
  specialisation: string;
  /** total years in the industry (0 = hide the badge) */
  experienceYears: number;
  bio: string;
  /** one role per line, e.g. "Senior Developer — Infosys (2018–2023)" */
  professionalExperience: string[];
  /** one qualification per line */
  education: string[];
  skills: string[];
  /** industries / domains worked in */
  industryExperience: string[];
  linkedin: string;
}

export interface PlacedStudent extends BaseItem {
  name: string;
  photo: string;
  company: string;
  role: string;
  course: string;
  /** e.g. "2025" or "Jan 2025 batch" */
  batch: string;
  /** optional, e.g. "4.2 LPA" — leave empty to hide */
  package: string;
  /** optional short quote from the student */
  quote: string;
}

export interface SimpleItem extends BaseItem {
  label: string;
  value?: string;
}

/* ── home page sections that mirror a campus landing page ── */

/** One message in the scrolling offer / announcement ticker. */
export interface Announcement extends BaseItem {
  text: string;
  /** Short, loud bit, e.g. "FLAT 50% OFF" */
  highlight: string;
  /** lucide icon name */
  icon: string;
}

/** A campus photo in the gallery. */
export interface GalleryPhoto extends BaseItem {
  title: string;
  /** Groups the photo under a filter chip, e.g. Classroom / Lab / Event */
  category: string;
  image: string;
  alt: string;
}

/** Certification / collaboration logo (IBM-style partner strip). */
export interface Partner extends BaseItem {
  name: string;
  logo: string;
  description: string;
  link: string;
  /** Small label above the name, e.g. "Certification partner" */
  kind: string;
}

/** A YouTube video card in the "watch our learning journey" section. */
export interface VideoItem extends BaseItem {
  title: string;
  description: string;
  /** The 11-character YouTube id (watch?v=THIS) */
  youtubeId: string;
  /** Optional custom thumbnail; YouTube's own is used when empty */
  thumbnail: string;
  duration: string;
}

/** Student feedback shown as a card (quote and/or video). */
export interface Testimonial extends BaseItem {
  name: string;
  /** Course / batch / current role */
  role: string;
  quote: string;
  photo: string;
  /** Optional YouTube id for a video testimonial */
  youtubeId: string;
  /** 1–5 */
  rating: number;
}

/** One physical training centre in the "find us here" section. */
export interface Centre extends BaseItem {
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapLink: string;
  image: string;
}

export const COLLECTION_KEYS = [
  "heroSlides",
  "courses",
  "faqs",
  "features",
  "badges",
  "stats",
  "techStack",
  "approachSteps",
  "placementPoints",
  "checklist",
  "trainingModes",
  "trustChips",
  "quickFacts",
  "contactSteps",
  "navHeader",
  "navFooter",
  "courseChips",
  "courseIncludes",
  "trainers",
  "placedStudents",
  "announcements",
  "gallery",
  "partners",
  "videos",
  "testimonials",
  "centres",
] as const;

export type CollectionKey = (typeof COLLECTION_KEYS)[number];

export type ContentItem = BaseItem & Record<string, unknown>;

export type CollectionMap = Record<CollectionKey, ContentItem[]>;

/* ───────────────────────────── root document ───────────────────────────── */

export interface SiteContent {
  version: number;
  updatedAt: string;
  settings: SiteSettings;
  seo: SeoConfig;
  sections: Record<SectionKey, SectionCopy>;
  pages: PageCopy;
  collections: CollectionMap;
  /**
   * Interface text — buttons, badges and micro-copy. Keyed flat (see
   * `src/lib/content/labels.ts`); the store backfills new keys automatically.
   */
  labels: Record<string, string>;
}

/* ────────────────────────────── media ────────────────────────────── */

/** A file in the media library (`/media/<id>`). */
export interface MediaEntry {
  id: string;
  url: string;
  mime: string;
  bytes: number;
  createdAt: string;
}

/* ───────────────────────────── enquiry ───────────────────────────── */

export type EnquiryStatus = "new" | "contacted" | "enrolled" | "closed" | "spam";

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  mobile: string;
  course: string;
  message: string | null;
  status: EnquiryStatus;
  notes: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

/* ───────────────────────────── admin ───────────────────────────── */

export type AdminRole = "owner" | "editor" | "viewer";

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  /**
   * Session generation. Embedded in every session token and bumped whenever the
   * password changes, the account is deactivated, or the owner signs the account
   * out everywhere — which invalidates tokens already in the wild.
   */
  sessionVersion: number;
}

/** Fields an update may change; everything else is immutable per row. */
export interface AdminPatch {
  name?: string;
  email?: string;
  passwordHash?: string;
  role?: AdminRole;
  active?: boolean;
  lastLoginAt?: string | null;
  sessionVersion?: number;
}

export interface AdminAuditEntry {
  id: string;
  actorEmail: string;
  action: string;
  target: string;
  createdAt: string;
}

export type PublicAdmin = Omit<AdminAccount, "passwordHash">;
