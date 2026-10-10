import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { extractText, DocumentExtractionError } from "@/lib/documents/extract-text";
import { cleanExtractedText } from "@/lib/ai/utils/text-cleaning";

export const runtime = "nodejs";

const MAX_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB || 5);

/** Extracts text from a PDF/DOCX without persisting anything (used to prefill the job description form). */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size / (1024 * 1024) > MAX_SIZE_MB) {
    return NextResponse.json({ error: `File exceeds the ${MAX_SIZE_MB}MB limit.` }, { status: 413 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    console.info("Document upload received", {
      mimeType: file.type || "unknown",
      size: file.size,
      signature: buffer.subarray(0, 5).toString("ascii"),
    });
    const { text, fileType } = await extractText(buffer);
    return NextResponse.json({ fileName: file.name, fileType, text: cleanExtractedText(text) });
  } catch (err) {
    if (err instanceof DocumentExtractionError) {
      return NextResponse.json({ error: err.message }, { status: err.code === "UNSUPPORTED_TYPE" ? 415 : 422 });
    }
    console.error("Document extraction failed", err);
    return NextResponse.json({ error: "Couldn't read that file." }, { status: 500 });
  }
}
