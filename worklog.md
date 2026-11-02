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

---
Task ID: 2
Agent: Z.ai Code (main agent)
Task: Reference fusion-institute.com design; add premium animations + SVG hover effects site-wide; replace AI images containing Chinese people / Chinese language with Indian-context, English-only images (user request — site is for India).

Work Log:
- Fetched fusion-institute.com/generic-lp (page_reader returned empty; curl succeeded) and extracted its structure: hero with stats bar, "Why Choose" 6-card grid, course cards with "Hover to learn more" + tech tags, certifications strip, placed students, testimonials, final CTA. Adopted/adapted these patterns without copying content or fabricated numbers.
- Audited all 4 existing AI images. hero-1.png was already Indian students (kept). Regenerated via z-ai CLI: hero-2.png (Indian woman developer, online learning), hero-3.png (all-Indian team, hands stacked, blue office), about-institute.png (Indian classroom with English "YANTRIX TECHNOLOGY" wall sign). Removed the old images that showed East-Asian people and Chinese wall text "IT培训学院".
- globals.css: added full motion system — marquee, kenburns, float-y, btn-shine sweep, gradient-x + .text-gradient, SVG .dash-flow / .dash-flow-slow, spin-slow(+rev), hover-wiggle, .spotlight-card (+ .spotlight-dark) mouse-tracking highlight, .tilt-card 3D, .nav-link underline grow, .bg-dots-dark/light, .marquee-mask edge fade, prefers-reduced-motion guards.
- New src/components/site/svg-decor.tsx: CircuitLines (animated dashed energy lines + pulsing nodes), OrbitRings (counter-rotating dashed rings), GridDots, FloatingCodeChips, HeroDecor (combined dark-hero layer).
- New src/components/site/fx.tsx: tiltHandlers(max) 3D tilt + spotlight CSS vars, spotlightMove, Counter (scroll-triggered count-up), ScrollProgress (fixed gradient bar), BackToTop (SVG progress-ring button, appears >550px).
- New src/components/site/tech-ticker.tsx: TechTicker — infinite pausable marquee of 16 skill chips (HTML5…ChatGPT for Work); StatsBand — honest animated counters (2024 Founded, 8+ Courses, 2 Modes, 100% Practical) with dash-flow hover rings, on dark band.
- hero-slider.tsx v2: ken-burns zoom per slide, staggered text variants, animated autoplay progress bar synced to 6s, gradient shimmer headline (.text-gradient), circuit + orbit + dot-grid decor, floating trust chips, scale-in arrows.
- page-courses.tsx v2 (Fusion-style): course cards now tilt (verified transform) + mouse spotlight + top gradient bar sweep + dash-flow SVG icon rings + highlight chips ("Hover to learn more" hint) + shine Enquire button with sliding arrow; HeroDecor in page band; perspective grid.
- why-choose-us.tsx: spotlight+tilt cards, icon wiggle/scale/dash-ring hovers, corner glow, staggered list-item slides in Training Modes, mode icons added (MonitorSmartphone/Building2), shine CTAs.
- placement-section.tsx: spotlight-dark tilt cards + HeroDecor; cta-band.tsx: animated gradient band + orbit rings + floating code chips + shine buttons.
- header.tsx: nav-link underline-grow hover, group logo (mark rotates/scales on hover), shine CTA; logo.tsx mark animation. whatsapp-float.tsx: double pulse rings + icon rotate/scale on hover. footer.tsx: quick links/course links get animated dash-slide hover.
- site-shell.tsx: wired ScrollProgress (top gradient bar) + BackToTop; page-home.tsx order: Hero → Badges → TechTicker → StatsBand → WhyChooseUs → TrainingModes → AboutPreview → Placement → FAQ → CTA. page-about/page-contact: HeroDecor in hero bands, spotlight mission/vision cards, gradient-top approach steps, shine submit button.
- data.ts: hero-3 alt updated to match new image (Indian team).
- BUGFIX (image cache): after regenerating images the site kept serving OLD Chinese images. Root cause: Next 16 dev image cache lives at .next/dev/cache/images (not .next/cache/images); browsers get AVIF/WebP variants (Vary: Accept) which were stale while curl JPEG looked fresh. Cleared .next/dev/cache/images + restarted dev server; verified new WebP (79818 bytes) and page render.
- Verification (agent-browser desktop 1280 + mobile 390): all 4 views navigate with per-view titles; tilt transform applied on hover; Enquire Now pre-fills "Full Stack Development"; empty submit shows 3 zod errors; valid submit → "Enquiry received!" + row in SQLite (verified via Prisma); FAQ accordion opens; marquee animates; counters animate; mobile menu open/close; footer flush at scroll bottom; JSON-LD ×4 + sitemap.xml + robots.txt via curl; console clean; lint clean; dev.log clean.

Stage Summary:
- Site now Fusion-inspired with heavy but tasteful motion: ken-burns hero + autoplay progress, tech marquee, animated honest counters, 3D-tilt + spotlight course cards with SVG dash-flow rings, scroll progress bar, back-to-top progress ring, shine buttons, nav underline, logo hover, WhatsApp pulse.
- All imagery is Indian-context with English-only text; no Chinese faces/language anywhere.
- Content rules preserved: "Placement Assistance" (never guaranteed), TODO contact placeholders, editable durations, no fabricated stats (StatsBand uses only verifiable facts).
- Key new artifacts: src/components/site/{svg-decor,fx,tech-ticker}.tsx; updated globals.css + 12 site components; 3 regenerated images in public/images.
- Note for future agents: Next 16 dev image cache = .next/dev/cache/images — clear it (and restart dev) whenever files in public/images are replaced.

---
Task ID: 3
Agent: Z.ai Code (main agent)
Task: Add the real business contact details supplied by the owner — mobile 8806003000, email support@yantrixtechnology.com, location Dhanori Laxmi Nagar (Pune) — replacing all TODO placeholders across the site.

Work Log:
- src/lib/site-config.ts: whatsappNumber = 918806003000 (wa.me deep links), phone = "+91 88060 03000", email = support@yantrixtechnology.com, address = "Laxmi Nagar, Dhanori, Pune, Maharashtra"; added phoneHref (tel:) and emailHref (mailto:) exports; removed TODO header comments.
- src/components/site/page-contact.tsx: todoDetails → contactDetails; Phone + Email now clickable (tel:/mailto:) with brand-color hover underline; removed amber "Edit me" badges and the "details are pending" notice; WhatsApp card now shows the number as a chip.
- src/components/site/footer.tsx: phone + email converted to clickable links with hover:text-white hover:underline.
- src/components/site/header.tsx: utility bar now shows click-to-call "+91 88060 03000" link; "New Batches Enrolling" hidden below lg to prevent md overflow.
- src/lib/data.ts: FAQ "How can students contact Yantrix Technology?" answer updated with phone, email and Dhanori (Pune) address.
- src/app/page.tsx: EducationalOrganization JSON-LD now includes telephone, email, PostalAddress (Laxmi Nagar, Dhanori / Pune / Maharashtra / IN) and ContactPoint (customer service; English, Hindi, Marathi).
- Verified with agent-browser (desktop 1280 + mobile 390): contact view shows all real details, hrefs = tel:+918806003000 / mailto:support@yantrixtechnology.com / wa.me/918806003000 (WhatsApp card + float), footer + header correct, no TODO/"Edit me" remnants, JSON-LD & FAQ updated (curl), console clean, lint clean, dev.log clean.

Stage Summary:
- All TODO contact placeholders are gone; real details are centralized in src/lib/site-config.ts (single source of truth) and used by header, footer, contact page, WhatsApp float, FAQ and JSON-LD.
- Note: address intentionally has no PIN code (owner gave only "dhanori laxmi nagar"); Dhanori is displayed as part of Pune, Maharashtra.

---
Task ID: 4
Agent: Z.ai Code (main agent)
Task: Futuristic "neon" theme overhaul — eye-catching redesign with new SVG graphics and heavier animation (user: "Theme to simple... need something more eye catching and futuristic, use svg and more animation").

Work Log:
- globals.css: added cyber-cyan token scale (cyber-200…600) + deep-space bg tokens (space #050914, space-2 #0a1128); new motion/design system — aurora keyframes (3 drifting blurred blobs), rising particles, vertical scan line, cyber grid (bg-grid-futur with radial mask), light-beam sweep, .glass panel, .text-gradient-cyber (white→cyan→blue animated + glow), .text-glow-soft/.text-glow-cyan, .neon-line, .card-glow/.card-glow-dark (cyan ring + colored shadow on hover), .btn-futur (blue→cyan gradient + glow), .dot-pulse; all added to prefers-reduced-motion guards.
- svg-decor.tsx: new components — Aurora, HexRing (counter-rotating double hexagon + pulsing core), PulseGrid (grid + scan line), Particles (12 deterministic rising glow dots), LightBeam; CircuitLines upgraded with SVG animateMotion light pulses traveling along the paths (feGaussianBlur glow filter); FloatingCodeChips cyan-glow styling; HeroDecor now = Aurora + PulseGrid + CircuitLines + HexRing + OrbitRings (backward-compatible props) so all page-hero bands got the futuristic look for free.
- hero-slider.tsx: deep-space bg; aurora + cyber grid + scan + circuit pulses + hex ring + orbit + particles; glass eyebrow chip with pulsing cyan dot; .text-gradient-cyber headline; btn-futur CTA + cyan-outline glass secondary; glass trust chips with glow icon tiles; mono slide counter (01/03); cyan glowing active dot; cyan progress bar with glow.
- header.tsx: utility bar → space gradient with neon-line top edge; phone link cyan with glow hover; nav bar glassier (bg-white/85 backdrop-blur-xl); CTA buttons → btn-futur.
- section-heading.tsx: eyebrow chips → glass (dark) / white-shadow (light) with dot-pulse accent dot.
- Cards: card-glow added to badges, why-choose-us, course cards, training-mode light card, mission/vision, FAQ items; icon chips hover → blue→cyan gradient + glow shadow; cyber dash-rings.
- tech-ticker.tsx: TechTicker chips hover cyan glow; StatsBand rebuilt on bg-space with aurora + pulse grid + 2 hex rings, glass icon tiles, glowing counters, cyber suffixes.
- cta-band.tsx: rebuilt as deep-space panel — aurora + pulse grid + light beam + orbit rings + floating code chips; cyber-gradient title; btn-futur primary + glass secondary.
- footer.tsx: bg-space with neon-line top edge + neon-line above bottom bar; hover lift + cyber hover on buttons.
- placement-section.tsx: glass cards + card-glow-dark + cyan mono numbering with text glow; page-courses/page-about/page-contact hero bands switched to bg-space; course-card top bar → cyan gradient; Enquire/submit/counselling buttons → btn-futur; about-preview floating "Since 2024" card → glass + cyan ring + glow.
- logo.tsx: brand mark → brand-600→space gradient with cyan ring + glow hover.
- Verified with agent-browser (desktop 1280 + mobile 390): all 4 views render with the new theme, hero aurora/grid/hex/particles visible, stats band + hex rings render, contact form golden path re-verified (Radix select option clicked via listbox ref → "Enquiry received!" → DB row confirmed: Test Kumar / Python Programming / 9876543210), no console errors, no invalid Tailwind variant usages (grep), lint clean, dev.log clean.

Stage Summary:
- Site now has a coherent futuristic "Yantrix Neon" identity: deep-space dark bands with aurora + cyber grid + scan lines, glassmorphism panels, cyan accent glows, gradient buttons, hex/circuit/orbit SVG motion systems — while keeping the blue/white/black brand and all content/SEO intact.
- New CSS utilities are centralized in globals.css (card-glow, btn-futur, glass, aurora, particles, scan, neon-line, text-glow) and new SVG components in svg-decor.tsx; reduced-motion fully guarded.
- Note for future agents: text-glow-*/neon-line/glass/dot-pulse/btn-futur/card-glow* are plain CSS classes — never use them with Tailwind hover:/group-hover: variants.

---
Task ID: 5
Agent: Z.ai Code (main agent)
Task: "AI/robotics-grade" futuristic layer on top of the neon theme — neural-network AI core, data streams, live AI terminal, HUD elements, robot mascot, cursor glow, scramble/decoding text, glitch hover, magnetic buttons, cyber dividers (user: "animation and hover and svg aur jitna best and futuristic ai jaisa and robotics jaise kuch").

Work Log:
- globals.css: added AI/robotics motion system — drop (matrix-style falling data streams), caret-blink (terminal cursor), scan-x (skewed light sweep triggered via .group:hover .animate-scan-x), hud-flicker, glitch-a/b keyframes + .glitch-hover RGB-split pseudo slices (content: attr(data-text)); all wrapped in prefers-reduced-motion guards.
- NEW src/components/site/ai-decor.tsx: NeuralCore (central AI chip with pins, 8 pulsing neurons on dashed orbit rings, 8 circuit synapses with animateMotion signal pulses, rotating HUD tick ring + counter-rotating dashed ring, crosshair, binary whispers), DataStreams (9 deterministic falling glyph columns, SSR-safe), HudCorners (4 corner brackets snapping in on group-hover, light/dark), ScanSweep (skewed cyber bar sweeping across cards on hover), RoboBuddy (robot head — blinking eyes via SMIL ry animation, pulsing antenna, voice bars), CyberDivider (circuit seam with traveling pulses for light sections), HudStatusChip (SYS.ONLINE — PUNE · 18.58°N 73.93°E glass chip with flicker).
- NEW src/components/site/ai-fx.tsx: TerminalTyper (glass terminal "yantrix@ai-core:~" typing 4 AI-flavoured commands with output lines, blinking caret, reduced-motion static fallback), CursorGlow (cyan radial glow trailing cursor via framer-motion springs; pointer:fine + reduced-motion gated), ScrambleText ("decoding" random-glyph settle effect, sr-only real text), Magnetic (buttons attracted towards cursor via springs).
- hero-slider.tsx: + DataStreams, NeuralCore (right side behind trust chips, xl+), HudStatusChip (top-right), TerminalTyper (bottom-right, xl+), ScrambleText on eyebrow, glitch-hover on h1 title, Magnetic on both CTAs.
- site-shell.tsx: mounted CursorGlow globally.
- why-choose-us.tsx / page-courses.tsx: HudCorners + ScanSweep on badges, why-choose-us cards, training-mode cards (dark variant) and course cards.
- tech-ticker.tsx: HudCorners dark on each stat block (StatsBand).
- cta-band.tsx: RoboBuddy (left edge, lg+), DataStreams, HudCorners dark, glitch-hover title.
- page-home.tsx: CyberDivider between TrainingModes→AboutPreview→PlacementSection.
- BUGFIX 1 (hydration): Math.cos/sin in NeuralCore tick ring produced server≠client floats → rounded to toFixed(2). Then useId()-derived SVG ids (filter/gradient/mpath) STILL mismatched server vs client → removed useId entirely: replaced SVG filter/gradient with plain rgba fill + drop-shadow class, and animateMotion now uses direct path attribute instead of mpath+id (also fixed a 500: leftover p() reference).
- BUGFIX 2 (a11y): glitch-hover pseudos tripled the h1 accessible name (real text + 2 pseudo copies) → restructured: sr-only real text + aria-hidden visual span carrying data-text.
- BUGFIX 3 (visual): glitch-hover display:inline-block inside the gradient parent broke background-clip:text painting on the first line (title line invisible on mobile) → moved text-gradient-cyber directly onto the aria-hidden glitch span (verified both lines render on mobile + desktop).
- Testing note discovered: agent-browser's headless context reports matchMedia('(hover: hover)') = false / pointer:fine = false, so ALL Tailwind hover:/group-hover: utilities (which Tailwind v4 wraps in @media (hover: hover)) do not fire in that browser. Verified the full hover chain by injecting the same rules without the media wrapper — HUD corners, gradient icon chips, everything renders. Plain-CSS effects (card-glow, spotlight, tilt, scan sweep, shine, dash rings) verified natively. Real desktop browsers are unaffected (hover:hover = true).
- Verified end-to-end (desktop 1280 + mobile 390): hero (scramble eyebrow, gradient title both lines, NeuralCore signals, terminal typing, HUD chip, data streams), stats band counters + HUD corners, why-choose-us/course card hover chain, cyber dividers (2 on home), CTA band with RoboBuddy, About/Courses/Contact hero bands, mobile menu open + navigate, Enquire Now pre-fills "Full Stack Development" → submit → "Enquiry received!" → SQLite row (AI Test User) → test row deleted, footer flush, JSON-LD untouched, zero console errors, zero page errors, all network 200, lint clean, dev.log clean.

Stage Summary:
- Site now has a full "AI-core" identity: animated neural network chip + traveling synapse signals in the hero, matrix data streams, live typing terminal, SYS.ONLINE HUD readout, robot mascot in CTA, HUD corner brackets + scan sweeps on all cards, decoding/scramble eyebrows, glitch-on-hover headlines, magnetic CTAs, cursor glow, circuit-seam section dividers — all aria-hidden/decorative, reduced-motion guarded, SSR-safe (no useId/mpath ids, deterministic data).
- Known environment quirk (not a bug): Tailwind v4 gates hover:/group-hover: behind @media (hover: hover); agent-browser headless reports hover:none so those effects can't be screenshot-verified natively — verified via rule injection instead.
- Key new artifacts: src/components/site/{ai-decor,ai-fx}.tsx; updated globals.css + hero-slider, site-shell, why-choose-us, page-courses, tech-ticker, cta-band, page-home.

## Admin panel + SEO / AEO / GEO expansion

- Replaced static content modules (`src/lib/data.ts`, `src/lib/site-config.ts`) and
  the unused Prisma setup with a JSON content store (`src/lib/content/store.ts`,
  `data/*.json`, seeded from `src/lib/content/defaults.ts`).
- Added a password-protected admin panel at `/admin` (owner / editor / viewer roles,
  scrypt passwords, HMAC-signed session cookies, in-memory login rate limiting,
  audit log) covering hero slides, courses, FAQs, every page section, page copy,
  navigation, business settings, SEO settings, the enquiry inbox and admin users.
- Every public component now reads content from a React context
  (`SiteContentProvider`) so admin edits render immediately.
- Real crawlable routes for `/`, `/courses`, `/about`, `/contact` with per-page
  metadata, canonical URLs and server-rendered JSON-LD (organisation, local
  business, website, courses, FAQ, breadcrumbs).
- Added `sitemap.xml`, `robots.txt` (AI crawlers allowed), `manifest.webmanifest`
  and an admin-editable `llms.txt` for AI answer engines (AEO/GEO).
- Contact form now writes to the JSON store; admin inbox supports statuses, notes,
  search and CSV export.
- Fonts switched from build-time `next/font/google` fetching to a CSS `@import`
  so the project builds in offline / restricted-network environments.

## Course detail pages + full course editor

- NEW `src/lib/content/course-seeds.ts`: every seed course now carries a complete
  detail page — tagline, badge, hero stats, instructor/language, fee note,
  batch/seats notes, about paragraphs, specialisation tracks, benefit cards,
  tools, outcomes, module-by-module curriculum, reviews, course FAQs, CTA copy
  and SEO overrides. `defaults.ts` maps it into the `courses` collection.
- `types.ts`: added `CourseTrack`, `CourseBenefit`, `CourseModule`,
  `CourseReview`, `CourseFaqItem` and the optional detail fields on `Course`.
  All new fields are optional, so content saved before this change keeps
  rendering (the page falls back to description / highlights).
- REWRITE `src/components/site/course-detail.tsx`: Skillected-style course page —
  gradient H1 + breadcrumb, tagline and answer-first summary, hero stat chips,
  instructor/language/mode meta, cover card with mode overlay, **fee card**
  (fee, note, batch + seats, brochure, enquire), quick-fact strip, section jump
  links, about copy, track cards, benefit grid, outcome list, tool grid,
  accordion curriculum with expand/collapse-all + brochure/syllabus block,
  review cards, FAQ accordion with "still have questions", related courses and
  a mobile sticky enquire bar. Every section hides itself when empty.
- `page-courses.tsx`: card redesign (cover image or branded icon panel, badge
  ribbon, mode chips, 3-line description, duration/level, fee + "View details"
  + enquire) and an **All / Online / Offline filter** with live counts and an
  empty state.
- `src/lib/seo.ts`: course FAQs now merge admin-written Q&A (deduped) so the
  page and `FAQPage` schema match; `Course` schema gains `image`, `teaches`
  (learn outcomes) and `syllabusSections`; `llms-full.txt` lists outcomes,
  curriculum modules and tools per course.
- `src/app/courses/[slug]/page.tsx`: metadata honours the per-course
  `seoTitle` / `seoDescription` overrides.
- ADMIN: new `course-list.tsx` (cover thumbnail, slug, fee/duration/modes,
  search, reorder, publish toggle, copy link, preview, delete) and
  `course-editor.tsx` — a five-tab full-page editor (Basics / About &
  highlights / Curriculum / Reviews & FAQs / CTA & SEO) with repeatable row
  editors for tracks, benefits, modules, reviews and FAQs. Routes:
  `/admin/courses` (list) and `/admin/courses/[id]` (`new` creates).
- API `/api/admin/content`: course slugs are normalised via `slugify`,
  derived from the title when blank and de-duplicated (`-2`, `-3`…); updating a
  missing item now returns a clear 404 instead of a silent no-op.
- README documents the course tabs; verified create/update/delete round-trips
  keep nested arrays (curriculum topics, track points) intact, and the page
  emits valid Course + FAQPage JSON-LD (9 Q&A merged from admin + generated).

## Course page: remaining sections (tools / projects / included / batches)

- Course pages now carry the full landing-page structure, in this order:
  hero + fee card → quick facts → jump links → about → tracks → **why this
  course** (with optional big-figure stat cards) → **tools covered** →
  **what you'll learn** → **curriculum** → **what's included** + certificate →
  **projects** (capstone cards + mini projects) → **batches & timings** →
  **placement & career support** → **trainer** → reviews → FAQs → related → CTA.
- NEW above-the-fold **urgency strip**: announcement text from the admin plus a
  live day/hour/min/sec countdown driven by the next batch date (renders only
  after mount, so SSR markup stays stable).
- `types.ts`: `CourseIncluded`, `CourseProject`, `CourseBatch`, `CourseTrainer`
  and new optional `Course` fields — `audience`, `includes`, `miniProjects`,
  `projects`, `batches`, `placementTitle/Text/Points`, `trainer`,
  `certificateTitle/Text/Image`, `urgencyNote`, `batchStartDate`;
  `CourseBenefit` gained `stat` + `tag` for figure cards.
- `course-seeds.ts`: shared INCLUDES (12 items), certificate, placement, trainer
  and default batch rows, merged into every course through a `shared()` wrapper;
  each course also got its own audience line, 3–4 mini projects, 3–4 capstone
  projects and placement points.
- Admin editor rebuilt around seven tabs (Basics / About & highlights / Projects
  & extras / Curriculum / Batches & placement / Reviews & FAQs / CTA & SEO) with
  tab counters, nested `trainer.name`-style field paths, an icon select for the
  included grid, and full array sanitising on save.
- API: new `fillCourseSections` op fills only EMPTY fields of courses that match
  a seed (existing admin copy untouched) — exposed as **Fill new sections** on
  the courses screen; `AdminApiResponse` gained `filled`.
- SEO: `CourseInstance.startDate` now comes from the soonest upcoming batch per
  mode.
- Verified end-to-end: every section present in SSR HTML in the intended order,
  jump links match section ids, and a stripped record (all new fields removed,
  custom tagline kept) gains the sections back via Fill new sections while the
  admin's own tagline survives.

## Home page: sections missing vs. the reference site (PR #12)

Audited skillected.com's home page and added everything it has that we did not,
all admin-editable and all self-hiding when empty.

- NEW collections (types + seeds + admin metadata):
  `announcements` (offer ticker), `gallery` (campus photos with categories),
  `partners` (certifications / collaborations), `videos` (YouTube), `testimonials`
  (student quotes + optional video), `centres` (branch addresses).
- NEW section-copy keys: gallery, partners, videos, testimonials, brochure, app,
  centres — so each heading and its visibility are editable in Page sections.
- NEW `src/components/site/home-sections.tsx`:
  · `AnnouncementTicker` — seamless marquee above the header on every page
    (duplicated row, pauses on hover, static + single row for reduced motion);
  · `CampusGallery` — category chips + lightbox;
  · `PartnersSection`, `VideosSection` (click-to-load `youtube-nocookie`),
    `TestimonialsSection` (stars, quote, optional video), `BrochureSection`
    (checklist, PDF or enquiry fallback), `AppSection` (phone mock-up), and
    `CentresSection` (address, hours, call, directions).
- Home page order now: hero → skills/why/modes → **gallery + partners** →
  about → **videos** → trainers → **testimonials** → placement →
  **brochure + app + centres** → FAQ → CTA.
- `pages.home` gained brochure/app copy (title, text, points, CTA, link, image),
  surfaced as two new groups on Admin → Pages & navigation.
- `NavLink` gained an optional `hash`: footer links can jump straight to a home
  section (`/#gallery`), editable from Footer quick links.
- globals.css: `.ticker-track` marquee (42s loop, hover pause, reduced-motion
  fallback).
- Footer social set widened to match the reference: Telegram, WhatsApp channel
  and Threads join Instagram/Facebook/LinkedIn/YouTube/X/Google Business
  (settings → Social profiles; `sameAs` picks them up automatically).
- Illustrative gallery photos generated into `public/images/gallery-*.jpg`
  (~140–170 KB JPEGs, down from 2.6 MB PNGs) — replace with real campus photos
  before go-live.
- Verified: home SSR contains all eight blocks in the right order, single `<h1>`,
  ticker items render twice (loop copy is aria-hidden), gallery create/delete
  round-trips through the admin API and appears/disappears on the page, footer
  hash links emit `/#gallery`, and tsc + eslint + next build are clean.
- Shipped in PR #12, merged to `main` as `c9b5a00`.

## Everything dynamic + media library + futuristic pass (PR #14)

Goal: no user-facing string, image or list should need a developer. Plus the
two items left over from the earlier audit (footer column headings and the
course-page labels), a duplicate action for every list and a visual upgrade.

**Interface text (`content.labels`)**

- NEW `src/lib/content/labels.ts`: `LABEL_GROUPS` (the single source of truth for
  both the defaults and the admin form) → **118 keys** across 9 groups: header &
  footer, shared buttons, hero & popup, home page, courses page, course detail
  page, contact page, floating helpers, legal pages.
- `SiteContent` gained `labels: Record<string, string>`; `DEFAULT_CONTENT` seeds
  it from `LABEL_DEFAULTS`. Because the store already merges defaults over saved
  content, every existing install picks the new keys up on the next read.
- NEW `useLabels()` in the provider: `const t = useLabels(); t("footer.explore")`,
  falling back to the built-in default when a key is missing or blank — a missing
  key can never render an empty button.
- NEW admin screen **Interface text** (`/admin/labels`), generated from
  `LABEL_GROUPS`. `SchemaForm` gained a `flatKeys` mode so `footer.exploreHeading`
  is stored verbatim instead of being split into nested objects.
- Wired through: header, footer, hero, CTA band, about, FAQ, both course lists,
  the whole course detail page (including all 15 section eyebrows, headings and
  intros), contact, placed students, trainers, gallery/videos/testimonials/
  brochure/app/centres, welcome popup, WhatsApp bubble, guide, intro door, skip
  link and the legal pages.

**Duplicate**

- New `duplicateItem` op in `/api/admin/content` + a copy button on every row of
  the collection editor: the copy lands right after the original, gets a
  "(copy)" suffix, its own id (and its own slug for courses), and starts
  **hidden** so an accidental duplicate can never go live.

**Media library**

- `listMedia` / `deleteMedia` in both stores (MySQL `media` table, JSON
  `data/media`), `GET` + `DELETE` on `/api/admin/media`, and a new admin screen
  (`/admin/media`): drag-and-drop upload with browser-side resize, thumbnails,
  copy-URL and delete.

**Futuristic pass**

- `globals.css`: `aurora-card` (rotating conic-gradient ring via `@property`),
  `sweep-card` (hover light sweep), `hud-chip`, `grid-veil` — all disabled for
  reduced-motion.
- Applied to the gallery, partners, videos, testimonials, centres, brochure and
  app blocks and to every card on the course detail page (18 on home, 25 on a
  course page).

**Verified**: `tsc --noEmit`, `eslint` and `next build` clean; all public routes
200; an admin label edit ("Explore QA") rendered on both the home page and a
course page, then reverted; gallery and course duplication round-tripped and
cleaned up (hidden course copy 404s); media upload → list → serve → delete cycle
checked end to end.

## Meet Your Mentors + partner company wall

Reference: the mentor wall and partner strip on skillected.com. The **layout** is
replicated; the people and the partnerships are not — those have to be real.

**Mentors**

- `Trainer` gained `company` (current employer / institution, e.g. "Reliance
  Jio", "IIT Bombay") and `specialisation` (short track label used by the cards
  and the filter), both editable in **Admin → Mentors**.
- Rebuilt `/components/site/trainers-section.tsx` to the reference anatomy:
  portrait `aspect-[3/4]` photo, uppercase name, company line with an icon, an
  "N+ yrs" badge, a specialisation chip, a two-line bio and a "View full profile"
  trigger that opens the existing detail dialog (now also showing company +
  specialisation + years).
- Added a live count strip (`6 mentors · 47+ years of experience · 6
  specialisations`) and specialisation filter chips that only appear with more
  than three mentors and more than one specialisation.
- Section defaults are now eyebrow "Mentors", title "Meet Your Mentors".
- New `src/lib/content/trainer-seeds.ts` with six clearly-marked **sample**
  profiles (photo-less, so they render as monogram cards until real photos are
  uploaded). Admin copy now says to replace them before go-live.

**Partners**

- `PartnersSection` now leads with a scrolling company wall — logo when one is
  uploaded, otherwise a monogram + name tile — with the label revealed on hover
  and a footnote label (`partners.note`) under it. The descriptive cards stay
  below. Titles: "Our partner companies & certifications".
- Partners remain fully admin-managed (name, label/kind, logo, description, link).

**Labels added**: partners.note, trainers.years, trainers.yearsShort,
trainers.yearsLabel, trainers.countLabel, trainers.tracksLabel,
trainers.filterAll, trainers.sectionLabel.

**Verified**: tsc, eslint and `next build` clean; home + about render the mentor
wall (6 cards, count chips, filter chips) and the partner wall; a mentor created
through the admin API with company/specialisation appeared on both pages and was
deleted again.

## Course page: the six remaining reference blocks

Checked the course page against the reference and closed the gaps so each block
the owner asked about exists as its own labelled, admin-editable section.

- **What do we offer** — the benefit cards now run under that eyebrow
  (`cp.offerEyebrow`); `offerTitle` on the course overrides the heading, with
  `cp.offerTitle` as the default ("What this program gives you at <brand>").
- **Who should attend?** — NEW section (`#audience`) with a heading
  (`audienceTitle` per course), intro, persona bullets (`audiencePoints`), a
  closing "not sure? ask us" card and enquire / WhatsApp buttons. Falls back to
  the single `audience` line when no bullets exist. All 8 seed courses got four
  persona bullets each; `fillCourseSections` backfills them for existing sites.
- **Capstone projects / Mini projects** — the projects section now has two
  clearly labelled halves, each with its own icon, note and count chip
  (`cp.capstoneHeading`, `cp.miniHeading`, `cp.projectCount`).
- **Stand out with an industry-recognized certification** — the certificate is no
  longer buried inside "What's included": it is its own section (`#certificate`)
  with an eyebrow, heading (course override or `cp.certificateTitle`), text and
  three proof chips.
- **Learn from certified experts** — the mentor block's default heading
  (`cp.trainerTitle`), eyebrow "Your mentor"; avatar, role, experience and
  "small batches" line stay.
- The on-page jump nav now reads from these same labels (What do we offer, Who
  should attend?, Certification, Your mentor) and follows the real section order.
- Course editor: new "Who should attend" heading + bullets and "What do we offer"
  heading fields on the Basics tab; the certificate panel is retitled
  Certification and explains where it renders.

**Verified**: tsc, eslint and `next build` clean; all 8 course pages 200 and each
contains every one of the six blocks, in the right order:
overview → why → audience → tools → learn → curriculum → included → certificate
→ projects → batches → placement → trainer → reviews → FAQs → related.
