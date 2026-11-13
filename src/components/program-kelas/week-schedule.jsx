"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { DAYS, HOURS } from "@/lib/program-kelas-content";
import { countUp, prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { useKelas } from "./kelas-provider";

const ROW = 38; // px per jam
const fmt = (h) => `${String(Math.floor(h)).padStart(2, "0")}.${h % 1 ? String(Math.round((h % 1) * 60)).padStart(2, "0") : "00"}`;

const KIND = {
  class: { box: "bg-maroon text-white", label: "Tatap muka" },
  online: { box: "border border-dashed border-navy/40 bg-white text-navy", label: "Daring sinkron" },
  industry: { box: "bg-gold/25 text-navy border-l-[3px] border-gold", label: "Blok industri" },
};
const kindOf = (b) => (b.industry ? "industry" : b.online ? "online" : "class");

/**
 * "Seminggu di kelas X": kalender mingguan (Sen–Min × jam) untuk kelas aktif.
 * Blok tumbuh dari atas berurutan (anime.js) setiap ganti kelas; hover satu blok meredupkan
 * yang lain dan memunculkan tooltip jam. Garis emas "sekarang" bila jam saat ini di dalam rentang.
 * Ponsel: daftar per hari.
 */
export function WeekSchedule() {
  const { classes, active, setActive } = useKelas();
  const item = classes[active];
  const grid = useRef(null);
  const total = useRef(null);
  const [now, setNow] = useState(null);
  const hours = Array.from({ length: HOURS.end - HOURS.start + 1 }, (_, i) => HOURS.start + i);
  const totalHours = item.week.reduce((n, b) => n + (b.end - b.start), 0);

  useEffect(() => {
    const d = new Date();
    const h = d.getHours() + d.getMinutes() / 60;
    if (h >= HOURS.start && h <= HOURS.end) setNow({ day: (d.getDay() + 6) % 7, h });
  }, []);

  useEffect(() => {
    countUp(total.current, totalHours, { duration: 900, format: (v) => String(v) });
    const el = grid.current;
    if (!el || prefersReducedMotion()) return;
    const a = animate(el.querySelectorAll("[data-block]"), {
      scaleY: [0, 1],
      opacity: [0, 1],
      duration: 650,
      delay: stagger(45),
      ease: "outExpo",
      // lepas gaya inline agar redup-saat-hover (CSS) bisa bekerja
      onComplete: (anim) => anim.revert(),
    });
    return () => a.revert?.();
  }, [active, totalHours]);

  return (
    <section className="bg-cream-2/60 py-16 md:py-20">
      <Container>
        <SectionHeader
          title={["Seminggu di", item.name]}
          body="Gambaran jadwal tatap muka dalam satu minggu perkuliahan. Ganti kelas untuk membandingkan ritmenya."
          action={
            <div className="flex items-end gap-3">
              <p className="font-serif text-[2.75rem] leading-none text-maroon">
                <span ref={total}>{totalHours}</span>
              </p>
              <p className="pb-1 text-[13px] leading-tight text-text/55">jam kuliah<br />per minggu</p>
            </div>
          }
        />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Ganti kelas">
            {classes.map((c, i) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                className={cn(
                  "rounded-md border px-3.5 py-1.5 text-[13.5px] font-semibold transition-[background-color,border-color,color] duration-300",
                  i === active ? "border-navy bg-navy text-white" : "border-line bg-white text-navy/70 hover:border-navy/30 hover:text-navy"
                )}
              >
                {c.short}
              </button>
            ))}
          </div>
          <ul className="flex flex-wrap gap-4 text-[12.5px] text-text/60">
            {Object.entries(KIND).map(([k, v]) => (
              <li key={k} className="flex items-center gap-2">
                <span aria-hidden className={cn("size-3 rounded-sm", v.box)} />
                {v.label}
              </li>
            ))}
          </ul>
        </div>

        {/* kalender (≥ md) */}
        <div className="mt-6 hidden rounded-lg border border-line bg-white md:block" data-aos="fade-up">
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-line">
            <span />
            {DAYS.map((d, i) => (
              <span key={d} className={cn("py-3 text-center text-[12px] font-semibold uppercase tracking-[0.14em]", i >= 5 ? "text-maroon" : "text-text/50", now?.day === i && "text-navy")}>
                {d}
                {now?.day === i && <span aria-hidden className="mx-auto mt-1 block size-1 rounded-full bg-gold" />}
              </span>
            ))}
          </div>
          <div
            ref={grid}
            className="relative grid grid-cols-[56px_repeat(7,1fr)] [&:has([data-block]:hover)_[data-block]:not(:hover)]:opacity-35"
            style={{ height: (HOURS.end - HOURS.start) * ROW }}
          >
            {/* garis jam */}
            <div className="pointer-events-none absolute inset-0">
              {hours.slice(0, -1).map((h, i) => (
                <div key={h} className="absolute inset-x-0 border-t border-line/70" style={{ top: i * ROW }}>
                  <span className="tabular absolute left-2 top-1 text-[11px] text-text/40">{fmt(h)}</span>
                </div>
              ))}
            </div>
            <span />
            {DAYS.map((d, di) => (
              <div key={d} className={cn("relative border-l border-line/70", di >= 5 && "bg-cream/50")}>
                {item.week
                  .filter((b) => b.day === di)
                  .map((b) => {
                    const k = kindOf(b);
                    return (
                      <div
                        key={`${active}-${b.label}-${b.start}`}
                        data-block
                        tabIndex={0}
                        className={cn(
                          "group/b absolute inset-x-1.5 origin-top cursor-default rounded-md px-2 py-1.5 text-[12px] leading-snug outline-none transition-[opacity,box-shadow,transform] duration-300 hover:z-10 hover:shadow-[0_14px_28px_-16px_rgb(20_33_61/0.6)] focus-visible:ring-2 focus-visible:ring-gold",
                          KIND[k].box
                        )}
                        style={{ top: (b.start - HOURS.start) * ROW + 2, height: (b.end - b.start) * ROW - 4 }}
                      >
                        <span className="line-clamp-2 font-semibold">{b.label}</span>
                        <span className="tabular block opacity-75">{fmt(b.start)}</span>
                        <span
                          role="tooltip"
                          className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[calc(100%+6px)] whitespace-nowrap rounded-md bg-navy px-2.5 py-1.5 text-[11.5px] text-white opacity-0 shadow-lg transition-[opacity,transform] duration-200 group-hover/b:-translate-y-[calc(100%+10px)] group-hover/b:opacity-100 group-focus-visible/b:opacity-100"
                        >
                          {DAYS[di]} · {fmt(b.start)}–{fmt(b.end)} · {KIND[k].label}
                        </span>
                      </div>
                    );
                  })}
                {now?.day === di && (
                  <span aria-hidden className="absolute inset-x-0 z-[5] h-[2px] bg-gold" style={{ top: (now.h - HOURS.start) * ROW }}>
                    <span className="absolute -left-1 -top-[3px] size-2 rounded-full bg-gold" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* daftar (ponsel) */}
        <ol key={active} className="mt-6 divide-y divide-line overflow-hidden rounded-lg border border-line bg-white md:hidden">
          {DAYS.map((d, di) => {
            const blocks = item.week.filter((b) => b.day === di);
            return (
              <li key={d} className="grid grid-cols-[52px_1fr] gap-3 px-4 py-3 animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both" style={{ animationDelay: `${di * 40}ms` }}>
                <span className={cn("pt-1 text-[12px] font-semibold uppercase tracking-[0.14em]", di >= 5 ? "text-maroon" : "text-text/50")}>{d}</span>
                {blocks.length ? (
                  <ul className="space-y-1.5">
                    {blocks.map((b) => (
                      <li key={b.label + b.start} className={cn("rounded-md px-3 py-2 text-[13px]", KIND[kindOf(b)].box)}>
                        <span className="font-semibold">{b.label}</span>
                        <span className="tabular block text-[12px] opacity-75">{fmt(b.start)}–{fmt(b.end)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="py-1 text-[13px] text-text/40">Libur kuliah</span>
                )}
              </li>
            );
          })}
        </ol>
        {item.sample && <PlaceholderTag className="mt-4" />}
      </Container>
    </section>
  );
}
