"use client";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { fill } from "@/lib/bidang-cms/schema";
import { isSafeUrl } from "@/lib/cms/shape";
import { Container, PillLink, SceneTitle } from "@/components/home/shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { BidangBanner } from "./bidang-banner";
import { smoothTo } from "./bidang-hero";
import { useBidang } from "./bidang-provider";

const pad = (n) => String(n).padStart(2, "0");

/**
 * Penutup "Rak pilihanmu" — dinamis: satu slot per bidang di atas rak navy, terisi bidang yang ditandai
 * (dari modal atau penakar minat). Kartu masuk/keluar dengan pegas (motion), × melepas (toast + Batalkan).
 * Tautan lanjutan dari Konsol; token `{short}`/`{lulusan}` mengikuti bidang pertama di rak.
 */
export function ShortlistClosing() {
  const { fields, rack, shortlist, toggleShortlist, openField } = useBidang();
  const reduce = useReducedMotion();
  const picked = shortlist.map((s) => fields.findIndex((f) => f.slug === s)).filter((i) => i >= 0);
  const first = picked.length ? fields[picked[0]] : null;
  const slots = Array.from({ length: fields.length }, (_, k) => picked[k] ?? null);
  const lulusan = first?.profileKey ? `/profil-lulusan#pl-${first.profileKey}` : "/profil-lulusan";
  const vars = { title: first?.title, short: first?.short, n: picked.length, lulusan };

  const next = (rack.next ?? [])
    .map((l) => {
      const usesFirst = /\{(title|short)\}/.test(l.title);
      const title = usesFirst && !first ? l.titleEmpty || "" : fill(l.title, vars);
      return { kicker: l.kicker, title, href: fill(l.href, vars) };
    })
    .filter((l) => l.title && l.href && isSafeUrl(l.href));

  const text = picked.length === 0 ? rack.emptyText : picked.length === 1 ? fill(rack.oneText, vars) : fill(rack.manyText, vars);

  return (
    <section id="rak" className="relative scroll-mt-24 bg-cream-2/60 pb-20 pt-16 md:pb-20 md:pt-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-14">
          <div>
            <SceneTitle title={rack.title} />
            <p className="mt-4 max-w-md text-pretty text-[16px] leading-relaxed text-text/65" aria-live="polite">{text}</p>
            <BidangBanner banner={rack.banner} className="mt-6" />
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              {rack.pmb?.label && rack.pmb?.href && (
                <PillLink href={rack.pmb.href} variant="gold" target="_blank" rel="noopener noreferrer">{rack.pmb.label}</PillLink>
              )}
              {picked.length === 0 && rack.backLabel && (
                <button type="button" onClick={() => smoothTo("bidang")} className="text-[15px] font-semibold text-navy">
                  <span className="u-gold">{rack.backLabel}</span>
                </button>
              )}
            </div>
          </div>

          {/* rak */}
          <div className="relative">
            <ul className={cn("grid grid-cols-2 gap-3", fields.length <= 4 ? "sm:grid-cols-4" : fields.length === 5 ? "sm:grid-cols-5" : "sm:grid-cols-6")}>
              {slots.map((i, k) => (
                <li key={k} className="relative aspect-[3/4]">
                  <span aria-hidden className="absolute inset-0 rounded-lg border-2 border-dashed border-navy/15" />
                  <AnimatePresence mode="popLayout">
                    {i != null ? (
                      <motion.div
                        key={fields[i].slug}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -40, rotate: -4 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                        className="absolute inset-0 overflow-hidden rounded-lg bg-navy text-white shadow-[0_20px_40px_-25px_rgb(20_33_61/0.7)]"
                      >
                        <button type="button" onClick={(e) => openField(i, e.currentTarget)} className="group block size-full text-left" aria-label={`${fields[i].title}`}>
                          {fields[i].image && (
                            <Image src={fields[i].image} alt="" fill sizes="200px" className={cn("object-cover opacity-60 transition-transform duration-700 ease-cinematic group-hover:scale-105", fields[i].crop && "scale-[1.12]")} />
                          )}
                          <span className="absolute inset-x-0 bottom-0 bg-navy-deep/85 p-3">
                            <span className="tabular block text-[10.5px] tracking-[0.16em] text-gold-soft">{pad(i + 1)}</span>
                            <span className="mt-0.5 block font-serif text-[1.05rem] leading-tight">{fields[i].title}</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleShortlist(fields[i].slug)}
                          aria-label={fill(rack.removeLabel || "Lepas {title}", { title: fields[i].title })}
                          className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 text-navy transition-colors hover:bg-maroon hover:text-white"
                        >
                          <X className="size-3.5" />
                        </button>
                      </motion.div>
                    ) : (
                      k === 0 &&
                      picked.length === 0 && (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-center p-4">
                          <LottieIllustration src="/lottie/empty-news.json" className="w-full max-w-[120px]" label={rack.emptyText} />
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ul>
            {/* papan rak */}
            <span aria-hidden className="mt-3 block h-3 rounded-sm bg-navy" />
            <span aria-hidden className="mx-6 block h-2 rounded-b-sm bg-navy-deep" />
          </div>
        </div>

        {/* tautan lanjutan */}
        {next.length > 0 && (
          <ul className={cn("mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line", next.length === 2 ? "sm:grid-cols-2" : next.length >= 3 ? "sm:grid-cols-3" : "")}>
            {next.map((l, k) => (
              <li key={k} className="bg-white">
                <a href={l.href} className="group flex h-full items-center justify-between gap-4 p-5 transition-colors duration-300 hover:bg-cream sm:p-6">
                  <span>
                    <span className="kicker block text-[11px] text-maroon">{l.kicker}</span>
                    <span className="mt-1 block font-serif text-[1.2rem] leading-tight text-navy">{l.title}</span>
                  </span>
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0 text-maroon transition-transform duration-500 ease-cinematic group-hover:translate-x-1">
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
