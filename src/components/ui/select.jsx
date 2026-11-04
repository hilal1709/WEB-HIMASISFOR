import * as React from "react";
import { cn } from "@/lib/utils";

/** Select native bergaya shadcn — ringan dan aksesibel untuk form CMS. */
function NativeSelect({ className, children, ...props }) {
  return (
    <select
      data-slot="select"
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[box-shadow,border-color] cursor-pointer",
        "focus-visible:border-brand-400 focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { NativeSelect };
