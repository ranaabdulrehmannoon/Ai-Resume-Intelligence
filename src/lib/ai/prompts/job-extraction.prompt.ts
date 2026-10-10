import { MOCK_MARKERS } from "./markers";
import { TRUST_BOUNDARY_INSTRUCTION, wrapUntrusted } from "./sanitize";

export const JOB_EXTRACTION_SCHEMA_HINT = `{
  "title": "", "company": "", "location": "", "employmentType": "",
  "experienceYears": 0,
  "requiredSkills": [], "preferredSkills": [],
  "responsibilities": [], "qualifications": [],
  "technologies": [], "softSkills": [], "keywords": []
}`;

export function buildJobExtractionSystemPrompt(): string {
  return `${MOCK_MARKERS.JOB_EXTRACTION}
You are a precise job-description parser. Extract structured information
from the job posting text provided and return ONLY raw, valid JSON matching
this exact shape — no markdown, no code fences, no commentary:

${JOB_EXTRACTION_SCHEMA_HINT}

Rules:
- "experienceYears": the minimum years of experience explicitly required.
  Use 0 if not stated. Never guess beyond what is written.
- "requiredSkills" vs "preferredSkills": only split this way if the posting
  itself distinguishes "required" from "nice to have" / "preferred" /
  "bonus" language. If it doesn't distinguish, put everything technical
  into requiredSkills.
- "keywords": notable domain/technical terms worth matching against a
  resume (e.g. "microservices", "RAG", "distributed systems").

${TRUST_BOUNDARY_INSTRUCTION}`;
}

export function buildJobExtractionUserPrompt(jobText: string): string {
  return `${wrapUntrusted("job_description", jobText)}\n\nExtract the structured data now.`;
}
