// Full live audit: crawls every internal page on desktop + mobile and reports
// HTTP errors, console errors, failed requests, broken images, horizontal
// overflow, missing SEO tags and broken internal links.
//
//   SMOKE_IP=189.72.144.215 node scripts/audit-live.mjs
//
// SMOKE_IP maps the domain to that server (bypasses stale DNS caches);
// certificates are still checked.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const DOMAIN = process.env.SMOKE_DOMAIN || "www.yantrixtechnology.com";
const IP = process.env.SMOKE_IP || "";
const BASE = process.env.SMOKE_BASE || `https://${DOMAIN}`;
const OUT = process.env.SMOKE_OUT || "audit-out";
const MAX_PAGES = Number(process.env.AUDIT_MAX || 80);
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  args: IP ? [`--host-resolver-rules=MAP ${DOMAIN} ${IP}`] : [],
});

const issues = [];
const add = (severity, page, what, detail = "") => {
  issues.push({ severity, page, what, detail: String(detail).slice(0, 300) });
};

const origin = new URL(BASE).origin;
const norm = (href) => {
  try {
    const u = new URL(href, BASE);
    if (u.origin !== origin) return null;
    if (/\.(pdf|png|jpe?g|webp|svg|gif|ico|xml|txt|webmanifest)$/i.test(u.pathname)) return null;
    if (u.pathname.startsWith("/api/") || u.pathname.startsWith("/_next/")) return null;
    return u.pathname.replace(/\/$/, "") || "/";
  } catch {
    return null;
  }
};

async function auditViewport(name, viewport) {
  const ctx = await browser.newContext({ viewport });
  // skip the entrance door for crawling (same flag the site sets after entering)
  await ctx.addInitScript(() => {
    try { sessionStorage.setItem("yantrix_entered", "1"); } catch {}
  });
  const page = await ctx.newPage();
  const queue = ["/"];
  const seen = new Set(queue);
  const linkSources = new Map();
  let count = 0;

  while (queue.length && count < MAX_PAGES) {
    const path = queue.shift();
    count++;
    const consoleErrors = [];
    const failed = [];
    const onConsole = (m) => { if (m.type() === "error") consoleErrors.push(m.text()); };
    const onPageError = (e) => consoleErrors.push("pageerror: " + e.message);
    const onFailed = (r) => {
      const f = r.failure()?.errorText || "";
      if (!/ERR_ABORTED/.test(f)) failed.push(`${r.url()} (${f})`);
    };
    const onResponse = (r) => {
      if (r.status() >= 400 && new URL(r.url()).origin === origin) failed.push(`${r.status()} ${r.url()}`);
    };
    page.on("console", onConsole);
    page.on("pageerror", onPageError);
    page.on("requestfailed", onFailed);
    page.on("response", onResponse);

    let status = 0;
    const t0 = Date.now();
    try {
      const res = await page.goto(BASE + path, { waitUntil: "load", timeout: 60000 });
      status = res?.status() ?? 0;
    } catch (e) {
      add("high", path, `[${name}] navigation failed`, e.message);
    }
    const loadMs = Date.now() - t0;
    await page.waitForTimeout(1500);
    // scroll through so lazy images / reveal animations load
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);

    if (status !== 200) add("high", path, `[${name}] HTTP ${status}`);
    if (loadMs > 8000) add("medium", path, `[${name}] slow load`, `${loadMs} ms`);

    const info = await page.evaluate(() => {
      const meta = (sel) => document.querySelector(sel)?.getAttribute("content") || "";
      const broken = [...document.images]
        .filter((img) => img.complete && img.naturalWidth === 0 && img.currentSrc)
        .map((img) => img.currentSrc);
      const noAlt = [...document.images].filter((img) => !img.hasAttribute("alt")).map((img) => img.src);
      const overflow = document.documentElement.scrollWidth - window.innerWidth;
      const wide = [];
      if (overflow > 2) {
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (r.right > window.innerWidth + 2 && r.width > 0 && getComputedStyle(el).position !== "fixed") {
            wide.push(`${el.tagName.toLowerCase()}.${(el.className?.baseVal ?? el.className ?? "").toString().split(" ").slice(0, 2).join(".")} right=${Math.round(r.right)}`);
            if (wide.length > 4) break;
          }
        }
      }
      return {
        title: document.title,
        description: meta('meta[name="description"]'),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
        ogImage: meta('meta[property="og:image"]'),
        h1: [...document.querySelectorAll("h1")].map((h) => h.textContent.trim()).filter(Boolean),
        links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
        broken,
        noAlt,
        overflow,
        wide,
        emptyLinks: [...document.querySelectorAll("a[href]")].filter(
          (a) => !a.textContent.trim() && !a.getAttribute("aria-label") && !a.querySelector("img[alt]:not([alt=''])") && !a.title
        ).length,
      };
    });

    if (name === "desktop") {
      if (!info.title) add("medium", path, "missing <title>");
      if (!info.description) add("medium", path, "missing meta description");
      if (!info.canonical) add("low", path, "missing canonical");
      if (info.h1.length !== 1) add("low", path, `h1 count = ${info.h1.length}`, info.h1.join(" | "));
    }
    for (const b of info.broken) add("high", path, `[${name}] broken image`, b);
    for (const b of info.noAlt.slice(0, 3)) add("low", path, `[${name}] image without alt`, b);
    if (info.overflow > 2) add("medium", path, `[${name}] horizontal scroll ${info.overflow}px`, info.wide.join("; "));
    if (info.emptyLinks) add("low", path, `[${name}] ${info.emptyLinks} link(s) without text/label`);
    for (const e of consoleErrors) add("high", path, `[${name}] console error`, e);
    for (const f of failed) add("high", path, `[${name}] failed request`, f);

    for (const href of info.links) {
      const n = norm(href);
      if (!n) continue;
      if (!linkSources.has(n)) linkSources.set(n, path);
      if (!seen.has(n)) {
        seen.add(n);
        queue.push(n);
      }
    }
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    page.off("requestfailed", onFailed);
    page.off("response", onResponse);
    await page.screenshot({ path: `${OUT}/${name}${path.replace(/\//g, "_") || "_home"}.png`, fullPage: false });
    console.log(`[${name}] ${status} ${path} (${loadMs} ms)`);
  }
  await ctx.close();
  return [...seen];
}

const desktopPages = await auditViewport("desktop", { width: 1366, height: 800 });
await auditViewport("mobile", { width: 390, height: 844 });

// downloadable files linked from pages
const ctx = await browser.newContext();
const page = await ctx.newPage();
for (const file of ["/robots.txt", "/sitemap.xml", "/llms.txt", "/llms-full.txt", "/manifest.webmanifest"]) {
  const res = await page.goto(BASE + file).catch(() => null);
  if (res?.status() !== 200) add("medium", file, `HTTP ${res?.status()}`);
}
// sitemap URLs must all resolve
const sm = await (await page.goto(BASE + "/sitemap.xml")).text();
for (const loc of [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])) {
  const u = new URL(loc);
  if (u.host !== DOMAIN) add("medium", "/sitemap.xml", "sitemap URL on another host", loc);
  const res = await page.goto(BASE + u.pathname).catch(() => null);
  if (res?.status() !== 200) add("high", "/sitemap.xml", `sitemap URL returns ${res?.status()}`, loc);
}
await ctx.close();
await browser.close();

writeFileSync(`${OUT}/issues.json`, JSON.stringify(issues, null, 2));
const order = { high: 0, medium: 1, low: 2 };
issues.sort((a, b) => order[a.severity] - order[b.severity]);
console.log(`\nPages crawled: ${desktopPages.length}`);
console.log(`Issues: ${issues.length} (high ${issues.filter((i) => i.severity === "high").length}, medium ${issues.filter((i) => i.severity === "medium").length}, low ${issues.filter((i) => i.severity === "low").length})`);
for (const i of issues) console.log(`${i.severity.toUpperCase().padEnd(6)} ${i.page}  ${i.what}${i.detail ? "  — " + i.detail : ""}`);
