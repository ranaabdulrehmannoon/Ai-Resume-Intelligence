import type { Analysis, Resume, JobDescription } from "@prisma/client";
import type {
  AnalysisResult,
  SkillMatch,
  SkillGap,
  BulletAnalysisItem,
  Insight,
  Recommendation,
  InterviewQuestionSet,
  InterviewQuestion,
} from "@/types/resume";
import { estimateYearsOfExperience } from "@/lib/ai/services/scoring.service";
import type { StructuredResume } from "@/lib/ai/schemas/resume.schema";

/**
 * Single reconciliation point between the AI engine's storage shapes
 * (src/lib/ai/schemas/*, field names optimized for prompt clarity) and
 * the UI's display types (src/types/resume.ts, field names chosen for
 * the analysis dashboard). Keeping every rename in one place — rather
 * than teaching the AI schemas or the UI about each other's naming —
 * means either side can evolve independently.
 */
export function toAnalysisResult(
  analysis: Analysis,
  resume: Resume,
  job: JobDescription,
  structuredResume?: StructuredResume | null
): AnalysisResult {
  const missingSkills: SkillGap[] = asArray<{
    skill: string;
    tier: string;
    priority: string;
    whyItMatters?: string;
    howToDemonstrate?: string;
  }>(analysis.missingSkills).map((m) => ({
    skill: m.skill,
    tier: m.tier as SkillGap["tier"],
    priority: m.priority as SkillGap["priority"],
    whyItMatters: m.whyItMatters || undefined,
    howToDemonstrate: m.howToDemonstrate || undefined,
  }));

  const matchedSkills: SkillMatch[] = asArray<{ skill: string; tier: string }>(analysis.matchedSkills).map(
    (m) => ({ skill: m.skill, tier: m.tier as SkillMatch["tier"] })
  );

  const weakSkills: SkillMatch[] = asArray<{ skill: string; tier: string }>(analysis.weakSkills).map((m) => ({
    skill: m.skill,
    tier: m.tier as SkillMatch["tier"],
  }));

  const bulletAnalysis: BulletAnalysisItem[] = asArray<{
    original: string;
    issues: string[];
    strengths: string[];
    suggestedRewrite: string;
    qualityScore: number;
  }>(analysis.bulletAnalysis).map((b) => ({
    original: b.original,
    issues: b.issues ?? [],
    strengths: b.strengths ?? [],
    suggestedRewrite: b.suggestedRewrite ?? "",
    qualityScore: b.qualityScore,
  }));

  const strengths = asArray<Insight>(analysis.strengths);
  const weaknesses = asArray<Insight>(analysis.weaknesses);

  const recommendations: Recommendation[] = asArray<{
    priority: string;
    category: string;
    title: string;
    reason: string;
    action: string;
    expectedImpact: string;
  }>(analysis.recommendations).map((r) => ({
    priority: r.priority as Recommendation["priority"],
    category: r.category as Recommendation["category"],
    title: r.title,
    reason: r.reason,
    action: r.action,
    expectedImpact: r.expectedImpact,
  }));

  const rawInterview = (analysis.interviewQuestions ?? {}) as {
    technicalQuestions?: unknown[];
    behavioralQuestions?: unknown[];
    projectQuestions?: unknown[];
    systemDesignQuestions?: unknown[];
    resumeQuestions?: unknown[];
  };

  const mapQuestions = (arr: unknown[] | undefined): InterviewQuestion[] =>
    asArray<{ question: string; whyAsked: string; whatTested: string; preparationTopics?: string[] }>(arr).map(
      (q) => ({
        question: q.question,
        whyAsked: q.whyAsked,
        whatTested: q.whatTested,
        prepTopics: q.preparationTopics ?? [],
      })
    );

  const interviewQuestions: InterviewQuestionSet = {
    technical: mapQuestions(rawInterview.technicalQuestions),
    behavioral: mapQuestions(rawInterview.behavioralQuestions),
    project: mapQuestions(rawInterview.projectQuestions),
    systemDesign: mapQuestions(rawInterview.systemDesignQuestions),
    resume: mapQuestions(rawInterview.resumeQuestions),
  };

  return {
    id: analysis.id,
    totalScore: analysis.totalScore,
    scores: {
      skill: analysis.skillScore,
      experience: analysis.experienceScore,
      keywords: analysis.keywordScore,
      projects: analysis.projectScore,
      education: analysis.educationScore,
      structure: analysis.structureScore,
      formatting: analysis.formattingScore,
    },
    maxScores: { skill: 30, experience: 20, keywords: 15, projects: 10, education: 10, structure: 10, formatting: 5 },
    matchedSkills,
    missingSkills,
    weakSkills,
    bulletAnalysis,
    strengths,
    weaknesses,
    recommendations,
    interviewQuestions,
    estimatedYears: structuredResume ? estimateYearsOfExperience(structuredResume) : 0,
    requiredYears: job.experienceYears ?? 0,
    status: analysis.status,
    resumeTitle: resume.title,
    jobTitle: job.title,
    company: job.company ?? "",
    candidateName: structuredResume?.candidate.name || resume.title,
    createdAt: analysis.createdAt.toISOString(),
  };
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
