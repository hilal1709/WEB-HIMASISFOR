"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { DotsLoader } from "@/components/ui/loader";
import { useToast } from "@/components/ui/toast";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useKelas } from "./kelas-provider";

/**
 * Kuis "Bantu aku memilih": tiga pertanyaan kartu besar (auto-lanjut setelah dipilih),
 * bar progres emas, jeda "mencocokkan" dengan loader titik, lalu rekomendasi kelas.
 * "Lihat kelas ini" memilih tab kelas tsb, menggulir ke switcher, dan memunculkan toast.
 */
export function QuizModal({ open, onOpenChange }) {
  const { quiz, classes, reasons, setActive } = useKelas();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [computing, setComputing] = useState(false);
  const [dir, setDir] = useState(1);
  const timer = useRef();
  const jump = useRef(false);

  const done = answers.length === quiz.length && !computing;
  const progress = computing || done ? 1 : step / quiz.length;

  useEffect(() => () => clearTimeout(timer.current), []);

  const reset = () => {
    clearTimeout(timer.current);
    setStep(0);
    setAnswers([]);
    setComputing(false);
    setDir(1);
  };

  const pick = (oi) => {
    const next = [...answers.slice(0, step), oi];
    setAnswers(next);
    setDir(1);
    clearTimeout(timer.current);
    timer.current = setTimeout(
      () => {
        if (step < quiz.length - 1) setStep(step + 1);
        else {
          setComputing(true);
          timer.current = setTimeout(() => setComputing(false), prefersReducedMotion() ? 200 : 1100);
        }
      },
      prefersReducedMotion() ? 0 : 260
    );
  };

  const back = () => {
    setDir(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  // skor → indeks kelas terbaik
  const best = (() => {
    const totals = classes.map(() => 0);
    answers.forEach((oi, qi) => quiz[qi].options[oi].score.forEach((v, ci) => (totals[ci] += v)));
    return totals.indexOf(Math.max(...totals));
  })();
  const rec = classes[best];

  const go = () => {
    setActive(best);
    onOpenChange(false);
    jump.current = true;
    toast.success(`Rekomendasi: ${rec.name}`, { description: "Kelasnya sudah kami pilihkan di bawah." });
    setTimeout(reset, 400);
  };

  const q = quiz[step];

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setTimeout(reset, 300);
      }}
    >
      <ModalContent
        className="max-w-xl p-0"
        onCloseAutoFocus={(e) => {
          if (!jump.current) return;
          // jangan kembalikan fokus ke tombol hero (itu menggulir balik ke atas)
          e.preventDefault();
          jump.current = false;
          const target = document.getElementById("kelas");
          target?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
          target?.querySelector('[role="tab"][aria-selected="true"]')?.focus({ preventScroll: true });
        }}
      >
        {/* progres emas */}
        <div className="px-6 pt-8 sm:px-8">
          <div className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.14em] text-text/45">
            <span>{done ? "Hasil" : computing ? "Mencocokkan" : `Pertanyaan ${step + 1} / ${quiz.length}`}</span>
            {!done && !computing && step > 0 && (
              <button type="button" onClick={back} className="inline-flex items-center gap-1 normal-case tracking-normal text-navy/70 transition-colors hover:text-maroon">
                <ChevronLeft aria-hidden className="size-3.5" /> Kembali
              </button>
            )}
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-cream-2">
            <span className="block h-full origin-left rounded-full bg-gold transition-transform duration-700 ease-cinematic" style={{ transform: `scaleX(${Math.max(progress, 0.04)})` }} />
          </div>
        </div>

        <div className="min-h-[300px] px-6 pb-7 pt-6 sm:px-8">
          {!done && !computing && (
            <div key={step} className={cn("animate-in fade-in-0 duration-300", dir > 0 ? "slide-in-from-right-4" : "slide-in-from-left-4")}>
              <ModalTitle className="text-[1.5rem] leading-snug">{q.q}</ModalTitle>
              <ModalDescription className="sr-only">Pilih satu jawaban</ModalDescription>
              <ul className="mt-5 grid gap-2.5">
                {q.options.map((o, oi) => {
                  const chosen = answers[step] === oi;
                  return (
                    <li key={o.label}>
                      <button
                        type="button"
                        onClick={() => pick(oi)}
                        aria-pressed={chosen}
                        className={cn(
                          "group flex w-full items-center gap-4 rounded-lg border bg-white px-4 py-3.5 text-left transition-[border-color,background-color,transform,box-shadow] duration-300 ease-cinematic hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-[0_14px_30px_-22px_rgb(20_33_61/0.6)] active:translate-y-0",
                          chosen ? "border-maroon bg-cream" : "border-line"
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "grid size-8 shrink-0 place-items-center rounded-full border font-serif text-[15px] transition-colors duration-300",
                            chosen ? "border-maroon bg-maroon text-white" : "border-navy/20 text-navy group-hover:border-maroon group-hover:text-maroon"
                          )}
                        >
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-semibold text-navy">{o.label}</span>
                          <span className="block text-[13px] text-text/55">{o.hint}</span>
                        </span>
                        <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0 text-maroon opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                          <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {computing && (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-5 text-center animate-in fade-in-0">
              <ModalTitle className="sr-only">Mencocokkan jawaban</ModalTitle>
              <ModalDescription className="sr-only">Sedang menghitung rekomendasi kelas</ModalDescription>
              <DotsLoader />
              <p className="font-serif text-[1.25rem] text-navy">Mencocokkan jadwal & tujuanmu…</p>
            </div>
          )}

          {done && rec && (
            <div className="grid items-center gap-6 animate-in fade-in-0 zoom-in-95 duration-500 sm:grid-cols-[150px_1fr]">
              <div className="mx-auto w-32 rounded-lg bg-cream p-3 sm:w-full">
                <LottieIllustration src={rec.lottie} label={`Ilustrasi ${rec.name}`} />
              </div>
              <div>
                <p className="kicker text-maroon">Paling cocok untukmu</p>
                <ModalTitle className="mt-2 text-[1.75rem] leading-tight">{rec.name}</ModalTitle>
                <ModalDescription className="mt-2 text-[15px] leading-relaxed">{reasons[rec.key]}</ModalDescription>
                <p className="mt-3 text-[13.5px] text-text/55">{rec.schedule}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button variant="maroon" size="lg" onClick={go}>
                    Lihat kelas ini
                  </Button>
                  <Button variant="outline-navy" size="lg" onClick={reset}>
                    Ulangi
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
