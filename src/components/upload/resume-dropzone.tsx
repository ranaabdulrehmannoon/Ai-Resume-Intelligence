"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, XCircle, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";


const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPTED_EXT = ".pdf,.docx";

type UploadState =
  | { status: "idle" }
  | { status: "invalid"; message: string }
  | { status: "uploading"; file: File; progress: number }
  | { status: "processing"; file: File }
  | { status: "success"; file: File; fileName: string }
  | { status: "error"; file: File; message: string };

export interface UploadResult {
  fileName?: string;
  text?: string;
  [key: string]: unknown;
}

interface ResumeDropzoneProps {
  /** Endpoint that receives the multipart upload. Defaults to persisting a resume. */
  endpoint?: string;
  /** Must match the server's real limit (MAX_FILE_SIZE_MB) — passed down from a Server Component, never hardcoded here. */
  maxSizeMb: number;
  onUploaded?: (result: UploadResult) => void;
}

function validateFile(file: File, maxSizeMb: number): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Only PDF and DOCX files are supported.";
  }
  if (file.size / (1024 * 1024) > maxSizeMb) {
    return `File exceeds the ${maxSizeMb}MB limit.`;
  }
  return null;
}

export function ResumeDropzone({ endpoint = "/api/resumes/upload", maxSizeMb, onUploaded }: ResumeDropzoneProps) {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    (file: File) => {
      const err = validateFile(file, maxSizeMb);
      if (err) {
        setState({ status: "invalid", message: err });
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint);

      // Real upload progress from the browser's XHR event — not a
      // simulated timer — reflecting actual bytes sent.
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setState({ status: "uploading", file, progress: pct });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setState({ status: "processing", file });
          try {
            const data = JSON.parse(xhr.responseText);
            // Extraction/parsing happens server-side asynchronously; this
            // reflects the real "uploaded, now processing" state rather
            // than jumping straight to a fake "done".
            setState({ status: "success", file, fileName: data.fileName ?? file.name });
            onUploaded?.(data);
          } catch {
            setState({ status: "error", file, message: "Unexpected server response." });
          }
        } else {
          let message = "Upload failed. Please try again.";
          try {
            message = JSON.parse(xhr.responseText)?.error || message;
          } catch {
            /* noop */
          }
          setState({ status: "error", file, message });
        }
      };

      xhr.onerror = () => {
        setState({ status: "error", file, message: "Network error during upload." });
      };

      setState({ status: "uploading", file, progress: 0 });
      xhr.send(formData);
    },
    [endpoint, maxSizeMb, onUploaded]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) upload(file);
    },
    [upload]
  );

  const reset = () => {
    setState({ status: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => state.status === "idle" && inputRef.current?.click()}
        className={cn(
          "relative flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          state.status === "idle" && "cursor-pointer border-white/12 hover:border-primary/30 hover:bg-primary/[0.03]",
          dragOver && "border-primary/50 bg-primary/[0.05]",
          state.status === "invalid" && "border-destructive/40 bg-destructive/[0.04]",
          state.status === "error" && "border-destructive/40 bg-destructive/[0.04]",
          state.status === "success" && "border-[#10B981]/40 bg-[#10B981]/[0.04]",
          (state.status === "uploading" || state.status === "processing") && "border-primary/30 bg-primary/[0.03]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />

        {state.status === "idle" && (
          <>
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              <UploadCloud className="size-6" />
            </div>
            <p className="mb-1 text-sm font-semibold text-foreground">
              Drag &amp; drop your resume here
            </p>
            <p className="mb-4 text-xs text-muted-foreground">
              or click to browse — PDF or DOCX, up to {maxSizeMb}MB
            </p>
            <Button type="button" variant="secondary" size="sm">
              Browse Files
            </Button>
          </>
        )}

        {state.status === "invalid" && (
          <>
            <XCircle className="mb-3 size-10 text-destructive" />
            <p className="mb-1 text-sm font-semibold text-foreground">Invalid file</p>
            <p className="mb-4 text-xs text-muted-foreground">{state.message}</p>
            <Button type="button" variant="secondary" size="sm" onClick={reset}>
              Try again
            </Button>
          </>
        )}

        {state.status === "uploading" && (
          <div className="w-full max-w-xs">
            <FileText className="mx-auto mb-3 size-8 text-primary" />
            <p className="mb-1 truncate text-sm font-medium text-foreground">
              {state.file.name}
            </p>
            <p className="mb-3 text-xs text-muted-foreground">
              Uploading… {state.progress}%
            </p>
            <Progress value={state.progress} />
          </div>
        )}

        {state.status === "processing" && (
          <>
            <Loader2 className="mb-3 size-8 animate-spin text-primary" />
            <p className="mb-1 text-sm font-medium text-foreground">
              {state.file.name}
            </p>
            <p className="text-xs text-muted-foreground">Processing your resume…</p>
          </>
        )}

        {state.status === "success" && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-white/5"
              aria-label="Remove file"
            >
              <X className="size-4" />
            </button>
            <CheckCircle2 className="mb-3 size-10 text-[#10B981]" />
            <p className="mb-1 text-sm font-semibold text-foreground">
              Resume uploaded successfully
            </p>
            <p className="text-xs text-muted-foreground">{state.fileName}</p>
          </>
        )}

        {state.status === "error" && (
          <>
            <XCircle className="mb-3 size-10 text-destructive" />
            <p className="mb-1 text-sm font-semibold text-foreground">Upload failed</p>
            <p className="mb-4 text-xs text-muted-foreground">{state.message}</p>
            <Button type="button" variant="secondary" size="sm" onClick={reset}>
              Try again
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
