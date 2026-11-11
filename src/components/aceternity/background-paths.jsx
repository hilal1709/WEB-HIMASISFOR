import { cn } from "@/lib/utils";

/**
 * Background Paths (pola 21st.dev): kurva tipis yang "mengalir" lewat stroke-dashoffset.
 * Dekoratif — taruh di container `relative overflow-hidden`.
 */
export function BackgroundPaths({ className, count = 18, color = "currentColor" }) {
  const paths = Array.from({ length: count }, (_, i) => {
    const o = i * 14;
    return `M-${380 - o} -${189 + i * 6}C-${380 - o} -${189 + i * 6} -${312 - o} ${216 - i * 6} ${152 - o} ${343 - i * 6}C${616 - o} ${470 - i * 6} ${684 - o} ${875 - i * 6} ${684 - o} ${875 - i * 6}`;
  });
  return (
    <svg aria-hidden viewBox="0 0 696 316" fill="none" preserveAspectRatio="none" className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}>
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={0.5 + i * 0.03}
          strokeOpacity={0.08 + i * 0.02}
          pathLength={1}
          className="bg-path"
          style={{ animationDelay: `${-i * 1.3}s`, animationDuration: `${18 + (i % 5) * 3}s` }}
        />
      ))}
    </svg>
  );
}
