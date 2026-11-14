"use client";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { SpotlightCard } from "@/components/aceternity/spotlight-card";
import { MASCOT_POSES } from "@/lib/dosen-cms/schema";
import { FIELD_LOTTIES } from "@/lib/dosen-cms/defaults";
import { slugify } from "@/lib/dosen-content";
import { cn } from "@/lib/utils";
import { Field, Folio, ImageField, LinkRows, MiniBtn, Segmented, TagList, Toggle, fid } from "./fields";

const POSE = { wave: "Melambai", "thumbs-up": "Jempol", confident: "Yakin", proud: "Bangga", think: "Berpikir", laugh: "Tertawa", run: "Berlari" };
const POSES = MASCOT_POSES.map((p) => [p, POSE[p]]);

/** Penyunting tiap loker halaman. `v` = isi kerja, `u(path, value)` = ubah satu field. */
export function SectionEditor({ drawer, v, u, lecturers }) {
  const Ed = EDITORS[drawer];
  return Ed ? <Ed v={v} u={u} lecturers={lecturers} /> : null;
}

function Mascot({ base, m, u }) {
  return (
    <div className="space-y-3 rounded-md border border-navy/10 bg-cream/40 p-3.5">
      <Toggle label="Tampilkan Elvo" checked={m.show} onChange={(x) => u(`${base}.show`, x)} />
      {m.show && (
        <>
          <Segmented label="Pose" value={m.pose} options={POSES} onChange={(x) => u(`${base}.pose`, x)} />
          <Field path={`${base}.say`} label="Ucapan" value={m.say} onChange={(x) => u(`${base}.say`, x)} max={120} />
        </>
      )}
    </div>
  );
}

function Curtain({ v, u }) {
  const c = v.curtain;
  return (
    <Folio no="B" title="Tirai pembuka" desc="Muncul sekali per sesi sebelum halaman tampil.">
      <Toggle label="Aktifkan tirai" checked={c.enabled} onChange={(x) => u("curtain.enabled", x)} />
      {c.enabled && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field path="curtain.title" label="Judul" value={c.title} onChange={(x) => u("curtain.title", x)} max={40} />
            <Field path="curtain.accent" label="Aksen" value={c.accent} onChange={(x) => u("curtain.accent", x)} max={40} />
          </div>
          <Field path="curtain.label" label="Label pembaca layar" value={c.label} onChange={(x) => u("curtain.label", x)} max={60} />
          <div className="grid place-items-center rounded-md bg-maroon-deep py-8 text-center text-white">
            <p className="font-serif text-3xl">
              {c.title} <em className="text-gold-soft">{c.accent}</em>
            </p>
          </div>
        </>
      )}
    </Folio>
  );
}

function Hero({ v, u, lecturers }) {
  const h = v.hero;
  const auto = [...new Set(lecturers.flatMap((l) => l.expertise))].filter((t) => t.length <= 22).slice(0, 8);
  return (
    <div className="space-y-8">
      <Folio no="C1" title="Judul & pengantar">
        <LinkRows path="hero.breadcrumb" label="Remah roti" value={h.breadcrumb} onChange={(x) => u("hero.breadcrumb", x)} max={5} addLabel="Tambah remah" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field path="hero.titleTop" label="Judul baris 1" value={h.titleTop} onChange={(x) => u("hero.titleTop", x)} max={80} />
          <Field path="hero.titleAccent" label="Judul baris 2 (aksen)" value={h.titleAccent} onChange={(x) => u("hero.titleAccent", x)} max={80} />
        </div>
        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <Field path="hero.rotatePrefix" label="Awalan kata berputar" value={h.rotatePrefix} onChange={(x) => u("hero.rotatePrefix", x)} max={40} />
          <TagList path="hero.rotateWords" label="Kata berputar" value={h.rotateWords} onChange={(x) => u("hero.rotateWords", x)} max={12} itemMax={40} placeholder={`Kosong = otomatis: ${auto.slice(0, 3).join(", ")}…`} />
        </div>
        <Field path="hero.intro" label="Pengantar" value={h.intro} onChange={(x) => u("hero.intro", x)} multiline max={400} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field path="hero.countLabel" label="Label jumlah dosen" value={h.countLabel} onChange={(x) => u("hero.countLabel", x)} max={40} hint={`${lecturers.filter((l) => !l.hidden).length} …`} />
          <Field path="hero.topicLabel" label="Label jumlah topik" value={h.topicLabel} onChange={(x) => u("hero.topicLabel", x)} max={40} />
        </div>
      </Folio>
      <Folio no="C2" title="Panel pencarian">
        <Field path="hero.search.placeholder" label="Placeholder" value={h.search.placeholder} onChange={(x) => u("hero.search.placeholder", x)} max={100} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field path="hero.search.submitLabel" label="Tombol cari" value={h.search.submitLabel} onChange={(x) => u("hero.search.submitLabel", x)} max={20} />
          <Field path="hero.search.allLabel" label="Chip semua" value={h.search.allLabel} onChange={(x) => u("hero.search.allLabel", x)} max={30} />
          <Field path="hero.search.tryLabel" label="Awalan saran" value={h.search.tryLabel} onChange={(x) => u("hero.search.tryLabel", x)} max={20} />
        </div>
        <Mascot base="hero.mascot" m={h.mascot} u={u} />
      </Folio>
      <Folio no="C3" title="Video profil">
        <Toggle label="Tampilkan tombol video" checked={h.video.show} onChange={(x) => u("hero.video.show", x)} />
        {h.video.show && (
          <>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <Field path="hero.video.label" label="Label tombol" value={h.video.label} onChange={(x) => u("hero.video.label", x)} max={40} />
              <Field path="hero.video.duration" label="Durasi" value={h.video.duration} onChange={(x) => u("hero.video.duration", x)} max={10} placeholder="6:43" />
            </div>
            <Field path="hero.video.title" label="Judul video (aksesibilitas)" value={h.video.title} onChange={(x) => u("hero.video.title", x)} max={120} />
            <div className="flex flex-wrap gap-6">
              <ImageField path="hero.video.src" label="Berkas video" kind="video" aspect="aspect-video" value={h.video.src} onChange={(x) => u("hero.video.src", x ?? "")} />
              <ImageField path="hero.video.poster" label="Poster" aspect="aspect-video" value={h.video.poster} onChange={(x) => u("hero.video.poster", x ?? "")} />
            </div>
          </>
        )}
      </Folio>
    </div>
  );
}

function Directory({ v, u }) {
  const d = v.directory;
  return (
    <div className="space-y-8">
      <Folio no="D1" title="Kepala direktori">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field path="directory.titleTop" label="Judul" value={d.titleTop} onChange={(x) => u("directory.titleTop", x)} max={60} />
          <Field path="directory.titleAccent" label="Aksen" value={d.titleAccent} onChange={(x) => u("directory.titleAccent", x)} max={60} />
        </div>
        <Field path="directory.body" label="Keterangan" value={d.body} onChange={(x) => u("directory.body", x)} multiline rows={2} max={280} />
      </Folio>
      <Folio no="D2" title="Kartu dosen">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field path="directory.cardCta" label="Tautan kartu" value={d.cardCta} onChange={(x) => u("directory.cardCta", x)} max={30} />
          <Field path="directory.leadBadge" label="Lencana kaprodi" value={d.leadBadge} onChange={(x) => u("directory.leadBadge", x)} max={20} hint="kosong = tanpa lencana" />
        </div>
        <Field path="directory.sampleLabel" label="Tanda konten contoh" value={d.sampleLabel} onChange={(x) => u("directory.sampleLabel", x)} max={60} hint="tampil selama mata kuliah/riset belum diisi" />
      </Folio>
      <Folio no="D3" title="Hasil kosong" desc="Saat pencarian/filter tidak menemukan dosen.">
        <Field path="directory.empty.title" label="Judul" value={d.empty.title} onChange={(x) => u("directory.empty.title", x)} max={80} />
        <Field path="directory.empty.body" label="Pesan" value={d.empty.body} onChange={(x) => u("directory.empty.body", x)} max={200} />
        <Field path="directory.empty.resetLabel" label="Tombol reset" value={d.empty.resetLabel} onChange={(x) => u("directory.empty.resetLabel", x)} max={30} />
      </Folio>
    </div>
  );
}

function Fields({ v, u, lecturers }) {
  const list = v.fields;
  const set = (i, k, x) => u("fields", list.map((f, j) => (j === i ? { ...f, [k]: x } : f)));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    u("fields", next);
  };
  return (
    <Folio no="E" title="Rumpun keahlian" desc="Kunci rumpun tetap walau nama diubah, jadi pilihan di berkas dosen tidak hilang.">
      <ul className="grid gap-3 xl:grid-cols-2">
        {list.map((f, i) => {
          const n = lecturers.filter((l) => l.fields.includes(f.key)).length;
          return (
            <li key={f.key} id={fid(`fields.${i}`)}>
              <SpotlightCard className="h-full rounded-lg border border-navy/10 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="w-14 shrink-0 rounded-full bg-navy p-2">
                    <LottieIllustration src={f.lottie} replayOnHover />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10.5px] text-maroon/70">
                      {f.key} · {n} dosen
                    </p>
                    <p className="truncate font-serif text-[1.05rem] text-navy">{f.name || "Rumpun baru"}</p>
                  </div>
                  <span className="flex">
                    <MiniBtn label="Naik" onClick={() => move(i, -1)}>↑</MiniBtn>
                    <MiniBtn label="Turun" onClick={() => move(i, 1)}>↓</MiniBtn>
                    <MiniBtn label="Hapus rumpun" danger onClick={() => u("fields", list.filter((_, j) => j !== i))}>
                      ×
                    </MiniBtn>
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
                    <Field path={`fields.${i}.name`} label="Nama" value={f.name} onChange={(x) => set(i, "name", x)} max={60} />
                    <Field path={`fields.${i}.short`} label="Singkat" value={f.short} onChange={(x) => set(i, "short", x)} max={24} />
                  </div>
                  <Field path={`fields.${i}.body`} label="Deskripsi" value={f.body} onChange={(x) => set(i, "body", x)} multiline rows={2} max={200} />
                  <div>
                    <p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-navy/60">Ilustrasi</p>
                    <div className="flex gap-1.5">
                      {FIELD_LOTTIES.map((src) => (
                        <button
                          key={src}
                          type="button"
                          aria-label={`Pakai ilustrasi ${src.split("/").pop()}`}
                          aria-pressed={f.lottie === src}
                          onClick={() => set(i, "lottie", src)}
                          className={cn("size-11 rounded-full bg-navy p-1.5 ring-2 ring-offset-2 transition-[box-shadow,transform] hover:scale-105", f.lottie === src ? "ring-gold" : "ring-transparent")}
                        >
                          <LottieIllustration src={src} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </li>
          );
        })}
      </ul>
      {list.length < 8 && (
        <button
          type="button"
          onClick={() => {
            const key = `rumpun-${slugify(String(Date.now()).slice(-5))}`;
            u("fields", [...list, { key, name: "", short: "", body: "", lottie: FIELD_LOTTIES[list.length % FIELD_LOTTIES.length] }]);
          }}
          className="w-full rounded-md border border-dashed border-navy/20 py-2.5 text-[13px] font-medium text-navy/60 transition-colors hover:border-maroon hover:text-maroon"
        >
          + Tambah rumpun
        </button>
      )}
    </Folio>
  );
}

function MapSec({ v, u }) {
  const m = v.map;
  return (
    <Folio no="F" title="Peta rumpun" desc="Kolom rumpun dengan avatar dosen di bawah direktori.">
      <Toggle label="Tampilkan section" checked={m.show} onChange={(x) => u("map.show", x)} />
      {m.show && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field path="map.titleTop" label="Judul" value={m.titleTop} onChange={(x) => u("map.titleTop", x)} max={60} />
            <Field path="map.titleAccent" label="Aksen" value={m.titleAccent} onChange={(x) => u("map.titleAccent", x)} max={60} />
          </div>
          <Field path="map.body" label="Keterangan" value={m.body} onChange={(x) => u("map.body", x)} multiline rows={2} max={280} />
          <Field path="map.ctaLabel" label="Akhiran tombol jumlah" value={m.ctaLabel} onChange={(x) => u("map.ctaLabel", x)} max={40} hint="“3 dosen”" />
        </>
      )}
    </Folio>
  );
}

function Closing({ v, u }) {
  const c = v.closing;
  return (
    <div className="space-y-8">
      <Toggle label="Tampilkan penutup" checked={c.show} onChange={(x) => u("closing.show", x)} />
      {c.show && (
        <>
          <Folio no="G1" title="Ajakan kolaborasi">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field path="closing.titleTop" label="Judul" value={c.titleTop} onChange={(x) => u("closing.titleTop", x)} max={80} />
              <Field path="closing.titleAccent" label="Aksen" value={c.titleAccent} onChange={(x) => u("closing.titleAccent", x)} max={80} />
            </div>
            <Field path="closing.body" label="Keterangan" value={c.body} onChange={(x) => u("closing.body", x)} multiline rows={2} max={280} />
            <TagList path="closing.ways" label="Bentuk kerja sama" value={c.ways} onChange={(x) => u("closing.ways", x)} max={8} itemMax={40} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field path="closing.cta.label" label="Tombol" value={c.cta.label} onChange={(x) => u("closing.cta.label", x)} max={40} />
              <Field path="closing.cta.href" label="Tautan tombol" value={c.cta.href} onChange={(x) => u("closing.cta.href", x)} max={300} />
            </div>
            <Mascot base="closing.mascot" m={c.mascot} u={u} />
          </Folio>
          <Folio no="G2" title="Tautan lanjutan">
            <LinkRows
              path="closing.next"
              label="Kartu tautan"
              value={c.next}
              onChange={(x) => u("closing.next", x)}
              max={6}
              fields={[["kicker", "Kategori", 24], ["title", "Judul", 60], ["href", "Tautan", 300], ["body", "Keterangan", 120]]}
              addLabel="Tambah tautan"
            />
          </Folio>
        </>
      )}
    </div>
  );
}

const LABELS = [
  ["tabProfile", "Tab profil"],
  ["tabTeach", "Tab mengajar"],
  ["tabResearch", "Tab riset"],
  ["expertise", "Blok keahlian"],
  ["education", "Blok pendidikan"],
  ["certs", "Blok sertifikasi"],
  ["courses", "Blok mata kuliah"],
  ["research", "Blok riset"],
  ["nuptk", "Label NUPTK"],
  ["email", "Label email"],
  ["pending", "Data belum ada"],
  ["fallback", "Subjudul tanpa rumpun"],
  ["prev", "Tombol sebelumnya"],
  ["next", "Tombol berikutnya"],
];

function ModalSec({ v, u }) {
  const m = v.modal;
  return (
    <div className="space-y-8">
      <Folio no="H1" title="Label modal profil">
        <div className="grid gap-3 sm:grid-cols-2">
          {LABELS.map(([k, l]) => (
            <Field key={k} path={`modal.labels.${k}`} label={l} value={m.labels[k]} onChange={(x) => u(`modal.labels.${k}`, x)} max={k === "fallback" ? 60 : 40} />
          ))}
        </div>
      </Folio>
      <Folio no="H2" title="Profil akademik" desc="Kosongkan label untuk menyembunyikan baris tautan itu.">
        <div className="grid gap-3 sm:grid-cols-3">
          {["scholar", "scopus", "sinta"].map((k) => (
            <Field key={k} path={`modal.links.${k}`} label={k} value={m.links[k]} onChange={(x) => u(`modal.links.${k}`, x)} max={30} />
          ))}
        </div>
      </Folio>
      <Folio no="H3" title="Kamus sertifikasi" desc="Kode yang muncul di gelar dosen (mis. MOS) dibaca menjadi sertifikasi.">
        <LinkRows path="certs" label="Kode → nama" value={v.certs} onChange={(x) => u("certs", x.map((c) => ({ ...c, code: (c.code ?? "").replace(/[^A-Za-z0-9]/g, "").toUpperCase() })))} max={24} fields={[["code", "Kode", 12], ["label", "Nama sertifikasi", 120]]} addLabel="Tambah kode" />
      </Folio>
    </div>
  );
}

function Seo({ v, u }) {
  const s = v.seo;
  return (
    <Folio no="I" title="Meta mesin pencari">
      <Field path="seo.title" label="Judul" value={s.title} onChange={(x) => u("seo.title", x)} max={90} hint="ideal ≤ 60" />
      <Field path="seo.description" label="Deskripsi" value={s.description} onChange={(x) => u("seo.description", x)} multiline rows={3} max={200} hint="ideal ≤ 160" />
      <div className="rounded-md border border-navy/10 bg-white p-4">
        <p className="text-[12px] text-emerald-700">sisfor.uisi.ac.id › dosen</p>
        <p className="mt-0.5 truncate text-[17px] text-[#1a0dab]">{s.title || "—"}</p>
        <p className="mt-0.5 line-clamp-2 text-[13px] text-text/65">{s.description || "—"}</p>
      </div>
    </Folio>
  );
}

const EDITORS = { curtain: Curtain, hero: Hero, directory: Directory, fields: Fields, map: MapSec, closing: Closing, modal: ModalSec, seo: Seo };
