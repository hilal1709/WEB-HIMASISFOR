"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { DOCS_CHECK_KEY } from "@/lib/regulasi-content";
import { useToast } from "@/components/ui/toast";
import { PlaceholderTag } from "@/components/home/shared";
import { NavBtn } from "@/components/jalur/stage-modal";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1];
const pad = (n) => String(n).padStart(2, "0");

/** Template pesan: {nama} {nim} diisi dari input, token lain tampil sebagai isian kosong bergaris emas. */
function Template({ text, values }) {
  return text.split(/(\{\w+\})/g).map((part, i) => {
    const m = part.match(/^\{(\w+)\}$/);
    if (!m) return <Fragment key={i}>{part}</Fragment>;
    const v = values[m[1]]?.trim();
    return v ? (
      <span key={i} className="font-semibold text-navy">{v}</span>
    ) : (
      <span key={i} className="rounded bg-gold/20 px-1 text-[0.92em] text-maroon">{m[1]}</span>
    );
  });
}

const fillText = (text, values) => text.replace(/\{(\w+)\}/g, (all, k) => values[k]?.trim() || `[${k}]`);

/**
 * Modal prosedur — kepala maroon (situasi, tenggat, tujuan), isi: daftar berkas yang bisa dicentang
 * (tersimpan di perangkat), contoh pesan yang terisi saat nama/NIM diketik + tombol salin, rujukan pasal.
 * Isi bergeser searah perpindahan, ‹ › + panah keyboard.
 */
export function ProcedureModal({ scenarios, index, onIndex, onClose, findPasal, onPasal }) {
  const toast = useToast();
  const reduce = useReducedMotion();
  const last = useRef(null);
  const dir = useRef(1);
  if (index != null) last.current = index;
  const shown = index ?? last.current;
  const s = shown != null ? scenarios[shown] : null;
  const total = scenarios.length;
  const [checks, setChecks] = useState({});
  const [who, setWho] = useState({ nama: "", nim: "" });

  useEffect(() => {
    if (!s) return;
    try {
      const raw = JSON.parse(localStorage.getItem(DOCS_CHECK_KEY + s.key) ?? "[]");
      setChecks((c) => ({ ...c, [s.key]: s.files.map((_, i) => !!raw[i]) }));
    } catch {}
  }, [s]);

  const go = (d) => {
    if (index == null) return;
    dir.current = d;
    onIndex((index + d + total) % total);
  };

  const list = s ? checks[s.key] ?? s.files.map(() => false) : [];
  const ready = list.filter(Boolean).length;
  const toggle = (i) => {
    const next = list.map((v, k) => (k === i ? !v : v));
    setChecks((c) => ({ ...c, [s.key]: next }));
    try {
      localStorage.setItem(DOCS_CHECK_KEY + s.key, JSON.stringify(next));
    } catch {}
    if (next.every(Boolean) && !list.every(Boolean)) toast.success("Semua berkas siap", { description: `Serahkan ke ${s.to.toLowerCase()} sebelum tenggat.` });
  };

  const copy = () => {
    const text = fillText(s.message, who);
    const ok = () => toast.success("Contoh pesan disalin", { description: "Lengkapi bagian dalam kurung siku sebelum dikirim." });
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(ok, () => toast.error("Pesan tidak bisa disalin"));
    else toast.error("Pesan tidak bisa disalin");
  };

  const ref = s ? findPasal(s.ref) : null;

  return (
    <Dialog.Root open={index != null} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {index != null && s && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-[90] bg-navy-deep/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              forceMount
              onKeyDown={(e) => {
                if (e.target.tagName === "INPUT") return;
                if (e.key === "ArrowRight") go(1);
                if (e.key === "ArrowLeft") go(-1);
              }}
            >
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[90] mx-auto flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white text-text shadow-[0_40px_100px_-30px_rgb(14_24_48/0.65)] outline-none sm:inset-0 sm:m-auto sm:h-fit sm:w-[calc(100%-2rem)] sm:rounded-xl"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40, transition: { duration: 0.3, ease: EASE } }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                  <AnimatePresence mode="popLayout" initial={false} custom={dir.current}>
                    <motion.div
                      key={s.key}
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
                    >
                      <div className="bg-maroon px-6 pb-6 pt-7 text-white sm:px-8">
                        <p className="kicker text-[11px] text-gold-soft">Prosedur {pad(shown + 1)} dari {pad(total)}</p>
                        <Dialog.Title className="mt-2 pr-8 font-serif text-[1.8rem] leading-tight">{s.title}</Dialog.Title>
                        <Dialog.Description className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[14px] text-white/75">
                          <span>Tenggat: <span className="text-gold-soft">{s.deadline}</span></span>
                          <span>Ke: {s.to}</span>
                        </Dialog.Description>
                      </div>

                      <div className="space-y-8 p-6 sm:p-8">
                        <div>
                          <div className="flex items-baseline justify-between">
                            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-text/45">Berkas yang disiapkan</p>
                            <span className="tabular text-[13px] text-text/55">{ready}/{s.files.length} siap</span>
                          </div>
                          <span aria-hidden className="mt-2 block h-1 overflow-hidden rounded-full bg-cream-2">
                            <span className="block h-full rounded-full bg-gold transition-[width] duration-500 ease-cinematic" style={{ width: `${(ready / s.files.length) * 100}%` }} />
                          </span>
                          <ul className="mt-3 space-y-2">
                            {s.files.map((f, k) => {
                              const on = !!list[k];
                              return (
                                <li key={f}>
                                  <button
                                    type="button"
                                    role="checkbox"
                                    aria-checked={on}
                                    onClick={() => toggle(k)}
                                    className={cn("group flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-[15px] transition-[background-color,border-color] duration-300", on ? "border-navy/20 bg-cream text-text/60" : "border-line bg-white text-navy hover:border-navy/30")}
                                  >
                                    <span className={cn("grid size-6 shrink-0 place-items-center rounded-md border-2 transition-colors duration-300", on ? "border-gold bg-gold" : "border-navy/25")}>
                                      <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
                                        <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="var(--navy)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className={cn("jk-tick", on && "jk-tick-on")} />
                                      </svg>
                                    </span>
                                    <span className={cn("transition-[text-decoration-color] duration-300", on && "line-through decoration-gold/70")}>{f}</span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-text/45">Contoh pesan</p>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <input value={who.nama} onChange={(e) => setWho((w) => ({ ...w, nama: e.target.value }))} placeholder="Nama lengkap" aria-label="Nama untuk contoh pesan" className="h-10 rounded-md border border-line bg-white px-3 text-[14px] text-navy outline-none transition-colors focus:border-navy/40" />
                            <input value={who.nim} onChange={(e) => setWho((w) => ({ ...w, nim: e.target.value }))} placeholder="NIM" inputMode="numeric" aria-label="NIM untuk contoh pesan" className="h-10 rounded-md border border-line bg-white px-3 text-[14px] text-navy outline-none transition-colors focus:border-navy/40" />
                          </div>
                          <blockquote className="mt-3 rounded-lg border-l-[3px] border-gold bg-cream/70 px-4 py-3 text-[15px] leading-relaxed text-text/80">
                            <Template text={s.message} values={who} />
                          </blockquote>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[12.5px] text-text/45">Nama dan NIM tidak dikirim ke mana pun.</span>
                            <button type="button" onClick={copy} className="text-[14px] font-semibold text-maroon">
                              <span className="u-gold">Salin pesan</span>
                            </button>
                          </div>
                        </div>
                        {s.sample && <PlaceholderTag />}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <Dialog.Close aria-label="Tutup" className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60">
                  <X className="size-4" />
                </Dialog.Close>

                <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-3 sm:px-8">
                  {ref ? (
                    <button type="button" onClick={() => onPasal(ref.no)} className="text-[14px] font-semibold text-navy">
                      <span className="u-gold">Baca pasal {ref.no}: {ref.title}</span>
                    </button>
                  ) : (
                    <span />
                  )}
                  <div className="flex shrink-0 gap-2">
                    <NavBtn label="Prosedur sebelumnya" onClick={() => go(-1)} icon={ChevronLeft} />
                    <NavBtn label="Prosedur berikutnya" onClick={() => go(1)} icon={ChevronRight} />
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
