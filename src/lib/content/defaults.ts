import type {
  CollectionMap,
  ContentItem,
  SiteContent,
  SectionCopy,
  SectionKey,
} from "@/lib/content/types";

/* ────────────────────────────────────────────────────────────────────
   Default (seed) content for the Yantrix Technology website.

   This is what the site shows on a fresh install. Once an admin saves
   anything in /admin, the saved copy in the data store wins — these
   defaults are only used for the first seed and as a safety net if a
   field is missing.
   ──────────────────────────────────────────────────────────────────── */

const section = (
  eyebrow: string,
  title: string,
  description: string,
): SectionCopy => ({ eyebrow, title, description, hidden: false });

const sections: Record<SectionKey, SectionCopy> = {
  badges: section("Key Highlights", "Why students choose us", ""),
  why: section(
    "Why Choose Us",
    "Everything you need to go from beginner to job-ready",
    "We focus on the things that actually move your career forward — practical skills, real projects and honest guidance.",
  ),
  modes: section(
    "Flexible Learning",
    "Online & offline training — pick what fits your life",
    "Both modes follow the same practical curriculum with live projects and placement assistance.",
  ),
  stats: section(
    "Yantrix in Numbers",
    "Small institute, serious standards",
    "Real, verifiable facts — no inflated counts, no fake promises. Just focused, practical IT training.",
  ),
  about: section(
    "About Yantrix Technology",
    "An institute built around practical learning and career growth",
    "",
  ),
  placement: section(
    "Placement Assistance",
    "Placement assistance that works for you, step by step",
    "We prepare you for the hiring process with structured, honest support — from your resume to your final interview rounds.",
  ),
  faq: section(
    "FAQ",
    "Frequently asked questions",
    "Quick, direct answers about Yantrix Technology — our training modes, courses and placement support.",
  ),
  cta: section(
    "Get Started",
    "Start your IT journey with Yantrix Technology today",
    "Not sure which course fits you? Talk to our team — we'll help you choose based on your goals and background.",
  ),
  trainers: section(
    "Our Trainers",
    "Learn from people who do this work every day",
    "Our trainers are working professionals — they teach what the industry actually uses, from real projects they have shipped.",
  ),
  placedStudents: section(
    "Placed Students",
    "Our students, now working in IT",
    "Real learners who trained with us and moved into IT roles.",
  ),
  coursesPage: section(
    "Our Courses",
    "Career-oriented IT courses, taught the practical way",
    "Choose from in-demand programs across development, data, design and marketing — with online and offline batches, live projects and placement assistance.",
  ),
  aboutPage: section("About Us", "We train people for real IT careers", ""),
  contactPage: section(
    "Contact Us",
    "Let's talk about your IT career",
    "Send an enquiry about courses, batches or admissions — we usually respond within 24 hours (Mon–Sat).",
  ),
};

let autoId = 0;
const item = (
  sortOrder: number,
  data: Record<string, unknown>,
): ContentItem => {
  autoId += 1;
  return {
    id: `seed-${autoId}`,
    sortOrder,
    active: true,
    ...data,
  };
};

const collections: CollectionMap = {
  heroSlides: [
    item(1, {
      eyebrow: "IT Training Institute · Est. 2024",
      title: "Practical IT Training for Real Careers",
      description:
        "Learn job-ready skills through hands-on sessions, live projects and mentor-led training — available both online and offline.",
      image: "/images/hero-1.png",
      alt: "Students learning coding in a modern IT training classroom at Yantrix Technology",
    }),
    item(2, {
      eyebrow: "Online & Offline Batches",
      title: "Learn. Build. Get Interview-Ready.",
      description:
        "From programming fundamentals to full stack development — our career-oriented programs come with placement assistance at every step.",
      image: "/images/hero-2.png",
      alt: "Student attending a live online coding course on a laptop",
    }),
    item(3, {
      eyebrow: "Live Project-Based Learning",
      title: "Build Skills That Employers Look For",
      description:
        "Work on real-world projects, strengthen your portfolio and step into the IT industry with confidence.",
      image: "/images/hero-3.png",
      alt: "Team of young Indian IT professionals showing unity and career success at a modern training institute",
    }),
  ],

  courses: [
    item(1, {
      slug: "full-stack-development",
      title: "Full Stack Development",
      description:
        "Become a complete developer — build responsive front-ends, REST APIs and databases, then deploy real applications end to end.",
      duration: "5–6 Months (typical)",
      fee: "On request",
      level: "Beginner → Advanced",
      modes: ["Online", "Offline"],
      highlights: [
        "HTML, CSS, JavaScript",
        "React & Node.js basics",
        "Databases & REST APIs",
        "Capstone live project",
      ],
      icon: "Layers",
    }),
    item(2, {
      slug: "web-development",
      title: "Web Development",
      description:
        "Learn modern website development from the ground up — semantic HTML, modern CSS, JavaScript and popular frameworks.",
      duration: "3–4 Months (typical)",
      fee: "On request",
      level: "Beginner",
      modes: ["Online", "Offline"],
      highlights: [
        "HTML5 & modern CSS",
        "JavaScript fundamentals",
        "Responsive layouts",
        "Portfolio website project",
      ],
      icon: "Globe",
    }),
    item(3, {
      slug: "python-programming",
      title: "Python Programming",
      description:
        "Start from zero and master Python — clean syntax, problem solving, automation and real-world mini projects.",
      duration: "2–4 Months (typical)",
      fee: "On request",
      level: "Beginner",
      modes: ["Online", "Offline"],
      highlights: [
        "Core Python & OOP",
        "File & error handling",
        "Automation scripts",
        "Hands-on mini projects",
      ],
      icon: "Braces",
    }),
    item(4, {
      slug: "java-programming",
      title: "Java Programming",
      description:
        "Build a strong base in Java — object-oriented programming, collections and the mindset needed for enterprise development.",
      duration: "3–5 Months (typical)",
      fee: "On request",
      level: "Beginner → Intermediate",
      modes: ["Online", "Offline"],
      highlights: [
        "Core Java & OOP",
        "Collections & generics",
        "Exception handling",
        "Console & mini apps",
      ],
      icon: "MousePointerClick",
    }),
    item(5, {
      slug: "data-analytics",
      title: "Data Analytics",
      description:
        "Turn raw data into insights — Excel, SQL and visualisation dashboards that businesses actually use to make decisions.",
      duration: "3–5 Months (typical)",
      fee: "On request",
      level: "Beginner",
      modes: ["Online", "Offline"],
      highlights: [
        "Advanced Excel",
        "SQL queries & joins",
        "Power BI / dashboards",
        "Analytics mini project",
      ],
      icon: "BarChart3",
    }),
    item(6, {
      slug: "digital-marketing",
      title: "Digital Marketing",
      description:
        "Learn practical digital marketing — SEO, social media, ads and analytics — with campaigns you plan and run yourself.",
      duration: "2–3 Months (typical)",
      fee: "On request",
      level: "Beginner",
      modes: ["Online", "Offline"],
      highlights: [
        "SEO fundamentals",
        "Social media marketing",
        "Google Ads basics",
        "Live campaign practice",
      ],
      icon: "Megaphone",
    }),
    item(7, {
      slug: "ui-ux-design",
      title: "UI/UX Design",
      description:
        "Design products people love to use — design thinking, wireframing, prototyping and a polished portfolio in Figma.",
      duration: "3–4 Months (typical)",
      fee: "On request",
      level: "Beginner",
      modes: ["Online", "Offline"],
      highlights: [
        "Design thinking",
        "Wireframes & prototypes",
        "Figma hands-on",
        "Portfolio case study",
      ],
      icon: "Palette",
    }),
    item(8, {
      slug: "basic-computer-training",
      title: "MS-CIT / Basic Computer Training",
      description:
        "A beginner-friendly course for absolute starters — computer fundamentals, MS Office, internet skills and exam readiness.",
      duration: "2–3 Months (typical)",
      fee: "On request",
      level: "Absolute beginner",
      modes: ["Online", "Offline"],
      highlights: [
        "Computer fundamentals",
        "MS Office suite",
        "Internet & email skills",
        "Practice tests",
      ],
      icon: "MousePointerClick",
    }),
  ],

  faqs: [
    item(1, {
      question: "What is Yantrix Technology?",
      answer:
        "Yantrix Technology is an IT training institute that helps students and professionals learn practical, job-ready IT skills through online and offline training, live project-based learning, and placement assistance.",
    }),
    item(2, {
      question: "Does Yantrix Technology provide online and offline training?",
      answer:
        "Yes. We offer both live, interactive online batches and in-person classroom training, so you can choose the mode that best fits your schedule and learning style.",
    }),
    item(3, {
      question: "Do you provide placement assistance?",
      answer:
        "Yes. We provide placement assistance that includes resume building, interview preparation and job-search guidance. This is ongoing support — Yantrix Technology provides assistance and does not offer a guaranteed placement.",
    }),
    item(4, {
      question: "Which IT courses are available?",
      answer:
        "We offer training in Full Stack Development, Web Development, Python Programming, Java Programming, Data Analytics, Digital Marketing, UI/UX Design, and basic computer training (MS-CIT). Batch schedules are shared on enquiry.",
    }),
    item(5, {
      question: "How can students contact Yantrix Technology?",
      answer:
        "You can call or WhatsApp us on +91 88060 03000, email support@yantrixtechnology.com, or fill in the enquiry form on YantrixTechnology.com. You can also visit us at our training centre in Laxmi Nagar, Dhanori, Pune (Mon–Sat, 9 AM–7 PM). We usually respond within 24 hours.",
    }),
    item(6, {
      question: "Do I need prior coding experience to join a course?",
      answer:
        "No. Most of our programs start from the fundamentals and move step by step to advanced topics. Our trainers guide you from basics to live projects, regardless of your starting level.",
    }),
  ],

  features: [
    item(1, {
      title: "Practical Training",
      description:
        "Every concept is taught hands-on with exercises, assignments and real practice sessions — not just theory.",
      icon: "Wrench",
    }),
    item(2, {
      title: "Industry-Oriented Courses",
      description:
        "Our syllabus is designed around the tools, workflows and expectations that IT companies have today.",
      icon: "Target",
    }),
    item(3, {
      title: "Online & Offline Learning",
      description:
        "Choose live online classes or in-person classroom sessions — whichever fits your schedule and comfort.",
      icon: "MonitorSmartphone",
    }),
    item(4, {
      title: "Placement Assistance",
      description:
        "Get structured support for resumes, interviews and your job search — guidance at every career step.",
      icon: "Handshake",
    }),
    item(5, {
      title: "Experienced Trainers",
      description:
        "Learn from mentors with real industry experience who focus on clarity, fundamentals and confidence.",
      icon: "UserCheck",
    }),
    item(6, {
      title: "Career Guidance",
      description:
        "Personal guidance to pick the right course and career path based on your background and goals.",
      icon: "Compass",
    }),
  ],

  badges: [
    item(1, {
      title: "Since 2024",
      description:
        "A new-age IT training institute built around modern industry needs.",
      icon: "Users",
    }),
    item(2, {
      title: "Job-Ready Skills",
      description:
        "A practical curriculum focused on exactly what employers expect.",
      icon: "Target",
    }),
    item(3, {
      title: "Live Projects",
      description: "Learn by building real, portfolio-worthy applications.",
      icon: "Layers",
    }),
    item(4, {
      title: "Placement Assistance",
      description: "Structured support for your job search and interviews.",
      icon: "Handshake",
    }),
  ],

  stats: [
    item(1, {
      icon: "CalendarDays",
      value: 2024,
      suffix: "",
      label: "Founded",
      sub: "A new-age IT training institute",
    }),
    item(2, {
      icon: "Layers",
      value: 8,
      suffix: "+",
      label: "Career Courses",
      sub: "Development, data, design & marketing",
    }),
    item(3, {
      icon: "MonitorSmartphone",
      value: 2,
      suffix: "",
      label: "Learning Modes",
      sub: "Live online & classroom batches",
    }),
    item(4, {
      icon: "Target",
      value: 100,
      suffix: "%",
      label: "Practical Learning",
      sub: "Project-based, hands-on curriculum",
    }),
  ],

  techStack: [
    "HTML5",
    "CSS3",
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "Java",
    "SQL",
    "Power BI",
    "Excel",
    "Figma",
    "SEO",
    "Google Ads",
    "Git & GitHub",
    "MS Office",
    "ChatGPT for Work",
  ].map((name, i) => item(i + 1, { label: name })),

  approachSteps: [
    item(1, {
      step: "01",
      title: "Learn the Fundamentals",
      description:
        "Clear, structured sessions that build strong basics — no shortcuts, no confusion.",
    }),
    item(2, {
      step: "02",
      title: "Practice with Mentors",
      description:
        "Assignments, lab sessions and doubt-solving with experienced trainers by your side.",
    }),
    item(3, {
      step: "03",
      title: "Build Live Projects",
      description:
        "Apply your skills to real applications that go straight into your portfolio.",
    }),
    item(4, {
      step: "04",
      title: "Career & Placement Support",
      description:
        "Resume building, interview preparation and placement assistance until you're ready.",
    }),
  ],

  placementPoints: [
    item(1, {
      title: "Resume & Profile Building",
      description:
        "Craft a clean, professional resume and LinkedIn profile that gets noticed.",
    }),
    item(2, {
      title: "Interview Preparation",
      description:
        "Technical questions, HR rounds and communication practice — covered end to end.",
    }),
    item(3, {
      title: "Mock Interviews",
      description:
        "Simulated interview rounds with feedback so you walk in prepared and confident.",
    }),
    item(4, {
      title: "Job Search Guidance",
      description:
        "Guidance on where to apply, how to follow up and how to present your projects.",
    }),
  ],

  checklist: [
    item(1, {
      label: "Practical-first curriculum designed around real industry work",
    }),
    item(2, {
      label: "Live projects that turn learning into a working portfolio",
    }),
    item(3, {
      label: "Placement assistance with interview and resume preparation",
    }),
  ],

  trainingModes: [
    item(1, {
      name: "Online Training",
      tagline: "Learn from anywhere, live.",
      points: [
        "Live, interactive sessions with trainers",
        "Join from home — save travel time",
        "Recorded backup for revision",
        "Same curriculum as classroom batches",
      ],
      cta: "Enquire for Online Batch",
      icon: "MonitorSmartphone",
      style: "light",
    }),
    item(2, {
      name: "Offline Training",
      tagline: "Learn in the classroom, together.",
      points: [
        "In-person, practical classroom sessions",
        "Hands-on computer lab access",
        "Face-to-face mentoring and doubt-solving",
        "Peer learning with batchmates",
      ],
      cta: "Enquire for Offline Batch",
      icon: "Building2",
      style: "dark",
    }),
  ],

  trustChips: [
    item(1, {
      title: "Placement Assistance",
      subtitle: "Support at every career step",
      icon: "Handshake",
    }),
    item(2, {
      title: "Online & Offline Batches",
      subtitle: "Learn your way, anywhere",
      icon: "MonitorSmartphone",
    }),
  ],

  quickFacts: [
    item(1, {
      label: "Institute",
      value: "Yantrix Technology",
      icon: "Building2",
    }),
    item(2, { label: "Founded", value: "2024", icon: "CalendarDays" }),
    item(3, {
      label: "Focus",
      value: "Practical IT training & career growth",
      icon: "Laptop",
    }),
    item(4, {
      label: "Training modes",
      value: "Online & Offline batches",
      icon: "MonitorSmartphone",
    }),
    item(5, {
      label: "Placement support",
      value: "Assistance (not a guarantee)",
      icon: "Handshake",
    }),
    item(6, {
      label: "Website",
      value: "YantrixTechnology.com",
      icon: "Globe",
    }),
  ],

  contactSteps: [
    item(1, { label: "We review your enquiry and goals" }),
    item(2, { label: "A counsellor contacts you within 24 hours (Mon–Sat)" }),
    item(3, { label: "We suggest the right course, mode and batch timing" }),
  ],

  navHeader: [
    item(1, { label: "Home", view: "home" }),
    item(2, { label: "Courses", view: "courses" }),
    item(3, { label: "About Us", view: "about" }),
    item(4, { label: "Contact Us", view: "contact" }),
  ],

  navFooter: [
    item(1, { label: "Home", view: "home" }),
    item(2, { label: "Courses", view: "courses" }),
    item(3, { label: "About Us", view: "about" }),
    item(4, { label: "Contact Us", view: "contact" }),
  ],

  courseChips: [
    item(1, { label: "Online & Offline Batches" }),
    item(2, { label: "Live Projects" }),
    item(3, { label: "Placement Assistance" }),
    item(4, { label: "Experienced Trainers" }),
  ],

  courseIncludes: [
    item(1, { label: "Practical, hands-on sessions" }),
    item(2, { label: "Live project work" }),
    item(3, { label: "Doubt-solving support" }),
    item(4, { label: "Placement assistance" }),
  ],

  // Added from the admin panel (Trainers / Placed students) — never seeded with sample people.
  trainers: [],
  placedStudents: [],
};

export const DEFAULT_CONTENT: SiteContent = {
  version: 1,
  updatedAt: new Date("2024-01-01T00:00:00.000Z").toISOString(),
  settings: {
    name: "Yantrix Technology",
    shortName: "Yantrix",
    domain: "YantrixTechnology.com",
    url: "https://yantrixtechnology.com",
    tagline: "Practical IT Training for Real Careers",
    positioning:
      "Yantrix Technology helps students and professionals learn practical IT skills through online and offline training, live project-based learning, and placement assistance.",
    foundedYear: 2024,
    whatsappNumber: "918806003000",
    whatsappMessage:
      "Hello Yantrix Technology, I would like to know more about your IT courses.",
    supportEmail: "support@yantrixtechnology.com",
    contact: {
      phone: "+91 88060 03000",
      mobile: "+91 88060 03000",
      email: "support@yantrixtechnology.com",
      address: "Laxmi Nagar, Dhanori",
      addressLine2: "Near Dhanori Road",
      city: "Pune",
      state: "Maharashtra",
      postalCode: "411015",
      country: "IN",
      hours: "Mon – Sat · 9:00 AM – 7:00 PM",
      mapLink: "https://www.google.com/maps/search/?api=1&query=Dhanori+Pune",
      mapEmbedUrl: "",
    },
    social: {
      instagram: "",
      facebook: "",
      linkedin: "",
      youtube: "",
      twitter: "",
      googleBusiness: "",
    },
    topBar: {
      badge: "Online & Offline Training Available",
      note: "Placement Assistance",
      extra: "New Batches Enrolling — Enquire Now",
    },
    footer: {
      ctaTitle: "Ready to build your IT career?",
      ctaText:
        "Talk to us about the right course for your goals — online or offline.",
      disclaimer:
        "Placement assistance is provided — not a guarantee of employment.",
      copyright: "",
    },
    legal: {
      privacyTitle: "Privacy Policy",
      privacyText:
        "We collect only the details you submit in our enquiry form (name, email, mobile number, course interest and message) so that our team can contact you about admissions. We never sell or rent your data. To have your details removed, email support@yantrixtechnology.com.",
      termsTitle: "Terms of Use",
      termsText:
        "The information on this website is provided for general guidance about our courses and batches. Course durations, schedules and fees may change. Yantrix Technology provides placement assistance and does not guarantee employment.",
    },
  },
  seo: {
    global: {
      defaultTitle:
        "Yantrix Technology | IT Training Institute — Online & Offline Courses with Placement Assistance",
      titleTemplate: "%s | Yantrix Technology",
      defaultDescription:
        "Yantrix Technology is an IT training institute offering online and offline courses in Full Stack Development, Web Development, Python, Java, Data Analytics and more — with live projects and placement assistance.",
      keywords: [
        "IT training institute",
        "online IT courses",
        "offline IT courses",
        "programming courses",
        "web development course",
        "full stack development course",
        "career oriented IT training",
        "placement assistance IT courses",
        "Yantrix Technology",
      ],
      ogImage: "/images/hero-1.png",
      twitterHandle: "",
      locale: "en_IN",
      themeColor: "#02040c",
      robotsIndex: true,
      robotsFollow: true,
      googleSiteVerification: "",
      bingSiteVerification: "",
      gaMeasurementId: "",
      clarityId: "",
      organizationType: "EducationalOrganization",
      priceRange: "₹₹",
      areaServed: ["Pune", "Maharashtra", "India", "Online"],
      languages: ["English", "Hindi", "Marathi"],
      geoLatitude: "18.5895",
      geoLongitude: "73.9058",
      geoPlacename: "Dhanori, Pune",
    },
    pages: {
      home: {
        path: "/",
        title: "Yantrix Technology | IT Training Institute in Pune",
        description:
          "Online & offline IT courses in Full Stack Development, Python, Java and Data Analytics — with live projects, expert trainers and placement assistance.",
        keywords: [
          "IT training institute Pune",
          "IT courses with placement assistance",
        ],
        ogImage: "/images/hero-1.png",
        noindex: false,
        priority: 1,
      },
      courses: {
        path: "/courses",
        title: "IT Courses in Pune — Full Stack, Python, Java",
        description:
          "Career-oriented IT courses: Full Stack, Web Development, Python, Java, Data Analytics, Digital Marketing and UI/UX — online & offline batches.",
        keywords: [
          "full stack course Pune",
          "python classes Pune",
          "data analytics course",
        ],
        ogImage: "/images/hero-2.png",
        noindex: false,
        priority: 0.9,
      },
      about: {
        path: "/about",
        title: "About Yantrix Technology — IT Training Institute",
        description:
          "Founded in 2024, Yantrix Technology focuses on practical learning, live projects and career growth. Learn about our mission, vision and training approach.",
        keywords: ["about Yantrix Technology", "IT training institute Pune"],
        ogImage: "/images/about-institute.png",
        noindex: false,
        priority: 0.7,
      },
      contact: {
        path: "/contact",
        title: "Contact Us — Course Enquiry & Admission",
        description:
          "Contact Yantrix Technology for course enquiries and admissions. Fill in the enquiry form or reach us on WhatsApp — we usually respond within 24 hours.",
        keywords: ["contact Yantrix Technology", "IT course admission Pune"],
        ogImage: "/images/hero-3.png",
        noindex: false,
        priority: 0.8,
      },
    },
    aeo: {
      llmsTxtEnabled: true,
      llmsIntro:
        "Yantrix Technology is an IT training institute in Dhanori, Pune (India) offering practical, career-oriented IT training in online and offline modes, with live projects and placement assistance.",
      keyFacts: [
        { label: "Institute", value: "Yantrix Technology" },
        { label: "Type", value: "IT training institute" },
        { label: "Founded", value: "2024" },
        {
          label: "Location",
          value: "Laxmi Nagar, Dhanori, Pune, Maharashtra, India",
        },
        {
          label: "Training modes",
          value: "Live online and in-person classroom batches",
        },
        {
          label: "Courses",
          value:
            "Full Stack, Web Development, Python, Java, Data Analytics, Digital Marketing, UI/UX, MS-CIT",
        },
        {
          label: "Placement",
          value: "Placement assistance (not a guaranteed placement)",
        },
        {
          label: "Contact",
          value: "+91 88060 03000 · support@yantrixtechnology.com",
        },
        {
          label: "Working hours",
          value: "Monday to Saturday, 9:00 AM – 7:00 PM",
        },
      ],
      enableOrganizationSchema: true,
      enableWebsiteSchema: true,
      enableLocalBusinessSchema: true,
      enableCourseSchema: true,
      enableFaqSchema: true,
      enableBreadcrumbSchema: true,
      speakableSelectors: ["h1", ".speakable-summary"],
      citationSummary:
        "Yantrix Technology is an IT training institute in Dhanori, Pune offering online and offline IT courses with live projects and placement assistance.",
    },
  },
  sections,
  pages: {
    home: {
      heroPrimaryCta: "Explore Courses",
      heroSecondaryCta: "Contact for Admission",
      heroTrustChips: true,
      aboutImage: "/images/about-institute.png",
      aboutImageAlt:
        "Modern training environment at Yantrix Technology institute",
      aboutBadgeTitle: "Established in 2024",
      aboutBadgeText: "A new-age IT training institute",
    },
    courses: {
      note: "* Durations shown are typical ranges and may vary by batch and track. Contact us for the current batch schedule and detailed syllabus.",
      helpTitle: "Not sure which course is right for you?",
      helpText:
        "Share your background and goals — our counsellors will suggest the best starting point, batch timing and mode of learning for you.",
      helpCta: "Get Free Counselling",
    },
    about: {
      storyTitle: "Started in 2024 with a simple belief",
      storyParagraphs: [
        "Yantrix Technology was founded in 2024 as an IT training institute focused on practical learning and career growth. We saw a gap between what students study and what companies actually expect — so we built programs that close it.",
        "Every course at Yantrix Technology is designed around doing: clear fundamentals, guided practice, and live projects that learners can show in interviews. Our trainers come with real industry experience and mentor each student personally.",
        "Whether you are a student starting your career, a graduate switching to IT, or a working professional upgrading your skills — you get the same commitment: honest guidance, practical training and support until you are job-ready.",
      ],
      image: "/images/about-institute.png",
      imageAlt:
        "Yantrix Technology training centre — students working on live projects",
      imageCaption:
        "Practical learning space — built for hands-on IT training.",
      missionTitle: "Our Mission",
      missionText:
        "To make practical, career-oriented IT education accessible to every student and professional — teaching real skills through hands-on training, live projects and mentorship that translates directly into job readiness.",
      visionTitle: "Our Vision",
      visionText:
        "To become a trusted destination for IT learning — known for honest guidance, industry-relevant courses and learners who step into the industry confident, skilled and ready to contribute from day one.",
      disclaimer:
        "Every program ends with placement assistance — resume building, interview preparation and job-search guidance. Assistance, honestly provided; never a guaranteed placement.",
    },
    contact: {
      formTitle: "Course Enquiry Form",
      formSubtitle: "Fill in your details and we'll call or message you back.",
      successTitle: "Enquiry received!",
      successText:
        "Thank you for contacting Yantrix Technology. Our team will get back to you within 24 hours (Mon–Sat). For a faster response, message us on WhatsApp.",
      infoTitle: "Contact Information",
      whatsappTitle: "Fastest way to reach us — WhatsApp",
      whatsappText:
        "Ask about courses, fees, batch timings or admission — chat with our counsellors directly.",
      afterTitle: "What happens after you enquire?",
      responseNote: "We usually respond within 24 hours (Mon–Sat).",
    },
  },
  collections,
};
