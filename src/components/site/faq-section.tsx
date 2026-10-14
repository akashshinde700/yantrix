"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { faqs } from "@/lib/data";
import { whatsappUrl } from "@/lib/site-config";

export function FaqSection() {
  return (
    <section id="faqs" className="scroll-mt-24 bg-white py-16 sm:py-20" aria-labelledby="faq-heading">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <SectionHeading
            align="left"
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Quick, direct answers about Yantrix Technology — our training modes, courses and placement support."
          />
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
              <p className="text-sm font-semibold text-emerald-900">Still have a question?</p>
              <p className="mt-1 text-sm leading-relaxed text-emerald-800">
                Message us on WhatsApp — we usually reply within a few hours during working days.
              </p>
              <a
                href={whatsappUrl("Hello Yantrix Technology, I have a question about your courses.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-emerald-500 px-5 text-sm font-bold text-white transition-colors hover:bg-emerald-600"
              >
                <WhatsAppIcon className="h-4.5 w-4.5" />
                Ask on WhatsApp
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.question}
                value={`faq-${i}`}
                className="card-glow rounded-2xl border border-slate-200/90 bg-slate-50/60 px-5 mb-3 last:border-b last:border-slate-200/90 data-[state=open]:border-cyber-400/50 data-[state=open]:bg-brand-50/50 data-[state=open]:shadow-[0_0_22px_-6px_rgba(34,211,238,0.35)]"
              >
                <AccordionTrigger className="py-4 text-left text-[15px] font-bold text-ink hover:no-underline hover:text-brand-700 [&>svg]:text-brand-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed text-slate-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
