import { SiteShell } from "@/components/site/site-shell";
import { courses, faqs } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

/* ────────────────────────────────────────────────────────────────────
   JSON-LD structured data (SEO / AEO / GEO).
   All schemas are server-rendered so crawlers always see them.
   No fabricated data: no fake ratings, reviews, addresses or phones.
   ──────────────────────────────────────────────────────────────────── */

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "@id": `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.positioning,
  foundingDate: String(siteConfig.foundedYear),
  slogan: siteConfig.tagline,
  knowsAbout: [
    "Full Stack Development",
    "Web Development",
    "Python Programming",
    "Java Programming",
    "Data Analytics",
    "Digital Marketing",
    "UI/UX Design",
    "Basic Computer Training",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteConfig.url}/#website`,
  name: siteConfig.name,
  url: siteConfig.url,
  publisher: { "@id": `${siteConfig.url}/#organization` },
  inLanguage: "en-IN",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const coursesSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "IT Courses at Yantrix Technology",
  itemListElement: courses.map((course, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Course",
      name: course.title,
      description: course.description,
      provider: {
        "@type": "EducationalOrganization",
        name: siteConfig.name,
        url: siteConfig.url,
      },
      hasCourseInstance: course.modes.map((mode) => ({
        "@type": "CourseInstance",
        courseMode: mode === "Online" ? "Online" : "Onsite",
      })),
    },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(coursesSchema) }}
      />
      <SiteShell />
    </>
  );
}
