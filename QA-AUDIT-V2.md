# Yantrix — v2 end-to-end audit (site + admin panel)

Date: 2026-10-30 · Branch: `arena/c87e1739-yantrix`
Method: production `next build` + `node .next/standalone/server.js`, headless Chromium
(`@sparticuz/chromium` + `puppeteer-core` + `axe-core`), Lighthouse, and the project's own
`scripts/audit.mjs` / `scripts/audit-flows.mjs`.

Everything below was **observed**, not assumed, and every item has a fix in this branch.

---

## 1. How the audit was run

| Layer | Tool | Scope |
| --- | --- | --- |
| Rendering / layout | Puppeteer sweep | 6 public routes × 3 viewports, plus all 13 admin screens (authenticated) |
| Responsive matrix | Puppeteer matrix | 360 / 390 / 414 / 768 / 1024 / 1280 / 1440 / 1920 |
| Accessibility | axe-core (WCAG 2.1 A/AA + best practice) | every route, both themes |
| Performance | Lighthouse 12 (mobile, throttled) | `/` |
| Flows | `scripts/audit.mjs`, `scripts/audit-flows.mjs` | navigation, forms, admin CRUD, API permissions, roles |
| SEO / AEO / GEO | `curl` of `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt` + JSON-LD parse | all public URLs |

---

## 2. Findings and fixes

### 2.1 Public site — correctness

| # | Finding | Evidence | Fix |
| --- | --- | --- | --- |
| 1 | **`/privacy` and `/terms` rendered outside the site shell** — no header, no navigation, no footer, and the copy was dark-navy (`#1a3176`) on near-black (`#080f26`) = **1.6:1 contrast** (AA needs 4.5:1). Dead-end pages for both visitors and crawlers. | axe `color-contrast` on both pages; screenshots | `LegalPage` is now the `detail` body of `SiteShell` (same shell as `/courses/[slug]`), wrapped in a solid glass panel so the 3D backdrop can't drift under the text; headings/meta re-styled for the dark theme; contact card gets a proper `<h2>`. |
| 2 | **Hero stats used `<h3>` before any `<h2>`**, breaking the heading outline on every page. | axe `heading-order` | Rendered as `<p>` with the same typography. |
| 3 | **`/courses` had no `<h2>` before its `<h3>` cards.** | axe `heading-order` | Added a visually hidden `<h2>` (“All courses”) and pointed the section's `aria-labelledby` at it. |
| 4 | **`<ol>` contained a `<div>` wrapper** and **`<dl>` contained a layout `<div>`** on `/about`, producing 4 axe errors (`list`, `listitem`, `dlitem`, `definition-list`) — 36 nodes. | axe, `/about` | `<li>` moved outside the animation wrapper; the quick-facts grid now puts `<dt>`/`<dd>` directly inside each grid `div` (allowed by the spec). |
| 5 | **Primary navigation was `<button>` only** (logo, desktop nav, mobile nav, header CTA, footer quick links). Crawlers saw no internal links except the footer's course list; middle-click/new-tab did nothing; no-JS users were stuck. | DOM inspection | Every nav item is now a real `<a href>` that still calls `preventDefault()` for the instant client-side transition (modifier-clicks and JS-off fall back to normal navigation). |
| 6 | **Duplicate JSON-LD on the legal pages** (the shell emitted `WebPage` for the home page while the page emitted its own). | JSON-LD parse | `SitePage` accepts `jsonLd={false}`; the legal pages emit only their own `WebPage` + `BreadcrumbList`. |

### 2.2 Public site — UX / responsive

| # | Finding | Evidence | Fix |
| --- | --- | --- | --- |
| 7 | **Chapter dock, WhatsApp button and “Ask Yantra” orb overlapped** at every mobile width (dock `263px` wide at 390px viewport). | fixed-element intersection probe at 360/390/414/768 | The dock no longer repeats the sound toggle below `md` and sits at `bottom-24` until `lg`; nothing overlaps at 360–768 any more. |
| 8 | **Touch targets under 24px**: carousel dots `8×8`, chapter dots `6×6`. | tap-target probe on mobile | Dots keep their visual size but sit inside 24×24 hit areas (carousel, hero and chapter dock). |
| 9 | **`WhatsAppFloat` had no landmark** — axe `region` on every public page. | axe | Wrapped in `<aside aria-label="Quick contact">`. |
| 10 | **Long-form legal copy was unreadable over the animated planets.** | screenshots at 390 / 1440 | Panel with `bg-[#050a1c]/85` + `backdrop-blur-xl`. |

### 2.3 Admin panel

| # | Finding | Evidence | Fix |
| --- | --- | --- | --- |
| 11 | **Unnamed `<select>` controls** — the per-row role picker on `/admin/admins` and the status filter + per-row status picker on `/admin/enquiries` had no accessible name (`button-name`, critical). | axe | `aria-label` derived from the row (“Role for <name>”, “Status for <name>”, “Filter by status”). |
| 12 | **Empty `<th>`** on `/admin/admins` (`empty-table-header`). | axe | Screen-reader-only “Actions”. |
| 13 | **Danger-zone text failed contrast** — `text-destructive` = 4.09:1 and `text-destructive/80` = 3.33:1 on the pink tint. | axe, `/admin/settings` | `text-red-700` / `text-red-800` (≥ 4.5:1). |

### 2.4 Performance

| # | Finding | Evidence | Fix |
| --- | --- | --- | --- |
| 14 | **CLS 0.118 on mobile** — the self-hosted Plus Jakarta Sans loads with `font-display: swap`, and its metrics differ from the system fallback (x-height .536 vs .519, ascent 1.038 vs .905), so the hero `<h1>` re-wrapped from 2 lines to 3 and pushed everything below it up by 42px. | `layout-shift` PerformanceObserver | Added a metric-compatible `@font-face` fallback (`size-adjust: 103.35%`, `ascent-override: 100.44%`, `descent-override: 21.48%`) and put it second in the font stack. The fallback now occupies exactly the same box as the web font. |
| 15 | Low-end phones rendered the 3D scene at full display refresh rate (90–120Hz) for a slow ambient drift. | code review | `lite` devices are capped at ~40fps. |
| 16 | `THREE.Clock` is deprecated (console warning on every page). | console | Migrated to `THREE.Timer` (also pauses itself while the tab is hidden). |
| 17 | Above-the-fold image on `/about` was lazy-loaded and was the LCP element. | Next.js console warning | `loading="eager"`. |

### 2.5 SEO / AEO / GEO

| # | Finding | Evidence | Fix |
| --- | --- | --- | --- |
| 18 | **Titles were 90–107 characters** (Google truncates around 60) — the brand suffix duplicated the brand that Google already appends. | `curl` of `<title>` | Route titles shortened to ≤ 55 chars so the root `%s | Yantrix Technology` template lands ≈ 60–75; the course-detail title uses `title.absolute` so the important half (“Fees & Syllabus”) survives truncation. |
| 19 | **Meta descriptions were up to 245 characters** (cut around 160). | `curl` of `meta[name=description]` | All four rewritten to 120–155 characters. |
| 20 | The admin SEO health panel flagged its own defaults (21/21 → 13/21 checks passing). | admin dashboard | Resolved by #18/#19; the panel now reports the defaults as healthy. |

### 2.6 Security / DevOps

| # | Finding | Evidence | Fix |
| --- | --- | --- | --- |
| 21 | **No security headers at all** — panels were frameable (clickjacking), no referrer policy, MIME sniffing allowed, `X-Powered-By: Next.js` advertised the version. | response headers | `next.config.ts` now sets CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`, HSTS and drops `X-Powered-By`. |
| 22 | `/admin/*` was only protected by an app-level redirect; a shared cache or crawler could still index/serve it. | response headers | `X-Robots-Tag: noindex, nofollow` + `Cache-Control: private, no-store` on `/admin/:path*`. |
| 23 | The CSP would have broken the dev preview (HMR websocket + `upgrade-insecure-requests` on plain HTTP). | manual verification | `ws:` allowed, `upgrade-insecure-requests` only in production, `'unsafe-eval'` only in development. |

### 2.7 Test tooling (the audits themselves were broken)

| # | Finding | Fix |
| --- | --- | --- |
| 24 | `scripts/audit.mjs` and `scripts/audit-flows.mjs` still drove the **one-step** login (`Sign in` button), so they timed out against the two-step flow shipped in v1. | Both now do password → one-time code → `Verify & sign in`, reading the code from `ADMIN_OTP` or from the dev log via `ADMIN_OTP_LOG`. |
| 25 | The mobile-navigation check looked for a `<button>` named “Courses”; navigation is now links. | Updated to `getByRole("link")`. |
| 26 | The read-only-role check created its “viewer” session with a single-step login cookie. | Extracted a shared `apiLogin()` helper that performs both steps. |
| 27 | The admin email was hard-coded to a production address. | `ADMIN_EMAIL` env var. |

---

## 3. Verification

```
npx tsc --noEmit                     → 0 errors
npx eslint .                         → 0 problems
npx next build                       → exit 0, 0 warnings
axe-core, 18 route × viewport combos → 0 violations   (was 26 critical/serious/moderate)
scripts/audit-flows.mjs              → ✅ all flows pass
scripts/audit.mjs                    → functional checks pass; only WebGL driver chatter remains
```

Remaining non-issues confirmed by hand:

- `net::ERR_ABORTED` on `/?_rsc=…` — normal Next.js prefetch cancellation when a test
  navigates away mid-prefetch.
- `KHR_parallel_shader_compile extension not supported` — emitted by the software GL
  renderer in the headless container, not by application code.
- `clipped text` matches in the sweep are `scrollHeight` artefacts of
  `background-clip: text` gradient headlines and `text-shadow` — the text renders fully.

## 4. Still recommended (not changed here)

These need a decision from the site owner, not a code fix:

- `next start` warns with `output: "standalone"`; `npm start` already runs
  `.next/standalone/server.js`, so deployments should keep using that.
- `package.json` still lists several unused heavy dependencies (`next-auth`,
  `next-intl`, `@mdxeditor/editor`, `recharts`, `z-ai-web-dev-sdk`, …). Removing them
  is a separate cleanup with its own regression surface.
- Lighthouse `performance` in this sandbox is dominated by software WebGL; measure it
  on real hardware. The CLS and the font-metric fix above are device-independent.
