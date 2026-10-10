import type { AIProvider } from "../providers/types";
import { generateValidated } from "../utils/generate-validated";
import { interviewPrepResponseSchema, type InterviewPrepResponse } from "../schemas/analysis.schema";
import {
  buildInterviewPrepSystemPrompt,
  buildInterviewPrepUserPrompt,
  type InterviewPrepContext,
} from "../prompts/interview-prep.prompt";
import type { StructuredResume } from "../schemas/resume.schema";
import type { StructuredJob } from "../schemas/job.schema";
import type { SkillMatchResult } from "./skill-matching.service";

export class InterviewPreparationService {
  constructor(private readonly provider: AIProvider) {}

  async generate(
    resume: StructuredResume,
    job: StructuredJob,
    match: SkillMatchResult
  ): Promise<InterviewPrepResponse> {
    const mostRecent = resume.experience[0];
    const keyProject = resume.projects[0];

    const ctx: InterviewPrepContext = {
      candidateSkills: resume.skills.slice(0, 12),
      mostRecentRole: mostRecent?.role ?? "",
      mostRecentCompany: mostRecent?.company ?? "",
      keyProjectName: keyProject?.name ?? "",
      keyProjectDescription: keyProject?.description ?? "",
      targetRole: job.title,
      requiredSkills: job.requiredSkills,
      missingSkills: match.missing.map((m) => m.skill),
    };

    return generateValidated(this.provider, interviewPrepResponseSchema, {
      system: buildInterviewPrepSystemPrompt(),
      prompt: buildInterviewPrepUserPrompt(ctx),
      temperature: 0.5,
      maxOutputTokens: 2400,
      maxRetries: 1,
    });
  }
}
