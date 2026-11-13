"use client";
import { useLayoutEffect as useEffect, useId, useRef, useState } from "react";
import { animate } from "animejs";
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { prefersReducedMotion } from "@/lib/motion";
import { ResponsiveDialog } from "@/components/layanan/responsive-dialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { copyText, useFaq } from "./faq-provider";

const MIN = 12;
const MAX = 400;

/** Mengetik ulang teks huruf demi huruf saat `play` berubah (anime.js). */
function Typed({ text, play }) {
  const [n, setN] = useState(text.length);
  useEffect(() => {
    if (!play || prefersReducedMotion()) {
      setN(text.length);
      return;
    }
    const s = { v: 0 };
    setN(0);
    const a = animate(s, { v: text.length, duration: Math.min(900, text.length * 38), delay: 180, ease: "linear", onUpdate: () => setN(Math.round(s.v)) });
    return () => a.pause();
  }, [text, play]);
  return (
    <span aria-label={text}>
      <span aria-hidden>{text.slice(0, n)}</span>
      <span aria-hidden className={cn("fq-caret", n >= text.length && "opacity-0")} />
    </span>
  );
}

/**
 * Modal "kartu kosong": pengunjung menulis pertanyaan yang belum ada di lemari, memilih laci,
 * dan langsung melihat meja mana yang menjawab (dari papan sambung halaman Kontak). Tidak ada backend:
 * kartu disalin ke papan klip, lalu toast menawarkan lompat ke formulir surat di /kontak.
 * Desktop = modal, ponsel = lembar bawah.
 */
export function AskModal() {
  const { ask, setAsk, drawers, desks } = useFaq();
  const toast = useToast();
  const ids = useId();
  const area = useRef(null);
  const [text, setText] = useState("");
  const [drawer, setDrawer] = useState(drawers[0].key);
  const [error, setError] = useState("");
  const isOpen = Boolean(ask);

  useEffect(() => {
    if (!ask) return;
    setText(ask.q ?? "");
    setDrawer(ask.drawer ?? drawers[0].key);
    setError("");
  }, [ask, drawers]);

  const d = drawers.find((x) => x.key === drawer) ?? drawers[0];
  const desk = desks.find((x) => x.key === d.desk) ?? desks[0];
  const left = MAX - text.length;

  const submit = (e) => {
    e.preventDefault();
    const q = text.trim();
    if (q.length < MIN) {
      setError(`Tulis sedikit lebih lengkap, minimal ${MIN} karakter.`);
      area.current?.focus();
      return;
    }
    const card = [`Kepada ${desk.name},`, "", `Topik: ${d.label}`, `Pertanyaan: ${q}`, "", "Dikirim dari halaman FAQ Sistem Informasi UISI."].join("\n");
    const done = () => {
      setAsk(null);
      toast.success("Kartu pertanyaan disalin", {
        description: `Tempel di surat untuk ${desk.name}.`,
        duration: 7000,
        action: { label: "Buka formulir surat", onClick: () => (location.href = "/kontak#surat") },
      });
    };
    copyText(card).then((ok) => (ok ? done() : toast.error("Kartu tidak bisa disalin", { description: "Pilih teks pertanyaannya lalu salin secara manual." })));
  };

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={(v) => !v && setAsk(null)} className="max-w-[560px] bg-cream" aria-describedby={`${ids}-d`}>
      <form onSubmit={submit} className="p-4 sm:p-6">
        <div className="fq-blank-card">
          <div className="flex items-start justify-between gap-4">
            <span className="fq-callno tabular">FAQ·{d.code}·—</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text/45">Kartu kosong</span>
          </div>
          <DialogTitle className="mt-3 font-serif text-[1.7rem] leading-tight text-navy">
            <Typed text="Tulis pertanyaanmu" play={isOpen} />
          </DialogTitle>
          <DialogDescription id={`${ids}-d`} className="mt-1 text-[14.5px] text-text/60">
            Kami tidak menyimpan isinya. Kartu ini disalin untuk kamu kirim ke meja yang tepat.
          </DialogDescription>

          <label htmlFor={`${ids}-q`} className="sr-only">Pertanyaan</label>
          <textarea
            ref={area}
            id={`${ids}-q`}
            value={text}
            maxLength={MAX}
            rows={4}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError("");
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={`${ids}-e ${ids}-c`}
            placeholder="Misalnya: apakah mahasiswa pindahan bisa mengakui mata kuliah lama?"
            className="fq-lined mt-5 w-full resize-none bg-transparent font-serif text-[17px] leading-[32px] text-navy outline-none placeholder:text-text/35"
          />
          <div className="mt-1 flex items-center justify-between gap-3 text-[12.5px]">
            <span id={`${ids}-e`} role="alert" className="text-maroon">{error}</span>
            <span id={`${ids}-c`} className={cn("tabular", left < 40 ? "text-maroon" : "text-text/45")}>{left} karakter tersisa</span>
          </div>

          <fieldset className="mt-5">
            <legend className="text-[13px] font-semibold text-navy">Masuk laci</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {drawers.map((x) => (
                <label key={x.key} className={cn("fq-chip cursor-pointer", drawer === x.key && "is-on")}>
                  <input type="radio" name={`${ids}-d`} value={x.key} checked={drawer === x.key} onChange={() => setDrawer(x.key)} className="sr-only" />
                  {x.label}
                </label>
              ))}
            </div>
          </fieldset>

          <p key={desk.key} className="mt-5 border-t border-dashed border-navy/20 pt-4 text-[14.5px] text-text/70 animate-in fade-in-0 slide-in-from-bottom-1">
            Dijawab oleh <strong className="font-semibold text-navy">{desk.name}</strong>
            <span className="block text-[13px] text-text/50">{desk.handles}</span>
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-x-6 gap-y-3">
          <button type="button" onClick={() => setAsk(null)} className="text-[15px] font-semibold text-navy">
            <span className="u-gold">Nanti saja</span>
          </button>
          <button
            type="submit"
            className="inline-flex h-12 items-center rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-maroon-deep active:scale-[0.98]"
          >
            Salin kartu
          </button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
