/**
 * Seed content for the course catalogue.
 *
 * Each entry fills the card fields *and* the course detail page
 * (`/courses/<slug>`): the hero promise, price card, about copy, tracks,
 * outcomes, tools, curriculum, reviews, FAQ and call to action.
 *
 * Everything here is editable from **Admin → Courses**; this file only decides
 * what a fresh install starts with. Fees are deliberately left as
 * "On request" — the admin panel is where the real numbers go in.
 */

const LANGUAGE = "Hindi · English · Marathi";

export const COURSE_SEEDS: Record<string, unknown>[] = [
  {
    slug: "full-stack-development",
    title: "Full Stack Development",
    icon: "Layers",
    badge: "Most popular",
    description:
      "Become a complete developer — build responsive front-ends, REST APIs and databases, then deploy real applications end to end.",
    tagline:
      "Design, build and deploy complete web applications — front-end, back-end, database and cloud — with a portfolio you can show in interviews.",
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
    heroStats: ["5–6 months", "10+ build-along projects", "Beginners welcome"],
    instructor: "Senior Yantrix mentors",
    language: LANGUAGE,
    batchNote: "New batch every month · weekday and weekend options",
    seatsNote: "Small batches — 15 learners per batch",
    priceNote: "Fee can be paid in two instalments",
    aboutTitle: "Go from your first line of HTML to a deployed full stack app",
    aboutParagraphs: [
      "Full stack development is the skill of building a product end to end: the screens people click, the API behind them, and the database that remembers everything. This program teaches all three in the same order a real product is built — so every concept lands with a reason to exist.",
      "You start with semantic HTML, modern CSS and JavaScript, then move to React on the front end and Node.js with Express on the back end. Along the way you learn Git and GitHub, how to design REST APIs, how to model data in MongoDB and MySQL, and how to deploy to a live URL — not just run things on localhost.",
      "Every module ends with a build-along project. By the final weeks you are shipping a capstone application with authentication, file uploads and a database, reviewed by your mentor with line-level feedback.",
    ],
    tracks: [
      {
        title: "MERN Stack",
        subtitle: "React + Node.js — the most in-demand combination in job listings",
        points: [
          "Frontend: HTML, CSS, JavaScript, React, responsive UI",
          "Backend: Node.js, Express, REST APIs, authentication",
          "Database: MongoDB, schema design, aggregation",
          "Deployment: Git, GitHub, Render, Vercel",
        ],
      },
      {
        title: "Java Spring Boot",
        subtitle: "For enterprise and service-company roles",
        points: [
          "Core Java, OOP, collections and exception handling",
          "Spring Boot, Spring MVC, dependency injection",
          "SQL, MySQL, PostgreSQL and query optimisation",
          "Maven, Tomcat and AWS deployment basics",
        ],
      },
      {
        title: "Python Django",
        subtitle: "A clean, readable stack for fast product work",
        points: [
          "Python fundamentals and problem solving",
          "Django MVT, templates and the ORM",
          "Django REST Framework APIs",
          "Git, Postman and cloud deployment",
        ],
      },
    ],
    benefits: [
      {
        title: "Projects, not just notes",
        description:
          "Every concept is followed by something you build. You leave with 10+ projects on GitHub and one polished capstone.",
      },
      {
        title: "Interview-shaped practice",
        description:
          "Weekly coding exercises, mock interviews and resume reviews focused on the questions freshers actually get asked.",
      },
      {
        title: "Mentors who ship code",
        description:
          "Trainers are working developers. Questions get answered with real production context, not textbook definitions.",
      },
      {
        title: "Online or classroom",
        description:
          "Join the Dhanori classroom batch or the live online batch — same syllabus, same mentors, recordings either way.",
      },
    ],
    tools: [
      "VS Code",
      "Git & GitHub",
      "Chrome DevTools",
      "HTML5",
      "CSS3",
      "JavaScript (ES6+)",
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "MySQL",
      "Postman",
      "Vercel",
      "AWS basics",
    ],
    learn: [
      "Build responsive, accessible interfaces with HTML, CSS and JavaScript",
      "Create component-driven UIs in React with state and routing",
      "Design and consume REST APIs with Node.js, Express and Postman",
      "Model data in MongoDB and MySQL, and write queries that scale",
      "Add authentication, validation and file uploads to a real app",
      "Use Git and GitHub the way a team does — branches, PRs, reviews",
      "Deploy a full stack application to a live URL and debug it in production",
    ],
    curriculum: [
      {
        title: "Web foundations",
        topics: [
          "How the web works: HTTP, DNS, requests and responses",
          "Semantic HTML, forms and accessibility basics",
          "CSS layout: flexbox, grid and responsive breakpoints",
          "Chrome DevTools and debugging habits",
        ],
      },
      {
        title: "JavaScript and the browser",
        topics: [
          "Variables, functions, objects and arrays",
          "DOM, events and form validation",
          "ES6+, async/await, fetch and working with APIs",
          "Mini project: interactive web app",
        ],
      },
      {
        title: "React front end",
        topics: [
          "Components, props and state",
          "Hooks, effects and forms",
          "Routing and API integration",
          "Project: dashboard UI with live data",
        ],
      },
      {
        title: "Node.js and REST APIs",
        topics: [
          "Express routing, middleware and error handling",
          "REST design, validation and status codes",
          "Authentication with JWT and sessions",
          "Testing APIs with Postman",
        ],
      },
      {
        title: "Databases",
        topics: [
          "MongoDB collections, CRUD and aggregation",
          "SQL basics: joins, indexes and relationships",
          "Connecting a database to your API",
          "Data modelling for real features",
        ],
      },
      {
        title: "Capstone and deployment",
        topics: [
          "Scoping and planning your capstone",
          "Git workflow: branches, pull requests, reviews",
          "Deploying front end and API to the cloud",
          "Portfolio, resume and interview preparation",
        ],
      },
    ],
    brochureTitle: "Full Stack Development syllabus",
    reviews: [
      {
        name: "Rohit Kulkarni",
        role: "Full Stack Developer",
        quote:
          "The projects made the difference. I could explain what I built and why in interviews, not just list technologies.",
      },
      {
        name: "Sneha Patil",
        role: "Frontend Developer",
        quote:
          "Clear explanations and patient doubt-solving. The mentor reviewed my code line by line every week.",
      },
      {
        name: "Amit Shinde",
        role: "Software Engineer",
        quote:
          "I joined with zero coding background. The pace was beginner-friendly and the mock interviews were genuinely useful.",
      },
    ],
    faqs: [
      {
        question: "Do I need coding experience for the Full Stack Development course?",
        answer:
          "No. The program starts from HTML, CSS and programming fundamentals, then moves step by step to React, APIs and deployment. Complete beginners join every batch.",
      },
      {
        question: "Which stack should I choose — MERN, Spring Boot or Django?",
        answer:
          "The first four modules are common. After that you pick a track with your mentor: MERN for startups and product companies, Spring Boot for enterprise and service companies, Django if you prefer Python. You can attend overview sessions for all three before deciding.",
      },
      {
        question: "Will I get recordings if I miss a class?",
        answer:
          "Yes. Every live session is recorded and shared with the batch, so a missed class never means a missed topic.",
      },
      {
        question: "Does the course include placement assistance?",
        answer:
          "Yes — resume building, GitHub portfolio review, mock interviews and job-search guidance are included. Yantrix provides placement assistance; we do not promise a guaranteed job.",
      },
    ],
    ctaTitle: "Ready to build your first full stack app?",
    ctaText:
      "Talk to a counsellor about the next batch, the syllabus and the fee. We'll tell you honestly whether this program fits your goal.",
    ctaLabel: "Talk to a counsellor",
    whatsappMessage:
      "Hi Yantrix Technology, I'm interested in the Full Stack Development course. Please share the syllabus, fees and next batch details.",
    seoTitle: "Full Stack Development Course in Pune — Fees, Syllabus & Batches",
    seoDescription:
      "Learn full stack development in Pune with hands-on projects: HTML, CSS, JavaScript, React, Node.js, MongoDB and deployment. Online and classroom batches with placement assistance.",
  },

  {
    slug: "web-development",
    title: "Web Development",
    icon: "Globe",
    badge: "",
    description:
      "Learn modern website development from the ground up — semantic HTML, modern CSS, JavaScript and popular frameworks.",
    tagline:
      "Build fast, responsive websites from scratch — the skills behind every good-looking site on the internet.",
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
    heroStats: ["3–4 months", "Portfolio project", "Beginner friendly"],
    instructor: "Yantrix web mentors",
    language: LANGUAGE,
    batchNote: "New batch every month · weekend batch available",
    seatsNote: "Small batches — 15 learners per batch",
    priceNote: "Ideal first course if you are new to IT",
    aboutTitle: "The front-end foundation everything else builds on",
    aboutParagraphs: [
      "This course is for anyone who wants to make websites — properly. You will learn how a page is structured, how styles turn that structure into a design, and how JavaScript makes it respond to the person using it.",
      "By the end you will have built a complete responsive website, deployed it on a live URL, and be comfortable reading and fixing real front-end code.",
    ],
    benefits: [
      {
        title: "Design and code together",
        description:
          "You learn layout, spacing and typography alongside the code, so your pages look intentional — not like a first attempt.",
      },
      {
        title: "Mobile-first by default",
        description:
          "Every exercise is built for small screens first, then scaled up — the way professionals actually work.",
      },
      {
        title: "A portfolio you can share",
        description:
          "The final project is a live, responsive site you can put on your resume the same week you finish.",
      },
    ],
    tools: ["VS Code", "Git & GitHub", "Chrome DevTools", "HTML5", "CSS3", "Tailwind CSS", "JavaScript", "Netlify"],
    learn: [
      "Write clean, semantic HTML that search engines and screen readers understand",
      "Build responsive layouts with flexbox, CSS grid and media queries",
      "Style modern interfaces with utility-first CSS",
      "Add interactivity with vanilla JavaScript and the DOM",
      "Use Git and GitHub to publish and version your work",
      "Deploy a real website and connect a custom domain",
    ],
    curriculum: [
      {
        title: "HTML foundations",
        topics: ["Document structure", "Text, links and images", "Forms and inputs", "Accessibility and SEO basics"],
      },
      {
        title: "Modern CSS",
        topics: ["Selectors and the box model", "Flexbox and grid", "Responsive design", "Transitions and animations"],
      },
      {
        title: "JavaScript essentials",
        topics: ["Variables, functions, conditions", "Arrays and objects", "DOM and events", "Working with APIs"],
      },
      {
        title: "Project and launch",
        topics: ["Planning a multi-page site", "Reusable components", "Performance and image optimisation", "Deploying with Netlify or Vercel"],
      },
    ],
    brochureTitle: "Web Development syllabus",
    reviews: [
      {
        name: "Pooja Jadhav",
        role: "Web Designer",
        quote: "My portfolio finally looks like a real product. The layout sessions changed how I look at websites.",
      },
      {
        name: "Sagar More",
        role: "Frontend Intern",
        quote: "Short, practical classes. Every session ended with something working on screen.",
      },
    ],
    faqs: [
      {
        question: "Is Web Development enough to get a job?",
        answer:
          "It is a strong start for frontend and web design roles. Many students continue into the Full Stack Development program afterwards to cover back end and databases.",
      },
      {
        question: "Do I need a laptop?",
        answer:
          "Yes — any laptop that runs Chrome is enough. If you do not have one yet, talk to us before joining and we will suggest the minimum specification.",
      },
    ],
    ctaTitle: "Build your first real website with us",
    ctaText: "Ask about the next Web Development batch, timings and fee.",
    ctaLabel: "Enquire about this course",
    whatsappMessage:
      "Hi Yantrix Technology, I'm interested in the Web Development course. Please share the fees and batch timings.",
    seoTitle: "Web Development Course in Pune — HTML, CSS & JavaScript",
    seoDescription:
      "Learn web development from scratch in Pune: HTML5, modern CSS, JavaScript and responsive design, ending with a deployed portfolio website.",
  },

  {
    slug: "python-programming",
    title: "Python Programming",
    icon: "Braces",
    badge: "",
    description:
      "Start from zero and master Python — clean syntax, problem solving, automation and real-world mini projects.",
    tagline:
      "The friendliest first programming language — and the one that opens doors to data, AI and automation.",
    duration: "2–4 Months (typical)",
    fee: "On request",
    level: "Beginner",
    modes: ["Online", "Offline"],
    highlights: ["Core Python & OOP", "File & error handling", "Automation scripts", "Hands-on mini projects"],
    heroStats: ["2–4 months", "Practice-led", "No prior coding needed"],
    instructor: "Yantrix programming mentors",
    language: LANGUAGE,
    batchNote: "Weekday and weekend batches available",
    seatsNote: "Small batches — 15 learners per batch",
    priceNote: "Great base for Data Analytics and Data Science",
    aboutTitle: "Learn programming by writing programs",
    aboutParagraphs: [
      "Python is the language most professionals start with, because the syntax stays out of your way and the results appear quickly. This course focuses on thinking like a programmer — breaking a problem down, choosing the right data structure, and testing what you wrote.",
      "You will finish with a set of small tools: an automation script, a data-driven mini app and a clean, documented project on GitHub.",
    ],
    benefits: [
      {
        title: "Problem solving first",
        description:
          "Each class pairs a concept with exercises, so you practice the thinking — not just the syntax.",
      },
      {
        title: "Useful automation",
        description:
          "You will write scripts that rename files, read spreadsheets and talk to web APIs — the tasks that save real hours.",
      },
      {
        title: "A path into data and AI",
        description:
          "The same foundation feeds into Data Analytics, Data Science and machine learning. We help you choose the next step.",
      },
    ],
    tools: ["Python 3", "VS Code", "Jupyter Notebook", "Git & GitHub", "pip & virtualenv", "Pandas basics"],
    learn: [
      "Write clean Python with variables, loops, functions and modules",
      "Work with lists, dictionaries, sets and comprehensions",
      "Handle files, exceptions and user input safely",
      "Understand object-oriented programming in practice",
      "Automate repetitive tasks with scripts",
      "Build and publish a small Python project on GitHub",
    ],
    curriculum: [
      {
        title: "Python basics",
        topics: ["Setup and the interpreter", "Variables and data types", "Conditions and loops", "Functions and scope"],
      },
      {
        title: "Data structures",
        topics: ["Lists, tuples and sets", "Dictionaries", "Comprehensions", "Sorting and searching"],
      },
      {
        title: "Real-world Python",
        topics: ["Files and CSV", "Exceptions and logging", "Modules and packages", "Calling web APIs with requests"],
      },
      {
        title: "Objects and projects",
        topics: ["Classes and objects", "Inheritance in practice", "Mini project build", "Publishing on GitHub"],
      },
    ],
    brochureTitle: "Python Programming syllabus",
    reviews: [
      {
        name: "Vaishnavi Deshmukh",
        role: "Data Analyst (trainee)",
        quote: "I was scared of coding. By week three I was writing small scripts on my own.",
      },
    ],
    faqs: [
      {
        question: "Is Python hard for a complete beginner?",
        answer:
          "No — it is one of the easiest languages to start with, and the course assumes no prior programming experience.",
      },
      {
        question: "Will this help with data science?",
        answer:
          "Yes. This course builds the programming base; Data Analytics and Data Science build on it with statistics, SQL, Pandas and visualisation.",
      },
    ],
    ctaTitle: "Start programming with Python",
    ctaText: "Ask about batch timings, fees and what you will build.",
    ctaLabel: "Enquire about this course",
    whatsappMessage:
      "Hi Yantrix Technology, I'm interested in the Python Programming course. Please share the fees and batch details.",
    seoTitle: "Python Programming Course in Pune — Beginner to Advanced",
    seoDescription:
      "Learn Python programming in Pune from scratch: core syntax, data structures, OOP, automation and mini projects. Online and classroom batches.",
  },

  {
    slug: "java-programming",
    title: "Java Programming",
    icon: "MousePointerClick",
    badge: "",
    description:
      "Build a strong base in Java — object-oriented programming, collections and the mindset needed for enterprise development.",
    tagline:
      "The language behind banking, enterprise and Android — learn it with the discipline real teams expect.",
    duration: "3–5 Months (typical)",
    fee: "On request",
    level: "Beginner → Intermediate",
    modes: ["Online", "Offline"],
    highlights: ["Core Java & OOP", "Collections & generics", "Exception handling", "Console & mini apps"],
    heroStats: ["3–5 months", "OOP in depth", "Enterprise-ready base"],
    instructor: "Yantrix Java mentors",
    language: LANGUAGE,
    batchNote: "New batch every month · weekday and weekend options",
    seatsNote: "Small batches — 15 learners per batch",
    priceNote: "Pairs well with our Spring Boot sessions",
    aboutTitle: "Object-oriented programming, done properly",
    aboutParagraphs: [
      "Java rewards structure. This course teaches you to think in classes and interfaces, to design before you code, and to use the standard library instead of reinventing it.",
      "You finish ready for Spring Boot, enterprise backend roles and technical interviews that ask about OOP, collections and exception handling.",
    ],
    benefits: [
      {
        title: "Interview fundamentals",
        description:
          "Collections, memory behaviour and exception design are covered in the depth interviewers probe.",
      },
      {
        title: "Design before code",
        description:
          "Every project starts with a class diagram, so you learn to plan an application before typing.",
      },
      {
        title: "Clear path forward",
        description:
          "The course is built to lead into Spring Boot and backend development, with mentors who teach both.",
      },
    ],
    tools: ["JDK 21", "IntelliJ IDEA", "Maven", "JUnit", "Git & GitHub", "MySQL", "Postman"],
    learn: [
      "Write idiomatic Java with classes, objects and interfaces",
      "Use collections, generics and the streams API",
      "Handle exceptions and design reliable APIs",
      "Work with files, JDBC and a real database",
      "Test your code with JUnit",
      "Build and package a console application",
    ],
    curriculum: [
      {
        title: "Core Java",
        topics: ["Setup, JVM and bytecode", "Variables, operators, control flow", "Methods and arrays", "Strings and the standard library"],
      },
      {
        title: "Object-oriented design",
        topics: ["Classes, objects and constructors", "Inheritance and polymorphism", "Interfaces and abstraction", "SOLID in practice"],
      },
      {
        title: "Collections and modern Java",
        topics: ["List, Set and Map", "Generics", "Streams and lambdas", "Exception handling"],
      },
      {
        title: "Project and database",
        topics: ["JDBC and MySQL", "Layered application design", "JUnit testing", "Packaging and running the app"],
      },
    ],
    brochureTitle: "Java Programming syllabus",
    faqs: [
      {
        question: "Is Java still worth learning?",
        answer:
          "Yes. Java remains one of the most widely used languages in enterprise, banking and Android development, and it is still heavily tested in interviews.",
      },
      {
        question: "Do I need to know C or C++ first?",
        answer: "No. The course starts from the basics and assumes no earlier programming language.",
      },
    ],
    ctaTitle: "Build a serious Java foundation",
    ctaText: "Talk to us about the next Java batch and how it leads into Spring Boot.",
    ctaLabel: "Enquire about this course",
    whatsappMessage:
      "Hi Yantrix Technology, I'm interested in the Java Programming course. Please share the fees and batch details.",
    seoTitle: "Java Programming Course in Pune — Core Java & OOP",
    seoDescription:
      "Learn Core Java and object-oriented programming in Pune: collections, generics, exceptions, JDBC and JUnit, with a project-based curriculum.",
  },

  {
    slug: "data-analytics",
    title: "Data Analytics",
    icon: "BarChart3",
    badge: "",
    description:
      "Turn raw data into insights — Excel, SQL and visualisation dashboards that businesses actually use to make decisions.",
    tagline:
      "Learn to clean, question and visualise data — then present the story it tells.",
    duration: "3–5 Months (typical)",
    fee: "On request",
    level: "Beginner",
    modes: ["Online", "Offline"],
    highlights: ["Advanced Excel", "SQL queries & joins", "Power BI / dashboards", "Analytics mini project"],
    heroStats: ["3–5 months", "3 real datasets", "Dashboard portfolio"],
    instructor: "Yantrix data mentors",
    language: LANGUAGE,
    batchNote: "New batch every month · weekend batch available",
    seatsNote: "Small batches — 15 learners per batch",
    priceNote: "Includes Power BI and Excel practice files",
    aboutTitle: "From spreadsheet to dashboard",
    aboutParagraphs: [
      "Every company sits on data it does not fully use. An analyst turns that into answers: which product is growing, where the cost is leaking, what customers do before they leave.",
      "This course teaches the full loop — collecting and cleaning data, querying it with SQL, visualising it in Power BI, and explaining the result to people who are not analysts.",
    ],
    benefits: [
      {
        title: "Real datasets",
        description:
          "You work on messy sales, marketing and operations data — the kind you will actually meet at work.",
      },
      {
        title: "Answer, not chart",
        description:
          "Every dashboard exercise ends with the business question it answers, so you practice explaining findings.",
      },
      {
        title: "Portfolio you can defend",
        description:
          "Three finished dashboards plus SQL notebooks go into a portfolio you can walk an interviewer through.",
      },
    ],
    tools: ["Microsoft Excel", "SQL / MySQL", "Power BI", "Google Sheets", "Python basics", "Statistics"],
    learn: [
      "Clean, pivot and summarise data confidently in Excel",
      "Write SQL queries with joins, grouping and subqueries",
      "Design dashboards people can read in ten seconds",
      "Choose the right chart for the question",
      "Apply basic statistics without over-claiming",
      "Present insights clearly to non-technical stakeholders",
    ],
    curriculum: [
      {
        title: "Excel for analysts",
        topics: ["Formulas and lookups", "Pivot tables", "Cleaning messy data", "Charts that communicate"],
      },
      {
        title: "SQL",
        topics: ["SELECT, WHERE, ORDER BY", "Joins and relationships", "GROUP BY and aggregates", "Subqueries and window basics"],
      },
      {
        title: "Visualisation",
        topics: ["Power BI data model", "Measures and DAX basics", "Dashboard layout", "Storytelling with data"],
      },
      {
        title: "Capstone",
        topics: ["Choosing a dataset", "End-to-end analysis", "Dashboard build", "Presenting your findings"],
      },
    ],
    brochureTitle: "Data Analytics syllabus",
    reviews: [
      {
        name: "Prasad Bhosale",
        role: "MIS Executive",
        quote:
          "The SQL sessions were the turning point. I now write my own queries instead of waiting for the IT team.",
      },
      {
        name: "Shraddha Pawar",
        role: "Business Analyst (trainee)",
        quote: "Building dashboards from real data made interviews much easier to talk through.",
      },
    ],
    faqs: [
      {
        question: "Do I need programming for data analytics?",
        answer:
          "No. Excel, SQL and Power BI cover most analyst roles. Python is introduced as an optional next step.",
      },
      {
        question: "Is maths required?",
        answer:
          "Only school-level arithmetic and percentages. We cover the statistics you need — averages, distributions and correlation — from first principles.",
      },
    ],
    ctaTitle: "Learn to make data say something",
    ctaText: "Ask about the next Data Analytics batch and the datasets you will work on.",
    ctaLabel: "Enquire about this course",
    whatsappMessage:
      "Hi Yantrix Technology, I'm interested in the Data Analytics course. Please share the fees and batch details.",
    seoTitle: "Data Analytics Course in Pune — Excel, SQL & Power BI",
    seoDescription:
      "Data Analytics course in Pune: Excel, SQL, Power BI dashboards and a real-data capstone. Online and classroom batches with placement assistance.",
  },

  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    icon: "Megaphone",
    badge: "",
    description:
      "Learn practical digital marketing — SEO, social media, ads and analytics — with campaigns you plan and run yourself.",
    tagline: "Plan, run and measure campaigns — not just watch tutorials about them.",
    duration: "2–3 Months (typical)",
    fee: "On request",
    level: "Beginner",
    modes: ["Online", "Offline"],
    highlights: ["SEO fundamentals", "Social media marketing", "Google Ads basics", "Live campaign practice"],
    heroStats: ["2–3 months", "Live campaign", "Portfolio ready"],
    instructor: "Yantrix marketing mentors",
    language: LANGUAGE,
    batchNote: "New batch every month · evening batch available",
    seatsNote: "Small batches — 15 learners per batch",
    priceNote: "Bring a real business to work on if you have one",
    aboutTitle: "Marketing you can measure",
    aboutParagraphs: [
      "Digital marketing works when you can connect a post, an ad or a page to a result. This course teaches the four levers — search, social, content and paid ads — and the analytics that tell you which one is working.",
      "You will run a real campaign, read the numbers, and write a report explaining what you would change next month.",
    ],
    benefits: [
      {
        title: "Hands-on campaigns",
        description:
          "You set up a small live campaign (organic and paid) and measure it, instead of only studying screenshots.",
      },
      {
        title: "Content and copy",
        description:
          "Practical writing sessions for captions, landing pages and ad copy — the part most courses skip.",
      },
      {
        title: "Freelance ready",
        description:
          "You leave with a documented case study you can show to a client or an employer.",
      },
    ],
    tools: ["Google Analytics 4", "Google Search Console", "Meta Business Suite", "Google Ads", "Canva", "WordPress", "ChatGPT"],
    learn: [
      "Research keywords and build on-page SEO that actually ranks",
      "Plan a content calendar and write copy that converts",
      "Run and optimise a Meta or Google Ads campaign on a small budget",
      "Read GA4 reports and understand what the numbers mean",
      "Design creative assets for social platforms",
      "Write a monthly marketing report a manager can act on",
    ],
    curriculum: [
      {
        title: "Foundations",
        topics: ["Marketing funnels", "Audience research", "Brand voice", "Channel selection"],
      },
      {
        title: "Search and content",
        topics: ["Keyword research", "On-page and technical SEO", "Blog and landing page writing", "Search Console"],
      },
      {
        title: "Social and paid ads",
        topics: ["Platform playbooks", "Creative that stops the scroll", "Google and Meta ads setup", "Budget and bidding basics"],
      },
      {
        title: "Analytics and campaign",
        topics: ["GA4 events and conversions", "UTM tracking", "Live campaign build", "Reporting and case study"],
      },
    ],
    brochureTitle: "Digital Marketing syllabus",
    faqs: [
      {
        question: "Can I do digital marketing without a marketing degree?",
        answer:
          "Yes. This course is practical and starts from fundamentals. Most learners come from non-marketing backgrounds.",
      },
      {
        question: "Will I get to run real ads?",
        answer:
          "Yes, with a small practice budget. You can also bring a business you already work with and build the campaign around it.",
      },
    ],
    ctaTitle: "Run your first real campaign",
    ctaText: "Ask about the next Digital Marketing batch and the live campaign project.",
    ctaLabel: "Enquire about this course",
    whatsappMessage:
      "Hi Yantrix Technology, I'm interested in the Digital Marketing course. Please share the fees and batch details.",
    seoTitle: "Digital Marketing Course in Pune — SEO, Ads & Analytics",
    seoDescription:
      "Practical digital marketing course in Pune: SEO, social media, Google and Meta ads, GA4 analytics and a live campaign project.",
  },

  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    icon: "Palette",
    badge: "",
    description:
      "Design products people love to use — design thinking, wireframing, prototyping and a polished portfolio in Figma.",
    tagline: "Turn messy problems into clear screens — and prove your choices with a portfolio.",
    duration: "3–4 Months (typical)",
    fee: "On request",
    level: "Beginner",
    modes: ["Online", "Offline"],
    highlights: ["Design thinking", "Wireframes & prototypes", "Figma hands-on", "Portfolio case study"],
    heroStats: ["3–4 months", "3 case studies", "Figma from day one"],
    instructor: "Yantrix design mentors",
    language: LANGUAGE,
    batchNote: "Weekday and weekend batches available",
    seatsNote: "Small batches — 15 learners per batch",
    priceNote: "Includes portfolio and case-study reviews",
    aboutTitle: "Design that solves a problem",
    aboutParagraphs: [
      "Good UI is the visible half of a good product. UX is the thinking underneath it: who the user is, what they are trying to do, and what gets in the way.",
      "You will learn research and wireframing, build interactive prototypes in Figma, and present three case studies the way design interviews expect.",
    ],
    benefits: [
      {
        title: "Case studies, not screenshots",
        description:
          "Each project is documented from problem to outcome, with the decisions that shaped the final screens.",
      },
      {
        title: "Feedback every week",
        description:
          "Mentor critiques on real work, plus peer reviews that mirror a design team's routine.",
      },
      {
        title: "Figma in depth",
        description: "Components, auto-layout, variants and prototyping — the tools jobs actually ask for.",
      },
    ],
    tools: ["Figma", "FigJam", "Maze basics", "Notion", "Adobe Photoshop", "Canva"],
    learn: [
      "Run light user research and turn findings into requirements",
      "Structure information and sketch low-fidelity flows",
      "Build a reusable design system in Figma",
      "Create interactive prototypes and test them with users",
      "Apply colour, type and spacing with accessible contrast",
      "Present a case study that survives a design interview",
    ],
    curriculum: [
      {
        title: "Design thinking",
        topics: ["Problem framing", "User interviews", "Personas and journeys", "Defining success"],
      },
      {
        title: "Structure and flows",
        topics: ["Information architecture", "Wireframing", "Navigation patterns", "Usability heuristics"],
      },
      {
        title: "Interface craft",
        topics: ["Typography and colour", "Layout and spacing", "Components and auto-layout", "Accessibility"],
      },
      {
        title: "Prototype and portfolio",
        topics: ["Interactive prototyping", "Usability testing", "Case study writing", "Portfolio review"],
      },
    ],
    brochureTitle: "UI/UX Design syllabus",
    reviews: [
      {
        name: "Nikita Sawant",
        role: "UI Designer",
        quote: "The case-study method is why I got callbacks. Interviewers finally had something to discuss.",
      },
    ],
    faqs: [
      {
        question: "Do I need to know how to draw?",
        answer: "No. UI/UX design is about structure, clarity and problem solving — not illustration skills.",
      },
      {
        question: "Which tool will I learn?",
        answer: "Figma, from the first week. It is the industry standard for interface design and prototyping.",
      },
    ],
    ctaTitle: "Design your first product case study",
    ctaText: "Ask about the next UI/UX batch and how portfolio reviews work.",
    ctaLabel: "Enquire about this course",
    whatsappMessage:
      "Hi Yantrix Technology, I'm interested in the UI/UX Design course. Please share the fees and batch details.",
    seoTitle: "UI/UX Design Course in Pune — Figma & Portfolio",
    seoDescription:
      "UI/UX design course in Pune: design thinking, wireframing, Figma prototyping and three portfolio case studies. Online and classroom batches.",
  },

  {
    slug: "basic-computer-training",
    title: "MS-CIT / Basic Computer Training",
    icon: "Laptop",
    badge: "",
    description:
      "A beginner-friendly course for absolute starters — computer fundamentals, MS Office, internet skills and exam readiness.",
    tagline: "The confidence to use a computer at work — from switching it on to building a spreadsheet.",
    duration: "2–3 Months (typical)",
    fee: "On request",
    level: "Absolute beginner",
    modes: ["Online", "Offline"],
    highlights: ["Computer fundamentals", "MS Office suite", "Internet & email skills", "Practice tests"],
    heroStats: ["2–3 months", "Absolute beginner", "Practice tests included"],
    instructor: "Yantrix computer faculty",
    language: LANGUAGE,
    batchNote: "Morning and afternoon batches available",
    seatsNote: "Small batches — 15 learners per batch",
    priceNote: "No prior computer experience needed",
    aboutTitle: "Start from the very beginning",
    aboutParagraphs: [
      "This course assumes nothing. You will learn how a computer works, how to type comfortably, how to use Windows, and how to work with documents, spreadsheets and presentations.",
      "It also covers internet and email safely, online forms, and the digital skills offices expect on day one — plus practice tests for MS-CIT style exams.",
    ],
    benefits: [
      {
        title: "Patient teaching",
        description:
          "Sessions move at the pace of the batch, with time to repeat anything that did not land the first time.",
      },
      {
        title: "Office-ready skills",
        description:
          "Word, Excel, PowerPoint and email taught through tasks you will actually be asked to do at work.",
      },
      {
        title: "Practice and confidence",
        description: "Regular practice tests and one-on-one help build the confidence to use a computer alone.",
      },
    ],
    tools: ["Windows", "MS Word", "MS Excel", "MS PowerPoint", "Gmail", "Google Drive"],
    learn: [
      "Use Windows, files and folders without hesitation",
      "Type comfortably and use keyboard shortcuts",
      "Write, format and print documents in MS Word",
      "Build spreadsheets with formulas and charts in Excel",
      "Create a presentation in PowerPoint",
      "Use email, online forms and cloud storage safely",
    ],
    curriculum: [
      {
        title: "Computer basics",
        topics: ["Parts of a computer", "Windows and the desktop", "Files and folders", "Keyboard and mouse skills"],
      },
      {
        title: "MS Word",
        topics: ["Typing and formatting", "Tables and images", "Page setup and printing", "Resume and letter practice"],
      },
      {
        title: "MS Excel",
        topics: ["Rows, columns and sheets", "Formulas and functions", "Charts", "Simple reports"],
      },
      {
        title: "Internet and exams",
        topics: ["Browsing and search", "Email and attachments", "Online forms and payments", "MS-CIT style practice tests"],
      },
    ],
    brochureTitle: "Basic Computer Training syllabus",
    faqs: [
      {
        question: "I have never used a computer. Can I join?",
        answer:
          "Yes — this course is designed for absolute beginners and starts from switching the computer on.",
      },
      {
        question: "Is this the same as MS-CIT?",
        answer:
          "The syllabus follows MS-CIT style topics and includes practice tests. Certification requirements change from time to time; ask us for the current details.",
      },
    ],
    ctaTitle: "Learn computers at your own pace",
    ctaText: "Ask about morning or afternoon batches — both are beginner friendly.",
    ctaLabel: "Enquire about this course",
    whatsappMessage:
      "Hi Yantrix Technology, I'm interested in the Basic Computer / MS-CIT course. Please share the fees and batch timings.",
    seoTitle: "MS-CIT & Basic Computer Course in Pune for Beginners",
    seoDescription:
      "Beginner computer course in Pune: Windows, MS Word, Excel, PowerPoint, internet and email, with MS-CIT style practice tests.",
  },
];
