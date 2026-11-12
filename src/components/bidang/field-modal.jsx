"use client";
import { useRef } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { LordIcon } from "@/components/media/lord-icon";
import { PlaceholderTag } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { useBidang } from "./bidang-provider";

const pad = (n) => String(n).padStart(2, "0");
const EASE = [0.22, 1, 0.36, 1];

/**
 * Modal rangkuman bidang. Radix Dialog (fokus terkunci, Esc) + motion: kartu "tumbuh" dari tile/tombol
 * asalnya (`origin` = selisih pusat elemen terhadap pusat layar) dan menyusut kembali saat ditutup.
 * Isi: pertanyaan inti, yang dipelajari, alat kerja, mata kuliah (→ laci RPS kurikulum), dosen (→ profil),
 * prospek karier (→ profil lulusan). Aksi: tandai ke rak (toast + Batalkan). ‹ › + panah keyboard.
 */
export function FieldModal({ fields, index, origin, onIndex, onClose }) {
  const last = useRef(null);
  if (index != null) last.current = index;
  const shown = index ?? last.current;
  const f = shown != null ? fields[shown] : null;
  const reduce = useReducedMotion();
  const go = (d) => index != null && onIndex((index + d + fields.length) % fields.length);
  const from = reduce || !origin ? { opacity: 0, scale: 0.97, y: 12 } : { opacity: 0, scale: 0.35, x: origin.x, y: origin.y };

  return (
    <Dialog.Root open={index != null} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {index != null && f && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[90] bg-navy-deep/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount onKeyDown={(e) => (e.key === "ArrowRight" ? go(1) : e.key === "ArrowLeft" ? go(-1) : null)}>
              <motion.div
                className="fixed inset-0 z-[90] m-auto flex h-fit max-h-[92vh] w-[calc(100%-1.5rem)] max-w-4xl flex-col overflow-hidden rounded-xl border border-line bg-white text-text shadow-[0_40px_100px_-30px_rgb(14_24_48/0.65)] outline-none"
                initial={from}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                exit={{ ...from, transition: { duration: 0.35, ease: EASE } }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <div className="absolute inset-x-0 top-0 z-10 flex h-1">
                  <span className="w-2/3 bg-maroon" />
                  <span className="flex-1 bg-gold" />
                </div>
                <Dialog.Close
                  aria-label="Tutup"
                  className="absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full bg-white/90 text-navy shadow-sm transition-colors hover:bg-maroon hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                  <X className="size-4" />
                </Dialog.Close>
                <Body key={f.slug} f={f} n={shown + 1} />
                <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 sm:px-7">
                  <div className="flex gap-1.5" aria-hidden>
                    {fields.map((_, i) => (
                      <span key={i} className={cn("h-1.5 rounded-full transition-[width,background-color] duration-500 ease-cinematic", i === shown ? "w-6 bg-maroon" : "w-1.5 bg-line")} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <NavBtn label="Bidang sebelumnya" onClick={() => go(-1)} icon={ChevronLeft} />
                    <NavBtn label="Bidang berikutnya" onClick={() => go(1)} icon={ChevronRight} />
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function Body({ f, n }) {
  const { shortlist, toggleShortlist } = useBidang();
  const saved = shortlist.includes(f.slug);


  return (
    <div className="grid min-h-0 flex-1 animate-in fade-in-0 overflow-y-auto duration-300 md:grid-cols-[300px_1fr] md:overflow-hidden">
      {/* panel kiri */}
      <div className="relative flex flex-col bg-navy text-white" data-lottie-hover>
        <div className="relative h-36 overflow-hidden md:h-48">
          <Image src={f.image} alt="" fill sizes="300px" className={cn("object-cover", f.crop && "scale-[1.12]")} />
          <span className="absolute inset-0 bg-navy/45" />
        </div>
        {f.lottie && (
          <span className="absolute left-5 top-[104px] z-10 grid size-20 place-items-center rounded-full border-4 border-navy bg-maroon p-2.5 md:top-[152px]">
            <LottieIllustration src={f.lottie} replayOnHover />
          </span>
        )}
        <div className="flex flex-1 flex-col gap-5 px-5 pb-6 pt-12 md:px-6">
          <div>
            <p className="kicker text-[11px] text-gold-soft">Prospek karier</p>
            <ul className="mt-2 space-y-1.5">
              {f.careers.map((c) => (
                <li key={c}>
                  <a href={`/profil-lulusan#pl-${f.profileKey}`} className="group flex items-center justify-between gap-3 border-b border-white/10 pb-1.5 text-[14.5px] text-white/90 transition-colors hover:text-gold-soft">
                    {c}
                    <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 opacity-40 transition-[opacity,transform] duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {f.people.length > 0 && (
            <div>
              <p className="kicker text-[11px] text-gold-soft">Dosen pengampu</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {f.people.map((p) => (
                  <li key={p.slug}>
                    <a href={`/dosen#dosen-${p.slug}`} title={p.name} aria-label={`Profil ${p.name}`} className="group relative block size-11 overflow-hidden rounded-full border-2 border-white/20 bg-navy-deep transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-gold">
                      {p.photo ? <Image src={p.photo} alt="" fill sizes="44px" className="object-cover" /> : <span className="grid size-full place-items-center text-[12px] font-semibold">{p.initials}</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* isi kanan */}
      <div className="min-h-0 overflow-y-auto p-6 sm:p-8 md:max-h-[calc(92vh-60px)]">
        <p className="kicker text-maroon">Bidang {pad(n)}</p>
        <Dialog.Title className="mt-2 pr-10 font-serif text-[1.85rem] leading-tight text-navy sm:text-[2.1rem]">{f.title}</Dialog.Title>
        <Dialog.Description className="mt-2 font-serif text-[1.15rem] italic leading-snug text-maroon">“{f.question}”</Dialog.Description>
        <p className="mt-4 text-pretty text-[15px] leading-relaxed text-text/70">{f.summary}</p>

        <Block title="Yang kamu pelajari">
          <ol className="space-y-2.5">
            {f.learn.map((l, i) => (
              <li key={l} className="flex gap-3 text-[14.5px] text-navy animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both" style={{ animationDelay: `${120 + i * 70}ms` }}>
                <span className="tabular w-6 shrink-0 font-serif text-gold">{pad(i + 1)}</span>
                {l}
              </li>
            ))}
          </ol>
        </Block>

        <Block title="Alat & kerangka kerja">
          <ul className="flex flex-wrap gap-2">
            {f.tools.map((t) => (
              <li key={t} className="rounded-md border border-line bg-cream/60 px-2.5 py-1 text-[13px] font-medium text-navy">{t}</li>
            ))}
          </ul>
        </Block>

        {f.courseLinks.length > 0 && (
          <Block title="Mata kuliah kunci">
            <ul className="divide-y divide-line border-y border-line">
              {f.courseLinks.map((c) => (
                <li key={c.slug}>
                  <a href={`/curiculum#rps-${c.slug}`} className="group flex items-center gap-3 py-2.5 text-[14.5px] text-navy transition-colors hover:text-maroon">
                    <span className="min-w-0 flex-1 truncate">{c.nama}</span>
                    {c.sks != null && <span className="tabular text-[12.5px] text-text/45">{c.sks} SKS</span>}
                    {c.rps && <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-navy">RPS</span>}
                    <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 text-maroon opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </Block>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => toggleShortlist(f.slug)}
            aria-pressed={saved}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-md px-4 text-[14.5px] font-semibold transition-[background-color,color,transform] duration-300 ease-cinematic active:scale-[0.97]",
              saved ? "bg-navy text-white hover:bg-navy-deep" : "bg-maroon text-white hover:bg-maroon-deep"
            )}
          >
            <LordIcon key={saved ? "on" : "off"} name={saved ? "check" : "plus-circle"} size={22} trigger={saved ? "once" : "hover"} target="button" colors="primary:#ffffff,secondary:#c9a227" />
            {saved ? "Ada di rakmu" : "Tandai bidang ini"}
          </button>
          {f.sample && <PlaceholderTag />}
        </div>
      </div>
    </div>
  );
}

function Block({ title, children }) {
  return (
    <div className="mt-7">
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-text/45">{title}</p>
      {children}
    </div>
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
