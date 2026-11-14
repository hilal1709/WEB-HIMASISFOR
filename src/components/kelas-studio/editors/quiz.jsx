"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LIMITS, scoreOf } from "@/lib/program-kelas-cms/schema";
import { cn } from "@/lib/utils";
import { Field, MagnetButton, Sheet, Tokens } from "../fields";

const DOT = { maroon: "bg-maroon", gold: "bg-gold", navy: "bg-navy" };

/** Lima magnet kecil: klik magnet ke-n untuk memberi n poin (klik lagi = 0). */
function Pips({ value, onChange, accent, label }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} poin`}
          whileTap={{ scale: 0.7 }}
          onClick={() => onChange(value === n ? 0 : n)}
          className={cn("size-3.5 rounded-full border transition-colors", n <= value ? cn(DOT[accent] ?? "bg-navy", "border-transparent shadow-[inset_-1px_-1px_0_rgb(0_0_0/0.25)]") : "border-navy/20 bg-white hover:border-navy/40")}
        />
      ))}
    </div>
  );
}

/**
 * Editor kuis: tiap pertanyaan berisi opsi dengan poin per kelas (deret magnet 0–5).
 * Panel "coba kuis" di samping menghitung rekomendasi langsung dari jawaban yang dipilih.
 */
export function QuizEditor({ v, set, path, root, ask }) {
  const classes = root.classes.items;
  const qs = v.questions;
  const [answers, setAnswers] = useState({});

  const setScore = (qi, oi, cls, points) => {
    const op = qs[qi].options[oi];
    const scores = op.scores.some((x) => x.cls === cls) ? op.scores.map((x) => (x.cls === cls ? { ...x, points } : x)) : [...op.scores, { cls, points }];
    set(`questions.${qi}.options.${oi}.scores`, scores);
  };
  const totals = classes.map((c) => Object.entries(answers).reduce((n, [qi, oi]) => n + scoreOf(qs[qi]?.options[oi], c.key), 0));
  const max = Math.max(1, ...totals);
  const answered = Object.entries(answers).filter(([qi, oi]) => oi != null && qs[qi]).length;
  const best = answered ? totals.indexOf(Math.max(...totals)) : -1;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="space-y-5">
        {qs.map((q, qi) => (
          <Sheet
            key={qi}
            title={`Pertanyaan ${qi + 1}${qi === 0 ? " · tampil di kartu pembuka" : ""}`}
            aside={
              <MagnetButton
                tone="danger"
                onClick={() =>
                  ask({
                    title: "Hapus pertanyaan ini?",
                    description: qi === 0 ? "Pertanyaan berikutnya akan naik ke kartu pembuka." : "Pertanyaan dan opsinya hilang dari draf.",
                    onConfirm: () => {
                      set("questions", qs.filter((_, j) => j !== qi));
                      setAnswers({});
                    },
                  })
                }
              >
                Hapus
              </MagnetButton>
            }
          >
            <Field path={path(`questions.${qi}.q`)} label="Pertanyaan" value={q.q} onChange={(x) => set(`questions.${qi}.q`, x)} max={120} size="title" />
            <div className="space-y-2.5">
              {q.options.map((o, oi) => (
                <div key={oi} className={cn("rounded-md border bg-white p-3 transition-colors", answers[qi] === oi ? "border-maroon/50" : "border-navy/10")}>
                  <div className="flex flex-wrap items-start gap-3">
                    <span className="mt-6 grid size-7 shrink-0 place-items-center rounded-full border border-navy/20 font-serif text-[13px] text-navy">{String.fromCharCode(65 + oi)}</span>
                    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                      <Field label="Jawaban" value={o.label} onChange={(x) => set(`questions.${qi}.options.${oi}.label`, x)} max={60} />
                      <Field label="Keterangan" value={o.hint} onChange={(x) => set(`questions.${qi}.options.${oi}.hint`, x)} max={60} />
                    </div>
                    <button
                      type="button"
                      aria-label="Hapus opsi"
                      disabled={q.options.length <= 2}
                      onClick={() => set(`questions.${qi}.options`, q.options.filter((_, j) => j !== oi))}
                      className="mt-6 grid size-7 place-items-center rounded text-text/35 hover:bg-maroon/10 hover:text-maroon disabled:opacity-30"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-dashed border-navy/10 pt-2.5 pl-10">
                    {classes.map((c) => (
                      <div key={c.key} className="flex items-center gap-2 text-[12px] text-text/60">
                        <span className="w-20 truncate">{c.short}</span>
                        <Pips label={`Poin ${c.short}`} accent={c.accent} value={scoreOf(o, c.key)} onChange={(p) => setScore(qi, oi, c.key, p)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {q.options.length < LIMITS.options && (
              <MagnetButton
                onClick={() => set(`questions.${qi}.options`, [...q.options, { label: "", hint: "", scores: classes.map((c) => ({ cls: c.key, points: 0 })) }])}
              >
                + Opsi
              </MagnetButton>
            )}
          </Sheet>
        ))}
        {qs.length < LIMITS.questions && (
          <MagnetButton
            tone="maroon"
            onClick={() =>
              set("questions", [
                ...qs,
                { q: "", options: [0, 1].map(() => ({ label: "", hint: "", scores: classes.map((c) => ({ cls: c.key, points: 0 })) })) },
              ])
            }
          >
            + Pertanyaan
          </MagnetButton>
        )}
        {!qs.length && <p className="text-[13px] text-text/50">Tanpa pertanyaan, kartu pembuka dan tombol kuis disembunyikan.</p>}

        <Sheet title="Teks modal kuis">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Penghitung" value={v.counter} onChange={(x) => set("counter", x)} max={40} />
            <Field label="Tombol kembali" value={v.back} onChange={(x) => set("back", x)} max={20} />
            <Field label="Label menghitung" value={v.computingLabel} onChange={(x) => set("computingLabel", x)} max={30} />
            <Field label="Kalimat menghitung" value={v.computing} onChange={(x) => set("computing", x)} max={80} />
            <Field label="Label hasil" value={v.resultLabel} onChange={(x) => set("resultLabel", x)} max={20} />
            <Field label="Kicker hasil" value={v.resultKicker} onChange={(x) => set("resultKicker", x)} max={40} />
            <Field label="Tombol lihat kelas" value={v.goCta} onChange={(x) => set("goCta", x)} max={30} />
            <Field label="Tombol ulangi" value={v.retry} onChange={(x) => set("retry", x)} max={20} />
            <Field label="Judul toast" value={v.toastTitle} onChange={(x) => set("toastTitle", x)} max={60} />
            <Field label="Isi toast" value={v.toastBody} onChange={(x) => set("toastBody", x)} max={120} />
          </div>
          <p className="text-[12px] text-text/45">
            Token: <Tokens list={["n", "total", "kelas"]} />
          </p>
        </Sheet>
      </div>

      {/* simulasi */}
      <aside className="space-y-4 self-start xl:sticky xl:top-24">
        <Sheet title="Coba kuis" hint="Pilih jawaban untuk melihat kelas yang direkomendasikan." tone="navy">
          {qs.map((q, qi) => (
            <div key={qi}>
              <p className="text-[12.5px] text-white/80">{q.q || `Pertanyaan ${qi + 1}`}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {q.options.map((o, oi) => (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: a[qi] === oi ? undefined : oi }))}
                    className={cn("rounded-md border px-2 py-1 text-[11.5px] transition-colors", answers[qi] === oi ? "border-gold bg-gold text-navy" : "border-white/15 text-white/70 hover:border-white/40")}
                  >
                    {String.fromCharCode(65 + oi)} · {o.label || "—"}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="space-y-2 border-t border-white/10 pt-4">
            {classes.map((c, i) => (
              <div key={c.key}>
                <div className="flex justify-between text-[12px] text-white/70">
                  <span>{c.short}</span>
                  <span className="tabular-nums">{totals[i]}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.span className={cn("block h-full rounded-full", i === best ? "bg-gold" : "bg-white/35")} initial={false} animate={{ width: `${(totals[i] / max) * 100}%` }} transition={{ type: "spring", stiffness: 200, damping: 26 }} />
                </div>
              </div>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {best >= 0 && (
              <motion.div key={best} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-md bg-white/[0.06] p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-gold-soft">{v.resultKicker}</p>
                <p className="mt-1 font-serif text-lg text-white">{classes[best].name}</p>
                <p className="mt-1 text-[12px] text-white/60">{classes[best].reason || "Alasan rekomendasi belum diisi di bagian Kelas."}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Sheet>
      </aside>
    </div>
  );
}
