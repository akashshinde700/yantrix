import { ICON_NAMES } from "@/lib/content/icons";
import type { AdminField } from "@/components/admin/schema-form";
import type { CollectionKey } from "@/lib/content/types";

const iconField: AdminField = {
  name: "icon",
  label: "Icon",
  type: "select",
  options: ICON_NAMES.map((name) => ({ label: name, value: name })),
  help: "Shown next to this item on the website.",
};

const viewOptions = [
  { label: "Home", value: "home" },
  { label: "Courses", value: "courses" },
  { label: "About Us", value: "about" },
  { label: "Contact Us", value: "contact" },
];

export interface CollectionMeta {
  title: string;
  description?: string;
  addLabel: string;
  titleField: string;
  subtitleField?: string;
  emptyHint?: string;
  defaults: Record<string, unknown>;
  fields: AdminField[];
}

export const COLLECTION_META: Record<CollectionKey, CollectionMeta> = {
  heroSlides: {
    title: "Hero slides",
    description: "The rotating banner at the top of the home page.",
    addLabel: "Add slide",
    titleField: "title",
    subtitleField: "eyebrow",
    defaults: {
      eyebrow: "New batch",
      title: "New hero slide",
      description: "",
      image: "/images/hero-1.png",
      alt: "",
    },
    fields: [
      { name: "eyebrow", label: "Small label above the title", span: 2, placeholder: "Online & Offline Batches" },
      { name: "title", label: "Headline", span: 2 },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image", label: "Image path", placeholder: "/images/hero-1.png", help: "Place images in public/images and reference them like /images/name.png" },
      { name: "alt", label: "Image alt text", help: "Describe the image for accessibility and SEO." },
    ],
  },
  courses: {
    title: "Courses",
    description: "Course cards shown on the Courses page, footer and enquiry form.",
    addLabel: "Add course",
    titleField: "title",
    subtitleField: "description",
    defaults: {
      slug: "new-course",
      title: "New course",
      description: "",
      duration: "3 Months (typical)",
      fee: "On request",
      level: "Beginner",
      modes: ["Online", "Offline"],
      highlights: [],
      icon: "Sparkles",
    },
    fields: [
      { name: "title", label: "Course name" },
      { name: "slug", label: "URL slug", help: "Lowercase, hyphen separated." },
      { name: "description", label: "Short description", type: "textarea" },
      { name: "duration", label: "Duration" },
      { name: "fee", label: "Fee", help: 'Use "On request" if fees are shared on enquiry.' },
      { name: "level", label: "Level", placeholder: "Beginner → Advanced" },
      { name: "modes", label: "Modes", type: "stringList", help: "One per line: Online / Offline" },
      { name: "highlights", label: "Highlights / syllabus chips", type: "stringList", placeholder: "One highlight per line" },
      iconField,
    ],
  },
  faqs: {
    title: "FAQs",
    description: "Questions shown on the home page and in FAQ structured data (AEO).",
    addLabel: "Add question",
    titleField: "question",
    subtitleField: "answer",
    defaults: { question: "New question", answer: "" },
    fields: [
      { name: "question", label: "Question", span: 2 },
      { name: "answer", label: "Answer", type: "textarea", help: "Keep answers direct — AI answer engines quote these." },
    ],
  },
  features: {
    title: "Why choose us",
    description: "Feature cards in the 'Why Choose Us' section.",
    addLabel: "Add feature",
    titleField: "title",
    subtitleField: "description",
    defaults: { title: "New feature", description: "", icon: "Sparkles" },
    fields: [
      { name: "title", label: "Title" },
      iconField,
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  badges: {
    title: "Highlight cards",
    description: "The four small cards right under the hero banner.",
    addLabel: "Add highlight",
    titleField: "title",
    subtitleField: "description",
    defaults: { title: "New highlight", description: "", icon: "Sparkles" },
    fields: [
      { name: "title", label: "Title" },
      iconField,
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  stats: {
    title: "Stats band",
    description: "Numbers displayed in the dark statistics strip.",
    addLabel: "Add stat",
    titleField: "label",
    subtitleField: "sub",
    defaults: { label: "New stat", value: 10, suffix: "+", sub: "", icon: "Star" },
    fields: [
      { name: "label", label: "Label" },
      { name: "value", label: "Value", type: "number" },
      { name: "suffix", label: "Suffix", placeholder: "+ / % / empty" },
      iconField,
      { name: "sub", label: "Caption", type: "textarea" },
    ],
  },
  techStack: {
    title: "Technology ticker",
    description: "Skills shown in the scrolling ticker.",
    addLabel: "Add skill",
    titleField: "label",
    defaults: { label: "New skill" },
    fields: [{ name: "label", label: "Skill name", span: 2 }],
  },
  approachSteps: {
    title: "Training approach",
    description: "The four-step journey shown on the About page.",
    addLabel: "Add step",
    titleField: "title",
    subtitleField: "description",
    defaults: { step: "05", title: "New step", description: "" },
    fields: [
      { name: "step", label: "Step number", placeholder: "01" },
      { name: "title", label: "Title" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  placementPoints: {
    title: "Placement assistance",
    description: "Cards in the placement section.",
    addLabel: "Add point",
    titleField: "title",
    subtitleField: "description",
    defaults: { title: "New point", description: "" },
    fields: [
      { name: "title", label: "Title" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  checklist: {
    title: "About checklist",
    description: "Tick-mark points next to the home page 'About' block.",
    addLabel: "Add point",
    titleField: "label",
    defaults: { label: "New checklist point" },
    fields: [{ name: "label", label: "Point", type: "textarea", span: 2 }],
  },
  trainingModes: {
    title: "Training modes",
    description: "Online / offline mode cards on the home page.",
    addLabel: "Add mode",
    titleField: "name",
    subtitleField: "tagline",
    defaults: {
      name: "New mode",
      tagline: "",
      points: [],
      cta: "Enquire now",
      icon: "MonitorSmartphone",
      style: "light",
    },
    fields: [
      { name: "name", label: "Mode name" },
      { name: "tagline", label: "Tagline" },
      { name: "points", label: "Bullet points", type: "stringList" },
      { name: "cta", label: "Button label" },
      {
        name: "style",
        label: "Card style",
        type: "select",
        options: [
          { label: "Light card", value: "light" },
          { label: "Dark card", value: "dark" },
        ],
      },
      iconField,
    ],
  },
  trustChips: {
    title: "Hero trust chips",
    description: "Floating chips on the right side of the hero banner.",
    addLabel: "Add chip",
    titleField: "title",
    subtitleField: "subtitle",
    defaults: { title: "New chip", subtitle: "", icon: "Sparkles" },
    fields: [
      { name: "title", label: "Title" },
      { name: "subtitle", label: "Subtitle" },
      iconField,
    ],
  },
  quickFacts: {
    title: "Quick facts (About page)",
    description: "At-a-glance facts — great for GEO / AI answers.",
    addLabel: "Add fact",
    titleField: "label",
    subtitleField: "value",
    defaults: { label: "Label", value: "Value", icon: "Sparkles" },
    fields: [
      { name: "label", label: "Label" },
      { name: "value", label: "Value" },
      iconField,
    ],
  },
  contactSteps: {
    title: "After-enquiry steps",
    description: "What happens after someone submits the contact form.",
    addLabel: "Add step",
    titleField: "label",
    defaults: { label: "New step" },
    fields: [{ name: "label", label: "Step text", type: "textarea", span: 2 }],
  },
  navHeader: {
    title: "Main navigation",
    description: "Links in the header menu.",
    addLabel: "Add link",
    titleField: "label",
    subtitleField: "view",
    defaults: { label: "New link", view: "home" },
    fields: [
      { name: "label", label: "Label" },
      { name: "view", label: "Page", type: "select", options: viewOptions },
    ],
  },
  navFooter: {
    title: "Footer quick links",
    description: "Links in the footer navigation.",
    addLabel: "Add link",
    titleField: "label",
    subtitleField: "view",
    defaults: { label: "New link", view: "home" },
    fields: [
      { name: "label", label: "Label" },
      { name: "view", label: "Page", type: "select", options: viewOptions },
    ],
  },
  courseChips: {
    title: "Courses page chips",
    description: "Small pills under the Courses page heading.",
    addLabel: "Add chip",
    titleField: "label",
    defaults: { label: "New chip" },
    fields: [{ name: "label", label: "Chip label", span: 2 }],
  },
  courseIncludes: {
    title: "Course inclusions",
    description: "Reserved for future course-detail pages.",
    addLabel: "Add item",
    titleField: "label",
    defaults: { label: "New item" },
    fields: [{ name: "label", label: "Label", span: 2 }],
  },
};
