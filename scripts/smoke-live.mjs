// Live smoke test for the deployed site.
//
//   node scripts/smoke-live.mjs                       # https://www.yantrixtechnology.com
//   SMOKE_IP=189.72.144.215 node scripts/smoke-live.mjs
//
// SMOKE_IP sends the domain straight to that server, so the deploy can be
// checked before DNS points at it. HTTPS errors are ignored in that mode (the
// Let's Encrypt certificate can only be issued once DNS is switched).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const DOMAIN = process.env.SMOKE_DOMAIN || "www.yantrixtechnology.com";
const IP = process.env.SMOKE_IP || "";
// SMOKE_STRICT=1 keeps certificate checks on even with SMOKE_IP (once SSL is live).
const STRICT = Boolean(process.env.SMOKE_STRICT);
const BASE = process.env.SMOKE_BASE || `https://${DOMAIN}`;
const OUT = process.env.SMOKE_OUT || "smoke-screens";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  args: IP ? [`--host-resolver-rules=MAP ${DOMAIN} ${IP}`] : [],
});
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

async function visit(page, path, label) {
  const errors = [];
  page.removeAllListeners("pageerror");
  page.on("pageerror", (e) => errors.push(e.message));
  const res = await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 60000 });
  check(`${label} ${path} -> ${res?.status()}`, res?.status() === 200);
  return errors;
}

for (const [vpName, viewport] of [["desktop", { width: 1366, height: 800 }], ["mobile", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport, ignoreHTTPSErrors: Boolean(IP) && !STRICT });
  const page = await ctx.newPage();

  // Home: the door must open by itself, then the site must be usable.
  let errors = await visit(page, "/", `[${vpName}] home`);
  const door = page.locator(".door-intro");
  await page.waitForTimeout(6000);
  const doorGone = (await door.count()) === 0 || !(await door.first().isVisible());
  check(`[${vpName}] door opens by itself`, doorGone);
  check(`[${vpName}] header logo visible`, await page.locator("header img").first().isVisible());
  await page.screenshot({ path: `${OUT}/${vpName}-home.png` });
  check(`[${vpName}] home has no JS errors`, errors.length === 0, errors.slice(0, 2).join(" | "));

  for (const [path, label, text] of [
    ["/courses", "courses", /course/i],
    ["/courses/full-stack-development", "course detail", /curriculum/i],
    ["/about", "about", /yantrix/i],
    ["/contact", "contact", /contact|enquir/i],
    ["/refund-policy", "refund policy", /refund/i],
    ["/admin/login", "admin login", /sign in|admin/i],
  ]) {
    errors = await visit(page, path, `[${vpName}] ${label}`);
    await page.waitForTimeout(1500);
    const body = await page.locator("body").innerText();
    check(`[${vpName}] ${label} shows content`, text.test(body));
    check(`[${vpName}] ${label} has no JS errors`, errors.length === 0, errors.slice(0, 2).join(" | "));
    await page.screenshot({ path: `${OUT}/${vpName}-${label.replace(/\s+/g, "-")}.png` });
  }
  await ctx.close();
}

// Plain HTTP checks that matter for search engines. Fetched through a page,
// not ctx.request: the API client ignores --host-resolver-rules and would ask
// public DNS instead of SMOKE_IP.
const ctx = await browser.newContext({ ignoreHTTPSErrors: Boolean(IP) && !STRICT });
const page = await ctx.newPage();
let sitemap = "";
for (const path of ["/robots.txt", "/sitemap.xml", "/llms.txt"]) {
  const res = await page.goto(BASE + path, { timeout: 60000 });
  check(`${path} -> ${res?.status()}`, res?.status() === 200);
  if (path === "/sitemap.xml") sitemap = (await res?.text()) ?? "";
}
check("sitemap lists course pages", sitemap.includes("/courses/"));
await ctx.close();
await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed. Screenshots: ${OUT}/`);
process.exit(failed.length ? 1 : 0);
