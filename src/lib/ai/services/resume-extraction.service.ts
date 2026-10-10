import type { AIProvider } from "../providers/types";
import { generateValidated } from "../utils/generate-validated";
import { cleanExtractedText } from "../utils/text-cleaning";
import { structuredResumeSchema, type StructuredResume } from "../schemas/resume.schema";
import {
  buildResumeExtractionSystemPrompt,
  buildResumeExtractionUserPrompt,
} from "../prompts/resume-extraction.prompt";

/**
 * Implements the pipeline from the master spec:
 *   Uploaded text → Cleaning → AI extraction → Schema validation
 * Persistence to the database is deliberately NOT this service's job —
 * it returns validated data and the caller (an API route / orchestrator)
 * decides how to store it, keeping this service pure and easy to test.
 */
export class ResumeExtractionService {
  constructor(private readonly provider: AIProvider) {}

  async extract(rawText: string): Promise<StructuredResume> {
    const cleaned = cleanExtractedText(rawText);

    if (cleaned.length < 40) {
      throw new Error("Resume text is too short to extract meaningful data from.");
    }

    return generateValidated(this.provider, structuredResumeSchema, {
      system: buildResumeExtractionSystemPrompt(),
      prompt: buildResumeExtractionUserPrompt(cleaned),
      temperature: 0.1,
      maxOutputTokens: 2000,
      maxRetries: 1,
    });
  }
}
