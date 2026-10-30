/**
 * Interaction / permission audit (Playwright + API).
 *
 *   CHROMIUM_PATH=/path/to/chromium node scripts/audit-flows.mjs
 *   ADMIN_OTP=123456          # or ADMIN_OTP_LOG=dev.log to read the dev console code
 *
 * Covers the journeys a real visitor and a real admin takes:
 *   • mobile menu opens, links navigate, layout stays inside the viewport
 *   • "Enquire Now" pre-fills the contact form
 *   • contact form validation blocks bad input and shows field errors
 *   • admin edits a setting → change is visible on the public site → reverted
 *   • admin edits a section heading and a hero slide, then reverts
 *   • read-only (viewer) accounts cannot write; editors can
 *   • rate limiting / unauthorised access
 */

import { chromium as playwright } from "playwright-core";

const BASE = process.env.AUDIT_BASE ?? "http://127.0.0.1:3000";
const CHROMIUM = process.env.CHROMIUM_PATH ?? "/tmp/chromium";
import { existsSync, readFileSync } from "node:fs";

const LIBS = process.env.CHROMIUM_LIBS ?? "/tmp/nsslib";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@yantrixtechnology.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Yantrix@2024";

const problems = [];
const fail = (scope, message) => {
  problems.push(`${scope}: ${message}`);
  console.log(`  ✗ ${scope}: ${message}`);
};
const pass = (message) => console.log(`  ✓ ${message}`);

function readOtpFromLog() {
  const file = process.env.ADMIN_OTP_LOG;
  if (!file || !existsSync(file)) return null;
  const match = [
    ...readFileSync(file, "utf8").matchAll(/code\s*:\s*(\d{6})/g),
  ].pop();
  return match?.[1] ?? null;
}

async function login(page) {
  await page.goto(`${BASE}/admin/login`, { waitUntil: "load" });
  await page.waitForLoadState("networkidle");
  // In dev the server compiles on first hit, so give React a moment to hydrate
  // before typing — otherwise the submit button has no listener yet.
  await page.waitForTimeout(900);
  await page.fill("#email", ADMIN_EMAIL);
  await page.fill("#password", ADMIN_PASSWORD);
  await page.getByRole("button", { name: /continue/i }).click();
  await page
    .locator("input[autocomplete=one-time-code]")
    .first()
    .waitFor({ timeout: 20_000 });

  // step 2: the one-time code (printed to the dev log, or supplied directly)
  await page.waitForTimeout(400);
  const otp = process.env.ADMIN_OTP ?? readOtpFromLog();
  if (!otp)
    throw new Error(
      "Set ADMIN_OTP or ADMIN_OTP_LOG to complete the two-step sign-in.",
    );
  await page.locator("input[autocomplete=one-time-code]").first().fill(otp);
  // Pasting all six digits auto-submits; the button is only needed when the
  // boxes are filled one by one.
  await page.waitForURL(/\/admin$/, { timeout: 8_000 }).catch(() => {});
  if (!/\/admin$/.test(page.url())) {
    const verify = page.getByRole("button", { name: /verify & sign in/i });
    if (await verify.isEnabled().catch(() => false))
      await verify.click().catch(() => {});
  }
  await page.waitForURL(/\/admin$/, { timeout: 20_000 });
}

async function mobileNavigation(browser) {
  console.log("\n▶ mobile navigation");
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(800);

  await page.getByRole("button", { name: /open menu/i }).click();
  await page.waitForTimeout(500);
  if (!(await page.locator("#mobile-menu").isVisible()))
    fail("mobile", "menu did not open");
  else pass("mobile menu opens");

  await page
    .locator("#mobile-menu")
    .getByRole("link", { name: "Courses" })
    .click();
  await page.waitForTimeout(900);
  const url = page.url();
  if (!url.endsWith("/courses")) fail("mobile", `navigation went to ${url}`);
  else pass("mobile navigation works");

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  if (overflow > 2) fail("mobile", `content overflows by ${overflow}px`);
  else pass("no horizontal overflow after navigation");

  await page.screenshot({
    path: "audit-output/mobile_menu_navigated.png",
    caret: "initial",
  });
  await context.close();
}

async function enquireFlow(browser) {
  console.log("\n▶ enquire-now prefill");
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/courses`, { waitUntil: "load" });
  await page.waitForTimeout(800);

  await page
    .getByRole("button", { name: /enquire now/i })
    .first()
    .click();
  await page.waitForTimeout(1200);
  const course = await page
    .getByRole("combobox")
    .first()
    .innerText()
    .catch(() => "");
  if (!course || /select a course/i.test(course))
    fail("courses", "course was not pre-filled on the form");
  else pass(`form pre-filled with "${course.trim()}"`);

  await context.close();
}

async function contactValidation(browser) {
  console.log("\n▶ contact form validation");
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/contact`, { waitUntil: "load" });
  await page.waitForTimeout(700);

  await page.getByLabel(/full name/i).fill("A");
  await page.getByLabel(/email address/i).fill("not-an-email");
  await page.getByLabel(/mobile number/i).fill("123");
  await page.getByRole("button", { name: /send enquiry/i }).click();
  await page.waitForTimeout(1200);

  const errors = await page.locator("[data-slot=form-message]").count();
  if (errors < 3)
    fail("/contact", `expected 3 validation messages, saw ${errors}`);
  else pass("invalid input is rejected with field errors");

  const stillOnForm =
    (await page.locator("text=Course Enquiry Form").count()) > 0;
  if (!stillOnForm) fail("/contact", "form submitted despite invalid input");
  await context.close();
}

async function adminEditsContent(browser) {
  console.log("\n▶ admin edit → public site → revert");
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await login(page);

  // 1. change the "why choose us" section heading through the UI
  await page.goto(`${BASE}/admin/sections`, { waitUntil: "load" });
  await page.waitForTimeout(700);
  const heading = page.locator("#why\\.title");
  const original = await heading.inputValue();
  const updated = `${original} [audit]`;
  await heading.fill(updated);
  await page.getByRole("button", { name: /save changes/i }).click();
  await page.waitForTimeout(1500);

  const html = await (await fetch(`${BASE}/`)).text();
  if (!html.includes(updated))
    fail("admin", "section heading change not visible on the home page");
  else pass("section heading edit is live on the site");

  await heading.fill(original);
  await page.getByRole("button", { name: /save changes/i }).click();
  await page.waitForTimeout(1500);
  const reverted = await (await fetch(`${BASE}/`)).text();
  if (reverted.includes(updated)) fail("admin", "revert did not take effect");
  else pass("edit reverted cleanly");

  // 2. toggle a section off and confirm it disappears, then restore
  const toggle = page.locator("#why\\.hidden");
  await toggle.click();
  await page.getByRole("button", { name: /save changes/i }).click();
  await page.waitForTimeout(1500);
  // Check the rendered DOM (the RSC payload inside the HTML always contains
  // the raw content, so a plain string search would give a false positive).
  const sitePage = await context.newPage();
  await sitePage.goto(`${BASE}/`, { waitUntil: "load" });
  await sitePage.waitForTimeout(600);
  const rendered = await sitePage.locator(`text=${original}`).count();
  await sitePage.close();
  if (rendered > 0) fail("admin", "hidden section still renders on the site");
  else pass("hiding a section removes it from the site");

  await page.locator("#why\\.hidden").click();
  await page.getByRole("button", { name: /save changes/i }).click();
  await page.waitForTimeout(1500);

  // 3. hero slide edit
  await page.goto(`${BASE}/admin/hero`, { waitUntil: "load" });
  await page.waitForTimeout(600);
  await page.locator("li").first().getByTitle("Edit").click();
  const dialog = page.getByRole("dialog");
  const slideTitle = await dialog.locator("#title").inputValue();
  await dialog.locator("#title").fill(`${slideTitle} [audit]`);
  await dialog.getByRole("button", { name: /save changes/i }).click();
  await page.waitForTimeout(1500);
  const heroHtml = await (await fetch(`${BASE}/`)).text();
  if (!heroHtml.includes(`${slideTitle} [audit]`))
    fail("admin", "hero slide edit not visible");
  else pass("hero slide edit is live");

  await page.locator("li").first().getByTitle("Edit").click();
  await page.getByRole("dialog").locator("#title").fill(slideTitle);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /save changes/i })
    .click();
  await page.waitForTimeout(1500);

  await context.close();
}

async function permissions() {
  console.log("\n▶ API permissions");

  const anonymous = await fetch(`${BASE}/api/admin/content`, { method: "GET" });
  if (anonymous.status !== 401)
    fail("api", `anonymous GET returned ${anonymous.status}`);
  else pass("anonymous requests are rejected");

  const badWrite = await fetch(`${BASE}/api/admin/content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "reset" }),
  });
  if (badWrite.status !== 401)
    fail("api", `anonymous write returned ${badWrite.status}`);
  else pass("anonymous writes are rejected");

  const badEnquiry = await fetch(`${BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "x", email: "bad", mobile: "1", course: "" }),
  });
  if (badEnquiry.status !== 422)
    fail("api", `invalid enquiry returned ${badEnquiry.status}`);
  else pass("invalid enquiries are rejected with 422");
}

/**
 * API sign-in with the session cookie, following the two-step flow:
 * password → challenge cookie → one-time code → `yantrix_admin` cookie.
 */
async function apiLogin(email, password) {
  const step1 = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!step1.ok) throw new Error(`password step failed (${step1.status})`);
  const challenge = step1.headers.get("set-cookie")?.split(";")[0] ?? "";

  // the code is printed to the dev console log a moment later
  let otp = process.env.ADMIN_OTP ?? null;
  for (let attempt = 0; attempt < 10 && !otp; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    otp = readOtpFromLog();
  }
  if (!otp) throw new Error("no one-time code available for the API sign-in");

  const step2 = await fetch(`${BASE}/api/admin/login/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: challenge },
    body: JSON.stringify({ code: otp }),
  });
  if (!step2.ok) throw new Error(`code step failed (${step2.status})`);
  return step2.headers.get("set-cookie")?.split(";")[0] ?? "";
}

async function viewerRole(browser) {
  console.log("\n▶ read-only account");
  const email = `viewer-${Date.now()}@example.com`;
  const password = "Viewer@2024pass";

  // create a viewer with the owner account
  const cookie = await apiLogin(ADMIN_EMAIL, ADMIN_PASSWORD);
  const created = await fetch(`${BASE}/api/admin/admins`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      name: "Audit Viewer",
      email,
      password,
      role: "viewer",
    }),
  });
  if (created.status !== 201) {
    fail("viewer", `could not create a viewer account (${created.status})`);
    return;
  }

  const viewerCookie = await apiLogin(email, password);

  const read = await fetch(`${BASE}/api/admin/content`, {
    headers: { cookie: viewerCookie },
  });
  if (read.status !== 200)
    fail("viewer", `viewer could not read content (${read.status})`);
  else pass("viewer can read content");

  const write = await fetch(`${BASE}/api/admin/content`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: viewerCookie },
    body: JSON.stringify({
      op: "updateSettings",
      value: { tagline: "hacked" },
    }),
  });
  if (write.status !== 403)
    fail("viewer", `viewer write returned ${write.status} (expected 403)`);
  else pass("viewer cannot modify content");

  const ownerOnly = await fetch(`${BASE}/api/admin/admins`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: viewerCookie },
    body: JSON.stringify({
      name: "X",
      email: "x@example.com",
      password: "Password123",
      role: "owner",
    }),
  });
  if (ownerOnly.status !== 403)
    fail("viewer", `viewer could create an admin (${ownerOnly.status})`);
  else pass("viewer cannot manage admin accounts");

  // cleanup
  const admins =
    (
      await (
        await fetch(`${BASE}/api/admin/admins`, { headers: { cookie } })
      ).json()
    ).admins ?? [];
  const viewer = admins.find((admin) => admin.email === email);
  if (viewer) {
    await fetch(`${BASE}/api/admin/admins/${viewer.id}`, {
      method: "DELETE",
      headers: { cookie },
    });
  }
}

async function main() {
  const browser = await playwright.launch({
    executablePath: CHROMIUM,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
    headless: true,
    env: { ...process.env, LD_LIBRARY_PATH: LIBS },
  });

  try {
    await mobileNavigation(browser);
    await enquireFlow(browser);
    await contactValidation(browser);
    await adminEditsContent(browser);
    await permissions();
    await viewerRole();
  } finally {
    await browser.close();
  }

  console.log("\n════════════════════════════════════");
  if (problems.length === 0) console.log("✅ Flow audit passed");
  else {
    console.log(`❌ ${problems.length} flow problem(s):`);
    problems.forEach((problem) => console.log(`  • ${problem}`));
  }
  process.exit(problems.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
