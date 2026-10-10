import { z } from "zod";

// ============================================================
// Structured resume extraction schema. Every AI extraction result
// is run through this before it is ever stored or shown to a user —
// per Phase 2 spec: "Never store unvalidated AI output."
// ============================================================

export const candidateSchema = z.object({
  name: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  linkedin: z.string().default(""),
  github: z.string().default(""),
  website: z.string().default(""),
});

export const experienceEntrySchema = z.object({
  company: z.string().default(""),
  role: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  description: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
});

export const educationEntrySchema = z.object({
  institution: z.string().default(""),
  degree: z.string().default(""),
  field: z.string().default(""),
  year: z.string().default(""),
  gpa: z.string().default(""),
});

export const projectEntrySchema = z.object({
  name: z.string().default(""),
  description: z.string().default(""),
  technologies: z.array(z.string()).default([]),
  url: z.string().default(""),
});

export const structuredResumeSchema = z.object({
  candidate: candidateSchema.default({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
  }),
  summary: z.string().default(""),
  skills: z.array(z.string()).default([]),
  experience: z.array(experienceEntrySchema).default([]),
  education: z.array(educationEntrySchema).default([]),
  projects: z.array(projectEntrySchema).default([]),
  certifications: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
});

export type StructuredResume = z.infer<typeof structuredResumeSchema>;
