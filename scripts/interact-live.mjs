// Interaction checks on the live site (no data is submitted).
//
//   SMOKE_IP=189.72.144.215 node scripts/interact-live.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const DOMAIN = process.env.SMOKE_DOMAIN || "www.yantrixtechnology.com";
const IP = process.env.SMOKE_IP || "";
const BASE = process.env.SMOKE_BASE || `https://${DOMAIN}`;
const OUT = process.env.SMOKE_OUT || "interact-out";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: IP ? [`--host-resolver-rules=MAP ${DOMAIN} ${IP}`] : [] });
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};
const errorsOf = (page) => {
  const list = [];
  page.on("pageerror", (e) => list.push(e.message));
  page.on("console", (m) => {
    // the wrong-password login check expects a 401 from the API
    if (m.type() === "error" && !/status of 401/.test(m.text())) list.push(m.text());
  });
  return list;
};

async function closePopup(page) {
  const close = page.getByRole("button", { name: /close|dismiss/i }).first();
  if (await close.isVisible().catch(() => false)) await close.click();
  // wait for the close animation to finish
  await page.getByRole("dialog").first().waitFor({ state: "hidden", timeout: 4000 }).catch(() => {});
}

for (const [vp, viewport] of [["desktop", { width: 1366, height: 800 }], ["mobile", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const errors = errorsOf(page);

  // 1. door -> popup -> site
  await page.goto(BASE + "/", { waitUntil: "load" });
  const doorButton = page.locator(".door-cta");
  if (await doorButton.isVisible().catch(() => false)) await doorButton.click();
  await page.waitForTimeout(2500);
  check(`[${vp}] door gone after click`, !(await page.locator(".door-intro").isVisible().catch(() => false)));
  const dialog = page.getByRole("dialog").first();
  const popupShown = await dialog.isVisible().catch(() => false);
  await closePopup(page);
  check(`[${vp}] welcome popup closes`, !popupShown || !(await page.getByRole("dialog").first().isVisible().catch(() => false)));
  await page.screenshot({ path: `${OUT}/${vp}-home-after-popup.png` });

  // 2. navigation
  if (vp === "mobile") {
    const menu = page.getByRole("button", { name: /menu|navigation/i }).first();
    check(`[${vp}] mobile menu button visible`, await menu.isVisible().catch(() => false));
    await menu.click().catch(() => {});
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/${vp}-menu-open.png` });
  }
  const coursesLink = page.getByRole("link", { name: /^courses$/i }).first();
  const navOk = await coursesLink.isVisible().catch(() => false);
  check(`[${vp}] "Courses" link in navigation`, navOk);
  if (navOk) {
    await coursesLink.click();
    await page.waitForURL(/\/courses/, { timeout: 15000 }).catch(() => {});
  } else {
    await page.goto(BASE + "/courses");
  }
  check(`[${vp}] courses page reached`, page.url().includes("/courses"), page.url());

  // 3. course card -> detail
  const card = page.locator('a[href^="/courses/"]').first();
  const href = await card.getAttribute("href").catch(() => null);
  if (href) await page.goto(BASE + href, { waitUntil: "load" });
  check(`[${vp}] course detail opened`, /\/courses\/.+/.test(page.url()), page.url());
  await closePopup(page);

  // curriculum show/hide + syllabus PDF
  const pdf = page.locator('a[href$="-syllabus.pdf"]').first();
  const pdfHref = await pdf.getAttribute("href").catch(() => null);
  if (pdfHref) {
    // a page, not page.request: the API client ignores host-resolver-rules
    const p2 = await ctx.newPage();
    // the browser downloads a PDF instead of rendering it, so ask from inside the page
    await p2.goto(BASE + "/robots.txt");
    const pdfInfo = await p2.evaluate(async (u) => {
      const r = await fetch(u);
      return { status: r.status, type: r.headers.get("content-type") || "" };
    }, new URL(pdfHref, BASE).href);
    check(`[${vp}] syllabus PDF downloads`, pdfInfo.status === 200 && /pdf/.test(pdfInfo.type), `${pdfHref} ${pdfInfo.status} ${pdfInfo.type}`);
    await p2.close();
  } else {
    check(`[${vp}] syllabus PDF link present`, false);
  }
  const enquire = page.getByRole("button", { name: /enquire|enroll/i }).first();
  check(`[${vp}] course page has an enquire/enrol call to action`, await enquire.isVisible().catch(() => false));
  await enquire.click().catch(() => {});
  await page.waitForTimeout(1500);
  check(`[${vp}] enquire button opens the contact form`, (await page.locator("form").count()) > 0, page.url());
  await page.screenshot({ path: `${OUT}/${vp}-course-detail.png` });

  // 4. contact form validation (never submits valid data)
  await page.goto(BASE + "/contact", { waitUntil: "load" });
  await closePopup(page);
  const form = page.locator("form").first();
  check(`[${vp}] contact form present`, await form.isVisible().catch(() => false));
  const submit = form.locator('button[type="submit"]').first();
  await submit.scrollIntoViewIfNeeded().catch(() => {});
  await submit.click().catch(() => {});
  await page.waitForTimeout(800);
  const invalid = await form.locator('[aria-invalid="true"], :invalid').count();
  const errText = await form.innerText();
  check(`[${vp}] empty contact form is blocked with errors`, invalid > 0 || /required|enter|valid/i.test(errText), `${invalid} invalid fields`);
  await page.screenshot({ path: `${OUT}/${vp}-contact-validation.png` });

  // 5. WhatsApp + phone links work
  const wa = page.locator('a[href*="wa.me"], a[href*="whatsapp"]').first();
  const waHref = await wa.getAttribute("href").catch(() => null);
  check(`[${vp}] WhatsApp link present`, Boolean(waHref), waHref || "");
  const tel = page.locator('a[href^="tel:"]').first();
  check(`[${vp}] phone link present`, (await tel.count()) > 0);

  // 6. legal pages from the footer
  await page.goto(BASE + "/", { waitUntil: "load" });
  await closePopup(page);
  for (const path of ["/privacy", "/terms", "/refund-policy"]) {
    check(`[${vp}] footer links to ${path}`, (await page.locator(`footer a[href="${path}"]`).count()) > 0);
  }

  // 7. admin login form (wrong password is rejected, nothing created)
  await page.goto(BASE + "/admin/login", { waitUntil: "load" });
  await page.fill("#email", "nobody@example.com");
  await page.fill("#password", "wrong-password");
  await page.getByRole("button", { name: /continue/i }).click();
  await page.waitForTimeout(2000);
  check(`[${vp}] admin login rejects wrong password`, /incorrect|invalid|too many/i.test(await page.locator("body").innerText()));

  check(`[${vp}] no JS errors during the walk-through`, errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}
await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed. Screenshots: ${OUT}/`);
process.exit(failed ? 1 : 0);
