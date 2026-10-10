import type { AIProvider } from "../providers/types";
import { generateValidated } from "../utils/generate-validated";
import { bulletAnalysisResponseSchema, type BulletAnalysisResponse } from "../schemas/analysis.schema";
import {
  buildBulletAnalysisSystemPrompt,
  buildBulletAnalysisUserPrompt,
  type BulletAnalysisContext,
} from "../prompts/bullet-analysis.prompt";
import type { StructuredResume } from "../schemas/resume.schema";
import type { StructuredJob } from "../schemas/job.schema";

const MAX_BULLETS = 6;

export class BulletAnalysisService {
  constructor(private readonly provider: AIProvider) {}

  async analyze(resume: StructuredResume, job: StructuredJob): Promise<BulletAnalysisResponse> {
    const bullets = resume.experience
      .flatMap((e) => e.description)
      .filter((b) => b.trim().length > 15)
      .slice(0, MAX_BULLETS);

    if (bullets.length === 0) {
      return { bullets: [] };
    }

    const ctx: BulletAnalysisContext = {
      targetRoleSkills: job.requiredSkills.slice(0, 10),
      bullets,
    };

    // The raw bullet source is also passed as untrusted content for
    // GeminiProvider's benefit (extra grounding text) even though the
    // context block already contains the bullets structurally.
    const rawSource = bullets.map((b, i) => `${i + 1}. ${b}`).join("\n");

    return generateValidated(this.provider, bulletAnalysisResponseSchema, {
      system: buildBulletAnalysisSystemPrompt(),
      prompt: buildBulletAnalysisUserPrompt(ctx, rawSource),
      temperature: 0.4,
      maxOutputTokens: 1800,
      maxRetries: 1,
    });
  }
}
