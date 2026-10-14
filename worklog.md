# Worklog

---
Task ID: 1
Agent: Z.ai Code (main agent)
Task: Build the complete Yantrix Technology website (IT training institute) — Home, Courses, About Us, Contact Us pages with blue/white/black theme, SEO/AEO/GEO optimization, contact form backend, WhatsApp integration.

Work Log:
- Inspected project: Next.js 16 (App Router), TypeScript 5, Tailwind CSS 4, shadcn/ui (New York), Prisma + SQLite, framer-motion, zustand, react-hook-form, zod.
- Generated 4 AI brand images via z-ai CLI: hero-1.png, hero-2.png, hero-3.png (1344x768) and about-institute.png (1152x864) into public/images/. (First batch failed on 1440x720 — size must be multiple of 32px.)
- Theme: rewrote src/app/globals.css — brand blue palette (brand-50…950), primary = deep blue #1e40af, ink/black foreground, custom scrollbar, view-switch fade animation, placeholder-chip style. Font switched to Plus Jakarta Sans (variable).
- Created src/lib/site-config.ts — brand info, positioning line, WhatsApp deep-link builder, TODO contact placeholders (phone/email/address clearly marked), per-view SEO titles/descriptions.
- Created src/lib/data.ts — 8 courses (Full Stack, Web Dev, Python, Java, Data Analytics, Digital Marketing, UI/UX, MS-CIT/Basic Computers) with mode badges + editable duration placeholders, 6 FAQs (incl. the 5 required AEO questions), why-choose-us (6), badges (4), hero slides (3), training approach (4), placement points (4).
- Created src/lib/store.ts — zustand store for single-route view navigation (home/courses/about/contact) with course pre-selection and section scrolling. All 4 views render server-side and toggle via `hidden` so all content stays crawlable (preview env only exposes "/").
- Built components (src/components/site/): header (sticky, utility bar, mobile sheet menu), footer (sticky bottom via min-h-screen flex + mt-auto), whatsapp float + icon, hero slider (autoplay 6s, arrows, dots, trust chips), badges strip, why-choose-us, training modes (online/offline), about preview (Since 2024 floating card), placement section (with honest "assistance not guarantee" disclaimer), FAQ accordion, CTA band, page-home, page-courses (8 cards + duration disclaimer + counselling strip), page-about (story, GEO "at a glance" facts block, mission/vision, 4-step approach), page-contact (react-hook-form + zod validation), site-shell (per-view document.title + meta description updates, scroll handling, skip link).
- Backend: added CourseEnquiry model to prisma/schema.prisma, ran db:push; created src/app/api/contact/route.ts — POST with zod validation, mobile normalization, in-memory rate limit (5/10min/IP), saves to SQLite, returns 201/422/429/500.
- SEO/AEO/GEO: layout metadata (metadataBase https://yantrixtechnology.com, title template, keywords, OG, Twitter card, canonical, robots directives, themeColor); server-rendered JSON-LD in page.tsx (EducationalOrganization, WebSite, FAQPage, Course ItemList); app/sitemap.ts; public/robots.txt + Sitemap line; app/icon.svg favicon; semantic h1/h2/h3 and alt text everywhere.
- Fixed during verification: Plus Jakarta Sans multiple-weight query crashed Turbopack ("queries have exactly one entry") → removed weight array (variable font); hero-3.png 404 (regenerated); next/image sizes warning; Radix Select uncontrolled→controlled warning (always-controlled value + SelectValue children).
- Verified end-to-end with agent-browser (desktop 1280px + mobile 390px): all 4 views navigate, per-view titles update, slider arrows/autoplay, 8 course cards, Enquire Now pre-fills course on contact form, empty/invalid form shows zod errors, valid submission saved to DB (verified row via Prisma), success panel shows, FAQ accordion opens, WhatsApp links present, sitemap.xml + robots.txt + canonical + OG verified via curl, no console errors, lint clean.

Stage Summary:
- Single production-style site at "/" with 4 client-navigated views (required: preview only exposes "/"), all content server-rendered + crawlable.
- Key artifacts: src/components/site/* (14 components), src/lib/{site-config,data,store}.ts, src/app/{layout,page,globals.css,sitemap.ts,icon.svg}, src/app/api/contact/route.ts, prisma CourseEnquiry model, public/images/* (4 AI images), public/robots.txt.
- Business TODOs (clearly marked in src/lib/site-config.ts): WhatsApp number, phone, email, address. Durations marked "typical" and editable in src/lib/data.ts.
- Content rules honored: "Placement Assistance" wording only, no fabricated numbers/contacts/reviews, honest disclaimer bands on Home + About + footer.
