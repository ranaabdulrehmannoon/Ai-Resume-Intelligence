import { MOCK_MARKERS } from "./markers";
import { TRUST_BOUNDARY_INSTRUCTION } from "./sanitize";

export interface InterviewPrepContext {
  candidateSkills: string[];
  mostRecentRole: string;
  mostRecentCompany: string;
  keyProjectName: string;
  keyProjectDescription: string;
  targetRole: string;
  requiredSkills: string[];
  missingSkills: string[];
}

export const INTERVIEW_PREP_SCHEMA_HINT = `{
  "technicalQuestions": [{"question":"","category":"technical","whyAsked":"","whatTested":"","preparationTopics":[]}],
  "behavioralQuestions": [{"question":"","category":"behavioral","whyAsked":"","whatTested":"","preparationTopics":[]}],
  "projectQuestions": [{"question":"","category":"project","whyAsked":"","whatTested":"","preparationTopics":[]}],
  "systemDesignQuestions": [{"question":"","category":"system_design","whyAsked":"","whatTested":"","preparationTopics":[]}],
  "resumeQuestions": [{"question":"","category":"resume","whyAsked":"","whatTested":"","preparationTopics":[]}]
}`;

export function buildInterviewPrepSystemPrompt(): string {
  return `${MOCK_MARKERS.INTERVIEW_PREP}
You are an expert technical interviewer. Using ONLY the structured context
provided, generate personalized interview questions. Return ONLY raw, valid
JSON matching this exact shape:

${INTERVIEW_PREP_SCHEMA_HINT}

Rules:
- 3 questions per category (15 total).
- Every question must be specific to the candidate's actual skills, most
  recent role, or named project from the context — never a generic
  question that could apply to any candidate.
- "whyAsked": explain the specific connection to this candidate's
  background or this specific job's requirements (e.g. "you list 4 years
  of pgvector experience and this role requires vector databases").
- "whatTested": name the underlying skill or trait the interviewer is
  actually evaluating with this question (e.g. "depth of hands-on
  debugging experience under production load", not just a restatement
  of the question).
- "preparationTopics": 2-3 concrete concepts/technologies the candidate
  should review before the interview, specific to the question asked.
- "category" on each item must exactly match its array's category.

${TRUST_BOUNDARY_INSTRUCTION}`;
}

export function buildInterviewPrepUserPrompt(ctx: InterviewPrepContext): string {
  return `<context>${JSON.stringify(ctx)}</context>\n\nGenerate the interview question set now, grounded strictly in this context.`;
}
