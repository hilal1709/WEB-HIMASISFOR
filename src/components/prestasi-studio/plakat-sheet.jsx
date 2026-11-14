"use client";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { LEVEL_KEYS } from "@/lib/prestasi-cms/schema";
import { initials, normalizeLevel, parseYears, shortName } from "@/lib/prestasi-content";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { TiltCard } from "@/components/aceternity/tilt-card";
import { cn } from "@/lib/utils";
import { Choice, PickerCtx } from "./fields";

const BLANK = { achieverName: "", title: "", description: "", category: "mahasiswa", tingkatan: "nasional", tahun: String(new Date().getFullYear()), image: "" };

/**
 * Laci plakat: sunting satu prestasi (atau buat baru) di lembar samping. Di atas, plakat
 * kuningan miring-ikut-kursor (TiltCard aceternity) memperlihatkan hasilnya saat diketik.
 * Simpan = langsung tayang di /achievement & beranda.
 */
export function PlakatSheet({ open, record, labels, onOpenChange, onSave, onDelete }) {
  const { open: pick } = useContext(PickerCtx);
  const [f, setF] = useState(BLANK);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const isNew = !record?.id;

  useEffect(() => {
    if (!open) return;
    setTouched(false);
    setSaving(false);
    setF(record?.id ? { ...BLANK, ...record, description: record.description ?? "", image: record.image ?? "", tingkatan: normalizeLevel(record.tingkatan) } : { ...BLANK, ...(record ?? {}) });
  }, [open, record]);

  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const errors = {
    achieverName: !f.achieverName.trim() && "Nama peraih wajib diisi",
    title: !f.title.trim() && "Judul prestasi wajib diisi",
    tahun: !/(19|20)\d{2}/.test(f.tahun) && "Tulis minimal satu tahun, mis. 2024",
  };
  const invalid = Object.values(errors).some(Boolean);
  const y = parseYears(f.tahun, labels.now);
  const img = f.image && /^\/(?!\/)/.test(f.image) ? f.image : null;

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (invalid) return;
    setSaving(true);
    try {
      await onSave({ ...f, achieverName: f.achieverName.trim(), title: f.title.trim(), tahun: f.tahun.trim() });
    } finally {
      setSaving(false);
    }
  };

  const Err = ({ k }) => (touched && errors[k] ? <p className="mt-1 text-[12px] text-[#e9a0ab] animate-in fade-in-0">{errors[k]}</p> : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="kurator w-full overflow-y-auto border-l border-[var(--k-line-2)] bg-[var(--k-panel)] p-0 text-[var(--k-ink)] sm:max-w-[520px]">
        <form onSubmit={submit} className="flex min-h-full flex-col">
          <div className="kurator-grid px-6 pb-6 pt-7">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[var(--k-gold)]">{isNew ? "Plakat baru" : `Plakat №${record.id}`}</p>
            <SheetTitle className="mt-1 font-serif text-[1.6rem] font-normal leading-tight text-[var(--k-ink)]">{isNew ? "Pasang prestasi" : "Sunting prestasi"}</SheetTitle>
            <SheetDescription className="mt-1 text-[13px] text-[var(--k-mute)]">Tersimpan langsung tayang, tanpa menunggu terbit.</SheetDescription>

            {/* plakat pratinjau */}
            <TiltCard max={7} className="mt-6 border-[var(--k-gold)]/35 bg-[linear-gradient(145deg,#2a2416,#16130b_60%,#1f1a0f)] p-0 shadow-[0_30px_60px_-30px_black]">
              <div className="flex gap-4 p-5">
                <span className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-[var(--k-gold)]/30 bg-black/40">
                  {img ? <Image src={img} alt="" fill sizes="80px" className="object-cover object-top" /> : <span className="grid size-full place-items-center font-serif text-2xl text-[var(--k-gold)]/80">{initials(f.achieverName) || "?"}</span>}
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--k-gold)]">
                    {labels.levels[f.tingkatan]} · {y.label || "—"}
                  </p>
                  <p className="mt-1.5 line-clamp-3 font-serif text-[1.1rem] leading-snug text-[#f3e7c4]">{f.title || "Judul prestasi"}</p>
                  <p className="mt-1 truncate text-[12.5px] text-[#f3e7c4]/60">
                    {shortName(f.achieverName) || "Nama peraih"} · {labels.categories[f.category]}
                  </p>
                </div>
              </div>
              <span aria-hidden className="block h-1 bg-[linear-gradient(90deg,transparent,var(--k-gold),transparent)] opacity-60" />
            </TiltCard>
          </div>

          <div className="flex-1 space-y-5 border-t border-[var(--k-line)] px-6 py-6">
            <div>
              <Label htmlFor="pk-name">Nama peraih</Label>
              <input id="pk-name" className="k-field" value={f.achieverName} onChange={(e) => set("achieverName")(e.target.value)} maxLength={200} placeholder="Nama lengkap beserta gelar" aria-invalid={touched && !!errors.achieverName} />
              <Err k="achieverName" />
            </div>
            <div>
              <Label htmlFor="pk-title">Judul prestasi</Label>
              <textarea id="pk-title" rows={2} className="k-field resize-y" value={f.title} onChange={(e) => set("title")(e.target.value)} maxLength={300} placeholder="Juara 1 Kompetisi …" aria-invalid={touched && !!errors.title} />
              <Err k="title" />
            </div>
            <div>
              <Label htmlFor="pk-desc" hint="opsional">Keterangan</Label>
              <textarea id="pk-desc" rows={3} className="k-field resize-y" value={f.description} onChange={(e) => set("description")(e.target.value)} maxLength={1000} placeholder="Penyelenggara, lokasi, atau tim" />
            </div>
            <Choice label="Tingkat" value={f.tingkatan} options={LEVEL_KEYS.map((k) => [k, labels.levels[k]])} onChange={set("tingkatan")} />
            <Choice label="Kategori" value={f.category} options={[["mahasiswa", labels.categories.mahasiswa], ["dosen", labels.categories.dosen]]} onChange={set("category")} />
            <div>
              <Label htmlFor="pk-year" hint="2024 · 2015, 2018 · 2017 - Sekarang">Tahun</Label>
              <input id="pk-year" className="k-field font-mono" value={f.tahun} onChange={(e) => set("tahun")(e.target.value)} maxLength={60} aria-invalid={touched && !!errors.tahun} />
              <Err k="tahun" />
            </div>
            <div>
              <Label hint="dipakai juga untuk prestasi lain orang yang sama">Foto</Label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => pick({ path: "plakat.image", kind: "image", current: f.image, onPick: (u) => set("image")(u ?? "") })}
                  className="h-10 rounded-[10px] border border-[var(--k-line-2)] px-4 text-[13px] font-medium text-[var(--k-ink)] transition-colors hover:border-[var(--k-gold)] hover:text-[var(--k-gold)]"
                >
                  {f.image ? "Ganti foto" : "Pilih / unggah foto"}
                </button>
                {f.image && (
                  <button type="button" onClick={() => set("image")("")} className="text-[12.5px] text-[var(--k-mute)] hover:text-[#e9a0ab]">
                    Lepas foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 flex items-center gap-2 border-t border-[var(--k-line)] bg-[var(--k-panel)]/95 px-6 py-4 backdrop-blur">
            {!isNew && (
              <button type="button" onClick={() => onDelete(record)} className="h-10 rounded-[10px] px-3 text-[13px] font-medium text-[#e9a0ab] transition-colors hover:bg-[var(--k-maroon)] hover:text-white">
                Hapus
              </button>
            )}
            <button type="button" onClick={() => onOpenChange(false)} className="ml-auto h-10 rounded-[10px] px-4 text-[13px] text-[var(--k-mute)] hover:text-[var(--k-ink)]">
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className={cn("inline-flex h-10 items-center gap-2 rounded-[10px] bg-[var(--k-gold)] px-5 text-[13.5px] font-semibold text-[var(--k-gold-ink)] transition hover:brightness-110 active:scale-[0.97] disabled:opacity-60")}
            >
              {saving && <span className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />}
              {isNew ? "Pasang plakat" : "Simpan"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Label({ htmlFor, hint, children }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--k-mute)]">
        {children}
      </label>
      {hint && <span className="text-[11px] text-[var(--k-faint)]">{hint}</span>}
    </div>
  );
}
