"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardPreview } from "./dashboard-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-36 text-center md:pt-40">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[800px] w-[1100px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.05) 35%, transparent 65%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.08] px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-widest text-[#818CF8]"
      >
        <span className="size-1.5 animate-pulse rounded-full bg-primary" />
        AI-Powered Resume Intelligence
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="mx-auto max-w-3xl text-[2.25rem] font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl"
      >
        Turn Your Resume Into
        <br />
        <span className="gradient-text">Your Competitive Advantage.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12 }}
        className="mx-auto mt-5 max-w-xl text-[1.05rem] leading-relaxed text-muted-foreground"
      >
        Analyze your resume against any job description, uncover skill gaps,
        improve your content, and prepare for the interview — powered by AI.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.18 }}
        className="mt-9 flex flex-wrap items-center justify-center gap-3"
      >
        <Button size="lg" asChild>
          <Link href="/register">
            <Search className="size-4" /> Analyze My Resume
          </Link>
        </Button>
        <Button size="lg" variant="secondary" asChild>
          <a href="#how-it-works">
            Explore the Platform <ArrowRight className="size-4" />
          </a>
        </Button>
      </motion.div>

      <DashboardPreview />
    </section>
  );
}
