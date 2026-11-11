"use client";
import { useEffect, useRef } from "react";
import { animate, stagger, svg } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { CURTAIN_KEY } from "@/lib/program-kelas-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { ClassPathsIllustration } from "@/components/illustrations/line-illustrations";
import { LordIcon } from "@/components/media/lord-icon";
import { Magnetic } from "@/components/motion/magnetic";
import { WordRotate } from "@/components/motion/word-rotate";
import { cn } from "@/lib/utils";
import { useKelas } from "./kelas-provider";

function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

/**
 * Hero Program Kelas: header dua kolom (judul serif + intro & CTA), lalu ilustrasi "tiga jalur kelas"
 * yang tergambar garis demi garis (anime.js). Jalur kelas aktif menyala (lainnya meredup) dan
 * label jalur di bawahnya bisa diklik untuk berpindah kelas. Elvo `think`.
 */
export function KelasHero() {
  const { intro, classes, active, setActive, openQuiz } = useKelas();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(CURTAIN_KEY) === "1";
    } catch {}
    const delay = seen ? 150 : 1900;

    const draw = animate(svg.createDrawable(el.querySelectorAll("[data-art] [data-line]")), {
      draw: ["0 0", "0 1"],
      duration: 1300,
      delay: stagger(28, { start: delay }),
      ease: "inOutCubic",
    });
    const fills = animate(el.querySelectorAll("[data-art] [fill]:not([fill='none'])"), { opacity: [0, 1], duration: 700, delay: delay + 900, ease: "outCubic" });
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay: delay / 1000 });
      gsap.to("[data-parallax]", { yPercent: -6, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.8 } });
    }, el);
    return () => {
      draw.revert?.();
      fills.revert?.();
      ctx.revert();
    };
  }, []);

  // titik tujuan kelas aktif berdenyut
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const n = el.querySelector(`[data-art] [data-path="${classes[active].path}"] [data-node]`);
    if (!n) return;
    const a = animate(n, { scale: [1, 2.1, 1], duration: 1300, loop: true, loopDelay: 500, ease: "inOutSine" });
    return () => a.revert?.();
  }, [active, classes]);

  return (
    <section ref={ref} className="relative overflow-hidden pb-14 pt-10 md:pb-20 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li><a href="/profile" className="u-gold transition-colors hover:text-maroon">Profil</a></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Program Kelas</li>
          </ol>
        </nav>

        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
          <div>
            <span aria-hidden data-hero-fade className="mb-6 block h-[3px] w-10 bg-gold" />
            <SceneTitle as="h1" trigger="mount" title={["Satu prodi,", "tiga cara", "belajar"]} className="!text-[clamp(2.75rem,6.4vw,5.25rem)] !leading-[1]" />
            <p data-hero-fade className="mt-6 font-serif text-[clamp(1.2rem,2.2vw,1.6rem)] leading-tight text-text/60">
              Mulai dari{" "}
              <span className="inline-block min-w-[9ch] italic text-maroon">
                <WordRotate words={classes.map((c) => c.name)} interval={2800} />
              </span>
            </p>
          </div>
          <div className="lg:border-l lg:border-line lg:pb-2 lg:pl-10">
            <p data-hero-fade className="text-pretty text-[17px] leading-relaxed text-text/70">{intro.body}</p>
            <div data-hero-fade className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Magnetic strength={0.25}>
                <a
                  href="#kelas"
                  onClick={(e) => {
                    e.preventDefault();
                    smoothTo("kelas");
                  }}
                  className="group inline-flex h-12 items-center gap-2 rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
                >
                  Lihat pilihan kelas
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5">
                    <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </Magnetic>
              <button type="button" onClick={openQuiz} className="quiz-btn group inline-flex h-12 items-center gap-3 text-[15px] font-semibold text-navy">
                <span className="grid size-11 place-items-center rounded-full border border-navy/25 transition-[background-color,border-color,transform] duration-500 ease-cinematic group-hover:scale-110 group-hover:border-gold group-hover:bg-gold/15">
                  <LordIcon name="consultation" size={24} target=".quiz-btn" colors="primary:#14213d,secondary:#6e1423" />
                </span>
                <span className="u-gold">Bantu aku memilih</span>
              </button>
            </div>
          </div>
        </div>

        {/* ilustrasi tiga jalur */}
        <div className="relative mx-auto mt-12 max-w-[900px] md:mt-14">
          <div data-art data-parallax data-active-path={classes[active].path} className="class-paths">
            <ClassPathsIllustration className="h-auto w-full text-navy" />
          </div>
          <div className="absolute -left-4 top-2 hidden lg:block xl:-left-24">
            <div className="relative"><ElvoPeek pose="think" size={88} side="right" say="Bingung pilih yang mana? Coba kuisnya!" delay={0.4} /></div>
          </div>
          <div role="group" aria-label="Pilih jalur kelas" className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
            {classes.map((c, i) => (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  setActive(i);
                  smoothTo("kelas");
                }}
                aria-pressed={i === active}
                className={cn(
                  "group border-t-2 pt-3 text-left transition-colors duration-500",
                  i === active ? "border-gold" : "border-line hover:border-navy/30"
                )}
              >
                <span className="kicker block text-[11px] text-text/45">Jalur {String(i + 1).padStart(2, "0")}</span>
                <span className={cn("mt-1 block font-serif text-[clamp(1rem,1.8vw,1.35rem)] leading-tight transition-colors", i === active ? "text-maroon" : "text-navy group-hover:text-maroon")}>
                  {c.short}
                </span>
                <span className="mt-1 hidden text-[13px] text-text/55 sm:block">{c.schedule}</span>
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
