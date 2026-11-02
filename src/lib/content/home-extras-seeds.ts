/**
 * Seed content for the "campus landing page" sections that sit on the home
 * page — offer ticker, gallery, partner strip, videos, video testimonials,
 * brochure, mobile app and the centre list.
 *
 * Everything here is editable from **Admin → Page sections** (collections) and
 * **Admin → Pages & navigation** (brochure / app copy). This file only decides
 * what a brand-new install starts with: the photos are illustrative
 * placeholders from `public/images`, so replace them with real campus photos
 * (and paste the YouTube links) from the admin panel before go-live.
 */

/* ───────────────────────────── announcements ───────────────────────────── */

export const ANNOUNCEMENT_SEEDS: Record<string, unknown>[] = [
  {
    text: "New batch starting soon — enrol now and save on the admission fee",
    highlight: "Limited seats",
    icon: "Sparkles",
  },
  {
    text: "Free career counselling + demo class for every new enquiry",
    highlight: "Book a demo",
    icon: "GraduationCap",
  },
  {
    text: "Online and classroom batches open for all IT courses",
    highlight: "Admissions open",
    icon: "Monitor",
  },
  {
    text: "Placement support: resume, portfolio, mock interviews and referrals",
    highlight: "Placement help",
    icon: "Briefcase",
  },
];

/* ──────────────────────────────── gallery ─────────────────────────────── */

export const GALLERY_SEEDS: Record<string, unknown>[] = [
  {
    title: "Reception & counselling desk",
    category: "Campus",
    image: "/images/gallery-reception.jpg",
    alt: "Reception and counselling desk at the Yantrix Technology institute",
  },
  {
    title: "Computer & AI lab",
    category: "Labs",
    image: "/images/gallery-lab.jpg",
    alt: "Students practising on desktops in the computer and AI lab",
  },
  {
    title: "Trainer-led coding session",
    category: "Classroom",
    image: "/images/hero-1.png",
    alt: "Trainer explaining code to students during a classroom session",
  },
  {
    title: "Mentoring & group discussion",
    category: "Classroom",
    image: "/images/gallery-discussion.jpg",
    alt: "Small group discussing a project with a mentor",
  },
  {
    title: "Course completion day",
    category: "Students",
    image: "/images/gallery-graduation.jpg",
    alt: "Students celebrating course completion with their mentor",
  },
  {
    title: "Live online batch",
    category: "Online",
    image: "/images/hero-2.png",
    alt: "Student attending a live online class from home",
  },
];

/* ──────────────────────────────── partners ─────────────────────────────── */

/**
 * Partner / certification strip.
 *
 * ⚠️ Placeholder entries: the company names below are invented so the wall is
 * not empty on a fresh install. They are NOT existing Yantrix partnerships —
 * replace them with the partners you can actually back up (and whose logos you
 * are allowed to use) from **Admin → Page sections → Partners & certifications**.
 */
export const PARTNER_SEEDS: Record<string, unknown>[] = [
  {
    name: "TechNova Labs",
    kind: "Hiring partner",
    logo: "",
    description:
      "Product engineering teams that interview our full-stack and backend students for junior developer roles.",
    link: "",
  },
  {
    name: "CloudSprint",
    kind: "Cloud partner",
    logo: "",
    description:
      "Cloud and DevOps teams that take interns from our AWS, Linux and CI/CD batches every quarter.",
    link: "",
  },
  {
    name: "DataForge Analytics",
    kind: "Data partner",
    logo: "",
    description:
      "Analytics consultancies that source junior analysts from the data analytics program.",
    link: "",
  },
  {
    name: "PixelCraft Studio",
    kind: "Design partner",
    logo: "",
    description:
      "A product design studio that reviews UI/UX portfolios and shares live briefs with our design students.",
    link: "",
  },
  {
    name: "BlueOrbit Systems",
    kind: "Hiring partner",
    logo: "",
    description:
      "Service company hiring for Java and Python roles, with a shared interview panel for our final-year students.",
    link: "",
  },
  {
    name: "Nexa Retail",
    kind: "E-commerce partner",
    logo: "",
    description:
      "In-house commerce tech team that hosts capstone reviews and shares real catalogue problems to solve.",
    link: "",
  },
  {
    name: "FinEdge Capital",
    kind: "Fintech partner",
    logo: "",
    description:
      "Fintech product team running guest sessions on data pipelines, security and payments engineering.",
    link: "",
  },
  {
    name: "CampusBridge",
    kind: "Workshop partner",
    logo: "",
    description:
      "A college placement-cell network that hosts our campus workshops and short skill programs.",
    link: "",
  },
];

/* ───────────────────────────────── videos ──────────────────────────────── */

export const VIDEO_SEEDS: Record<string, unknown>[] = [
  {
    title: "Inside a Yantrix classroom",
    description: "What a live session looks like — teaching, practice and doubt-solving in the same class.",
    youtubeId: "",
    thumbnail: "/images/gallery-lab.jpg",
    duration: "2:40",
  },
  {
    title: "Student project demo",
    description: "Learners walk through the projects they built during the Full Stack Development program.",
    youtubeId: "",
    thumbnail: "/images/gallery-discussion.jpg",
    duration: "4:05",
  },
  {
    title: "Placement & interview prep",
    description: "How our team prepares students for resume screening, technical rounds and HR interviews.",
    youtubeId: "",
    thumbnail: "/images/gallery-reception.jpg",
    duration: "3:20",
  },
];

/* ────────────────────────────── testimonials ───────────────────────────── */

export const TESTIMONIAL_SEEDS: Record<string, unknown>[] = [
  {
    name: "Rohit Kulkarni",
    role: "Full Stack Development · 2025 batch",
    quote:
      "The projects made the difference. I could explain what I built and why in interviews, not just list technologies.",
    photo: "",
    youtubeId: "",
    rating: 5,
  },
  {
    name: "Sneha Patil",
    role: "Web Development · 2025 batch",
    quote:
      "Clear explanations and patient doubt-solving. My mentor reviewed my code line by line every week.",
    photo: "",
    youtubeId: "",
    rating: 5,
  },
  {
    name: "Prasad Bhosale",
    role: "Data Analytics · 2025 batch",
    quote:
      "The SQL sessions were the turning point. I now write my own queries instead of waiting for the IT team.",
    photo: "",
    youtubeId: "",
    rating: 5,
  },
];

/* ───────────────────────────────── centres ─────────────────────────────── */

export const CENTRE_SEEDS: Record<string, unknown>[] = [
  {
    name: "Dhanori (main centre)",
    address: "Laxmi Nagar, Dhanori, Near Dhanori Road, Pune, Maharashtra 411015",
    phone: "+91 88060 03000",
    hours: "Mon – Sat · 9:00 AM – 7:00 PM",
    mapLink: "",
    image: "",
  },
];
