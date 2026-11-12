"use client";
import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { RUMPUN, RUMPUN_BY_KEY } from "@/lib/kurikulum-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { useKurikulum } from "./kurikulum-provider";
import { RumpunDot } from "./rumpun-dot";

export function RpsStatus({ course, tone = "light" }) {
  if (!course.rps) return <span className={cn("text-[12px]", tone === "light" ? "text-text/40" : "text-white/45")}>RPS menyusul</span>;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium", tone === "light" ? "text-navy" : "text-gold-soft")}>
      <span aria-hidden className="size-1.5 rounded-full bg-gold" />
      {course.rps.pdf ? "RPS + PDF" : course.rpsSample ? "Ringkasan contoh" : "Ringkasan RPS"}
    </span>
  );
}

/**
 * Buku Semester: angka semester serif raksasa (sticky, digit "ber-roll" saat berganti) dengan rail 1–8
 * dan progres SKS kumulatif; di kanan baris "tiket" mata kuliah dengan bar SKS proporsional.
 * Rumpun yang disorot (dari peta) meredupkan baris lain. Klik baris → laci RPS. ←/→ berpindah semester.
 */
export function SemesterLedger() {
  const { semesters, semester, setSemester, focus, setFocus, openRps, maxSks, totals } = useKurikulum();
  const idx = Math.max(0, semesters.findIndex((s) => s.semester === semester));
  const cur = semesters[idx];
  const list = useRef(null);
  const digit = useRef(null);
  const first = useRef(true);
  const cumulative = semesters.slice(0, idx + 1).reduce((t, s) => t + s.sks, 0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const rows = list.current?.querySelectorAll("[data-row]");
    const bars = list.current?.querySelectorAll("[data-bar]");
    const ctx = gsap.context(() => {
      gsap.fromTo(rows, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.045, ease: "expo.out" });
      gsap.fromTo(bars, { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.045, ease: "expo.out", delay: 0.1, transformOrigin: "left center" });
    }, list);
    let a;
    if (!first.current && digit.current) a = animate(digit.current, { translateY: ["60%", "0%"], opacity: [0, 1], duration: 650, ease: "outExpo" });
    first.current = false;
    return () => {
      ctx.revert();
      a?.revert?.();
    };
  }, [semester]);

  const move = (d) => {
    const n = semesters[Math.min(semesters.length - 1, Math.max(0, idx + d))];
    if (n) setSemester(n.semester);
  };

  return (
    <section id="semester" className="relative scroll-mt-24 bg-cream py-16 md:py-24">
      <Container>
        <div
          className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") move(1);
            if (e.key === "ArrowLeft") move(-1);
          }}
        >
          {/* kolom angka */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <span aria-hidden className="mb-5 block h-[3px] w-10 bg-gold" />
            <SceneTitle title={["Buku", "semester"]} size="sm" />
            <div className="mt-6 flex items-end gap-5">
              <div className="overflow-hidden">
                <span ref={digit} className="block font-serif text-[clamp(7rem,16vw,12.5rem)] leading-[0.82] tabular-nums text-navy" aria-hidden>
                  {String(cur.semester).padStart(2, "0")}
                </span>
              </div>
              <div className="pb-3 text-[14px] text-text/60">
                <p className="sr-only" aria-live="polite">Semester {cur.semester}</p>
                <p><span className="font-semibold tabular-nums text-navy">{cur.sks}</span> SKS</p>
                <p className="mt-0.5">{cur.items.filter((c) => !c.slot).length} mata kuliah</p>
              </div>
            </div>

            <div role="tablist" aria-label="Pilih semester" className="mt-6 flex gap-1.5">
              {semesters.map((s) => {
                const on = s.semester === semester;
                return (
                  <button
                    key={s.semester}
                    role="tab"
                    aria-selected={on}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setSemester(s.semester)}
                    className={cn(
                      "relative grid h-10 flex-1 place-items-center rounded-md border text-[14px] font-semibold tabular-nums transition-[background-color,border-color,color] duration-300",
                      on ? "border-navy bg-navy text-white" : "border-line bg-white text-text/60 hover:border-navy/40 hover:text-navy"
                    )}
                  >
                    {s.semester}
                    <span aria-hidden className={cn("absolute inset-x-2 -bottom-[5px] h-[3px] rounded-full bg-gold transition-transform duration-500 ease-cinematic", on ? "scale-x-100" : "scale-x-0")} />
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between text-[12.5px] text-text/45">
              <button type="button" onClick={() => move(-1)} disabled={idx === 0} className="disabled:opacity-30 hover:text-navy">‹ Sebelumnya</button>
              <span>← → untuk berpindah</span>
              <button type="button" onClick={() => move(1)} disabled={idx === semesters.length - 1} className="disabled:opacity-30 hover:text-navy">Berikutnya ›</button>
            </div>

            <div className="mt-8">
              <div className="flex items-baseline justify-between text-[13px]">
                <span className="text-text/60">Kumulatif sampai semester ini</span>
                <span className="tabular-nums text-navy"><span className="font-semibold">{cumulative}</span> / {totals.sks} SKS</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-gold transition-[width] duration-700 ease-cinematic" style={{ width: `${(cumulative / Math.max(totals.sks, 1)) * 100}%` }} />
              </div>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-4 gap-y-2" aria-label="Sorot rumpun">
              {RUMPUN.map((r) => (
                <li key={r.key}>
                  <button type="button" aria-pressed={focus === r.key} onClick={() => setFocus(focus === r.key ? null : r.key)} className={cn("inline-flex items-center gap-1.5 text-[13px] transition-colors", focus === r.key ? "font-semibold text-navy" : "text-text/55 hover:text-navy")}>
                    <RumpunDot rumpun={r.key} />
                    {r.short}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* daftar mata kuliah */}
          <ol ref={list} className="cur-rows space-y-2.5" data-focus={focus ? "" : undefined} aria-label={`Mata kuliah semester ${cur.semester}`}>
            {cur.items.map((c, i, all) =>
              c.slot ? (
                <li key={c.slug} data-row className="cur-row" data-on={focus ? undefined : ""}>
                  <a href="#pilihan" className="group flex items-center gap-4 rounded-xl border-2 border-dashed border-navy/20 px-5 py-4 transition-colors hover:border-gold">
                    <span className="w-7 font-serif text-lg text-text/30">·</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15.5px] font-semibold text-navy">{c.nama.replace(/^elective/i, "Pilihan")}</span>
                      <span className="block text-[13px] text-text/55">Diambil dari salah satu bidang mata kuliah pilihan</span>
                    </span>
                    {c.sks ? <span className="text-[13px] tabular-nums text-text/50">{c.sks} SKS</span> : null}
                    <span className="text-[13px] font-semibold text-maroon"><span className="u-gold">Lihat bidang</span></span>
                  </a>
                </li>
              ) : (
                <li key={c.slug} data-row className="cur-row" data-on={!focus || focus === c.rumpun ? "" : undefined}>
                  <button
                    type="button"
                    onClick={() => openRps(c.slug)}
                    className="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-white px-5 py-4 text-left transition-[border-color,box-shadow,transform] duration-300 ease-cinematic hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-[0_20px_40px_-30px_rgb(20_33_61/0.55)] sm:grid-cols-[auto_minmax(0,1fr)_9rem_auto]"
                  >
                    <span className="w-7 font-serif text-lg tabular-nums text-text/35">{String(all.slice(0, i + 1).filter((x) => !x.slot).length).padStart(2, "0")}</span>
                    <span className="min-w-0">
                      <span className="block text-[15.5px] font-semibold text-navy transition-colors group-hover:text-maroon">{c.nama}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-text/55">
                        {c.kode && <span className="tabular-nums">{c.kode}</span>}
                        <span className="inline-flex items-center gap-1.5">
                          <RumpunDot rumpun={c.rumpun} />
                          {RUMPUN_BY_KEY[c.rumpun].short}
                        </span>
                        <RpsStatus course={c} />
                      </span>
                    </span>
                    <span aria-hidden className="col-span-3 h-1.5 overflow-hidden rounded-full bg-cream sm:col-span-1">
                      <span data-bar className="block h-full rounded-full bg-navy/80 transition-colors group-hover:bg-maroon" style={{ width: `${((c.sks ?? 0) / maxSks) * 100}%` }} />
                    </span>
                    <span className="col-start-3 row-start-1 text-right sm:col-start-auto sm:row-start-auto">
                      <span className="font-serif text-xl tabular-nums text-navy">{c.sks ?? "–"}</span>
                      <span className="ml-1 text-[12px] text-text/45">SKS</span>
                    </span>
                  </button>
                </li>
              )
            )}
          </ol>
        </div>
      </Container>
    </section>
  );
}
