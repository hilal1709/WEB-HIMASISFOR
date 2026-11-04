import { cn } from "@/lib/utils";

/** Aceternity "Moving Border" — border berputar (CSS conic-gradient). */
export default function MovingBorderButton({ as: Tag = "button", children, className, innerClassName, ...props }) {
  return (
    <Tag className={cn("group relative inline-flex overflow-hidden rounded-full p-[2px] cursor-pointer", className)} {...props}>
      <span aria-hidden="true" className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#fecaca_0%,#dc2626_50%,#fecaca_100%)]" />
      <span className={cn("relative inline-flex h-full w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 transition-colors group-hover:bg-brand-50", innerClassName)}>
        {children}
      </span>
    </Tag>
  );
}
