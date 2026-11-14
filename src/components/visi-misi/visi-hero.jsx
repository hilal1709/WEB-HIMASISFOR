"use client";
import { Fragment, useLayoutEffect as useEffect, useMemo, useRef } from "react";
import { animate, stagger, svg } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { CURTAIN_KEY } from "@/lib/visi-misi-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { HorizonIllustration } from "@/components/illustrations/line-illustrations";
import { Magnetic } from "@/components/motion/magnetic";


function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

/**
 * Hero "Horizon 2030": judul, CTA, ilustrasi cakrawala yang tergambar garis demi garis
 * (anime.js), angka tahun yang berhitung 2014 → 2030, dan Elvo.
 */
export function VisiHero({ content: c, curtain = true }) {
  const ref = useRef(null);
  const year = useRef(null);
  const from = Number(c.yearFrom) || 2014;
  const to = Number(c.yearTo) || 2030;
  const crumbs = c.breadcrumb ?? [];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = prefersReducedMotion();
    const delay = (curtain ? curtainDelay(CURTAIN_KEY) : 0.1) * 1000;
    if (reduce) return;

    const paths = el.querySelectorAll("[data-horizon] [data-line]");
    const draw = animate(svg.createDrawable(paths), { draw: ["0 0", "0 1"], duration: 1300, delay: stagger(45, { start: delay }), ease: "inOutCubic" });
    const fills = animate(el.querySelectorAll("[data-horizon] [fill]:not([fill='none'])"), {
      opacity: [0, 1],
      duration: 700,
      delay: delay + 900,
      ease: "outCubic",
    });
    const state = { v: from };
    const count = animate(state, {
      v: to,
      duration: 1800,
      delay: delay + 300,
      ease: "outExpo",
      onUpdate: () => year.current && (year.current.textContent = Math.round(state.v)),
    });
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay: delay / 1000 });
      gsap.from("[data-rule]", { scaleX: 0, duration: 1.4, ease: "expo.out", delay: delay / 1000 + 0.6 });
      const st = { trigger: el, start: "top top", end: "bottom top", scrub: 0.8 };
      gsap.to("[data-numeral]", { yPercent: 18, ease: "none", scrollTrigger: st });
      gsap.to("[data-horizon]", { yPercent: -6, ease: "none", scrollTrigger: st });
    }, el);
    return () => {
      draw.revert?.();
      fills.revert?.();
      count.revert?.();
      ctx.revert();
    };
  }, [curtain, from, to, c.showHorizon]);

  return (
    <section id="vm-hero" ref={ref} className="relative overflow-hidden pb-10 pt-10 md:pb-14 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            {crumbs.map((b, i) => {
              const last = i === crumbs.length - 1;
              return (
                <Fragment key={i}>
                  {i > 0 && <li aria-hidden>/</li>}
                  <li aria-current={last ? "page" : undefined} className={last ? "text-navy" : undefined}>
                    {b.href && !last ? <a href={b.href} className="u-gold transition-colors hover:text-maroon">{b.label}</a> : b.label}
                  </li>
                </Fragment>
              );
            })}
          </ol>
        </nav>

        <div className="relative mt-10 flex flex-col items-center text-center lg:mt-12">
          {/* numeral tahun raksasa sebagai latar judul */}
          <p
            aria-hidden
            data-numeral
            className="pointer-events-none absolute left-1/2 top-[-1.5rem] -translate-x-1/2 select-none font-serif text-[clamp(7rem,24vw,19rem)] leading-none tracking-tight text-transparent opacity-50 tabular-nums [-webkit-text-stroke:1.5px_var(--gold)]"
          >
            <span ref={year}>{to}</span>
          </p>
          {c.kicker && <p data-hero-fade className="kicker relative text-maroon">{c.kicker}</p>}
          <SceneTitle as="h1" trigger="mount" align="center" title={[c.titleTop, c.titleAccent]} className="relative mt-4 !text-[clamp(3rem,7.5vw,6.25rem)]" />
          {c.subtitle && (
            <p data-hero-fade className="relative mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-text/70">
              {c.subtitle}
            </p>
          )}
          {c.ctaLabel && <div data-hero-fade className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
            <Magnetic strength={0.25}>
                <a
                  href="#misi"
                  onClick={(e) => {
                    e.preventDefault();
                    smoothTo("visi");
                  }}
                  className="group inline-flex h-12 items-center gap-2 rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
                >
                  {c.ctaLabel}
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5">
                    <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
            </Magnetic>
          </div>}
        </div>
      </Container>

      {/* lanskap cakrawala tanpa kartu; garis cakrawala menyambung ke tepi layar */}
      {c.showHorizon !== false && <div data-horizon className="relative mt-10 md:mt-6">
        <span aria-hidden data-rule className="absolute inset-x-0 top-[65.3%] hidden h-[1.6px] origin-center bg-ink/80 md:block" />
        <div className="relative mx-auto max-w-[900px] px-5 text-ink md:px-8">
          <HorizonIllustration className="relative block h-auto w-full text-ink" />
        </div>
        {c.mascot?.show && (
          <div className="absolute bottom-[33%] right-[4%] hidden xl:block">
            <div className="relative"><ElvoPeek pose={c.mascot.pose} size={92} side="left" say={c.mascot.say} delay={0.4} /></div>
          </div>
        )}
      </div>}

    </section>
  );
}

/** Pecah visi jadi kata; frasa kunci dibungkus agar garis bawah emasnya bisa digambar. */
function tokenize(text, highlights) {
  if (!highlights.length) return [{ seg: text, hl: false }];
  const esc = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${esc.join("|")})`, "gi");
  return text.split(re).filter(Boolean).map((seg) => ({ seg, hl: highlights.some((h) => h.toLowerCase() === seg.toLowerCase()) }));
}

/**
 * Pernyataan visi besar: kata menyala satu per satu saat di-scroll (GSAP scrub),
 * frasa kunci mendapat garis bawah emas yang memanjang.
 */
export function VisiStatement({ content: c }) {
  const ref = useRef(null);
  const visi = c.text;
  const parts = useMemo(() => tokenize(visi, c.highlights ?? []), [visi, c.highlights]);

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
  }, [visi, c.highlights]);

  let k = 0;
  return (
    <section id="visi" ref={ref} className="relative scroll-mt-24 overflow-hidden bg-maroon py-16 text-white md:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-16">
          <div data-aos="fade-up">
            {c.label && <p className="kicker text-gold-soft">{c.label}</p>}
            {c.sublabel && <p className="mt-2 text-sm text-white/60">{c.sublabel}</p>}
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
            {c.caption && <figcaption data-aos="fade-up" className="mt-8 text-sm text-white/55">{c.caption}</figcaption>}
          </figure>
        </div>
      </Container>
      {c.mascot?.show && (
        <div className="absolute bottom-6 right-8 hidden xl:block">
          <div className="relative"><ElvoPeek pose={c.mascot.pose} size={92} tone="dark" say={c.mascot.say} delay={0.3} /></div>
        </div>
      )}
    </section>
  );
}
