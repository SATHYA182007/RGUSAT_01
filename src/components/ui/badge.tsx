import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "secondary" | "info";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-teal focus:ring-offset-2",
        {
          "border-transparent bg-primary-teal/10 text-primary-teal": variant === "default",
          "border-transparent bg-emerald-500/10 text-emerald-600": variant === "success",
          "border-transparent bg-amber-500/10 text-amber-600": variant === "warning",
          "border-transparent bg-rose-500/10 text-rose-600": variant === "danger",
          "border-transparent bg-slate-100 text-slate-800": variant === "secondary",
          "border-transparent bg-sky-500/10 text-sky-600": variant === "info",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
