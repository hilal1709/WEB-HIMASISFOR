"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { createTimeline, stagger } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Loader rute FAQ: tiga kartu katalog dibolak-balik di atas batang laci seperti jari yang mencari
 * kartu, lalu kartu depan terangkat. Berulang. Reduced-motion → tumpukan diam. Bukan spinner.
 */
export function CatalogLoader({ label = "Membuka lemari katalog…" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const cards = el.querySelectorAll("[data-card]");
    const tl = createTimeline({ loop: true, defaults: { ease: "outCubic" } });
    tl.add(cards, { rotateX: [0, -58, 0], translateY: [0, -6, 0], duration: 620, delay: stagger(140) })
      .add(cards[cards.length - 1], { translateY: [0, -34], rotate: [0, -4], duration: 520, ease: "outBack(1.8)" })
      .add(cards[cards.length - 1], { translateY: 0, rotate: 0, duration: 420, ease: "inOutQuad" }, "+=420");
    return () => tl.revert();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-cream">
      <div ref={ref} role="status" aria-label={label} className="flex flex-col items-center">
        <div className="relative h-[110px] w-[140px] [perspective:500px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              data-card
              className="absolute left-1/2 block h-[74px] w-[118px] -translate-x-1/2 rounded-[3px] border border-navy/25 bg-white shadow-[0_10px_18px_-14px_rgb(20_33_61/0.6)] [transform-origin:50%_100%]"
              style={{ bottom: 18 + i * 7, marginLeft: (i - 1) * 4, zIndex: i }}
            >
              <span className="absolute inset-x-3 top-3 h-px bg-maroon/60" />
              <span className="absolute left-3 top-6 h-1 w-14 rounded bg-navy/15" />
              <span className="absolute left-3 top-9 h-1 w-10 rounded bg-navy/10" />
              {i === 2 && <span className="absolute right-3 top-5 font-serif text-lg italic leading-none text-maroon">?</span>}
            </span>
          ))}
          <span aria-hidden className="absolute inset-x-1 bottom-2 h-[8px] rounded-[2px] bg-maroon" />
          <span aria-hidden className="absolute left-1/2 bottom-[3px] size-2 -translate-x-1/2 rounded-full bg-gold" />
        </div>
        <p className="mt-6 font-serif text-xl text-navy">{label}</p>
      </div>
    </div>
  );
}
