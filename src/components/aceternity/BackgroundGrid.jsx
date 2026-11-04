import { cn } from "@/lib/utils";

/** Aceternity "Grid / Dot Background" dengan mask radial. */
export default function BackgroundGrid({ variant = "grid", className }) {
  const bg =
    variant === "dot"
      ? "[background-size:22px_22px] [background-image:radial-gradient(#e4e4e7_1px,transparent_1px)]"
      : "[background-size:44px_44px] [background-image:linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)]";
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      <div className={cn("absolute inset-0", bg)} />
      <div className="absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_75%)]" />
    </div>
  );
}
