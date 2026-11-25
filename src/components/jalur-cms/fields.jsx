"use client";

import { useId } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ELVO_POSES, newItem, newLink, newPath, newStage, ROAD_STYLES } from "@/lib/jalur-cms/schema";

const COPY_FIELDS = {
  identity: {
    seoTitle: "Judul SEO", seoDescription: "Deskripsi SEO", seoImage: "URL gambar saat dibagikan", seoImageAlt: "Teks alternatif gambar berbagi", breadcrumbRoot: "Label tautan beranda", breadcrumbHref: "Alamat tautan beranda", breadcrumbParent: "Label induk", breadcrumbCurrent: "Label halaman saat ini",
    curtainKicker: "Nama program pada pembuka", curtainTitle: "Judul pembuka", curtainAccent: "Aksen judul pembuka", loading: "Label status memuat",
  },
  hero: {
    titleStart: "Potongan judul pertama", titleEnd: "Potongan judul kedua", kicker: "Label di atas judul", credits: "Format beban SKS", semester: "Format semester", select: "Label pilihan jalur", readiness: "Tombol cek kesiapan", compare: "Tombol bandingkan", mascot: "Ucapan Elvo", empty: "Pesan jika semua jalur tersembunyi",
  },
  story: { title: "Judul tahapan", body: "Pengantar tahapan", desktopSelect: "Label bab desktop", mobileSelect: "Label bab ponsel", chapter: "Format nomor bab", progress: "Format progres tahap" },
  readiness: {
    title: "Judul cek kesiapan", body: "Petunjuk checklist", select: "Label pemilih jalur", complete: "Pesan selesai", almost: "Pesan hampir siap", started: "Pesan saat mulai", initial: "Pesan sebelum dicentang", count: "Format jumlah centang", reset: "Tombol reset", empty: "Pesan jika checklist kosong", success: "Judul toast selesai", successBody: "Isi toast selesai", successAction: "Aksi toast selesai", resetToast: "Judul toast reset", undo: "Aksi urungkan reset",
  },
  compare: { title: "Judul perbandingan", body: "Pengantar perbandingan", flip: "Tombol balik kartu", back: "Tombol kembali", details: "Tombol ringkasan jalur" },
  labels: {
    output: "Luaran", duration: "Durasi", mentor: "Pendamping", audience: "Cocok untuk", risk: "Pertimbangan", stages: "Daftar tahapan", pathNumber: "Format nomor jalur", prerequisite: "Format mata kuliah prasyarat", sample: "Penanda konten contoh", close: "Tutup dialog", closeBanner: "Tutup pengumuman", previousPath: "Jalur sebelumnya", nextPath: "Jalur berikutnya", previousStage: "Tahap sebelumnya", nextStage: "Tahap berikutnya", stageNumber: "Format label titik tahap", stageProgress: "Format progres di modal tahap", stageOutput: "Label akhir tahap", requirements: "Label persyaratan", next: "Label tahap lanjutan", last: "Label tahap terakhir",
  },
  closing: { prompt: "Ajakan penutup", promptWithoutSemester: "Ajakan tanpa data semester", kicker: "Pengantar kartu penutup", courseKicker: "Format semester prasyarat", courseNote: "Catatan prasyarat", pathKicker: "Format nama jalur pada kartu", pathTitle: "Judul kartu ringkasan", pathNote: "Isi kartu ringkasan", linksLabel: "Pengantar tautan tambahan", mascot: "Ucapan Elvo pada penutup" },
};

const LONG_FIELDS = new Set(["seoDescription", "body", "mascot", "prompt", "promptWithoutSemester", "pathNote", "courseNote", "successBody"]);
const INPUT_CLASS = "min-h-11 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-navy outline-none transition-colors placeholder:text-text/70 hover:border-navy/30 focus:border-maroon/60 focus:ring-2 focus:ring-maroon/15";

export function Group({ title, help, children }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-[0_12px_35px_-32px_#14213d] sm:p-7">
      <h3 className="font-serif text-xl text-navy sm:text-2xl">{title}</h3>
      {help && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-text/75">{help}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, multiline = false, placeholder, options, help, numeric }) {
  const id = useId();
  const params = { id, value, onChange: (event) => onChange(event.target.value), "aria-describedby": help ? `${id}-help` : undefined };
  return (
    <div className={multiline ? "space-y-1.5 sm:col-span-2" : "min-w-0 space-y-1.5"}>
      <label htmlFor={id} className="block text-sm font-medium text-navy">{label}</label>
      {options ? <select {...params} className={INPUT_CLASS}>{options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
        : multiline ? <textarea {...params} rows={3} maxLength={3000} placeholder={placeholder} className={INPUT_CLASS} />
          : <Input {...params} maxLength={3000} placeholder={placeholder} inputMode={numeric ? "numeric" : undefined} className={INPUT_CLASS} />}
      {help && <p id={`${id}-help`} className="text-xs leading-relaxed text-text/75">{help}</p>}
    </div>
  );
}

function Fields({ fields, value, change, layout = true }) {
  return <div className={layout ? "grid gap-4 sm:grid-cols-2" : "space-y-4"}>
    {fields.map(([key, label, multiline]) => <Field key={key} label={label} value={value[key]} onChange={(val) => change(key, val)} multiline={multiline} />)}
  </div>;
}

function Toggle({ label, checked, onChange }) {
  return <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-sm font-medium text-navy">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-maroon focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon" />{label}
  </label>;
}

function MediaFields({ value, onChange }) {
  return <div className="grid gap-4 sm:grid-cols-2">
    <Field label="URL ilustrasi" value={value.src} placeholder="/lottie/grad-cap.json" help="Gunakan alamat gambar atau berkas Lottie JSON. Kosongkan untuk menyembunyikannya." onChange={(src) => onChange({ ...value, src })} />
    <Field label="Teks alternatif ilustrasi" value={value.alt} onChange={(alt) => onChange({ ...value, alt })} />
  </div>;
}

function MascotFields({ value, onChange }) {
  const labels = ["Melambai", "Jempol", "Percaya diri", "Bangga", "Berlari", "Berpikir", "Tertawa"];
  return <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
    <Toggle label="Tampilkan Elvo" checked={value.visible} onChange={(visible) => onChange({ ...value, visible })} />
    {value.visible && <Field label="Pose Elvo" value={value.pose} options={ELVO_POSES.map((pose, i) => [pose, labels[i]])} onChange={(pose) => onChange({ ...value, pose })} />}
  </div>;
}

function ListTools({ index, items, onChange, onDelete, name }) {
  const move = (offset) => {
    const next = [...items];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  };
  return <div className="flex shrink-0 items-center gap-1">
    <Button type="button" variant="ghost" size="icon" className="size-9" disabled={index === 0} aria-label={`Naikkan ${name}`} onClick={() => move(-1)}><ArrowUp className="size-4" /></Button>
    <Button type="button" variant="ghost" size="icon" className="size-9" disabled={index === items.length - 1} aria-label={`Turunkan ${name}`} onClick={() => move(1)}><ArrowDown className="size-4" /></Button>
    <Button type="button" variant="ghost" size="icon" className="size-9 text-maroon" aria-label={`Hapus ${name}`} onClick={onDelete}><Trash2 className="size-4" /></Button>
  </div>;
}

function AddButton({ children, onClick }) {
  return <Button type="button" variant="outline-navy" onClick={onClick}><Plus className="size-4" />{children}</Button>;
}

function ItemList({ items, onChange, label, add, confirmRemove, create = newItem, render }) {
  return <div className="space-y-3">
    {items.length === 0 && <p className="rounded-md border border-dashed border-line bg-cream px-4 py-5 text-sm text-text/75">{`Belum ada ${label.toLowerCase()}. Gunakan tombol tambah untuk membuatnya.`}</p>}
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li key={item.id} className="rounded-md border border-line bg-cream/50 px-3 py-2 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-text/75">{label} {index + 1}</span>
            <ListTools index={index} items={items} onChange={onChange} name={`${label.toLowerCase()} ${index + 1}`} onDelete={() => confirmRemove(item.text || item.label || `${label} ${index + 1}`, () => onChange(items.filter((x) => x.id !== item.id)))} />
          </div>
          {render ? render(item, (next) => onChange(items.map((x) => x.id === item.id ? next : x))) : <Field label={`Isi ${label.toLowerCase()} ${index + 1}`} value={item.text} onChange={(text) => onChange(items.map((x) => x.id === item.id ? { ...x, text } : x))} />}
          <Toggle label="Tampilkan di publik" checked={item.visible} onChange={(visible) => onChange(items.map((x) => x.id === item.id ? { ...x, visible } : x))} />
        </li>
      ))}
    </ol>
    <AddButton onClick={() => onChange([...items, create()])}>{add}</AddButton>
  </div>;
}

const PATH_FIELDS = [["title", "Nama jalur"], ["duration", "Durasi"], ["mentor", "Pendamping"], ["output", "Luaran"], ["oneLiner", "Ringkasan", true], ["forWho", "Cocok untuk", true], ["risk", "Risiko dan pertimbangan", true]];

function StageList({ stageList, onChange, confirmRemove }) {
  return <div className="space-y-3">
    {stageList.length === 0 && <p className="rounded-md border border-dashed border-line bg-cream px-4 py-5 text-sm text-text/75">Belum ada tahap. Tambahkan tahap pertama untuk jalur ini.</p>}
    {stageList.map((stage, index) => (
      <details key={stage.id} className="group rounded-md border border-line bg-white">
        <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-navy [&::-webkit-details-marker]:hidden">
          <span>{index + 1}. {stage.name || "Tahap baru"}</span>
          <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-5 border-t border-line px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Toggle label="Tampilkan tahap" checked={stage.visible} onChange={(visible) => onChange(stageList.map((s) => s.id === stage.id ? { ...s, visible } : s))} />
            <ListTools index={index} items={stageList} onChange={onChange} name={`tahap ${index + 1}`} onDelete={() => confirmRemove(stage.name || `Tahap ${index + 1}`, () => onChange(stageList.filter((s) => s.id !== stage.id)))} />
          </div>
          <Fields fields={[["name", "Nama tahap"], ["time", "Jadwal"], ["output", "Luaran tahap", true]]} value={stage} change={(key, val) => onChange(stageList.map((s) => s.id === stage.id ? { ...s, [key]: val } : s))} />
          <ItemList items={stage.needs} onChange={(needs) => onChange(stageList.map((s) => s.id === stage.id ? { ...s, needs } : s))} label="Persyaratan" add="Tambah persyaratan" confirmRemove={confirmRemove} />
        </div>
      </details>
    ))}
    <AddButton onClick={() => onChange([...stageList, newStage()])}>Tambah tahap</AddButton>
  </div>;
}

export function SectionFields({ section, value, update, courses, selected, setSelected, confirmRemove }) {
  const change = (key, val) => update((current) => ({ ...current, [key]: val }));
  const nested = (group, key, val) => update((current) => ({ ...current, [group]: { ...current[group], [key]: val } }));
  const copy = (group) => <Fields fields={Object.entries(COPY_FIELDS[group]).map(([key, label]) => [key, label, LONG_FIELDS.has(key) || (key === "title" && group !== "identity")])} value={value.copy[group]} change={(key, val) => update((current) => ({ ...current, copy: { ...current.copy, [group]: { ...current.copy[group], [key]: val } } }))} />;
  const visible = (key, label) => <Toggle label={label} checked={value.sections[key]} onChange={(show) => nested("sections", key, show)} />;
  const paths = value.paths;
  const path = paths.find((item) => item.key === selected) ?? paths[0];
  const pathOptions = paths.map((item, index) => [item.key, `${item.title || `Jalur ${index + 1}`}${item.visible ? "" : " (tersembunyi)"}`]);
  const pickPath = path && <Field label="Jalur yang disunting" value={path.key} onChange={setSelected} options={pathOptions} />;
  const changePath = (key, val) => update((current) => ({ ...current, paths: current.paths.map((item) => item.key === path.key ? { ...item, [key]: val } : item) }));

  if (section === "identity") return <>
    <Group title="Pembuka halaman">
      <Field label="Paragraf pembuka" value={value.intro} multiline onChange={(val) => change("intro", val)} />
      {copy("hero")}
      <MascotFields value={value.heroMascot} onChange={(val) => change("heroMascot", val)} />
    </Group>
    <Group title="Breadcrumb, SEO, dan animasi masuk">{copy("identity")}</Group>
  </>;

  if (section === "paths") return <>
    <Group title="Daftar jalur">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>{pickPath}</div>
        <AddButton onClick={() => { const next = newPath(); change("paths", [...paths, next]); setSelected(next.key); }}>Tambah jalur</AddButton>
      </div>
      {!path && <p className="rounded-md border border-dashed border-line bg-cream px-4 py-5 text-sm text-text/75">Belum ada jalur. Tambahkan jalur untuk mulai menyusun tahapannya.</p>}
      {path && <>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-2">
          <Toggle label="Tampilkan jalur" checked={path.visible} onChange={(val) => changePath("visible", val)} />
          <Toggle label="Tandai sebagai contoh" checked={path.sample} onChange={(val) => changePath("sample", val)} />
          <div className="sm:ml-auto"><ListTools index={paths.indexOf(path)} items={paths} onChange={(next) => change("paths", next)} name="jalur" onDelete={() => confirmRemove(path.title || "Jalur baru", () => change("paths", paths.filter((item) => item.key !== path.key)))} /></div>
        </div>
        <Fields fields={PATH_FIELDS} value={path} change={changePath} />
        <Field label="Bentuk peta tahapan" value={path.road} options={ROAD_STYLES.map((style, i) => [style, `Pola ${i + 1}`])} onChange={(val) => changePath("road", val)} />
        <MediaFields value={path.media} onChange={(val) => changePath("media", val)} />
      </>}
    </Group>
    {path && <Group title="Tahapan dan persyaratan"><StageList key={path.key} stageList={path.stages} onChange={(val) => changePath("stages", val)} confirmRemove={confirmRemove} /></Group>}
  </>;

  if (section === "academic") {
    const { academic } = value;
    const courseOptions = (id, auto) => [["", auto], ...(!id || courses.some((course) => course.id === id) ? [] : [[id, "Rujukan tidak ditemukan"]]), ...courses.map((course) => [course.id, [course.nama, course.semester && `semester ${course.semester}`].filter(Boolean).join(" · ")])];
    return <>
      <Group title="Beban tugas akhir" help="Kosongkan nilai pengganti untuk memakai data Kurikulum yang terbit.">
        <Field label="Mata kuliah sumber" value={academic.courseId} options={courseOptions(academic.courseId, "Otomatis · Skripsi")} onChange={(val) => nested("academic", "courseId", val)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SKS pengganti" value={academic.sks} numeric onChange={(val) => nested("academic", "sks", val)} />
          <Field label="Semester pengganti" value={academic.semester} numeric onChange={(val) => nested("academic", "semester", val)} />
        </div>
      </Group>
      <Group title="Mata kuliah prasyarat">
        <Field label="Sumber prasyarat" value={academic.prerequisiteMode} options={[["kurikulum", "Ambil dari CMS Kurikulum"], ["manual", "Isi sendiri"], ["hidden", "Sembunyikan prasyarat"]]} onChange={(val) => nested("academic", "prerequisiteMode", val)} />
        {academic.prerequisiteMode !== "hidden" && <Field label="Tampilkan pada jalur" value={academic.prerequisitePath} options={[["", "Pilih jalur"], ...(!academic.prerequisitePath || paths.some((item) => item.key === academic.prerequisitePath) ? [] : [[academic.prerequisitePath, "Jalur tidak ditemukan"]]), ...pathOptions]} onChange={(val) => nested("academic", "prerequisitePath", val)} />}
        {academic.prerequisiteMode === "kurikulum" && <Field label="Mata kuliah prasyarat" value={academic.prerequisiteId} options={courseOptions(academic.prerequisiteId, "Otomatis · Metode Penelitian")} onChange={(val) => nested("academic", "prerequisiteId", val)} />}
        {academic.prerequisiteMode === "manual" && <Fields fields={[["name", "Nama mata kuliah"], ["href", "Tautan mata kuliah"], ["courseSemester", "Semester mata kuliah"]]} value={academic} change={(key, val) => nested("academic", key, val)} />}
      </Group>
    </>;
  }

  if (section === "readiness") return <>
    <Group title="Butir kesiapan per jalur">
      {pickPath}
      {path && <ItemList items={path.ready} onChange={(val) => changePath("ready", val)} label="Butir cek" add="Tambah butir cek" confirmRemove={confirmRemove} />}
      {!path && <p className="text-sm text-text/75">Tambahkan jalur dari bagian Jalur & tahapan.</p>}
    </Group>
    <Group title="Teks, hasil, dan ilustrasi">
      {visible("readiness", "Tampilkan cek kesiapan")}
      <MediaFields value={value.readinessMedia} onChange={(val) => change("readinessMedia", val)} />
      {copy("readiness")}
    </Group>
  </>;

  if (section === "sections") return <>
    <Group title="Cerita tahapan">{visible("story", "Tampilkan cerita tahapan")}{copy("story")}</Group>
    <Group title="Perbandingan jalur">{visible("compare", "Tampilkan perbandingan")}{copy("compare")}</Group>
  </>;

  if (section === "notice") return <Group title="Pengumuman publik">
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      <Toggle label="Tampilkan banner" checked={value.notice.visible} onChange={(val) => nested("notice", "visible", val)} />
      <Toggle label="Bisa ditutup pengunjung" checked={value.notice.dismissible} onChange={(val) => nested("notice", "dismissible", val)} />
      <Toggle label="Tandai sebagai contoh" checked={value.notice.sample} onChange={(val) => nested("notice", "sample", val)} />
    </div>
    <Fields fields={[["title", "Judul banner"], ["body", "Isi banner", true], ["label", "Label tombol"], ["href", "Tautan tombol"]]} value={value.notice} change={(key, val) => nested("notice", key, val)} />
  </Group>;

  if (section === "closing") return <>
    <Group title="Ajakan dan kartu penutup">
      {visible("closing", "Tampilkan bagian penutup")}
      <Field label="Aksi utama" value={value.closingAction.mode} options={[["default", "Sesuai jalur aktif"], ["link", "Tautan pilihan admin"], ["hidden", "Sembunyikan kartu"]]} onChange={(val) => nested("closingAction", "mode", val)} />
      {value.closingAction.mode === "link" && <Fields fields={[["title", "Judul kartu"], ["kicker", "Label pada kartu"], ["note", "Catatan kartu", true], ["href", "Alamat tujuan"]]} value={value.closingAction} change={(key, val) => nested("closingAction", key, val)} />}
      {copy("closing")}
      <MascotFields value={value.closingMascot} onChange={(val) => change("closingMascot", val)} />
    </Group>
    <Group title="Tautan tambahan">
      <ItemList items={value.links} onChange={(val) => change("links", val)} label="Tautan" add="Tambah tautan" confirmRemove={confirmRemove} create={newLink} render={(item, edit) => <Fields fields={[["label", "Teks tautan"], ["href", "Alamat tujuan"]]} value={item} change={(key, val) => edit({ ...item, [key]: val })} />} />
    </Group>
  </>;

  return <Group title="Label kartu dan dialog">{copy("labels")}</Group>;
}
