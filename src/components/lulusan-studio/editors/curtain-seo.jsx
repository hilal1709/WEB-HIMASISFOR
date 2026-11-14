"use client";
import { Field, Panel, Switch } from "../fields";

/** Tirai pembuka halaman. */
export function CurtainEditor({ v, set, path }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Panel title="Tirai pembuka" hint="Tampil sekali per sesi sebelum halaman muncul.">
        <Switch checked={v.enabled} onChange={(x) => set("enabled", x)} label="Aktifkan tirai" hint="Matikan bila ingin halaman langsung tampil." />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field path={path("title")} label="Kata utama" value={v.title} onChange={(x) => set("title", x)} max={40} size="title" />
          <Field path={path("accent")} label="Kata aksen" value={v.accent} onChange={(x) => set("accent", x)} max={40} size="title" />
        </div>
        <Field path={path("label")} label="Label pembaca layar" value={v.label} onChange={(x) => set("label", x)} max={60} />
      </Panel>
      <div className="relative grid min-h-[260px] place-items-center overflow-hidden rounded-2xl bg-maroon">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-gold/40" />
        <p className={v.enabled ? "font-serif text-[clamp(2rem,4vw,3.4rem)] text-white" : "font-serif text-[2rem] text-white/30 line-through"}>
          {v.title} <em className="text-gold-soft">{v.accent}</em>
        </p>
        {!v.enabled && <p className="absolute bottom-4 text-[12px] text-white/50">Tirai nonaktif</p>}
      </div>
    </div>
  );
}

/** Meta mesin pencari + label contoh konten yang dipakai di seluruh halaman. */
export function SeoEditor({ v, set, path }) {
  const titleLong = (v.title ?? "").length > 60;
  const descLong = (v.description ?? "").length > 160;
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <Panel title="Mesin pencari">
          <Field path={path("title")} label="Judul halaman" value={v.title} onChange={(x) => set("title", x)} max={90} hint={titleLong ? "Lebih dari 60 karakter biasanya terpotong di Google." : undefined} />
          <Field path={path("description")} label="Deskripsi" value={v.description} onChange={(x) => set("description", x)} max={200} multiline rows={3} hint={descLong ? "Lebih dari 160 karakter biasanya terpotong." : undefined} />
        </Panel>
        <Panel title="Label contoh konten" hint="Muncul di section/item yang ditandai contoh.">
          <Field path={path("sampleNote")} label="Teks label" value={v.sampleNote} onChange={(x) => set("sampleNote", x)} max={60} />
          <span className="inline-flex rounded bg-cream-2 px-2 py-0.5 text-[11px] font-medium text-text/55">{v.sampleNote || "Contoh konten"}</span>
        </Panel>
      </div>
      <div className="h-fit rounded-2xl bg-white p-5">
        <p className="text-[11px] text-[#4d5156]">Pratinjau hasil pencarian</p>
        <p className="mt-3 text-[12px] text-[#202124]">sisfor.uisi.ac.id › profil-lulusan</p>
        <p className="mt-0.5 text-[19px] leading-snug text-[#1a0dab]">{(v.title ?? "").slice(0, 60)}{titleLong ? "…" : ""}</p>
        <p className="mt-1 text-[13.5px] leading-relaxed text-[#4d5156]">{(v.description ?? "").slice(0, 160)}{descLong ? "…" : ""}</p>
      </div>
    </div>
  );
}
