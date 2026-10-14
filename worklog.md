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
