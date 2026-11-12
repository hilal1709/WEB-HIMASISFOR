"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { useKonversi } from "./konversi-provider";

function Sheet({ kase, after, programLabel }) {
  const total = kase.rows.reduce((t, r) => t + r.course.sks, 0);
  return (
    <div className={cn("relative h-full rounded-lg border p-5 sm:p-7", after ? "border-maroon/25 bg-white" : "border-line bg-cream")}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={cn("kicker text-[10.5px]", after ? "text-maroon" : "text-text/45")}>{after ? "Sesudah konversi" : "Sebelum konversi"}</p>
          <p className="mt-1 font-serif text-[1.35rem] leading-tight text-navy">Kartu hasil studi</p>
        </div>
        <p className="text-right text-[11.5px] leading-snug text-text/45">Semester berjalan<br />Program Studi Sistem Informasi</p>
      </div>
      <table className="mt-5 w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-navy/15 text-[11px] uppercase tracking-[0.1em] text-text/45">
            <th className="py-2 pr-3 font-medium">Mata kuliah</th>
            <th className="w-12 py-2 pr-3 text-right font-medium">SKS</th>
            <th className="w-14 py-2 pr-3 text-center font-medium">Nilai</th>
            <th className="hidden py-2 font-medium sm:table-cell">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {kase.rows.map(({ course, grade }) => (
            <tr key={course.slug} className="border-b border-line">
              <td className={cn("py-2.5 pr-3", after ? "font-medium text-navy" : "text-text/55")}>{course.nama}</td>
              <td className="tabular py-2.5 pr-3 text-right text-text/60">{course.sks}</td>
              <td className={cn("py-2.5 pr-3 text-center", after ? "font-serif text-[15px] text-maroon" : "text-text/35")}>{after ? grade : "—"}</td>
              <td className="hidden py-2.5 text-[12px] sm:table-cell">
                {after ? <span className="rounded bg-gold/20 px-1.5 py-0.5 font-medium text-navy">Konversi {programLabel}</span> : <span className="text-text/45">{course.semester ? `Menunggu smt ${course.semester}` : "Belum diambil"}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[13px] text-text/55">SKS dari kegiatan ini</span>
        <span className={cn("tabular font-serif text-[1.6rem] leading-none", after ? "text-maroon" : "text-text/35")}>{after ? `+${total}` : "0"}</span>
      </div>
      {after && (
        <span aria-hidden className="pointer-events-none absolute bottom-16 right-6 rotate-[-12deg] rounded-md border-[3px] border-maroon/70 px-3 py-1 font-serif text-[1.35rem] uppercase tracking-[0.18em] text-maroon/70 sm:right-10">
          Diakui
        </span>
      )}
    </div>
  );
}

/**
 * Sebelum ⇄ Sesudah `#contoh` — tiga kasus (segmented, sorotan `layoutId`); dua kartu hasil studi ditumpuk dan
 * dibandingkan lewat pegangan seret (clip-path). Sisi "sesudah" menampilkan nilai, tanda konversi, dan stempel.
 * Pegangan bisa diseret, diklik di mana saja, atau digeser dengan ←/→. Masuk layar → pegangan memberi isyarat
 * bergeser sekali. "Coba di kalkulator" memindahkan kasus ke meja konversi.
 */
export function TranscriptCompare() {
  const { cases, programs, applyCase } = useKonversi();
  const reduce = useReducedMotion();
  const [key, setKey] = useState(cases[0]?.key);
  const [pos, setPos] = useState(50);
  const box = useRef(null);
  const dragging = useRef(false);
  const hinted = useRef(false);

  useEffect(() => {
    const el = box.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || hinted.current) return;
        hinted.current = true;
        const s = { v: 50 };
        gsap.to(s, { keyframes: [{ v: 72, duration: 0.7 }, { v: 38, duration: 0.8 }, { v: 50, duration: 0.6 }], ease: "power2.inOut", delay: 0.4, onUpdate: () => setPos(s.v) });
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!cases.length) return null;
  const kase = cases.find((c) => c.key === key) ?? cases[0];
  const programLabel = programs.find((p) => p.key === kase.program)?.label ?? "";

  const at = (clientX) => {
    const r = box.current.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <section id="contoh" className="scroll-mt-24 border-t border-line bg-white py-16 md:py-24">
      <Container>
        <SectionHeader
          title={["Seperti apa", "di transkrip"]}
          body="Tiga contoh kegiatan dan mata kuliah yang digantikannya. Geser pegangan untuk membandingkan."
          action={<PlaceholderTag />}
        />

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label="Contoh kasus" className="inline-flex max-w-full gap-1 overflow-x-auto rounded-lg bg-cream p-1">
            {cases.map((c) => {
              const on = c.key === kase.key;
              return (
                <button
                  key={c.key}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  onClick={() => setKey(c.key)}
                  className={cn("relative h-9 shrink-0 rounded-md px-3.5 text-[13px] font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-gold", on ? "text-white" : "text-navy hover:text-maroon")}
                >
                  {on && <motion.span layoutId="konversi-case" className="absolute inset-0 rounded-md bg-navy" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className="relative">{c.label}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => applyCase(kase.key)}
            className="group inline-flex h-10 items-center gap-2 self-start rounded-md border border-navy/20 px-4 text-[13.5px] font-semibold text-navy transition-[background-color,border-color,transform] duration-300 hover:border-navy/40 hover:bg-cream active:scale-[0.97] sm:self-auto"
          >
            Coba di kalkulator
            <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5">
              <path d="M8 13V3M4 7l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div
          ref={box}
          className="relative mt-6 cursor-ew-resize touch-pan-y select-none"
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            at(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && at(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          <Sheet kase={kase} programLabel={programLabel} />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
            <Sheet kase={kase} programLabel={programLabel} after />
          </div>
          {/* pegangan */}
          <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
            <span aria-hidden className="absolute inset-y-0 -left-px w-0.5 bg-maroon" />
            <span
              role="slider"
              tabIndex={0}
              aria-label="Batas perbandingan sebelum dan sesudah konversi"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pos)}
              aria-valuetext={`${Math.round(100 - pos)}% sisi sesudah terlihat`}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
                if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
              }}
              className="pointer-events-auto absolute left-0 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-maroon text-white shadow-[0_10px_24px_-8px_rgb(78_14_25/0.7)] outline-none transition-transform duration-200 hover:scale-110 focus-visible:ring-2 focus-visible:ring-gold active:scale-95"
            >
              <svg aria-hidden viewBox="0 0 20 20" className="size-5">
                <path d="M7 5l-4 5 4 5M13 5l4 5-4 5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
