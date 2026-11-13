"use client";
import { useLayoutEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, FreeMode } from "swiper/modules";
import "swiper/css";
import { gsap, Flip } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useFaq } from "./faq-provider";

/** Muka laci: tempat label berbingkai emas + pegangan kuningan. Laci aktif "tertarik" keluar. */
function DrawerFace({ code, label, count, active, onClick, className, flipId }) {
  const empty = count === 0;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn("fq-drawer group", active && "is-open", empty && !active && "is-empty", className)}
    >
      <span className="fq-drawer-label">
        <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-text/45">{code}</span>
        <span className="mt-0.5 block font-serif text-[15px] leading-tight text-navy">{label}</span>
      </span>
      <span className="mt-3 flex items-center justify-between gap-2 px-1">
        <svg aria-hidden viewBox="0 0 40 12" className="h-3 w-10 text-gold transition-transform duration-500 ease-cinematic group-hover:translate-y-0.5">
          <path d="M4 3q16 12 32 0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="4" cy="3" r="2.2" fill="currentColor" />
          <circle cx="36" cy="3" r="2.2" fill="currentColor" />
        </svg>
        <span className="tabular text-[12px] font-semibold text-text/50">
          {count} <span className="sr-only">kartu</span>
        </span>
      </span>
      {active && <span data-flip-id={flipId} aria-hidden className="fq-drawer-mark" />}
    </button>
  );
}

/**
 * Rel laci: "Semua" + satu laci per topik. Angka di laci dihitung dari kartu yang lolos persona & kata kunci.
 * Penanda emas berpindah antar laci dengan GSAP Flip. Layar kecil: deret geser (Swiper free mode).
 */
export function DrawerRail() {
  const { drawers, drawer, setDrawer, counts, pool } = useFaq();
  const root = useRef(null);
  const flip = useRef(null);

  const choose = (key) => {
    if (root.current) flip.current = Flip.getState(root.current.querySelectorAll("[data-flip-id]"));
    setDrawer((cur) => (cur === key ? null : key));
  };

  useLayoutEffect(() => {
    if (!flip.current || prefersReducedMotion()) return;
    Flip.from(flip.current, { duration: 0.55, ease: "expo.out", targets: root.current.querySelectorAll("[data-flip-id]") });
    flip.current = null;
  }, [drawer]);

  const items = [{ id: null, code: "ALL", label: "Semua laci", count: pool.length }, ...drawers.map((d) => ({ id: d.key, code: d.code, label: d.label, count: counts[d.key] ?? 0 }))];

  return (
    <div ref={root} role="group" aria-label="Pilih laci topik">
      <div className="fq-cabinet hidden md:grid">
        {items.map((it) => (
          <DrawerFace key={it.code} {...it} active={drawer === it.id} flipId="laci-aktif" onClick={() => (it.id ? choose(it.id) : drawer && choose(drawer))} />
        ))}
      </div>
      <div className="-mx-5 md:hidden">
        <Swiper modules={[A11y, FreeMode]} freeMode slidesPerView="auto" spaceBetween={10} className="!px-5 !pb-4 !pt-1">
          {items.map((it) => (
            <SwiperSlide key={it.code} className="!w-[150px]">
              <DrawerFace {...it} active={drawer === it.id} flipId="laci-aktif-m" onClick={() => (it.id ? choose(it.id) : drawer && choose(drawer))} className="w-full" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
