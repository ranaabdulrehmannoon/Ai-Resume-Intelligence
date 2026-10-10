import mammoth from "mammoth";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PDFParse } from "pdf-parse";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";

export type SupportedFileType = "pdf" | "docx";

export class DocumentExtractionError extends Error {
  constructor(
    message: string,
    public readonly code: "UNSUPPORTED_TYPE" | "EMPTY_TEXT" | "PARSE_FAILED"
  ) {
    super(message);
    this.name = "DocumentExtractionError";
  }
}

/** Minimum characters of extracted text before we treat a document as usable (guards scanned/image-only PDFs). */
export const MIN_EXTRACTED_CHARS = 80;

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d]; // "%PDF-"
const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04]; // "PK\x03\x04" (DOCX is a zip container)
const PDF_PARSE_WORKER_PATH = pathToFileURL(
  path.join(
    process.cwd(),
    "node_modules",
    "pdf-parse",
    "node_modules",
    "pdfjs-dist",
    "legacy",
    "build",
    "pdf.worker.mjs",
  ),
).toString();
const PDFJS_WORKER_PATH = pathToFileURL(
  path.join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs"),
).toString();

PDFParse.setWorker(PDF_PARSE_WORKER_PATH);
GlobalWorkerOptions.workerSrc = PDFJS_WORKER_PATH;

function startsWith(buf: Uint8Array, magic: number[]): boolean {
  return magic.every((byte, i) => buf[i] === byte);
}

async function extractPdfWithPdfJs(buf: Buffer): Promise<string> {
  const loadingTask = getDocument({ data: new Uint8Array(buf) });
  const document = await loadingTask.promise;
  try {
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(
        content.items
          .filter((item): item is typeof item & { str: string } => "str" in item)
          .map((item) => item.str)
          .join(" "),
      );
    }
    return pages.join("\n");
  } finally {
    await document.destroy();
  }
}

/**
 * Determines the real file type from the file's leading bytes rather than
 * the client-supplied MIME type or extension, both of which are trivially
 * spoofable. Anything that doesn't match a known signature is rejected.
 */
export function detectFileType(buf: Uint8Array): SupportedFileType | null {
  if (startsWith(buf, PDF_MAGIC)) return "pdf";
  if (startsWith(buf, ZIP_MAGIC)) return "docx";
  return null;
}

export async function extractText(buf: Buffer): Promise<{ text: string; fileType: SupportedFileType }> {
  const fileType = detectFileType(buf);
  if (!fileType) {
    throw new DocumentExtractionError("Only PDF and DOCX files are supported.", "UNSUPPORTED_TYPE");
  }

  let text: string;
  try {
    if (fileType === "pdf") {
      try {
        const parser = new PDFParse({ data: new Uint8Array(buf) });
        try {
          const result = await parser.getText();
          text = result.text;
        } finally {
          await parser.destroy();
        }
        if (!text.trim()) {
          throw new Error("Primary PDF parser returned no text");
        }
      } catch (primaryError) {
        console.warn("Primary PDF parser failed; trying PDF.js fallback", {
          error: primaryError,
          size: buf.length,
          signature: buf.subarray(0, 5).toString("ascii"),
        });
        text = await extractPdfWithPdfJs(buf);
      }
    } else {
      const result = await mammoth.extractRawText({ buffer: buf });
      text = result.value;
    }
  } catch (err) {
    console.error("Document parsing failed", err);
    throw new DocumentExtractionError("We couldn't read that file. It may be corrupted or password-protected.", "PARSE_FAILED");
  }

  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length < MIN_EXTRACTED_CHARS) {
    throw new DocumentExtractionError(
      "We couldn't find enough text in that file. If it's a scanned image, paste the text instead.",
      "EMPTY_TEXT"
    );
  }

  return { text, fileType };
}
