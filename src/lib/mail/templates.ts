/**
 * Enquiry emails — the student's confirmation and the admin alert.
 *
 * Built for real inboxes: table layout + inline styles (Gmail, Outlook,
 * Apple Mail, Yahoo), a 600px animated GIF banner and the icon embedded as
 * CID attachments (shown even before the site has a public domain), dark
 * palette matching the website, plain-text alternatives, and a preheader.
 * Extra CSS animation (fade-up, pulsing dot, button shine) plays in Apple
 * Mail / iOS and is ignored elsewhere; it is disabled for reduced motion.
 *
 * Every value from the form is HTML-escaped.
 */

import type { Course, Enquiry, SiteSettings } from "@/lib/content/types";
import { fullAddress, phoneHref, whatsappUrl } from "@/lib/content/helpers";

export const CID = { banner: "yantrix-banner@email", icon: "yantrix-icon@email" } as const;

const FONT = `'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;
const C = {
  page: "#02040c",
  card: "#070d22",
  panel: "#0b1433",
  line: "#1c2550",
  text: "#e2e8f0",
  muted: "#94a3b8",
  accent: "#22d3ee",
  primary: "#2563eb",
  whatsapp: "#0f7a6e",
};

export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const nl2br = (s: string) => esc(s).replace(/\r?\n/g, "<br>");
const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;
const siteUrl = (s: SiteSettings, path = "/") => `${s.url.replace(/\/$/, "")}${path}`;

export function istTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

/* ───────────── building blocks ───────────── */

function shell({ title, preheader, body, settings }: { title: string; preheader: string; body: string; settings: SiteSettings }) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>${esc(title)}</title>
<style>
  /* Progressive animation — Apple Mail / iOS Mail; other clients ignore it */
  @keyframes yx-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
  @keyframes yx-pulse { 0% { box-shadow: 0 0 0 0 rgba(52,211,153,.7); } 100% { box-shadow: 0 0 0 10px rgba(52,211,153,0); } }
  @keyframes yx-shine { 0% { background-position: -150% 0; } 60%, 100% { background-position: 250% 0; } }
  .yx-up { animation: yx-up .8s cubic-bezier(.22,1,.36,1) both; }
  .yx-d1 { animation-delay: .15s; } .yx-d2 { animation-delay: .3s; } .yx-d3 { animation-delay: .45s; } .yx-d4 { animation-delay: .6s; }
  .yx-dot { animation: yx-pulse 1.6s ease-out infinite; }
  .yx-btn { background-image: linear-gradient(100deg, transparent 30%, rgba(255,255,255,.28) 50%, transparent 70%); background-size: 200% 100%; background-repeat: no-repeat; animation: yx-shine 3.2s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) { .yx-up, .yx-dot, .yx-btn { animation: none !important; } }
  @media screen and (max-width: 620px) {
    .yx-pad { padding-left: 22px !important; padding-right: 22px !important; }
    .yx-h1 { font-size: 24px !important; line-height: 30px !important; }
    .yx-col { display: block !important; width: 100% !important; }
    .yx-btncell { display: block !important; padding: 0 0 10px 0 !important; }
  }
  a { text-decoration: none; }
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">
<tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${C.card};border:1px solid ${C.line};border-radius:20px;overflow:hidden;">
    <tr><td style="padding:0;line-height:0;">
      <img src="cid:${CID.banner}" width="600" alt="${esc(settings.name)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;">
    </td></tr>
    ${body}
    <tr><td class="yx-pad" style="padding:22px 36px 30px;border-top:1px solid ${C.line};font-family:${FONT};">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="padding-right:12px;vertical-align:middle;"><img src="cid:${CID.icon}" width="34" height="34" alt="" style="display:block;border:0;"></td>
        <td style="vertical-align:middle;font-size:13px;line-height:19px;color:${C.muted};">
          <strong style="color:${C.text};">${esc(settings.name)}</strong><br>
          ${esc(fullAddress(settings.contact))}
        </td>
      </tr></table>
      <p style="margin:14px 0 0;font-size:12px;line-height:18px;color:#64748b;">
        ${esc(settings.contact.hours)} · <a href="${phoneHref(settings)}" style="color:${C.accent};">${esc(settings.contact.phone)}</a> · <a href="${esc(siteUrl(settings))}" style="color:${C.accent};">${esc(settings.domain)}</a>
      </p>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

function button(href: string, label: string, color: string, outline = false): string {
  const style = outline
    ? `display:inline-block;padding:13px 22px;border-radius:999px;border:1px solid #334155;color:${C.text};font-family:${FONT};font-size:15px;font-weight:700;`
    : `display:inline-block;padding:14px 24px;border-radius:999px;background-color:${color};color:#ffffff;font-family:${FONT};font-size:15px;font-weight:700;`;
  return `<a href="${esc(href)}" target="_blank" class="${outline ? "" : "yx-btn"}" style="${style}">${label}</a>`;
}

function buttons(list: string[]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${list
    .map((b) => `<td class="yx-btncell" style="padding-right:10px;">${b}</td>`)
    .join("")}</tr></table>`;
}

function detailRows(rows: [string, string][]): string {
  return rows
    .filter(([, v]) => v)
    .map(
      ([k, v], i) => `<tr>
        <td style="padding:12px 16px;${i ? `border-top:1px solid ${C.line};` : ""}font-family:${FONT};font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${C.muted};width:130px;vertical-align:top;">${esc(k)}</td>
        <td style="padding:12px 16px;${i ? `border-top:1px solid ${C.line};` : ""}font-family:${FONT};font-size:15px;line-height:22px;color:${C.text};vertical-align:top;">${v}</td>
      </tr>`
    )
    .join("");
}

function eyebrow(label: string, dotColor: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="padding:6px 14px;border:1px solid ${C.line};border-radius:999px;background:${C.panel};font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${C.accent};">
      <span class="yx-dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${dotColor};vertical-align:middle;margin-right:8px;"></span>${esc(label)}
    </td></tr></table>`;
}

/* ───────────── 1. confirmation to the student ───────────── */

export function studentEmail(enquiry: Enquiry, settings: SiteSettings, course?: Course) {
  const name = firstName(enquiry.name);
  const ref = enquiry.id.slice(0, 8).toUpperCase();
  const wa = whatsappUrl(settings, `Hi ${settings.name}, I just sent an enquiry for ${enquiry.course} (ref ${ref}).`);
  const steps = [
    ["A counsellor calls you", `Usually within one working day (${settings.contact.hours}), on ${enquiry.mobile}.`],
    ["Pick your batch", "Online or classroom — we help you choose the course, timing and mode that fit you."],
    ["Start building", "Hands-on sessions, live projects and placement support from day one."],
  ];

  const courseBlock = course
    ? `<tr><td class="yx-pad yx-up yx-d3" style="padding:0 36px 26px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.panel};border:1px solid ${C.line};border-radius:16px;">
          <tr><td style="padding:18px 20px;font-family:${FONT};">
            <p style="margin:0;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${C.accent};font-weight:700;">Your course</p>
            <p style="margin:6px 0 4px;font-size:18px;font-weight:800;color:#ffffff;">${esc(course.title)}</p>
            <p style="margin:0 0 12px;font-size:14px;line-height:21px;color:${C.muted};">${esc(course.description)}</p>
            <p style="margin:0 0 14px;font-size:13px;color:${C.text};">${[course.duration, course.level, (course.modes ?? []).join(" / ")].filter(Boolean).map(esc).join(" &nbsp;·&nbsp; ")}</p>
            <a href="${esc(siteUrl(settings, `/courses/${course.slug}`))}" target="_blank" style="font-family:${FONT};font-size:14px;font-weight:700;color:${C.accent};">See fees, syllabus &amp; FAQs &rarr;</a>
          </td></tr>
        </table>
      </td></tr>`
    : "";

  const body = `
    <tr><td class="yx-pad yx-up" style="padding:34px 36px 8px;">${eyebrow("Enquiry received", "#34d399")}</td></tr>
    <tr><td class="yx-pad yx-up yx-d1" style="padding:14px 36px 6px;font-family:${FONT};">
      <h1 class="yx-h1" style="margin:0;font-size:28px;line-height:35px;font-weight:800;color:#ffffff;">Thank you, ${esc(name)}! Your IT journey has begun.</h1>
      <p style="margin:14px 0 0;font-size:16px;line-height:25px;color:${C.text};">
        We've received your enquiry for <strong style="color:${C.accent};">${esc(enquiry.course)}</strong>.
        A counsellor from ${esc(settings.name)} will get in touch with you soon to help you choose the right batch.
      </p>
    </td></tr>
    <tr><td class="yx-pad yx-up yx-d2" style="padding:22px 36px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.panel};border:1px solid ${C.line};border-radius:16px;">
        ${detailRows([
          ["Course", esc(enquiry.course)],
          ["Mobile", esc(enquiry.mobile)],
          ["Email", esc(enquiry.email)],
          ["Message", enquiry.message ? nl2br(enquiry.message) : ""],
          ["Reference", `<span style="font-family:Consolas,monospace;color:${C.accent};">#${ref}</span>`],
        ])}
      </table>
    </td></tr>
    ${courseBlock}
    <tr><td class="yx-pad yx-up yx-d3" style="padding:0 36px 8px;font-family:${FONT};">
      <p style="margin:0 0 14px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:${C.accent};font-weight:700;">What happens next</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${steps
          .map(
            ([title, text], i) => `<tr>
          <td style="width:44px;vertical-align:top;padding:0 0 16px;">
            <div style="width:32px;height:32px;border-radius:50%;border:1px solid ${C.accent};background:${C.panel};text-align:center;line-height:32px;font-family:Consolas,monospace;font-size:13px;font-weight:700;color:${C.accent};">0${i + 1}</div>
          </td>
          <td style="vertical-align:top;padding:2px 0 16px;font-family:${FONT};">
            <p style="margin:0;font-size:15px;font-weight:700;color:#ffffff;">${esc(title)}</p>
            <p style="margin:3px 0 0;font-size:14px;line-height:21px;color:${C.muted};">${esc(text)}</p>
          </td></tr>`
          )
          .join("")}
      </table>
    </td></tr>
    <tr><td class="yx-pad yx-up yx-d4" style="padding:6px 36px 30px;">
      <p style="margin:0 0 14px;font-family:${FONT};font-size:15px;color:${C.text};">Can't wait? Talk to us right now:</p>
      ${buttons([button(wa, "Chat on WhatsApp", C.whatsapp), button(phoneHref(settings), `Call ${esc(settings.contact.phone)}`, C.primary, true)])}
      <p style="margin:18px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:#64748b;">
        You're receiving this because this email address was entered on our enquiry form. If that wasn't you, simply ignore this message.
      </p>
    </td></tr>`;

  const text = [
    `Thank you, ${name}! We've received your enquiry for ${enquiry.course}.`,
    `A counsellor from ${settings.name} will contact you on ${enquiry.mobile} soon (${settings.contact.hours}).`,
    "",
    `Course: ${enquiry.course}`,
    `Mobile: ${enquiry.mobile}`,
    enquiry.message ? `Message: ${enquiry.message}` : "",
    `Reference: #${ref}`,
    course ? `\nCourse details: ${siteUrl(settings, `/courses/${course.slug}`)}` : "",
    "",
    `WhatsApp: ${wa}`,
    `Call: ${settings.contact.phone}`,
    "",
    `${settings.name} · ${fullAddress(settings.contact)}`,
  ]
    .filter((l) => l !== "")
    .join("\n");

  return {
    subject: `We've received your enquiry, ${name} — ${settings.name}`,
    html: shell({ title: `Enquiry received — ${settings.name}`, preheader: `Your enquiry for ${enquiry.course} is in. A counsellor will call you soon.`, body, settings }),
    text,
  };
}

/* ───────────── 2. alert to the admin ───────────── */

export function adminEmail(enquiry: Enquiry, settings: SiteSettings) {
  const digits = enquiry.mobile.replace(/\D/g, "");
  const intl = digits.length === 10 ? `91${digits}` : digits;
  const waStudent = `https://wa.me/${intl}?text=${encodeURIComponent(
    `Hi ${firstName(enquiry.name)}, this is ${settings.name}. Thanks for your enquiry about ${enquiry.course}!`
  )}`;
  const mailto = `mailto:${enquiry.email}?subject=${encodeURIComponent(`Your enquiry about ${enquiry.course} — ${settings.name}`)}`;
  const when = istTime(enquiry.createdAt);

  const body = `
    <tr><td class="yx-pad yx-up" style="padding:34px 36px 8px;">${eyebrow(`New enquiry · ${when}`, "#22d3ee")}</td></tr>
    <tr><td class="yx-pad yx-up yx-d1" style="padding:14px 36px 4px;font-family:${FONT};">
      <h1 class="yx-h1" style="margin:0;font-size:26px;line-height:33px;font-weight:800;color:#ffffff;">${esc(enquiry.name)} wants to join <span style="color:${C.accent};">${esc(enquiry.course)}</span></h1>
      <p style="margin:10px 0 0;font-size:15px;line-height:23px;color:${C.muted};">Reach out while the interest is fresh — one tap below.</p>
    </td></tr>
    <tr><td class="yx-pad yx-up yx-d2" style="padding:20px 36px 6px;">
      ${buttons([button(`tel:+${intl}`, "Call now", C.primary), button(waStudent, "WhatsApp", C.whatsapp), button(mailto, "Reply by email", "", true)])}
    </td></tr>
    <tr><td class="yx-pad yx-up yx-d3" style="padding:18px 36px 22px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.panel};border:1px solid ${C.line};border-radius:16px;">
        ${detailRows([
          ["Name", esc(enquiry.name)],
          ["Mobile", `<a href="tel:+${intl}" style="color:${C.accent};">${esc(enquiry.mobile)}</a>`],
          ["Email", `<a href="${esc(mailto)}" style="color:${C.accent};">${esc(enquiry.email)}</a>`],
          ["Course", esc(enquiry.course)],
          ["Message", enquiry.message ? nl2br(enquiry.message) : `<span style="color:#64748b;">—</span>`],
          ["Received", esc(when) + " IST"],
          ["Source", esc(enquiry.source)],
          ["Reference", `<span style="font-family:Consolas,monospace;">#${enquiry.id.slice(0, 8).toUpperCase()}</span>`],
        ])}
      </table>
    </td></tr>
    <tr><td class="yx-pad yx-up yx-d4" style="padding:0 36px 30px;">
      ${buttons([button(siteUrl(settings, "/admin/enquiries"), "Open in admin panel &rarr;", "", true)])}
    </td></tr>`;

  const text = [
    `New enquiry — ${when} IST`,
    "",
    `Name: ${enquiry.name}`,
    `Mobile: ${enquiry.mobile}`,
    `Email: ${enquiry.email}`,
    `Course: ${enquiry.course}`,
    `Message: ${enquiry.message || "—"}`,
    `Reference: #${enquiry.id.slice(0, 8).toUpperCase()}`,
    "",
    `WhatsApp the student: ${waStudent}`,
    `Admin panel: ${siteUrl(settings, "/admin/enquiries")}`,
  ].join("\n");

  return {
    subject: `New enquiry: ${enquiry.name} — ${enquiry.course}`.replace(/[\r\n]+/g, " "),
    html: shell({ title: "New enquiry", preheader: `${enquiry.name} · ${enquiry.mobile} · ${enquiry.course}`, body, settings }),
    text,
  };
}

/* ───────────── 3. admin sign-in code (OTP) ───────────── */

export function otpEmail(
  code: string,
  adminName: string,
  settings: SiteSettings,
  meta: { ip: string; at: string; minutes: number }
) {
  const digits = code
    .split("")
    .map(
      (d) =>
        `<td style="padding:0 4px;"><div style="width:46px;height:58px;border-radius:12px;border:1px solid ${C.accent};background:${C.panel};text-align:center;line-height:58px;font-family:Consolas,'Courier New',monospace;font-size:30px;font-weight:700;color:#ffffff;">${esc(d)}</div></td>`
    )
    .join("");

  const body = `
    <tr><td class="yx-pad yx-up" style="padding:34px 36px 8px;">${eyebrow("Admin sign-in", "#22d3ee")}</td></tr>
    <tr><td class="yx-pad yx-up yx-d1" style="padding:14px 36px 4px;font-family:${FONT};">
      <h1 class="yx-h1" style="margin:0;font-size:26px;line-height:33px;font-weight:800;color:#ffffff;">Your sign-in code</h1>
      <p style="margin:10px 0 0;font-size:15px;line-height:23px;color:${C.text};">Hi ${esc(firstName(adminName))}, enter this code to finish signing in to the ${esc(settings.name)} admin panel.</p>
    </td></tr>
    <tr><td class="yx-pad yx-up yx-d2" align="center" style="padding:24px 36px 8px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${digits}</tr></table>
      <p style="margin:14px 0 0;font-family:${FONT};font-size:13px;color:${C.muted};">Expires in ${meta.minutes} minutes · works once</p>
    </td></tr>
    <tr><td class="yx-pad yx-up yx-d3" style="padding:22px 36px 30px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.panel};border:1px solid ${C.line};border-radius:14px;">
        <tr><td style="padding:14px 18px;font-family:${FONT};font-size:13px;line-height:20px;color:${C.muted};">
          <strong style="color:${C.text};">Didn't try to sign in?</strong> Someone has your password — change it right away in the admin panel and ignore this code.<br>
          Request: ${esc(meta.at)} IST · IP ${esc(meta.ip)}
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-family:${FONT};font-size:12px;color:#64748b;">Never share this code. ${esc(settings.name)} staff will never ask you for it.</p>
    </td></tr>`;

  return {
    subject: `${code} is your ${settings.name} admin sign-in code`,
    html: shell({ title: "Your sign-in code", preheader: `Your code is ${code}. It expires in ${meta.minutes} minutes.`, body, settings }),
    text: `Your ${settings.name} admin sign-in code: ${code}\nIt expires in ${meta.minutes} minutes and works once.\n\nRequest: ${meta.at} IST · IP ${meta.ip}\nDidn't try to sign in? Change your password right away.`,
  };
}
