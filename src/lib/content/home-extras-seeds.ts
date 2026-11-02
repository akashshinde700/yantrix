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

export const PARTNER_SEEDS: Record<string, unknown>[] = [
  {
    name: "Industry certification",
    kind: "Certification",
    logo: "/brand/yantrix-icon.svg",
    description:
      "Complete the program and its final project to earn a Yantrix Technology certificate you can add to your resume and LinkedIn profile.",
    link: "",
  },
  {
    name: "Hiring partners",
    kind: "Placement",
    logo: "/brand/yantrix-icon.svg",
    description:
      "We connect trained students with company requirements through our hiring network and referrals.",
    link: "",
  },
  {
    name: "School & college workshops",
    kind: "Collaboration",
    logo: "/brand/yantrix-icon.svg",
    description:
      "Campus workshops and short programs for schools and colleges around Pune, on request.",
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
