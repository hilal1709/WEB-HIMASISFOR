"use client";
import { useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { FIELDS, MODES, programLabel } from "@/lib/magang-content";
import { LordIcon } from "@/components/media/lord-icon";
import { PlaceholderTag } from "@/components/home/shared";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { NavBtn } from "@/components/jalur/stage-modal";
import { DeadlineChip, matches } from "./job-board";
import { STAGES, useMagang } from "./magang-provider";

const EASE = [0.22, 1, 0.36, 1];
const fieldLabel = (k) => FIELDS.find((f) => f.key === k)?.label ?? k;
const modeLabel = (k) => MODES.find((m) => m.key === k)?.label ?? k;

/**
 * Modal detail lowongan. Logo & judul memakai `layoutId` yang sama dengan baris di papan, sehingga baris
 * terasa "tumbuh" menjadi modal. Ponsel: lembar bawah. ‹ › + panah keyboard berpindah ke posisi lain
 * dalam hasil filter aktif.
 */
export function JobModal({ slug, onSlug, onClose }) {
  const { jobs, filter, track, toggleSave, markApplied, jobsSample } = useMagang();
  const toast = useToast();
  const reduce = useReducedMotion();
  const last = useRef(null);
  if (slug) last.current = slug;
  const shownSlug = slug ?? last.current;

  const pool = jobs.filter((j) => matches(j, filter, filter.q));
  const list = pool.some((j) => j.slug === shownSlug) ? pool : jobs;
  const index = list.findIndex((j) => j.slug === shownSlug);
  const j = index >= 0 ? list[index] : null;
  const go = (d) => slug && list.length > 1 && onSlug(list[(index + d + list.length) % list.length].slug);

  const stage = j ? track[j.slug] : null;
  const closed = j?.days != null && j.days < 0;

  const apply = () => {
    if (!j) return;
    if (!j.href) {
      toast.info("Tautan lamaran menyusul", { description: "Koordinator magang akan mengumumkannya di papan agenda prodi." });
      return;
    }
    window.open(j.href, "_blank", "noopener,noreferrer");
    if (!stage || stage === "simpan") {
      toast.success("Semoga lolos!", {
        description: "Tandai lamaran ini sebagai sudah dikirim?",
        action: { label: "Tandai Melamar", onClick: () => markApplied(j.slug) },
      });
    }
  };

  return (
    <Dialog.Root open={!!slug && !!j} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {slug && j && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-[90] bg-navy-deep/55 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount onKeyDown={(e) => (e.key === "ArrowRight" ? go(1) : e.key === "ArrowLeft" ? go(-1) : null)}>
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[90] mx-auto flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-line bg-white text-text shadow-[0_40px_100px_-30px_rgb(14_24_48/0.65)] outline-none sm:inset-0 sm:m-auto sm:h-fit sm:w-[calc(100%-2rem)] sm:rounded-xl"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, transition: { duration: 0.25, ease: EASE } }}
                transition={{ duration: 0.5, ease: EASE }}
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

                <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
                  <div className="flex items-start gap-4 pr-10">
                    <motion.span layoutId={`job-logo-${j.slug}`} className="tabular grid size-16 shrink-0 place-items-center rounded-lg bg-navy font-serif text-[1.4rem] text-gold-soft">
                      {j.logo}
                    </motion.span>
                    <div className="min-w-0">
                      <p className="text-[13.5px] text-text/60">{j.company}</p>
                      <Dialog.Title asChild>
                        <motion.h2 layoutId={`job-title-${j.slug}`} className="mt-0.5 font-serif text-[1.65rem] leading-tight text-navy sm:text-[1.9rem]">
                          {j.title}
                        </motion.h2>
                      </Dialog.Title>
                    </div>
                  </div>

                  <motion.div key={j.slug} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE, delay: 0.1 }}>
                    <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
                      {[
                        ["Pintu", programLabel(j.program)],
                        ["Lokasi", modeLabel(j.mode)],
                        ["Durasi", j.duration],
                        ["Bidang", fieldLabel(j.field)],
                      ].map(([k, v]) => (
                        <div key={k} className="bg-cream/60 px-3 py-2.5">
                          <dt className="kicker text-[10px] text-maroon">{k}</dt>
                          <dd className="mt-0.5 text-[13.5px] font-medium leading-snug text-navy">{v}</dd>
                        </div>
                      ))}
                    </dl>

                    <Dialog.Description className="sr-only">
                      Lowongan {j.title} di {j.company}, {programLabel(j.program)}, durasi {j.duration}.
                    </Dialog.Description>

                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                      {[
                        ["Yang akan kamu kerjakan", j.tasks],
                        ["Yang perlu kamu bawa", j.needs],
                      ].map(([title, items]) =>
                        items.length ? (
                          <div key={title}>
                            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-text/45">{title}</p>
                            <ul className="mt-3 space-y-2.5">
                              {items.map((t) => (
                                <li key={t} className="flex gap-3 text-[14.5px] leading-snug text-navy">
                                  <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-gold" />
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <DeadlineChip days={j.days} />
                      <a href={`/bidang-keahlian#bidang-${j.field}`} className="text-[13px] font-semibold text-maroon">
                        <span className="u-gold">Tentang bidang {fieldLabel(j.field)}</span>
                      </a>
                      {jobsSample && <PlaceholderTag />}
                    </div>
                  </motion.div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 sm:px-7">
                  <div className="flex flex-1 gap-2">
                    <button
                      type="button"
                      onClick={apply}
                      disabled={closed}
                      className="group inline-flex h-11 items-center gap-2 rounded-md bg-maroon px-5 text-[14.5px] font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-maroon-deep active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-text/25"
                    >
                      {closed ? "Pendaftaran ditutup" : "Lamar posisi ini"}
                      {!closed && (
                        <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                          <path d="M5 11l6-6M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSave(j.slug)}
                      aria-pressed={!!stage}
                      className={cn(
                        "group inline-flex h-11 items-center gap-2 rounded-md border px-4 text-[14px] font-semibold transition-colors",
                        stage ? "border-maroon/30 bg-maroon/5 text-maroon" : "border-line text-navy hover:border-navy"
                      )}
                    >
                      <LordIcon key={stage ? "on" : "off"} name={stage ? "check" : "plus-circle"} size={20} target=".group" trigger={stage ? "once" : "hover"} colors="primary:#14213d,secondary:#6e1423" />
                      {stage ? STAGES.find((s) => s.key === stage)?.label : "Simpan"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <NavBtn label="Posisi sebelumnya" onClick={() => go(-1)} icon={ChevronLeft} />
                    <NavBtn label="Posisi berikutnya" onClick={() => go(1)} icon={ChevronRight} />
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
