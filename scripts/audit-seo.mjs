/**
 * Headless SEO / AEO / GEO audit (no browser needed).
 *
 *   node scripts/audit-seo.mjs
 *   AUDIT_BASE=https://yantrixtechnology.com node scripts/audit-seo.mjs
 *
 * Verifies, for every public route:
 *   • <title>, meta description, canonical, OpenGraph + Twitter tags
 *   • robots meta and a single <h1>
 *   • every JSON-LD block parses and contains no `undefined` values
 *   • the JSON-LD types we advertise (organisation, local business, website,
 *     courses, FAQs, breadcrumbs) are present
 *   • sitemap.xml, robots.txt, llms.txt and manifest.webmanifest
 */

const BASE = process.env.AUDIT_BASE ?? "http://127.0.0.1:3000";
const ROUTES = ["/", "/courses", "/about", "/contact", "/privacy", "/terms"];

const problems = [];
function fail(scope, message) {
  problems.push(`${scope}: ${message}`);
  console.log(`  ✗ ${scope}: ${message}`);
}
function pass(message) {
  console.log(`  ✓ ${message}`);
}

function readTag(html, regex) {
  const match = html.match(regex);
  return match?.[1]?.trim() ?? null;
}

async function auditRoute(route) {
  console.log(`\n▶ ${route}`);
  const response = await fetch(`${BASE}${route}`);
  const html = await response.text();
  if (response.status !== 200) fail(route, `HTTP ${response.status}`);

  const title = readTag(html, /<title[^>]*>([^<]*)<\/title>/i);
  const description = readTag(
    html,
    /<meta[^>]+name="description"[^>]+content="([^"]*)"/i,
  );
  const canonical = readTag(
    html,
    /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i,
  );
  const ogTitle = readTag(
    html,
    /<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i,
  );
  const ogImage = readTag(
    html,
    /<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i,
  );
  const twitterCard = readTag(
    html,
    /<meta[^>]+name="twitter:card"[^>]+content="([^"]*)"/i,
  );
  const robots = readTag(
    html,
    /<meta[^>]+name="robots"[^>]+content="([^"]*)"/i,
  );
  const h1s = html.match(/<h1[\s>]/gi)?.length ?? 0;

  if (!title) fail(route, "missing <title>");
  else if (title.length < 20 || title.length > 120)
    fail(route, `title length ${title.length}`);
  else pass(`title (${title.length} chars)`);

  if (!description) fail(route, "missing meta description");
  else if (description.length < 60 || description.length > 320)
    fail(route, `description length ${description.length}`);
  else pass(`description (${description.length} chars)`);

  if (!canonical) fail(route, "missing canonical");
  else pass(`canonical → ${canonical.replace(/^https?:\/\/[^/]+/, "")}`);

  if (!ogTitle || !ogImage) fail(route, "missing OpenGraph tags");
  else pass("OpenGraph present");

  if (!twitterCard) fail(route, "missing twitter card");
  else pass("Twitter card present");

  if (robots && /noindex/i.test(robots) && !route.startsWith("/admin"))
    fail(route, "page is noindex");
  else pass(`robots: ${robots ?? "inherit"}`);

  if (h1s !== 1) fail(route, `<h1> count is ${h1s}`);
  else pass("single <h1>");

  // ── structured data ──
  const blocks = [
    ...html.matchAll(
      /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ];
  if (blocks.length === 0) fail(route, "no JSON-LD blocks");
  const types = new Set();
  for (const [, raw] of blocks) {
    try {
      const parsed = JSON.parse(raw.replace(/&quot;/g, '"'));
      const collect = (value) => {
        if (Array.isArray(value)) return value.forEach(collect);
        if (value && typeof value === "object") {
          if (typeof value["@type"] === "string") types.add(value["@type"]);
          if (Array.isArray(value["@type"]))
            value["@type"].forEach((t) => types.add(t));
          Object.values(value).forEach(collect);
        }
      };
      collect(parsed);
      if (/undefined|NaN|"null"/.test(raw))
        fail(route, "JSON-LD contains undefined/NaN values");
    } catch (error) {
      fail(route, `invalid JSON-LD: ${error.message}`);
    }
  }
  pass(`${blocks.length} JSON-LD block(s): ${[...types].join(", ")}`);

  const required =
    route === "/"
      ? [
          "EducationalOrganization",
          "WebSite",
          "LocalBusiness",
          "FAQPage",
          "Course",
          "BreadcrumbList",
        ]
      : route === "/privacy" || route === "/terms"
        ? ["WebPage", "BreadcrumbList"]
        : [
            "EducationalOrganization",
            "WebSite",
            "FAQPage",
            "Course",
            "BreadcrumbList",
          ];

  for (const type of required) {
    if (!types.has(type)) fail(route, `missing schema type ${type}`);
  }
  if (required.every((type) => types.has(type)))
    pass(`required schema types present`);
}

async function auditFiles() {
  console.log(`\n▶ generated files`);

  const robots = await fetch(`${BASE}/robots.txt`);
  const robotsBody = await robots.text();
  if (robots.status !== 200) fail("/robots.txt", `HTTP ${robots.status}`);
  else if (!/Sitemap:/i.test(robotsBody))
    fail("/robots.txt", "no Sitemap reference");
  else pass("robots.txt references the sitemap");
  if (!/GPTBot|OAI-SearchBot/i.test(robotsBody))
    fail("/robots.txt", "AI crawlers not listed");
  else pass("AI crawlers allowed");
  if (!/Disallow: \/admin/i.test(robotsBody))
    fail("/robots.txt", "/admin is crawlable");
  else pass("/admin disallowed");

  const sitemap = await fetch(`${BASE}/sitemap.xml`);
  const sitemapBody = await sitemap.text();
  const urls = [...sitemapBody.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => m[1],
  );
  if (sitemap.status !== 200) fail("/sitemap.xml", `HTTP ${sitemap.status}`);
  else if (urls.length < ROUTES.length)
    fail("/sitemap.xml", `only ${urls.length} URLs`);
  else pass(`sitemap has ${urls.length} URLs`);

  const llms = await fetch(`${BASE}/llms.txt`);
  const llmsBody = await llms.text();
  if (llms.status !== 200) fail("/llms.txt", `HTTP ${llms.status}`);
  else if (!/^#\s/m.test(llmsBody) || llmsBody.length < 200)
    fail("/llms.txt", "content looks empty");
  else pass(`llms.txt (${llmsBody.length} chars)`);

  const manifest = await fetch(`${BASE}/manifest.webmanifest`);
  if (manifest.status !== 200)
    fail("/manifest.webmanifest", `HTTP ${manifest.status}`);
  else pass("manifest present");

  const notFound = await fetch(`${BASE}/this-page-does-not-exist`);
  if (notFound.status !== 404)
    fail("404", `expected 404, got ${notFound.status}`);
  else pass("unknown routes return 404");
}

console.log(`Auditing ${BASE}`);
for (const route of ROUTES) await auditRoute(route);
await auditFiles();

console.log("\n════════════════════════════════════");
if (problems.length === 0) {
  console.log(`✅ SEO/AEO audit passed — ${ROUTES.length} routes`);
} else {
  console.log(`❌ ${problems.length} SEO problem(s):`);
  problems.forEach((problem) => console.log(`  • ${problem}`));
}
process.exit(problems.length === 0 ? 0 : 1);
