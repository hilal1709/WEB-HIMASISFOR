"use client";
import { useEffect, useRef, useState } from "react";
import { animate, stagger, svg, utils } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { useKelas } from "./kelas-provider";

const same = (vals) => vals.every((v) => v === vals[0]);

function Check() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Ya" className="size-6 text-maroon">
      <circle cx="12" cy="12" r="10" fill="var(--gold)" fillOpacity="0.18" />
      <path data-check d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Cross() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Tidak" className="size-5 text-text/30">
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
  const { classes, compare, active, setActive } = useKelas();
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
  }, []);

  const cols = "grid-cols-[150px_repeat(3,minmax(150px,1fr))] md:grid-cols-[1.1fr_repeat(3,1fr)]";

  return (
    <section id="banding" className="scroll-mt-24 py-16 md:py-24">
      <Container>
        <SectionHeader
          title={["Bandingkan", "berdampingan"]}
          body="Gelar, kurikulum, dan dosen tetap sama. Lihat bagian mana yang berbeda."
          action={
            <div className="flex flex-wrap items-center gap-3">
              <label className="group inline-flex cursor-pointer select-none items-center gap-3 text-[14px] font-medium text-navy">
                <input type="checkbox" className="peer sr-only" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} />
                <span aria-hidden className="relative h-6 w-11 rounded-full bg-cream-2 transition-colors duration-300 peer-checked:bg-navy peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-checked:[&>span]:translate-x-5">
                  <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 ease-cinematic" />
                </span>
                Perbedaan saja
              </label>
            </div>
          }
        />

        <div ref={ref} className="mt-10 overflow-x-auto rounded-lg border border-line bg-white [scrollbar-width:thin]" data-aos="fade-up">
          <div role="table" aria-label="Perbandingan program kelas" className="min-w-[600px]" onMouseLeave={() => setHover(null)}>
            {/* header */}
            <div role="row" className={cn("grid border-b border-line", cols)}>
              <div role="columnheader" className="sticky left-0 z-10 bg-white p-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-text/45 md:p-5">
                Aspek
              </div>
              {classes.map((c, i) => (
                <div key={c.key} role="columnheader" onMouseEnter={() => setHover(i)} className={cn("relative p-2 transition-colors duration-300", lit === i && "bg-cream")}>
                  <span aria-hidden className={cn("absolute inset-x-0 top-0 h-[3px] origin-left bg-gold transition-transform duration-500 ease-cinematic", lit === i ? "scale-x-100" : "scale-x-0")} />
                  <button type="button" onClick={() => setActive(i)} aria-pressed={active === i} className="w-full rounded-md p-2 text-left md:p-3">
                    <span className="kicker block text-[11px] text-text/45">{String(i + 1).padStart(2, "0")}</span>
                    <span className={cn("mt-1 block font-serif text-[1.15rem] leading-tight transition-colors md:text-[1.3rem]", lit === i ? "text-maroon" : "text-navy")}>{c.short}</span>
                  </button>
                </div>
              ))}
            </div>
            {/* baris */}
            {compare.map((r) => {
              const hidden = diffOnly && same(r.values);
              return (
                <div key={r.label} className={cn("grid transition-[grid-template-rows,opacity] duration-500 ease-cinematic", hidden ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100")} aria-hidden={hidden}>
                  <div className="overflow-hidden">
                    <div role="row" className={cn("grid border-b border-line/70", cols)}>
                      <div role="rowheader" className="sticky left-0 z-10 flex items-center bg-white px-4 py-3.5 text-[14px] text-text/70 md:px-5">
                        {r.label}
                      </div>
                      {r.values.map((v, i) => (
                        <div
                          key={i}
                          role="cell"
                          onMouseEnter={() => setHover(i)}
                          className={cn("flex items-center px-4 py-3.5 text-[14.5px] font-medium text-navy transition-colors duration-300 md:px-5", lit === i && "bg-cream")}
                        >
                          {v === true ? <Check /> : v === false ? <Cross /> : v}
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
          <span className="md:hidden">Geser tabel ke samping untuk melihat semua kelas.</span>
          {classes.some((c) => c.sample) && <PlaceholderTag />}
        </div>
      </Container>
    </section>
  );
}
