"use client";
import { useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { PlaceholderTag } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { NavBtn } from "./stage-modal";

const pad = (n) => String(n).padStart(2, "0");
const EASE = [0.22, 1, 0.36, 1];

/**
 * Modal ringkasan jalur. Panel kiri navy (Lottie, fakta jalur), kanan: untuk siapa, risiko, dan
 * tahapan ringkas — tiap tahap membuka modal tahap. ‹ › + panah keyboard berpindah jalur.
 */
export function PathModal({ paths, index, onIndex, onClose, onStage, method }) {
  const last = useRef(null);
  if (index != null) last.current = index;
  const shown = index ?? last.current;
  const p = shown != null ? paths[shown] : null;
  const reduce = useReducedMotion();
  const go = (d) => index != null && onIndex((index + d + paths.length) % paths.length);

  return (
    <Dialog.Root open={index != null} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {index != null && p && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-[90] bg-navy-deep/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount onKeyDown={(e) => (e.key === "ArrowRight" ? go(1) : e.key === "ArrowLeft" ? go(-1) : null)}>
              <motion.div
                className="fixed inset-0 z-[90] m-auto flex h-fit max-h-[92vh] w-[calc(100%-1.5rem)] max-w-4xl flex-col overflow-hidden rounded-xl border border-line bg-white text-text shadow-[0_40px_100px_-30px_rgb(14_24_48/0.65)] outline-none"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10, transition: { duration: 0.3, ease: EASE } }}
                transition={{ duration: 0.55, ease: EASE }}
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

                <div key={p.key} className="grid min-h-0 flex-1 animate-in fade-in-0 overflow-y-auto duration-300 md:grid-cols-[280px_1fr] md:overflow-hidden">
                  <div className="flex flex-col bg-navy px-6 pb-6 pt-8 text-white" data-lottie-hover>
                    <span className="mx-auto grid size-32 place-items-center rounded-full bg-maroon p-4">
                      <LottieIllustration src={p.lottie} replayOnHover label={`Ilustrasi jalur ${p.title}`} />
                    </span>
                    <dl className="mt-7 space-y-4">
                      {[
                        ["Durasi", p.duration],
                        ["Pendamping", p.mentor],
                        ["Luaran", p.output],
                      ].map(([k, v]) => (
                        <div key={k} className="border-b border-white/10 pb-3">
                          <dt className="kicker text-[10.5px] text-gold-soft">{k}</dt>
                          <dd className="mt-1 text-[14.5px] text-white/90">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="min-h-0 overflow-y-auto p-6 sm:p-8 md:max-h-[calc(92vh-60px)]">
                    <p className="kicker text-maroon">Jalur {pad(shown + 1)}</p>
                    <Dialog.Title className="mt-2 pr-10 font-serif text-[2rem] leading-tight text-navy">{p.title}</Dialog.Title>
                    <Dialog.Description className="mt-2 text-pretty text-[15.5px] leading-relaxed text-text/70">{p.oneLiner}</Dialog.Description>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-cream/70 p-4">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-text/45">Cocok untuk</p>
                        <p className="mt-1.5 text-[14.5px] leading-relaxed text-navy">{p.forWho}</p>
                      </div>
                      <div className="rounded-lg border border-maroon/20 p-4">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-maroon/70">Pertimbangkan</p>
                        <p className="mt-1.5 text-[14.5px] leading-relaxed text-navy">{p.risk}</p>
                      </div>
                    </div>

                    <p className="mt-7 text-[12px] font-semibold uppercase tracking-[0.14em] text-text/45">Tahapan</p>
                    <ol className="mt-3 divide-y divide-line border-y border-line">
                      {p.stages.map((s, i) => (
                        <li key={s.name}>
                          <button type="button" onClick={() => onStage(shown, i)} className="group flex w-full items-center gap-4 py-3 text-left transition-colors hover:text-maroon">
                            <span className="tabular w-6 font-serif text-gold">{pad(i + 1)}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[15px] font-medium text-navy group-hover:text-maroon">{s.name}</span>
                              <span className="block text-[13px] text-text/50">{s.time}</span>
                            </span>
                            <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 text-maroon opacity-30 transition-[opacity,transform] duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                              <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ol>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      {method?.slug && p.key === "skripsi" && (
                        <a href={`/curiculum#rps-${method.slug}`} className="group inline-flex items-center gap-2 text-[14px] font-semibold text-maroon">
                          <span className="u-gold">Prasyarat: {method.nama}</span>
                        </a>
                      )}
                      {p.sample && <PlaceholderTag />}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 sm:px-7">
                  <div className="flex gap-1.5" aria-hidden>
                    {paths.map((_, i) => (
                      <span key={i} className={cn("h-1.5 rounded-full transition-[width,background-color] duration-500 ease-cinematic", i === shown ? "w-6 bg-maroon" : "w-1.5 bg-line")} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <NavBtn label="Jalur sebelumnya" onClick={() => go(-1)} icon={ChevronLeft} />
                    <NavBtn label="Jalur berikutnya" onClick={() => go(1)} icon={ChevronRight} />
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
