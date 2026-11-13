"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { animate, createTimeline, stagger } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Loader rute Beasiswa: tiga keping koin "Rp" jatuh bertumpuk satu per satu ke atas alas, lalu garis emas
 * di bawahnya terisi. Berulang. Reduced-motion → tumpukan diam. Bukan spinner (PRODUCT.md).
 */
export function CoinLoader({ label = "Menghitung beasiswa…" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const coins = el.querySelectorAll("[data-coin]");
    const tl = createTimeline({ loop: true, defaults: { ease: "outBounce" } });
    tl.add(coins, { translateY: [-90, 0], opacity: [0, 1], rotate: [-25, 0], duration: 650, delay: stagger(260) })
      .add(el.querySelector("[data-bar]"), { scaleX: [0, 1], duration: 700, ease: "inOutQuart" }, "-=500")
      .add(coins, { opacity: 0, translateY: -8, duration: 260, delay: stagger(60, { from: "last" }), ease: "inQuad" }, "+=350");
    const word = animate(el.querySelector("[data-word]"), { opacity: [0, 1], translateY: [8, 0], duration: 600, ease: "outCubic" });
    return () => {
      tl.revert();
      word.revert();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-cream">
      <div ref={ref} role="status" aria-label={label} className="flex flex-col items-center">
        <div className="relative h-[120px] w-[96px]">
          {[2, 1, 0].map((i) => (
            <span
              key={i}
              data-coin
              className="absolute left-1/2 grid h-[26px] w-[88px] -translate-x-1/2 place-items-center rounded-[50%] border-2 border-navy/70 bg-gold font-serif text-[13px] font-semibold italic text-navy"
              style={{ bottom: 8 + (2 - i) * 20, zIndex: 3 - i }}
            >
              Rp
            </span>
          ))}
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-[6px] rounded-full bg-navy" />
        </div>
        <p data-word className="mt-6 font-serif text-xl text-navy">{label}</p>
        <span className="mt-4 block h-0.5 w-36 overflow-hidden rounded-full bg-line">
          <span data-bar className="block h-full w-full origin-left bg-gold" />
        </span>
      </div>
    </div>
  );
}
