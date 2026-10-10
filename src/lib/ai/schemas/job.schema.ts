import { z } from "zod";

export const structuredJobSchema = z.object({
  title: z.string().default(""),
  company: z.string().default(""),
  location: z.string().default(""),
  employmentType: z.string().default(""),
  experienceYears: z.number().int().min(0).max(40).default(0),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  qualifications: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export type StructuredJob = z.infer<typeof structuredJobSchema>;
