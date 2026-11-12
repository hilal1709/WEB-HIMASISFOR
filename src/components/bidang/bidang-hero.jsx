"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { CURTAIN_KEY } from "@/lib/bidang-keahlian-content";
import { Container } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { cn } from "@/lib/utils";
import { useBidang } from "./bidang-provider";

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

/**
 * Hero "indeks tipografi": empat nama bidang sebagai baris serif raksasa bertumpuk. Hover/fokus sebuah
 * baris → baris itu menyala maroon, yang lain meredup, dan pertanyaan khas bidangnya muncul di kanan.
 * Klik → modal rangkuman bidang (openField). Baris masuk bergeser dari kiri secara bertahap.
 */
export function BidangHero() {
  const { intro, fields, openField } = useBidang();
  const ref = useRef(null);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const d = curtainDelay(CURTAIN_KEY);
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay: d });
      gsap.from("[data-row]", { xPercent: -6, opacity: 0, duration: 1.1, stagger: 0.1, ease: "expo.out", delay: d + 0.15 });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li>Akademik</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Bidang Keahlian</li>
          </ol>
        </nav>

        <div className="mt-10 flex flex-col gap-6 lg:mt-12 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-xl">
            <h1 data-hero-fade className="kicker text-maroon">Bidang Keahlian · {fields.length} arah</h1>
            <p data-hero-fade className="mt-3 text-pretty text-[17px] leading-relaxed text-text/70">{intro.body}</p>
          </div>
          <div data-hero-fade className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="button"
              onClick={() => smoothTo("cocokkan")}
              className="group inline-flex h-12 items-center gap-2 rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
            >
              Cocokkan minatmu
              <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5">
                <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" onClick={() => smoothTo("bidang")} className="text-[15px] font-semibold text-navy">
              <span className="u-gold">Jelajahi keempatnya</span>
            </button>
          </div>
        </div>

        {/* indeks bidang */}
        <div className="relative mt-10 md:mt-14">
        <div className="pointer-events-none absolute -bottom-12 -right-4 z-10 hidden xl:block">
          <div className="relative"><ElvoPeek pose="confident" size={84} side="left" say="Pilih satu baris, aku ceritakan bidangnya." delay={0.3} /></div>
        </div>
        <ol className="border-t border-navy/15" onPointerLeave={() => setHover(null)}>
          {fields.map((f, i) => {
            const on = hover === i;
            const dim = hover !== null && !on;
            return (
              <li key={f.slug} data-row className="border-b border-navy/15">
                <button
                  type="button"
                  onPointerEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  onClick={(e) => openField(i, e.currentTarget)}
                  className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-4 py-4 text-left outline-none focus-visible:bg-white/60 md:gap-x-8 md:py-5 lg:grid-cols-[auto_1fr_minmax(0,22rem)_auto]"
                >
                  <span className={cn("w-8 font-serif text-sm tabular-nums transition-colors duration-300 md:w-10 md:text-base", on ? "text-maroon" : "text-text/40")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "font-serif text-[clamp(1.9rem,5.2vw,4.25rem)] leading-[1.04] tracking-[-0.015em] transition-[color,opacity,transform] duration-500 ease-cinematic",
                      on ? "translate-x-2 italic text-maroon" : "text-navy",
                      dim && "opacity-35"
                    )}
                  >
                    {f.title}
                  </span>
                  <span
                    aria-hidden={!on}
                    className={cn(
                      "col-span-2 col-start-2 font-serif text-[15px] italic leading-snug text-text/65 transition-opacity duration-500 lg:col-span-1 lg:col-start-auto lg:text-[1.1rem]",
                      on ? "opacity-100" : "lg:opacity-0",
                      dim && "max-lg:opacity-40"
                    )}
                  >
                    “{f.question}”
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "row-start-1 grid size-10 place-items-center rounded-full border transition-[background-color,border-color,color,transform] duration-500 ease-cinematic md:size-12 lg:col-start-4",
                      "col-start-3",
                      on ? "-rotate-45 border-maroon bg-maroon text-white" : "border-navy/20 text-navy"
                    )}
                  >
                    <svg viewBox="0 0 16 16" className="size-4">
                      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        </div>
      </Container>
    </section>
  );
}
