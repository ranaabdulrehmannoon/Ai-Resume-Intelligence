import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const jobSchema = z.object({
  title: z.string().max(200).default(""),
  company: z.string().max(200).default(""),
  location: z.string().max(200).default(""),
  text: z.string().min(60, "Job description must be at least 60 characters."),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, company, location, text } = parsed.data;

  // Structured extraction (required/preferred skills, responsibilities,
  // etc.) happens via the Gemini pipeline — not implemented in this
  // phase. Persisting the raw fields now with empty arrays so the
  // record shape matches the schema; STEP "AI integration" fills these.
  const job = await db.jobDescription.create({
    data: {
      userId: session.user.id,
      title: title || "Untitled Role",
      company: company || null,
      location: location || null,
      rawText: text,
      requiredSkills: [],
      preferredSkills: [],
      responsibilities: [],
      qualifications: [],
      technologies: [],
      keywords: [],
    },
    select: { id: true, title: true, company: true },
  });

  return NextResponse.json(job, { status: 201 });
}
