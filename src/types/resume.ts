// ============================================================
// Structured domain types — mirror the JSON columns in Prisma
// schema.prisma (ResumeVersion, JobDescription, Analysis).
// Used for AI extraction validation (Zod) and UI props.
// ============================================================

export interface Candidate {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string[];
  technologies: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  year: string;
  gpa: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies: string[];
  url: string;
}

export interface StructuredResume {
  candidate: Candidate;
  summary: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  certifications: string[];
  achievements: string[];
}

export interface StructuredJobDescription {
  title: string;
  company: string;
  location: string;
  employmentType: string;
  experienceYears: number;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  qualifications: string[];
  technologies: string[];
  softSkills: string[];
  keywords: string[];
}

export type SkillPriority = "H" | "M" | "L";
export type SkillTier = "required" | "preferred";

export interface SkillMatch {
  skill: string;
  tier: SkillTier;
}

export interface SkillGap {
  skill: string;
  tier: SkillTier;
  priority: SkillPriority;
  whyItMatters?: string;
  howToDemonstrate?: string;
}

export interface ScoreBreakdown {
  skill: number;
  experience: number;
  keywords: number;
  projects: number;
  education: number;
  structure: number;
  formatting: number;
}

export const SCORE_MAX: ScoreBreakdown = {
  skill: 30,
  experience: 20,
  keywords: 15,
  projects: 10,
  education: 10,
  structure: 10,
  formatting: 5,
};

export interface BulletAnalysisItem {
  original: string;
  issues: string[];
  strengths: string[];
  suggestedRewrite: string;
  qualityScore: number; // 1-10
}

export interface Insight {
  title: string;
  description: string;
}

export type RecommendationPriority = "HIGH" | "MEDIUM" | "LOW";
export type RecommendationCategory =
  | "skills"
  | "experience"
  | "keywords"
  | "formatting"
  | "projects"
  | "education";

export interface Recommendation {
  priority: RecommendationPriority;
  category: RecommendationCategory;
  title: string;
  reason: string;
  action: string;
  expectedImpact: string;
}

export interface InterviewQuestion {
  question: string;
  whyAsked: string;
  whatTested: string;
  prepTopics: string[];
}

export interface InterviewQuestionSet {
  technical: InterviewQuestion[];
  behavioral: InterviewQuestion[];
  project: InterviewQuestion[];
  systemDesign: InterviewQuestion[];
  resume: InterviewQuestion[];
}

export interface AnalysisResult {
  id: string;
  totalScore: number;
  scores: ScoreBreakdown;
  maxScores: ScoreBreakdown;
  matchedSkills: SkillMatch[];
  missingSkills: SkillGap[];
  weakSkills: SkillMatch[];
  bulletAnalysis: BulletAnalysisItem[];
  strengths: Insight[];
  weaknesses: Insight[];
  recommendations: Recommendation[];
  interviewQuestions: InterviewQuestionSet;
  estimatedYears: number;
  requiredYears: number;
  status: "PENDING" | "PROCESSING" | "COMPLETE" | "FAILED";
  resumeTitle: string;
  jobTitle: string;
  company: string;
  candidateName: string;
  createdAt: string;
}
