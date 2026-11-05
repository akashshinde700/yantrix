"use client";

import { useState } from "react";
import { CheckCircle2, Download, Loader2, Lock } from "lucide-react";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Remembered per browser, so a student who already filled the form isn't asked twice. */
const LEAD_KEY = "yantrix_syllabus_lead";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80, "Name is too long."),
  mobile: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s\-()]/g, ""))
    .pipe(z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number.")),
  email: z.email("Please enter a valid email address."),
});

type Fields = { name: string; mobile: string; email: string };
type Errors = Partial<Record<keyof Fields | "form", string>>;

function hasLead(): boolean {
  try {
    return Boolean(localStorage.getItem(LEAD_KEY));
  } catch {
    return false;
  }
}

function startDownload(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = url.split("/").pop() || "syllabus.pdf";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * A syllabus download that first asks for name, mobile and email. The details
 * go through the same /api/contact endpoint as the contact form, so the lead
 * lands in Admin → Enquiries and both enquiry emails are sent; only then does
 * the PDF download.
 */
export function GatedDownload({
  url,
  label,
  course,
  className,
  children,
}: {
  url: string;
  label: string;
  course: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<Fields>({ name: "", mobile: "", email: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const onClick = () => {
    if (hasLead()) {
      startDownload(url);
      return;
    }
    setDone(false);
    setErrors({});
    setOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(fields);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Fields;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          course,
          message: `Syllabus download: ${label}`,
          source: "syllabus",
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setErrors({ form: data.error || "Could not submit. Please try again." });
        return;
      }
      try {
        localStorage.setItem(LEAD_KEY, new Date().toISOString());
      } catch {
        /* private mode: they'll be asked again next time */
      }
      setDone(true);
      startDownload(url);
    } catch {
      setErrors({ form: "Network error. Please check your connection and try again." });
    } finally {
      setSending(false);
    }
  };

  const input = (key: keyof Fields, labelText: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={`sg-${key}`} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
        {labelText}
      </label>
      <input
        id={`sg-${key}`}
        value={fields[key]}
        onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `sg-${key}-error` : undefined}
        className={cn(
          "h-11 w-full rounded-xl border bg-white/[0.04] px-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyber-300/70 focus:ring-2 focus:ring-cyber-300/20",
          errors[key] ? "border-rose-400/70" : "border-white/15"
        )}
        {...props}
      />
      {errors[key] ? (
        <p id={`sg-${key}-error`} className="mt-1 text-xs font-medium text-rose-300">
          {errors[key]}
        </p>
      ) : null}
    </div>
  );

  return (
    <>
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-lenis-prevent
          className="max-h-[90svh] overflow-y-auto border-white/10 bg-[#070d22] text-white sm:max-w-md"
        >
          {done ? (
            <div className="py-4 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" aria-hidden="true" />
              <DialogTitle className="mt-3 text-xl font-extrabold">Your syllabus is downloading</DialogTitle>
              <DialogDescription className="mt-2 text-sm text-slate-300">
                Thank you, {fields.name.split(" ")[0]}! Our counsellor will contact you soon about {course}.
              </DialogDescription>
              <button
                type="button"
                onClick={() => startDownload(url)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:border-cyber-300/60 hover:bg-white/10"
              >
                <Download className="h-4 w-4" aria-hidden="true" /> Download again
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-4">
              <div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-300/10 text-cyber-300">
                  <Lock className="h-5 w-5" aria-hidden="true" />
                </span>
                <DialogTitle className="mt-3 text-xl font-extrabold">Get the {course} syllabus</DialogTitle>
                <DialogDescription className="mt-1 text-sm text-slate-300">
                  Share your details and the syllabus PDF downloads right away.
                </DialogDescription>
              </div>
              {input("name", "Full name", { autoComplete: "name", placeholder: "Your name" })}
              {input("mobile", "Mobile number", { type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "10-digit mobile" })}
              {input("email", "Email", { type: "email", autoComplete: "email", placeholder: "you@example.com" })}
              {errors.form ? (
                <p role="alert" className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300">
                  {errors.form}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={sending}
                className="btn-futur inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white disabled:opacity-70"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
                Submit &amp; download syllabus
              </button>
              <p className="text-center text-[11px] text-slate-500">
                We use these details only to contact you about admissions.
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
