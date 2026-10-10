import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-tight",
  {
    variants: {
      variant: {
        default: "bg-white/[0.04] text-muted-foreground border-white/[0.06]",
        success: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
        warning: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
        destructive: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
        info: "bg-primary/10 text-[#818CF8] border-primary/20",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
