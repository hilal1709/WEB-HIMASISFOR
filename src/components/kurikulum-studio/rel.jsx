"use client";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { animate } from "animejs";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, A11y, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { allCourses } from "@/lib/kurikulum-cms/lint";
import { cn } from "@/lib/utils";

const ROOTS = { pembuka: ["curtain", "hero"] };

/** Porsi teks yang terisi pada satu stasiun; untuk jadwal & pilihan = porsi mata kuliah ber-RPS. */
export function completion(value, key) {
  if (key === "semester" || key === "pilihan") {
    const list = allCourses(value).filter((x) => x.chapter === key && !x.c.slot);
    return list.length ? list.filter((x) => x.c.rps && (x.c.rps.deskripsi || x.c.rps.pdf || x.c.rps.minggu?.length)).length / list.length : 0;
  }
  let filled = 0;
  let total = 0;
  const walk = (v) => {
    if (typeof v === "string") (total++, v.trim() && filled++);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => k !== "lottie" && k !== "href" && walk(x));
  };
  (ROOTS[key] ?? [key]).forEach((k) => walk(value?.[k]));
  return total ? filled / total : 1;
}

function Ring({ pct, on }) {
  const ref = useRef(null);
  const prev = useRef(pct);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return void el.setAttribute("stroke-dasharray", `${pct} 1`);
    const o = { v: prev.current };
    const a = animate(o, { v: pct, duration: 700, ease: "outExpo", onUpdate: () => el.setAttribute("stroke-dasharray", `${o.v} 1`) });
    prev.current = pct;
    return () => a.pause();
  }, [pct]);
  return (
    <svg viewBox="0 0 28 28" className="absolute inset-0 size-full -rotate-90" aria-hidden>
      <circle cx="14" cy="14" r="12" fill="none" stroke={on ? "rgb(255 255 255 / 0.25)" : "var(--line)"} strokeWidth="2.5" />
      <circle ref={ref} cx="14" cy="14" r="12" fill="none" pathLength="1" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${pct} 1`} />
    </svg>
  );
}

/**
 * Rel stasiun di atas meja gambar: satu stasiun per bagian halaman. Kereta emas (shared layout) berpindah
 * ke stasiun aktif, cincin emas = kelengkapan isi, titik maroon = belum terbit, angka = sinyal pemeriksa.
 */
export function Rel({ chapters, active, onSelect, changed = [], signals = {}, value }) {
  const line = useRef(null);
  const idx = Math.max(0, chapters.findIndex((c) => c.key === active));

  useEffect(() => {
    if (!line.current || prefersReducedMotion()) return;
    const t = gsap.fromTo(line.current, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "expo.out", transformOrigin: "left center" });
    return () => t.kill();
  }, []);

  return (
    <nav aria-label="Stasiun Kartografer" className="relative">
      <div ref={line} aria-hidden className="absolute inset-x-6 top-[27px] h-[3px] rounded-full bg-[repeating-linear-gradient(90deg,var(--navy)_0_14px,transparent_14px_20px)] opacity-20" />
      <Swiper modules={[FreeMode, A11y, Mousewheel]} freeMode mousewheel={{ forceToAxis: true }} slidesPerView="auto" spaceBetween={0} className="!px-2">
        {chapters.map((c, i) => {
          const on = c.key === active;
          const passed = i < idx;
          const sig = signals[c.key]?.length ?? 0;
          return (
            <SwiperSlide key={c.key} className="!w-auto">
              <button
                type="button"
                onClick={() => onSelect(c.key)}
                aria-current={on ? "step" : undefined}
                className="group relative flex w-[104px] flex-col items-center px-1 pb-2 pt-3 text-center outline-none"
              >
                <span aria-hidden className={cn("absolute left-0 right-1/2 top-[27px] h-[3px] transition-colors duration-500", i === 0 ? "bg-transparent" : passed || on ? "bg-maroon" : "bg-transparent")} />
                <span aria-hidden className={cn("absolute left-1/2 right-0 top-[27px] h-[3px] transition-colors duration-500", i === chapters.length - 1 ? "bg-transparent" : passed ? "bg-maroon" : "bg-transparent")} />
                <span className={cn("relative grid size-7 place-items-center rounded-full border-2 transition-[transform,border-color,background-color] duration-300 group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-gold", on ? "border-maroon bg-maroon" : passed ? "border-maroon bg-white" : "border-navy/30 bg-white")}>
                  <Ring pct={completion(value, c.key)} on={on} />
                  <span className={cn("relative font-mono text-[10px] font-bold tabular-nums", on ? "text-white" : "text-navy/70")}>{String(i + 1).padStart(2, "0")}</span>
                  {changed.includes(c.key) && <span aria-label="Belum terbit" className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-paper bg-maroon" />}
                </span>
                {on && (
                  <motion.span layoutId="rel-train" aria-hidden transition={{ type: "spring", stiffness: 380, damping: 32 }} className="absolute top-0 flex h-2.5 w-9 items-center justify-center gap-0.5 rounded-sm bg-gold shadow-[0_6px_14px_-6px_rgb(201_162_39/0.9)]">
                    <span className="size-1 rounded-full bg-navy" />
                    <span className="size-1 rounded-full bg-navy" />
                    <span className="size-1 rounded-full bg-navy" />
                  </motion.span>
                )}
                <span className={cn("mt-2 line-clamp-2 text-[12px] leading-tight transition-colors", on ? "font-semibold text-navy" : "text-text/60 group-hover:text-navy")}>{c.label}</span>
                {sig > 0 && <span className="mt-1 rounded-full bg-gold/20 px-1.5 text-[10px] font-semibold tabular-nums text-navy">{sig} sinyal</span>}
              </button>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </nav>
  );
}
