import type { AIProvider } from "../providers/types";
import { generateValidated } from "../utils/generate-validated";
import { cleanExtractedText } from "../utils/text-cleaning";
import { structuredJobSchema, type StructuredJob } from "../schemas/job.schema";
import {
  buildJobExtractionSystemPrompt,
  buildJobExtractionUserPrompt,
} from "../prompts/job-extraction.prompt";

export class JobExtractionService {
  constructor(private readonly provider: AIProvider) {}

  async extract(rawText: string): Promise<StructuredJob> {
    const cleaned = cleanExtractedText(rawText);

    if (cleaned.length < 40) {
      throw new Error("Job description text is too short to extract meaningful data from.");
    }

    return generateValidated(this.provider, structuredJobSchema, {
      system: buildJobExtractionSystemPrompt(),
      prompt: buildJobExtractionUserPrompt(cleaned),
      temperature: 0.1,
      maxOutputTokens: 1600,
      maxRetries: 1,
    });
  }
}
