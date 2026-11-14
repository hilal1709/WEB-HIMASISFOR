"use client";

import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Chips, Field, Group, MediaField, Select, Toggle } from "./controls";

const p = (index, key) => `fields.${index}.${key}`;

export function ChannelInspector({ open, onOpenChange, field, index, dims, refs, update, onDelete }) {
  const [courseQuery, setCourseQuery] = useState("");
  const courses = refs?.courses ?? [];
  const filteredCourses = useMemo(
    () => courses.filter((c) => String(c.nama).toLowerCase().includes(courseQuery.toLowerCase())).slice(0, 40),
    [courses, courseQuery]
  );
  if (!field) return null;
  const set = (key, value) => update(p(index, key), value);
  const setNested = (key, value) => update(p(index, key), value);
  const toggleCourse = (name) => set("courses", field.courses?.includes(name) ? field.courses.filter((x) => x !== name) : [...(field.courses ?? []), name]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="konsol w-[min(100vw,560px)] overflow-y-auto border-[var(--k-line)] bg-[#0b1222] p-0 text-[var(--k-ink)]">
        <div className="border-b border-[var(--k-line)] px-6 pb-5 pt-8 pr-16">
          <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--k-gold)]">CHANNEL {String(index + 1).padStart(2, "0")}</p>
          <SheetTitle className="mt-1 font-serif text-3xl font-normal">{field.title || "Bidang baru"}</SheetTitle>
          <SheetDescription>Atur isi, relasi akademik, profil media, dan studi kasus bidang ini.</SheetDescription>
        </div>
        <div className="space-y-4 p-4 pb-10 sm:p-6">
          <Group title="Identitas">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field path={p(index, "title")} label="Nama bidang" value={field.title} max={80} serif onChange={(v) => set("title", v)} />
              <Field path={p(index, "short")} label="Nama pendek" value={field.short} max={30} onChange={(v) => set("short", v)} />
            </div>
            <Field path={p(index, "slug")} label="Slug" value={field.slug} max={40} mono hint="Gunakan huruf kecil, angka, dan tanda hubung." onChange={(v) => set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
            <Toggle checked={field.visible !== false} onChange={(v) => set("visible", v)} label="Tampilkan channel di halaman publik" />
            <Field path={p(index, "teaser")} label="Ringkasan kartu beranda" value={field.teaser} max={260} multiline rows={3} onChange={(v) => set("teaser", v)} />
            <Field path={p(index, "question")} label="Pertanyaan bidang" value={field.question} max={160} serif onChange={(v) => set("question", v)} />
            <Field path={p(index, "summary")} label="Ringkasan modal" value={field.summary} max={500} multiline rows={5} onChange={(v) => set("summary", v)} />
          </Group>

          <Group title="Yang dipelajari">
            <Chips path={p(index, "learn")} label="Poin pembelajaran" items={field.learn} max={8} onChange={(v) => set("learn", v)} />
            <Chips path={p(index, "tools")} label="Alat & kerangka kerja" items={field.tools} max={12} onChange={(v) => set("tools", v)} />
            <Chips path={p(index, "careers")} label="Prospek karier" items={field.careers} max={8} onChange={(v) => set("careers", v)} />
          </Group>

          <Group title="Relasi akademik" hint="Pilihan ini menghubungkan kartu publik dengan kurikulum dan direktori dosen.">
            <Field path={`${p(index, "courses")}-search`} label="Cari mata kuliah" value={courseQuery} placeholder="Ketik nama mata kuliah…" onChange={setCourseQuery} />
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-[var(--k-line)] bg-black/20 p-2">
              {filteredCourses.map((course) => {
                const checked = field.courses?.includes(course.nama);
                return (
                  <label key={course.nama} className={cn("flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px]", checked ? "bg-[var(--k-gold)]/10 text-[var(--k-ink)]" : "text-[var(--k-mute)] hover:bg-white/5")}>
                    <input type="checkbox" checked={checked} onChange={() => toggleCourse(course.nama)} className="accent-[var(--k-gold)]" />
                    <span className="min-w-0 flex-1 truncate">{course.nama}</span>
                    <span className="font-mono text-[10px] text-[var(--k-faint)]">{course.sks ?? "-"} SKS</span>
                  </label>
                );
              })}
              {!filteredCourses.length && <p className="p-3 text-center text-[12px] text-[var(--k-faint)]">Mata kuliah tidak ditemukan.</p>}
            </div>
            <Select path={p(index, "dosenField")} label="Rumpun dosen" value={field.dosenField} options={(refs?.dosenFields ?? []).map((x) => [x.key, x.name])} onChange={(v) => set("dosenField", v)} />
            {field.dosenField && <p className="text-[12px] text-[var(--k-faint)]">{(refs?.dosenFields ?? []).find((x) => x.key === field.dosenField)?.people?.map((x) => x.name).join(" · ") || "Belum ada dosen di rumpun ini."}</p>}
            <Select path={p(index, "profileKey")} label="Profil lulusan" value={field.profileKey} options={(refs?.profiles ?? []).map((x) => [x.key, x.title])} onChange={(v) => set("profileKey", v)} />
          </Group>

          <Group title="Profil & media">
            <div className="grid gap-3 sm:grid-cols-2">
              <Select path={p(index, "accent")} label="Aksen channel" value={field.accent} options={[["maroon", "Maroon"], ["navy", "Navy"], ["gold", "Gold"]]} onChange={(v) => set("accent", v)} />
              <Select path={p(index, "quadrant")} label="Kuadran studi kasus" value={field.quadrant} options={[["none", "Tanpa kompas"], ["0", "Kanan"], ["1", "Bawah"], ["2", "Kiri"], ["3", "Atas"]]} onChange={(v) => set("quadrant", v)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MediaField path={p(index, "image")} label="Foto bidang" value={field.image} kind="image" onChange={(v) => set("image", v)} />
              <MediaField path={p(index, "lottie")} label="Lottie" value={field.lottie} kind="lottie" onChange={(v) => set("lottie", v)} />
            </div>
            <Toggle checked={!!field.crop} onChange={(v) => set("crop", v)} label="Perbesar crop foto" />
            <Toggle checked={!!field.sample} onChange={(v) => set("sample", v)} label="Tandai sebagai konten contoh" />
            <div>
              <p className="mb-2 text-[12.5px] font-medium text-[var(--k-mute)]">Profil minat per dimensi</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {dims.map((d, i) => <label key={d.key} className="rounded-lg border border-[var(--k-line)] bg-black/20 p-2 text-[11px] text-[var(--k-faint)]">{d.short}<input type="number" min="0" max="10" value={field.profile?.[i] ?? 5} onChange={(e) => set("profile", (field.profile ?? []).map((x, j) => (j === i ? Number(e.target.value) : x)))} className="mt-1 w-full rounded border border-[var(--k-line-2)] bg-black/25 px-2 py-1 text-[13px] text-[var(--k-ink)]" /></label>)}
              </div>
            </div>
          </Group>

          <Group title="Studi kasus">
            <Field path={p(index, "move.role")} label="Peran" value={field.move?.role} max={60} onChange={(v) => setNested("move", { ...field.move, role: v })} />
            <Field path={p(index, "move.step")} label="Langkah pertama" value={field.move?.step} max={300} multiline rows={4} onChange={(v) => setNested("move", { ...field.move, step: v })} />
            <Field path={p(index, "move.output")} label="Keluaran" value={field.move?.output} max={120} onChange={(v) => setNested("move", { ...field.move, output: v })} />
          </Group>

          <button type="button" onClick={onDelete} className="w-full rounded-lg border border-[var(--k-led-bad)]/40 px-4 py-2.5 text-[13px] font-semibold text-[var(--k-led-bad)] transition-colors hover:bg-[var(--k-led-bad)]/10">Hapus channel ini</button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
