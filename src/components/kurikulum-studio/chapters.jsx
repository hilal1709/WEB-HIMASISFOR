"use client";
import { useState } from "react";
import { BOK_GROUPS, RUMPUN_COLORS, slugify, withColor } from "@/lib/kurikulum-content";
import { MASCOT_POSES, RPS_PARTS, SECTION_IDS } from "@/lib/kurikulum-cms/schema";
import { cn } from "@/lib/utils";
import { getIn } from "./use-kartografer";
import { Field, Group, Lines, MediaField, Repeater, Segmented, Toggle } from "./fields";
import { Board } from "./jadwal";
import { TrackForkIllustration } from "./illustrations";

const POSE = { wave: "Melambai", "thumbs-up": "Jempol", confident: "Yakin", proud: "Bangga", think: "Berpikir", laugh: "Tertawa", run: "Berlari" };
const SECTION_LABEL = { bok: "Body of Knowledge", peta: "Peta studi", semester: "Buku semester", pilihan: "Pilihan", rps: "RPS" };
const GROUP_LABEL = { base: "Fondasi", pillar: "Pilar", core: "Inti", band: "Pita", peak: "Puncak" };
const COLOR_OPTS = Object.entries(RUMPUN_COLORS).map(([k, c]) => [k, c.label, c.css]);

/** Pengikat field ke path dokumen. */
function useBind(value, update) {
  return (path) => ({ path, value: getIn(value, path), onChange: (v) => update(path, v) });
}

function Intro({ kicker, title, children }) {
  return (
    <header className="mb-6 max-w-2xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-maroon">{kicker}</p>
      <h2 className="mt-1 font-serif text-[clamp(1.6rem,2.8vw,2.3rem)] leading-tight text-navy">{title}</h2>
      {children && <p className="mt-2 text-[14px] leading-relaxed text-text/60">{children}</p>}
    </header>
  );
}

function Mascot({ base, bind, update, value }) {
  const m = getIn(value, base) ?? {};
  return (
    <Group title="Maskot Elvo" note="Muncul di layar lebar">
      <Toggle label="Tampilkan maskot" checked={m.show} onChange={(v) => update(`${base}.show`, v)} />
      {m.show && (
        <>
          <Segmented label="Pose" options={MASCOT_POSES.map((p) => [p, POSE[p]])} value={m.pose} onChange={(v) => update(`${base}.pose`, v)} />
          <Field label="Ucapan" {...bind(`${base}.say`)} max={140} />
        </>
      )}
    </Group>
  );
}

/* ───────────── Pembuka ───────────── */
export function PembukaChapter({ value, update }) {
  const bind = useBind(value, update);
  return (
    <>
      <Intro kicker="Stasiun 01" title="Pembuka halaman">Tirai pembuka, judul hero, ringkasan angka, dan daftar isi bergaya buku.</Intro>
      <div className="grid gap-5 xl:grid-cols-2">
        <Group title="Judul & ajakan">
          <Lines label="Baris judul (baris ke-2 jadi aksen miring)" {...bind("hero.titleLines")} items={value.hero.titleLines} max={4} addLabel="Tambah baris judul" />
          <Field label="Lead" {...bind("hero.lead")} multiline max={400} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Tombol utama" {...bind("hero.ctaPrimary")} max={40} />
            <Field label="Tombol cari" {...bind("hero.ctaSearch")} max={40} />
            <Field label="Pintasan" {...bind("hero.kbd")} max={12} mono />
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
            <Field label="Angka tebal" {...bind("hero.statsStrong")} max={80} tokens={["sks"]} />
            <Field label="Lanjutan ringkasan" {...bind("hero.statsRest")} max={200} tokens={["wajib", "pilihan"]} />
          </div>
        </Group>
        <div className="space-y-5">
          <Group title="Tirai pembuka" note="Sekali per sesi">
            <Toggle label="Tampilkan tirai" checked={value.curtain.enabled} onChange={(v) => update("curtain.enabled", v)} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Judul" {...bind("curtain.title")} max={40} />
              <Field label="Aksen" {...bind("curtain.accent")} max={40} />
              <Field label="Label pemuatan" {...bind("curtain.label")} max={60} />
            </div>
          </Group>
          <Group title="Breadcrumb">
            <Repeater
              items={value.hero.breadcrumb}
              onChange={(v) => update("hero.breadcrumb", v)}
              make={() => ({ label: "", href: "" })}
              max={5}
              addLabel="Tambah tautan"
              itemLabel={(x, i) => x.label || `Tingkat ${i + 1}`}
              render={(x, s) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Label" value={x.label} onChange={(v) => s({ label: v })} max={60} />
                  <Field label="Tautan (kosong = teks)" value={x.href} onChange={(v) => s({ href: v })} mono />
                </div>
              )}
            />
            <Field label="Halaman ini" {...bind("hero.current")} max={60} />
          </Group>
        </div>
        <Group title="Daftar isi" note="Token angka dihitung otomatis" className="xl:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Judul daftar isi" {...bind("hero.tocTitle")} max={40} />
            <Field label="Label aksesibilitas" {...bind("hero.tocAria")} max={80} />
          </div>
          <Repeater
            items={value.hero.toc}
            onChange={(v) => update("hero.toc", v)}
            make={() => ({ target: "bok", title: "", note: "", page: "" })}
            max={6}
            addLabel="Tambah bab"
            itemLabel={(x, i) => `${["I", "II", "III", "IV", "V", "VI"][i]} · ${x.title || "Bab baru"}`}
            render={(x, s) => (
              <div className="grid gap-3 lg:grid-cols-[auto_1fr_1fr_1fr]">
                <Segmented label="Menuju" options={SECTION_IDS.map((k) => [k, SECTION_LABEL[k]])} value={x.target} onChange={(v) => s({ target: v })} />
                <Field label="Judul bab" value={x.title} onChange={(v) => s({ title: v })} max={60} />
                <Field label="Catatan" value={x.note} onChange={(v) => s({ note: v })} max={80} />
                <Field label="Penanda kanan" value={x.page} onChange={(v) => s({ page: v })} max={40} tokens={["sks", "pilihan", "semester", "peminatan", "bagian"]} />
              </div>
            )}
          />
        </Group>
        <Mascot base="hero.mascot" bind={bind} update={update} value={value} />
      </div>
    </>
  );
}

/* ───────────── Rumpun ───────────── */
export function RumpunChapter({ value, update, usage }) {
  return (
    <>
      <Intro kicker="Stasiun 02" title="Rumpun mata kuliah">Tiap rumpun menjadi satu jalur warna di peta studi, titik di buku semester, dan sorotan di Konversi SKS.</Intro>
      <Repeater
        items={value.rumpun}
        onChange={(v) => update("rumpun", v)}
        make={() => ({ key: `rumpun-${Math.random().toString(36).slice(2, 6)}`, name: "", short: "", color: "navy", style: "solid" })}
        max={8}
        addLabel="Tambah rumpun"
        itemLabel={(x) => `${x.name || "Rumpun baru"} · ${usage[x.key] ?? 0} mata kuliah`}
        render={(x, s) => {
          const r = withColor(x);
          return (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem]">
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
                  <Field label="Nama" value={x.name} onChange={(v) => s({ name: v })} max={60} />
                  <Field label="Nama pendek" value={x.short} onChange={(v) => s({ short: v })} max={30} />
                  <Field label="Kunci" value={x.key} onChange={(v) => s({ key: slugify(v) })} max={48} mono hint={usage[x.key] ? "Dipakai mata kuliah" : undefined} />
                </div>
                <Segmented label="Warna" options={COLOR_OPTS} value={x.color} onChange={(v) => s({ color: v })} />
                <Segmented label="Gaya titik" options={[["solid", "Penuh"], ["ring", "Cincin"]]} value={x.style} onChange={(v) => s({ style: v })} />
              </div>
              <div aria-hidden className="flex flex-col justify-center gap-3 rounded-lg bg-cream-2/70 p-4">
                <svg viewBox="0 0 200 28" className="w-full">
                  <line x1="8" y1="14" x2="192" y2="14" stroke={r.css} strokeWidth="6" strokeLinecap="round" strokeDasharray={r.dash ?? undefined} />
                  {[40, 100, 160].map((cx) => (
                    <circle key={cx} cx={cx} cy="14" r="9" fill={r.style === "ring" ? "white" : r.css} stroke={r.style === "ring" ? r.css : "none"} strokeWidth="2" />
                  ))}
                </svg>
                <span className="inline-flex items-center gap-2 text-[12.5px] text-navy">
                  <span className="size-2 rounded-full" style={r.style === "ring" ? { border: `2px solid ${r.css}`, background: "white" } : { background: r.css }} />
                  {x.short || x.name || "Pratinjau"}
                </span>
              </div>
            </div>
          );
        }}
      />
    </>
  );
}

/* ───────────── Body of Knowledge ───────────── */
export function BokChapter({ value, update, openPicker, usage }) {
  const bind = useBind(value, update);
  const blocks = value.bok.blocks ?? [];
  return (
    <>
      <Intro kicker="Stasiun 03" title="Body of Knowledge">Blok disusun otomatis per grup: fondasi di bawah, inti, pita manajemen, lalu puncak peminatan dengan panah emas. Pilar mengapit di kiri dan kanan.</Intro>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Group title="Blok bangunan" note={`${blocks.length} blok`}>
          <Repeater
            items={blocks}
            onChange={(v) => update("bok.blocks", v)}
            make={() => ({ key: `blok-${Math.random().toString(36).slice(2, 6)}`, group: "core", name: "" })}
            max={20}
            addLabel="Tambah blok"
            itemLabel={(x) => `${x.name || "Blok baru"} · ${usage[x.key] ?? 0} mk`}
            render={(x, s, i) => (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
                  <Field label="Nama blok" value={x.name} onChange={(v) => s({ name: v })} max={80} />
                  <Field label="Kunci" value={x.key} onChange={(v) => s({ key: slugify(v) })} max={48} mono />
                </div>
                <Segmented label="Grup" options={BOK_GROUPS.map((g) => [g, GROUP_LABEL[g]])} value={x.group} onChange={(v) => s({ group: v })} />
                {x.group === "peak" && <MediaField label="Ilustrasi Lottie (opsional)" value={x.lottie} onPick={() => openPicker("lottie", `bok.blocks.${i}.lottie`)} onClear={() => s({ lottie: "" })} />}
              </div>
            )}
          />
        </Group>
        <div className="space-y-5">
          <Group title="Susunan sekarang" note="Pratinjau tata letak">
            <BokSketch blocks={blocks} />
          </Group>
          <Group title="Teks bagian">
            <Lines label="Judul (baris ke-2 aksen)" {...bind("bok.title")} items={value.bok.title} max={3} />
            <Field label="Pengantar" {...bind("bok.body")} multiline max={400} />
            <div className="grid gap-3 sm:grid-cols-2">
              {BOK_GROUPS.map((g) => (
                <Field key={g} label={`Label grup ${GROUP_LABEL[g].toLowerCase()}`} {...bind(`bok.groupLabels.${g}`)} max={40} />
              ))}
            </div>
            <Field label="Jumlah mata kuliah" {...bind("bok.countLabel")} max={80} tokens={["n"]} />
            <Field label="Blok kosong" {...bind("bok.emptyLabel")} max={80} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Penanda semester" {...bind("bok.semesterShort")} max={30} tokens={["n"]} />
              <Field label="Penanda pilihan" {...bind("bok.electiveShort")} max={30} />
            </div>
            <Field label="Label aksesibilitas diagram" {...bind("bok.diagramAria")} max={80} />
            <Toggle label="Tampilkan catatan pemetaan usulan" checked={value.bok.showSuggestedNote} onChange={(v) => update("bok.showSuggestedNote", v)} />
            {value.bok.showSuggestedNote && <Field label="Catatan" {...bind("bok.suggestedNote")} max={160} />}
          </Group>
        </div>
      </div>
    </>
  );
}

function BokSketch({ blocks }) {
  const of = (g) => blocks.filter((b) => b.group === g);
  const pill = (b, cls) => (
    <span key={b.key} className={cn("block truncate rounded px-2 py-1.5 text-center text-[10.5px] font-semibold", cls)}>
      {b.name || "…"}
    </span>
  );
  const pillars = of("pillar");
  return (
    <div className="kf-sketch rounded-lg bg-[linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] bg-[size:14px_14px] p-3">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(of("peak").length, 1)}, minmax(0,1fr))` }}>
        {of("peak").map((b) => pill(b, "bg-maroon text-white"))}
      </div>
      {of("peak").length > 0 && <p aria-hidden className="py-0.5 text-center text-gold">↑ ↑ ↑</p>}
      <div className="grid gap-1" style={{ gridTemplateColumns: [pillars[0] && "2.5rem", "1fr", pillars[1] && "2.5rem"].filter(Boolean).join(" ") }}>
        {pillars[0] && <span className="grid place-items-center rounded bg-cream-2 text-[9px] font-semibold text-navy [writing-mode:vertical-rl]">{pillars[0].name}</span>}
        <div className="space-y-1">
          {of("band").map((b, i) => pill(b, i % 2 ? "bg-navy-deep text-white" : "bg-navy text-white"))}
          <div className="grid grid-cols-2 gap-1">{of("core").map((b) => pill(b, "border border-navy/20 bg-white text-navy"))}</div>
          {of("base").map((b) => pill(b, "bg-gold text-navy"))}
        </div>
        {pillars[1] && <span className="grid place-items-center rounded bg-cream-2 text-[9px] font-semibold text-navy [writing-mode:vertical-rl]">{pillars[1].name}</span>}
      </div>
    </div>
  );
}

/* ───────────── Peta studi ───────────── */
export function PetaChapter({ value, update }) {
  const bind = useBind(value, update);
  return (
    <>
      <Intro kicker="Stasiun 04" title="Peta studi">Jalur dan stasiun dihitung dari rumpun dan jadwal semester. Di sini hanya kata-katanya.</Intro>
      <div className="grid gap-5 xl:grid-cols-2">
        <Group title="Pengantar">
          <Lines label="Judul (baris ke-2 aksen)" {...bind("peta.title")} items={value.peta.title} max={3} />
          <Field label="Pengantar" {...bind("peta.body")} multiline max={400} />
          <Field label="Label aksesibilitas chip rumpun" {...bind("peta.chipsAria")} max={80} />
        </Group>
        <Group title="Label stasiun">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nama stasiun" {...bind("peta.station")} max={40} tokens={["n"]} />
            <Field label="SKS stasiun" {...bind("peta.sks")} max={30} tokens={["n"]} />
          </div>
          <Field label="Panel stasiun terdekat" {...bind("peta.panel")} max={120} tokens={["n", "count"]} />
          <Field label="Tambahan slot pilihan" {...bind("peta.panelSlots")} max={60} tokens={["n"]} />
          <Field label="Tombol buka semester" {...bind("peta.open")} max={60} tokens={["n"]} />
          <Field label="Label aksesibilitas stasiun" {...bind("peta.stationAria")} max={160} tokens={["n", "sks", "count"]} />
        </Group>
      </div>
    </>
  );
}

/* ───────────── Jadwal semester ───────────── */
export function SemesterChapter({ value, update, rumpunByKey, board }) {
  const bind = useBind(value, update);
  const [copyOpen, setCopyOpen] = useState(false);
  const list = value.semester.list ?? [];
  const lanes = list.map((s, i) => ({ path: `semester.list.${i}.courses`, number: String(s.semester).padStart(2, "0"), title: `Semester ${s.semester}`, allowSlot: true, index: i }));
  const total = list.reduce((t, s) => t + (s.courses ?? []).reduce((a, c) => a + (c.sks ?? 0), 0), 0);
  return (
    <>
      <Intro kicker="Stasiun 05" title="Papan jadwal semester">
        Seret karcis antar semester untuk memindahkan mata kuliah. Klik karcis untuk membuka Lembar RPS-nya. Total saat ini <b className="text-navy">{total} SKS</b>.
      </Intro>
      <Board
        value={value}
        lanes={lanes}
        rumpunByKey={rumpunByKey}
        update={update}
        emptyText="Belum ada mata kuliah. Tambahkan karcis pertama atau seret dari semester lain."
        laneActions={(lane) => (
          <div className="flex items-center gap-1 sm:mt-2">
            <label className="sr-only" htmlFor={`smt-${lane.index}`}>Nomor semester</label>
            <input id={`smt-${lane.index}`} type="number" min={1} max={14} value={list[lane.index].semester} onChange={(e) => update(`semester.list.${lane.index}.semester`, Number(e.target.value) || 1)} className="w-12 rounded border border-navy/12 bg-white px-1.5 py-1 text-center text-[12px] tabular-nums text-navy" />
            <button type="button" onClick={() => board.removeSemester(lane.index)} aria-label={`Hapus ${lane.title}`} className="rounded px-1.5 py-1 text-[12px] text-maroon/70 hover:bg-maroon/10 hover:text-maroon">
              Hapus
            </button>
          </div>
        )}
        {...board}
      />
      <button type="button" onClick={board.addSemester} className="mt-3 w-full rounded-2xl border-2 border-dashed border-navy/15 py-4 text-[13.5px] font-semibold text-navy/60 transition-colors hover:border-maroon hover:text-maroon">
        + Tambah semester {Math.max(0, ...list.map((s) => s.semester)) + 1}
      </button>

      <div className="mt-8">
        <button type="button" onClick={() => setCopyOpen((o) => !o)} aria-expanded={copyOpen} className="flex w-full items-center justify-between rounded-xl border border-navy/10 bg-white/70 px-5 py-3.5 text-left">
          <span className="font-serif text-lg text-navy">Teks buku semester & status RPS</span>
          <span aria-hidden className={cn("grid size-7 place-items-center rounded-full border border-navy/15 transition-transform duration-300", copyOpen && "rotate-45 border-maroon text-maroon")}>+</span>
        </button>
        <div className={cn("grid transition-[grid-template-rows] duration-500 ease-cinematic", copyOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            <div className="grid gap-5 pt-4 xl:grid-cols-2">
              <Group title="Buku semester">
                <Lines label="Judul (baris ke-2 aksen)" {...bind("semester.title")} items={value.semester.title} max={3} />
                <Field label="Jumlah mata kuliah" {...bind("semester.courseCount")} max={40} tokens={["n"]} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Sebelumnya" {...bind("semester.prev")} max={30} />
                  <Field label="Petunjuk" {...bind("semester.hint")} max={60} />
                  <Field label="Berikutnya" {...bind("semester.next")} max={30} />
                </div>
                <Field label="Label kumulatif" {...bind("semester.cumulative")} max={80} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Aksesibilitas tab" {...bind("semester.tabsAria")} max={60} />
                  <Field label="Aksesibilitas daftar" {...bind("semester.listAria")} max={80} tokens={["n"]} />
                  <Field label="Aksesibilitas rumpun" {...bind("semester.rumpunAria")} max={60} />
                </div>
              </Group>
              <Group title="Slot & status">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Ganti kata “Elective” jadi" {...bind("semester.slotPrefix")} max={30} />
                  <Field label="Tautan slot" {...bind("semester.slotLink")} max={30} />
                </div>
                <Field label="Keterangan slot" {...bind("semester.slotNote")} max={160} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Tanpa RPS" {...bind("semester.rpsNone")} max={30} />
                  <Field label="Ada RPS" {...bind("semester.rpsReady")} max={30} />
                  <Field label="RPS + PDF" {...bind("semester.rpsPdf")} max={30} />
                </div>
              </Group>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ───────────── Bidang pilihan ───────────── */
export function PilihanChapter({ value, update, rumpun, rumpunByKey, openPicker, board }) {
  const bind = useBind(value, update);
  const tracks = value.pilihan.tracks ?? [];
  const lanes = tracks.map((t, i) => ({ path: `pilihan.tracks.${i}.courses`, number: String(i + 1).padStart(2, "0"), title: t.name || `Bidang ${i + 1}`, allowSlot: false }));
  return (
    <>
      <Intro kicker="Stasiun 06" title="Bidang pilihan">Setiap bidang adalah satu panel akordeon di halaman publik. Mata kuliahnya bisa diseret antar bidang.</Intro>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-5">
          <Group title="Pengantar">
            <Lines label="Judul (baris ke-2 aksen)" {...bind("pilihan.title")} items={value.pilihan.title} max={3} />
            <Field label="Pengantar" {...bind("pilihan.body")} multiline max={400} />
            <Field label="Label ilustrasi" {...bind("pilihan.illustrationAria")} max={80} tokens={["name"]} />
          </Group>
          <Group title="Identitas bidang" note={`${tracks.length} bidang`}>
            {!tracks.length && (
              <div className="flex items-center gap-4">
                <TrackForkIllustration className="h-16 w-32" />
                <p className="text-[13px] text-text/55">Belum ada bidang pilihan.</p>
              </div>
            )}
            <Repeater
              items={tracks}
              onChange={(v) => update("pilihan.tracks", v)}
              make={() => ({ key: `bidang-${Math.random().toString(36).slice(2, 6)}`, name: "", short: "", rumpun: rumpun[0]?.key, lottie: "", lead: "", courses: [] })}
              max={6}
              addLabel="Tambah bidang"
              itemLabel={(x, i) => `${String(i + 1).padStart(2, "0")} · ${x.name || "Bidang baru"}`}
              render={(x, s, i) => (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
                    <Field label="Nama" value={x.name} onChange={(v) => s({ name: v })} max={80} />
                    <Field label="Nama pendek" value={x.short} onChange={(v) => s({ short: v })} max={40} />
                    <Field label="Kunci" value={x.key} onChange={(v) => s({ key: slugify(v) })} max={48} mono />
                  </div>
                  <Field label="Lead" value={x.lead} onChange={(v) => s({ lead: v })} multiline rows={2} max={300} />
                  <Segmented label="Rumpun bawaan mata kuliahnya" options={rumpun.map((r) => [r.key, r.short || r.name, r.css])} value={x.rumpun} onChange={(v) => s({ rumpun: v })} />
                  <MediaField label="Ilustrasi Lottie" value={x.lottie} onPick={() => openPicker("lottie", `pilihan.tracks.${i}.lottie`)} onClear={() => s({ lottie: "" })} />
                </div>
              )}
            />
          </Group>
        </div>
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/55">Mata kuliah per bidang</p>
          <Board value={value} lanes={lanes} rumpunByKey={rumpunByKey} update={update} emptyText="Bidang ini belum punya mata kuliah." {...board} />
        </div>
      </div>
    </>
  );
}

/* ───────────── Cara membaca RPS ───────────── */
export function RpsChapter({ value, update, openPicker }) {
  const bind = useBind(value, update);
  const t = value.rps.template;
  const T = (k) => `rps.template.${k}`;
  return (
    <>
      <Intro kicker="Stasiun 07" title="Cara membaca RPS">Enam bagian penjelasan dan templat dokumen RPS. Teks templat tampil miring di halaman publik sebagai petunjuk pengisian.</Intro>
      <div className="grid gap-5 xl:grid-cols-2">
        <Group title="Pengantar & banner">
          <Lines label="Judul (baris ke-2 aksen)" {...bind("rps.title")} items={value.rps.title} max={3} />
          <Field label="Pengantar" {...bind("rps.body")} multiline max={400} />
          <Toggle label="Tampilkan banner" hint="Pengunjung bisa menutupnya per sesi" checked={value.rps.banner.show} onChange={(v) => update("rps.banner.show", v)} />
          {value.rps.banner.show && (
            <>
              <Field label="Judul banner" {...bind("rps.banner.title")} max={120} />
              <Field label="Isi banner" {...bind("rps.banner.body")} multiline rows={2} max={300} />
            </>
          )}
          <Field label="Jumlah RPS tersedia" {...bind("rps.ready")} max={160} tokens={["n", "total"]} />
          <Field label="Tautan cari RPS lain" {...bind("rps.more")} max={60} />
        </Group>
        <Group title="Enam bagian" note="Urutan mengikuti dokumen">
          <Repeater
            fixed
            items={value.rps.parts}
            onChange={(v) => update("rps.parts", v)}
            itemLabel={(x, i) => `${i + 1} · ${x.title || RPS_PARTS[i]}`}
            render={(x, s) => (
              <div className="space-y-3">
                <Field label="Judul" value={x.title} onChange={(v) => s({ title: v })} max={60} />
                <Field label="Penjelasan" value={x.body} onChange={(v) => s({ body: v })} multiline rows={2} max={300} />
              </div>
            )}
          />
        </Group>
        <Group title="Kop dokumen">
          <Lines label="Baris kop" {...bind("rps.header")} items={value.rps.header} max={6} />
          <MediaField label="Logo" kind="image" value={value.rps.logo} onPick={() => openPicker("image", "rps.logo")} onClear={() => update("rps.logo", "")} />
          <Field label="Teks alternatif logo" {...bind("rps.logoAlt")} max={120} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Keterangan" {...bind("rps.captionLead")} max={80} />
            <Field label="Keterangan tebal" {...bind("rps.captionStrong")} max={120} />
            <Field label="Catatan miring" {...bind("rps.captionNote")} max={120} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Aksesibilitas lembar" {...bind("rps.paperAria")} max={60} />
            <Field label="Aksesibilitas nomor" {...bind("rps.badgeAria")} max={60} tokens={["title"]} />
          </div>
        </Group>
        <Group title="Templat: identitas & deskripsi">
          <Repeater items={t.identity} onChange={(v) => update(T("identity"), v)} make={() => ({ label: "", value: "" })} max={10} addLabel="Tambah baris identitas" itemLabel={(x, i) => x.label || `Baris ${i + 1}`} render={(x, s) => <Pair x={x} s={s} a="label" b="value" la="Kolom" lb="Petunjuk" />} />
          <Field label="Label deskripsi" {...bind(T("deskripsiLabel"))} max={60} />
          <Field label="Petunjuk deskripsi" {...bind(T("deskripsi"))} multiline max={1200} />
        </Group>
        <Group title="Templat: capaian">
          <Repeater
            items={t.capaian}
            onChange={(v) => update(T("capaian"), v)}
            make={() => ({ label: "", items: [{ kode: "", bobot: "", teks: "" }] })}
            max={4}
            addLabel="Tambah kelompok capaian"
            itemLabel={(x, i) => x.label || `Kelompok ${i + 1}`}
            render={(x, s) => (
              <div className="space-y-3">
                <Field label="Label kelompok" value={x.label} onChange={(v) => s({ label: v })} max={80} />
                <Repeater
                  items={x.items}
                  onChange={(v) => s({ items: v })}
                  make={() => ({ kode: "", bobot: "", teks: "" })}
                  max={6}
                  addLabel="Tambah baris"
                  itemLabel={(y, j) => y.kode || `Baris ${j + 1}`}
                  render={(y, sy) => (
                    <div className="grid gap-3 sm:grid-cols-[8rem_5rem_minmax(0,1fr)]">
                      <Field label="Kode" value={y.kode} onChange={(v) => sy({ kode: v })} max={40} mono />
                      <Field label="Bobot" value={y.bobot} onChange={(v) => sy({ bobot: v })} max={20} />
                      <Field label="Petunjuk" value={y.teks} onChange={(v) => sy({ teks: v })} max={400} />
                    </div>
                  )}
                />
              </div>
            )}
          />
        </Group>
        <Group title="Templat: kajian & pustaka">
          <Field label="Label bahan kajian" {...bind(T("kajianLabel"))} max={60} />
          <Lines label="Petunjuk bahan kajian" {...bind(T("kajian"))} items={t.kajian} max={8} />
          <Field label="Label pustaka" {...bind(T("pustakaLabel"))} max={60} />
          <Repeater items={t.pustaka} onChange={(v) => update(T("pustaka"), v)} make={() => ({ label: "", items: [""] })} max={3} addLabel="Tambah kelompok pustaka" itemLabel={(x, i) => x.label || `Kelompok ${i + 1}`} render={(x, s) => (
            <div className="space-y-3">
              <Field label="Label" value={x.label} onChange={(v) => s({ label: v })} max={40} />
              <Lines label="Petunjuk" items={x.items} onChange={(v) => s({ items: v })} max={6} />
            </div>
          )} />
        </Group>
        <Group title="Templat: rencana mingguan" className="xl:col-span-2">
          <Lines label="Judul kolom" {...bind(T("mingguHeaders"))} items={t.mingguHeaders} max={6} />
          <Repeater
            items={t.minggu}
            onChange={(v) => update(T("minggu"), v)}
            make={() => ({ n: "…", ujian: false, subcpmk: "", judul: "", materi: "", metode: "", penilaian: "", bobot: "" })}
            max={10}
            addLabel="Tambah baris contoh"
            itemLabel={(x) => `Minggu ${x.n || "?"}${x.ujian ? " · ujian" : ""}`}
            render={(x, s) => (
              <div className="grid gap-3 md:grid-cols-4">
                <Field label="Minggu ke-" value={x.n} onChange={(v) => s({ n: v })} max={8} />
                <Field label="Sub-CPMK" value={x.subcpmk} onChange={(v) => s({ subcpmk: v })} max={60} />
                <Field label="Judul" value={x.judul} onChange={(v) => s({ judul: v })} max={120} />
                <Field label="Bobot" value={x.bobot} onChange={(v) => s({ bobot: v })} max={20} />
                <Field label="Materi" value={x.materi} onChange={(v) => s({ materi: v })} max={400} className="md:col-span-2" />
                <Field label="Metode" value={x.metode} onChange={(v) => s({ metode: v })} max={400} />
                <Field label="Penilaian" value={x.penilaian} onChange={(v) => s({ penilaian: v })} max={400} />
                <Toggle label="Baris ujian (latar emas)" checked={x.ujian} onChange={(v) => s({ ujian: v })} />
              </div>
            )}
          />
        </Group>
        <Group title="Templat: rekap penilaian" className="xl:col-span-2">
          <Lines label="Judul kolom" {...bind(T("nilaiHeaders"))} items={t.nilaiHeaders} max={5} />
          <Repeater items={t.nilai} onChange={(v) => update(T("nilai"), v)} make={() => ({ label: "", rencana: "", bobot: "", cpmk: "" })} max={8} addLabel="Tambah komponen" itemLabel={(x, i) => x.label || `Komponen ${i + 1}`} render={(x, s) => (
            <div className="grid gap-3 md:grid-cols-4">
              <Field label="Komponen" value={x.label} onChange={(v) => s({ label: v })} max={80} />
              <Field label="Rencana" value={x.rencana} onChange={(v) => s({ rencana: v })} max={400} />
              <Field label="Bobot" value={x.bobot} onChange={(v) => s({ bobot: v })} max={20} />
              <Field label="CPMK" value={x.cpmk} onChange={(v) => s({ cpmk: v })} max={80} />
            </div>
          )} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Label total" {...bind(T("totalLabel"))} max={30} />
            <Field label="Nilai total" {...bind(T("totalValue"))} max={10} />
          </div>
        </Group>
      </div>
    </>
  );
}

function Pair({ x, s, a, b, la, lb }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label={la} value={x[a]} onChange={(v) => s({ [a]: v })} max={60} />
      <Field label={lb} value={x[b]} onChange={(v) => s({ [b]: v })} max={400} />
    </div>
  );
}

/* ───────────── Penutup ───────────── */
export function PenutupChapter({ value, update }) {
  const bind = useBind(value, update);
  return (
    <>
      <Intro kicker="Stasiun 08" title="Penutup">Ajakan terakhir dan catatan kaki bernomor menuju halaman terkait.</Intro>
      <div className="grid gap-5 xl:grid-cols-2">
        <Group title="Ajakan">
          <Field label="Pertanyaan" {...bind("penutup.question")} max={160} />
          <Field label="Tombol" {...bind("penutup.button")} max={40} />
        </Group>
        <Mascot base="penutup.mascot" bind={bind} update={update} value={value} />
        <Group title="Catatan kaki" className="xl:col-span-2">
          <Repeater
            items={value.penutup.notes}
            onChange={(v) => update("penutup.notes", v)}
            make={() => ({ href: "/", title: "", body: "" })}
            max={6}
            addLabel="Tambah catatan"
            itemLabel={(x, i) => `${i + 1} · ${x.title || "Catatan baru"}`}
            render={(x, s) => (
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_2fr]">
                <Field label="Tautan" value={x.href} onChange={(v) => s({ href: v })} mono />
                <Field label="Judul" value={x.title} onChange={(v) => s({ title: v })} max={60} />
                <Field label="Keterangan" value={x.body} onChange={(v) => s({ body: v })} max={160} />
              </div>
            )}
          />
        </Group>
      </div>
    </>
  );
}

/* ───────────── Pencarian ───────────── */
export function CariChapter({ value, update, openPicker }) {
  const bind = useBind(value, update);
  return (
    <>
      <Intro kicker="Stasiun 09" title="Palet pencarian">Jendela cari yang terbuka lewat tombol, Ctrl K, atau tombol garis miring.</Intro>
      <div className="grid gap-5 xl:grid-cols-2">
        <Group title="Kolom cari">
          <Field label="Judul (pembaca layar)" {...bind("cari.title")} max={60} />
          <Field label="Keterangan (pembaca layar)" {...bind("cari.description")} max={160} />
          <Field label="Placeholder" {...bind("cari.placeholder")} max={80} />
          <Field label="Label saat kosong" {...bind("cari.readyLabel")} max={80} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Grup semester" {...bind("cari.semesterGroup")} max={40} tokens={["n"]} />
            <Field label="Grup pilihan" {...bind("cari.electiveGroup")} max={40} />
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="Navigasi" {...bind("cari.hintNav")} max={30} />
            <Field label="Buka" {...bind("cari.hintOpen")} max={30} />
            <Field label="Jumlah" {...bind("cari.count")} max={40} tokens={["n"]} />
            <Field label="Tanda RPS" {...bind("cari.rpsTag")} max={12} />
          </div>
        </Group>
        <Group title="Hasil kosong">
          <MediaField label="Ilustrasi Lottie" value={value.cari.emptyLottie} onPick={() => openPicker("lottie", "cari.emptyLottie")} onClear={() => update("cari.emptyLottie", "")} />
          <Field label="Judul" {...bind("cari.emptyTitle")} max={120} tokens={["q"]} />
          <Field label="Awalan saran" {...bind("cari.tryLabel")} max={20} />
          <Lines label="Kata kunci saran" {...bind("cari.suggestions")} items={value.cari.suggestions} max={8} addLabel="Tambah saran" />
        </Group>
      </div>
    </>
  );
}

/* ───────────── Laci RPS ───────────── */
const LACI = [
  ["Kepala laci", [["wajib", "Label wajib"], ["pilihan", "Label pilihan"], ["semester", "Semester", ["n"]], ["srDescription", "Deskripsi pembaca layar", ["nama"]], ["close", "Tombol tutup"]]],
  ["Identitas", [["kode", "Kode"], ["sks", "SKS"], ["koordinator", "Koordinator"], ["pengampu", "Pengampu"], ["disusun", "Disusun"], ["prasyarat", "Prasyarat"], ["pending", "Belum ada (mis. menyusul)"]]],
  ["Ringkasan", [["deskripsi", "Deskripsi"], ["cpl", "CPL"], ["cpmk", "CPMK"], ["subcpmk", "Sub-CPMK", ["n"]], ["kajian", "Bahan kajian"]]],
  ["16 minggu & penilaian", [["week", "Minggu", ["n"]], ["weekPending", "Topik kosong"], ["weeksAria", "Aksesibilitas pita"], ["metode", "Metode"], ["penilaian", "Penilaian"], ["total", "Total"], ["weekHint", "Petunjuk"]]],
  ["Pustaka & kaki laci", [["pustakaUtama", "Pustaka utama"], ["pustakaPendukung", "Pustaka pendukung"], ["prevAria", "Sebelumnya"], ["nextAria", "Berikutnya"], ["download", "Unduh"], ["downloadPdf", "Unduh PDF"]]],
  ["Notifikasi unduh", [["toastOpen", "Membuka PDF"], ["toastMissing", "PDF belum ada"], ["toastMissingBody", "Keterangan PDF belum ada"]]],
];

export function LaciChapter({ value, update, openPicker }) {
  const bind = useBind(value, update);
  return (
    <>
      <Intro kicker="Stasiun 10" title="Laci RPS">Panel kanan yang terbuka ketika pengunjung memilih mata kuliah. Isi RPS-nya diatur dari karcis di papan jadwal.</Intro>
      <div className="grid gap-5 xl:grid-cols-2">
        <Group title="Nama tab">
          <div className="grid gap-3 sm:grid-cols-4">
            {["ringkasan", "minggu", "nilai", "pustaka"].map((k) => (
              <Field key={k} label={k} {...bind(`laci.tabs.${k}`)} max={30} />
            ))}
          </div>
        </Group>
        <Group title="RPS belum ada">
          <MediaField label="Ilustrasi Lottie" value={value.laci.emptyLottie} onPick={() => openPicker("lottie", "laci.emptyLottie")} onClear={() => update("laci.emptyLottie", "")} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Judul" {...bind("laci.emptyTitle")} max={80} />
            <Field label="Label ilustrasi" {...bind("laci.emptyAria")} max={80} />
          </div>
          <Field label="Isi" {...bind("laci.emptyBody")} multiline rows={2} max={300} />
        </Group>
        {LACI.map(([title, fields]) => (
          <Group key={title} title={title}>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map(([k, label, tokens]) => (
                <Field key={k} label={label} {...bind(`laci.${k}`)} max={k.endsWith("Body") || k === "weekHint" ? 200 : 80} tokens={tokens} />
              ))}
            </div>
          </Group>
        ))}
      </div>
    </>
  );
}

/* ───────────── Meta ───────────── */
export function SeoChapter({ value, update }) {
  const bind = useBind(value, update);
  return (
    <>
      <Intro kicker="Stasiun 11" title="Meta mesin pencari">Judul tab dan cuplikan hasil pencarian.</Intro>
      <div className="grid gap-5 xl:grid-cols-2">
        <Group title="Isi meta">
          <Field label="Judul" {...bind("seo.title")} max={90} />
          <Field label="Deskripsi" {...bind("seo.description")} multiline rows={3} max={220} />
        </Group>
        <Group title="Cuplikan">
          <div className="rounded-lg bg-white p-4 ring-1 ring-navy/10">
            <p className="text-[12px] text-success">sisfor.uisi.ac.id › curiculum</p>
            <p className="mt-1 text-[17px] leading-snug text-navy hover:underline">{value.seo.title || "—"}</p>
            <p className="mt-1 line-clamp-2 text-[13px] text-text/65">{value.seo.description || "—"}</p>
          </div>
          <p className="text-[12px] text-text/50">
            {value.seo.title?.length ?? 0} karakter judul · {value.seo.description?.length ?? 0} karakter deskripsi
          </p>
        </Group>
      </div>
    </>
  );
}

