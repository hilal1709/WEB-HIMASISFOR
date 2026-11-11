"use client";
import { useEffect, useMemo, useRef } from "react";
import { animate, stagger, svg } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { HorizonIllustration } from "@/components/illustrations/line-illustrations";
import { Magnetic } from "@/components/motion/magnetic";
import { CURTAIN_KEY } from "@/lib/visi-misi-content";


function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

/**
 * Hero "Horizon 2030": judul, CTA, ilustrasi cakrawala yang tergambar garis demi garis
 * (anime.js), angka tahun yang berhitung 2014 → 2030, dan Elvo.
 */
export function VisiHero() {
  const ref = useRef(null);
  const year = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = prefersReducedMotion();
    let seen = false;
    try {
      seen = sessionStorage.getItem(CURTAIN_KEY) === "1";
    } catch {}
    const delay = seen ? 150 : 1900;
    if (reduce) return;

    const paths = el.querySelectorAll("[data-horizon] [data-line]");
    const draw = animate(svg.createDrawable(paths), { draw: ["0 0", "0 1"], duration: 1300, delay: stagger(45, { start: delay }), ease: "inOutCubic" });
    const fills = animate(el.querySelectorAll("[data-horizon] [fill]:not([fill='none'])"), {
      opacity: [0, 1],
      duration: 700,
      delay: delay + 900,
      ease: "outCubic",
    });
    const state = { v: 2014 };
    const count = animate(state, {
      v: 2030,
      duration: 1800,
      delay: delay + 300,
      ease: "outExpo",
      onUpdate: () => year.current && (year.current.textContent = Math.round(state.v)),
    });
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay: delay / 1000 });
      gsap.to("[data-parallax]", { yPercent: -10, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.8 } });
    }, el);
    return () => {
      draw.revert?.();
      fills.revert?.();
      count.revert?.();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden pb-14 pt-10 md:pb-20 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li><a href="/profile" className="u-gold transition-colors hover:text-maroon">Profil</a></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Visi &amp; Misi</li>
          </ol>
        </nav>

        <div className="mt-10 grid items-center gap-12 lg:mt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <span aria-hidden data-hero-fade className="mb-6 block h-[3px] w-10 bg-gold" />
            <SceneTitle as="h1" trigger="mount" title={["Visi", "& Misi"]} className="!text-[clamp(2.75rem,6vw,5rem)]" />
            <p data-hero-fade className="mt-6 max-w-lg text-pretty text-[17px] leading-relaxed text-text/70">
              Arah yang kami tuju dan cara kami menempuhnya: menjadi program studi Sistem Informasi yang unggul dan berdaya saing internasional pada 2030.
            </p>
            <div data-hero-fade className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic strength={0.25}>
                <a
                  href="#misi"
                  onClick={(e) => {
                    e.preventDefault();
                    smoothTo("visi");
                  }}
                  className="group inline-flex h-12 items-center gap-2 rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
                >
                  Baca visi kami
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5">
                    <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </Magnetic>
            </div>
          </div>

          <div className="relative">
            <div data-parallax className="relative rounded-lg border border-line bg-white p-5 shadow-[0_30px_60px_-40px_rgb(20_33_61/0.45)] sm:p-7">
              <div className="flex items-baseline justify-between">
                <p className="kicker text-maroon">Menuju</p>
                <p className="text-[13px] text-text/50">sejak 2014</p>
              </div>
              <p className="mt-1 font-serif text-[clamp(3.5rem,8vw,6rem)] leading-none tracking-tight text-navy tabular-nums">
                <span ref={year}>2030</span>
              </p>
              <div data-horizon className="mt-4 text-ink">
                <HorizonIllustration className="h-auto w-full text-ink" />
              </div>
            </div>
            <div className="absolute -bottom-8 -left-10 hidden lg:block">
              <div className="relative"><ElvoPeek pose="confident" size={96} side="right" say="2030 tinggal sebentar lagi. Ayo ikut mewujudkannya!" delay={0.4} /></div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Pecah visi jadi kata; frasa kunci dibungkus agar garis bawah emasnya bisa digambar. */
function tokenize(text, highlights) {
  const esc = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${esc.join("|")})`, "gi");
  return text.split(re).filter(Boolean).map((seg) => ({ seg, hl: highlights.some((h) => h.toLowerCase() === seg.toLowerCase()) }));
}

/**
 * Pernyataan visi besar: kata menyala satu per satu saat di-scroll (GSAP scrub),
 * frasa kunci mendapat garis bawah emas yang memanjang.
 */
export function VisiStatement({ visi, highlights }) {
  const ref = useRef(null);
  const parts = useMemo(() => tokenize(visi, highlights), [visi, highlights]);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const q = el.querySelector("blockquote");
      gsap.fromTo("[data-w]", { opacity: 0.14 }, { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: q, start: "top 78%", end: "bottom 50%", scrub: 0.6 } });
      el.querySelectorAll("[data-ul]").forEach((u) => {
        gsap.fromTo(u, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: u, start: "top 70%", end: "top 55%", scrub: 0.6 } });
      });
      el.querySelectorAll("[data-deco]").forEach((d) => {
        gsap.fromTo(d, { textDecorationColor: "rgba(201,162,39,0)" }, { textDecorationColor: "rgba(201,162,39,1)", ease: "none", scrollTrigger: { trigger: d, start: "top 70%", end: "top 55%", scrub: 0.6 } });
      });
    }, el);
    return () => ctx.revert();
  }, [visi]);

  let k = 0;
  return (
    <section id="visi" ref={ref} className="relative scroll-mt-24 overflow-hidden bg-maroon py-16 text-white md:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-16">
          <div data-aos="fade-up">
            <p className="kicker text-gold-soft">Visi</p>
            <p className="mt-2 text-sm text-white/60">Program Studi Sistem Informasi UISI</p>
          </div>
          <figure className="relative">
            <span aria-hidden className="absolute -left-2 -top-10 font-serif text-[6rem] leading-none text-gold md:-left-8">&ldquo;</span>
            <blockquote className="font-serif text-[clamp(1.55rem,3.1vw,2.6rem)] leading-[1.3] text-white">
              {parts.map(({ seg, hl }, i) => {
                const words = seg.split(/(\s+)/).filter((w) => w.length);
                const nodes = words.map((w) => (/^\s+$/.test(w) ? w : <span key={k++} data-w>{w}</span>));
                if (hl && seg.length <= 16)
                  return (
                    <span key={i} className="relative whitespace-nowrap italic text-gold-soft">
                      {nodes}
                      <span data-ul aria-hidden className="absolute inset-x-0 -bottom-0.5 block h-[3px] origin-left rounded-full bg-gold" />
                    </span>
                  );
                // frasa panjang boleh patah baris → garis bawah lewat text-decoration (warnanya menyala saat scroll)
                return hl ? (
                  <span key={i} data-deco className="italic text-gold-soft underline decoration-gold decoration-[3px] underline-offset-[8px]">
                    {nodes}
                  </span>
                ) : (
                  <span key={i}>{nodes}</span>
                );
              })}
            </blockquote>
            <figcaption data-aos="fade-up" className="mt-8 text-sm text-white/55">— Visi 2030, Program Studi Sistem Informasi UISI</figcaption>
          </figure>
        </div>
      </Container>
      <div className="absolute bottom-6 right-8 hidden xl:block">
        <div className="relative"><ElvoPeek pose="proud" size={92} tone="dark" say="Ini arah kami. Mau ikut menempuhnya?" delay={0.3} /></div>
      </div>
    </section>
  );
}
