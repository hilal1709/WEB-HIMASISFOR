"use client";
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BUSES, BANNER_VARIANTS, DIM_MAX, DIM_MIN, MASCOT_POSES, SCALE } from "@/lib/bidang-cms/schema";
import { cn } from "@/lib/utils";
import { Chips, Field, Group, LinkPair, Lines, Segmented, Select, Toggle } from "./controls";

const POSE = { wave: "Melambai", "thumbs-up": "Jempol", confident: "Yakin", proud: "Bangga", think: "Berpikir", laugh: "Tertawa", run: "Berlari" };
const VARIANT = { brand: "Maroon", info: "Netral", success: "Hijau", warning: "Emas" };

/**
 * Master bus: teks & pengaturan tingkat halaman, satu tab per bagian publik.
 * `update(path, v)` mengubah satu field; `onDims(next, map)` mengganti dimensi sekaligus profil semua bidang.
 */
export function MasterBus({ value: v, update, onDims, flagged = new Set(), tab, onTab }) {
  const F = (path, label, props = {}) => <Field path={path} label={label} value={get(v, path)} onChange={(x) => update(path, x)} flag={flagged.has(path)} {...props} />;
  return (
    <Tabs value={tab} onValueChange={onTab} className="flex min-h-0 flex-1 flex-col">
      <TabsList className="k-scroll flex w-full justify-start gap-1 overflow-x-auto rounded-xl border border-[var(--k-line)] bg-black/30 p-1 text-[var(--k-mute)]">
        {BUSES.map((b) => (
          <TabsTrigger key={b.key} value={b.key} title={b.hint} className="h-8 shrink-0 rounded-lg px-3 text-[12.5px] data-[state=active]:text-[#1a1406]">
            {tab === b.key && <motion.span layoutId="bus-tab" className="absolute inset-0 -z-10 rounded-lg bg-[var(--k-gold)]" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
            {b.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="k-scroll mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pb-28 pr-1">
        <TabsContent value="hero" className="space-y-4">
          <Group title="Breadcrumb" hint="Item terakhir = halaman ini (tanpa tautan).">
            {(v.hero.breadcrumb ?? []).map((c, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1"><LinkPair path={`hero.breadcrumb.${i}`} label={`Langkah ${i + 1}`} value={c} onChange={(x) => update(`hero.breadcrumb.${i}`, x)} /></div>
                <button type="button" aria-label="Hapus langkah" onClick={() => update("hero.breadcrumb", v.hero.breadcrumb.filter((_, j) => j !== i))} className="mb-1 h-9 rounded-md px-2 text-[var(--k-faint)] hover:text-[var(--k-led-bad)]">×</button>
              </div>
            ))}
            {v.hero.breadcrumb.length < 5 && <AddRow onClick={() => update("hero.breadcrumb", [...v.hero.breadcrumb, { label: "", href: "" }])}>Tambah langkah</AddRow>}
          </Group>
          <Group title="Sampul">
            {F("hero.kicker", "Kicker", { max: 80, hint: "{n} = jumlah bidang yang tampil." })}
            {F("hero.intro", "Intro", { max: 400, multiline: true, rows: 4, serif: true })}
            <div className="grid gap-3 sm:grid-cols-2">
              {F("hero.primaryLabel", "Tombol utama (ke penakar)", { max: 40 })}
              {F("hero.secondaryLabel", "Tombol kedua (ke mosaik)", { max: 40 })}
            </div>
            {F("hero.toolsLabel", "Label alat saat baris disorot", { max: 40 })}
          </Group>
          <Group title="Maskot Elvo">
            <Toggle checked={v.hero.mascot.show} onChange={(x) => update("hero.mascot.show", x)} label="Tampilkan maskot" />
            <Select path="hero.mascot.pose" label="Pose" value={v.hero.mascot.pose} options={MASCOT_POSES.map((p) => [p, POSE[p]])} onChange={(x) => update("hero.mascot.pose", x)} />
            {F("hero.mascot.say", "Ucapan", { max: 120 })}
          </Group>
        </TabsContent>

        <TabsContent value="mosaic" className="space-y-4">
          <Group title="Mosaik bidang" hint="Ukuran tile tiap bidang diatur di channel (B/L/K).">
            <Lines path="mosaic.title" label="Judul" count={3} value={v.mosaic.title} onChange={(x) => update("mosaic.title", x)} />
            {F("mosaic.body", "Paragraf", { max: 300, multiline: true })}
            {F("mosaic.openLabel", "Ajakan di tile", { max: 40 })}
          </Group>
        </TabsContent>

        <TabsContent value="dimensions" className="space-y-4">
          <Group title={`Dimensi minat (${v.dimensions.length})`} hint={`Sumbu radar & fader channel. ${DIM_MIN}–${DIM_MAX} dimensi; nilai awal = posisi slider pengunjung.`}>
            {v.dimensions.map((d, i) => (
              <div key={d.key} className="rounded-xl border border-[var(--k-line)] bg-black/20 p-3">
                <div className="mb-2 flex items-center gap-2 font-mono text-[10.5px] text-[var(--k-faint)]">
                  <span>SUMBU {i + 1}</span>
                  <button type="button" disabled={i === 0} onClick={() => onDims(swap(v.dimensions, i, i - 1), (p) => swap(p, i, i - 1))} className="ml-auto px-1 hover:text-[var(--k-gold)] disabled:opacity-30" aria-label="Naikkan">↑</button>
                  <button type="button" disabled={i === v.dimensions.length - 1} onClick={() => onDims(swap(v.dimensions, i, i + 1), (p) => swap(p, i, i + 1))} className="px-1 hover:text-[var(--k-gold)] disabled:opacity-30" aria-label="Turunkan">↓</button>
                  <button type="button" disabled={v.dimensions.length <= DIM_MIN} onClick={() => onDims(v.dimensions.filter((_, j) => j !== i), (p) => p.filter((_, j) => j !== i))} className="px-1 hover:text-[var(--k-led-bad)] disabled:opacity-30" aria-label="Hapus dimensi">×</button>
                </div>
                <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
                  {F(`dimensions.${i}.label`, "Label slider", { max: 60 })}
                  {F(`dimensions.${i}.short`, "Label radar", { max: 16 })}
                </div>
                <label className="mt-2 flex items-center gap-3 text-[12.5px] text-[var(--k-mute)]">
                  Nilai awal
                  <input type="range" min={0} max={SCALE} value={d.default ?? 5} onChange={(e) => update(`dimensions.${i}.default`, Number(e.target.value))} className="k-range flex-1" />
                  <span className="w-6 font-mono tabular-nums text-[var(--k-ink)]">{d.default ?? 5}</span>
                </label>
              </div>
            ))}
            {v.dimensions.length < DIM_MAX && (
              <AddRow onClick={() => onDims([...v.dimensions, { key: uniqueKey(v.dimensions), label: "Dimensi baru", short: "Baru", default: 5 }], (p) => [...p, 5])}>Tambah dimensi</AddRow>
            )}
          </Group>
        </TabsContent>

        <TabsContent value="radar" className="space-y-4">
          <Group title="Penakar minat">
            <Toggle checked={v.radar.show} onChange={(x) => update("radar.show", x)} label="Tampilkan bagian penakar" hint="Mati → tombol utama sampul ikut disembunyikan." />
            <Lines path="radar.title" label="Judul" count={3} value={v.radar.title} onChange={(x) => update("radar.title", x)} />
            {F("radar.body", "Paragraf", { max: 300, multiline: true })}
            <div className="grid gap-3 sm:grid-cols-2">
              {F("radar.lowLabel", "Ujung rendah", { max: 20 })}
              {F("radar.highLabel", "Ujung tinggi", { max: 20 })}
              {F("radar.resetLabel", "Tombol reset", { max: 40 })}
              {F("radar.topLabel", "Label bidang teratas", { max: 40 })}
              {F("radar.saveLabel", "Tombol simpan", { max: 40 })}
              {F("radar.savedLabel", "Sudah tersimpan", { max: 40 })}
            </div>
            <Toggle checked={v.radar.sampleTag} onChange={(x) => update("radar.sampleTag", x)} label="Tanda “contoh konten”" hint="Matikan setelah profil tiap bidang divalidasi prodi." />
          </Group>
        </TabsContent>

        <TabsContent value="caseStudy" className="space-y-4">
          <Group title="Studi kasus" hint="Peran, langkah, dan keluaran tiap bidang diisi di inspector channel.">
            <Toggle checked={v.caseStudy.show} onChange={(x) => update("caseStudy.show", x)} label="Tampilkan studi kasus" />
            <Lines path="caseStudy.title" label="Judul" count={3} value={v.caseStudy.title} onChange={(x) => update("caseStudy.title", x)} />
            {F("caseStudy.kicker", "Kicker", { max: 40 })}
            {F("caseStudy.headline", "Masalah", { max: 160, serif: true })}
            {F("caseStudy.body", "Konteks", { max: 400, multiline: true })}
            <div className="grid gap-3 sm:grid-cols-2">
              {F("caseStudy.nowLabel", "Label “sedang dibahas”", { max: 40 })}
              {F("caseStudy.stepLabel", "Label langkah", { max: 30 })}
              {F("caseStudy.outputLabel", "Label keluaran", { max: 30 })}
              {F("caseStudy.linkLabel", "Tautan ke bidang", { max: 40 })}
            </div>
            {F("caseStudy.dragHint", "Petunjuk geser", { max: 80 })}
            <Toggle checked={v.caseStudy.sampleTag} onChange={(x) => update("caseStudy.sampleTag", x)} label="Tanda “contoh konten”" />
          </Group>
        </TabsContent>

        <TabsContent value="modal" className="space-y-4">
          <Group title="Label rangkuman bidang">
            <div className="grid gap-3 sm:grid-cols-2">
              {[["kicker", "Kicker (diikuti nomor)"], ["learnLabel", "Yang dipelajari"], ["toolsLabel", "Alat"], ["coursesLabel", "Mata kuliah"], ["careersLabel", "Prospek karier"], ["peopleLabel", "Dosen"], ["markLabel", "Tombol tandai"], ["markedLabel", "Sudah ditandai"]].map(([k, l]) => (
                <div key={k}>{F(`modal.${k}`, l, { max: 40 })}</div>
              ))}
            </div>
          </Group>
        </TabsContent>

        <TabsContent value="shortlist" className="space-y-4">
          <Group title="Rak pilihan" hint="Token: {title} {short} = bidang pertama di rak, {n} = jumlah tersimpan.">
            <Lines path="shortlist.title" label="Judul" count={2} value={v.shortlist.title} onChange={(x) => update("shortlist.title", x)} />
            {F("shortlist.emptyText", "Saat kosong", { max: 240, multiline: true, rows: 2 })}
            {F("shortlist.oneText", "Satu bidang", { max: 240, multiline: true, rows: 2 })}
            {F("shortlist.manyText", "Banyak bidang", { max: 240, multiline: true, rows: 2 })}
            <LinkPair path="shortlist.pmb" label="Tombol PMB" value={v.shortlist.pmb} onChange={(x) => update("shortlist.pmb", x)} />
            <div className="grid gap-3 sm:grid-cols-2">
              {F("shortlist.backLabel", "Kembali ke mosaik", { max: 40 })}
              {F("shortlist.removeLabel", "Label lepas (aksesibilitas)", { max: 60 })}
            </div>
          </Group>
          <Group title="Banner di rak">
            <Toggle checked={v.shortlist.banner.show} onChange={(x) => update("shortlist.banner.show", x)} label="Tampilkan banner" />
            <Segmented label="Gaya" value={v.shortlist.banner.variant} layoutId="bn-var" options={BANNER_VARIANTS.map((k) => [k, VARIANT[k]])} onChange={(x) => update("shortlist.banner.variant", x)} />
            {F("shortlist.banner.title", "Judul", { max: 120 })}
            {F("shortlist.banner.body", "Isi", { max: 260, multiline: true })}
            <LinkPair path="shortlist.banner" label="Tombol" value={{ label: v.shortlist.banner.linkLabel, href: v.shortlist.banner.href }} onChange={(x) => (update("shortlist.banner.linkLabel", x.label), update("shortlist.banner.href", x.href))} />
          </Group>
          <Group title="Tautan lanjutan" hint="{lulusan} = profil lulusan bidang pertama di rak. Judul kosong-rak dipakai bila judul memakai {title}/{short}.">
            {v.shortlist.next.map((l, i) => (
              <div key={i} className="rounded-xl border border-[var(--k-line)] bg-black/20 p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  {F(`shortlist.next.${i}.kicker`, "Kicker", { max: 30 })}
                  {F(`shortlist.next.${i}.href`, "Tautan", { max: 200, mono: true })}
                  {F(`shortlist.next.${i}.title`, "Judul", { max: 80 })}
                  {F(`shortlist.next.${i}.titleEmpty`, "Judul saat rak kosong", { max: 80 })}
                </div>
                <button type="button" onClick={() => update("shortlist.next", v.shortlist.next.filter((_, j) => j !== i))} className="mt-2 text-[12px] text-[var(--k-faint)] hover:text-[var(--k-led-bad)]">Hapus tautan</button>
              </div>
            ))}
            {v.shortlist.next.length < 4 && <AddRow onClick={() => update("shortlist.next", [...v.shortlist.next, { kicker: "", title: "", titleEmpty: "", href: "" }])}>Tambah tautan</AddRow>}
          </Group>
        </TabsContent>

        <TabsContent value="toasts" className="space-y-4">
          <Group title="Notifikasi pengunjung" hint="{title} = nama bidang, {score} = persen kecocokan.">
            {F("toasts.added", "Saat ditandai", { max: 80 })}
            {F("toasts.addedDesc", "Keterangan ditandai", { max: 140 })}
            {F("toasts.removed", "Saat dilepas", { max: 80 })}
            {F("toasts.already", "Sudah ada di rak", { max: 80 })}
            {F("toasts.alreadyDesc", "Keterangan sudah ada", { max: 140 })}
            {F("toasts.undo", "Tombol urungkan", { max: 20 })}
          </Group>
        </TabsContent>

        <TabsContent value="curtain" className="space-y-4">
          <Group title="Tirai pembuka">
            <Toggle checked={v.curtain.enabled} onChange={(x) => update("curtain.enabled", x)} label="Tampilkan tirai sekali per sesi" />
            <div className="grid gap-3 sm:grid-cols-2">
              {F("curtain.title", "Judul", { max: 40 })}
              {F("curtain.accent", "Aksen", { max: 40 })}
            </div>
            {F("curtain.label", "Label pemuat (aksesibilitas)", { max: 60 })}
          </Group>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Group title="Mesin pencari">
            {F("seo.title", "Judul halaman", { max: 90 })}
            {F("seo.description", "Deskripsi meta", { max: 220, multiline: true })}
          </Group>
        </TabsContent>
      </div>
    </Tabs>
  );
}

const get = (obj, p) => p.split(".").reduce((o, k) => o?.[k], obj);
const swap = (arr, i, j) => {
  const out = [...arr];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
};
const uniqueKey = (dims) => {
  let n = dims.length + 1;
  while (dims.some((d) => d.key === `dimensi-${n}`)) n++;
  return `dimensi-${n}`;
};

function AddRow({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className={cn("w-full rounded-lg border border-dashed border-[var(--k-line-2)] py-2 text-[12.5px] font-semibold text-[var(--k-mute)] transition-colors hover:border-[var(--k-gold)] hover:text-[var(--k-gold)]")}>
      + {children}
    </button>
  );
}

export { Chips };
