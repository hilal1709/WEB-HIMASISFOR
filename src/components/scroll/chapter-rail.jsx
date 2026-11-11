"use client";
import { useSmooth } from "./smooth-scroll";
import { cn } from "@/lib/utils";

/** Indikator babak di sisi kiri (desktop lebar). Klik = lompat ke babak. */
export function ChapterRail({ chapters }) {
  const { active, scrollToScene } = useSmooth();
  const current = Math.max(0, chapters.findIndex((c) => c.id === active));
  return (
    <nav aria-label="Babak halaman" className="fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 mix-blend-difference xl:block">
      <ol className="flex flex-col gap-0.5">
        {chapters.map((c, i) => {
          const on = i === current;
          return (
            <li key={c.id}>
              <button onClick={() => scrollToScene(c.id)} aria-current={on ? "step" : undefined} className="group flex items-center gap-3 py-1.5 text-white">
                <span
                  className={cn(
                    "block h-px bg-white transition-all duration-500 ease-cinematic",
                    on ? "w-10" : i < current ? "w-5 opacity-60" : "w-3 opacity-35 group-hover:w-6"
                  )}
                />
                <span
                  className={cn(
                    "text-[11px] font-medium tracking-wide transition-all duration-500 ease-cinematic",
                    "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-90"
                  )}
                >
                  <span className="mr-1.5 font-mono tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {c.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
