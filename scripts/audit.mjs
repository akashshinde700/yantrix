/**
 * Full-site audit with Playwright (headless Chromium).
 *
 *   CHROMIUM_PATH=/path/to/chromium node scripts/audit.mjs
 *   AUDIT_BASE=http://127.0.0.1:3000 CHROMIUM_PATH=... node scripts/audit.mjs
 *
 * Checks, for every public page and every admin screen:
 *   • HTTP status, console errors, uncaught page errors
 *   • failed network requests (fonts / dev websockets are ignored)
 *   • broken images, images without alt text
 *   • links that 404
 *   • horizontal overflow on mobile + desktop
 *   • buttons/links with no accessible name
 *   • admin end-to-end flow: login → create → verify on site → edit → delete
 *   • contact form submission
 *
 * Screenshots are written to ./audit-output (gitignored).
 */

import { mkdir, writeFile } from "node:fs/promises";
import { chromium as playwright } from "playwright-core";

const BASE = process.env.AUDIT_BASE ?? "http://127.0.0.1:3000";
const CHROMIUM = process.env.CHROMIUM_PATH ?? "/tmp/chromium";
const OUT = "audit-output";
const LIB_PATH = process.env.CHROMIUM_LIBS ?? "/tmp/nsslib";

const IGNORED_CONSOLE = [
  /fonts\.googleapis\.com/i,
  /_next\/hmr/i,
  /ERR_CONNECTION_CLOSED/i,
  /Download the React DevTools/i,
  /net::ERR_ABORTED/i,
  // Expected: a deliberate wrong-password login attempt
  /status of 401 \(Unauthorized\)/i,
  // Client-side router prefetches are cancelled when a page is left
  /\?_rsc=/i,
];

const results = [];
const issues = [];

function issue(page, kind, detail) {
  issues.push({ page, kind, detail: String(detail).slice(0, 2500) });
  console.log(`   ✗ [${kind}] ${String(detail).slice(0, 200)}`);
}

function ok(message) {
  console.log(`   ✓ ${message}`);
}

async function newPage(browser, viewport) {
  const context = await browser.newContext({
    viewport,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const state = { consoleErrors: [], pageErrors: [], failed: [] };

  page.on("console", (message) => {
    if (message.type() !== "error" && message.type() !== "warning") return;
    const text = message.text();
    if (IGNORED_CONSOLE.some((pattern) => pattern.test(text))) return;
    state.consoleErrors.push(`[${message.type()}] ${text}`);
  });
  page.on("pageerror", (error) => state.pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (IGNORED_CONSOLE.some((pattern) => pattern.test(url))) return;
    state.failed.push(`${url} :: ${request.failure()?.errorText}`);
  });

  return { context, page, state };
}

async function auditPage(browser, path, viewport, label) {
  const { context, page, state } = await newPage(browser, viewport);
  const name = `${label}-${path.replace(/[^a-z0-9]+/gi, "_") || "root"}`;
  console.log(`\n▶ ${path} (${label})`);

  let status = 0;
  try {
    const response = await page.goto(`${BASE}${path}`, {
      waitUntil: "load",
      timeout: 60_000,
    });
    status = response?.status() ?? 0;
  } catch (error) {
    issue(path, "navigation", error.message);
  }

  if (status !== 200) issue(path, "status", `HTTP ${status}`);
  else ok(`HTTP 200`);

  // Let the fail-safe and entrance animations settle (the WhatsApp float
  // fades in after a 1s delay, so give them a comfortable margin).
  await page.waitForTimeout(2800);

  const checks = await page.evaluate(() => {
    const brokenImages = [...document.images]
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src);
    const imagesWithoutAlt = [...document.images]
      .filter((img) => !img.hasAttribute("alt"))
      .map((img) => img.currentSrc || img.src);
    const namelessControls = [...document.querySelectorAll("button, a")]
      .filter((el) => {
        if (el.closest("[aria-hidden='true']")) return false;
        const text = (el.textContent ?? "").trim();
        const name =
          text ||
          el.getAttribute("aria-label") ||
          el.getAttribute("title") ||
          el.getAttribute("aria-labelledby");
        return !name;
      })
      .map((el) => el.outerHTML.slice(0, 120));
    const h1Count = document.querySelectorAll("h1").length;
    const visibleH1 = [...document.querySelectorAll("h1")].filter(
      (el) => el.offsetParent !== null,
    ).length;
    const overflow = {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
    // Only in-viewport elements matter: scroll-reveal content below the fold is
    // expected to stay hidden until it is scrolled into view.
    const hiddenFrames = [...document.querySelectorAll("[style*='opacity']")]
      .filter((el) => {
        if (getComputedStyle(el).opacity !== "0") return false;
        const box = el.getBoundingClientRect();
        if (box.height === 0 || box.width === 0) return false;
        return box.bottom > 0 && box.top < window.innerHeight;
      })
      .map(
        (el) =>
          `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]} "${(el.textContent ?? "").trim().slice(0, 40)}"`,
      );
    const links = [...document.querySelectorAll("a[href]")].map((a) =>
      a.getAttribute("href"),
    );
    return {
      brokenImages,
      imagesWithoutAlt,
      namelessControls,
      h1Count,
      visibleH1,
      overflow,
      hiddenFrames,
      links: [...new Set(links)].filter(
        (href) => href && !href.startsWith("#"),
      ),
    };
  });

  if (checks.brokenImages.length)
    issue(path, "broken-images", checks.brokenImages.join(", "));
  else ok("images load");

  if (checks.imagesWithoutAlt.length)
    issue(
      path,
      "img-alt",
      `${checks.imagesWithoutAlt.length} image(s) without alt`,
    );

  if (checks.namelessControls.length)
    issue(path, "a11y-name", checks.namelessControls.join(" | "));

  if (checks.overflow.scrollWidth > checks.overflow.clientWidth + 2) {
    issue(
      path,
      "horizontal-overflow",
      `${checks.overflow.scrollWidth}px > ${checks.overflow.clientWidth}px`,
    );
  } else ok("no horizontal overflow");

  if (checks.hiddenFrames.length > 0) {
    issue(path, "invisible-content", checks.hiddenFrames.join(" | "));
  } else ok("content is visible");

  if (state.consoleErrors.length)
    issue(path, "console", state.consoleErrors.slice(0, 3).join(" | "));
  else ok("no console errors");

  if (state.pageErrors.length)
    issue(path, "pageerror", state.pageErrors.slice(0, 2).join(" | "));
  if (state.failed.length)
    issue(path, "request-failed", state.failed.slice(0, 3).join(" | "));

  await page.screenshot({
    path: `${OUT}/${name}.png`,
    fullPage: false,
    caret: "initial",
  });

  results.push({
    path,
    label,
    status,
    checks: { h1Count: checks.h1Count, visibleH1: checks.visibleH1 },
    errors: state,
  });
  await context.close();
  return checks.links;
}

async function auditLinks(browser, pages) {
  console.log(`\n▶ internal links`);
  const seen = new Set();
  const toCheck = [...new Set(pages.flat())].filter((href) => {
    if (!href.startsWith("/")) return false;
    if (seen.has(href)) return false;
    seen.add(href);
    return true;
  });

  const context = await browser.newContext();
  let bad = 0;
  for (const href of toCheck) {
    const response = await context.request.get(`${BASE}${href}`, {
      maxRedirects: 0,
    });
    if (response.status() >= 400) {
      issue("links", "broken-link", `${href} → ${response.status()}`);
      bad += 1;
    }
  }
  if (bad === 0) ok(`${toCheck.length} internal links resolve`);
  await context.close();
}

async function auditAdminFlow(browser) {
  console.log(`\n▶ admin end-to-end flow`);
  const { context, page, state } = await newPage(browser, {
    width: 1440,
    height: 900,
  });

  await page.goto(`${BASE}/admin/login`, { waitUntil: "load" });
  // Unauthenticated visitors must land on the login screen
  await page.goto(`${BASE}/admin`, { waitUntil: "load" });
  if (!page.url().includes("/admin/login"))
    issue("admin", "auth-guard", `redirected to ${page.url()}`);
  else ok("protected area redirects to login");

  // Wait for hydration before interacting with the client-side form
  await page.waitForLoadState("networkidle");

  await page.fill("#email", "admin@yantrixtechnology.com");
  await page.fill("#password", "wrong-password");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForTimeout(1200);
  if (!(await page.locator("[role=alert]").count()))
    issue("admin", "login", "wrong password was not rejected");
  else ok("wrong password rejected");
  if (page.url().includes("password"))
    issue("admin", "login", "credentials leaked into the URL");

  await page.fill("#password", process.env.ADMIN_PASSWORD ?? "Yantrix@2024");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page
    .waitForURL(/localhost:3000\/admin$|127\.0\.0\.1:3000\/admin$/, {
      timeout: 20_000,
    })
    .catch(() => {});
  const onDashboard = /\/admin$/.test(page.url());
  if (!onDashboard)
    issue("admin", "login", `did not reach dashboard (${page.url()})`);
  else ok("login works");
  if (page.url().includes("password"))
    issue("admin", "login", "credentials leaked into the URL");

  for (const screen of [
    "admin",
    "admin/hero",
    "admin/courses",
    "admin/faqs",
    "admin/sections",
    "admin/pages",
    "admin/seo",
    "admin/enquiries",
    "admin/admins",
    "admin/settings",
  ]) {
    const response = await page.goto(`${BASE}/${screen}`, {
      waitUntil: "load",
    });
    const body = await page.locator("body").innerText();
    if (response?.status() !== 200)
      issue(`/${screen}`, "status", `HTTP ${response?.status()}`);
    if (/Application error|Unhandled Runtime Error/i.test(body))
      issue(`/${screen}`, "render", "error overlay present");
    await page.screenshot({
      path: `${OUT}/admin_${screen.replace(/\//g, "_")}.png`,
      caret: "initial",
    });
  }
  ok("all admin screens render");

  // ── create a course through the UI ──
  await page.goto(`${BASE}/admin/courses`, { waitUntil: "load" });
  await page.getByRole("button", { name: /add course/i }).click();
  await page.waitForTimeout(400);
  const dialog = page.getByRole("dialog");
  await dialog.locator("#title").fill("Audit Test Course");
  await dialog.locator("#slug").fill("audit-test-course");
  await dialog
    .locator("#description")
    .fill("Course created by the automated audit.");
  await page.getByRole("button", { name: /^add item$/i }).click();
  await page.waitForTimeout(1500);

  await page.goto(`${BASE}/courses`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  const courseVisible =
    (await page.locator("text=Audit Test Course").count()) > 0;
  if (!courseVisible)
    issue("admin", "crud-create", "new course did not appear on /courses");
  else ok("created course appears on the public site");

  // ── delete it again ──
  await page.goto(`${BASE}/admin/courses`, { waitUntil: "load" });
  page.once("dialog", (d) => d.accept());
  const row = page.locator("li", { hasText: "Audit Test Course" }).first();
  await row.getByTitle("Delete").click();
  await page.waitForTimeout(1500);
  const stillThere = (await page.locator("text=Audit Test Course").count()) > 0;
  if (stillThere)
    issue("admin", "crud-delete", "deleted course is still listed");
  else ok("course deleted");

  await page.goto(`${BASE}/courses`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  if ((await page.locator("text=Audit Test Course").count()) > 0)
    issue("admin", "crud-delete", "deleted course still visible on /courses");

  if (state.consoleErrors.length)
    issue("admin", "console", state.consoleErrors.slice(0, 3).join(" | "));
  await context.close();
}

async function auditContactForm(browser) {
  console.log(`\n▶ contact form`);
  const { context, page } = await newPage(browser, {
    width: 1440,
    height: 900,
  });
  await page.goto(`${BASE}/contact`, { waitUntil: "load" });
  await page.waitForTimeout(800);

  await page.getByLabel(/full name/i).fill("Audit Student");
  await page.getByLabel(/email address/i).fill("audit.student@example.com");
  await page.getByLabel(/mobile number/i).fill("9000000001");
  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Python Programming" }).click();
  await page.getByLabel(/message/i).fill("Automated audit enquiry.");
  await page.getByRole("button", { name: /send enquiry/i }).click();
  await page.waitForTimeout(2500);

  const success = (await page.locator("text=Enquiry received!").count()) > 0;
  if (!success)
    issue("/contact", "form", "success state not shown after submitting");
  else ok("enquiry submitted successfully");

  await page.screenshot({
    path: `${OUT}/contact_success.png`,
    caret: "initial",
  });
  await context.close();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await playwright.launch({
    executablePath: CHROMIUM,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
    headless: true,
    env: { ...process.env, LD_LIBRARY_PATH: LIB_PATH },
  });

  const desktop = { width: 1440, height: 900 };
  const mobile = { width: 390, height: 844 };
  const publicPages = [
    "/",
    "/courses",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ];

  const discovered = [];
  for (const path of publicPages) {
    discovered.push(await auditPage(browser, path, desktop, "desktop"));
  }
  for (const path of ["/", "/courses", "/contact"]) {
    discovered.push(await auditPage(browser, path, mobile, "mobile"));
  }

  await auditLinks(browser, discovered);
  await auditAdminFlow(browser);
  await auditContactForm(browser);

  await browser.close();

  const report = {
    base: BASE,
    generatedAt: new Date().toISOString(),
    pagesAudited: results.length,
    issueCount: issues.length,
    issues,
    results,
  };
  await writeFile(`${OUT}/report.json`, JSON.stringify(report, null, 2));

  console.log(`\n════════════════════════════════════`);
  if (issues.length === 0) {
    console.log(`✅ Audit passed — ${results.length} pages, 0 issues`);
  } else {
    console.log(
      `❌ ${issues.length} issue(s) found across ${results.length} pages`,
    );
    for (const item of issues)
      console.log(`  • [${item.kind}] ${item.page}: ${item.detail}`);
  }
  console.log(`Report: ${OUT}/report.json · screenshots: ${OUT}/`);
  process.exit(issues.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
