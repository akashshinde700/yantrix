// Prints what search and answer engines see on each page: title, meta,
// canonical, Open Graph, headings and the JSON-LD types (with basic checks).
//
//   SMOKE_IP=189.72.144.215 node scripts/seo-inspect.mjs
//   SMOKE_BASE=http://localhost:3000 node scripts/seo-inspect.mjs
import { chromium } from "playwright";

const DOMAIN = process.env.SMOKE_DOMAIN || "www.yantrixtechnology.com";
const IP = process.env.SMOKE_IP || "";
const BASE = process.env.SMOKE_BASE || `https://${DOMAIN}`;
const PAGES = (process.env.PAGES ||
  "/,/courses,/courses/full-stack-development,/about,/contact,/privacy,/refund-policy").split(",");

const browser = await chromium.launch({ args: IP ? [`--host-resolver-rules=MAP ${DOMAIN} ${IP}`] : [] });
const ctx = await browser.newContext({ javaScriptEnabled: false }); // what a crawler sees first
const page = await ctx.newPage();

for (const path of PAGES) {
  await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
  const d = await page.evaluate(() => {
    const m = (s) => document.querySelector(s)?.getAttribute("content") ?? null;
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
      try { return JSON.parse(s.textContent); } catch (e) { return { parseError: String(e) }; }
    });
    const types = [];
    const walk = (n) => {
      if (Array.isArray(n)) return n.forEach(walk);
      if (n && typeof n === "object") {
        if (n["@type"]) types.push([].concat(n["@type"]).join("+"));
        Object.values(n).forEach(walk);
      }
    };
    walk(ld);
    return {
      title: document.title,
      desc: m('meta[name="description"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
      robots: m('meta[name="robots"]'),
      ogTitle: m('meta[property="og:title"]'),
      ogImage: m('meta[property="og:image"]'),
      ogUrl: m('meta[property="og:url"]'),
      twitter: m('meta[name="twitter:card"]'),
      hreflang: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => l.hreflang),
      h1: [...document.querySelectorAll("h1")].map((h) => h.textContent.trim()),
      h2: [...document.querySelectorAll("h2")].length,
      words: document.body.innerText.split(/\s+/).length,
      ldBlocks: ld.length,
      ldErrors: ld.filter((x) => x.parseError).length,
      types: [...new Set(types)],
      ldUrls: JSON.stringify(ld).match(/https?:\/\/[^"\\]+/g)?.filter((u) => /yantrix/.test(u)).slice(0, 4) ?? [],
    };
  });
  console.log(`\n=== ${path}`);
  console.log(`title (${d.title.length}): ${d.title}`);
  console.log(`desc  (${d.desc?.length ?? 0}): ${d.desc}`);
  console.log(`canonical: ${d.canonical} | og:url: ${d.ogUrl} | robots: ${d.robots}`);
  console.log(`og:image: ${d.ogImage} | twitter: ${d.twitter} | hreflang: ${d.hreflang.join(",")}`);
  console.log(`h1: ${JSON.stringify(d.h1)} | h2 count: ${d.h2} | words (no JS): ${d.words}`);
  console.log(`JSON-LD blocks: ${d.ldBlocks} (parse errors ${d.ldErrors}) types: ${d.types.join(", ")}`);
  console.log(`JSON-LD urls: ${d.ldUrls.join(" ")}`);
}
await browser.close();
