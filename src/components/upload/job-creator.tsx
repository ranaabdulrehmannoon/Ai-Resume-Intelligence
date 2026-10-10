"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { JobDescriptionForm } from "./job-description-form";

/** Saves a job description then refreshes the server-rendered list beneath it. */
export function JobCreator({ maxSizeMb }: { maxSizeMb: number }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(data: { title: string; company: string; location: string; text: string }) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(typeof body?.error === "string" ? body.error : "Couldn't save the job description.");
        return;
      }
      toast.success("Job description saved");
      setFormKey((k) => k + 1); // reset the form
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return <JobDescriptionForm key={formKey} onSubmit={handleSubmit} submitting={submitting} maxSizeMb={maxSizeMb} />;
}
