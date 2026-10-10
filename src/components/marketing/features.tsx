"use client";

import { motion } from "framer-motion";
import { Check, X, Triangle, PenLine, Lightbulb, Mic } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ATS_ROWS = [
  { label: "Skill Match", value: "27/30", pct: 90 },
  { label: "Experience", value: "16/20", pct: 80 },
  { label: "Keywords", value: "12/15", pct: 82 },
  { label: "Projects", value: "9/10", pct: 90 },
  { label: "Education", value: "9/10", pct: 90 },
];

const MATCHED_SKILLS = ["Python", "React", "FastAPI", "PostgreSQL", "Redis", "TypeScript", "pgvector"];

const SUPPORT_CARDS = [
  {
    icon: PenLine,
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Bullet Coach",
    desc: "AI rewrites weak bullets with stronger verbs and specific context. Uses [X]% placeholders where metrics are unknown — never invents fake numbers.",
  },
  {
    icon: Lightbulb,
    bg: "bg-[#10B981]/10",
    color: "text-[#10B981]",
    title: "Smart Recommendations",
    desc: "6-8 specific, ranked, actionable next steps tied to your actual resume and the specific job. Not generic advice.",
  },
  {
    icon: Mic,
    bg: "bg-[#06B6D4]/10",
    color: "text-[#06B6D4]",
    title: "Interview Preparation",
    desc: "Personalized questions with why it's likely to be asked, what's being tested, and suggested prep topics.",
  },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Features() {
  return (
    <section id="features" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
            Capabilities
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Built different — not just an AI wrapper
          </h2>
          <p className="mt-3.5 text-muted-foreground">
            Every feature is backed by structured extraction, deterministic scoring
            logic, and explainable results.
          </p>
        </div>

        {/* Feature 1 — ATS Intelligence */}
        <FadeIn>
          <div className="mb-5 grid grid-cols-1 items-center gap-8 rounded-[20px] border border-white/[0.06] bg-card p-6 md:grid-cols-2 md:gap-14 md:p-9">
            <div>
              <Badge variant="info" className="mb-3.5">
                🎯 Core Feature
              </Badge>
              <h3 className="mb-3 text-[1.3rem] font-bold tracking-tight text-foreground">
                Explainable ATS Intelligence
              </h3>
              <p className="mb-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
                Scoring across 7 weighted dimensions — skill match, experience,
                keywords, projects, education, structure, and formatting. You see
                exactly why you scored what you scored. No black boxes, no mystery
                numbers.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="info">30pts — Skill Match</Badge>
                <Badge variant="info">20pts — Experience</Badge>
                <Badge variant="info">15pts — Keywords</Badge>
                <Badge>+ 4 more</Badge>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-background p-5">
              <div className="mb-1 space-y-2.5">
                {ATS_ROWS.map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <div className="w-24 shrink-0 text-[0.8rem] text-muted-foreground">
                      {r.label}
                    </div>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-[#8B5CF6]"
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                    <div className="w-10 shrink-0 text-right text-[0.8rem] font-semibold text-[#10B981]">
                      {r.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-[10px] border border-[#10B981]/15 bg-[#10B981]/[0.07] px-3.5 py-3">
                <span className="text-sm font-semibold text-muted-foreground">
                  Total ATS Score
                </span>
                <span className="text-2xl font-black text-[#10B981]">84/100</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Feature 2 — Semantic Skill Matching (reversed) */}
        <FadeIn delay={0.08}>
          <div className="mb-5 grid grid-cols-1 items-center gap-8 rounded-[20px] border border-white/[0.06] bg-card p-6 md:grid-cols-2 md:gap-14 md:p-9">
            <div className="order-2 rounded-2xl border border-white/[0.06] bg-background p-5 md:order-1">
              <div className="mb-2.5 text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground/70">
                Skill Analysis Preview
              </div>
              <div className="mb-3.5 flex flex-wrap gap-1.5">
                {MATCHED_SKILLS.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full border border-[#10B981]/18 bg-[#10B981]/10 px-2.5 py-0.5 text-xs font-medium text-[#10B981]"
                  >
                    <Check className="size-3" /> {s}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-full border border-[#EF4444]/18 bg-[#EF4444]/10 px-2.5 py-0.5 text-xs font-medium text-[#EF4444]">
                  <X className="size-3" /> Kubernetes
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#F59E0B]/18 bg-[#F59E0B]/10 px-2.5 py-0.5 text-xs font-medium text-[#F59E0B]">
                  <Triangle className="size-3" /> Elasticsearch
                </span>
              </div>
              <div className="rounded-lg border border-[#EF4444]/14 bg-[#EF4444]/[0.06] p-3.5">
                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[#EF4444]">
                  Missing — HIGH Priority
                </div>
                <div className="text-[0.8125rem] text-muted-foreground">
                  Kubernetes:{" "}
                  <span className="text-muted-foreground/70">
                    Explicitly required. Mentioned 4× in the job description.
                  </span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <Badge variant="info" className="mb-3.5">
                🔍 AI Feature
              </Badge>
              <h3 className="mb-3 text-[1.3rem] font-bold tracking-tight text-foreground">
                Semantic Skill Matching
              </h3>
              <p className="mb-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
                Goes beyond keyword matching. Understands context — &quot;built
                distributed systems&quot; maps to &quot;microservices
                experience&quot; even without exact words. Weak and partial
                matches are surfaced separately so you know where to strengthen
                your resume language.
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-[#10B981]" /> Exact and
                  contextual matching combined
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-[#10B981]" /> Priority-
                  ranked missing skills with explanations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-[#10B981]" /> Required
                  vs preferred skill differentiation
                </li>
              </ul>
            </div>
          </div>
        </FadeIn>

        {/* Support cards */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORT_CARDS.map((c, i) => (
            <FadeIn key={c.title} delay={0.05 * i}>
              <div className="h-full rounded-2xl border border-white/[0.06] bg-card p-5.5 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_12px_36px_rgba(0,0,0,0.22)]">
                <div
                  className={`mb-3.5 flex size-10 items-center justify-center rounded-[10px] ${c.bg} ${c.color}`}
                >
                  <c.icon className="size-5" />
                </div>
                <div className="mb-1.5 text-[0.9375rem] font-semibold text-foreground">
                  {c.title}
                </div>
                <div className="text-[0.8125rem] leading-relaxed text-muted-foreground/70">
                  {c.desc}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
