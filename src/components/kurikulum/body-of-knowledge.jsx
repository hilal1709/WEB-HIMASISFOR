"use client";
import { useEffect, useRef, useState } from "react";
import { animate, stagger, svg, utils } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { fill } from "@/lib/kurikulum-content";
import { Container, SectionHeader } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { useKurikulum } from "./kurikulum-provider";
import { RumpunDot } from "./rumpun-dot";

/** Tingkat "bangunan" per grup: animasi masuk berurutan dari fondasi ke puncak. */
const LEVEL = { base: 0, pillar: 0, core: 1, band: 2, peak: 3 };

const STYLE = {
  peak: "bg-maroon text-white",
  core: "border-2 border-navy/15 bg-white text-navy",
  base: "bg-gold text-navy",
  pillar: "bg-cream-2 text-navy",
};
const BAND = ["bg-navy text-white", "bg-navy-deep text-white"];
const LIGHT = new Set(["core", "pillar", "base"]);

/**
 * Body of Knowledge prodi sebagai diagram bangunan yang disusun dari grup tiap blok (CMS):
 * fondasi → kompetensi inti → manajemen & strategi → panah emas → peminatan, diapit pilar.
 * Saat terlihat, blok "dibangun" dari bawah (GSAP) dan panah tergambar (anime.js). Hover/fokus/klik blok
 * menyorotnya dan menampilkan mata kuliah yang membangunnya; klik mata kuliah → laci RPS. ←/→ berpindah blok.
 */
export function BodyOfKnowledge() {
  const { bok, bokSuggested, bySlug, openRps, copy } = useKurikulum();
  const t = copy.bok;
  const [active, setActive] = useState(() => bok.find((b) => b.group === "base")?.key ?? bok[0]?.key);
  const [focusing, setFocusing] = useState(false);
  const wrap = useRef(null);
  const panel = useRef(null);
  const byKey = Object.fromEntries(bok.map((b) => [b.key, b]));
  const cur = byKey[active] ?? bok[0];
  const of = (g) => bok.filter((b) => b.group === g);
  const peaks = of("peak");
  const bands = of("band");
  const cores = of("core");
  const pillars = of("pillar");
  const left = pillars.filter((_, i) => i % 2 === 0);
  const right = pillars.filter((_, i) => i % 2 === 1);
  const shape = bok.map((b) => `${b.key}:${b.group}`).join("|");

  useEffect(() => {
    const el = wrap.current;
    if (!el || prefersReducedMotion()) return;
    const blocks = [...el.querySelectorAll("[data-block]")].sort((a, b) => (LEVEL[a.dataset.group] ?? 0) - (LEVEL[b.dataset.group] ?? 0));
    const arrows = svg.createDrawable(el.querySelectorAll("[data-arrow]"));
    utils.set(arrows, { draw: "0 0" });
    let anim;
    const ctx = gsap.context(() => {
      gsap.set(blocks, { opacity: 0, y: 26 });
      gsap.to(blocks, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: el, start: "top 75%", once: true },
        onComplete: () => (anim = animate(arrows, { draw: ["0 0", "0 1"], duration: 700, delay: stagger(120), ease: "outCubic" })),
      });
    }, el);
    return () => {
      ctx.revert();
      anim?.revert?.();
    };
  }, [shape]);

  // ganti blok → isi panel masuk berurutan
  useEffect(() => {
    if (!panel.current || prefersReducedMotion()) return;
    const tw = gsap.fromTo(panel.current.querySelectorAll("[data-swap]"), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.03, ease: "expo.out" });
    return () => tw.revert();
  }, [active]);

  const order = bok.map((b) => b.key);
  const onKey = (e) => {
    const i = order.indexOf(active);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") (e.preventDefault(), setActive(order[(i + 1) % order.length]));
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") (e.preventDefault(), setActive(order[(i - 1 + order.length) % order.length]));
  };

  const block = (b, className, vertical = false) => {
    const on = active === b.key;
    const style = b.group === "band" ? BAND[bands.indexOf(b) % BAND.length] : STYLE[b.group];
    return (
      <button
        key={b.key}
        type="button"
        data-block={b.key}
        data-group={b.group}
        data-on={on ? "" : undefined}
        aria-pressed={on}
        onMouseEnter={() => setActive(b.key)}
        onFocus={() => setActive(b.key)}
        onClick={() => setActive(b.key)}
        className={cn(
          "bok-block group relative flex items-center justify-center rounded-lg px-4 py-3 text-center text-[14px] font-semibold leading-snug outline-none transition-[opacity,transform,box-shadow] duration-500 ease-cinematic focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
          on && "-translate-y-0.5 shadow-[0_18px_34px_-22px_rgb(20_33_61/0.7)]",
          style,
          className
        )}
      >
        <span className={cn(vertical && "lg:[writing-mode:vertical-rl] lg:rotate-180")}>{b.name}</span>
        <span
          aria-hidden
          className={cn(
            "absolute right-2 top-2 grid min-w-5 place-items-center rounded-full px-1.5 text-[10.5px] font-bold tabular-nums transition-colors",
            LIGHT.has(b.group) ? "bg-navy/10 text-navy" : "bg-white/15 text-white",
            on && "bg-gold text-navy"
          )}
        >
          {b.courses.length}
        </span>
      </button>
    );
  };

  return (
    <section id="bok" className="relative scroll-mt-24 bg-white py-16 md:py-24">
      <Container>
        <SectionHeader title={t.title} body={t.body} size="sm" />

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
          {/* diagram */}
          <div
            ref={wrap}
            role="group"
            aria-label={t.diagramAria}
            onKeyDown={onKey}
            onMouseEnter={() => setFocusing(true)}
            onMouseLeave={() => setFocusing(false)}
            className="bok"
            data-focus={focusing ? "" : undefined}
          >
            {peaks.length > 0 && (
              <>
                <div className="grid gap-2 sm:[grid-template-columns:var(--bok-cols)]" style={{ "--bok-cols": `repeat(${peaks.length}, minmax(0, 1fr))` }}>
                  {peaks.map((b) => block(b, "min-h-20"))}
                </div>
                <svg viewBox="0 0 300 30" className="hidden h-9 w-full sm:block" aria-hidden preserveAspectRatio="none">
                  {peaks.map((b, i) => {
                    const x = ((i + 0.5) / peaks.length) * 300;
                    return (
                      <path key={b.key} data-arrow d={`M${x} 28V4M${x - 6} 10l6-6 6 6`} fill="none" stroke="var(--gold)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    );
                  })}
                </svg>
              </>
            )}

            <div
              className="mt-2 grid gap-2 sm:mt-0 lg:[grid-template-columns:var(--bok-frame)]"
              style={{ "--bok-frame": [left.length && "3.75rem", "minmax(0,1fr)", right.length && "3.75rem"].filter(Boolean).join(" ") }}
            >
              {left.length > 0 && <div className="grid gap-2">{left.map((b) => block(b, "min-h-14 lg:min-h-0", true))}</div>}
              <div className="grid gap-2">
                {bands.map((b) => block(b, "min-h-14"))}
                {cores.length > 0 && <div className="grid gap-2 py-2 sm:grid-cols-2">{cores.map((b) => block(b, "min-h-16"))}</div>}
                {of("base").map((b) => block(b, "min-h-14"))}
              </div>
              {right.length > 0 && <div className="grid gap-2">{right.map((b) => block(b, "min-h-14 lg:min-h-0", true))}</div>}
            </div>
          </div>

          {/* panel mata kuliah */}
          {cur && (
            <div ref={panel} className="rounded-xl border border-line bg-cream p-6 lg:sticky lg:top-28" aria-live="polite">
              <p data-swap className="kicker text-maroon">{t.groupLabels[cur.group]}</p>
              <p data-swap className="mt-2 font-serif text-[clamp(1.5rem,2.4vw,1.9rem)] leading-tight text-navy">{cur.name}</p>
              <p data-swap className="mt-1.5 text-[14px] text-text/60">{cur.courses.length ? fill(t.countLabel, { n: cur.courses.length }) : t.emptyLabel}</p>
              <ul className="mt-5 space-y-1.5">
                {cur.courses.map((slug) => {
                  const c = bySlug[slug];
                  if (!c) return null;
                  return (
                    <li key={slug} data-swap>
                      <button type="button" onClick={() => openRps(slug)} className="group flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-white">
                        <RumpunDot rumpun={c.rumpun} />
                        <span className="min-w-0 flex-1 text-[14.5px] text-navy transition-colors group-hover:text-maroon">{c.nama}</span>
                        <span className="shrink-0 text-[12px] tabular-nums text-text/45">{c.semester ? fill(t.semesterShort, { n: c.semester }) : t.electiveShort}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {bokSuggested && <p className="mt-5 inline-flex rounded bg-cream-2 px-2 py-0.5 text-[11px] font-medium text-text/55">{t.suggestedNote}</p>}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
