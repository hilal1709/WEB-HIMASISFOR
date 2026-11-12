"use client";
import { useEffect, useRef, useState } from "react";
import { animate, stagger, svg } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { AXES, CURTAIN_KEY } from "@/lib/bidang-keahlian-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { CompassQuadrantIllustration } from "@/components/illustrations/line-illustrations";
import { cn } from "@/lib/utils";
import { useBidang } from "./bidang-provider";

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

const CORNER = ["left-0 top-0 items-start text-left", "right-0 top-0 items-end text-right", "left-0 bottom-0 items-start text-left", "right-0 bottom-0 items-end text-right"];

/**
 * Hero "Kompas karier" (horizonx: judul raksasa + satu visual interaktif).
 * Kompas line-art tergambar garis demi garis (anime.js). Jarum mengikuti kursor (gsap.quickTo, rotasi
 * terpendek), kuadran yang ditunjuk menyala dan pertanyaan intinya muncul di bawah kompas.
 * Label kuadran = tombol pembuka modal bidang. Reduced-motion: jarum diam, tanpa gambar ulang.
 */
export function BidangHero() {
  const { intro, fields, focus, setFocus, openField } = useBidang();
  const ref = useRef(null);
  const art = useRef(null);
  const rotate = useRef(null);
  const angle = useRef(0);
  const [hoverQ, setHoverQ] = useState(null);

  const byQuadrant = [0, 1, 2, 3].map((q) => fields.findIndex((f) => f.quadrant === q));
  const focusQ = focus != null ? fields[focus]?.quadrant : null;
  const activeQ = hoverQ ?? focusQ;
  const activeField = activeQ != null ? fields[byQuadrant[activeQ]] : null;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const needle = art.current.querySelector("[data-needle]");
    gsap.set(needle, { svgOrigin: "260 210" });
    if (prefersReducedMotion()) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(CURTAIN_KEY) === "1";
    } catch {}
    const delay = seen ? 0.15 : 1.9;
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay });
      gsap.from("[data-corner]", { y: 12, opacity: 0, duration: 0.7, stagger: 0.08, ease: "expo.out", delay: delay + 0.9 });
      gsap.fromTo(needle, { rotation: -220, opacity: 0 }, { rotation: 0, opacity: 1, duration: 1.8, ease: "elastic.out(1, 0.45)", delay: delay + 0.6 });
    }, el);
    rotate.current = gsap.quickTo(needle, "rotation", { duration: 0.7, ease: "power3.out" });
    const draw = animate(svg.createDrawable(art.current.querySelectorAll("[data-line]")), {
      draw: ["0 0", "0 1"],
      duration: 1200,
      delay: stagger(28, { start: delay * 1000 }),
      ease: "inOutCubic",
    });
    return () => {
      ctx.revert();
      draw.revert?.();
    };
  }, []);

  const point = (deg) => {
    // putar lewat jalur terpendek agar jarum tidak berputar penuh saat melewati ±180°
    let delta = ((deg - angle.current + 540) % 360) - 180;
    angle.current += delta;
    rotate.current?.(angle.current);
  };

  const onMove = (e) => {
    const s = art.current.querySelector("svg").getBoundingClientRect();
    const dx = ((e.clientX - s.left) / s.width) * 520 - 260;
    const dy = ((e.clientY - s.top) / s.height) * 420 - 210;
    if (Math.hypot(dx, dy) < 26) return;
    point((Math.atan2(dx, -dy) * 180) / Math.PI);
    setHoverQ(dy < 0 ? (dx < 0 ? 0 : 1) : dx < 0 ? 2 : 3);
  };

  const aim = (q) => {
    setHoverQ(q);
    point([-45, 45, -135, 135][q]);
  };

  const onLeave = () => {
    setHoverQ(null);
    if (focusQ == null) point(0);
  };

  // fungsi render (bukan komponen) agar tombol tidak di-remount saat state berubah → fokus keyboard tetap
  const quadrantButton = (q, className) => {
    const i = byQuadrant[q];
    const f = fields[i];
    if (!f) return null;
    const on = activeQ === q;
    return (
      <button
        key={q}
        type="button"
        data-corner
        onClick={(e) => openField(i, e.currentTarget)}
        onFocus={() => aim(q)}
        onBlur={() => setHoverQ(null)}
        className={cn(
          "flex-col gap-0.5 rounded-lg px-3 py-2 outline-none transition-[background-color,color,border-color] duration-300 ease-cinematic focus-visible:ring-2 focus-visible:ring-gold/60",
          className,
          on ? "border-navy bg-navy text-white" : "text-navy hover:bg-cream"
        )}
      >
        <span className={cn("tabular text-[11px] tracking-[0.18em]", on ? "text-gold-soft" : "text-text/45")}>0{q + 1}</span>
        <span className="font-serif text-[15px] leading-tight sm:text-[17px]">{f.short}</span>
      </button>
    );
  };

  return (
    <section ref={ref} className="relative overflow-hidden pb-14 pt-10 md:pb-20 md:pt-14">
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

        <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-14">
          <div>
            <span aria-hidden data-hero-fade className="mb-6 block h-[3px] w-10 bg-gold" />
            <SceneTitle as="h1" trigger="mount" title={["Empat arah,", "satu kompas", "karier"]} className="!text-[clamp(2.7rem,6vw,5rem)] !leading-[0.98]" />
            <p data-hero-fade className="mt-6 max-w-lg text-pretty text-[17px] leading-relaxed text-text/70">{intro.body}</p>
            <div data-hero-fade className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
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

          {/* kompas */}
          <div data-hero-fade className="relative">
            <div
              className="relative rounded-2xl border border-line bg-white px-4 pb-6 pt-12 shadow-[0_40px_80px_-50px_rgb(20_33_61/0.5)] sm:px-8 sm:pb-8 sm:pt-14"
              onPointerMove={onMove}
              onPointerLeave={onLeave}
            >
              <div ref={art} className="compass relative mx-auto max-w-[520px] text-ink" data-active-quadrant={activeQ ?? "none"}>
                {/* label kuadran di pojok area kompas (≥ sm; pojok kosong di luar cincin) */}
                {[0, 1, 2, 3].map((q) => quadrantButton(q, cn("absolute z-10 hidden sm:flex", CORNER[q])))}
                <CompassQuadrantIllustration />
                <span aria-hidden className="kicker absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[130%] whitespace-nowrap text-[10.5px] text-text/45">{AXES.top}</span>
                <span aria-hidden className="kicker absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[130%] whitespace-nowrap text-[10.5px] text-text/45">{AXES.bottom}</span>
                <span aria-hidden className="kicker absolute left-0 top-1/2 hidden -translate-y-[160%] text-[10.5px] text-text/45 sm:block">{AXES.left}</span>
                <span aria-hidden className="kicker absolute right-0 top-1/2 hidden -translate-y-[160%] text-[10.5px] text-text/45 sm:block">{AXES.right}</span>
              </div>

              {/* ponsel: label kuadran sebagai grid 2×2 di bawah kompas */}
              <div className="mt-10 grid grid-cols-2 gap-2 sm:hidden">
                {[0, 1, 2, 3].map((q) => quadrantButton(q, "flex border border-line"))}
              </div>

              {/* pembacaan arah */}
              <div aria-live="polite" className="mt-5 flex sm:mt-10 min-h-[64px] items-center gap-4 border-t border-line pt-5">
                {activeField ? (
                  <p key={activeField.slug} className="animate-in fade-in-0 slide-in-from-bottom-1 duration-500">
                    <span className="block text-[12.5px] text-text/50">{activeField.title} bertanya:</span>
                    <span className="mt-0.5 block font-serif text-[1.25rem] italic leading-snug text-maroon sm:text-[1.4rem]">“{activeField.question}”</span>
                  </p>
                ) : (
                  <p className="text-[14.5px] text-text/55">
                    <span className="hidden sm:inline">Arahkan kursor ke salah satu kuadran untuk membaca pertanyaan yang dijawab bidangnya.</span>
                    <span className="sm:hidden">Ketuk salah satu arah untuk membuka rangkuman bidangnya.</span>
                  </p>
                )}
              </div>
            </div>
            <div className="pointer-events-none absolute -right-8 -top-16 hidden xl:block">
              <div className="relative"><ElvoPeek pose="confident" size={96} side="left" say="Ke mana jarumnya menunjuk, di situ minatmu." delay={0.3} /></div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
