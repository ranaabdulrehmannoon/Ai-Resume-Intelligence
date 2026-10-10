import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[160px] w-full rounded-lg border border-input bg-white/[0.03] px-3.5 py-3 text-sm text-foreground leading-relaxed",
          "placeholder:text-muted-foreground/70 transition-colors outline-none resize-y",
          "focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
