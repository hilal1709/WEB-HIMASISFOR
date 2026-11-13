"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { animate, svg } from "animejs";
import { gsap, ScrollTrigger } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, SceneTitle } from "@/components/home/shared";
import { ILLUSTRATIONS } from "@/components/illustrations/line-illustrations";
import { cn } from "@/lib/utils";
import { useMisiModal } from "./misi-modal";

const STACK_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const pad = (n) => String(n).padStart(2, "0");

/**
 * Misi — sticky stacking cards (pola 21st.dev "Scroll Stacking Cards").
 * lg: kolom kiri sticky (nomor aktif ber-roll + rail progress), kartu menumpuk; kartu di bawah
 * mengecil & meredup saat kartu baru mendarat (GSAP scrub). Ponsel / reduced-motion: daftar biasa.
 */
export function MisiStack({ misi }) {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const openMisi = useMisiModal();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(STACK_QUERY, () => {
      const cards = gsap.utils.toArray(el.querySelectorAll("[data-card]"));
      cards.forEach((card, i) => {
        ScrollTrigger.create({ trigger: card, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setActive(i) });
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card.querySelector("[data-inner]"), {
          scale: 0.94,
          ease: "none",
          scrollTrigger: { trigger: next, start: "top 85%", end: "top 30%", scrub: 0.6 },
        });
        gsap.to(card.querySelector("[data-dim]"), {
          opacity: 0.5,
          ease: "none",
          scrollTrigger: { trigger: next, start: "top 85%", end: "top 30%", scrub: 0.6 },
        });
      });
      gsap.fromTo("[data-rail]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-list]", start: "top 55%", end: "bottom 80%", scrub: 0.4 } });
    });
    return () => mm.revert();
  }, [misi.length]);

  return (
    <section id="misi" ref={ref} className="scroll-mt-24 bg-cream py-16 md:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <SceneTitle title={["Lima misi,", "satu arah"]} />
            <p data-aos="fade-up" className="mt-4 max-w-sm text-pretty text-[16px] leading-relaxed text-text/65">
              Cara kami mewujudkan visi, dari ruang kelas sampai dunia kerja.
            </p>

            <div className="mt-10 hidden items-end gap-5 lg:flex" aria-hidden>
              <div className="h-[4.5rem] overflow-hidden">
                <div className="transition-transform duration-700 ease-cinematic" style={{ transform: `translateY(-${active * 4.5}rem)` }}>
                  {misi.map((m) => (
                    <p key={m.n} className="h-[4.5rem] font-serif text-[4.5rem] leading-none tabular-nums text-maroon">{pad(m.n)}</p>
                  ))}
                </div>
              </div>
              <div className="pb-2">
                <p className="text-sm text-text/45">/ {pad(misi.length)}</p>
                <div className="h-6 overflow-hidden">
                  <div className="transition-transform duration-700 ease-cinematic" style={{ transform: `translateY(-${active * 1.5}rem)` }}>
                    {misi.map((m) => (
                      <p key={m.n} className="h-6 text-[15px] font-semibold leading-6 text-navy">{m.key}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 hidden gap-4 lg:flex">
              <span className="relative block h-44 w-[2px] overflow-hidden rounded-full bg-line">
                <span data-rail className="absolute inset-0 origin-top bg-gold" />
              </span>
              <ol className="flex flex-col justify-between py-0.5 text-[13px]">
                {misi.map((m, i) => (
                  <li key={m.n}>
                    <button
                      type="button"
                      onClick={() => document.getElementById(`misi-${m.n}`)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" })}
                      className={cn("transition-colors duration-300 hover:text-maroon", i === active ? "font-semibold text-navy" : "text-text/50")}
                    >
                      {pad(m.n)} · {m.key}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <ol data-list className="min-w-0 space-y-5 lg:space-y-[14vh] lg:pb-[6vh]">
            {misi.map((m, i) => (
              <li key={m.n} id={`misi-${m.n}`} data-card className="lg:sticky" style={{ top: `calc(7rem + ${i * 18}px)` }}>
                <div data-aos="fade-up">
                  <MisiCard item={m} onOpen={() => openMisi(i)} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

function MisiCard({ item, onOpen }) {
  const art = useRef(null);
  const Illustration = ILLUSTRATIONS[item.illustration];

  // hover: garis ilustrasi digambar ulang (anime.js)
  const redraw = () => {
    if (prefersReducedMotion() || !art.current) return;
    const paths = art.current.querySelectorAll("[data-line]");
    animate(svg.createDrawable(paths), { draw: ["0 0", "0 1"], duration: 900, delay: (_, i) => i * 40, ease: "inOutCubic" });
  };

  return (
    <article
      data-inner
      onPointerEnter={redraw}
      className="group relative origin-top overflow-hidden rounded-lg border border-line bg-white shadow-[0_24px_50px_-36px_rgb(20_33_61/0.55)] transition-[border-color,box-shadow] duration-500 ease-cinematic hover:border-navy/25 hover:shadow-[0_30px_60px_-34px_rgb(20_33_61/0.6)]"
    >
      <span data-dim aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-cream opacity-0" />
      <div className="grid sm:grid-cols-[1fr_200px] lg:min-h-[300px]">
        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-[2.25rem] leading-none text-gold">{pad(item.n)}</span>
            <span className="kicker text-maroon">{item.key}</span>
          </div>
          <p className="mt-5 text-pretty font-serif text-[clamp(1.25rem,2vw,1.6rem)] leading-snug text-navy">{item.text}</p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-7">
            <ul className="flex flex-wrap gap-1.5">
              {item.tags?.map((t) => (
                <li key={t} className="rounded-md bg-cream px-2.5 py-1 text-[12.5px] text-navy/80">{t}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onOpen}
              className="group/btn inline-flex items-center gap-2 text-sm font-semibold text-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/40 rounded"
              aria-label={`Selengkapnya tentang misi ${item.n}: ${item.key}`}
            >
              <span className="u-gold">Selengkapnya</span>
              <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-500 ease-cinematic group-hover/btn:translate-x-1">
                <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div ref={art} className="hidden items-center border-l border-line bg-cream/60 p-6 sm:flex">
          {Illustration && <Illustration />}
        </div>
      </div>
    </article>
  );
}
