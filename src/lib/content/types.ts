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
}

export interface Trainer extends BaseItem {
  name: string;
  /** /media/<id> upload or /images/... path */
  photo: string;
  designation: string;
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
