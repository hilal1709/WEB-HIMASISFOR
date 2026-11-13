"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { CURTAIN_KEY, creditsFor } from "@/lib/konversi-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { cn } from "@/lib/utils";
import { SplitFlap } from "./split-flap";
import { smoothTo, useKonversi } from "./konversi-provider";

const ROWS = 4;
const pad = (n) => String(n).padStart(2, "0");

/**
 * Hero "Pengalaman di luar kelas, tercatat di transkrip". Kanan: papan keberangkatan split-flap (navy) yang
 * memutar daftar kegiatan tiap 3 detik — kegiatan → durasi → SKS. Hover/fokus menahan putaran; klik baris
 * memilih kegiatan di meja konversi. Papan selebar konten menjadi satu-satunya visual hero (tanpa ilustrasi).
 */
export function KonversiHero() {
  const { intro, programs, rate, cap, choose } = useKonversi();
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(null);

  const rows = Array.from({ length: ROWS }, (_, i) => programs[(offset + i) % programs.length]);

  useEffect(() => {
    if (paused || prefersReducedMotion()) return;
    const t = setInterval(() => setOffset((o) => (o + 1) % programs.length), 3000);
    return () => clearInterval(t);
  }, [paused, programs.length]);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const delay = curtainDelay(CURTAIN_KEY);
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay });
      gsap.from("[data-board]", { y: 40, rotateX: -12, opacity: 0, duration: 1.2, ease: "expo.out", delay: delay + 0.2, transformPerspective: 900 });
    }, el);
    return () => ctx.revert();
  }, []);

  const pick = (key) => {
    setActive(key);
    choose(key, { scroll: true });
  };

  return (
    <section ref={ref} className="relative overflow-hidden pb-10 pt-10 md:pb-14 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li>Belajar Luar Prodi</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Konversi SKS</li>
          </ol>
        </nav>

        <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-12">
          <div className="relative z-10 flex flex-col gap-6">
            <div>
            <SceneTitle as="h1" trigger="mount" title={["Pengalaman di luar kelas,", "tercatat di transkrip"]} className="!text-[clamp(2.5rem,4.4vw,4.1rem)] !leading-[1]" />
            </div>
            <div className="flex flex-col gap-7">
            <p data-hero-fade className="max-w-xl text-pretty text-[17px] leading-relaxed text-text/70">{intro.body}</p>
            <div data-hero-fade className="flex shrink-0 flex-wrap items-center gap-x-7 gap-y-4">
              <button
                type="button"
                onClick={() => smoothTo("kalkulator")}
                className="group inline-flex h-12 items-center gap-3 rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
              >
                Hitung konversiku
                <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5">
                  <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" onClick={() => smoothTo("alur")} className="text-[15px] font-semibold text-navy">
                <span className="u-gold">Lihat alur pengajuan</span>
              </button>
            </div>
            </div>
          </div>

          <div className="relative" style={{ perspective: 1200 }}>
            <span aria-hidden className="pointer-events-none absolute -bottom-16 -right-6 z-20 hidden xl:block">
              <ElvoPeek pose="think" size={88} side="left" say="Jam magangku setara berapa SKS, ya?" />
            </span>
            <div
              data-board
              onPointerEnter={() => setPaused(true)}
              onPointerLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
              className="relative overflow-hidden rounded-xl bg-navy text-white shadow-[0_50px_90px_-45px_rgb(14_24_48/0.9)]"
            >
              <div className="flex items-center justify-between gap-3 border-y border-white/10 bg-navy-deep/60 px-5 py-2.5 sm:px-7">
                <span className="kicker text-[10.5px] text-gold-soft">Papan konversi</span>
                <span className="tabular text-[12px] text-white/60">
                  1 SKS = <span className="font-semibold text-white">{rate} jam</span> · maks {cap} SKS/semester
                </span>
              </div>

              <div role="list" aria-label="Contoh konversi per kegiatan" className="px-3 py-3 sm:px-5">
                <div aria-hidden className="grid grid-cols-[1fr_auto] gap-4 px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40 sm:grid-cols-[1fr_auto_auto]">
                  <span>Kegiatan</span>
                  <span className="hidden sm:block">Durasi</span>
                  <span className="text-right">SKS</span>
                </div>
                {rows.map((p, i) => {
                  const sks = Math.min(creditsFor(p, rate), cap);
                  const dur = p.mode === "jam" ? `${p.weeks}MGG×${p.hours}J` : `${p.sks} SKS IN`;
                  return (
                    <button
                      key={i}
                      role="listitem"
                      type="button"
                      onClick={() => pick(p.key)}
                      aria-label={`${p.label}: ${p.mode === "jam" ? `${p.weeks} minggu, ${p.hours} jam per minggu` : `${p.sks} SKS dari kampus tujuan`}, setara ${sks} SKS. Hitung di meja konversi.`}
                      className={cn(
                        "group grid w-full grid-cols-[1fr_auto] items-center gap-4 rounded-md px-2 py-1.5 text-left text-[9.5px] outline-none transition-colors duration-300 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-gold sm:grid-cols-[1fr_auto_auto] sm:text-[12px] xl:text-[13px]",
                        active === p.key && "bg-white/[0.06]"
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span aria-hidden className="tabular hidden w-5 shrink-0 text-[10px] text-gold sm:block">{pad(((offset + i) % programs.length) + 1)}</span>
                        <SplitFlap text={p.label} size={20} stagger={18} />
                      </span>
                      <SplitFlap text={dur} size={9} className="hidden sm:inline-flex" stagger={26} />
                      <span className="flex items-center gap-2">
                        <SplitFlap text={pad(sks)} size={2} flapClassName="!bg-maroon text-gold-soft" stagger={60} />
                        <svg aria-hidden viewBox="0 0 16 16" className="hidden size-3.5 -translate-x-1 text-gold opacity-0 sm:block transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                          <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-3 text-[11.5px] text-white/45 sm:px-7">
                <span>{paused ? "Papan berhenti — pilih satu baris" : "Arahkan kursor untuk menahan papan"}</span>
                <span aria-hidden className="flex gap-1">
                  {programs.map((p, i) => (
                    <span key={p.key} className={cn("h-1 rounded-full transition-all duration-500", i === offset ? "w-4 bg-gold" : "w-1 bg-white/25")} />
                  ))}
                </span>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
