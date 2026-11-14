"use client";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { fill } from "@/lib/prestasi-cms/schema";
import { cn } from "@/lib/utils";
import { LevelBadge } from "./prestasi-provider";

/**
 * Modal peraih prestasi: panel navy (foto, nama, ringkasan per tingkat, medali Lottie) +
 * linimasa semua prestasi orang tersebut. ‹ › dan panah keyboard berpindah peraih.
 */
export function AchieverModal({ achievers, levels, categories, copy, slug, onSlug, onClose }) {
  const index = achievers.findIndex((a) => a.slug === slug);
  const item = achievers[index];
  const go = (d) => onSlug(achievers[(index + d + achievers.length) % achievers.length].slug);

  return (
    <Modal open={!!item} onOpenChange={(o) => !o && onClose()}>
      <ModalContent
        className="max-w-4xl p-0"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        {item && (
          <div key={item.slug} className="grid animate-in fade-in-0 slide-in-from-right-2 duration-300 md:grid-cols-[280px_1fr]">
            {/* panel navy */}
            <div className="relative overflow-hidden bg-navy p-6 text-white md:p-7">
              <span aria-hidden className="pointer-events-none absolute -bottom-20 -left-20 size-56 rounded-full border border-white/10" />
              <div className="relative mx-auto aspect-[4/5] w-36 overflow-hidden rounded-md bg-navy-deep md:w-full">
                {item.photo ? (
                  <Image src={item.photo} alt={item.short} fill sizes="280px" className="object-cover object-top animate-in zoom-in-105 fade-in-0 duration-700" />
                ) : (
                  <span className="grid size-full place-items-center font-serif text-5xl text-gold-soft">{item.initials}</span>
                )}
                <span className="kicker absolute left-2 top-2 rounded bg-navy/85 px-2 py-1 text-[10px] text-gold-soft">{categories.find((c) => c.key === item.category)?.label}</span>
              </div>
              <span aria-hidden className="mx-auto mt-5 block h-[3px] w-10 bg-gold md:mx-0" />
              <p className="mt-3 text-center text-[13px] leading-relaxed text-white/65 md:text-left">{item.name}</p>

              <dl className="relative mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                {levels.map((l) => (
                  <div key={l.key}>
                    <dd className="tabular font-serif text-[1.6rem] leading-none text-gold">{item.items.filter((i) => i.level === l.key).length}</dd>
                    <dt className="mt-1 text-[11px] text-white/55">{l.label}</dt>
                  </div>
                ))}
              </dl>
              <div className="pointer-events-none absolute -bottom-3 -right-3 hidden w-24 opacity-90 md:block">
                {copy.lottie && <LottieIllustration src={copy.lottie} loop={false} />}
              </div>
            </div>

            {/* linimasa */}
            <div className="flex max-h-[72vh] flex-col overflow-y-auto p-6 sm:p-8">
              <p className="kicker text-maroon">
                {fill(copy.countLabel, { n: item.items.length })}
                {Number.isFinite(item.since) && copy.sinceLabel ? ` · ${fill(copy.sinceLabel, { year: item.since })}` : ""}
              </p>
              <ModalTitle className="mt-3 text-[1.7rem] leading-snug">{item.short}</ModalTitle>
              <ModalDescription className="mt-1 text-[14px]">{copy.description}</ModalDescription>

              <ol className="relative mt-6 space-y-5 border-l border-line pl-6">
                {item.items.map((a, i) => (
                  <li key={a.id} className="relative animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both" style={{ animationDelay: `${80 + i * 70}ms` }}>
                    <span aria-hidden className={cn("absolute -left-[30px] top-1 size-3 rounded-full border-2 border-white", a.level === "internasional" ? "bg-navy" : a.level === "nasional" ? "bg-maroon" : "bg-gold")} />
                    <div className="flex flex-wrap items-center gap-2">
                      <LevelBadge level={a.level} label={a.levelLabel} />
                      <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-text/45">{a.role}</span>
                      <span className="tabular text-[12.5px] text-text/50">{a.yearLabel}</span>
                    </div>
                    <p className="mt-2 font-serif text-[1.12rem] leading-snug text-navy">{a.title}</p>
                    {a.description && <p className="mt-1 text-[13.5px] leading-relaxed text-text/60">{a.description}</p>}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-3 sm:px-8">
          <span className="tabular text-[12.5px] text-text/45">
            {index + 1} / {achievers.length}
          </span>
          <div className="flex items-center gap-2">
            <NavBtn label={copy.prevLabel} onClick={() => go(-1)} icon={ChevronLeft} />
            <NavBtn label={copy.nextLabel} onClick={() => go(1)} icon={ChevronRight} />
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

function NavBtn({ label, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-md border border-line text-navy transition-[border-color,background-color,color,transform] duration-300 hover:border-maroon hover:bg-maroon hover:text-white active:scale-95"
    >
      <Icon aria-hidden className="size-4" />
    </button>
  );
}
