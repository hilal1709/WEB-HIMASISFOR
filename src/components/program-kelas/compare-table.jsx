"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { animate, stagger, svg, utils } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { useKelas } from "./kelas-provider";
import { cellOf } from "@/lib/program-kelas-cms/schema";

const sig = (v) => `${v.kind}:${v.kind === "text" ? v.text.trim().toLowerCase() : ""}`;
const same = (vals) => vals.every((v) => sig(v) === sig(vals[0]));

function Check({ label }) {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={label} className="size-6 text-maroon">
      <circle cx="12" cy="12" r="10" fill="var(--gold)" fillOpacity="0.18" />
      <path data-check d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Cross({ label }) {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={label} className="size-5 text-text/30">
      <path d="M8 8l8 8M16 8l-8 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Tabel perbandingan kelas (div-grid agar baris bisa dianimasikan tingginya).
 * - Kolom kelas aktif / di-hover tersorot (latar cream + garis atas emas); klik judul kolom = pilih kelas.
 * - Centang tergambar (anime.js) saat tabel pertama kali terlihat.
 * - "Perbedaan saja" melipat baris yang nilainya sama di semua kelas.
 * Ponsel: tabel bisa digeser horizontal dengan kolom label menempel.
 */
export function CompareTable() {
  const { c, classes, active, setActive } = useKelas();
  const t = c.compare;
  const [hover, setHover] = useState(null);
  const [diffOnly, setDiffOnly] = useState(false);
  const ref = useRef(null);
  const lit = hover ?? active;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const checks = el.querySelectorAll("[data-check]");
    const d = svg.createDrawable(checks);
    utils.set(d, { draw: "0 0" });
    let anim;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        anim = animate(d, { draw: ["0 0", "0 1"], duration: 600, delay: stagger(60), ease: "outCubic" });
        io.disconnect();
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      anim?.revert?.();
    };
  }, [t.rows.length, classes.length]);

  const n = classes.length;
  const cols = { gridTemplateColumns: `minmax(150px,1.1fr) repeat(${n}, minmax(150px,1fr))` };

  return (
    <section id="banding" className="scroll-mt-24 py-16 md:py-20">
      <Container>
        <SectionHeader
          title={t.title}
          body={t.body}
          action={
            <div className="flex flex-wrap items-center gap-3">
              <label className="group inline-flex cursor-pointer select-none items-center gap-3 text-[14px] font-medium text-navy">
                <input type="checkbox" className="peer sr-only" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} />
                <span aria-hidden className="relative h-6 w-11 rounded-full bg-cream-2 transition-colors duration-300 peer-checked:bg-navy peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-checked:[&>span]:translate-x-5">
                  <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 ease-cinematic" />
                </span>
                {t.diffLabel}
              </label>
            </div>
          }
        />

        <div ref={ref} className="mt-10 overflow-x-auto rounded-lg border border-line bg-white [scrollbar-width:thin]" data-aos="fade-up">
          <div role="table" aria-label={t.title.join(" ")} style={{ minWidth: 150 + n * 150 }} onMouseLeave={() => setHover(null)}>
            {/* header */}
            <div role="row" className="grid border-b border-line" style={cols}>
              <div role="columnheader" className="sticky left-0 z-10 bg-white p-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-text/45 md:p-5">
                {t.aspectLabel}
              </div>
              {classes.map((k, i) => (
                <div key={k.key} role="columnheader" onMouseEnter={() => setHover(i)} className={cn("relative p-2 transition-colors duration-300", lit === i && "bg-cream")}>
                  <span aria-hidden className={cn("absolute inset-x-0 top-0 h-[3px] origin-left bg-gold transition-transform duration-500 ease-cinematic", lit === i ? "scale-x-100" : "scale-x-0")} />
                  <button type="button" onClick={() => setActive(i)} aria-pressed={active === i} className="w-full rounded-md p-2 text-left md:p-3">
                    <span className="kicker block text-[11px] text-text/45">{String(i + 1).padStart(2, "0")}</span>
                    <span className={cn("mt-1 block font-serif text-[1.15rem] leading-tight transition-colors md:text-[1.3rem]", lit === i ? "text-maroon" : "text-navy")}>{k.short}</span>
                  </button>
                </div>
              ))}
            </div>
            {/* baris */}
            {t.rows.map((r, ri) => {
              const vals = classes.map((k) => cellOf(r, k.key));
              const hidden = diffOnly && same(vals);
              return (
                <div key={`${r.label}-${ri}`} className={cn("grid transition-[grid-template-rows,opacity] duration-500 ease-cinematic", hidden ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100")} aria-hidden={hidden}>
                  <div className="overflow-hidden">
                    <div role="row" className="grid border-b border-line/70" style={cols}>
                      <div role="rowheader" className="sticky left-0 z-10 flex items-center bg-white px-4 py-3.5 text-[14px] text-text/70 md:px-5">
                        {r.label}
                      </div>
                      {vals.map((v, i) => (
                        <div
                          key={i}
                          role="cell"
                          onMouseEnter={() => setHover(i)}
                          className={cn("flex items-center px-4 py-3.5 text-[14.5px] font-medium text-navy transition-colors duration-300 md:px-5", lit === i && "bg-cream")}
                        >
                          {v.kind === "yes" ? <Check label={t.yesLabel} /> : v.kind === "no" ? <Cross label={t.noLabel} /> : v.text || "—"}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-text/50">
          <span className="md:hidden">{t.swipeHint}</span>
          {classes.some((k) => k.sample) && <PlaceholderTag>{c.seo.sampleNote}</PlaceholderTag>}
        </div>
      </Container>
    </section>
  );
}
