import type { AIProvider } from "../providers/types";
import { generateValidated } from "../utils/generate-validated";
import { recommendationsResponseSchema, type RecommendationsResponse } from "../schemas/analysis.schema";
import {
  buildRecommendationsSystemPrompt,
  buildRecommendationsUserPrompt,
  type RecommendationsContext,
} from "../prompts/recommendations.prompt";
import type { StructuredResume } from "../schemas/resume.schema";
import type { StructuredJob } from "../schemas/job.schema";
import type { SkillMatchResult } from "./skill-matching.service";
import type { ATSScoreResult } from "./scoring.service";

/**
 * Deliberately takes the *outputs* of SkillMatchingService and
 * ScoringService as inputs, rather than recomputing anything — this is
 * what makes every recommendation traceable to real resume/job data
 * (per the Phase 2 quality requirement) instead of the model inventing
 * generic advice disconnected from the actual analysis.
 */
export class RecommendationService {
  constructor(private readonly provider: AIProvider) {}

  async generate(
    resume: StructuredResume,
    job: StructuredJob,
    match: SkillMatchResult,
    scores: ATSScoreResult
  ): Promise<RecommendationsResponse> {
    const ctx: RecommendationsContext = {
      totalScore: scores.overallScore,
      scores: {
        skill: scores.skillScore,
        experience: scores.experienceScore,
        keywords: scores.keywordScore,
        projects: scores.projectScore,
        education: scores.educationScore,
        structure: scores.structureScore,
        formatting: scores.formattingScore,
      },
      missingRequiredSkills: match.missing.filter((m) => m.tier === "required").map((m) => m.skill),
      missingPreferredSkills: match.missing.filter((m) => m.tier === "preferred").map((m) => m.skill),
      weakSkills: match.weak.map((m) => m.skill),
      candidateSkills: resume.skills,
      experienceCount: resume.experience.length,
      projectNames: resume.projects.map((p) => p.name),
      jobTitle: job.title,
      requiredSkills: job.requiredSkills,
    };

    return generateValidated(this.provider, recommendationsResponseSchema, {
      system: buildRecommendationsSystemPrompt(),
      prompt: buildRecommendationsUserPrompt(ctx),
      temperature: 0.4,
      maxOutputTokens: 2000,
      maxRetries: 1,
    });
  }
}
