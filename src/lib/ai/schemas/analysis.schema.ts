import { z } from "zod";

// ============================================================
// Bullet Analysis
// ============================================================
export const bulletAnalysisItemSchema = z.object({
  original: z.string(),
  qualityScore: z.number().int().min(1).max(10),
  issues: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  suggestedRewrite: z.string().default(""),
});

export const bulletAnalysisResponseSchema = z.object({
  bullets: z.array(bulletAnalysisItemSchema).default([]),
});

export type BulletAnalysisItem = z.infer<typeof bulletAnalysisItemSchema>;
export type BulletAnalysisResponse = z.infer<typeof bulletAnalysisResponseSchema>;

// ============================================================
// Recommendations
// ============================================================
export const recommendationPrioritySchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export const recommendationCategorySchema = z.enum([
  "skills",
  "experience",
  "keywords",
  "formatting",
  "projects",
  "education",
]);

export const recommendationItemSchema = z.object({
  priority: recommendationPrioritySchema,
  category: recommendationCategorySchema,
  title: z.string(),
  reason: z.string(),
  action: z.string(),
  expectedImpact: z.string(),
});

export const recommendationsResponseSchema = z.object({
  recommendations: z.array(recommendationItemSchema).min(1),
  strengths: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .default([]),
  weaknesses: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .default([]),
  skillExplanations: z
    .array(
      z.object({
        skill: z.string(),
        whyItMatters: z.string().default(""),
        howToDemonstrate: z.string().default(""),
      })
    )
    .default([]),
});

export type RecommendationItem = z.infer<typeof recommendationItemSchema>;
export type RecommendationsResponse = z.infer<typeof recommendationsResponseSchema>;

// ============================================================
// Interview Preparation
// ============================================================
export const interviewQuestionSchema = z.object({
  question: z.string(),
  category: z.enum([
    "technical",
    "behavioral",
    "project",
    "system_design",
    "resume",
  ]),
  // Split into two distinct fields (rather than one combined "whyRelevant")
  // because the UI shows these as two separate info boxes — "why you'll
  // be asked this" and "what the interviewer is testing" are genuinely
  // different questions a candidate needs answered separately.
  whyAsked: z.string(),
  whatTested: z.string(),
  preparationTopics: z.array(z.string()).default([]),
});

export const interviewPrepResponseSchema = z.object({
  technicalQuestions: z.array(interviewQuestionSchema).default([]),
  behavioralQuestions: z.array(interviewQuestionSchema).default([]),
  projectQuestions: z.array(interviewQuestionSchema).default([]),
  systemDesignQuestions: z.array(interviewQuestionSchema).default([]),
  resumeQuestions: z.array(interviewQuestionSchema).default([]),
});

export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>;
export type InterviewPrepResponse = z.infer<typeof interviewPrepResponseSchema>;
