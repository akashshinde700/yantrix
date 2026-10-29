# Yantrix Technology — website + admin panel

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

**First login** (created automatically on the first login attempt):

| Email                         | Password       |
| ----------------------------- | -------------- |
| `admin@yantrixtechnology.com` | `Yantrix@2024` |

> ⚠️ Change the password right away in **Admin → Site settings → Your sign-in password**,
> or set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` before the first login.

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
| Courses            | Course cards, duration, fees, level, modes, syllabus chips, icons                                                                                                     |
| FAQs               | Q&A list (also feeds `FAQPage` structured data)                                                                                                                       |
| Page sections      | Heading/eyebrow/description for every section + hide a section; feature cards, stats, tech ticker, training modes, placement points, quick facts, after-enquiry steps |
| Pages & navigation | Page-specific copy (home / courses / about / contact) and header/footer links                                                                                         |
| SEO · AEO · GEO    | Titles, descriptions, keywords, canonicals, OpenGraph, verification tokens, analytics IDs, local SEO coordinates, JSON-LD toggles, `llms.txt` facts                   |
| Enquiries          | Search, statuses (new → contacted → enrolled → closed), internal notes, CSV export                                                                                    |
| Admin users        | Multiple admins with `owner` / `editor` / `viewer` roles                                                                                                              |
| Site settings      | Brand, contact details, WhatsApp, social profiles, top bar, footer, legal text, password change, content reset                                                        |

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

Website content, enquiries and admin accounts are stored as JSON documents in
`./data` (configurable with `DATA_DIR`), written atomically with a per-file write
queue. The directory is gitignored and seeded automatically from
`src/lib/content/defaults.ts` on first run, so a fresh deploy just works — no
database required.

```
data/
├── site-content.json   # all editable website content
├── enquiries.json      # contact form submissions
├── admins.json         # admin accounts (scrypt-hashed passwords)
└── audit-log.json      # recent admin actions
```

If the directory is not writable the store falls back to in-memory data for the
running process (useful for read-only previews).

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
scripts read the admin credentials from `ADMIN_EMAIL` / `ADMIN_PASSWORD` and
fall back to the seeded defaults. Every script exits non-zero when an issue is
found, so they can run in CI.
