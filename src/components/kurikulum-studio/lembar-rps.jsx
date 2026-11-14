"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { ConfirmModal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { getIn } from "./use-kartografer";
import { Field, Lines, NumberField, Repeater, Segmented, Toggle } from "./fields";
import { BlankBlueprintIllustration } from "./illustrations";

const STEPS = [
  ["identitas", "Identitas"],
  ["capaian", "Capaian"],
  ["kajian", "Kajian & pustaka"],
  ["minggu", "16 minggu"],
  ["nilai", "Penilaian"],
  ["bok", "Body of Knowledge"],
];
const FILLS = ["var(--navy)", "var(--maroon)", "var(--gold)", "var(--navy-deep)", "var(--maroon-deep)", "var(--gold-soft)"];
const emptyWeek = () => ({ judul: "", materi: "", metode: "", subcpmk: "", penilaian: "" });

/* ───────────── 16 minggu: pita film ───────────── */

function FilmStrip({ weeks, onChange }) {
  const [pick, setPick] = useState(0);
  const [drag, setDrag] = useState(null);
  const panel = useRef(null);
  const w = weeks[pick];
  useEffect(() => {
    if (!panel.current || prefersReducedMotion()) return;
    const t = gsap.fromTo(panel.current, { y: 10, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.4, ease: "expo.out" });
    return () => t.kill();
  }, [pick]);
  const set = (patch) => onChange(weeks.map((x, i) => (i === pick ? { ...x, ...patch } : x)));
  const swap = (a, b) => {
    const out = [...weeks];
    const [it] = out.splice(a, 1);
    out.splice(b, 0, it);
    onChange(out);
    setPick(b);
  };
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12.5px] text-text/60">Seret bingkai untuk menukar urutan minggu. Bingkai emas = ujian.</p>
        {weeks.length < 16 && (
          <button type="button" onClick={() => onChange([...weeks, ...Array.from({ length: 16 - weeks.length }, emptyWeek)])} className="shrink-0 rounded-md border border-navy/15 px-2.5 py-1 text-[12px] font-semibold text-navy hover:border-maroon hover:text-maroon">
            Lengkapi jadi 16
          </button>
        )}
      </div>
      <ol className="kf-film mt-3 flex gap-1.5 overflow-x-auto rounded-xl bg-navy-deep p-2.5" style={{ scrollbarWidth: "thin" }} aria-label="Pita 16 minggu">
        {weeks.map((m, i) => {
          const exam = m.ujian || /^ujian$/i.test(m.penilaian ?? "");
          return (
            <li
              key={i}
              draggable
              onDragStart={() => setDrag(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => drag != null && drag !== i && swap(drag, i)}
              onDragEnd={() => setDrag(null)}
            >
              <button
                type="button"
                onClick={() => setPick(i)}
                aria-pressed={pick === i}
                aria-label={`Minggu ${i + 1}${m.judul ? `: ${m.judul}` : ""}`}
                className={cn(
                  "relative flex h-[74px] w-[84px] flex-col justify-between rounded-md border px-2 py-1.5 text-left transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5",
                  exam ? "border-gold bg-gold/20" : "border-white/10 bg-white/[0.06]",
                  pick === i && "border-gold bg-white text-navy",
                  drag === i && "opacity-40"
                )}
              >
                <span className={cn("font-mono text-[10px] tabular-nums", pick === i ? "text-maroon" : "text-gold")}>M{String(i + 1).padStart(2, "0")}</span>
                <span className={cn("line-clamp-2 text-[10.5px] leading-tight", pick === i ? "text-navy" : m.judul ? "text-white/85" : "text-white/30")}>{m.judul || "kosong"}</span>
                {m.bobot ? <span className="absolute right-1.5 top-1 text-[9.5px] tabular-nums text-white/50">{m.bobot}%</span> : null}
              </button>
            </li>
          );
        })}
        {weeks.length < 16 && (
          <li>
            <button type="button" onClick={() => (onChange([...weeks, emptyWeek()]), setPick(weeks.length))} className="grid h-[74px] w-[60px] place-items-center rounded-md border border-dashed border-white/25 text-xl text-white/50 hover:border-gold hover:text-gold" aria-label="Tambah minggu">
              +
            </button>
          </li>
        )}
      </ol>
      {w ? (
        <div ref={panel} className="mt-4 grid gap-4 rounded-xl border border-navy/10 bg-white/80 p-4 sm:grid-cols-2">
          <div className="flex items-center justify-between sm:col-span-2">
            <p className="font-serif text-lg text-navy">Minggu {pick + 1}</p>
            <div className="flex items-center gap-3">
              <Toggle label="Ujian" checked={Boolean(w.ujian)} onChange={(v) => set({ ujian: v })} />
              <button type="button" onClick={() => (onChange(weeks.filter((_, i) => i !== pick)), setPick(Math.max(0, pick - 1)))} className="rounded px-2 py-1 text-[12px] text-maroon hover:bg-maroon/10">
                Hapus minggu
              </button>
            </div>
          </div>
          <Field label="Judul / topik" value={w.judul} onChange={(v) => set({ judul: v })} max={160} className="sm:col-span-2" />
          <Field label="Materi" value={w.materi} onChange={(v) => set({ materi: v })} multiline rows={2} max={800} className="sm:col-span-2" />
          <Field label="Metode" value={w.metode} onChange={(v) => set({ metode: v })} max={300} />
          <Field label="Sub-CPMK" value={w.subcpmk} onChange={(v) => set({ subcpmk: v })} max={120} />
          <Field label="Penilaian" value={w.penilaian} onChange={(v) => set({ penilaian: v })} max={300} />
          <NumberField label="Bobot" suffix="%" value={w.bobot} onChange={(v) => set({ bobot: v })} />
        </div>
      ) : (
        <p className="mt-4 text-[13px] text-text/55">Belum ada minggu. Tambahkan bingkai pertama.</p>
      )}
    </div>
  );
}

/* ───────────── Penilaian: bar bertumpuk yang bisa diseret ───────────── */

function GradingBar({ items, onChange }) {
  const bar = useRef(null);
  const total = items.reduce((t, p) => t + (Number(p.bobot) || 0), 0);
  const startDrag = (k) => (e) => {
    e.preventDefault();
    const rect = bar.current.getBoundingClientRect();
    const before = items.slice(0, k).reduce((t, p) => t + (Number(p.bobot) || 0), 0);
    const pair = (Number(items[k].bobot) || 0) + (Number(items[k + 1].bobot) || 0);
    const scale = Math.max(total, 100);
    const onMove = (ev) => {
      const x = (ev.clientX ?? ev.touches?.[0]?.clientX) - rect.left;
      const at = Math.round((x / rect.width) * scale) - before;
      const a = Math.max(0, Math.min(pair, Math.round(at / 5) * 5));
      onChange(items.map((p, i) => (i === k ? { ...p, bobot: a } : i === k + 1 ? { ...p, bobot: pair - a } : p)));
    };
    const up = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", up);
  };
  const keyNudge = (k) => (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const d = e.key === "ArrowRight" ? 5 : -5;
    const a = Number(items[k].bobot) || 0;
    const b = Number(items[k + 1].bobot) || 0;
    if (a + d < 0 || b - d < 0) return;
    onChange(items.map((p, i) => (i === k ? { ...p, bobot: a + d } : i === k + 1 ? { ...p, bobot: b - d } : p)));
  };
  const scale = Math.max(total, 100);
  return (
    <div>
      <div ref={bar} className="relative flex h-9 overflow-hidden rounded-lg bg-cream-2 select-none">
        {items.map((p, i) => (
          <div key={i} className="relative h-full transition-[width] duration-150" style={{ width: `${((Number(p.bobot) || 0) / scale) * 100}%`, background: FILLS[i % FILLS.length] }}>
            <span className={cn("absolute inset-0 grid place-items-center truncate px-1 text-[11px] font-semibold", i % 3 === 2 ? "text-navy" : "text-white")}>{(Number(p.bobot) || 0) >= 8 ? `${p.label || "?"} ${p.bobot}%` : ""}</span>
            {i < items.length - 1 && (
              <span
                role="slider"
                tabIndex={0}
                aria-label={`Batas ${p.label || `komponen ${i + 1}`} dan ${items[i + 1].label || `komponen ${i + 2}`}`}
                aria-valuenow={Number(p.bobot) || 0}
                onPointerDown={startDrag(i)}
                onKeyDown={keyNudge(i)}
                className="absolute -right-1.5 top-0 z-10 h-full w-3 cursor-ew-resize outline-none after:absolute after:inset-y-1.5 after:left-1/2 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-white after:shadow focus-visible:after:bg-gold"
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[12.5px]">
        <span className={cn("font-semibold tabular-nums", total === 100 ? "text-success" : "text-maroon")}>Total {total}%{total !== 100 && " — seharusnya 100%"}</span>
        {total !== 100 && total > 0 && (
          <button
            type="button"
            onClick={() => {
              let acc = 0;
              const next = items.map((p, i) => {
                const v = i === items.length - 1 ? 100 - acc : Math.round(((Number(p.bobot) || 0) / total) * 100);
                acc += v;
                return { ...p, bobot: v };
              });
              onChange(next);
            }}
            className="rounded-md border border-navy/15 px-2.5 py-1 font-semibold text-navy hover:border-maroon hover:text-maroon"
          >
            Seimbangkan ke 100
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────────── Miniatur dokumen RPS (langsung) ───────────── */

function Miniature({ course, header, step, rumpun }) {
  const ref = useRef(null);
  const r = course.rps ?? {};
  useEffect(() => {
    const el = ref.current?.querySelector(`[data-mini="${step}"]`);
    if (!el) return;
    ref.current.scrollTo({ top: el.offsetTop - 12, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [step]);
  const sec = (k) => cn("rounded-md p-2 transition-[box-shadow,opacity] duration-500", step === k ? "opacity-100 shadow-[0_0_0_2px_var(--gold)]" : "opacity-50");
  const TH = "border border-navy/20 bg-cream-2 px-1.5 py-1 text-left font-semibold text-navy";
  const TD = "border border-navy/20 px-1.5 py-1 align-top";
  return (
    <div ref={ref} className="h-full overflow-y-auto rounded-lg bg-white p-4 text-[10.5px] leading-snug text-text/85 shadow-[0_30px_60px_-40px_rgb(20_33_61/0.6)]" style={{ scrollbarWidth: "thin" }}>
      <div className="space-y-3">
        <div data-mini="identitas" className={sec("identitas")}>
          <div className="border border-navy/20 p-2 text-center text-[9.5px] font-bold uppercase leading-tight text-navy">
            {header.map((h, i) => <p key={i}>{h}</p>)}
          </div>
          <table className="mt-1.5 w-full border-collapse">
            <tbody>
              {[
                ["Mata kuliah", course.nama],
                ["Kode", course.kode],
                ["SKS", course.sks],
                ["Rumpun", rumpun?.name],
                ["Koordinator", r.koordinator],
                ["Pengampu", r.dosen],
                ["Prasyarat", r.prasyarat],
                ["Disusun", r.tanggal],
              ].map(([k, v]) => (
                <tr key={k}>
                  <th className={cn(TH, "w-[34%]")}>{k}</th>
                  <td className={TD}>{v || <span className="text-text/30">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {r.deskripsi && <p className="mt-1.5 text-justify">{r.deskripsi}</p>}
        </div>
        <div data-mini="capaian" className={sec("capaian")}>
          {[["CPL", r.cpl], ["CPMK", r.cpmk], ["Sub-CPMK", r.subcpmk]].map(([t, l]) => (
            <div key={t} className="mb-1.5">
              <p className="font-semibold text-navy">{t}</p>
              {(l ?? []).length ? (
                <ul className="mt-0.5 space-y-0.5">
                  {l.map((x, i) => (
                    <li key={i}>
                      <span className="font-semibold text-navy">{x.kode}</span> {x.teks} {x.bobot != null && <span className="text-text/50">({x.bobot}%)</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-text/30">—</p>
              )}
            </div>
          ))}
        </div>
        <div data-mini="kajian" className={sec("kajian")}>
          <p className="font-semibold text-navy">Bahan kajian</p>
          <ol className="list-decimal pl-4">{(r.bahanKajian ?? []).map((x, i) => <li key={i}>{x}</li>)}</ol>
          <p className="mt-1 font-semibold text-navy">Pustaka</p>
          <ol className="list-decimal pl-4">{[...(r.pustaka?.utama ?? []), ...(r.pustaka?.pendukung ?? [])].map((x, i) => <li key={i}>{x}</li>)}</ol>
        </div>
        <div data-mini="minggu" className={sec("minggu")}>
          <table className="w-full border-collapse">
            <tbody>
              {(r.minggu ?? []).map((m, i) => (
                <tr key={i} className={m.ujian ? "bg-gold/15" : undefined}>
                  <td className={cn(TD, "w-6 text-center font-semibold tabular-nums text-navy")}>{i + 1}</td>
                  <td className={TD}>{m.judul || <span className="text-text/30">—</span>}</td>
                  <td className={cn(TD, "w-8 text-center tabular-nums")}>{m.bobot ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div data-mini="nilai" className={sec("nilai")}>
          <div className="flex h-2.5 overflow-hidden rounded-full">
            {(r.penilaian ?? []).map((p, i) => <span key={i} style={{ width: `${p.bobot || 0}%`, background: FILLS[i % FILLS.length] }} />)}
          </div>
          <ul className="mt-1">
            {(r.penilaian ?? []).map((p, i) => (
              <li key={i} className="flex justify-between">
                <span>{p.label}</span>
                <span className="tabular-nums">{p.bobot}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div data-mini="bok" className={sec("bok")}>
          <p className="font-semibold text-navy">Body of Knowledge</p>
          <p>{(course.bok ?? []).join(", ") || "—"}</p>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Lembar ───────────── */

/**
 * Lembar RPS: panel penuh untuk satu mata kuliah. Kiri = langkah isian (Identitas → … → BoK),
 * kanan = miniatur dokumen RPS yang langsung berubah dan menyorot langkah aktif.
 * `path` = lokasi mata kuliah di dokumen (mis. "semester.list.2.courses.3").
 */
export function LembarRps({ path, value, update, onClose, onMove, onDelete, containers, rumpun, rumpunByKey, blocks, notify, onOpenPicker }) {
  const course = path ? getIn(value, path) : null;
  const [step, setStep] = useState("identitas");
  const [unlock, setUnlock] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const last = useRef(course);
  if (course) last.current = course;
  const c = course ?? last.current;

  useEffect(() => {
    if (path) {
      setStep("identitas");
      setUnlock(false);
    }
  }, [path]);

  const containerOf = useMemo(() => (path ? path.split(".").slice(0, -1).join(".") : null), [path]);
  if (!c) return null;
  const r = c.rps ?? {};
  const set = (k, v) => update(`${path}.${k}`, v);
  const setR = (k, v) => update(`${path}.rps`, { ...(getIn(value, `${path}.rps`) ?? {}), [k]: v });

  const uploadPdf = async (file) => {
    if (!file) return;
    if (!/\.pdf$/i.test(file.name)) return notify("Pilih berkas PDF", { tone: "warn" });
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "rps");
      const j = await fetch("/api/upload", { method: "POST", body: fd }).then((x) => x.json());
      if (!j.success) throw new Error(j.error);
      setR("pdf", j.url);
      notify("PDF RPS terunggah", { detail: file.name });
    } catch (e) {
      notify("Unggah gagal", { tone: "error", detail: e.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Sheet open={Boolean(path)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" onOpenAutoFocus={(e) => e.preventDefault()} className="kartografer w-[min(100vw,1180px)] border-l-0 bg-paper p-0 sm:max-w-none">
        <div className="relative border-b border-navy/10 bg-white/70 px-5 pb-4 pt-5 pr-16 sm:px-7">
          <div aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: c.slot ? "var(--cream-2)" : rumpunByKey[c.rumpun]?.css }} />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-maroon">{c.slot ? "Slot pilihan" : "Lembar RPS"}</p>
          <SheetTitle className="sr-only">{c.nama || "Mata kuliah"}</SheetTitle>
          <input value={c.nama ?? ""} onChange={(e) => set("nama", e.target.value)} aria-label="Nama mata kuliah" className="mt-1 w-full bg-transparent font-serif text-[clamp(1.4rem,2.6vw,2rem)] leading-tight text-navy outline-none placeholder:text-text/30" placeholder="Nama mata kuliah" />
          <SheetDescription className="sr-only">Ubah identitas dan RPS mata kuliah</SheetDescription>
          <div className="mt-3 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">
            {!c.slot && <Field label="Kode" value={c.kode} onChange={(v) => set("kode", v)} max={30} mono />}
            <NumberField label="SKS" value={c.sks} onChange={(v) => set("sks", v)} max={24} />
            {!c.slot && containerOf?.startsWith("pilihan") && <NumberField label="Ditawarkan smt" value={c.smt} onChange={(v) => set("smt", v)} min={1} max={14} />}
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/55">Pindah ke</span>
              <select
                value={containerOf ?? ""}
                onChange={(e) => onMove(path, e.target.value)}
                className="mt-1.5 block w-full rounded-t-md border-b border-navy/20 bg-white/70 px-2.5 py-2.5 text-[14px] text-navy outline-none"
              >
                {containers.filter((x) => !c.slot || x.allowSlot).map((x) => (
                  <option key={x.path} value={x.path}>{x.title}</option>
                ))}
              </select>
            </label>
          </div>
          {!c.slot && (
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <Segmented label="Rumpun" options={rumpun.map((x) => [x.key, x.short || x.name, x.css])} value={c.rumpun} onChange={(v) => set("rumpun", v)} />
              <div className="min-w-[14rem] flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/55">Tautan RPS</p>
                <div className="mt-1.5 flex items-center gap-2 rounded-md border border-navy/12 bg-white/80 px-2.5 py-1.5 font-mono text-[12.5px] text-navy">
                  <span className="text-text/40">#rps-</span>
                  <input value={c.slug ?? ""} readOnly={!unlock} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} className={cn("min-w-0 flex-1 bg-transparent outline-none", !unlock && "text-navy/60")} aria-label="Slug tautan RPS" />
                  <button type="button" onClick={() => setUnlock((u) => !u)} className="rounded px-1.5 py-0.5 font-sans text-[11.5px] font-semibold text-maroon hover:bg-maroon/10">
                    {unlock ? "Kunci" : "Buka kunci"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {unlock && <p className="mt-2 text-[12px] text-maroon">Mengubah tautan memutus link #rps- dari halaman Konversi SKS, Bidang Keahlian, dan Magang yang menunjuk mata kuliah ini.</p>}
        </div>

        {c.slot ? (
          <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
            <BlankBlueprintIllustration className="h-32 w-44" />
            <p className="mt-4 max-w-sm text-[14px] text-text/60">Slot pilihan tidak punya RPS sendiri. Mahasiswa mengisinya dari mata kuliah di bidang pilihan.</p>
            <button type="button" onClick={() => setConfirm(true)} className="mt-6 text-[13px] font-semibold text-maroon">
              Hapus slot
            </button>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 lg:grid-cols-[13rem_minmax(0,1fr)_minmax(0,22rem)]">
            <nav aria-label="Langkah RPS" className="flex gap-1 overflow-x-auto border-b border-navy/10 p-3 lg:flex-col lg:border-b-0 lg:border-r">
              {STEPS.map(([k, l], i) => (
                <button key={k} type="button" onClick={() => setStep(k)} aria-current={step === k ? "step" : undefined} className={cn("relative flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13.5px] transition-colors", step === k ? "text-white" : "text-navy/70 hover:bg-white/80")}>
                  {step === k && <motion.span layoutId="lembar-step" transition={{ type: "spring", stiffness: 420, damping: 36 }} className="absolute inset-0 rounded-lg bg-navy" />}
                  <span className={cn("relative font-mono text-[11px] tabular-nums", step === k ? "text-gold" : "text-text/40")}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="relative">{l}</span>
                </button>
              ))}
              <button type="button" onClick={() => setConfirm(true)} className="mt-auto hidden rounded-lg px-3 py-2 text-left text-[12.5px] font-semibold text-maroon hover:bg-maroon/10 lg:block">
                Hapus mata kuliah
              </button>
            </nav>

            <div className="min-h-0 overflow-y-auto p-5 sm:p-7">
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.25 }} className="space-y-5">
                  {step === "identitas" && (
                    <>
                      <Field label="Deskripsi singkat" value={r.deskripsi} onChange={(v) => setR("deskripsi", v)} multiline rows={6} max={4000} />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Dosen koordinator" value={r.koordinator} onChange={(v) => setR("koordinator", v)} max={160} />
                        <Field label="Dosen pengampu" value={r.dosen} onChange={(v) => setR("dosen", v)} max={300} />
                        <Field label="Tanggal penyusunan" value={r.tanggal} onChange={(v) => setR("tanggal", v)} max={60} placeholder="10 Oktober 2026" />
                        <Field label="MK prasyarat" value={r.prasyarat} onChange={(v) => setR("prasyarat", v)} max={200} placeholder="–" />
                      </div>
                      <div className="rounded-xl border border-dashed border-navy/20 bg-white/60 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/55">Dokumen PDF resmi</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <input value={r.pdf ?? ""} onChange={(e) => setR("pdf", e.target.value)} placeholder="/rps/kode-nama.pdf" className="min-w-0 flex-1 rounded-md border border-navy/12 bg-white px-3 py-2 font-mono text-[12.5px] text-navy outline-none focus:border-maroon" />
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-navy px-3 py-2 text-[12.5px] font-semibold text-white hover:bg-navy-deep">
                            {uploading && <Spinner className="size-3.5" />}
                            Unggah PDF
                            <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => uploadPdf(e.target.files?.[0])} />
                          </label>
                          {r.pdf && (
                            <a href={r.pdf} target="_blank" rel="noreferrer" className="rounded-md px-2 py-2 text-[12.5px] font-semibold text-maroon hover:underline">
                              Buka
                            </a>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  {step === "capaian" && (
                    <>
                      <Repeater label="CPL" items={r.cpl} onChange={(v) => setR("cpl", v)} make={() => ({ kode: "", teks: "" })} itemLabel={(x, i) => x.kode || `CPL ${i + 1}`} addLabel="Tambah CPL" render={(x, s) => <CodedRow x={x} s={s} />} />
                      <Repeater label="CPMK" items={r.cpmk} onChange={(v) => setR("cpmk", v)} make={() => ({ kode: "", teks: "" })} itemLabel={(x, i) => x.kode || `CPMK ${i + 1}`} addLabel="Tambah CPMK" render={(x, s) => <CodedRow x={x} s={s} weight />} />
                      <Repeater label="Sub-CPMK" items={r.subcpmk} onChange={(v) => setR("subcpmk", v)} make={() => ({ kode: "", teks: "" })} itemLabel={(x, i) => x.kode || `Sub-CPMK ${i + 1}`} addLabel="Tambah Sub-CPMK" max={30} render={(x, s) => <CodedRow x={x} s={s} />} />
                    </>
                  )}
                  {step === "kajian" && (
                    <>
                      <Lines label="Bahan kajian" items={r.bahanKajian} onChange={(v) => setR("bahanKajian", v)} multiline addLabel="Tambah bahan kajian" max={30} />
                      <Lines label="Pustaka utama" items={r.pustaka?.utama} onChange={(v) => setR("pustaka", { utama: v, pendukung: r.pustaka?.pendukung ?? [] })} multiline addLabel="Tambah pustaka utama" />
                      <Lines label="Pustaka pendukung" items={r.pustaka?.pendukung} onChange={(v) => setR("pustaka", { utama: r.pustaka?.utama ?? [], pendukung: v })} multiline addLabel="Tambah pustaka pendukung" />
                    </>
                  )}
                  {step === "minggu" && <FilmStrip weeks={r.minggu ?? []} onChange={(v) => setR("minggu", v)} />}
                  {step === "nilai" && (
                    <>
                      {(r.penilaian ?? []).length > 1 && <GradingBar items={r.penilaian} onChange={(v) => setR("penilaian", v)} />}
                      <Repeater
                        label="Komponen penilaian"
                        items={r.penilaian}
                        onChange={(v) => setR("penilaian", v)}
                        make={() => ({ label: "", rencana: "", bobot: 0, cpmk: "" })}
                        itemLabel={(x, i) => x.label || `Komponen ${i + 1}`}
                        addLabel="Tambah komponen"
                        max={12}
                        render={(x, s) => (
                          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
                            <Field label="Komponen" value={x.label} onChange={(v) => s({ label: v })} max={80} />
                            <NumberField label="Bobot" suffix="%" value={x.bobot} onChange={(v) => s({ bobot: v ?? 0 })} />
                            <Field label="Rencana" value={x.rencana} onChange={(v) => s({ rencana: v })} max={300} />
                            <Field label="CPMK" value={x.cpmk} onChange={(v) => s({ cpmk: v })} max={120} />
                          </div>
                        )}
                      />
                    </>
                  )}
                  {step === "bok" && (
                    <div>
                      <p className="text-[13px] text-text/60">Pilih blok Body of Knowledge yang dibangun mata kuliah ini.</p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {blocks.map((b) => {
                          const on = (c.bok ?? []).includes(b.key);
                          return (
                            <li key={b.key}>
                              <button type="button" aria-pressed={on} onClick={() => set("bok", on ? c.bok.filter((k) => k !== b.key) : [...(c.bok ?? []), b.key])} className={cn("rounded-full border px-3.5 py-1.5 text-[13px] transition-[background-color,border-color,color,transform] duration-200 active:scale-95", on ? "border-maroon bg-maroon text-white" : "border-navy/15 bg-white text-navy/75 hover:border-navy/40")}>
                                {b.name}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              {!c.rps && step === "identitas" && (
                <div className="mt-6 flex items-center gap-4 rounded-xl bg-cream-2/70 p-4">
                  <BlankBlueprintIllustration className="h-16 w-24 shrink-0" />
                  <p className="text-[13px] text-text/60">RPS masih kosong. Isian pertama langsung membuat draf RPS; di halaman publik mata kuliah ini tertulis “RPS menyusul” sampai ada isinya.</p>
                </div>
              )}
              <button type="button" onClick={() => setConfirm(true)} className="mt-8 text-[13px] font-semibold text-maroon lg:hidden">
                Hapus mata kuliah
              </button>
            </div>

            <aside className="hidden min-h-0 border-l border-navy/10 bg-cream-2/60 p-4 lg:block">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/55">Miniatur dokumen</p>
              <div className="h-[calc(100%-1.5rem)]">
                <Miniature course={c} header={value.rps?.header ?? []} step={step} rumpun={rumpunByKey[c.rumpun]} />
              </div>
            </aside>
          </div>
        )}

        <ConfirmModal
          open={confirm}
          onOpenChange={setConfirm}
          title={`Hapus ${c.nama || "mata kuliah ini"}?`}
          description={c.slot ? "Slot ini hilang dari semester. Bisa dibatalkan dengan Urungkan." : `RPS-nya ikut terhapus dari draf, dan tautan #rps-${c.slug} di Konversi SKS, Bidang Keahlian, atau Magang tidak lagi membuka laci. Bisa dibatalkan dengan Urungkan sebelum terbit.`}
          confirmLabel="Hapus"
          destructive
          onConfirm={() => {
            setConfirm(false);
            onDelete(path);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

function CodedRow({ x, s, weight }) {
  return (
    <div className={cn("grid gap-3", weight ? "sm:grid-cols-[9rem_minmax(0,1fr)_6rem]" : "sm:grid-cols-[9rem_minmax(0,1fr)]")}>
      <Field label="Kode" value={x.kode} onChange={(v) => s({ kode: v })} max={40} mono />
      <Field label="Rumusan" value={x.teks} onChange={(v) => s({ teks: v })} multiline rows={2} max={800} />
      {weight && <NumberField label="Bobot" suffix="%" value={x.bobot} onChange={(v) => s({ bobot: v })} />}
    </div>
  );
}

