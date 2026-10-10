import type { AIProvider, GenerateOptions } from "./types";
import { MOCK_MARKERS, extractContext } from "../prompts/markers";
import type { BulletAnalysisContext } from "../prompts/bullet-analysis.prompt";
import type { RecommendationsContext } from "../prompts/recommendations.prompt";
import type { InterviewPrepContext } from "../prompts/interview-prep.prompt";
import type { RecommendationItem } from "../schemas/analysis.schema";
import {
  extractSkillsFromText,
  extractEmail,
  extractPhone,
  extractFirstLine,
  extractLinkedIn,
  extractGithub,
  extractRequiredYears,
} from "../utils/heuristic-extraction";

/**
 * Zero-cost, zero-network AI provider for local development and the test
 * suite. Never calls a real model. Output is schema-valid (matches the
 * exact shape GeminiProvider would return) and, where possible, grounded
 * in the actual input text via lightweight heuristics — not static
 * canned data — so mock mode is genuinely useful for building/testing
 * the pipeline end-to-end without spending API credits.
 */
export class MockProvider implements AIProvider {
  readonly name = "mock";

  async generateText(options: GenerateOptions): Promise<string> {
    return `[mock response for: ${options.prompt.slice(0, 60)}...]`;
  }

  async generateJSON(options: GenerateOptions): Promise<string> {
    const { system, prompt } = options;

    if (system.startsWith(MOCK_MARKERS.RESUME_EXTRACTION)) {
      return JSON.stringify(this.mockResumeExtraction(prompt));
    }
    if (system.startsWith(MOCK_MARKERS.JOB_EXTRACTION)) {
      return JSON.stringify(this.mockJobExtraction(prompt));
    }
    if (system.startsWith(MOCK_MARKERS.BULLET_ANALYSIS)) {
      return JSON.stringify(this.mockBulletAnalysis(prompt));
    }
    if (system.startsWith(MOCK_MARKERS.RECOMMENDATIONS)) {
      return JSON.stringify(this.mockRecommendations(prompt));
    }
    if (system.startsWith(MOCK_MARKERS.INTERVIEW_PREP)) {
      return JSON.stringify(this.mockInterviewPrep(prompt));
    }

    return JSON.stringify({});
  }

  async embed(text: string): Promise<number[]> {
    // Deterministic pseudo-embedding using the feature-hashing trick with
    // multiple hash seeds per word (like a Bloom filter): each word sets
    // bits in several buckets rather than one. A single hash per word in
    // a small space collides easily (e.g. "rust" and "python" landing in
    // the same bucket would wrongly read as 100% similar) — requiring
    // several independent hashes to *all* collide makes that practically
    // impossible, while genuinely overlapping vocabulary (shared words
    // across two texts) still drives similarity up as intended.
    const DIM = 128;
    const HASHES_PER_WORD = 3;
    const vec = new Array(DIM).fill(0);
    const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];

    for (const word of words) {
      for (let seed = 0; seed < HASHES_PER_WORD; seed++) {
        const bucket = simpleHash(`${word}:${seed}`) % DIM;
        vec[bucket] += 1;
      }
    }

    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map((v) => v / norm);
  }

  // ── Mock generators ──────────────────────────────────────────

  private mockResumeExtraction(prompt: string) {
    const textMatch = prompt.match(/<untrusted_resume>([\s\S]*?)<\/untrusted_resume>/);
    const text = textMatch?.[1] ?? "";

    return {
      candidate: {
        name: extractFirstLine(text) || "Mock Candidate",
        email: extractEmail(text),
        phone: extractPhone(text),
        location: "",
        linkedin: extractLinkedIn(text),
        github: extractGithub(text),
        website: "",
      },
      summary: text.slice(0, 200).replace(/\n/g, " ").trim(),
      skills: extractSkillsFromText(text),
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      achievements: [],
    };
  }

  private mockJobExtraction(prompt: string) {
    const textMatch = prompt.match(/<untrusted_job_description>([\s\S]*?)<\/untrusted_job_description>/);
    const text = textMatch?.[1] ?? "";
    const skills = extractSkillsFromText(text);

    return {
      title: extractFirstLine(text) || "Mock Role",
      company: "",
      location: "",
      employmentType: "",
      experienceYears: extractRequiredYears(text),
      requiredSkills: skills,
      preferredSkills: [],
      responsibilities: [],
      qualifications: [],
      technologies: skills,
      softSkills: [],
      keywords: skills,
    };
  }

  private mockBulletAnalysis(prompt: string) {
    const ctx = extractContext<BulletAnalysisContext>(prompt);
    const bullets = ctx?.bullets ?? [];

    return {
      bullets: bullets.map((original) => {
        const hasMetric = /\d/.test(original);
        const issues: string[] = [];
        if (!hasMetric) issues.push("No measurable outcome mentioned");
        if (original.split(" ").length < 8) issues.push("Could be more specific");

        const strengths: string[] = [];
        if (hasMetric) strengths.push("Includes a quantified result");
        if (/^(Led|Built|Designed|Architected|Implemented|Launched)/i.test(original)) {
          strengths.push("Starts with a strong action verb");
        }

        return {
          original,
          qualityScore: hasMetric ? 8 : 5,
          issues,
          strengths,
          suggestedRewrite: hasMetric ? original : `${original} — resulting in [X]% improvement`,
        };
      }),
    };
  }

  private mockRecommendations(prompt: string) {
    const ctx = extractContext<RecommendationsContext>(prompt);
    const missing = ctx?.missingRequiredSkills ?? [];
    const weak = ctx?.weakSkills ?? [];

    const recommendations: RecommendationItem[] = [
      ...missing.map(
        (skill): RecommendationItem => ({
          priority: "HIGH",
          category: "skills",
          title: `Address the ${skill} gap`,
          reason: `${skill} is a required skill for ${ctx?.jobTitle || "this role"} and was not found in your resume.`,
          action: `If you have any exposure to ${skill}, add it explicitly to your skills section or a relevant bullet.`,
          expectedImpact: "Improves keyword and skill-match scoring directly.",
        })
      ),
      ...weak.map(
        (skill): RecommendationItem => ({
          priority: "MEDIUM",
          category: "keywords",
          title: `Make ${skill} more prominent`,
          reason: `${skill} appears in your resume text but isn't listed as a core skill.`,
          action: `Add ${skill} explicitly to your skills list.`,
          expectedImpact: "Small but direct improvement to keyword coverage.",
        })
      ),
    ].slice(0, 8);

    if (recommendations.length === 0) {
      recommendations.push({
        priority: "LOW",
        category: "formatting",
        title: "Resume is well-aligned",
        reason: "No significant skill gaps were detected against this job description.",
        action: "Consider tightening formatting consistency across sections.",
        expectedImpact: "Minor polish improvement.",
      });
    }

    return {
      recommendations,
      strengths: (ctx?.candidateSkills ?? []).slice(0, 3).map((s) => ({
        title: `Strong ${s} experience`,
        description: `${s} appears in your skill set and overlaps with this role's requirements.`,
      })),
      weaknesses: missing.slice(0, 3).map((s) => ({
        title: `Missing ${s}`,
        description: `${s} is required but not demonstrated anywhere in your resume.`,
      })),
      skillExplanations: missing.map((skill) => ({
        skill,
        whyItMatters: `Listed as a required skill for ${ctx?.jobTitle || "this role"}.`,
        howToDemonstrate: `Mention any hands-on ${skill} experience, even from side projects.`,
      })),
    };
  }

  private mockInterviewPrep(prompt: string) {
    const ctx = extractContext<InterviewPrepContext>(prompt);
    const role = ctx?.targetRole || "this role";
    const project = ctx?.keyProjectName || "your recent project";

    const mk = (
      question: string,
      category: "technical" | "behavioral" | "project" | "system_design" | "resume",
      whyAsked: string,
      whatTested: string,
      preparationTopics: string[]
    ) => ({ question, category, whyAsked, whatTested, preparationTopics });

    return {
      technicalQuestions: [
        mk(
          `How would you approach implementing ${ctx?.requiredSkills?.[0] || "a core requirement"} for ${role}?`,
          "technical",
          `${ctx?.requiredSkills?.[0] || "This skill"} is explicitly required for ${role}.`,
          "Hands-on depth with this technology versus surface-level familiarity.",
          [ctx?.requiredSkills?.[0] || "core concepts"]
        ),
      ],
      behavioralQuestions: [
        mk(
          `Tell me about a challenge you faced at ${ctx?.mostRecentCompany || "your last role"}.`,
          "behavioral",
          `Based on your most recent role at ${ctx?.mostRecentCompany || "your last company"}.`,
          "Problem-solving approach and ownership under pressure.",
          ["STAR method"]
        ),
      ],
      projectQuestions: [
        mk(
          `Walk me through the architecture of ${project}.`,
          "project",
          `${project} is listed on your resume and is relevant to ${role}.`,
          "Depth of technical ownership versus a team-wide contribution.",
          ["System design", project]
        ),
      ],
      systemDesignQuestions: [
        mk(
          `Design a system that handles the core workflow of ${role}.`,
          "system_design",
          `Directly relevant to the responsibilities of ${role}.`,
          "Ability to reason about scale, tradeoffs, and failure modes.",
          ["Scalability", "Data modeling"]
        ),
      ],
      resumeQuestions: [
        mk(
          `Can you elaborate on your experience with ${ctx?.candidateSkills?.[0] || "your top skill"}?`,
          "resume",
          `${ctx?.candidateSkills?.[0] || "This skill"} appears on your resume.`,
          "Whether resume claims reflect genuine hands-on experience.",
          [ctx?.candidateSkills?.[0] || "your top skill"]
        ),
      ],
    };
  }
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
