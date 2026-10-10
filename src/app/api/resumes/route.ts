import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cleanExtractedText } from "@/lib/ai/utils/text-cleaning";

const MIN_RESUME_CHARS = 80;

const pasteSchema = z.object({
  title: z.string().trim().min(1).max(120).default("Pasted resume"),
  text: z.string().min(MIN_RESUME_CHARS, `Resume text must be at least ${MIN_RESUME_CHARS} characters.`).max(50000),
});

/** Create a resume from pasted plain text (alternative to file upload). */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = pasteSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const resume = await db.resume.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      fileType: "text",
      rawText: cleanExtractedText(parsed.data.text),
    },
    select: { id: true, title: true },
  });

  return NextResponse.json(resume, { status: 201 });
}
