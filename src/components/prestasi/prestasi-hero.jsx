"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { CURTAIN_KEY, INTRO, LEVELS } from "@/lib/prestasi-content";
import { Container, PlaceholderTag, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { Magnetic } from "@/components/motion/magnetic";
import { Marquee } from "@/components/motion/marquee";
import { WordRotate } from "@/components/motion/word-rotate";
import { cn } from "@/lib/utils";
import { LevelBadge, usePrestasi } from "./prestasi-provider";

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

const initials = (name) => name.split(/[ ,.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("");

/** Kartu peraih di pita hall of fame. */
function FameCard({ it, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(it.slug)}
      aria-label={`${it.title} — ${it.short || it.name}`}
      className="group/card w-[230px] shrink-0 overflow-hidden rounded-lg border border-line bg-white text-left shadow-[0_20px_40px_-32px_rgb(20_33_61/0.6)] transition-[transform,box-shadow] duration-500 ease-cinematic hover:-translate-y-1.5 hover:shadow-[0_30px_50px_-30px_rgb(78_14_25/0.5)] sm:w-[260px]"
    >
      <span className="relative block aspect-[4/3.6] overflow-hidden bg-cream-2">
        {it.photo ? (
          <Image src={it.photo} alt="" fill sizes="260px" className="object-cover object-top transition-transform duration-700 ease-cinematic group-hover/card:scale-[1.05]" />
        ) : (
          <span className="grid size-full place-items-center font-serif text-4xl text-maroon/70">{initials(it.name)}</span>
        )}
        <LevelBadge level={it.level} label={it.levelLabel} className="absolute left-3 top-3" />
        <span className="absolute bottom-3 right-3 rounded bg-white/90 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-navy">{it.yearLabel}</span>
      </span>
      <span className="block p-4">
        <span className="block truncate text-[13px] font-semibold text-maroon">{it.short || it.name}</span>
        <span className="mt-1 line-clamp-2 block font-serif text-[15.5px] leading-snug text-navy">{it.title}</span>
      </span>
    </button>
  );
}

/**
 * Hero Prestasi "hall of fame": judul + ringkasan angka dalam kalimat, chip tingkat yang memfilter
 * arsip, lalu pita lebar penuh berisi capaian terbaik tiap peraih (foto, tingkat, tahun, judul) yang
 * terus bergulir dan berhenti saat di-hover. Klik kartu → modal semua capaian peraih itu.
 */
export function PrestasiHero() {
  const { achievers, items, featured, level, setLevel, span, sample, openProfile } = usePrestasi();
  const ref = useRef(null);
  // satu capaian terbaik per peraih (pickFeatured), jadi tiap orang hanya muncul sekali di pita
  const fame = featured.slice(0, 12);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const delay = curtainDelay(CURTAIN_KEY);
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay });
      gsap.from("[data-fame]", { x: 120, opacity: 0, duration: 1.4, ease: "expo.out", delay: delay + 0.3 });
    }, el);
    return () => ctx.revert();
  }, []);

  const chips = [{ key: "all", label: "Semua" }, ...LEVELS];

  return (
    <section ref={ref} className="relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li>Profil</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Prestasi</li>
          </ol>
        </nav>

        <div className="mt-10 grid gap-8 lg:mt-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
          <div>
            <SceneTitle as="h1" trigger="mount" title={INTRO.title} className="!text-[clamp(2.6rem,6vw,5rem)] !leading-[1]" />
            <p data-hero-fade className="mt-5 font-serif text-[clamp(1.15rem,2vw,1.5rem)] leading-tight text-text/60">
              {INTRO.lead}{" "}
              <span className="inline-block min-w-[14ch] italic text-maroon">
                <WordRotate words={INTRO.rotate} interval={2400} />
              </span>
            </p>
          </div>
          <div>
            <p data-hero-fade className="text-pretty text-[16.5px] leading-relaxed text-text/70">
              <strong className="font-serif text-[1.35rem] font-normal text-maroon">{items.length} prestasi</strong> dari{" "}
              <strong className="font-semibold text-navy">{achievers.length} peraih</strong>
              {span ? <> tercatat {span[0]}–{span[1]}. </> : ". "}
              {INTRO.body}
            </p>
            {sample && <PlaceholderTag className="mt-3" />}
            <div data-hero-fade className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Magnetic strength={0.25}>
                <a
                  href="#arsip"
                  onClick={(e) => {
                    e.preventDefault();
                    smoothTo("arsip");
                  }}
                  className="group inline-flex h-12 items-center gap-2 rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
                >
                  Jelajahi arsip
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5">
                    <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </Magnetic>
              <a
                href="#kisah"
                onClick={(e) => {
                  e.preventDefault();
                  smoothTo("kisah");
                }}
                className="text-[15px] font-semibold text-navy"
              >
                <span className="u-gold">Tonton kisah mawapres</span>
              </a>
            </div>
          </div>
        </div>

        {/* chip tingkat */}
        <div data-hero-fade role="group" aria-label="Filter tingkat prestasi" className="mt-10 flex flex-wrap items-center gap-2 border-t border-line pt-6">
          <span className="mr-2 text-[13px] text-text/50">Tingkat:</span>
          {chips.map((c) => {
            const on = level === c.key;
            const n = c.key === "all" ? items.length : items.filter((i) => i.level === c.key).length;
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={on}
                disabled={n === 0}
                onClick={() => {
                  setLevel(c.key);
                  smoothTo("arsip");
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13.5px] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-45",
                  on ? "border-maroon bg-maroon text-white" : "border-line bg-white text-navy enabled:hover:border-maroon/40"
                )}
              >
                {c.label}
                <span className={cn("tabular-nums text-[12px]", on ? "text-white/65" : "text-text/45")}>{n}</span>
              </button>
            );
          })}
          <div className="relative ml-auto hidden lg:block">
            <ElvoPeek pose="proud" size={72} side="left" say="Ini para juara kita. Giliranmu berikutnya!" delay={0.3} />
          </div>
        </div>
      </Container>

      {/* pita hall of fame, lebar penuh */}
      {fame.length > 0 && (
        <div data-fame className="mt-8 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
          <Marquee speed={Math.max(40, fame.length * 6)} className="py-4">
            {fame.map((it) => (
              <FameCard key={it.id} it={it} onOpen={openProfile} />
            ))}
          </Marquee>
        </div>
      )}
    </section>
  );
}
