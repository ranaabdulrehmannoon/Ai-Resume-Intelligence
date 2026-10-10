"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardPaste, Upload } from "lucide-react";
import { toast } from "sonner";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ResumeDropzone } from "./resume-dropzone";

const MIN_CHARS = 80;

/** File upload or paste — both end in a persisted Resume row and a list refresh. */
export function ResumeUploader({ maxSizeMb }: { maxSizeMb: number }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  async function savePasted() {
    setSaving(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() || undefined, text }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "Couldn't save the resume.");
        return;
      }
      toast.success("Resume saved");
      setTitle("");
      setText("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Tabs defaultValue="upload">
      <TabsList>
        <TabsTrigger value="upload">
          <Upload className="mr-1.5 size-3.5" /> Upload file
        </TabsTrigger>
        <TabsTrigger value="paste">
          <ClipboardPaste className="mr-1.5 size-3.5" /> Paste text
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload">
        <ResumeDropzone
          maxSizeMb={maxSizeMb}
          onUploaded={() => {
            toast.success("Resume uploaded");
            router.refresh();
          }}
        />
      </TabsContent>

      <TabsContent value="paste" className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="resume-title">Title (optional)</Label>
          <Input
            id="resume-title"
            placeholder="e.g. Software Engineer resume"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="resume-text">Resume text</Label>
          <Textarea
            id="resume-text"
            className="min-h-[220px]"
            placeholder="Paste your full resume here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="text-right text-xs text-muted-foreground/60">{text.length} characters</div>
        </div>
        <Button className="w-full" disabled={text.trim().length < MIN_CHARS} loading={saving} onClick={savePasted}>
          Save resume
        </Button>
      </TabsContent>
    </Tabs>
  );
}
