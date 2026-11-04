import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-lg bg-[linear-gradient(110deg,#f4f4f5_8%,#fee2e2_18%,#f4f4f5_33%)] bg-[length:200%_100%] animate-shimmer",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
