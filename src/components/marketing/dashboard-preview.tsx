"use client";

import { motion } from "framer-motion";
import { Check, X, Triangle } from "lucide-react";

const MATCHED = ["Python", "React", "FastAPI", "PostgreSQL", "pgvector", "TypeScript"];
const BARS = [
  { label: "Skill Match", value: "27/30", pct: 90 },
  { label: "Experience", value: "16/20", pct: 80 },
  { label: "Keywords", value: "12/15", pct: 82 },
];

export function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
      className="relative mx-auto mt-14 w-full max-w-[500px] rounded-[20px] border border-white/10 bg-card p-5 text-left shadow-[0_40px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)]"
    >
      <div className="pointer-events-none absolute -top-px left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="mb-4 flex items-center justify-between border-b border-white/[0.04] pb-3.5">
        <div>
          <div className="text-[0.8rem] font-semibold text-foreground">
            Senior Full-Stack Engineer
          </div>
          <div className="text-[0.72rem] text-muted-foreground">
            TechVenture AI · Analyzed just now
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#10B981]/20 bg-[#10B981]/10 px-3 py-1">
          <span className="text-[1.15rem] font-black leading-none text-[#10B981]">87</span>
          <span className="text-[0.62rem] font-semibold leading-tight text-[#10B981]">
            / 100
            <br />
            Strong
          </span>
        </div>
      </div>

      <div className="mb-2 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground/70">
        Matched Skills
      </div>
      <div className="mb-3.5 flex flex-wrap gap-1.5">
        {MATCHED.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 rounded-full border border-[#10B981]/18 bg-[#10B981]/10 px-2 py-0.5 text-[0.72rem] font-medium text-[#10B981]"
          >
            <Check className="size-2.5" /> {s}
          </span>
        ))}
        <span className="inline-flex items-center gap-1 rounded-full border border-[#EF4444]/18 bg-[#EF4444]/10 px-2 py-0.5 text-[0.72rem] font-medium text-[#EF4444]">
          <X className="size-2.5" /> Kubernetes
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#F59E0B]/18 bg-[#F59E0B]/10 px-2 py-0.5 text-[0.72rem] font-medium text-[#F59E0B]">
          <Triangle className="size-2.5" /> Elasticsearch
        </span>
      </div>

      <div className="mb-2 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground/70">
        Score Breakdown
      </div>
      <div className="space-y-1.5">
        {BARS.map((b) => (
          <div key={b.label} className="flex items-center gap-2.5">
            <div className="w-20 shrink-0 text-[0.72rem] text-muted-foreground/70">
              {b.label}
            </div>
            <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-white/[0.05]">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${b.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-[#8B5CF6]"
              />
            </div>
            <div className="w-8 shrink-0 text-right text-[0.72rem] font-semibold text-muted-foreground">
              {b.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-[#EF4444]/14 bg-[#EF4444]/[0.06] px-3 py-2.5">
        <div className="size-1.5 shrink-0 rounded-full bg-[#EF4444]" />
        <div className="text-[0.76rem] text-[#FCA5A5]">
          <strong>HIGH:</strong> Kubernetes not found — required by this role.
        </div>
      </div>
    </motion.div>
  );
}
