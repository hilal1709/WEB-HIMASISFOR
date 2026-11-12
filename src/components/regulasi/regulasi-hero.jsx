"use client";
import { useEffect, useRef, useState } from "react";
import { animate, stagger, svg } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { CURTAIN_KEY } from "@/lib/regulasi-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { RulebookIllustration } from "@/components/illustrations/line-illustrations";
import { cn } from "@/lib/utils";
import { useRegulasi } from "./regulasi-provider";
import { RuleSearch } from "./rule-search";

/**
 * Hero "Aturan main, tanpa tebak-tebakan" — komposisi terpusat (beda dari hero dua kolom halaman lain):
 * judul + kolom tanya di tengah, lalu "meja" maroon berisi buku pedoman yang tergambar (anime.js) dengan
 * daftar isi bab di kiri/kanan. Pita bab mengikuti bab yang sedang dibaca di pembaca; hover/fokus judul bab
 * menyalakan pitanya, klik → pasal pertama bab itu.
 */
function Toc({ c, lit, setHover, goPasal }) {
  return (
    <button
      type="button"
      data-toc
      onPointerEnter={() => setHover(c.index)}
      onPointerLeave={() => setHover(null)}
      onFocus={() => setHover(c.index)}
      onBlur={() => setHover(null)}
      onClick={() => goPasal(c.pasal[0].no)}
      className={cn(
        "group flex w-full items-baseline gap-3 rounded-md px-3 py-2.5 text-left transition-[background-color,color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70",
        lit === c.index ? "bg-white/10 text-white" : "text-white/70 hover:text-white"
      )}
    >
      <span className={cn("w-7 shrink-0 font-serif text-[15px] italic transition-colors", lit === c.index ? "text-gold" : "text-gold-soft/60")}>{c.roman}</span>
      <span className="font-serif text-[16px] leading-snug lg:whitespace-nowrap">{c.title}</span>
      <span aria-hidden className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-white/25" />
      <span className="tabular shrink-0 text-[12px] text-white/45">{c.pasal.length} pasal</span>
    </button>
  );
}

export function RegulasiHero() {
  const { intro, version, chapters, chapter, goPasal, pasalCount } = useRegulasi();
  const ref = useRef(null);
  const art = useRef(null);
  const [hover, setHover] = useState(null);
  const lit = hover ?? chapter;

  useEffect(() => {
    art.current?.querySelectorAll("[data-ribbon]").forEach((g) => {
      if (g.getAttribute("data-ribbon") === chapters[lit]?.key) g.setAttribute("data-on", "");
      else g.removeAttribute("data-on");
    });
  }, [lit, chapters]);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(CURTAIN_KEY) === "1";
    } catch {}
    const delay = seen ? 0.15 : 1.9;
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay });
      gsap.from("[data-desk]", { y: 40, opacity: 0, duration: 1, ease: "expo.out", delay: delay + 0.25 });
      gsap.from("[data-rib]", { yPercent: -60, opacity: 0, duration: 0.9, stagger: 0.07, ease: "back.out(2)", delay: delay + 1.2 });
      gsap.from("[data-toc]", { x: (i) => (i < 3 ? -16 : 16), opacity: 0, duration: 0.7, stagger: 0.06, ease: "expo.out", delay: delay + 1 });
    }, el);
    const draw = animate(svg.createDrawable(art.current.querySelectorAll("[data-line]")), {
      draw: ["0 0", "0 1"],
      duration: 1200,
      delay: stagger(35, { start: delay * 1000 + 300 }),
      ease: "inOutCubic",
    });
    return () => {
      ctx.revert();
      draw.revert?.();
    };
  }, []);

  return (
    <section ref={ref} className="relative pb-14 pt-10 md:pb-20 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li>Akademik</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Regulasi Akademik</li>
          </ol>
        </nav>

        <div className="mx-auto mt-10 max-w-3xl text-center md:mt-12">
          <p data-hero-fade className="kicker text-[11.5px] text-maroon">
            Pedoman akademik {version} · {chapters.length} bab · {pasalCount} pasal
          </p>
          <SceneTitle as="h1" trigger="mount" align="center" title={["Aturan main,", "tanpa tebak-tebakan"]} className="mt-5 !text-[clamp(2.6rem,6vw,4.8rem)] !leading-[0.98]" />
          <p data-hero-fade className="mx-auto mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-text/70">{intro.body}</p>
        </div>

        <div data-hero-fade className="relative z-30 mt-9">
          <RuleSearch />
        </div>

        <div data-desk className="relative mt-12 rounded-2xl bg-maroon px-4 pb-6 pt-8 text-white shadow-[0_40px_80px_-50px_rgb(78_14_25/0.8)] sm:px-8 md:mt-14 lg:px-10 lg:py-10">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_minmax(0,440px)_1fr] lg:gap-8">
            <div className="order-2 hidden space-y-1 lg:order-1 lg:block">
              {chapters.slice(0, 3).map((c) => <Toc key={c.key} c={c} lit={lit} setHover={setHover} goPasal={goPasal} />)}
            </div>
            <div ref={art} className="rulebook order-1 mx-auto w-full max-w-[440px] lg:order-2">
              <RulebookIllustration keys={chapters.map((c) => c.key)} className="h-auto w-full text-white" />
            </div>
            <div className="order-3 hidden space-y-1 lg:block">
              {chapters.slice(3).map((c) => <Toc key={c.key} c={c} lit={lit} setHover={setHover} goPasal={goPasal} />)}
            </div>
            <div className="order-2 grid gap-1 sm:grid-cols-2 lg:hidden">
              {chapters.map((c) => <Toc key={c.key} c={c} lit={lit} setHover={setHover} goPasal={goPasal} />)}
            </div>
          </div>
          <div className="pointer-events-none absolute -top-14 right-6 hidden xl:block">
            <div className="relative"><ElvoPeek pose="think" size={92} side="left" say="Ketik saja masalahmu, pasalnya kucarikan." delay={0.3} /></div>
          </div>
        </div>
      </Container>
    </section>
  );
}
