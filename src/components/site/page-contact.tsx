"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Clock, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { HeroDecor } from "@/components/site/svg-decor";
import { useSiteStore } from "@/lib/store";
import { courses } from "@/lib/data";
import { siteConfig, whatsappUrl, phoneHref, emailHref } from "@/lib/site-config";

/* ── Validation schema (shared shape with the API route) ── */
const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name (at least 2 characters).")
    .max(80, "Name is too long."),
  email: z.email("Please enter a valid email address."),
  mobile: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s\-()]/g, ""))
    .pipe(
      z
        .string()
        .regex(
          /^(\+91)?[6-9]\d{9}$/,
          "Enter a valid 10-digit mobile number (with optional +91)."
        )
    ),
  course: z.string().min(1, "Please select the course you're interested in."),
  message: z
    .string()
    .trim()
    .max(1000, "Message is too long (max 1000 characters).")
    .optional()
    .or(z.literal("")),
});

type ContactFormValues = z.input<typeof contactFormSchema>;

const courseOptions = [...courses.map((c) => c.title), "General Enquiry / Not Sure Yet"];

const contactDetails = [
  { icon: Phone, label: "Phone", value: siteConfig.contact.phone, href: phoneHref },
  { icon: Mail, label: "Email", value: siteConfig.contact.email, href: emailHref },
  { icon: MapPin, label: "Address", value: siteConfig.contact.address, href: null },
  { icon: Clock, label: "Working Hours", value: siteConfig.contact.hours, href: null },
];

export function PageContact() {
  const preselectedCourse = useSiteStore((s) => s.preselectedCourse);
  const setPreselectedCourse = useSiteStore((s) => s.setPreselectedCourse);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      course: "",
      message: "",
    },
    mode: "onBlur",
  });

  /* When arriving via "Enquire Now", pre-fill the course field */
  useEffect(() => {
    if (preselectedCourse) {
      form.setValue("course", preselectedCourse, { shouldValidate: true });
      setPreselectedCourse(null);
    }
  }, [preselectedCourse, form, setPreselectedCourse]);

  async function onSubmit(values: ContactFormValues) {
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setSubmitted(true);
      form.reset();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Could not send your enquiry. Please try again."
      );
    }
  }

  return (
    <>
      {/* Page hero band */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-950 to-ink py-16 sm:py-20">
        <HeroDecor
          orbitClassName="-left-24 -top-20 h-72 w-72 text-brand-400/35"
          circuitClassName="absolute inset-x-0 bottom-0 h-36 w-full text-brand-400/25"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            dark
            align="left"
            eyebrow="Contact Us"
            title="Let's talk about your IT career"
            description="Send an enquiry about courses, batches or admissions — we usually respond within 24 hours (Mon–Sat)."
          />
        </div>
      </section>

      <section className="bg-slate-50 py-14 sm:py-16" aria-label="Contact form and details">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.5fr_1fr]">
          {/* ── Form card ── */}
          <Reveal>
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                    <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
                  </span>
                  <h2 className="mt-5 text-2xl font-extrabold text-ink">Enquiry received!</h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Thank you for contacting {siteConfig.name}. Our team will get back to you
                    within 24 hours (Mon–Sat). For a faster response, message us on WhatsApp.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <a
                      href={whatsappUrl("Hello Yantrix Technology, I just submitted an enquiry on your website.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-emerald-500 px-6 text-sm font-bold text-white transition-colors hover:bg-emerald-600"
                    >
                      <WhatsAppIcon className="h-4.5 w-4.5" />
                      Chat on WhatsApp
                    </a>
                    <Button
                      variant="outline"
                      onClick={() => setSubmitted(false)}
                      className="h-11 rounded-full border-brand-200 px-6 font-bold text-brand-700 hover:bg-brand-50"
                    >
                      Send Another Enquiry
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
                    Course Enquiry Form
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Fill in your details and we'll call or message you back.
                  </p>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="mt-6 space-y-5"
                      noValidate
                    >
                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Rahul Sharma"
                                  autoComplete="name"
                                  className="h-11"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="you@example.com"
                                  autoComplete="email"
                                  className="h-11"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="mobile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile Number *</FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  inputMode="tel"
                                  placeholder="e.g. 98765 43210"
                                  autoComplete="tel"
                                  className="h-11"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="course"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course Interested In *</FormLabel>
                              <Select
                                onValueChange={(value) =>
                                  form.setValue("course", value, { shouldValidate: true })
                                }
                                value={field.value ?? ""}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11 w-full">
                                    <SelectValue placeholder="Select a course">
                                      {field.value || "Select a course"}
                                    </SelectValue>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {courseOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Message <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us about your background, goals, or any questions about batches and timings…"
                                rows={4}
                                className="resize-none"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {serverError ? (
                        <p
                          role="alert"
                          className="rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive ring-1 ring-destructive/20"
                        >
                          {serverError}
                        </p>
                      ) : null}

                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="btn-shine h-12 w-full rounded-xl bg-brand-700 text-base font-bold shadow-lg shadow-brand-700/25 hover:bg-brand-800 sm:w-auto sm:px-10"
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                            Sending…
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4.5 w-4.5" aria-hidden="true" />
                            Send Enquiry
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </>
              )}
            </div>
          </Reveal>

          {/* ── Info column ── */}
          <div className="space-y-6">
            <Reveal delay={0.1}>
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
                <h2 className="text-lg font-extrabold text-ink">Contact Information</h2>
                <ul className="mt-5 space-y-4">
                  {contactDetails.map((detail) => (
                    <li key={detail.label} className="flex items-start gap-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                        <detail.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {detail.label}
                        </p>
                        {detail.href ? (
                          <a
                            href={detail.href}
                            className="mt-1 inline-block break-words text-sm font-semibold text-brand-700 underline-offset-4 transition-colors hover:text-brand-900 hover:underline"
                          >
                            {detail.value}
                          </a>
                        ) : (
                          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-700">
                            {detail.value}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 shadow-lg shadow-emerald-600/25 sm:p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                  <WhatsAppIcon className="h-6.5 w-6.5 text-white" />
                </span>
                <h2 className="mt-4 text-lg font-extrabold text-white">
                  Fastest way to reach us — WhatsApp
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-emerald-50">
                  Ask about courses, fees, batch timings or admission — chat with our counsellors
                  directly.
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-white ring-1 ring-white/20">
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                  {siteConfig.contact.phone}
                </p>
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-emerald-700 shadow-md transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Start WhatsApp Chat
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="rounded-3xl border border-brand-100 bg-brand-50/70 p-6">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-brand-900">
                  What happens after you enquire?
                </h2>
                <ol className="mt-4 space-y-3 text-sm text-brand-900/80">
                  {[
                    "We review your enquiry and goals",
                    "A counsellor contacts you within 24 hours (Mon–Sat)",
                    "We suggest the right course, mode and batch timing",
                  ].map((step, i) => (
                    <li key={step} className="flex items-start gap-2.5">
                      <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[11px] font-black text-white">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
