"use client";

import { useState } from "react";
import { Check, Triangle, ChevronDown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScoreGauge } from "@/components/analysis/score-gauge";
import { ScoreBreakdown } from "@/components/analysis/score-breakdown";
import type { AnalysisResult } from "@/types/resume";

function scoreInterpretation(totalScore: number, missing: AnalysisResult["missingSkills"]) {
  const highMissing = missing.filter((m) => m.priority === "H").map((m) => m.skill);
  const opener =
    totalScore >= 80
      ? "Excellent match."
      : totalScore >= 65
        ? "Strong match."
        : totalScore >= 50
          ? "Good match — with room to improve."
          : "Significant gaps detected.";
  if (highMissing.length === 0) {
    return `${opener} Your skills and experience align well with this role.`;
  }
  return `${opener} Your experience aligns well with the role, but ${highMissing.join(" and ")} ${highMissing.length === 1 ? "is" : "are"} missing and listed as required.`;
}

/**
 * Pure presentation component — receives an already-loaded, already
 * ownership-checked `AnalysisResult` from the server page. All the tab
 * state, animations, and expandable bullet cards below stay client-side
 * (that's genuinely interactive UI), but the data itself always comes
 * from a real source: either a fetched DB row (production) or the demo
 * dataset (the landing page's "Try Demo" path) — never a hardcoded
 * fallback baked into this component.
 */
const TAB_IDS = ["overview", "skills", "gaps", "bullets", "recommendations", "interview"] as const;
export type AnalysisTab = (typeof TAB_IDS)[number];

export function isAnalysisTab(value: string | undefined): value is AnalysisTab {
  return !!value && (TAB_IDS as readonly string[]).includes(value);
}

export function AnalysisView({
  analysis: a,
  initialTab = "overview",
}: {
  analysis: AnalysisResult;
  initialTab?: AnalysisTab;
}) {
  return (
    <div className="space-y-6">
      {/* Score hero */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-8 pt-6">
          <ScoreGauge score={a.totalScore} />
          <div className="min-w-[200px] flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-foreground">{a.jobTitle}</h1>
              <span className="text-sm text-muted-foreground/70">@ {a.company}</span>
            </div>
            <div className="mb-4 text-[0.8125rem] text-muted-foreground/70">
              Candidate: <strong className="text-muted-foreground">{a.candidateName}</strong>
            </div>
            <p className="mb-5 rounded-lg border border-white/[0.04] border-l-2 border-l-primary bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              {scoreInterpretation(a.totalScore, a.missingSkills)}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox value={a.matchedSkills.length} label="Matched Skills" color="text-[#10B981]" />
              <StatBox value={a.missingSkills.length} label="Missing Skills" color="text-[#EF4444]" />
              <StatBox value={a.weakSkills.length} label="Partial Matches" color="text-[#F59E0B]" />
              <StatBox value={`${a.estimatedYears}y`} label="Exp. Detected" color="text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={initialTab}>
        <TabsList>
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="skills">🎯 Skills</TabsTrigger>
          <TabsTrigger value="gaps">💪 Strengths &amp; Gaps</TabsTrigger>
          <TabsTrigger value="bullets">✏️ Bullet Coach</TabsTrigger>
          <TabsTrigger value="recommendations">💡 Recommendations</TabsTrigger>
          <TabsTrigger value="interview">🎤 Interview Prep</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <SectionHeader title="Score Breakdown" badge="100 pts total" />
                <ScoreBreakdown scores={a.scores} maxScores={a.maxScores} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <SectionHeader title="Experience Match" />
                <div className="space-y-2 text-sm">
                  <div className="text-muted-foreground">
                    Detected: <strong className="text-foreground">{a.estimatedYears} yrs</strong>
                  </div>
                  <div className="text-muted-foreground">
                    Required: <strong className="text-foreground">{a.requiredYears} yrs</strong>
                  </div>
                  <Badge variant={a.estimatedYears >= a.requiredYears ? "success" : "warning"}>
                    {a.estimatedYears >= a.requiredYears ? "✓ Meets requirement" : "△ Below requirement"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <SectionHeader title="Matched Skills" badge={`${a.matchedSkills.length} matched`} badgeVariant="success" />
              <div className="flex flex-wrap gap-2">
                {a.matchedSkills.map((s) => (
                  <Badge key={s.skill} variant="success">
                    <Check className="size-3" /> {s.skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {a.weakSkills.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <SectionHeader title="Partial / Contextual Matches" badge={`${a.weakSkills.length}`} badgeVariant="warning" />
                <p className="mb-3 text-sm text-muted-foreground/70">
                  Found in your resume but not listed as a core skill.
                </p>
                <div className="flex flex-wrap gap-2">
                  {a.weakSkills.map((s) => (
                    <Badge key={s.skill} variant="warning">
                      <Triangle className="size-3" /> {s.skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <SectionHeader title="Missing Skills" badge={`${a.missingSkills.length} missing`} badgeVariant="destructive" />
              <div className="space-y-2.5">
                {a.missingSkills.map((s) => (
                  <div
                    key={s.skill}
                    className="flex items-start justify-between gap-4 rounded-xl border border-destructive/10 bg-destructive/[0.03] px-4 py-3.5"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-foreground">{s.skill}</div>
                      {s.whyItMatters && (
                        <div className="mt-1 text-[0.8125rem] text-muted-foreground/70">
                          Why it matters: {s.whyItMatters}
                        </div>
                      )}
                      {s.howToDemonstrate && (
                        <div className="mt-1 text-[0.8125rem] text-muted-foreground/70">
                          How to show it: {s.howToDemonstrate}
                        </div>
                      )}
                    </div>
                    <Badge variant={s.priority === "H" ? "destructive" : s.priority === "M" ? "warning" : "success"}>
                      {s.priority === "H" ? "HIGH" : s.priority === "M" ? "MEDIUM" : "LOW"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <SectionHeader title="Resume Strengths" badge={`${a.strengths.length}`} badgeVariant="success" />
                <div className="space-y-2.5">
                  {a.strengths.map((s) => (
                    <div key={s.title} className="flex gap-3 rounded-xl border border-[#10B981]/10 bg-[#10B981]/[0.03] px-4 py-3.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#10B981]" />
                      <div>
                        <div className="text-sm font-semibold text-foreground">{s.title}</div>
                        <div className="mt-0.5 text-[0.8125rem] text-muted-foreground/70">{s.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <SectionHeader title="Areas to Strengthen" badge={`${a.weaknesses.length}`} badgeVariant="warning" />
                <div className="space-y-2.5">
                  {a.weaknesses.map((w) => (
                    <div key={w.title} className="flex gap-3 rounded-xl border border-[#F59E0B]/10 bg-[#F59E0B]/[0.03] px-4 py-3.5">
                      <Triangle className="mt-0.5 size-4 shrink-0 text-[#F59E0B]" />
                      <div>
                        <div className="text-sm font-semibold text-foreground">{w.title}</div>
                        <div className="mt-0.5 text-[0.8125rem] text-muted-foreground/70">{w.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bullets">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <SectionHeader title="Resume Bullet Analysis" badge={`${a.bulletAnalysis.length} analyzed`} />
              <p className="mb-1 text-sm text-muted-foreground/70">
                Click any bullet to see the AI-improved version. Metrics marked [X]% are
                placeholders — fill in your real numbers.
              </p>
              {a.bulletAnalysis.map((b, i) => (
                <BulletItem key={i} item={b} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardContent className="pt-6">
              <SectionHeader title="AI Recommendations" badge={`${a.recommendations.length} actions`} />
              {(["HIGH", "MEDIUM", "LOW"] as const).map((priority) => {
                const items = a.recommendations.filter((r) => r.priority === priority);
                if (!items.length) return null;
                const dot = priority === "HIGH" ? "#EF4444" : priority === "MEDIUM" ? "#F59E0B" : "#10B981";
                return (
                  <div key={priority} className="mb-6 last:mb-0">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="size-1.5 rounded-full" style={{ background: dot }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: dot }}>
                        {priority === "HIGH" ? "High Priority" : priority === "MEDIUM" ? "Medium Priority" : "Low Priority"}
                      </span>
                      <Badge>{items.length}</Badge>
                    </div>
                    <div className="space-y-5 border-l-2 pl-4" style={{ borderColor: `${dot}30` }}>
                      {items.map((r) => (
                        <div key={r.title}>
                          <div className="mb-1.5 flex items-center gap-2">
                            <div className="text-sm font-semibold text-foreground">{r.title}</div>
                            <Badge variant="info">{r.category}</Badge>
                          </div>
                          <div className="mb-2 text-sm text-muted-foreground/70">{r.reason}</div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] p-2.5">
                              <div className="mb-1 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground/60">
                                Action
                              </div>
                              <div className="text-[0.8125rem] text-muted-foreground">{r.action}</div>
                            </div>
                            <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] p-2.5">
                              <div className="mb-1 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground/60">
                                Expected Impact
                              </div>
                              <div className="text-[0.8125rem] text-muted-foreground">{r.expectedImpact}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interview">
          <Card>
            <CardContent className="pt-6">
              <SectionHeader title="Personalized Interview Preparation" />
              <InterviewPrep set={a.interviewQuestions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatBox({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-center">
      <div className={`text-xl font-black leading-none ${color}`}>{value}</div>
      <div className="mt-1 text-[0.7rem] text-muted-foreground/60">{label}</div>
    </div>
  );
}

function SectionHeader({
  title,
  badge,
  badgeVariant = "default",
}: {
  title: string;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "destructive" | "info";
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="size-1.5 rounded-full bg-primary" />
      <h3 className="text-[0.95rem] font-semibold text-foreground">{title}</h3>
      {badge && (
        <Badge variant={badgeVariant} className="ml-auto">
          {badge}
        </Badge>
      )}
    </div>
  );
}

function BulletItem({ item }: { item: AnalysisResult["bulletAnalysis"][number] }) {
  const [open, setOpen] = useState(false);
  const scoreColor = item.qualityScore >= 7 ? "#10B981" : item.qualityScore >= 5 ? "#F59E0B" : "#EF4444";

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#12122A]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.02]"
      >
        <span className="flex-1 truncate text-sm italic text-muted-foreground/70">
          {item.original.slice(0, 90)}
          {item.original.length > 90 ? "…" : ""}
        </span>
        <span className="flex shrink-0 items-center gap-2.5">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-12 overflow-hidden rounded-full bg-white/[0.06]">
              <span
                className="block h-full rounded-full"
                style={{ width: `${item.qualityScore * 10}%`, background: scoreColor }}
              />
            </span>
            <span className="text-xs font-bold" style={{ color: scoreColor }}>
              {item.qualityScore}/10
            </span>
          </span>
          <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <div className="border-t border-white/[0.04] px-4 pb-4 pt-3.5">
          {(item.strengths.length > 0 || item.issues.length > 0) && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {item.strengths.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-[#10B981]/15 bg-[#10B981]/[0.07] px-2 py-1 text-xs text-[#6EE7B7]"
                >
                  ✓ {s}
                </span>
              ))}
              {item.issues.map((iss) => (
                <span
                  key={iss}
                  className="rounded-md border border-destructive/15 bg-destructive/[0.07] px-2 py-1 text-xs text-destructive/90"
                >
                  {iss}
                </span>
              ))}
            </div>
          )}
          <div className="rounded-lg border border-[#10B981]/15 bg-[#10B981]/[0.05] p-3.5">
            <div className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-wider text-[#10B981]">
              ✓ AI-Improved Version
            </div>
            <div className="text-sm leading-relaxed text-[#6EE7B7]">{item.suggestedRewrite}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function InterviewPrep({ set }: { set: AnalysisResult["interviewQuestions"] }) {
  const categories: { key: keyof typeof set; label: string }[] = [
    { key: "technical", label: "💻 Technical" },
    { key: "behavioral", label: "🤝 Behavioral" },
    { key: "project", label: "🏗️ Project" },
    { key: "systemDesign", label: "🏛️ System Design" },
    { key: "resume", label: "📋 Resume" },
  ];

  return (
    <Tabs defaultValue="technical">
      <TabsList>
        {categories.map((c) => (
          <TabsTrigger key={c.key} value={c.key}>
            {c.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {categories.map((c) => (
        <TabsContent key={c.key} value={c.key} className="space-y-5">
          {set[c.key].map((q, i) => (
            <div key={i} className="border-b border-white/[0.04] pb-5 last:border-0">
              <div className="mb-3 flex gap-2.5">
                <span className="mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[0.68rem] font-bold text-primary">
                  {i + 1}
                </span>
                <p className="text-sm font-medium leading-relaxed text-foreground">{q.question}</p>
              </div>
              <div className="ml-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] p-2.5">
                  <div className="mb-1 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground/60">
                    Why you&apos;ll be asked
                  </div>
                  <div className="text-[0.8125rem] text-muted-foreground">{q.whyAsked}</div>
                </div>
                <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] p-2.5">
                  <div className="mb-1 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground/60">
                    What&apos;s being tested
                  </div>
                  <div className="text-[0.8125rem] text-muted-foreground">{q.whatTested}</div>
                </div>
              </div>
              {q.prepTopics.length > 0 && (
                <div className="ml-8 mt-2.5 flex flex-wrap gap-1.5">
                  {q.prepTopics.map((t) => (
                    <Badge key={t} variant="info">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}
