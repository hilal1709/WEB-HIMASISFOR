import LottiePlayer from "./LottiePlayer";
import { cn } from "@/lib/utils";

/** Empty state dengan ilustrasi Lottie. */
export default function EmptyState({ title = "Belum ada data", description, action, illustration = "empty", className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center", className)}>
      <LottiePlayer name={illustration} className="w-36 sm:w-44" ariaLabel={title} />
      <h3 className="mt-2 text-lg font-semibold text-zinc-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
