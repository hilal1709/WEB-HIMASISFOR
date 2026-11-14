"use client";
import { useLayoutEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { CHAPTERS, MASCOT_POSES, fill } from "@/lib/prestasi-cms/schema";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Choice, Field, MediaField, NumberField, Plate, Repeater, Toggle, Words } from "./fields";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const POSES = MASCOT_POSES.map((p) => [p, p.replace("-", " ")]);

/**
 * Rail bab Panggung: kartu label pameran bernomor romawi. Bab yang berubah dari versi live
 * diberi titik emas; jumlah kalimat kembar per bab tampil sebagai angka merah.
 */
export function ChapterRail({ active, onSelect, changed, lintCount }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    animate(ref.current.querySelectorAll("[data-ch]"), { opacity: [0, 1], translateX: [-12, 0], delay: stagger(45), duration: 520, ease: "outExpo" });
  }, []);
  return (
    <nav ref={ref} aria-label="Bab halaman" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {CHAPTERS.map((c, i) => {
        const on = active === c.key;
        const lint = lintCount[c.key] ?? 0;
        return (
          <button
            key={c.key}
            data-ch
            type="button"
            onClick={() => onSelect(c.key)}
            aria-current={on ? "true" : undefined}
            className={cn(
              "group relative flex shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-[background-color,border-color] duration-300 lg:w-full",
              on ? "border-[var(--k-gold)]/50 bg-[var(--k-gold)]/[0.07]" : "border-transparent hover:border-[var(--k-line-2)] hover:bg-white/[0.03]"
            )}
          >
            <span className={cn("w-7 shrink-0 text-center font-serif text-[15px] italic transition-colors", on ? "text-[var(--k-gold)]" : "text-[var(--k-faint)] group-hover:text-[var(--k-mute)]")}>{ROMAN[i]}</span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className={cn("text-[14px] font-medium", on ? "text-[var(--k-ink)]" : "text-[var(--k-mute)]")}>{c.label}</span>
                {changed.includes(c.key) && <span title="Berubah dari versi live" className="size-1.5 rounded-full bg-[var(--k-gold)] shadow-[0_0_8px_var(--k-gold)]" />}
                {lint > 0 && <span title={`${lint} kalimat kembar`} className="rounded-full bg-[var(--k-maroon)] px-1.5 text-[10px] font-bold leading-4 text-white">{lint}</span>}
              </span>
              <span className="hidden truncate text-[11.5px] text-[var(--k-faint)] lg:block">{c.hint}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/** Editor satu bab. `v` = nilai kerja, `u(path, val)` = ubah. */
export function ChapterEditor({ chapter, v, u }) {
  const E = EDITORS[chapter];
  return E ? <E v={v} u={u} /> : null;
}

const Mascot = ({ base, v, u }) => (
  <div className="grid gap-4 rounded-xl border border-[var(--k-line)] p-3.5">
    <Toggle label="Tampilkan maskot Elvo" checked={v.show} onChange={(x) => u(`${base}.show`, x)} />
    {v.show && (
      <>
        <Choice label="Pose" value={v.pose} options={POSES} onChange={(x) => u(`${base}.pose`, x)} />
        <Field path={`${base}.say`} label="Ucapan" value={v.say} onChange={(x) => u(`${base}.say`, x)} max={120} />
      </>
    )}
  </div>
);

function Hero({ v, u }) {
  const h = v.hero;
  return (
    <>
      <Plate no="I·a" title="Judul & kata berputar" desc="Baris kedua judul tampil miring berwarna maroon.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field path="hero.titleTop" label="Judul baris 1" value={h.titleTop} onChange={(x) => u("hero.titleTop", x)} max={80} />
          <Field path="hero.titleAccent" label="Judul baris 2" value={h.titleAccent} onChange={(x) => u("hero.titleAccent", x)} max={80} />
        </div>
        <Field path="hero.lead" label="Kata pembuka" value={h.lead} onChange={(x) => u("hero.lead", x)} max={40} hint="sebelum kata berputar" />
        <Words path="hero.rotateWords" label="Kata berputar" value={h.rotateWords} onChange={(x) => u("hero.rotateWords", x)} max={12} />
      </Plate>
      <Plate no="I·b" title="Ringkasan angka" desc="Token diisi otomatis dari data Vitrin.">
        <Field path="hero.countTemplate" label="Kalimat jumlah" value={h.countTemplate} onChange={(x) => u("hero.countTemplate", x)} max={120} hint="{n} prestasi · {people} peraih" />
        <Field path="hero.spanTemplate" label="Kalimat rentang tahun" value={h.spanTemplate} onChange={(x) => u("hero.spanTemplate", x)} max={80} hint="{from} · {to}" />
        <Field path="hero.body" label="Pengantar" value={h.body} onChange={(x) => u("hero.body", x)} max={400} multiline rows={4} />
      </Plate>
      <Plate no="I·c" title="Tombol & chip tingkat">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field path="hero.ctaLabel" label="Tombol arsip" value={h.ctaLabel} onChange={(x) => u("hero.ctaLabel", x)} max={40} />
          <Field path="hero.storyLinkLabel" label="Tautan kisah" value={h.storyLinkLabel} onChange={(x) => u("hero.storyLinkLabel", x)} max={60} />
          <Field path="hero.chipsLabel" label="Label chip" value={h.chipsLabel} onChange={(x) => u("hero.chipsLabel", x)} max={30} />
        </div>
        <Repeater
          path="hero.breadcrumb"
          label="Remah roti"
          value={h.breadcrumb}
          onChange={(x) => u("hero.breadcrumb", x)}
          max={5}
          fields={[["label", "Label", 60], ["href", "Tautan (kosong = teks)", 300]]}
          addLabel="Tambah remah"
          hint="item terakhir = halaman ini"
        />
      </Plate>
      <Plate no="I·d" title="Pita juara & maskot" desc="Pita kartu bergulir: satu sorotan terbaik per peraih.">
        <Toggle label="Tampilkan pita juara" checked={h.fame.show} onChange={(x) => u("hero.fame.show", x)} />
        {h.fame.show && <NumberField path="hero.fame.limit" label="Jumlah kartu" value={h.fame.limit} onChange={(x) => u("hero.fame.limit", x)} min={3} max={24} />}
        <Mascot base="hero.mascot" v={h.mascot} u={u} />
      </Plate>
    </>
  );
}

function Archive({ v, u }) {
  const a = v.archive;
  return (
    <>
      <Plate no="II·a" title="Kepala arsip">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field path="archive.titleTop" label="Judul" value={a.titleTop} onChange={(x) => u("archive.titleTop", x)} max={60} />
          <Field path="archive.titleAccent" label="Judul aksen" value={a.titleAccent} onChange={(x) => u("archive.titleAccent", x)} max={60} />
        </div>
        <Field path="archive.body" label="Pengantar" value={a.body} onChange={(x) => u("archive.body", x)} max={280} multiline />
        <MediaField path="archive.lottie" label="Ilustrasi Lottie" kind="lottie" value={a.lottie} onChange={(x) => u("archive.lottie", x ?? "")} />
      </Plate>
      <Plate no="II·b" title="Saringan & penghitung" desc="Token diisi angka saat pengunjung menyaring.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field path="archive.searchPlaceholder" label="Placeholder cari" value={a.searchPlaceholder} onChange={(x) => u("archive.searchPlaceholder", x)} max={60} />
          <Field path="archive.yearAllLabel" label="Opsi semua tahun" value={a.yearAllLabel} onChange={(x) => u("archive.yearAllLabel", x)} max={30} />
          <Field path="archive.countLabel" label="Penghitung" value={a.countLabel} onChange={(x) => u("archive.countLabel", x)} max={80} hint="{shown} · {total}" />
          <Field path="archive.clearLabel" label="Hapus saringan" value={a.clearLabel} onChange={(x) => u("archive.clearLabel", x)} max={40} hint="{n}" />
          <Field path="archive.groupLabel" label="Jumlah per tahun" value={a.groupLabel} onChange={(x) => u("archive.groupLabel", x)} max={40} hint="{n}" />
          <NumberField path="archive.pageSize" label="Baris per muatan" value={a.pageSize} onChange={(x) => u("archive.pageSize", x)} min={4} max={40} />
        </div>
      </Plate>
      <Plate no="II·c" title="Muat lagi & ujung arsip">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field path="archive.moreLabel" label="Tombol muat lagi" value={a.moreLabel} onChange={(x) => u("archive.moreLabel", x)} max={40} hint="{n}" />
          <Field path="archive.doneToast" label="Toast ujung arsip" value={a.doneToast} onChange={(x) => u("archive.doneToast", x)} max={80} />
        </div>
        <Field path="archive.doneDetail" label="Rincian toast" value={a.doneDetail} onChange={(x) => u("archive.doneDetail", x)} max={120} hint="{n}" />
      </Plate>
      <Plate no="II·d" title="Hasil kosong">
        <MediaField path="archive.empty.lottie" label="Ilustrasi Lottie" kind="lottie" value={a.empty.lottie} onChange={(x) => u("archive.empty.lottie", x ?? "")} />
        <Field path="archive.empty.title" label="Judul" value={a.empty.title} onChange={(x) => u("archive.empty.title", x)} max={80} />
        <Field path="archive.empty.body" label="Pesan" value={a.empty.body} onChange={(x) => u("archive.empty.body", x)} max={200} multiline rows={2} />
        <Field path="archive.empty.resetLabel" label="Tombol reset" value={a.empty.resetLabel} onChange={(x) => u("archive.empty.resetLabel", x)} max={40} />
      </Plate>
      <Plate no="II·e" title="Data contoh">
        <Toggle label="Tampilkan contoh bila Vitrin kosong" hint="Ditandai label contoh di halaman publik" checked={v.sample.enabled} onChange={(x) => u("sample.enabled", x)} />
      </Plate>
    </>
  );
}

function Labels({ v, u }) {
  const l = v.labels;
  return (
    <>
      <Plate no="III·a" title="Nama tingkat" desc="Dipakai di chip, badge, kolom Vitrin, dan modal.">
        <div className="grid gap-4 sm:grid-cols-3">
          {["internasional", "nasional", "regional"].map((k) => (
            <Field key={k} path={`labels.levels.${k}`} label={k} value={l.levels[k]} onChange={(x) => u(`labels.levels.${k}`, x)} max={30} />
          ))}
        </div>
      </Plate>
      <Plate no="III·b" title="Nama kategori">
        <div className="grid gap-4 sm:grid-cols-3">
          {["all", "mahasiswa", "dosen"].map((k) => (
            <Field key={k} path={`labels.categories.${k}`} label={k === "all" ? "semua" : k} value={l.categories[k]} onChange={(x) => u(`labels.categories.${k}`, x)} max={24} />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field path="labels.ongoing" label="Grup masih berjalan" value={l.ongoing} onChange={(x) => u("labels.ongoing", x)} max={24} />
          <Field path="labels.now" label="Akhir rentang berjalan" value={l.now} onChange={(x) => u("labels.now", x)} max={16} hint="2017–kini" />
        </div>
      </Plate>
      <Plate no="III·c" title="Peran dari judul" desc="Kata kunci (pisahkan koma) dicari di judul prestasi. Urutan atas = prioritas sorotan pita juara.">
        <Repeater
          path="roles"
          label="Kamus peran"
          value={v.roles}
          onChange={(x) => u("roles", x)}
          max={16}
          fields={[["keyword", "Kata kunci", 80], ["label", "Label peran", 30]]}
          addLabel="Tambah peran"
        />
        <Field path="roleFallback" label="Peran bila tak cocok" value={v.roleFallback} onChange={(x) => u("roleFallback", x)} max={30} />
      </Plate>
    </>
  );
}

function Story({ v, u }) {
  const s = v.story;
  return (
    <>
      <Plate no="IV·a" title="Band kisah" aside={<HideChip on={s.show} onChange={(x) => u("story.show", x)} />}>
        <Field path="story.kicker" label="Label kecil" value={s.kicker} onChange={(x) => u("story.kicker", x)} max={40} />
        <Field path="story.quote" label="Kutipan" value={s.quote} onChange={(x) => u("story.quote", x)} max={400} multiline rows={4} />
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField path="story.accentWords" label="Kata akhir beraksen emas" value={s.accentWords} onChange={(x) => u("story.accentWords", x)} min={0} max={12} />
          <MediaField path="story.lottie" label="Ilustrasi Lottie" kind="lottie" value={s.lottie} onChange={(x) => u("story.lottie", x ?? "")} />
        </div>
      </Plate>
      <Plate no="IV·b" title="Pemeran kisah">
        <Repeater
          path="story.people"
          label="Orang di video"
          value={s.people}
          onChange={(x) => u("story.people", x)}
          max={6}
          fields={[["name", "Nama", 80], ["role", "Keterangan", 140], ["photo", "Foto", 500, { kind: "image" }]]}
          addLabel="Tambah pemeran"
        />
      </Plate>
      <Plate no="IV·c" title="Video">
        <div className="grid gap-4 sm:grid-cols-2">
          <MediaField path="story.video.src" label="Berkas video" kind="video" value={s.video.src} onChange={(x) => u("story.video.src", x ?? "")} />
          <MediaField path="story.video.poster" label="Poster" value={s.video.poster} onChange={(x) => u("story.video.poster", x ?? "")} aspect="aspect-video" />
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <Field path="story.video.title" label="Judul video" value={s.video.title} onChange={(x) => u("story.video.title", x)} max={120} />
          <Field path="story.video.duration" label="Durasi" value={s.video.duration} onChange={(x) => u("story.video.duration", x)} max={10} placeholder="2:31" />
        </div>
        <Mascot base="story.mascot" v={s.mascot} u={u} />
      </Plate>
    </>
  );
}

function Closing({ v, u }) {
  const c = v.closing;
  return (
    <>
      <Plate no="V·a" title="Ajakan penutup" aside={<HideChip on={c.show} onChange={(x) => u("closing.show", x)} />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field path="closing.titleTop" label="Judul" value={c.titleTop} onChange={(x) => u("closing.titleTop", x)} max={80} />
          <Field path="closing.titleAccent" label="Judul aksen" value={c.titleAccent} onChange={(x) => u("closing.titleAccent", x)} max={80} />
        </div>
        <Field path="closing.body" label="Ajakan" value={c.body} onChange={(x) => u("closing.body", x)} max={280} multiline />
        <MediaField path="closing.lottie" label="Ilustrasi Lottie" kind="lottie" value={c.lottie} onChange={(x) => u("closing.lottie", x ?? "")} />
      </Plate>
      <Plate no="V·b" title="Tombol & tautan lapor">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field path="closing.cta.label" label="Tombol utama" value={c.cta.label} onChange={(x) => u("closing.cta.label", x)} max={60} />
          <Field path="closing.cta.href" label="Tautan tombol" value={c.cta.href} onChange={(x) => u("closing.cta.href", x)} max={300} type="url" />
          <Field path="closing.report.label" label="Teks lapor prestasi" value={c.report.label} onChange={(x) => u("closing.report.label", x)} max={60} />
          <Field path="closing.report.href" label="Tautan lapor" value={c.report.href} onChange={(x) => u("closing.report.href", x)} max={300} type="url" />
        </div>
      </Plate>
      <Plate no="V·c" title="Jalan lanjut" desc="Pil tautan ke halaman lain; keterangan tampil saat diarahkan.">
        <Repeater
          path="closing.next"
          label="Pil tautan"
          value={c.next}
          onChange={(x) => u("closing.next", x)}
          max={6}
          fields={[["title", "Judul", 40], ["href", "Tautan", 300], ["body", "Keterangan", 120, { wide: true }]]}
          addLabel="Tambah pil"
        />
      </Plate>
    </>
  );
}

function ModalCopy({ v, u }) {
  const m = v.modal;
  return (
    <Plate no="VI" title="Modal peraih" desc="Panel yang terbuka saat baris arsip atau kartu juara diklik.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field path="modal.countLabel" label="Jumlah prestasi" value={m.countLabel} onChange={(x) => u("modal.countLabel", x)} max={40} hint="{n}" />
        <Field path="modal.sinceLabel" label="Sejak tahun" value={m.sinceLabel} onChange={(x) => u("modal.sinceLabel", x)} max={40} hint="{year}" />
      </div>
      <Field path="modal.description" label="Keterangan" value={m.description} onChange={(x) => u("modal.description", x)} max={160} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field path="modal.prevLabel" label="Label tombol ‹" value={m.prevLabel} onChange={(x) => u("modal.prevLabel", x)} max={40} />
        <Field path="modal.nextLabel" label="Label tombol ›" value={m.nextLabel} onChange={(x) => u("modal.nextLabel", x)} max={40} />
      </div>
      <MediaField path="modal.lottie" label="Lottie panel" kind="lottie" value={m.lottie} onChange={(x) => u("modal.lottie", x ?? "")} />
    </Plate>
  );
}

function Curtain({ v, u }) {
  const c = v.curtain;
  return (
    <Plate no="VII" title="Tirai pembuka" desc="Tampil sekali per sesi, tidak muncul di pratinjau.">
      <Toggle label="Aktifkan tirai" checked={c.enabled} onChange={(x) => u("curtain.enabled", x)} />
      {c.enabled && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field path="curtain.title" label="Judul" value={c.title} onChange={(x) => u("curtain.title", x)} max={40} />
          <Field path="curtain.accent" label="Aksen" value={c.accent} onChange={(x) => u("curtain.accent", x)} max={40} />
          <Field path="curtain.label" label="Label muat" value={c.label} onChange={(x) => u("curtain.label", x)} max={60} />
        </div>
      )}
    </Plate>
  );
}

function Seo({ v, u }) {
  const s = v.seo;
  return (
    <Plate no="VIII" title="Mesin pencari">
      <Field path="seo.title" label="Judul tab" value={s.title} onChange={(x) => u("seo.title", x)} max={90} />
      <Field path="seo.description" label="Deskripsi" value={s.description} onChange={(x) => u("seo.description", x)} max={200} multiline rows={3} />
      <div className="rounded-xl border border-[var(--k-line)] bg-black/30 p-4">
        <p className="font-mono text-[11px] text-[var(--k-faint)]">sisfor.uisi.ac.id › achievement</p>
        <p className="mt-1 truncate text-[17px] text-[#8ab4f8]">{s.title}</p>
        <p className="mt-0.5 line-clamp-2 text-[13px] text-[var(--k-mute)]">{s.description}</p>
      </div>
    </Plate>
  );
}

function HideChip({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors",
        on ? "border-[var(--k-gold)]/50 text-[var(--k-gold)] hover:bg-[var(--k-gold)]/10" : "border-[var(--k-line-2)] text-[var(--k-faint)] hover:text-[var(--k-ink)]"
      )}
    >
      {on ? "Tampil" : "Disembunyikan"}
    </button>
  );
}

const EDITORS = { hero: Hero, archive: Archive, labels: Labels, story: Story, closing: Closing, modal: ModalCopy, curtain: Curtain, seo: Seo };

/** Label pameran: cuplikan cara bab tampil (judul serif + aksen), hidup saat diketik. */
export function ExhibitLabel({ chapter, v, stats }) {
  const map = {
    hero: [v.hero.titleTop, v.hero.titleAccent, fill(v.hero.countTemplate, { n: stats.items, people: stats.people })],
    archive: [v.archive.titleTop, v.archive.titleAccent, v.archive.body],
    labels: [v.labels.levels.internasional, v.labels.levels.nasional, `${v.labels.levels.regional} · ${v.roles.length} peran`],
    story: [v.story.kicker, "", v.story.quote],
    closing: [v.closing.titleTop, v.closing.titleAccent, v.closing.body],
    modal: [fill(v.modal.countLabel, { n: 3 }), fill(v.modal.sinceLabel, { year: 2019 }), v.modal.description],
    curtain: [v.curtain.title, v.curtain.accent, v.curtain.label],
    seo: [v.seo.title, "", v.seo.description],
  };
  const [a, b, body] = map[chapter] ?? [];
  return (
    <div className="rounded-2xl border border-[var(--k-line)] bg-[linear-gradient(160deg,#1c2029,#121419)] p-5 shadow-[0_30px_60px_-40px_black]">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--k-gold)]">Label pameran</p>
      <p className="mt-3 font-serif text-[1.45rem] leading-[1.1] text-[var(--k-ink)]">
        {a}
        {b && (
          <>
            <br />
            <em className="text-[var(--k-gold)]">{b}</em>
          </>
        )}
      </p>
      {body && <p className="mt-3 line-clamp-4 text-[13px] leading-relaxed text-[var(--k-mute)]">{body}</p>}
      <span aria-hidden className="mt-4 block h-px w-12 bg-[var(--k-gold)]/60" />
    </div>
  );
}
