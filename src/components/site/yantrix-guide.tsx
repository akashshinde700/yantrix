"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { useCollection, useSettings, useSiteContent } from "@/lib/content/provider";
import { fullAddress, phoneHref, whatsappUrl } from "@/lib/content/helpers";
import { useSiteStore } from "@/lib/store";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import type { Course, Faq, SiteView, TrainingMode } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/**
 * "Ask Yantra" — a small course guide in the style of an AI assistant.
 *
 * It answers from the site's own content (courses, FAQs, training modes,
 * contact settings — all editable in /admin), so there is no API key or
 * per-message cost. Anything it can't answer is handed to WhatsApp.
 */

type Action = { label: string } & ({ view: SiteView } | { href: string });
interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  actions?: Action[];
}

const STOP = new Set(
  "a an the is are am i you me my we our to of for in on at and or do does can could will would should what which who how when where why it this that with about please tell kya hai hain ka ki ke ko me mujhe batao bataiye aap".split(
    " "
  )
);

const tokens = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));

const has = (q: string[], words: string[]) => q.some((w) => words.some((k) => w.startsWith(k)));

const QUICK = ["Which courses do you offer?", "What are the fees?", "Placement help?", "Online or offline?", "Contact & address"];

export function YantrixGuide() {
  const settings = useSettings();
  const content = useSiteContent();
  const courses = useCollection<Course>("courses");
  const faqs = useCollection<Faq>("faqs");
  const modes = useCollection<TrainingMode>("trainingModes");
  const navigate = useSiteStore((s) => s.navigate);

  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const wa = whatsappUrl(settings);
  const waAction: Action = { label: "Chat on WhatsApp", href: wa };

  const answer = useMemo(() => {
    return (raw: string): Omit<Message, "id" | "from"> => {
      const q = tokens(raw);
      const text = raw.toLowerCase();

      if (q.length === 0 || /^(hi|hello|hey|namaste|hii+|good (morning|evening|afternoon))\b/.test(text.trim())) {
        return {
          text: `Hi! I'm Yantra, the ${settings.name} guide. Ask me about courses, fees, placement support, batches or how to reach us.`,
        };
      }

      // A specific course?
      const scored = courses
        .map((c) => {
          const words = tokens(`${c.title} ${c.slug.replace(/-/g, " ")}`);
          const score = q.filter((w) => words.some((cw) => cw === w || (w.length > 3 && cw.startsWith(w)))).length;
          return { c, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score);

      const wantsFee = has(q, ["fee", "fees", "price", "cost", "kitn", "charge", "paise", "rupee"]);

      if (scored.length > 0 && scored[0].score >= 1 && !has(q, ["all", "list", "courses"])) {
        const c = scored[0].c;
        const parts = [
          `${c.title}: ${c.description}`,
          [c.duration && `Duration: ${c.duration}`, c.level && `Level: ${c.level}`, c.modes?.length && `Mode: ${c.modes.join(" / ")}`]
            .filter(Boolean)
            .join(" · "),
          c.fee ? `Fee: ${c.fee}` : wantsFee ? "For the current fee and any offers, message us on WhatsApp — we reply quickly." : "",
        ].filter(Boolean);
        return { text: parts.join("\n"), actions: [{ label: "See all courses", view: "courses" }, waAction] };
      }

      if (wantsFee) {
        const withFee = courses.filter((c) => c.fee);
        return {
          text:
            withFee.length > 0
              ? `Course fees:\n${withFee.map((c) => `• ${c.title} — ${c.fee}`).join("\n")}\nAsk on WhatsApp for current offers and EMI options.`
              : "Fees depend on the course and batch. Message us on WhatsApp and we'll share the latest fee and any offers.",
          actions: [waAction, { label: "View courses", view: "courses" }],
        };
      }

      if (has(q, ["course", "courses", "learn", "sikh", "program", "syllabus", "subject", "offer", "teach", "padh"])) {
        return {
          text: `We currently offer ${courses.length} courses:\n${courses
            .map((c) => `• ${c.title}${c.duration ? ` (${c.duration})` : ""}`)
            .join("\n")}\nAsk me about any of them for details.`,
          actions: [{ label: "Open courses page", view: "courses" }],
        };
      }

      if (has(q, ["online", "offline", "classroom", "batch", "mode", "timing", "weekend"])) {
        return {
          text:
            modes.length > 0
              ? modes.map((m) => `${m.name} — ${m.tagline}\n${m.points.map((p) => `• ${p}`).join("\n")}`).join("\n\n")
              : "We run both online and offline (classroom) batches.",
          actions: [{ label: "Enquire for a batch", view: "contact" }],
        };
      }

      if (has(q, ["contact", "phone", "call", "number", "address", "location", "kaha", "where", "visit", "email", "hours", "open", "map"])) {
        const c = settings.contact;
        return {
          text: [
            c.phone && `Phone: ${c.phone}`,
            c.email && `Email: ${c.email}`,
            fullAddress(c) && `Address: ${fullAddress(c)}`,
            c.hours && `Hours: ${c.hours}`,
          ]
            .filter(Boolean)
            .join("\n"),
          actions: [{ label: "Call now", href: phoneHref(settings) }, waAction, ...(c.mapLink ? [{ label: "Open map", href: c.mapLink }] : [])],
        };
      }

      // Best matching FAQ
      const best = faqs
        .map((f) => {
          const qw = tokens(f.question);
          const aw = tokens(f.answer);
          const score = q.reduce((s, w) => s + (qw.includes(w) ? 2 : 0) + (aw.includes(w) ? 0.5 : 0), 0);
          return { f, score };
        })
        .sort((a, b) => b.score - a.score)[0];
      if (best && best.score >= 2) {
        return { text: best.f.answer, actions: [waAction] };
      }

      if (has(q, ["placement", "job", "naukri", "interview", "resume", "salary", "hire", "career"])) {
        const s = content.sections.placement;
        return {
          text: `${s?.title ?? "Placement assistance"} — ${s?.description ?? "we help with resumes, interview preparation and your job search."}`,
          actions: [{ label: "Talk to a counsellor", view: "contact" }],
        };
      }

      return {
        text: "I don't have that answer yet — our counsellors can help you directly on WhatsApp.",
        actions: [waAction, { label: "Contact page", view: "contact" }],
      };
    };
  }, [courses, faqs, modes, settings, content.sections, waAction]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: nextId.current++,
          from: "bot",
          text: `Namaste! I'm Yantra, your guide at ${settings.name}. What would you like to know?`,
        },
      ]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open, messages.length, settings.name]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setMessages((m) => [...m, { id: nextId.current++, from: "user", text: trimmed }]);
    setInput("");
    setTyping(true);
    const reply = answer(trimmed);
    setTimeout(() => {
      setMessages((m) => [...m, { id: nextId.current++, from: "bot", ...reply }]);
      setTyping(false);
    }, 550 + Math.min(reply.text.length * 4, 700));
  };

  const runAction = (a: Action) => {
    if ("view" in a) {
      navigate(a.view);
      setOpen(false);
    } else {
      window.open(a.href, a.href.startsWith("tel:") ? "_self" : "_blank", "noopener");
    }
  };

  return (
    <>
      {/* launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="yantra-guide"
        className="group fixed bottom-4 left-4 z-40 flex items-center gap-2.5 rounded-full border border-white/10 bg-[#050a1c]/70 p-1.5 pr-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all hover:border-cyan-300/40 sm:bottom-5 sm:left-5 sm:pr-4"
      >
        <span className="yantra-orb relative h-9 w-9 rounded-full" aria-hidden="true" />
        <span className="hidden text-sm font-semibold text-white sm:inline">Ask Yantra</span>
        <span className="sr-only sm:hidden">Ask Yantra, the course guide</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.section
            id="yantra-guide"
            data-lenis-prevent
            aria-label="Ask Yantra — course guide"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed bottom-20 left-3 right-3 z-50 flex max-h-[min(560px,calc(100svh-7rem))] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#060b1e]/85 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_60px_-20px_rgba(34,211,238,0.45)] backdrop-blur-2xl sm:bottom-24 sm:left-5 sm:right-auto sm:w-[380px]"
          >
            <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <span className="yantra-orb relative h-10 w-10 shrink-0 rounded-full" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-300">Yantra</p>
                <p className="text-sm font-semibold text-slate-100">Your course guide</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close guide"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex flex-col gap-2", m.from === "user" ? "items-end" : "items-start")}>
                  <p
                    className={cn(
                      "max-w-[88%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                      m.from === "user"
                        ? "rounded-br-md bg-gradient-to-br from-brand-600 to-cyan-600 text-white"
                        : "rounded-bl-md border border-white/10 bg-white/[0.06] text-slate-200"
                    )}
                  >
                    {m.text}
                  </p>
                  {m.actions && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.actions.map((a) => (
                        <button
                          key={a.label}
                          type="button"
                          onClick={() => runAction(a)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-[12px] font-semibold text-cyan-100 transition-colors hover:bg-cyan-400/20"
                        >
                          {"href" in a && a.href.includes("wa.me") && <WhatsAppIcon className="h-3.5 w-3.5" />}
                          {a.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {typing && (
                <div className="flex w-14 items-center justify-center gap-1 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
              {QUICK.map((qText) => (
                <button
                  key={qText}
                  type="button"
                  onClick={() => ask(qText)}
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] text-slate-300 transition-colors hover:border-cyan-300/40 hover:text-white"
                >
                  {qText}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2 border-t border-white/10 p-3"
            >
              <label htmlFor="yantra-input" className="sr-only">
                Ask a question
              </label>
              <input
                id="yantra-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about courses, fees, placement…"
                autoComplete="off"
                className="h-10 flex-1 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/50 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Send"
                disabled={!input.trim() || typing}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-cyan-500 text-white transition-opacity disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
