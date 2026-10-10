import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractText, DocumentExtractionError } from "@/lib/documents/extract-text";
import { cleanExtractedText } from "@/lib/ai/utils/text-cleaning";

export const runtime = "nodejs";

const MAX_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB || 5);
const MAX_TITLE_LENGTH = 120;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "That file is empty." }, { status: 400 });
  }

  if (file.size / (1024 * 1024) > MAX_SIZE_MB) {
    return NextResponse.json({ error: `File exceeds the ${MAX_SIZE_MB}MB limit.` }, { status: 413 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    console.info("Resume upload received", {
      mimeType: file.type || "unknown",
      size: file.size,
      signature: buffer.subarray(0, 5).toString("ascii"),
    });
    // File type is derived from the file's actual bytes (magic numbers),
    // never from the client-declared MIME type or extension.
    const { text, fileType } = await extractText(buffer);

    const resume = await db.resume.create({
      data: {
        userId: session.user.id,
        title: file.name.replace(/\.[^.]+$/, "").slice(0, MAX_TITLE_LENGTH) || "Untitled resume",
        fileName: file.name.slice(0, 255),
        fileType,
        rawText: cleanExtractedText(text),
      },
      select: { id: true, title: true, fileName: true, fileType: true },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (err) {
    if (err instanceof DocumentExtractionError) {
      const status = err.code === "UNSUPPORTED_TYPE" ? 415 : 422;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("Resume upload failed", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
