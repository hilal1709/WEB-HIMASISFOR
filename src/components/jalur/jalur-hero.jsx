"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { CURTAIN_KEY } from "@/lib/jalur-kelulusan-content";
import { Container } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { cn } from "@/lib/utils";
import { smoothTo, useJalur } from "./jalur-provider";

/**
 * Hero "kalimat isian": satu kalimat besar "Aku ingin lulus lewat [jalur]". Jalur dipilih langsung di dalam
 * kalimat (tombol-tombol kata, ←/→ berpindah); ringkasan luaran + durasi jalur itu ikut berganti di bawahnya.
 * Pilihan memakai state `active` yang sama dengan "Cek kesiapanku" dan cerita jalur di bawahnya.
 */
export function JalurHero() {
  const { intro, paths, thesis, active, setActive } = useJalur();
  const ref = useRef(null);
  const sum = useRef(null);
  const p = paths[active] ?? paths[0];

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const d = curtainDelay(CURTAIN_KEY);
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay: d });
      gsap.fromTo("[data-word]", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: "expo.out", delay: d + 0.15, clearProps: "transform,opacity" });
    }, el);
    return () => ctx.revert();
  }, []);

  // ringkasan berganti dengan gerak kecil setiap jalur diganti
  useEffect(() => {
    if (!sum.current || prefersReducedMotion()) return;
    const t = gsap.fromTo(sum.current.children, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "expo.out" });
    return () => t.revert();
  }, [active]);

  const onKey = (e) => {
    if (e.key === "ArrowRight") setActive((active + 1) % paths.length);
    if (e.key === "ArrowLeft") setActive((active - 1 + paths.length) % paths.length);
  };

  return (
    <section ref={ref} className="relative overflow-hidden pb-10 pt-10 md:pb-14 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li>Akademik</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Jalur Kelulusan</li>
          </ol>
        </nav>

        <p data-hero-fade className="kicker mt-10 text-[11.5px] text-maroon lg:mt-14">
          Jalur kelulusan · tugas akhir {thesis.sks} SKS · semester {thesis.semester}
        </p>

        {/* kalimat isian */}
        <h1 className="mt-6 max-w-5xl font-serif text-[clamp(2.2rem,5.6vw,4.75rem)] font-normal leading-[1.12] tracking-[-0.01em] text-navy">
          <span data-word className="inline-block">Aku ingin</span> <span data-word className="inline-block">lulus lewat</span>{" "}
          <span role="radiogroup" aria-label="Pilih jalur kelulusan" onKeyDown={onKey} className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 align-baseline">
            {paths.map((x, i) => {
              const on = i === active;
              return (
                <button
                  key={x.key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={on ? 0 : -1}
                  data-word
                  onClick={() => setActive(i)}
                  className={cn(
                    "relative italic outline-none transition-colors duration-300 focus-visible:text-maroon",
                    on ? "text-maroon" : "text-navy/40 hover:text-navy/70"
                  )}
                >
                  {x.title}
                  <span aria-hidden className={cn("absolute inset-x-0 -bottom-1 h-[3px] origin-left rounded-full bg-gold transition-transform duration-500 ease-cinematic", on ? "scale-x-100" : "scale-x-0")} />
                </button>
              );
            })}
          </span>
        </h1>

        {/* ringkasan jalur terpilih */}
        <div className="mt-10 grid gap-8 border-t border-line pt-8 md:mt-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div ref={sum} aria-live="polite" className="grid gap-6 sm:grid-cols-[1.3fr_1fr_1fr] sm:gap-8">
            <p className="font-serif text-[1.25rem] italic leading-snug text-text/70">{p.oneLiner}</p>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-text/45">Luaran</p>
              <p className="mt-1.5 text-[15px] font-semibold text-navy">{p.output}</p>
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-text/45">Durasi</p>
              <p className="mt-1.5 text-[15px] font-semibold text-navy">{p.duration}</p>
            </div>
          </div>
          <div data-hero-fade className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="button"
              onClick={() => smoothTo("kesiapan")}
              className="group inline-flex h-12 items-center gap-2 rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
            >
              Cek kesiapan {p.title}
              <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5">
                <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" onClick={() => smoothTo("bandingkan")} className="text-[15px] font-semibold text-navy">
              <span className="u-gold">Bandingkan risikonya</span>
            </button>
          </div>
        </div>

        <p data-hero-fade className="mt-8 max-w-2xl text-pretty text-[15.5px] leading-relaxed text-text/60">{intro.body}</p>

        <div className="pointer-events-none absolute right-8 top-32 hidden xl:block">
          <div className="relative"><ElvoPeek pose="think" size={88} side="left" say="Ganti kata yang digarisbawahi, ceritanya ikut berubah." delay={0.3} /></div>
        </div>
      </Container>
    </section>
  );
}
