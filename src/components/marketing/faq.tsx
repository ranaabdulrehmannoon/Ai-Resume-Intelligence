"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "How is the ATS score calculated?",
    a: "Your score comes from a deterministic scoring engine, not the AI model — it combines skill match (30%), experience (20%), keyword coverage (15%), project relevance (10%), education (10%), resume structure (10%), and formatting (5%) into a transparent 100-point total. The AI only generates the explanations, never the number itself.",
  },
  {
    q: "Does the AI invent metrics or fabricate experience?",
    a: "No. Bullet point suggestions use [X]% or [N] placeholders wherever a real metric is unknown — you fill in your actual numbers. Recommendations never suggest adding skills or experience you don't have.",
  },
  {
    q: "What file formats can I upload?",
    a: "PDF and DOCX are supported for resume uploads. You can also paste plain text directly for either the resume or the job description.",
  },
  {
    q: "Is my resume data private?",
    a: "Yes. Your resumes, job descriptions, and analyses are tied to your account and are never shared with other users or used to train models.",
  },
  {
    q: "Can I analyze the same resume against multiple jobs?",
    a: "Yes — upload one resume once, then run it against as many job descriptions as you like. Every analysis is saved to your history so you can track improvements over time.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
            FAQ
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl border border-white/[0.06] bg-card px-5"
            >
              <AccordionTrigger className="py-4.5 text-left text-[0.9375rem] font-semibold text-foreground hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4.5 text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
