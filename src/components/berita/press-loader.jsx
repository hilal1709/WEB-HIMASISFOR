"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { createTimeline, stagger } from "animejs";

/**
 * Loader rute Warta — "mesin cetak": masthead muncul, garis rangkap memanjang, lalu baris tiga kolom
 * koran tercetak berurutan (anime.js) dan berulang. Bukan spinner.
 */
export function PressLoader({ label = "Memuat…" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tl = createTimeline({ loop: true, defaults: { ease: "outQuart" } });
    tl.add(el.querySelectorAll("[data-pl-rule]"), { scaleX: [0, 1], duration: 500, delay: stagger(80) })
      .add(el.querySelectorAll("[data-pl-line]"), { scaleX: [0, 1], opacity: [0.3, 1], duration: 260, delay: stagger(45, { grid: [3, 6], from: "first", axis: "y" }) }, "-=150")
      .add(el.querySelectorAll("[data-pl-line]"), { opacity: [1, 0.15], duration: 500, delay: 300 })
      .add(el.querySelectorAll("[data-pl-rule]"), { scaleX: [1, 0], duration: 300 }, "-=300");
    return () => tl.revert();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-cream">
      <div ref={ref} role="status" aria-label={label} className="w-[min(320px,80vw)]">
        <p className="text-center font-serif text-4xl text-navy">
          Warta <em className="italic text-maroon">SISFOR</em>
        </p>
        <span data-pl-rule className="mt-3 block h-[3px] origin-left bg-navy" />
        <span data-pl-rule className="mt-[3px] block h-px origin-left bg-navy" />
        <div className="mt-4 grid grid-cols-3 gap-4">
          {[0, 1, 2].map((c) => (
            <div key={c} className="space-y-2">
              {Array.from({ length: 6 }, (_, r) => (
                <span key={r} data-pl-line className={`block h-1.5 origin-left rounded-full ${r === 0 ? "bg-maroon" : "bg-navy/25"}`} style={{ width: `${r === 5 ? 60 : 100}%` }} />
              ))}
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-text/55">{label}</p>
      </div>
    </div>
  );
}
