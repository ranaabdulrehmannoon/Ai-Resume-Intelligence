"use client";

import { useState } from "react";
import { ClipboardPaste, Upload } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ResumeDropzone } from "./resume-dropzone";

interface JobDescriptionFormProps {
  maxSizeMb: number;
  onSubmit: (data: { title: string; company: string; location: string; text: string }) => void;
  submitting?: boolean;
}

export function JobDescriptionForm({ onSubmit, submitting, maxSizeMb }: JobDescriptionFormProps) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [text, setText] = useState("");
  const [tab, setTab] = useState("paste");

  const canSubmit = text.trim().length >= 60;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="jd-title">Job Title</Label>
          <Input
            id="jd-title"
            placeholder="e.g. Senior Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jd-company">Company</Label>
          <Input
            id="jd-company"
            placeholder="e.g. Acme Corp"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jd-location">Location</Label>
          <Input
            id="jd-location"
            placeholder="e.g. Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="paste">
            <ClipboardPaste className="mr-1.5 size-3.5" /> Paste text
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="mr-1.5 size-3.5" /> Upload file
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paste">
          <Label htmlFor="jd-text" className="mb-2 block">
            Job Description *
          </Label>
          <Textarea
            id="jd-text"
            placeholder="Paste the full job description here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[220px]"
          />
          <div className="mt-1 text-right text-xs text-muted-foreground/60">
            {text.length} characters
          </div>
        </TabsContent>

        <TabsContent value="upload">
          <ResumeDropzone
            endpoint="/api/documents/extract"
            maxSizeMb={maxSizeMb}
            onUploaded={(result) => {
              if (typeof result.text === "string") {
                setText(result.text);
                setTab("paste");
              }
            }}
          />
          <p className="mt-2 text-xs text-muted-foreground/60">
            The extracted text will appear in the &quot;Paste text&quot; tab so you can review it before continuing.
          </p>
        </TabsContent>
      </Tabs>

      <Button
        className="w-full"
        disabled={!canSubmit}
        loading={submitting}
        onClick={() => onSubmit({ title, company, location, text })}
      >
        Continue
      </Button>
    </div>
  );
}
