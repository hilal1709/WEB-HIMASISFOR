"use client";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COPY } from "@/lib/konversi-cms/copy";
import { POSES } from "@/lib/konversi-cms/schema";
import { cn } from "@/lib/utils";

const control = "min-h-10 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-navy outline-none focus-visible:ring-2 focus-visible:ring-maroon/45";
const groupNames = {
  hero: "Judul, navigasi dan papan", notice: "Pesan banner", calculator: "Judul, kontrol dan hasil", receipt: "Struk",
  steps: "Judul dan label alur", examples: "Judul dan tabel transkrip", closing: "Judul, ajakan dan ilustrasi", course: "Modal mata kuliah",
  document: "Modal templat", feedback: "Loading, toast dan konfirmasi",
};

export function move(items, index, delta) {
  const to = index + delta;
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}

const labels = {
  title: "Judul utama", accent: "Lanjutan judul", body: "Isi paragraf", illustration: "Aset Lottie", illustrationAlt: "Teks alternatif ilustrasi",
  pose: "Pose Elvo", mascot: "Ucapan Elvo", contactHref: "URL koordinator", syllabusHref: "URL RPS", homeHref: "URL beranda",
  home: "Nama tautan beranda", parent: "Nama induk navigasi", current: "Nama halaman di navigasi", breadcrumb: "Nama navigasi untuk pembaca layar",
  calculate: "Teks CTA utama", calculateHref: "URL CTA utama", steps: "Teks CTA kedua", stepsHref: "URL CTA kedua",
  board: "Judul papan", formulaStart: "Awal rumus", formula: "Isi rumus",
  formulaCap: "Keterangan batas pada papan", boardLabel: "Nama daftar pada papan", activity: "Label kegiatan", duration: "Label durasi",
  credits: "Singkatan satuan kredit", hoursShort: "Durasi ringkas di papan", transferShort: "SKS transfer ringkas di papan", hoursLong: "Durasi untuk pembaca layar",
  transferLong: "SKS asal untuk pembaca layar", boardRow: "Keterangan baris papan", paused: "Petunjuk saat papan dijeda", pause: "Petunjuk menjeda papan",
  calendar: "Tombol kalender", dismiss: "Nama tombol tutup banner", saved: "Label status tersimpan", savedBody: "Rincian status tersimpan",
  unavailable: "Judul saat aksi belum tersedia", unavailableBody: "Rincian saat aksi belum tersedia",
  bodyHours: "Petunjuk mode jam", bodyTransfer: "Petunjuk mode transfer", activities: "Judul pilihan kegiatan", activityLabel: "Nama grup pilihan untuk pembaca layar",
  transfer: "Label kredit asal", weeks: "Label input durasi", weeksUnit: "Satuan durasi", hours: "Label jam kegiatan", hoursUnit: "Satuan jam",
  inputSks: "Label input transfer", transferHint: "Petunjuk rasio transfer", decrement: "Nama tombol kurang", increment: "Nama tombol tambah", drag: "Petunjuk seret",
  rate: "Label nilai tukar", minutesUnit: "Satuan nilai tukar", transferUnit: "Satuan kredit asal", rateWeeks: "Keterangan minggu pada nilai tukar",
  result: "Label hasil konversi", resultHours: "Keterangan hasil kegiatan", resultTransfer: "Keterangan transfer setara", resultRatio: "Keterangan hasil rasio transfer",
  cap: "Label batas semester", overTitle: "Judul banner kelebihan SKS", overBody: "Isi banner kelebihan SKS", ruleLink: "Teks tautan regulasi", ruleHref: "URL regulasi",
  replacements: "Judul kelompok pengganti", used: "Label kredit yang sudah dialokasikan", from: "Penghubung nilai alokasi", usedLabel: "Alokasi untuk pembaca layar",
  autofill: "Tombol pemilihan otomatis", semester: "Format semester", elective: "Label jenis mata kuliah pilihan",
  removeCourse: "Nama tombol keluarkan mata kuliah", addCourse: "Nama tombol tambah mata kuliah", less: "Tombol ringkas daftar", more: "Tombol perluas daftar",
  mobileSummary: "Ringkasan di bilah ponsel", mobileOpen: "Tombol struk di ponsel", mobileTitle: "Judul panel struk", mobileDescription: "Deskripsi panel struk",
  noPrograms: "Pesan kegiatan kosong", noCourses: "Pesan mata kuliah kosong", calculating: "Pengumuman saat menghitung",
  brand: "Nama institusi pada lembar", durationValue: "Format nilai durasi", hoursValue: "Format jumlah jam", rateValue: "Format nilai kurs",
  capValue: "Format batas semester", zero: "Pesan untuk estimasi nol", empty: "Pesan saat data kosong", remove: "Tombol keluarkan pilihan",
  remaining: "Label kredit tersisa", save: "Tombol simpan", unsaved: "Status simulasi belum tersimpan", reset: "Tombol reset",
  items: "Nama daftar tahap", who: "Label pihak yang terlibat", output: "Label keluaran tahap", when: "Label waktu tahap",
  template: "Tombol buka templat", scroll: "Petunjuk berpindah tahap", previous: "Nama tombol kembali", next: "Nama tombol lanjut",
  tabs: "Nama grup contoh", try: "Tombol terapkan contoh", before: "Label sisi awal", after: "Label sisi hasil", record: "Judul lembar transkrip",
  term: "Nama periode pada lembar", school: "Nama program studi pada lembar", course: "Judul kolom mata kuliah", grade: "Judul kolom nilai",
  note: "Judul kolom catatan", converted: "Keterangan hasil pada baris", waiting: "Keterangan semester mendatang",
  notTaken: "Keterangan sebelum diambil", total: "Label jumlah kredit", stamp: "Teks cap pada lembar",
  compare: "Nama penggeser perbandingan", compareValue: "Nilai penggeser untuk pembaca layar",
  contact: "Tombol menuju koordinator", outcome: "Pengantar capaian mata kuliah", add: "Tombol pilih mata kuliah",
  insufficient: "Pesan saat kredit kurang", syllabus: "Teks tautan RPS", partner: "Label pihak mitra",
  hasCourses: "Petunjuk templat yang sudah terisi", pages: "Format jumlah halaman", outline: "Pengantar daftar isian",
  download: "Tombol unduh", loading: "Status pemeriksaan berkas", opened: "Judul toast saat berkas terbuka", failed: "Judul toast galat",
  failedBody: "Rincian galat", example: "Penanda data contoh", close: "Nama tombol tutup dialog", cancel: "Tombol batal",
  shrank: "Judul toast penyesuaian pilihan", shrankBody: "Rincian penyesuaian pilihan", capBody: "Rincian toast batas semester",
  insufficientBody: "Rincian toast kredit kurang", autofillEmpty: "Judul toast pemilihan kosong", autofillBody: "Rincian pemilihan kosong",
  restored: "Judul toast simulasi dimuat", restoredBody: "Rincian simulasi dimuat", view: "Tombol di toast simulasi dimuat",
  previewSavedBody: "Rincian toast simpan saat pratinjau", undo: "Tombol urungkan penyimpanan", resetDone: "Judul toast reset selesai",
  caseApplied: "Judul toast contoh diterapkan", resetTitle: "Judul modal reset", resetBody: "Isi modal reset", resetConfirm: "Tombol konfirmasi reset",
  loaderKicker: "Label program studi pada animasi masuk", loaderTitle: "Judul animasi masuk",
  loaderAccent: "Lanjutan judul animasi masuk", loaderLabel: "Label aksesibel animasi masuk", routeLoading: "Label saat rute memuat",
};

const contextualLabels = {
  closing: { empty: "Paragraf saat belum ada simulasi" },
  course: { empty: "Pesan capaian mata kuliah kosong", insufficient: "Label tombol saat kredit kurang" },
  feedback: { cap: "Judul toast batas semester", insufficient: "Judul toast kredit kurang" },
  document: { noCourses: "Petunjuk templat yang belum terisi" },
};

function Field({ label, value, onChange, type = "text", options, hint, className }) {
  const id = useId();
  const props = { id, value: value ?? "", "aria-describedby": hint ? id + "-hint" : undefined,
    onChange: (event) => onChange(type === "number" && event.target.value !== "" ? Number(event.target.value) : event.target.value) };
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy">{label}</label>
      {options ? <select {...props} className={control}>{value && !options.some(([key]) => key === value) && <option value={value}>Referensi tidak tersedia</option>}{options.map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select>
        : type === "multiline" ? <textarea {...props} rows={3} className={cn(control, "resize-y")} />
        : <Input {...props} type={type === "datetime" ? "datetime-local" : type} step={type === "number" ? "any" : undefined} className={control} />}
      {hint && <p id={id + "-hint"} className="mt-1.5 text-xs text-text/75">{hint}</p>}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return <label className="inline-flex items-center gap-2.5 text-sm font-medium text-navy">
    <input type="checkbox" className="size-4 accent-maroon" checked={checked} onChange={(event) => onChange(event.target.checked)} />{label}
  </label>;
}

function RecordFields({ value, onChange, fields }) {
  return <div className="grid gap-4 sm:grid-cols-2">
    {fields.map(([key, label, type, options, hint]) => <Field key={key} label={label} type={type} options={options} hint={hint}
      className={type === "multiline" ? "sm:col-span-2" : undefined}
      value={value[key]} onChange={(next) => onChange({ ...value, [key]: next })} />)}
  </div>;
}

function CopyFields({ groups, value, update, assets }) {
  return <div className="divide-y divide-line border-y border-line">
    {groups.map((group) => <details key={group} className="py-3">
      <summary className="cursor-pointer font-semibold text-navy">{groupNames[group]}</summary>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {Object.entries(COPY[group]).map(([key, sample]) => {
          const options = key === "illustration" ? [["", "Tanpa ilustrasi"], ...assets]
            : key === "pose" ? [["", "Tanpa Elvo"], ...POSES.map((pose) => [pose, pose])] : undefined;
          const tokens = sample.match(/\{\w+\}/g);
          let choices = options;
          const current = value.copy[group][key];
          if (options && current && !options.some(([id]) => id === current)) choices = [...options, [current, current]];
          return <Field key={key} label={contextualLabels[group]?.[key] ?? labels[key]}
            type={sample.length > 82 && !options ? "multiline" : "text"} options={choices}
            className={sample.length > 82 ? "sm:col-span-2" : undefined}
            hint={tokens?.length ? "Variabel tersedia " + tokens.join(", ") : undefined}
            value={current}
            onChange={(next) => update("copy", { ...value.copy, [group]: { ...value.copy[group], [key]: next } })} />;
        })}
      </div>
    </details>)}
  </div>;
}

function Collection({ title, singular, items, update, create, name, children }) {
  const [open, setOpen] = useState("");
  return <section className="space-y-3 border-t border-line pt-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="font-semibold text-navy">{title}</h3>
      <Button variant="outline-navy" size="sm" onClick={() => {
        const item = { key: "item-" + crypto.randomUUID(), ...create() };
        update([...items, item]);
        setOpen(item.key);
      }}>Tambah {singular}</Button>
    </div>
    {items.map((item, index) => <div className="rounded-md border border-line bg-white/65" key={item.key}>
      <div className="flex flex-wrap items-center gap-2 p-2">
        <button type="button" aria-expanded={open === item.key} className="min-w-36 flex-1 rounded px-2 py-1.5 text-left text-sm font-semibold text-navy hover:bg-cream-2"
          onClick={() => setOpen(open === item.key ? "" : item.key)}>{name(item) || singular + " " + (index + 1)}</button>
        <OrderButtons index={index} count={items.length} label={name(item) || singular} change={(delta) => update(move(items, index, delta))} />
        <Button variant="ghost" size="sm" className="text-maroon" onClick={() => update(items.filter((row) => row.key !== item.key))}>
          Hapus<span className="sr-only"> {name(item) || singular}</span>
        </Button>
      </div>
      {open === item.key && <div className="space-y-4 border-t border-line p-4">
        {children(item, (next) => update(items.map((row) => row.key === item.key ? next : row)))}
      </div>}
    </div>)}
    {!items.length && <p className="text-sm text-text/70">Daftar kosong.</p>}
  </section>;
}

export function OrderButtons({ index, count, label, change }) {
  return <div className="inline-flex items-center gap-0.5">
    {[-1, 1].map((delta) => {
      const verb = delta < 0 ? "Naikkan" : "Turunkan";
      return <Button type="button" key={delta} variant="ghost" size="icon" className="size-8 text-navy" title={verb}
        aria-label={verb + " " + label} disabled={delta < 0 ? index === 0 : index === count - 1} onClick={() => change(delta)}>
        <svg aria-hidden viewBox="0 0 16 16" className={cn("size-4", delta > 0 && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 13V3m-4 4 4-4 4 4" />
        </svg>
      </Button>;
    })}
  </div>;
}

function CourseList({ catalog, selected, update, ordered = false }) {
  const [query, setQuery] = useState("");
  const byId = new Map(catalog.map((course) => [course.id, course]));
  const checked = new Set(selected);
  const normalized = query.trim().toLocaleLowerCase("id");
  const matching = catalog.filter((course) => course.nama.toLocaleLowerCase("id").includes(normalized));
  return <div className="space-y-3">
    <Field label="Cari mata kuliah" type="search" value={query} onChange={setQuery} />
    <p className="text-xs text-text/75">{selected.length} dipilih</p>
    <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border border-line bg-white p-3">
      {matching.map((course) => <div key={course.id}>
        <Toggle label={course.nama + " · " + course.sks + " SKS"} checked={checked.has(course.id)}
          onChange={(on) => update(on ? [...selected, course.id] : selected.filter((id) => id !== course.id))} />
      </div>)}
      {!matching.length && <p className="text-sm text-text/75">Mata kuliah tidak ditemukan.</p>}
    </div>
    {!ordered && selected.filter((id) => !byId.has(id)).map((id) => <Button key={id} variant="outline-navy" size="sm"
      onClick={() => update(selected.filter((item) => item !== id))}>Lepas referensi {id}</Button>)}
    {ordered && !!selected.length && <ol className="max-h-64 divide-y divide-line overflow-y-auto rounded-md border border-line bg-white px-3">
      {selected.map((id, index) => <li key={id} className="flex items-center justify-between gap-2 py-1.5">
        <span className="text-sm text-navy">{index + 1}. {byId.get(id)?.nama ?? id}</span>
        <OrderButtons index={index} count={selected.length} label={byId.get(id)?.nama ?? id} change={(delta) => update(move(selected, index, delta))} />
      </li>)}
    </ol>}
  </div>;
}

const inputFields = [["weeks", "Durasi (minggu)", "number"], ["hours", "Jam per minggu", "number"], ["sks", "SKS asal", "number"]];
const programOptions = (programs) => [["", "Pilih kegiatan"], ...programs.map((item) => [item.key, item.label || item.key])];
const rangeFields = [["weeks", "Durasi (minggu)"], ["hours", "Jam per minggu"], ["sks", "SKS asal"]];
const numbers = (rules) => ({ weeks: rules.limits.weeks[0], hours: rules.limits.hours[0], sks: rules.limits.sks[0] });

function CalculatorFields({ value, update, catalog }) {
  const { rules, eligible, programs } = value;
  const pickedCatalog = catalog.filter((course) => eligible.includes(course.id));
  return <>
    <RecordFields value={rules} onChange={(next) => update("rules", next)} fields={[
      ["rate", "Menit per SKS per minggu", "number"], ["semesterWeeks", "Jumlah minggu semester", "number"],
      ["cap", "Batas SKS konversi", "number"], ["transferRatio", "SKS yang diakui per SKS asal", "number"],
      ["rounding", "Pembulatan hasil", "text", [["floor", "Ke bawah"], ["nearest", "Ke bilangan terdekat"], ["ceil", "Ke atas"]]],
    ]} />
    <Toggle label="Tandai aturan sebagai contoh" checked={rules.sample} onChange={(sample) => update("rules", { ...rules, sample })} />
    <section className="space-y-3 border-t border-line pt-4">
      <h3 className="font-semibold text-navy">Batas input simulator</h3>
      {rangeFields.map(([key, label]) => <fieldset key={key} className="grid grid-cols-2 gap-3">
        <legend className="mb-2 text-sm text-text/75">{label}</legend>
        {["Minimum", "Maksimum"].map((part, index) => <Field key={part} label={part} value={rules.limits[key][index]} type="number" onChange={(number) => {
          const range = [...rules.limits[key]];
          range[index] = number;
          update("rules", { ...rules, limits: { ...rules.limits, [key]: range } });
        }} />)}
      </fieldset>)}
    </section>
    <details className="border-t border-line pt-4">
      <summary className="cursor-pointer font-semibold text-navy">Mata kuliah yang layak</summary>
      <div className="mt-4">
        <CourseList catalog={catalog} selected={eligible} update={(next) => update({
          eligible: next,
          programs: programs.map((p) => ({ ...p, recommended: p.recommended.filter((id) => next.includes(id)) })),
        })} />
      </div>
    </details>
    <Collection title="Kegiatan" singular="kegiatan" items={programs} update={(next) => update("programs", next)} name={(p) => p.label} create={() => ({ label: "", lead: "", mode: "jam", ...numbers(rules), recommended: [] })}>
      {(item, change) => <>
        <RecordFields value={item} onChange={change} fields={[
          ["label", "Nama kegiatan"], ["mode", "Cara konversi", "text", [["jam", "Dari jam kegiatan"], ["sks", "Transfer SKS"]]],
          ["lead", "Ringkasan", "multiline"], ...(item.mode === "jam" ? inputFields.slice(0, 2) : inputFields.slice(2)),
        ]} />
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-navy">Urutan rekomendasi</summary>
          <div className="mt-3">
            <CourseList catalog={pickedCatalog} selected={item.recommended} ordered update={(recommended) => change({ ...item, recommended })} />
          </div>
        </details>
      </>}
    </Collection>
  </>;
}

function ExamplesFields({ value, update, catalog }) {
  const courseOptions = catalog.filter((course) => value.eligible.includes(course.id)).map(({ id, nama }) => [id, nama]);
  return <>
    <Toggle label="Tandai transkrip sebagai contoh" checked={value.examplesSample} onChange={(next) => update("examplesSample", next)} />
    <Collection title="Contoh transkrip" singular="contoh" items={value.cases} update={(next) => update("cases", next)} name={(c) => c.label}
      create={() => ({ label: "", program: "", ...numbers(value.rules), rows: [] })}>
      {(item, change) => {
        const program = value.programs.find((p) => p.key === item.program);
        const candidates = courseOptions.filter(([id]) => !item.rows.some((row) => row.courseId === id));
        return <>
          <RecordFields value={item} onChange={(next) => {
            const selected = value.programs.find((p) => p.key === next.program);
            change(next.program !== item.program && selected ? { ...next, weeks: selected.weeks, hours: selected.hours, sks: selected.sks } : next);
          }} fields={[
            ["label", "Judul contoh"], ["program", "Kegiatan", "text", programOptions(value.programs)],
            ...(program?.mode === "sks" ? inputFields.slice(2) : inputFields.slice(0, 2)),
          ]} />
          {item.rows.map((row, index) => <div key={row.courseId} className="space-y-3 border-t border-line pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="flex-1 text-sm font-semibold text-navy">{courseOptions.find(([id]) => id === row.courseId)?.[1] ?? "Mata kuliah tidak tersedia untuk konversi"}</p>
              <OrderButtons index={index} count={item.rows.length} label={row.courseId} change={(delta) => change({ ...item, rows: move(item.rows, index, delta) })} />
              <Button variant="ghost" size="sm" className="text-maroon" onClick={() => change({ ...item, rows: item.rows.filter((r) => r.courseId !== row.courseId) })}>Hapus</Button>
            </div>
            <Field label="Nilai" value={row.grade} onChange={(grade) => change({ ...item, rows: item.rows.map((r) => r === row ? { ...r, grade } : r) })} />
          </div>)}
          <Field label="Tambahkan mata kuliah" value="" options={[["", "Pilih mata kuliah"], ...candidates]}
            onChange={(courseId) => courseId && change({ ...item, rows: [...item.rows, { courseId, grade: "" }] })} />
        </>;
      }}
    </Collection>
  </>;
}

function StepsFields({ value, update }) {
  return <>
    <Toggle label="Tandai alur sebagai contoh" checked={value.stepsSample} onChange={(next) => update("stepsSample", next)} />
    <Collection title="Tahap pengajuan" singular="tahap" items={value.steps} update={(next) => update("steps", next)} name={(s) => s.title}
      create={() => ({ title: "", body: "", who: "", output: "", when: "", doc: "", link: { label: "", href: "" } })}>
      {(item, change) => <>
        <RecordFields value={item} onChange={change} fields={[
          ["title", "Judul tahap"], ["who", "Pihak yang terlibat"], ["output", "Hasil tahap"], ["when", "Waktu"],
          ["body", "Isi tahap", "multiline"], ["doc", "Templat", "text", [["", "Tanpa templat"], ...value.docs.map((d) => [d.key, d.title || d.key])]],
        ]} />
        <RecordFields value={item.link} onChange={(link) => change({ ...item, link })} fields={[["label", "Label tautan"], ["href", "Alamat tautan"]]} />
      </>}
    </Collection>
    <Collection title="Templat dokumen" singular="templat" items={value.docs} update={(next) => {
      const available = new Set(next.map((doc) => doc.key));
      update({ docs: next, steps: value.steps.map((step) => ({ ...step, doc: available.has(step.doc) ? step.doc : "" })) });
    }} name={(d) => d.title} create={() => ({ title: "", kind: "", pages: 1, href: "", column: "Nilai", blank: "__", outline: [], signers: [], sample: true })}>
      {(item, change) => <>
        <RecordFields value={item} onChange={change} fields={[
          ["title", "Judul dokumen"], ["kind", "Jenis dokumen"], ["pages", "Jumlah halaman", "number"], ["href", "Alamat berkas"],
          ["column", "Judul kolom terakhir"], ["blank", "Isi contoh kolom"],
        ]} />
        <Field label="Bagian yang diisi" hint="Satu bagian per baris." type="multiline" value={item.outline.join("\n")} onChange={(next) => change({ ...item, outline: next.split("\n") })} />
        <Field label="Penanda tangan" hint="Satu nama atau peran per baris." type="multiline" value={item.signers.join("\n")} onChange={(next) => change({ ...item, signers: next.split("\n") })} />
        <Toggle label="Tandai sebagai contoh" checked={item.sample} onChange={(sample) => change({ ...item, sample })} />
      </>}
    </Collection>
  </>;
}

export function BlockFields({ name, value, update, catalog, assets }) {
  const groups = { hero: ["hero"], calculator: ["calculator", "receipt", "course"], steps: ["steps", "document"],
    notice: ["notice"], examples: ["examples"], closing: ["closing"], settings: ["feedback"] }[name];
  return <div className="space-y-6">
    {name === "hero" && <Field type="multiline" label="Pengantar" value={value.intro} onChange={(next) => update("intro", next)} />}
    {name === "calculator" && <CalculatorFields value={value} update={update} catalog={catalog} />}
    {name === "steps" && <StepsFields value={value} update={update} />}
    {name === "examples" && <ExamplesFields value={value} update={update} catalog={catalog} />}
    {name === "notice" && <>
      <RecordFields value={value.notice} onChange={(next) => update("notice", next)} fields={[
        ["title", "Judul pengumuman"], ["body", "Isi pengumuman", "multiline"], ["action", "Label tombol"], ["href", "Tautan tombol"],
        ["calendarAt", "Jadwal kalender (WIB)", "datetime"], ["calendarTitle", "Judul di kalender"], ["place", "Lokasi"],
      ]} />
      <Toggle label="Tandai pengumuman sebagai contoh" checked={value.notice.sample} onChange={(sample) => update("notice", { ...value.notice, sample })} />
    </>}
    {name === "closing" && <Collection title="Tautan lanjutan" singular="tautan" items={value.links} update={(next) => update("links", next)} name={(l) => l.title}
      create={() => ({ title: "", kicker: "", href: "", program: "", fallback: false })}>
      {(item, change) => <>
        <RecordFields value={item} onChange={change} fields={[
          ["title", "Judul tautan"], ["kicker", "Pengantar tautan"], ["href", "Alamat tautan"],
          ["program", "Tampilkan untuk kegiatan", "text", [["", "Semua kegiatan"], ...programOptions(value.programs).slice(1)]],
        ]} />
        {!item.program && <Toggle label="Tampilkan hanya jika tidak ada tautan khusus kegiatan" checked={item.fallback} onChange={(fallback) => change({ ...item, fallback })} />}
      </>}
    </Collection>}
    {name === "settings" && <RecordFields value={value.seo} onChange={(next) => update("seo", next)}
      fields={[["title", "Judul SEO"], ["image", "URL gambar untuk berbagi"], ["description", "Deskripsi SEO", "multiline"]]} />}
    <CopyFields groups={groups} value={value} update={update} assets={assets} />
  </div>;
}
