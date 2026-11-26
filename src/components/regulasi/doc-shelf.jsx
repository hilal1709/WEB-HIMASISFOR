"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, SectionHeader } from "@/components/home/shared";
import { RegulasiBanner } from "./regulasi-banner";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { useRegulasi } from "./regulasi-provider";
import { fillRegulasi } from "@/lib/regulasi-cms/copy";

/** Warna sampul per dokumen (token tema, tanpa gradien). */
export const TONE = {
  maroon: { bg: "bg-maroon", text: "text-white", sub: "text-gold-soft", dark: true },
  navy: { bg: "bg-navy ring-1 ring-inset ring-white/15", text: "text-white", sub: "text-gold-soft", dark: true },
  gold: { bg: "bg-gold", text: "text-navy", sub: "text-maroon-deep", dark: false },
  ivory: { bg: "bg-cream", text: "text-navy", sub: "text-maroon", dark: false },
};
const HEIGHTS = ["h-[300px] sm:h-[330px]", "h-[270px] sm:h-[296px]", "h-[290px] sm:h-[316px]", "h-[250px] sm:h-[276px]"];

/** Sampul dokumen (dipakai pratinjau & modal). */
export function DocCover({ d, version, className, ui }) {
  const t = TONE[d.tone] ?? TONE.navy;
  return (
    <div className={cn("relative flex flex-col overflow-hidden rounded-xl p-6", t.bg, t.text, className)}>
      <span aria-hidden className={cn("absolute inset-y-0 left-4 w-px", t.dark ? "bg-white/15" : "bg-navy/15")} />
      <p className={cn("kicker pl-4 text-[10.5px]", t.sub)}>{fillRegulasi(ui.imprint, { version })}</p>
      <p className="mt-3 pl-4 font-serif text-[1.7rem] leading-tight">{d.title}</p>
      <div className="mt-auto flex justify-end pt-4">
        {d.image ? (
          <Image src={d.image} alt="" width={480} height={240} className="max-h-36 w-full object-contain object-right" unoptimized />
        ) : t.dark && ui.coverIllustration ? (
          <LottieIllustration src={ui.coverIllustration} className="w-36 sm:w-44" replayOnHover />
        ) : (
          <span aria-hidden className="font-serif text-[7rem] italic leading-none opacity-25">{ui.coverMark}</span>
        )}
      </div>
    </div>
  );
}

/**
 * Rak dokumen — punggung map berdiri di rak navy. Hover/fokus: map tertarik ke atas & miring (GSAP back.out),
 * map lain condong menjauh; pratinjau sampul (cover-first, inspirasi horizonx) mengikuti map yang disentuh.
 * Klik → modal dokumen.
 */
export function DocShelf() {
  const { docs, version, openDoc, notice, copy } = useRegulasi();
  const ui = copy.documents;
  const [active, setActive] = useState(null);
  const peek = Math.max(0, docs.findIndex((item) => item.key === active));
  const shelf = useRef(null);
  const d = docs[peek];

  const lean = (i) => {
    setActive(docs[i]?.key);
    if (prefersReducedMotion()) return;
    shelf.current?.querySelectorAll(".rg-binder").forEach((el, k) => {
      gsap.to(el, k === i ? { y: -26, rotate: -2.5, duration: 0.55, ease: "back.out(2.2)" } : { y: 0, rotate: k < i ? -3 : 3, duration: 0.6, ease: "expo.out" });
    });
  };
  const rest = () => {
    if (prefersReducedMotion()) return;
    shelf.current?.querySelectorAll(".rg-binder").forEach((el) => gsap.to(el, { y: 0, rotate: 0, duration: 0.6, ease: "expo.out" }));
  };

  if (!d && !notice) return null;
  return (
    <section id="unduhan" className="relative scroll-mt-20 bg-cream-2/60 py-16 md:py-20">
      <Container>
        {d && <SectionHeader title={[ui.title, ui.accent]} body={ui.intro} />}
        <RegulasiBanner className="mt-8" />

        {d && <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-12">
          <div data-aos="fade-up" className={cn("relative min-w-0 rounded-2xl bg-navy-deep px-6 pt-14 sm:px-10", docs.length > 4 ? "overflow-x-auto" : "overflow-hidden")} onPointerLeave={rest}>
            <div ref={shelf} className={cn("relative flex items-end justify-center gap-3 sm:gap-5", docs.length > 4 && "min-w-max")}>
              {docs.map((x, i) => {
                const t = TONE[x.tone] ?? TONE.navy;
                return (
                  <button
                    key={x.key}
                    type="button"
                    onPointerEnter={() => lean(i)}
                    onFocus={() => lean(i)}
                    onBlur={rest}
                    onClick={() => openDoc(i)}
                    aria-label={x.pages ? fillRegulasi(ui.label, x) : x.title}
                    className={cn(
                      "rg-binder relative flex w-[64px] flex-col items-center rounded-t-md pb-4 pt-5 shadow-[inset_-6px_0_0_rgb(0_0_0/0.12)] outline-none focus-visible:ring-2 focus-visible:ring-gold sm:w-[78px]",
                      HEIGHTS[i % HEIGHTS.length],
                      t.bg,
                      t.text
                    )}
                  >
                    <span aria-hidden className={cn("size-5 rounded-full border-2", t.dark ? "border-white/40" : "border-navy/30")} />
                    <span className="mt-4 flex-1 font-serif text-[17px] leading-none [writing-mode:vertical-rl] sm:text-[19px]" style={{ transform: "rotate(180deg)" }}>
                      {x.short || x.title}
                    </span>
                    <span aria-hidden className={cn("mt-3 h-1 w-8 rounded-full", t.dark ? "bg-gold" : "bg-maroon")} />
                  </button>
                );
              })}
            </div>
            {/* papan rak */}
            <span aria-hidden className="relative -mx-6 block h-4 bg-navy sm:-mx-10">
              <span className="absolute inset-x-0 top-0 h-[3px] bg-gold" />
            </span>
          </div>

          <div aria-live="polite">
            <DocCover key={d.key} d={d} version={version} ui={ui} className="aspect-[16/10] animate-in fade-in-0 slide-in-from-bottom-2 duration-500" />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[14px] text-text/60">
                {d.pages && d.size ? fillRegulasi(ui.specs, d) : [d.pages ? fillRegulasi(ui.pageCount, d) : "", d.size].filter(Boolean).join(" · ")}
                <span className={cn("ml-2 rounded px-1.5 py-0.5 text-[12px] font-semibold", d.href ? "bg-success-soft text-success" : "bg-cream text-text/55")}>{d.href ? ui.available : ui.pending}</span>
              </p>
              <button type="button" onClick={() => openDoc(peek)} className="text-[14.5px] font-semibold text-maroon">
                <span className="u-gold">{ui.details}</span>
              </button>
            </div>
          </div>
        </div>}
      </Container>
    </section>
  );
}
