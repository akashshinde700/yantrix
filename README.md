# Yantrix Technology — website + admin panel

> 📘 **Naye user hain?** [`docs/Yantrix-User-Guide-Hinglish.docx`](docs/Yantrix-User-Guide-Hinglish.docx) —
> poori Hinglish user guide, har public page aur har admin panel ke screenshots + step-by-step instructions ke saath.

Marketing website for **Yantrix Technology** (IT training institute, Dhanori, Pune)
with a complete, password-protected admin panel. Every piece of text on the
public site — hero slides, courses, FAQs, section headings, page copy, contact
details and SEO settings — can be edited without touching code.

Built with **Next.js 16 (App Router)**, TypeScript, Tailwind CSS v4 and shadcn/ui.

---

## Quick start

```bash
npm install
cp .env.example .env      # optional: set ADMIN_SESSION_SECRET + first admin
npm run dev               # http://localhost:3000
```

- Website → `http://localhost:3000`
- Admin panel → `http://localhost:3000/admin`

**Admin sign-in** is two-step: email + password, then a 6-digit code. The first
owner account is created on the first login attempt.

| Environment | First owner account |
| --- | --- |
| `NODE_ENV=production` | **Requires** `ADMIN_EMAIL` + `ADMIN_PASSWORD`. Without them sign-in fails with a clear error — no account is created. |
| development | Falls back to `admin@yantrixtechnology.com` / `Yantrix@2024` and logs a warning. |

```bash
# production bootstrap
openssl rand -base64 48          # → ADMIN_SESSION_SECRET
# .env → ADMIN_EMAIL you@yourdomain.com  ADMIN_PASSWORD 'a-long-password'
```

> ⚠️ In production, `ADMIN_SESSION_SECRET` and SMTP are both **required**:
> without a secret the app refuses to sign sessions (it never falls back to a
> published value), and without SMTP the one-time code cannot be delivered, so
> sign-in fails instead of silently skipping the second factor.
> Change the password after the first sign-in via **Admin → Admin users**.

Production build:

```bash
npm run build
npm run start
```

---

## What can be managed from the admin panel

| Screen             | Controls                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard          | Content counters, latest enquiries, SEO/AEO health score                                                                                                              |
| Hero slides        | Slides, images, headlines, CTAs, trust chips                                                                                                                          |
| Courses            | Course cards **and** a full page per course: cover image, fee card, about copy, specialisations, outcomes, tools, module-by-module curriculum, reviews, FAQs, CTA, SEO |
| Mentors            | The "Meet Your Mentors" wall: photo, name, **company / institution**, years of experience, **specialisation**, bio, skill chips, LinkedIn, plus the full profile dialog (experience timeline, education, domains) |
| FAQs               | Q&A list (also feeds `FAQPage` structured data)                                                                                                                       |
| Page sections      | Heading/eyebrow/description for every section + hide a section; feature cards, stats, tech ticker, training modes, placement points, quick facts, after-enquiry steps, **offer ticker, campus gallery, partners, videos, testimonials, centres** — every list supports add / edit / **duplicate** / reorder / hide / delete |
| Pages & navigation | Page-specific copy (home / courses / about / contact) and header/footer links                                                                                         |
| Interface text     | Every button, badge and micro-copy line on the site (~120 strings) grouped by area: header/footer, shared buttons, hero & popup, home, courses, course detail page, contact, floating helpers, legal pages |
| Media library      | Upload (drag & drop, auto-resized), preview, copy-URL and delete every image used across the site                                                                     |
| SEO · AEO · GEO    | Titles, descriptions, keywords, canonicals, OpenGraph, verification tokens, analytics IDs, local SEO coordinates, JSON-LD toggles, `llms.txt` facts                   |
| Enquiries          | Search, statuses (new → contacted → enrolled → closed), internal notes, CSV export                                                                                    |
| Admin users        | Multiple admins with `owner` / `editor` / `viewer` roles                                                                                                              |
| Site settings      | Brand, contact details, WhatsApp, social profiles, top bar, footer, legal text, password change, content reset                                                        |

### Course pages

Every course in **Admin → Courses** owns a public page at `/courses/<slug>`.
The editor is split into five tabs so the page can be filled in gradually —
anything left empty is simply not rendered:

| Tab | What it controls |
| --- | --- |
| Basics | Name, slug, icon, badge, description, tagline, "who it is for", cover image, fee + fee note, duration, modes, batch/seats notes, instructor, language, headline stats, announcement strip + next batch start date (drives the countdown), highlight chips, publish state |
| About & highlights | "About this course" paragraphs and image, what-you'll-learn outcomes, benefit cards (with optional big figure + label), specialisation tracks (MERN / Spring Boot / Django…), tools grid, brochure |
| Projects & extras | Capstone projects and mini projects (cards, optional screenshot), the "what's included" icon grid, and the certificate block |
| Curriculum | Syllabus modules — each one becomes an expandable row with its own topic list |
| Batches & placement | Upcoming batch rows (name, timing, start date, seats, mode), placement & career-support heading, intro and points, trainer card |
| Reviews & FAQs | Student quotes, plus course-specific Q&A (also exported as FAQ structured data) |
| CTA & SEO | Closing call to action, mobile sticky button label, WhatsApp message, search title and meta description |

Already-published courses can pick up the newer sections without losing their
own copy: **Admin → Courses → “Fill new sections”** fills only the fields that
are still empty (never overwrites text you wrote).

Slugs are generated from the course name (and de-duplicated with a `-2` suffix
by the API), so two courses can never fight over the same URL. The course name
is the only required field — the rest can be added later.

### Home page sections (added from the reference audit)

Everything below is editable in **Admin → Page sections** (content) and
**Admin → Pages & navigation** (brochure / app copy). Each block hides itself
when it has no content, so nothing breaks before you fill it in.

| Block | Where it appears | Admin screen |
| --- | --- | --- |
| Offer ticker | Scrolling strip above the header, every page (pauses on hover, static for reduced-motion) | Page sections → Offer ticker |
| Campus gallery | Home page — filter chips by category + click-to-zoom lightbox | Page sections → Campus gallery |
| Partners & certifications | Home page — logo/label cards with an optional link | Page sections → Partners & certifications |
| Videos | Home page — YouTube cards that load the player only on click | Page sections → Videos |
| Student testimonials | Home page — star rating, quote, optional video testimonial | Page sections → Student testimonials |
| Brochure download | Home page — checklist + PDF button (falls back to the enquiry form) | Pages & navigation → Home · brochure download |
| Mobile app | Home page — phone mock-up + store button | Pages & navigation → Home · mobile app |
| Find us here (centres) | Home page — every centre with address, timings, call and directions | Page sections → Centres |

Footer quick links can point at any of these blocks by filling in the optional
**section anchor** (`gallery`, `videos`, `testimonials`, `brochure`, `app`,
`centres`) — handy for a "Gallery" or "Our centres" link.

### Nothing is hard-coded

Every visible string, image and list on the public site comes from the content
document, so the site can be reworded end-to-end from the admin panel:

- **Headings & intros** → Page sections / Pages & navigation
- **Buttons, badges, form labels, empty states, aria labels** → Interface text
  (`content.labels`, ~120 keys, defaults in `src/lib/content/labels.ts`)
- **Lists** (courses, trainers, FAQs, gallery, videos, testimonials, centres…)
  → their own admin screens, each with add / edit / duplicate / reorder / hide /
  delete
- **Images** → Media library (stored in the content store, served from
  `/media/<id>`, so they survive redeploys)

A label added in a newer release appears automatically for existing installs —
the store backfills missing keys from `DEFAULT_CONTENT`, and the site falls back
to the built-in default instead of rendering an empty button.

### Course page sections

Every course page is assembled from admin-managed blocks; each one hides itself
when it has no content, so a half-filled course still looks finished:

| Section | Editable in |
| --- | --- |
| About the course + specialisation tracks | Basics · About & highlights |
| **What do we offer** (benefit cards) | About & highlights → benefit cards (`offerTitle` overrides the heading) |
| **Who should attend?** (persona bullets) | Basics → "Who should attend" heading + bullets |
| Tools covered | About & highlights → tools |
| What you'll learn | About & highlights → outcomes |
| **Course Curriculum** — summary strip (modules · sessions), search, show/hide all, numbered module timeline with per-module session count and optional duration chip, syllabus PDF row | Curriculum tab |
| What's included (icon grid) | Projects & extras → inclusions |
| **Stand out with an industry-recognized certification** | Projects & extras → Certification |
| **Capstone projects** and **Mini projects** (separate headings + counts) | Projects & extras |
| Batches, placement, mentor, reviews, FAQs, related, CTA | their own tabs |

All eyebrows, headings, intros, empty states and button labels on this page live
in **Interface text → Course page headings**, so the wording can change without
touching the per-course content.

### Mentors & partner companies

- **Meet Your Mentors** — portrait cards (`aspect-[3/4]`) with the mentor's name,
  company/institution, years of experience and specialisation, a live count strip
  (mentors · combined years · specialisations) and filter chips that appear once
  there are more than three mentors and more than one specialisation. Clicking a
  card opens the full profile. Everything, including the chips' behaviour, is
  driven by the Mentors collection in the admin panel.
- **Partners & collaborations** — a scrolling company wall (uploaded logo, or a
  monogram + name when there is no logo yet) above the descriptive partner cards.
  Add each partner with its label and optional link in **Page sections →
  Partners & certifications**.

**Mentors.** The 17 profiles that ship with the site are the mentors supplied by
the site owner — name, role, experience, specialisation and portrait for each,
stored under `public/images/mentors/` (600×800 JPEG). Edit or remove them from
**Admin → Trainers** (the page is titled "Mentors"): photo, company, years,
LinkedIn, bio, experience, education and skills are all fields there, and the
eye switch hides a profile without deleting it.

**Partners.** The eight company names in that strip are **placeholders**
(invented, no real brands). Replace them from **Admin → Page sections →
Partners & certifications**, and only list partnerships you can back up.

### Design system (futuristic layer)

The dark "universe" theme ships reusable effects in `src/app/globals.css`:
`aurora-card` (rotating gradient ring), `sweep-card` (light sweep on hover),
`hud-chip`, `grid-veil`, `glass`, `text-gradient-cyber`, `btn-futur`,
`card-glow-dark` and the marquee `ticker-track`. All of them switch off for
`prefers-reduced-motion`.

### Motion, focus and the floating stack

Three rules keep the animated UI from fighting itself:

- **One floating stack.** Everything pinned to the bottom of the viewport reads
  `--fab-bottom`, `--fab-bottom-2` and `--fab-panel-bottom` (globals.css) instead
  of hard-coded `bottom-*` values: guide launcher and WhatsApp on row one,
  back-to-top and the page dock on row two, popovers above row one. The course
  page's mobile enquiry bar sets `data-mobile-cta` on `<html>`, which lifts the
  whole stack above it — no more buttons covering each other.
- **Reduced motion is honoured twice.** `<MotionConfig reducedMotion="user">`
  in the site shell covers every Framer Motion animation, and a global
  `prefers-reduced-motion` block collapses CSS transitions/animations. Marquees
  measure their own width (`use-marquee.ts`) so speed stays constant, and pause
  while off screen.
- **Focus is always visible.** A single `:focus-visible` rule in globals.css
  gives every link, button and field a high-contrast ring (cyan on dark, blue on
  light); dialogs and the photo lightbox trap focus and hand it back when they
  close, and scrolling helpers in `scroll-lock.ts` drive Lenis so programmatic
  jumps are not undone by the smooth-scroll loop.

### Roles

| Role     | Can do                                                              |
| -------- | ------------------------------------------------------------------- |
| `owner`  | Everything, including managing admin accounts and resetting content |
| `editor` | Create / edit / delete website content, manage enquiries            |
| `viewer` | Read-only access to the panel                                       |

---

## SEO / AEO / GEO features

- Per-page `<title>`, meta description, keywords, canonical URL and OpenGraph/Twitter cards
- Real URLs for every page: `/`, `/courses`, `/about`, `/contact` (all server-rendered)
- JSON-LD structured data generated from live content: `EducationalOrganization`,
  `LocalBusiness` (with geo + opening hours), `WebSite`, `ItemList` of `Course`s,
  `FAQPage` and `BreadcrumbList`
- `sitemap.xml`, `robots.txt` (explicitly allows GPTBot, OAI-SearchBot, PerplexityBot,
  ClaudeBot, Google-Extended) and `manifest.webmanifest` — all generated dynamically
- `llms.txt` — a machine-readable summary for AI answer engines, built from the
  admin-managed key facts, courses and FAQs
- Google Search Console / Bing verification meta tags, GA4 and Microsoft Clarity support
- Built-in SEO health checklist in the admin panel

---

## Data storage

Content, enquiries, admin accounts and the audit log live in **MySQL**
(`DATABASE_URL`); `db/schema.sql` documents the tables, which are created
automatically on first use.

```bash
mysql -e 'CREATE DATABASE IF NOT EXISTS yantrix'
# .env → DATABASE_URL=mysql://root:root@localhost:3306/yantrix
```

`src/lib/content/store.ts` is a small façade over two interchangeable backends:

| `CONTENT_STORE`  | Behaviour                                                                                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auto` (default) | MySQL, falling back to the JSON file store in `./data` when the database cannot be reached (fresh checkout, CI, `next build` without a database, offline preview). The fallback is logged once and re-tested on later calls, so a database that comes up later is used again. |
| `mysql`          | MySQL only — connection problems are fatal. Use this in production so a misconfigured database never silently writes to local files.                                                                                      |
| `json`           | JSON files only, no database needed.                                                                                                                                                                                      |

The JSON fallback keeps `site-content.json`, `enquiries.json`, `admins.json` and
`audit-log.json` in `./data` (configurable with `DATA_DIR`, git-ignored, seeded
from `src/lib/content/defaults.ts`, written atomically with a per-file write
queue). If that directory is not writable either, the store keeps everything in
memory for the running process, which is enough for read-only previews.

## Project structure

```
src/
├── app/
│   ├── page.tsx, courses/, about/, contact/   # public routes (server-rendered)
│   ├── admin/                                 # admin panel (login + protected group)
│   ├── api/contact/                           # public enquiry endpoint
│   ├── api/admin/*                            # authenticated admin API
│   ├── sitemap.ts, robots.ts, manifest.ts, llms.txt/
├── components/
│   ├── site/                                  # public website components
│   ├── admin/                                 # admin UI (forms, editors, tables)
│   └── ui/                                    # shadcn/ui primitives
└── lib/
    ├── content/                               # types, defaults, provider, store, icons
    ├── admin/auth.ts                          # sessions, passwords, roles
    └── seo.ts                                 # metadata, JSON-LD, sitemap, llms.txt
```

## Automated audits

Three dependency-light Playwright scripts verify the site end-to-end (a
Chromium binary is required: Playwright's browser download, or set
`CHROMIUM_PATH` to any Chromium/Chrome executable).

```bash
npm run audit         # pages, console, links, a11y, overflow, admin CRUD
npm run audit:seo     # title/description/canonical/OG/JSON-LD/sitemap/robots/llms.txt
npm run audit:flows   # mobile nav, enquiry prefill, validation, admin edits, roles
```

All three accept `AUDIT_BASE` (default `http://127.0.0.1:3000`) so they can be
pointed at a preview or the live site:

```bash
AUDIT_BASE=https://yantrixtechnology.com node scripts/audit-seo.mjs
```

`scripts/audit.mjs` writes `audit-output/report.json` plus desktop/mobile
screenshots of every page audited (the folder is git-ignored). Both browser
scripts read the admin credentials from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Every
script exits non-zero when an issue is found, so they can run in CI. (The
documented default password only exists in development — see **Quick start**.)
