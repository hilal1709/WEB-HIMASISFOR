"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { animate, svg } from "animejs";
import { CATEGORIES, RUBRICS } from "@/lib/berita-content";
import { prefersReducedMotion } from "@/lib/motion";
import { Container } from "@/components/home/shared";
import { DotsLoader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { useWarta } from "./warta-provider";

const INK = "M3 9c18-5 38-6 58-3s40 3 56-1";

/**
 * Indeks rubrik sticky ala daftar isi koran. Rubrik aktif digarisbawahi coretan tinta emas yang
 * digambar ulang (anime.js) setiap berganti; ←/→ berpindah rubrik. Kanan: cari ber-debounce.
 * Baris kedua: chip kategori rubrik aktif (klik lagi = lepas).
 */
export function RubricIndex() {
  const { rubric, pickRubric, results, rawQuery, setRawQuery, query, busy, category, pickCategory } = useWarta();
  const ref = useRef(null);

  useEffect(() => {
    const path = ref.current?.querySelector(`[data-ink="${rubric}"]`);
    if (!path) return;
    if (prefersReducedMotion()) return;
    const [d] = svg.createDrawable(path);
    const a = animate(d, { draw: ["0 0", "0 1"], duration: 650, ease: "inOutQuad" });
    return () => a.revert();
  }, [rubric]);

  const onKey = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = RUBRICS.findIndex((r) => r.key === rubric);
    const n = RUBRICS[(i + (e.key === "ArrowRight" ? 1 : RUBRICS.length - 1)) % RUBRICS.length];
    pickRubric(n.key);
    ref.current?.querySelector(`[data-tab="${n.key}"]`)?.focus();
  };

  const cats = CATEGORIES[rubric];
  const total = results[rubric].length;

  return (
    <div id="rubrik" className="sticky top-16 z-30 scroll-mt-16 border-y border-navy/15 bg-cream/95 backdrop-blur-sm">
      <Container>
        <div ref={ref} className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between md:py-2">
          <div role="tablist" aria-label="Rubrik Warta" onKeyDown={onKey} className="-mx-1 flex items-end gap-1 overflow-x-auto px-1 md:gap-4">
            {RUBRICS.map((r) => {
              const on = rubric === r.key;
              return (
                <button
                  key={r.key}
                  role="tab"
                  data-tab={r.key}
                  aria-selected={on}
                  aria-controls={`panel-${r.key}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => pickRubric(r.key)}
                  className={cn("group relative shrink-0 px-3 pb-3 pt-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60", on ? "text-navy" : "text-text/50 hover:text-navy")}
                >
                  <span className="font-serif text-[1.35rem] leading-none md:text-2xl">{r.label}</span>
                  <sup className={cn("ml-1 tabular text-xs font-semibold", on ? "text-maroon" : "text-text/40")}>{results[r.key].length}</sup>
                  <svg aria-hidden viewBox="0 0 120 14" preserveAspectRatio="none" className="absolute inset-x-2 bottom-0.5 h-3 w-[calc(100%-1rem)] overflow-visible">
                    {on ? (
                      <path data-ink={r.key} d={INK} fill="none" stroke="var(--gold)" strokeWidth="3.2" strokeLinecap="round" />
                    ) : (
                      <path d={INK} fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" className="opacity-0 transition-opacity group-hover:opacity-40" />
                    )}
                  </svg>
                </button>
              );
            })}
          </div>

          <label className="relative flex h-11 items-center gap-2 rounded-md border border-navy/15 bg-white px-3 focus-within:border-navy/40 md:w-80">
            <svg aria-hidden viewBox="0 0 20 20" className="size-4 shrink-0 text-text/45">
              <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M13.2 13.2 17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="sr-only">Cari di Warta</span>
            <input
              type="search"
              value={rawQuery}
              onChange={(e) => setRawQuery(e.target.value)}
              placeholder="Cari judul, kategori, tempat…"
              className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-text/40 [&::-webkit-search-cancel-button]:hidden"
            />
            {busy && rawQuery ? (
              <DotsLoader className="text-gold [&>span]:size-1.5" />
            ) : (
              rawQuery && (
                <button type="button" onClick={() => setRawQuery("")} className="text-xs font-semibold text-maroon hover:underline">
                  Hapus
                </button>
              )
            )}
          </label>
        </div>

        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-3">
          {cats.map((c) => {
            const on = category === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => pickCategory(c)}
                className={cn(
                  "shrink-0 rounded border px-2.5 py-1 text-[13px] font-medium transition-[background-color,color,border-color] duration-300",
                  on ? "border-navy bg-navy text-white" : "border-navy/15 bg-white text-text/70 hover:border-navy/40 hover:text-navy"
                )}
              >
                {c}
              </button>
            );
          })}
          <span aria-live="polite" className="ml-auto shrink-0 pl-3 text-xs text-text/50">
            {query ? `${total} hasil untuk "${rawQuery.trim()}"` : ""}
          </span>
        </div>
      </Container>
    </div>
  );
}
