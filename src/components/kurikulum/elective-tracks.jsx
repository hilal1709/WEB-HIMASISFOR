"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, SectionHeader } from "@/components/home/shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { fill } from "@/lib/kurikulum-content";
import { useKurikulum } from "./kurikulum-provider";
import { RpsStatus } from "./semester-ledger";

/**
 * Mata kuliah pilihan sebagai panel akordeon horizontal (≥ lg): tiga kolom navy, judul vertikal;
 * hover/fokus/klik mengembangkan satu kolom (GSAP flex-grow) dan menampilkan ilustrasi + daftar
 * mata kuliahnya. Ponsel: kolom bertumpuk, satu terbuka.
 */
export function ElectiveTracks() {
  const { electives, openRps, copy } = useKurikulum();
  const t = copy.pilihan;
  const [open, setOpen] = useState(0);
  const on0 = Math.min(open, Math.max(electives.length - 1, 0));
  const wrap = useRef(null);

  useEffect(() => {
    const panels = wrap.current?.querySelectorAll("[data-panel]");
    if (!panels?.length) return;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    if (!wide) {
      panels.forEach((p) => (p.style.flexGrow = ""));
      return;
    }
    const dur = prefersReducedMotion() ? 0 : 0.8;
    panels.forEach((p, i) => gsap.to(p, { flexGrow: i === open ? 5 : 1, duration: dur, ease: "expo.out", overwrite: true }));
    const body = panels[open]?.querySelectorAll("[data-reveal]");
    if (body && dur) gsap.fromTo(body, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "expo.out", delay: 0.15 });
  }, [open, electives.length]);

  return (
    <section id="pilihan" className="relative scroll-mt-24 bg-white py-16 md:py-20">
      <Container>
        <SectionHeader title={t.title} body={t.body} size="sm" />
        <div ref={wrap} className="mt-10 flex flex-col gap-3 lg:h-[460px] lg:flex-row">
          {electives.map((e, i) => {
            const on = i === on0;
            return (
              <div
                key={e.key}
                data-panel
                data-lottie-hover
                onMouseEnter={() => setOpen(i)}
                onFocus={() => setOpen(i)}
                className={cn("relative flex min-w-0 flex-col overflow-hidden rounded-xl bg-navy text-white lg:basis-0 lg:flex-row", on ? "lg:grow-[5]" : "lg:grow")}
              >
                {/* label vertikal saat tertutup */}
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={`pilihan-${e.key}`}
                  onClick={() => setOpen(i)}
                  className={cn("flex w-full items-center justify-between gap-4 p-5 text-left lg:shrink-0 lg:flex-col lg:justify-between lg:py-7", on ? "lg:w-20 lg:border-r lg:border-white/10" : "lg:w-full transition-colors hover:bg-white/5")}
                >
                  <span className="font-serif text-[13px] tabular-nums text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-serif text-[1.35rem] leading-none lg:[writing-mode:vertical-rl] lg:rotate-180">{e.name}</span>
                  <span aria-hidden className={cn("grid size-8 place-items-center rounded-full border border-white/25 text-lg transition-transform duration-500", on && "rotate-45 border-gold text-gold")}>+</span>
                </button>

                <div id={`pilihan-${e.key}`} hidden={!on} className="min-w-0 flex-1 p-5 pt-0 lg:flex lg:gap-8 lg:p-8">
                  <div className="lg:w-[38%] lg:shrink-0">
                    {e.lottie && (
                      <div data-reveal className="w-32 lg:w-44">
                        <LottieIllustration src={e.lottie} replayOnHover label={fill(t.illustrationAria, { name: e.name })} />
                      </div>
                    )}
                    <p data-reveal className="mt-4 max-w-xs text-pretty text-[15px] leading-relaxed text-white/75">{e.lead}</p>
                  </div>
                  <ul className="mt-6 flex-1 divide-y divide-white/10 border-y border-white/10 lg:mt-0 lg:self-center">
                    {e.matkul.map((c) => (
                      <li key={c.slug} data-reveal>
                        <button type="button" onClick={() => openRps(c.slug)} className="group flex w-full items-center justify-between gap-4 py-3.5 text-left">
                          <span className="min-w-0">
                            <span className="block text-[15.5px] font-semibold transition-colors group-hover:text-gold-soft">{c.nama}</span>
                            <RpsStatus course={c} tone="dark" />
                          </span>
                          <span className="shrink-0 text-[13px] tabular-nums text-white/55">{fill(copy.peta.sks, { n: c.sks ?? "–" })}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
