import { MOCK_MARKERS } from "./markers";
import { TRUST_BOUNDARY_INSTRUCTION, wrapUntrusted } from "./sanitize";

export const RESUME_EXTRACTION_SCHEMA_HINT = `{
  "candidate": {"name":"","email":"","phone":"","location":"","linkedin":"","github":"","website":""},
  "summary": "",
  "skills": [],
  "experience": [{"company":"","role":"","startDate":"","endDate":"","description":[],"technologies":[]}],
  "education": [{"institution":"","degree":"","field":"","year":"","gpa":""}],
  "projects": [{"name":"","description":"","technologies":[],"url":""}],
  "certifications": [],
  "achievements": []
}`;

export function buildResumeExtractionSystemPrompt(): string {
  return `${MOCK_MARKERS.RESUME_EXTRACTION}
You are a precise resume parser. Extract structured information from the
resume text provided and return ONLY raw, valid JSON matching this exact
shape — no markdown, no code fences, no commentary:

${RESUME_EXTRACTION_SCHEMA_HINT}

Rules:
- Use "" for unknown strings and [] for unknown lists — never omit a field.
- Dates: use whatever format the resume uses (e.g. "2022-03", "March 2022").
- Do not infer or invent information not present in the resume text.
- "skills" should be a flat, deduplicated list of technical + relevant skills.

${TRUST_BOUNDARY_INSTRUCTION}`;
}

export function buildResumeExtractionUserPrompt(resumeText: string): string {
  return `${wrapUntrusted("resume", resumeText)}\n\nExtract the structured data now.`;
}
