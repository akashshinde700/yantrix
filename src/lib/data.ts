import {
  BarChart3,
  Braces,
  Compass,
  Handshake,
  Layers,
  Megaphone,
  MonitorSmartphone,
  MousePointerClick,
  Palette,
  Target,
  UserCheck,
  Users,
  Globe,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────
   NOTE FOR THE BUSINESS OWNER:
   Course list, durations and descriptions below are editable content.
   Update them to match the final brochure / batch details.
   ──────────────────────────────────────────────────────────────────── */

export type CourseMode = "Online" | "Offline";

export interface Course {
  slug: string;
  title: string;
  description: string;
  modes: CourseMode[];
  /** EDITABLE placeholder duration */
  duration: string;
  highlights: string[];
  icon: LucideIcon;
}

export const courses: Course[] = [
  {
    slug: "full-stack-development",
    title: "Full Stack Development",
    description:
      "Become a complete developer — build responsive front-ends, REST APIs and databases, then deploy real applications end to end.",
    modes: ["Online", "Offline"],
    duration: "5–6 Months (typical)",
    highlights: ["HTML, CSS, JavaScript", "React & Node.js basics", "Databases & REST APIs", "Capstone live project"],
    icon: Layers,
  },
  {
    slug: "web-development",
    title: "Web Development",
    description:
      "Learn modern website development from the ground up — semantic HTML, modern CSS, JavaScript and popular frameworks.",
    modes: ["Online", "Offline"],
    duration: "3–4 Months (typical)",
    highlights: ["HTML5 & modern CSS", "JavaScript fundamentals", "Responsive layouts", "Portfolio website project"],
    icon: Globe,
  },
  {
    slug: "python-programming",
    title: "Python Programming",
    description:
      "Start from zero and master Python — clean syntax, problem solving, automation and real-world mini projects.",
    modes: ["Online", "Offline"],
    duration: "2–4 Months (typical)",
    highlights: ["Core Python & OOP", "File & error handling", "Automation scripts", "Hands-on mini projects"],
    icon: Braces,
  },
  {
    slug: "java-programming",
    title: "Java Programming",
    description:
      "Build a strong base in Java — object-oriented programming, collections and the mindset needed for enterprise development.",
    modes: ["Online", "Offline"],
    duration: "3–5 Months (typical)",
    highlights: ["Core Java & OOP", "Collections & generics", "Exception handling", "Console & mini apps"],
    icon: MousePointerClick,
  },
  {
    slug: "data-analytics",
    title: "Data Analytics",
    description:
      "Turn raw data into insights — Excel, SQL and visualisation dashboards that businesses actually use to make decisions.",
    modes: ["Online", "Offline"],
    duration: "3–5 Months (typical)",
    highlights: ["Advanced Excel", "SQL queries & joins", "Power BI / dashboards", "Analytics mini project"],
    icon: BarChart3,
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    description:
      "Learn practical digital marketing — SEO, social media, ads and analytics — with campaigns you plan and run yourself.",
    modes: ["Online", "Offline"],
    duration: "2–3 Months (typical)",
    highlights: ["SEO fundamentals", "Social media marketing", "Google Ads basics", "Live campaign practice"],
    icon: Megaphone,
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    description:
      "Design products people love to use — design thinking, wireframing, prototyping and a polished portfolio in Figma.",
    modes: ["Online", "Offline"],
    duration: "3–4 Months (typical)",
    highlights: ["Design thinking", "Wireframes & prototypes", "Figma hands-on", "Portfolio case study"],
    icon: Palette,
  },
  {
    slug: "basic-computer-training",
    title: "MS-CIT / Basic Computer Training",
    description:
      "A beginner-friendly course for absolute starters — computer fundamentals, MS Office, internet skills and exam readiness.",
    modes: ["Online", "Offline"],
    duration: "2–3 Months (typical)",
    highlights: ["Computer fundamentals", "MS Office suite", "Internet & email skills", "Practice tests"],
    icon: MousePointerClick,
  },
];

/* ── FAQ (AEO) — direct, simple answers ── */
export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: "What is Yantrix Technology?",
    answer:
      "Yantrix Technology is an IT training institute that helps students and professionals learn practical, job-ready IT skills through online and offline training, live project-based learning, and placement assistance.",
  },
  {
    question: "Does Yantrix Technology provide online and offline training?",
    answer:
      "Yes. We offer both live, interactive online batches and in-person classroom training, so you can choose the mode that best fits your schedule and learning style.",
  },
  {
    question: "Do you provide placement assistance?",
    answer:
      "Yes. We provide placement assistance that includes resume building, interview preparation and job-search guidance. This is ongoing support — Yantrix Technology provides assistance and does not offer a guaranteed placement.",
  },
  {
    question: "Which IT courses are available?",
    answer:
      "We offer training in Full Stack Development, Web Development, Python Programming, Java Programming, Data Analytics, Digital Marketing, UI/UX Design, and basic computer training (MS-CIT). Batch schedules are shared on enquiry.",
  },
  {
    question: "How can students contact Yantrix Technology?",
    answer:
      "You can reach us through the enquiry form on YantrixTechnology.com, the WhatsApp chat button on this website, or by visiting us during working hours (Mon–Sat, 9 AM–7 PM). We usually respond within 24 hours.",
  },
  {
    question: "Do I need prior coding experience to join a course?",
    answer:
      "No. Most of our programs start from the fundamentals and move step by step to advanced topics. Our trainers guide you from basics to live projects, regardless of your starting level.",
  },
];

/* ── Why Choose Us ── */
export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const whyChooseUs: Feature[] = [
  {
    title: "Practical Training",
    description:
      "Every concept is taught hands-on with exercises, assignments and real practice sessions — not just theory.",
    icon: Wrench,
  },
  {
    title: "Industry-Oriented Courses",
    description:
      "Our syllabus is designed around the tools, workflows and expectations that IT companies have today.",
    icon: Target,
  },
  {
    title: "Online & Offline Learning",
    description:
      "Choose live online classes or in-person classroom sessions — whichever fits your schedule and comfort.",
    icon: MonitorSmartphone,
  },
  {
    title: "Placement Assistance",
    description:
      "Get structured support for resumes, interviews and your job search — guidance at every career step.",
    icon: Handshake,
  },
  {
    title: "Experienced Trainers",
    description:
      "Learn from mentors with real industry experience who focus on clarity, fundamentals and confidence.",
    icon: UserCheck,
  },
  {
    title: "Career Guidance",
    description:
      "Personal guidance to pick the right course and career path based on your background and goals.",
    icon: Compass,
  },
];

/* ── Badges / stat cards ── */
export const badges: Feature[] = [
  {
    title: "Since 2024",
    description: "A new-age IT training institute built around modern industry needs.",
    icon: Users,
  },
  {
    title: "Job-Ready Skills",
    description: "A practical curriculum focused on exactly what employers expect.",
    icon: Target,
  },
  {
    title: "Live Projects",
    description: "Learn by building real, portfolio-worthy applications.",
    icon: Layers,
  },
  {
    title: "Placement Assistance",
    description: "Structured support for your job search and interviews.",
    icon: Handshake,
  },
];

/* ── Hero slides ── */
export interface Slide {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  alt: string;
}

export const heroSlides: Slide[] = [
  {
    eyebrow: "IT Training Institute · Est. 2024",
    title: "Practical IT Training for Real Careers",
    description:
      "Learn job-ready skills through hands-on sessions, live projects and mentor-led training — available both online and offline.",
    image: "/images/hero-1.png",
    alt: "Students learning coding in a modern IT training classroom at Yantrix Technology",
  },
  {
    eyebrow: "Online & Offline Batches",
    title: "Learn. Build. Get Interview-Ready.",
    description:
      "From programming fundamentals to full stack development — our career-oriented programs come with placement assistance at every step.",
    image: "/images/hero-2.png",
    alt: "Student attending a live online coding course on a laptop",
  },
  {
    eyebrow: "Live Project-Based Learning",
    title: "Build Skills That Employers Look For",
    description:
      "Work on real-world projects, strengthen your portfolio and step into the IT industry with confidence.",
    image: "/images/hero-3.png",
    alt: "Young IT professionals celebrating career success in a modern office",
  },
];

/* ── Training approach steps ── */
export const approachSteps = [
  {
    step: "01",
    title: "Learn the Fundamentals",
    description: "Clear, structured sessions that build strong basics — no shortcuts, no confusion.",
  },
  {
    step: "02",
    title: "Practice with Mentors",
    description: "Assignments, lab sessions and doubt-solving with experienced trainers by your side.",
  },
  {
    step: "03",
    title: "Build Live Projects",
    description: "Apply your skills to real applications that go straight into your portfolio.",
  },
  {
    step: "04",
    title: "Career & Placement Support",
    description: "Resume building, interview preparation and placement assistance until you're ready.",
  },
];

/* ── Placement assistance offerings ── */
export const placementPoints = [
  {
    title: "Resume & Profile Building",
    description: "Craft a clean, professional resume and LinkedIn profile that gets noticed.",
  },
  {
    title: "Interview Preparation",
    description: "Technical questions, HR rounds and communication practice — covered end to end.",
  },
  {
    title: "Mock Interviews",
    description: "Simulated interview rounds with feedback so you walk in prepared and confident.",
  },
  {
    title: "Job Search Guidance",
    description: "Guidance on where to apply, how to follow up and how to present your projects.",
  },
];
