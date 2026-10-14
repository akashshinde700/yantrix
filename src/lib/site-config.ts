/**
 * Central site configuration for Yantrix Technology.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  EDITABLE PLACEHOLDERS (marked with TODO):
 *  1. whatsappNumber  → replace with the business WhatsApp number
 *                       (country code + number, digits only, no "+" or spaces)
 *  2. contact.phone   → business phone number
 *  3. contact.email   → business email address
 *  4. contact.address → office / training-centre address
 *  Nothing here is fabricated — all unknown values are clearly marked TODO.
 * ─────────────────────────────────────────────────────────────────────
 */

export const siteConfig = {
  name: "Yantrix Technology",
  shortName: "Yantrix",
  domain: "YantrixTechnology.com",
  url: "https://yantrixtechnology.com",
  tagline: "Practical IT Training for Real Careers",
  positioning:
    "Yantrix Technology helps students and professionals learn practical IT skills through online and offline training, live project-based learning, and placement assistance.",
  foundedYear: 2024,

  // TODO: Replace with the real WhatsApp business number (digits only, with country code, e.g. 91XXXXXXXXXX)
  whatsappNumber: "910000000000",

  contact: {
    // TODO: Replace with real business details
    phone: "TODO — to be updated",
    email: "TODO — to be updated",
    address: "TODO — to be updated",
    hours: "Mon – Sat · 9:00 AM – 7:00 PM",
  },
} as const;

/** Build a wa.me deep-link with a pre-filled enquiry message. */
export function whatsappUrl(message?: string): string {
  const text = encodeURIComponent(
    message ??
      `Hello ${siteConfig.name}, I would like to know more about your IT courses.`
  );
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${text}`;
}

/** Per-view SEO titles & descriptions (updated on client-side navigation). */
export const viewSeo = {
  home: {
    title:
      "Yantrix Technology | IT Training Institute — Online & Offline Courses with Placement Assistance",
    description:
      "Yantrix Technology is an IT training institute offering online and offline courses in Full Stack Development, Web Development, Python, Java, Data Analytics and more — with live projects and placement assistance.",
  },
  courses: {
    title:
      "IT Courses — Full Stack, Web Development, Python, Java & More | Yantrix Technology",
    description:
      "Explore career-oriented IT courses at Yantrix Technology: Full Stack Development, Web Development, Python, Java, Data Analytics, Digital Marketing, UI/UX Design and basic computer training. Online & offline batches with placement assistance.",
  },
  about: {
    title: "About Yantrix Technology — Practical IT Training Institute Since 2024",
    description:
      "Yantrix Technology, founded in 2024, is an IT training institute focused on practical learning, live projects and career growth. Learn about our mission, vision and training approach.",
  },
  contact: {
    title: "Contact Yantrix Technology — Enquire About IT Courses & Admission",
    description:
      "Contact Yantrix Technology for course enquiries and admissions. Fill in the enquiry form or reach us on WhatsApp — we usually respond within 24 hours.",
  },
} as const;

export type SiteView = keyof typeof viewSeo;
