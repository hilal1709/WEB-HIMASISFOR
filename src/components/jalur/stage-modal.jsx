"use client";
import { useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PlaceholderTag } from "@/components/home/shared";
import { cn } from "@/lib/utils";

const pad = (n) => String(n).padStart(2, "0");
const EASE = [0.22, 1, 0.36, 1];

/**
 * Modal tahap — gaya "tiket perjalanan": kepala navy dengan stepper bertitik (garis emas = progres,
 * titik bisa diklik), badan berisi luaran & kebutuhan tahap. Isi bergeser searah langkah (motion),
 * ‹ › + panah keyboard berpindah tahap dalam jalur yang sama.
 */
export function StageModal({ paths, at, onAt, onClose }) {
  const last = useRef(null);
  const dir = useRef(1);
  if (at) last.current = at;
  const shown = at ?? last.current;
  const reduce = useReducedMotion();
  const p = shown ? paths[shown.p] : null;
  const st = p ? p.stages[shown.s] : null;
  const total = p?.stages.length ?? 0;

  const go = (d) => {
    if (!at) return;
    dir.current = d;
    onAt(at.p, (at.s + d + total) % total);
  };
  const jump = (s) => {
    if (!at || s === at.s) return;
    dir.current = s > at.s ? 1 : -1;
    onAt(at.p, s);
  };

  return (
    <Dialog.Root open={!!at} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {at && p && st && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-[90] bg-navy-deep/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount onKeyDown={(e) => (e.key === "ArrowRight" ? go(1) : e.key === "ArrowLeft" ? go(-1) : null)}>
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[90] mx-auto flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white text-text shadow-[0_40px_100px_-30px_rgb(14_24_48/0.65)] outline-none sm:inset-0 sm:m-auto sm:h-fit sm:w-[calc(100%-2rem)] sm:rounded-xl"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40, transition: { duration: 0.3, ease: EASE } }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                {/* kepala tiket */}
                <div className="relative bg-navy px-6 pb-6 pt-6 text-white sm:px-8">
                  <Dialog.Close
                    aria-label="Tutup"
                    className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                  >
                    <X className="size-4" />
                  </Dialog.Close>
                  <p className="kicker text-[11px] text-gold-soft">Jalur {p.title} · tahap {shown.s + 1} dari {total}</p>
                  <ol className="relative mt-5 flex items-center justify-between" aria-label="Tahapan">
                    <span aria-hidden className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-white/20" />
                    <span
                      aria-hidden
                      className="absolute left-2 top-1/2 h-[2px] -translate-y-1/2 bg-gold transition-[width] duration-700 ease-cinematic"
                      style={{ width: `calc((100% - 1rem) * ${total > 1 ? shown.s / (total - 1) : 0})` }}
                    />
                    {p.stages.map((x, i) => (
                      <li key={x.name} className="relative">
                        <button
                          type="button"
                          onClick={() => jump(i)}
                          aria-label={`Tahap ${i + 1}: ${x.name}`}
                          aria-current={i === shown.s ? "step" : undefined}
                          className={cn(
                            "grid size-4 place-items-center rounded-full border-2 transition-[background-color,border-color,transform] duration-300 hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
                            i <= shown.s ? "border-gold bg-gold" : "border-white/40 bg-navy",
                            i === shown.s && "scale-125"
                          )}
                        />
                      </li>
                    ))}
                  </ol>
                </div>
                {/* garis sobek tiket */}
                <span aria-hidden className="mx-6 block border-t-2 border-dashed border-line sm:mx-8" />

                <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                  <AnimatePresence mode="popLayout" initial={false} custom={dir.current}>
                    <motion.div
                      key={`${p.key}-${shown.s}`}
                      custom={dir.current}
                      variants={{
                        enter: (d) => (reduce ? { opacity: 0 } : { opacity: 0, x: 40 * d }),
                        center: { opacity: 1, x: 0 },
                        exit: (d) => (reduce ? { opacity: 0 } : { opacity: 0, x: -40 * d }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.4, ease: EASE }}
                      className="p-6 sm:p-8"
                    >
                      <div className="flex items-start gap-5">
                        <span className="tabular font-serif text-[3.4rem] leading-none text-gold">{pad(shown.s + 1)}</span>
                        <div className="min-w-0 pt-1">
                          <Dialog.Title className="pr-6 font-serif text-[1.7rem] leading-tight text-navy">{st.name}</Dialog.Title>
                          <Dialog.Description className="mt-1 text-[14px] text-text/55">{st.time}</Dialog.Description>
                        </div>
                      </div>

                      <div className="mt-6 rounded-lg border-l-[3px] border-gold bg-cream/70 px-4 py-3">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-text/45">Selesai bila</p>
                        <p className="mt-1 font-serif text-[1.15rem] italic leading-snug text-maroon">{st.output}</p>
                      </div>

                      <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.14em] text-text/45">Yang perlu disiapkan</p>
                      <ul className="mt-3 divide-y divide-line border-y border-line">
                        {st.needs.map((n, i) => (
                          <li key={n} className="flex gap-3 py-2.5 text-[15px] text-navy animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both" style={{ animationDelay: `${100 + i * 60}ms` }}>
                            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-maroon" />
                            {n}
                          </li>
                        ))}
                      </ul>
                      {p.sample && <PlaceholderTag className="mt-5" />}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-3 sm:px-8">
                  <span className="text-[13px] text-text/50">
                    {shown.s + 1 < total ? <>Berikutnya: <span className="text-navy">{p.stages[shown.s + 1].name}</span></> : "Tahap terakhir"}
                  </span>
                  <div className="flex gap-2">
                    <NavBtn label="Tahap sebelumnya" onClick={() => go(-1)} icon={ChevronLeft} />
                    <NavBtn label="Tahap berikutnya" onClick={() => go(1)} icon={ChevronRight} />
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

export function NavBtn({ label, onClick, icon: Icon, className }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn("grid size-9 place-items-center rounded-md border border-line text-navy transition-[border-color,background-color,color,transform] duration-300 hover:border-maroon hover:bg-maroon hover:text-white active:scale-95", className)}
    >
      <Icon aria-hidden className="size-4" />
    </button>
  );
}
