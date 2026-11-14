"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, Reorder, motion } from "motion/react";
import { ACCENTS, CLASS_LOTTIES, LIMITS, slugify } from "@/lib/program-kelas-cms/schema";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { Field, Lines, LottieGrid, MagnetButton, NumberField, Segmented, Sheet, Switch, TitleLines, Tokens } from "../fields";

const ACCENT_BG = { maroon: "bg-maroon", gold: "bg-gold", navy: "bg-navy" };

/** Kelas kosong baru: kunci unik, skor/sel tabel diisi saat kelas lain merujuknya. */
function blank(items) {
  const n = items.length + 1;
  let key = `kelas-${n}`;
  while (items.some((c) => c.key === key)) key += "-b";
  return {
    key,
    name: `Kelas Baru ${n}`,
    short: `Baru ${n}`,
    accent: "navy",
    tagline: "",
    lottie: CLASS_LOTTIES[(n - 1) % CLASS_LOTTIES.length][0],
    schedule: "",
    mode: "",
    duration: 8,
    durationLabel: "semester",
    sks: 144,
    fee: "",
    feeNote: "",
    seats: 30,
    location: "",
    reason: "",
    forWho: [],
    highlights: [],
    requirements: [],
    week: [],
    sample: false,
  };
}

/**
 * Editor kelas: deretan "kartu magnet" (satu per kelas) yang bisa diseret untuk mengurutkan.
 * Kartu terpilih terbuka di bawahnya sebagai lembar isian lengkap.
 */
export function ClassesEditor({ v, set, path, flag, ask, root, replaceRoot }) {
  const items = v.items;
  const [open, setOpen] = useState(0);
  const cur = Math.min(open, items.length - 1);
  const c = items[cur];
  const setItem = (p, val) => set(`items.${cur}.${p}`, val);

  const add = () => {
    if (items.length >= LIMITS.classes) return;
    set("items", [...items, blank(items)]);
    setOpen(items.length);
  };
  const duplicate = () => {
    if (items.length >= LIMITS.classes) return;
    const copy = { ...c, key: `${c.key}-salinan`.slice(0, 40), name: `${c.name} (salinan)`.slice(0, 60), short: c.short };
    // salin juga nilai tabel banding & skor kuis milik kelas asal
    const next = structuredClone(root);
    next.classes.items = [...items, copy];
    next.compare.rows = next.compare.rows.map((r) => {
      const src = r.values.find((x) => x.cls === c.key);
      return src ? { ...r, values: [...r.values, { ...src, cls: copy.key }] } : r;
    });
    next.quiz.questions = next.quiz.questions.map((q) => ({
      ...q,
      options: q.options.map((o) => {
        const src = o.scores.find((x) => x.cls === c.key);
        return src ? { ...o, scores: [...o.scores, { ...src, cls: copy.key }] } : o;
      }),
    }));
    replaceRoot(next);
    setOpen(items.length);
  };
  /** Ganti kunci kelas sekaligus rujukannya di tabel banding & skor kuis. */
  const renameKey = (to) => {
    const from = c.key;
    if (!to || to === from || items.some((k, i) => i !== cur && k.key === to)) return;
    const swap = (x) => (x.cls === from ? { ...x, cls: to } : x);
    const next = structuredClone(root);
    next.classes.items[cur].key = to;
    next.compare.rows = next.compare.rows.map((r) => ({ ...r, values: r.values.map(swap) }));
    next.quiz.questions = next.quiz.questions.map((q) => ({ ...q, options: q.options.map((o) => ({ ...o, scores: o.scores.map(swap) })) }));
    replaceRoot(next);
  };
  const remove = () =>
    ask({
      title: `Hapus ${c.name}?`,
      description: "Kelas, jadwalnya, sel tabel banding, dan skor kuisnya ikut hilang dari draf.",
      onConfirm: () => {
        set("items", items.filter((_, i) => i !== cur));
        setOpen(Math.max(0, cur - 1));
      },
    });

  return (
    <div className="space-y-6">
      <Sheet title="Teks bagian kelas">
        <TitleLines path={path("title")} value={v.title} onChange={(x) => set("title", x)} tokens={["jumlah"]} hint="Jumlah kelas dalam kata" />
        <Field path={path("body")} label="Pengantar" value={v.body} onChange={(x) => set("body", x)} max={240} multiline rows={2} flag={flag("body")} />
      </Sheet>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] text-text/55">Seret kartu untuk mengubah urutan tab · {items.length}/{LIMITS.classes} kelas</p>
          <MagnetButton tone="maroon" onClick={add} disabled={items.length >= LIMITS.classes}>
            + Kelas baru
          </MagnetButton>
        </div>
        <Reorder.Group axis="x" values={items} onReorder={(next) => set("items", next)} className="flex gap-3 overflow-x-auto pb-3 pt-2">
          {items.map((k, i) => (
            <Reorder.Item
              key={k.key}
              value={k}
              whileDrag={{ scale: 1.04, rotate: 2, zIndex: 10 }}
              onClick={() => setOpen(i)}
              className={cn(
                "relative w-48 shrink-0 cursor-grab select-none rounded-[8px] border bg-white p-3 pt-5 text-left shadow-[0_10px_18px_-14px_rgb(20_33_61/0.6)] transition-[border-color,transform] active:cursor-grabbing",
                i === cur ? "-translate-y-1 border-maroon" : "border-navy/10 hover:-translate-y-0.5"
              )}
            >
              <span aria-hidden className={cn("absolute left-1/2 top-0 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[inset_-2px_-2px_0_rgb(0_0_0/0.2),0_2px_4px_rgb(0_0_0/0.25)]", ACCENT_BG[k.accent] ?? "bg-navy")} />
              <div className="flex items-center gap-2">
                <span className="w-10 shrink-0 rounded bg-cream p-1">
                  <LottieIllustration src={k.lottie} className="w-full" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10.5px] tabular-nums text-text/40">{String(i + 1).padStart(2, "0")}</p>
                  <p className="truncate font-serif text-[1.05rem] leading-tight text-navy">{k.short || k.name}</p>
                </div>
              </div>
              <p className="mt-2 truncate text-[11.5px] text-text/55">{k.fee || "—"} · {k.week.length} blok</p>
              {k.sample && <span className="mt-1 inline-block rounded bg-cream-2 px-1.5 text-[10px] text-text/55">contoh</span>}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      <AnimatePresence mode="wait">
        {c && (
          <motion.div key={c.key} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-6">
            <Sheet
              title={c.name || "Tanpa nama"}
              hint="Identitas kelas"
              aside={
                <div className="flex gap-1.5">
                  <MagnetButton onClick={duplicate} disabled={items.length >= LIMITS.classes}>
                    Gandakan
                  </MagnetButton>
                  <MagnetButton tone="danger" onClick={remove} disabled={items.length <= 1} title={items.length <= 1 ? "Minimal satu kelas" : undefined}>
                    Hapus
                  </MagnetButton>
                </div>
              }
            >
              <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr_1fr]">
                <Field path={path(`items.${cur}.name`)} label="Nama lengkap" value={c.name} onChange={(x) => setItem("name", x)} max={60} size="title" />
                <Field label="Nama tab" value={c.short} onChange={(x) => setItem("short", x)} max={24} />
                <KeyField value={c.key} onCommit={renameKey} />
              </div>
              <Field path={path(`items.${cur}.tagline`)} label="Tagline" value={c.tagline} onChange={(x) => setItem("tagline", x)} max={160} flag={flag(`items.${cur}.tagline`)} />
              <div className="flex flex-wrap items-end gap-6">
                <Segmented label="Warna penanda" value={c.accent} onChange={(x) => setItem("accent", x)} options={ACCENTS} />
                <Switch label="Tandai sebagai contoh" hint="Memunculkan label contoh di halaman" checked={c.sample} onChange={(x) => setItem("sample", x)} />
              </div>
              <LottieGrid label="Ilustrasi" value={c.lottie} options={CLASS_LOTTIES} onChange={(x) => setItem("lottie", x)} />
            </Sheet>

            <Sheet title="Fakta kelas" hint="Angka berhitung naik di kartu publik.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Jadwal ringkas" value={c.schedule} onChange={(x) => setItem("schedule", x)} max={60} />
                <Field label="Mode belajar" value={c.mode} onChange={(x) => setItem("mode", x)} max={60} />
                <Field label="Lokasi" value={c.location} onChange={(x) => setItem("location", x)} max={80} />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Biaya" value={c.fee} onChange={(x) => setItem("fee", x)} max={30} />
                  <Field label="Keterangan biaya" value={c.feeNote} onChange={(x) => setItem("feeNote", x)} max={30} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <NumberField label="Durasi" value={c.duration} min={1} max={14} onChange={(x) => setItem("duration", x)} />
                <Field label="Satuan durasi" value={c.durationLabel} onChange={(x) => setItem("durationLabel", x)} max={20} />
                <NumberField label="SKS" value={c.sks} min={0} max={300} onChange={(x) => setItem("sks", x)} />
                <NumberField label="Kuota kursi" value={c.seats} min={0} max={2000} step={5} onChange={(x) => setItem("seats", x)} />
              </div>
            </Sheet>

            <Sheet title="Isi kartu & detail">
              <div className="grid gap-5 lg:grid-cols-3">
                <Lines path={path(`items.${cur}.forWho`)} label="Cocok untuk" items={c.forWho} onChange={(x) => setItem("forWho", x)} />
                <Lines path={path(`items.${cur}.highlights`)} label="Keunggulan" items={c.highlights} onChange={(x) => setItem("highlights", x)} flagged={(j) => flag(`items.${cur}.highlights.${j}`)} />
                <Lines path={path(`items.${cur}.requirements`)} label="Persyaratan" items={c.requirements} onChange={(x) => setItem("requirements", x)} />
              </div>
              <Field
                path={path(`items.${cur}.reason`)}
                label="Alasan rekomendasi kuis"
                value={c.reason}
                onChange={(x) => setItem("reason", x)}
                max={240}
                multiline
                rows={2}
                flag={flag(`items.${cur}.reason`)}
                hint="Tampil saat kuis merekomendasikan kelas ini."
              />
            </Sheet>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet title="Label kartu & modal" hint="Dipakai bersama oleh semua kelas.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Label biaya" value={v.feeLabel} onChange={(x) => set("feeLabel", x)} max={30} />
          <Field label="Label SKS" value={v.sksLabel} onChange={(x) => set("sksLabel", x)} max={20} />
          <Field label="Label kuota" value={v.seatsLabel} onChange={(x) => set("seatsLabel", x)} max={30} />
          <Field label="Judul cocok untuk" value={v.forWhoLabel} onChange={(x) => set("forWhoLabel", x)} max={30} />
          <Field label="Judul keunggulan" value={v.highlightsLabel} onChange={(x) => set("highlightsLabel", x)} max={30} />
          <Field label="Judul persyaratan" value={v.requirementsLabel} onChange={(x) => set("requirementsLabel", x)} max={30} />
          <Field label="Tombol detail" value={v.detailCta} onChange={(x) => set("detailCta", x)} max={40} />
          <Field label="Tombol daftar" value={v.registerCta} onChange={(x) => set("registerCta", x)} max={40} />
          <Field label="Kicker modal" value={v.modalKicker} onChange={(x) => set("modalKicker", x)} max={60} />
          <Field label="Label kuota (modal)" value={v.modalSeatsLabel} onChange={(x) => set("modalSeatsLabel", x)} max={20} />
          <Field label="Isi kuota (modal)" value={v.modalSeats} onChange={(x) => set("modalSeats", x)} max={30} />
          <Field label="Label lokasi (modal)" value={v.modalLocationLabel} onChange={(x) => set("modalLocationLabel", x)} max={20} />
        </div>
        <p className="text-[12px] text-text/45">
          Token: <Tokens list={["kelas", "mode", "kursi"]} />
        </p>
      </Sheet>
    </div>
  );
}

/** Kunci tautan: diketik bebas, baru diterapkan saat fokus lepas (agar kartu tidak dipasang ulang tiap huruf). */
function KeyField({ value, onCommit }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    const k = slugify(draft);
    setDraft(k);
    if (k !== value) onCommit(k);
  };
  return (
    <div className="group">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text/50">Kunci tautan</p>
      <input
        value={draft}
        maxLength={40}
        aria-label="Kunci tautan"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="block w-full rounded-md border border-navy/10 bg-white px-3 py-2 font-mono text-[13px] text-navy focus:border-maroon/40 focus:outline-none"
      />
      <p className="mt-1 text-[12px] text-text/45">#kelas-{draft}</p>
    </div>
  );
}
