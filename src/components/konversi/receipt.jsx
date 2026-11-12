"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { LordIcon } from "@/components/media/lord-icon";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { Skeleton } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { useKonversi } from "./konversi-provider";

const fmtDate = (d) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

/** Tepi bergerigi struk (segitiga SVG berulang, bukan gradien). */
function Teeth({ className }) {
  return (
    <svg aria-hidden viewBox="0 0 240 10" preserveAspectRatio="none" className={cn("block h-2.5 w-full", className)}>
      <path d={`M0 0${Array.from({ length: 24 }, (_, i) => `L${i * 10 + 5} 10L${i * 10 + 10} 0`).join("")}Z`} fill="white" />
    </svg>
  );
}

/**
 * Struk simulasi: kertas putih bertepi gerigi yang sedikit miring mengikuti kursor (GSAP quickTo, tanpa glare).
 * Isi: kegiatan, durasi, jam, kurs, SKS diakui, daftar mata kuliah pengganti, sisa. Aksi: Simpan (localStorage), Kosongkan (ConfirmModal). Menghitung → Skeleton.
 */
export function Receipt({ className, tilt = true }) {
  const { program, weeks, hours, sks, rate, cap, credits, over, pickedCourses, left, busy, savedAt, save, askReset, toggleCourse } = useKonversi();
  const paper = useRef(null);
  const [today, setToday] = useState(null);
  useEffect(() => setToday(new Date()), []);

  useEffect(() => {
    const el = paper.current;
    if (!el || !tilt || prefersReducedMotion() || !matchMedia("(hover: hover)").matches) return;
    const rx = gsap.quickTo(el, "rotateX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotateY", { duration: 0.6, ease: "power3.out" });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      rx(((e.clientY - r.top) / r.height - 0.5) * -6);
      ry(((e.clientX - r.left) / r.width - 0.5) * 6);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [tilt]);

  const total = program.mode === "jam" ? weeks * hours : null;
  const Line = ({ k, v, strong }) => (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-text/55">{k}</span>
      {busy ? <Skeleton className="h-3.5 w-16" /> : <span className={cn("tabular text-right text-navy", strong && "font-semibold")}>{v}</span>}
    </div>
  );

  return (
    <div className={cn("relative", className)} style={{ perspective: 900 }}>
      <div ref={paper} className="relative drop-shadow-[0_26px_32px_rgb(20_33_61/0.18)] will-change-transform">
        <div className="rounded-t-md bg-white px-5 pb-4 pt-5 font-mono text-[12.5px]">
          <div className="flex items-start justify-between gap-3 border-b border-dashed border-navy/20 pb-3">
            <div>
              <p className="kicker text-[10.5px] text-maroon">Struk simulasi</p>
              <p className="mt-1 font-sans text-[15px] font-semibold text-navy">{program.label}</p>
            </div>
            <span className="text-right text-[11px] text-text/45">{today ? fmtDate(today) : "—"}<br />SISFOR UISI</span>
          </div>

          <div className="py-2">
            {program.mode === "jam" ? (
              <>
                <Line k="Durasi" v={`${weeks} mgg × ${hours} jam`} />
                <Line k="Jam kegiatan" v={`${total.toLocaleString("id-ID")} jam`} />
                <Line k="Kurs" v={`÷ ${rate} jam/SKS`} />
              </>
            ) : (
              <Line k="SKS kampus tujuan" v={`${sks} SKS`} />
            )}
            {over && <Line k="Batas semester" v={`maks ${cap} SKS`} />}
          </div>

          <div className="flex items-end justify-between border-y border-dashed border-navy/20 py-3">
            <span className="font-sans text-[13px] font-semibold text-navy">SKS diakui</span>
            {busy ? <Skeleton className="h-8 w-14" /> : <span className="tabular font-serif text-[2rem] leading-none text-maroon">{credits}</span>}
          </div>

          {credits === 0 && !busy ? (
            <div className="flex flex-col items-center py-4 text-center font-sans">
              <LottieIllustration src="/lottie/credit-swap.json" label="Jam pasir berubah menjadi lembar transkrip" className="size-28" />
              <p className="mt-1 text-[13px] text-text/60">Jam kegiatanmu belum cukup untuk 1 SKS. Tambah durasi atau jam per minggu.</p>
            </div>
          ) : (
            <div className="py-2">
              <p className="pb-1 text-[11px] uppercase tracking-[0.12em] text-text/45">Mata kuliah pengganti</p>
              {pickedCourses.length === 0 && <p className="py-1 font-sans text-[13px] text-text/50">Belum ada. Pilih dari kantong di samping.</p>}
              <ul>
                {pickedCourses.map((c) => (
                  <li key={c.slug} className="group flex items-baseline justify-between gap-3 py-1">
                    <span className="min-w-0 truncate text-navy">{c.nama}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="tabular text-text/60">{c.sks}</span>
                      <button
                        type="button"
                        onClick={() => toggleCourse(c.slug)}
                        aria-label={`Keluarkan ${c.nama}`}
                        className="text-text/35 transition-colors hover:text-maroon"
                      >
                        ×
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
              {left > 0 && (
                <div className="mt-1 flex justify-between border-t border-dotted border-navy/20 pt-2 text-text/55">
                  <span>Belum dipetakan</span>
                  <span className="tabular">{left} SKS</span>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={save}
            className="group mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-maroon font-sans text-[13px] font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-maroon-deep active:scale-[0.97]"
          >
            <LordIcon name="check" size={18} target=".group" colors="primary:#ffffff,secondary:#e6d3a1" />
            Simpan simulasi
          </button>
          <div className="mt-3 flex items-center justify-between font-sans text-[11.5px] text-text/45">
            <span>{savedAt ? `Tersimpan ${fmtDate(new Date(savedAt))}` : "Belum disimpan"}</span>
            <button type="button" onClick={askReset} className="font-semibold text-text/55 underline decoration-dotted underline-offset-4 transition-colors hover:text-maroon">
              Kosongkan
            </button>
          </div>
        </div>
        <Teeth />
      </div>
    </div>
  );
}
