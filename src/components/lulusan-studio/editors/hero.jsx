"use client";
import { LIMITS } from "@/lib/profil-lulusan-cms/schema";
import { WordRotate } from "@/components/motion/word-rotate";
import { AddButton, Chips, Field, IconBtn, MascotField, MediaField, Panel, Segmented, Switch, TitlePair } from "../fields";

/** Panggung — hero Profil Lulusan. */
export function HeroEditor({ v, set, flag, pick, path }) {
  const crumbs = v.breadcrumb ?? [];
  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4">
        <Panel title="Judul & intro" hint="Baris pertama yang dibaca pengunjung.">
          <TitlePair path="hero" top={v.titleTop} accent={v.titleAccent} onTop={(x) => set("titleTop", x)} onAccent={(x) => set("titleAccent", x)} />
          <Field path={path("body")} label="Intro" value={v.body} onChange={(x) => set("body", x)} max={320} multiline rows={3} flag={flag("body")} />
          <Field path={path("ctaLabel")} label="Label tombol ke daftar profil" value={v.ctaLabel} onChange={(x) => set("ctaLabel", x)} max={40} />
        </Panel>

        <Panel title="Jabatan berganti" hint="Diputar bergantian di bawah intro. Urutan chip = urutan tampil.">
          <Field path={path("rolesLead")} label="Kalimat pengantar" value={v.rolesLead} onChange={(x) => set("rolesLead", x)} max={80} />
          <Chips path={path("roles")} label="Jabatan" items={v.roles} onChange={(x) => set("roles", x)} max={LIMITS.roles} placeholder="mis. Business Analyst" />
          <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-4">
            <p className="text-[12px] text-white/45">{v.rolesLead}</p>
            <p className="min-h-[1.3em] font-serif text-[1.9rem] italic leading-tight text-gold-soft">
              {v.roles.length ? <WordRotate key={v.roles.join("|")} words={v.roles} interval={1800} /> : <span className="text-white/25">belum ada jabatan</span>}
            </p>
          </div>
        </Panel>

        <Panel
          title="Remah roti"
          hint="Kosongkan tautan untuk item yang hanya berupa teks. Item terakhir = halaman ini."
          aside={<span className="text-[11px] text-white/35">{crumbs.length}/{LIMITS.breadcrumb}</span>}
        >
          <ol className="space-y-2">
            {crumbs.map((c, i) => (
              <li key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                <Field path={path(`breadcrumb.${i}.label`)} label={`Item ${i + 1}`} value={c.label} onChange={(x) => set(`breadcrumb.${i}.label`, x)} max={60} />
                <Field path={path(`breadcrumb.${i}.href`)} label="Tautan" value={c.href} onChange={(x) => set(`breadcrumb.${i}.href`, x)} placeholder="/ atau kosong" />
                <IconBtn label="Hapus item" danger onClick={() => set("breadcrumb", crumbs.filter((_, j) => j !== i))} className="mb-1">
                  ×
                </IconBtn>
              </li>
            ))}
          </ol>
          <AddButton disabled={crumbs.length >= LIMITS.breadcrumb} onClick={() => set("breadcrumb", [...crumbs, { label: "", href: "" }])}>
            Tambah item
          </AddButton>
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel title="Kolase alumni" hint="Foto diambil dari Dinding Alumni (yang punya foto).">
          <Segmented label="Jumlah polaroid" value={v.collage} options={[0, 2, 3, 4, 5, 6].map((n) => [n, n ? String(n) : "Sembunyi"])} onChange={(x) => set("collage", x)} />
          <Field path={path("storyLabel")} label="Tautan ke dinding alumni" value={v.storyLabel} onChange={(x) => set("storyLabel", x)} max={40} />
        </Panel>

        <Panel title="Video alumni" aside={<Switch checked={v.video.show} onChange={(x) => set("video.show", x)} label="" />}>
          {v.video.show ? (
            <>
              <Field path={path("video.label")} label="Label tombol" value={v.video.label} onChange={(x) => set("video.label", x)} max={40} />
              <Field path={path("video.title")} label="Judul video (pembaca layar)" value={v.video.title} onChange={(x) => set("video.title", x)} max={120} />
              <MediaField path={path("video.src")} label="Berkas video" kind="video" value={v.video.src} onChange={(x) => set("video.src", x)} pick={pick} />
              <MediaField path={path("video.poster")} label="Poster" kind="image" value={v.video.poster} onChange={(x) => set("video.poster", x)} pick={pick} />
              <Field path={path("video.duration")} label="Durasi" value={v.video.duration} onChange={(x) => set("video.duration", x)} max={8} placeholder="5:04" />
            </>
          ) : (
            <p className="text-[13px] text-white/45">Tombol video disembunyikan dari panggung.</p>
          )}
        </Panel>

        <Panel title="Elvo di panggung">
          <MascotField path={path("mascot")} value={v.mascot} onChange={(x) => set("mascot", x)} flag={flag("mascot.say")} />
        </Panel>
      </div>
    </div>
  );
}
