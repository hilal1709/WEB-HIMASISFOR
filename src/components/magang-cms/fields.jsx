"use client";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/magang-cms/copy";

const input = "min-h-11 w-full rounded-md border border-navy/20 bg-white px-3 py-2 text-sm text-navy outline-none transition-colors placeholder:text-navy/50 focus-visible:border-maroon focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-60";

const COPY_LABEL = {
  title: "Judul", body: "Teks pengantar", homeLabel: "Label tautan beranda", homeHref: "URL tautan beranda", breadcrumb: "Bagian breadcrumb", breadcrumbAria: "Nama aksesibel breadcrumb", pageLabel: "Nama halaman pada breadcrumb",
  findJobs: "Tombol ke lowongan", compare: "Tombol bandingkan jalur", cardBrand: "Instansi pada kartu", cardRole: "Peran pada kartu", cardName: "Nama pada kartu",
  cardImage: "URL gambar kartu", cardAlt: "Alt text gambar kartu", semesterLine: "Keterangan semester", courseLabel: "Label mata kuliah",
  loadLabel: "Label beban", semesterLabel: "Label semester", credits: "Format SKS", semesterShort: "Format semester singkat", turn: "Petunjuk membalik kartu",
  cardAria: "Nama aksesibel kartu", routesHeading: "Judul belakang kartu", turnBack: "Tombol kembali ke depan kartu", routesAria: "Pengumuman pilihan jalur untuk pembaca layar",
  curtainTitle: "Judul pemuatan", curtainAccent: "Aksen judul pemuatan", loading: "Label pemuatan",
  audience: "Label sasaran jalur", imageLabel: "Keterangan foto jalur", illustrationLabel: "Alt text ilustrasi jalur",
  creditsLink: "Label tautan konversi", creditsHref: "URL konversi", empty: "Judul/pesan saat kosong",
  bodyWithoutTracker: "Pengantar saat Jejak disembunyikan", search: "Petunjuk pencarian", count: "Format jumlah hasil", clear: "Tombol hapus filter",
  field: "Label bidang", program: "Label jalur", mode: "Label lokasi kerja", all: "Label pilihan semua",
  save: "Label simpan", remove: "Label hapus dari jejak", filteredEmpty: "Judul jika filter tidak cocok", emptyHint: "Petunjuk saat filter tidak cocok",
  resetEmpty: "Tombol untuk menampilkan semua posisi", illustration: "Ilustrasi saat kosong", illustrationAlt: "Alt text ilustrasi kosong",
  more: "Tombol muat hasil berikutnya", closed: "Label setelah pendaftaran ditutup", today: "Label tenggat hari ini", deadline: "Format hitung mundur",
  noDeadline: "Label sebelum tenggat ditetapkan", sample: "Label konten contoh", durationMissing: "Durasi yang belum ditentukan",
  calendar: "Tombol simpan kalender", dismiss: "Nama aksesibel tombol tutup pengumuman", saved: "Judul toast kalender berhasil",
  savedBody: "Isi toast kalender berhasil", unavailable: "Judul toast tanggal belum pasti", unavailableBody: "Isi toast tanggal belum pasti",
  close: "Nama aksesibel tombol tutup modal", duration: "Label durasi", summary: "Ringkasan detail untuk pembaca layar", tasks: "Judul daftar tugas", needs: "Judul daftar syarat",
  aboutField: "Tautan informasi bidang", apply: "Tombol lamar", previous: "Tombol posisi sebelumnya", next: "Label berikutnya",
  noLink: "Judul toast tautan lamaran kosong", noLinkBody: "Isi toast tautan lamaran kosong", opened: "Judul toast saat tautan dibuka",
  openedBody: "Isi toast saat tautan dibuka", mark: "Aksi tandai melamar", watched: "Format jumlah yang dipantau", accepted: "Format jumlah diterima",
  emptyBody: "Penjelasan saat kosong", emptyLink: "Tombol dari jejak kosong", welcome: "Ucapan saat diterima", stageLabel: "Nama aksesibel tab tahapan",
  drop: "Petunjuk area seret", emptyStage: "Pesan tahap kosong", back: "Nama aksesibel mundurkan status", forward: "Nama aksesibel majukan status",
  toastRemoved: "Judul toast dihapus", undo: "Aksi batalkan", toastSaved: "Judul toast tersimpan", view: "Aksi lihat jejak",
  toastAccepted: "Judul toast diterima", toastAcceptedBody: "Isi toast diterima", viewDocs: "Aksi lihat berkas", toastMoved: "Judul toast pindah tahap", toastApplied: "Judul toast sudah melamar",
  stamp: "Teks stempel", files: "Judul daftar berkas", pagesShort: "Format halaman ringkas", brand: "Instansi pada sampul",
  pages: "Format jumlah halaman", outline: "Pengantar daftar isi", download: "Tombol unduh", checking: "Label saat memeriksa berkas",
  missing: "Judul toast berkas menyusul", missingBody: "Isi toast berkas menyusul", failed: "Judul toast gagal", failedBody: "Isi toast gagal",
  link: "Label tautan konsultasi", href: "URL konsultasi", mascot: "Pose Elvo", mascotText: "Ucapan Elvo", current: "Label posisi saat ini",
};

const poses = ["wave", "thumbs-up", "confident", "proud", "run", "think", "laugh"].map((pose) => [pose, pose]);
const catalog = (items, title = "title") => items.map((item) => [item.key, item[title] || "Entri baru"]);
const uid = () => crypto.randomUUID();

function Field({ label, value, onChange, type = "text", options, hint, optional = false }) {
  const id = useId();
  const field = { id, "aria-describedby": hint ? id + "-hint" : undefined, className: input, value: type === "lines" ? value.join("\n") : value };
  if (type === "check") {
    return <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-navy">
      <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-maroon focus-visible:outline-gold" />
      {label}
    </label>;
  }
  return <div className="min-w-0 space-y-1.5">
    <label htmlFor={id} className="block text-sm font-semibold text-navy">{label}</label>
    {options ? (
      <select {...field} onChange={(event) => onChange(event.target.value)}>
        {optional && <option value="">Kosong</option>}
        {value && !options.some(([key]) => key === value) && <option value={value}>Pilihan tidak tersedia</option>}
        {options.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
      </select>
    ) : type === "area" || type === "lines" ? (
      <textarea {...field} rows={type === "lines" ? 4 : 3} onChange={(event) => onChange(type === "lines" ? event.target.value.split("\n") : event.target.value)} />
    ) : (
      <input {...field} type={type} onChange={(event) => onChange(type === "number" ? Number(event.target.value) : event.target.value)} />
    )}
    {hint && <p id={id + "-hint"} className="text-xs leading-relaxed text-navy/70">{hint}</p>}
  </div>;
}

function groupField(model, change) {
  return function renderField(key, label, props = {}) {
    return <Field key={key} label={label} value={model[key]} onChange={(value) => change({ ...model, [key]: value })} {...props} />;
  };
}

const grid = "grid gap-4 sm:grid-cols-2";

function CopyFields({ group, value, onChange, assets, keys = Object.keys(COPY[group]) }) {
  const field = groupField(value, onChange);
  return <div className={grid}>
    {keys.map((key) => {
      const defaults = COPY[group][key];
      const variables = [...defaults.matchAll(/\{\w+\}/g)].map((match) => match[0]);
      const props = {
        type: defaults.includes("\n") || defaults.length > 90 ? "area" : "text",
        hint: variables.length ? "Variabel " + variables.join(", ") : undefined,
      };
      if (key === "illustration") Object.assign(props, { options: assets, optional: true });
      if (key === "mascot") Object.assign(props, { options: poses, optional: true });
      const label = group === "closing" && key === "next" ? "Label tautan yang disarankan" : COPY_LABEL[key];
      return field(key, label, props);
    })}
  </div>;
}

function Settings({ title, children }) {
  return <details className="border-t border-navy/15 pt-3">
    <summary className="cursor-pointer py-2 text-sm font-semibold text-maroon marker:text-maroon">{title}</summary>
    <div className="space-y-5 pb-3 pt-3">{children}</div>
  </details>;
}

function OrderButton({ direction, label, disabled, onClick }) {
  return <Button type="button" variant="outline-navy" size="icon" aria-label={label} title={label} disabled={disabled} onClick={onClick}>
    <svg aria-hidden viewBox="0 0 20 20" className="size-4">
      <path d={direction < 0 ? "M5 12.5l5-5 5 5" : "M5 7.5l5 5 5-5"} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </Button>;
}

export { OrderButton };

export function reordered(items, from, to) {
  const next = items.slice();
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

function Rows({ label, itemName, rows, change, create, children, name = (item) => item.title, id = (item) => item.key }) {
  const [selected, setSelected] = useState(null);
  return <section className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-serif text-xl text-navy">{label} <span className="font-sans text-xs font-semibold tabular-nums text-navy/65">({rows.length})</span></h3>
      <Button type="button" size="sm" variant="outline-navy" onClick={() => {
        const entry = create();
        change([...rows, entry]);
        setSelected(id(entry));
      }}>Tambah {itemName}</Button>
    </div>
    <ul className="divide-y divide-navy/15 border-y border-navy/15">
      {rows.map((item, index) => {
        const itemId = id(item) ?? index;
        const open = selected === itemId;
        const title = name(item) || "Entri baru";
        return <li key={itemId}>
          <div className="flex flex-wrap items-center justify-between gap-2 py-1.5">
            <button type="button" aria-expanded={open} onClick={() => setSelected(open ? null : itemId)} className="min-h-10 min-w-0 flex-1 break-words text-left text-sm font-semibold text-navy hover:text-maroon">
              {title}
            </button>
            <div className="flex items-center gap-1">
              <OrderButton direction={-1} label={"Naikkan " + title} disabled={index === 0} onClick={() => change(reordered(rows, index, index - 1))} />
              <OrderButton direction={1} label={"Turunkan " + title} disabled={index === rows.length - 1} onClick={() => change(reordered(rows, index, index + 1))} />
            </div>
          </div>
          {open && <div className="space-y-4 pb-4 pt-2">
            {children(item, (next) => change(rows.map((row, i) => i === index ? next : row)))}
            <button type="button" className="min-h-10 text-sm font-semibold text-maroon underline underline-offset-4" onClick={() => { change(rows.filter((_, i) => i !== index)); setSelected(null); }}>Hapus {itemName}</button>
          </div>}
        </li>;
      })}
    </ul>
  </section>;
}

export function BlockFields({ block, value, update, courses, assets }) {
  const set = (key) => (next) => update((current) => ({ ...current, [key]: next }));
  const copy = (group, keys) => <CopyFields group={group} value={value.copy[group]} onChange={(next) => update((current) => ({ ...current, copy: { ...current.copy, [group]: next } }))} assets={assets} keys={keys} />;
  const extra = (group, selected = []) => copy(group, Object.keys(COPY[group]).filter((key) => !selected.includes(key)));
  const heading = (group, keys = ["title", "body"]) => copy(group, keys);
  switch (block) {
    case "seo": {
      const field = groupField(value.seo, set("seo"));
      return <div className={grid}>{field("title", "Judul SEO")}{field("description", "Deskripsi SEO", { type: "area" })}{field("image", "URL gambar saat dibagikan")}</div>;
    }
    case "hero": {
      const field = groupField(value.kp, set("kp"));
      return <>
        {heading("hero", ["title", "findJobs", "compare", "cardImage", "cardAlt"])}
        <Field label="Paragraf pembuka" type="area" value={value.intro} onChange={set("intro")} />
        <Settings title="Informasi Kerja Praktik">
          <div className={grid}>
            {field("source", "Sumber data", { options: [["curriculum", "Kurikulum terbit"], ["manual", "Isi manual"], ["hidden", "Sembunyikan"]] })}
            {value.kp.source === "curriculum" && field("courseId", "Mata kuliah", { options: [["", "Kerja Praktik otomatis"], ...courses.map(({ id, nama, sks, semester }) => [id, nama + " · " + sks + " SKS · Semester " + semester])] })}
            {value.kp.source === "manual" && <>{field("nama", "Nama mata kuliah")}{field("sks", "Jumlah SKS", { type: "number" })}{field("semester", "Semester", { type: "number" })}</>}
          </div>
        </Settings>
        <Settings title="Teks kartu, breadcrumb, dan pemuatan">{extra("hero", ["title", "findJobs", "compare", "cardImage", "cardAlt"])}</Settings>
      </>;
    }
    case "routes":
      return <>
        {heading("routes")}
        <Rows label="Program" itemName="jalur" rows={value.routes} change={set("routes")} create={() => ({ key: uid(), title: "", tag: "", image: "", alt: "", lottie: "", lead: "", forWho: "", facts: [], sample: false })}>
          {(row, change) => {
            const field = groupField(row, change);
            return <>
              <div className={grid}>
                {field("title", "Nama jalur")}{field("tag", "Keterangan singkat")}{field("lead", "Ringkasan", { type: "area" })}{field("forWho", "Cocok untuk", { type: "area" })}
                {field("image", "URL foto")}{field("alt", "Alt text foto")}{field("lottie", "Animasi", { options: assets, optional: true })}{field("sample", "Tandai sebagai contoh")}
              </div>
              <Rows label="Fakta jalur" itemName="fakta" rows={row.facts} change={(facts) => change({ ...row, facts })} create={() => ({ key: uid(), k: "", v: "" })} name={(fact) => fact.k}>
                {(fact, edit) => <div className={grid}>{groupField(fact, edit)("k", "Label")}{groupField(fact, edit)("v", "Isi")}</div>}
              </Rows>
            </>;
          }}
        </Rows>
        <Settings title="Teks pendukung dan tautan">{extra("routes", ["title", "body"])}</Settings>
      </>;
    case "jobs": {
      const notice = groupField(value.notice, set("notice"));
      return <>
        {heading("jobs")}
        <Field label="Urutan papan lowongan" value={value.jobOrder} onChange={set("jobOrder")} options={[["deadline", "Tenggat terdekat"], ["manual", "Urutan daftar di bawah"]]} hint="Posisi yang sudah ditutup tetap berada di bawah." />
        <Rows label="Daftar posisi" itemName="lowongan" rows={value.jobs} change={set("jobs")} id={(job) => job.slug} create={() => ({ slug: uid(), title: "", company: "", logo: "", field: "", mode: "", program: "", duration: "", deadline: "", href: "", needs: [], tasks: [], sample: false })}>
          {(job, change) => {
            const field = groupField(job, change);
            return <div className={grid}>
              {field("title", "Posisi")}{field("company", "Perusahaan")}{field("logo", "Inisial yang tampil (opsional)")}
              {field("program", "Jalur", { options: catalog(value.routes), optional: true })}
              {field("field", "Bidang", { options: catalog(value.fields, "label"), optional: true })}
              {field("mode", "Lokasi kerja", { options: catalog(value.modes, "label"), optional: true })}
              {field("duration", "Durasi")}{field("deadline", "Tenggat WIB", { type: "date" })}
              {field("href", "URL lamaran")}{field("sample", "Tandai sebagai contoh")}
              {field("tasks", "Tugas", { type: "lines", hint: "Satu tugas per baris." })}{field("needs", "Syarat", { type: "lines", hint: "Satu syarat per baris." })}
            </div>;
          }}
        </Rows>
        <Settings title="Pengumuman">
          <div className={grid}>
            {notice("visible", "Tampilkan pengumuman")}{notice("sample", "Tandai sebagai contoh")}
            {notice("title", "Judul pengumuman")}{notice("body", "Isi pengumuman", { type: "area" })}
            {notice("actionLabel", "Label tombol")}{notice("actionHref", "URL tombol")}
            {notice("calendarSource", "Sumber kalender", { options: [["none", "Tanpa kalender"], ["legacy", "Agenda Info Session bawaan"], ["manual", "Atur tanggal dan jam"]] })}
            {value.notice.calendarSource === "manual" && <>{notice("date", "Tanggal", { type: "date" })}{notice("time", "Jam WIB", { type: "time" })}{notice("place", "Lokasi")}</>}
          </div>
          {copy("notice")}
        </Settings>
        <Settings title="Pilihan filter">
          {["fields", "modes"].map((key) => <Rows key={key} label={key === "fields" ? "Bidang" : "Lokasi kerja"} itemName="pilihan" rows={value[key]} change={set(key)} name={(item) => item.label} create={() => ({ key: uid(), label: "", ...(key === "fields" && { href: "" }) })}>
            {(row, change) => <div className={grid}>{groupField(row, change)("label", "Nama pilihan")}{key === "fields" && groupField(row, change)("href", "URL informasi bidang")}</div>}
          </Rows>)}
        </Settings>
        <Settings title="Label, keadaan kosong, dan detail posisi">{extra("jobs", ["title", "body"])}{copy("jobModal")}</Settings>
      </>;
    }
    case "tracker":
      return <>
        {heading("tracker")}
        <div className={grid}>{value.stages.map((stage, index) => <Field key={stage.key} label={"Tahap " + (index + 1)} value={stage.label} onChange={(label) => set("stages")(value.stages.map((item) => item.key === stage.key ? { ...item, label } : item))} />)}</div>
        <Settings title="Pesan dan tindakan jejak">{extra("tracker", ["title", "body"])}</Settings>
      </>;
    case "logbook":
      return <>
        {heading("logbook")}
        <Rows label="Bab logbook" itemName="bab" rows={value.logbook} change={set("logbook")} create={() => ({ key: uid(), title: "", sample: false, entries: [] })}>
          {(chapter, editChapter) => <>
            <div className={grid}>{groupField(chapter, editChapter)("title", "Judul bab")}{groupField(chapter, editChapter)("sample", "Tandai sebagai contoh")}</div>
            <Rows label="Langkah" itemName="langkah" rows={chapter.entries} change={(entries) => editChapter({ ...chapter, entries })} name={(entry) => entry.text} create={() => ({ key: uid(), text: "", doc: "" })}>
              {(row, change) => <div className={grid}>
                {groupField(row, change)("text", "Isi langkah", { type: "area" })}
                {groupField(row, change)("doc", "Berkas terkait", { options: catalog(value.docs), optional: true })}
              </div>}
            </Rows>
          </>}
        </Rows>
        <Rows label="Daftar berkas" itemName="berkas" rows={value.docs} change={set("docs")} create={() => ({ key: uid(), title: "", kind: "", pages: 0, href: "", outline: [], sample: false })}>
          {(row, change) => {
            const field = groupField(row, change);
            return <div className={grid}>
              {field("title", "Judul berkas")}{field("kind", "Jenis berkas")}{field("pages", "Jumlah halaman", { type: "number" })}
              {field("href", "URL berkas")}{field("outline", "Daftar isi", { type: "lines", hint: "Satu bagian per baris." })}{field("sample", "Tandai sebagai contoh")}
            </div>;
          }}
        </Rows>
        <Settings title="Label dan modal berkas">{extra("logbook", ["title", "body"])}{copy("docModal")}</Settings>
      </>;
    case "closing":
      return <>
        {heading("closing", ["body", "link", "href", "mascot", "mascotText"])}
        <Rows label="Tautan terkait" itemName="tautan" rows={value.stops} change={set("stops")} create={() => ({ key: uid(), title: "", step: "", body: "", href: "", highlight: "none" })}>
          {(row, change) => {
            const field = groupField(row, change);
            return <div className={grid}>
              {field("title", "Judul")}{field("step", "Label langkah", { hint: "Variabel {course}, {sks}, {semester}" })}{field("body", "Keterangan", { type: "area", hint: "Variabel {course}, {sks}, {semester}" })}
              {field("href", "URL")}{field("highlight", "Sorotan", { options: [["none", "Tanpa sorotan"], ["here", "Posisi saat ini"], ["before", "Saran sebelum diterima"], ["after", "Saran setelah diterima"]] })}
            </div>;
          }}
        </Rows>
        <Settings title="Label sorotan">{extra("closing", ["body", "link", "href", "mascot", "mascotText"])}</Settings>
      </>;
    default:
      return null;
  }
}
