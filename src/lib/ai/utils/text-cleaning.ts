/**
 * Cleans raw extracted text (from PDF/DOCX parsing) before it's sent to
 * an AI extraction prompt: collapses excess whitespace, strips control
 * characters and null bytes that some PDF extractors leave behind, and
 * caps length so a pathological document can't blow the context window
 * or the prompt-injection sanitizer's truncation budget.
 */
export function cleanExtractedText(raw: string, maxLength = 15000): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}
