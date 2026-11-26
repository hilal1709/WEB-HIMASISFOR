"use client";
import { useId, useState } from "react";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { COPY, COPY_GROUPS, COPY_LABELS } from "@/lib/regulasi-cms/copy";
import { MASCOT_POSES, newArticle, newChapter, newDocument, newScenario, SIM_TYPES, studyVars } from "@/lib/regulasi-cms/schema";

const control = "w-full rounded-md border border-navy/20 bg-white px-3 py-2 text-sm text-navy shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon";
const tones = [["maroon", "Maroon"], ["navy", "Navy"], ["gold", "Emas"], ["ivory", "Krem"]];
const poses = { wave: "Menyapa", "thumbs-up": "Jempol", confident: "Percaya diri", proud: "Bangga", run: "Berlari", think: "Berpikir", laugh: "Tertawa" };
const kinds = { sks: "Batas SKS", nilai: "Konversi nilai", predikat: "Predikat kelulusan" };
const contentTokens = "{sks}, {semester}, {maxSemester}, {passGrade}, {passWeight}, {grades}, {maxGradeWeight}, {minGradeWeight}, {minGraduationGpa}";

export const SECTIONS = [
  { key: "overview", title: "Pengantar & SEO", anchor: "pengantar" },
  { key: "chapters", title: "Bab & Pasal", anchor: "pasal" },
  { key: "simulator", title: "Simulator", anchor: "simulasi" },
  { key: "scenarios", title: "Prosedur", anchor: "prosedur" },
  { key: "documents", title: "Dokumen", anchor: "unduhan" },
  { key: "interface", title: "Teks antarmuka" },
];

function Field({ label, value, onChange, multiline, number, options, hint }) {
  const id = useId();
  const props = { id, "aria-describedby": hint ? id + "-hint" : undefined, className: control };
  return (
    <div className="grid min-w-0 gap-1.5">
      <Label htmlFor={id} className="leading-snug text-navy">{label}</Label>
      {options ? (
        <select {...props} value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
          {options.map(([option, title]) => <option key={option} value={option}>{title}</option>)}
        </select>
      ) : multiline ? (
        <textarea {...props} value={value ?? ""} onChange={(event) => onChange(event.target.value)} rows={multiline} className={control + " resize-y"} />
      ) : (
        <Input
          {...props}
          type={number ? "number" : "text"}
          step={number ? "any" : undefined}
          value={value ?? ""}
          onChange={(event) => onChange(number ? (event.target.value === "" ? null : event.target.valueAsNumber) : event.target.value)}
        />
      )}
      {hint && <p id={id + "-hint"} className="break-words text-xs leading-relaxed text-navy/75">{hint}</p>}
    </div>
  );
}

function bind(value, onChange, key) {
  return { value: value[key], onChange: (next) => onChange({ ...value, [key]: next }) };
}

function Fields({ value, onChange, specs }) {
  return specs.map(([key, label, extra]) => <Field key={key} label={label} {...bind(value, onChange, key)} {...extra} />);
}

function Flag({ label, value, onChange }) {
  return (
    <label className="inline-flex min-h-9 w-fit items-center gap-2.5 text-sm font-medium text-navy">
      <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-maroon focus-visible:ring-2 focus-visible:ring-maroon" />
      {label}
    </label>
  );
}

function Flags({ value, onChange, sample = true }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1">
      <Flag label="Tampilkan di publik" {...bind(value, onChange, "visible")} />
      {sample && <Flag label="Tandai sebagai contoh" {...bind(value, onChange, "sample")} />}
    </div>
  );
}

function Group({ title, children, hint }) {
  return (
    <fieldset className="min-w-0 border-t border-line pt-4">
      <legend className="pr-3 font-serif text-[1.3rem] leading-snug text-maroon">{title}</legend>
      {hint && <p className="mb-4 text-xs leading-relaxed text-navy/75">{hint}</p>}
      <div className="grid gap-4">{children}</div>
    </fieldset>
  );
}

function Lines({ value, onChange, label }) {
  return <Field label={label} value={value.join("\n")} onChange={(next) => onChange(next ? next.split("\n") : [])} multiline={Math.min(7, Math.max(3, value.length))} hint="Satu entri per baris." />;
}

function RowButton({ label, children, ...props }) {
  return <Button type="button" size="icon" variant="ghost" aria-label={label} title={label} className="h-9 w-8 text-maroon" {...props}>{children}</Button>;
}

function EntryList({ value, onChange, name, describe, create, children, illustrate = false }) {
  const listId = useId();
  const [open, setOpen] = useState(null);
  const [removed, setRemoved] = useState(null);
  const change = (index, item) => onChange(value.map((current, at) => at === index ? item : current));
  const move = (index, direction) => {
    const next = [...value];
    const target = index + direction;
    [next[index], next[target]] = [next[target], next[index]];
    if (open === index) setOpen(target);
    else if (open === target) setOpen(index);
    onChange(next);
  };
  const remove = (index) => {
    setRemoved({ item: value[index], index });
    onChange(value.filter((_, at) => at !== index));
    setOpen((current) => current > index ? current - 1 : current === index ? null : current);
  };

  return (
    <div className="grid gap-2">
      {value.length === 0 && (
        <div className="rounded border border-dashed border-navy/20 px-4 py-3 text-sm text-navy/75">
          {illustrate && <LottieIllustration src="/lottie/rulebook-dark.json" className="mb-3 size-20 rounded bg-maroon" loop={false} />}
          Belum ada {name.toLowerCase()}.
        </div>
      )}
      {value.map((item, index) => {
        const label = describe(item) || `${name} baru`;
        const key = item.id ?? item.key ?? index;
        const panelId = `${listId}-${key}`;
        return (
          <div key={key} className="min-w-0 rounded-md border border-line bg-white">
            <div className="flex min-w-0 items-center gap-1 px-2">
              <button
                type="button"
                aria-expanded={open === index}
                aria-controls={open === index ? panelId : undefined}
                onClick={() => setOpen(open === index ? null : index)}
                className="flex min-h-11 min-w-0 flex-1 items-center gap-2 px-1.5 text-left text-sm font-semibold text-navy"
              >
                <ChevronDown aria-hidden className={`size-4 shrink-0 text-maroon motion-safe:transition-transform ${open === index ? "rotate-180" : ""}`} />
                <span className="truncate">{label}</span>
                {item.visible === false && <span className="shrink-0 text-xs font-normal text-navy/70">Disembunyikan</span>}
              </button>
              <div className="flex shrink-0">
                <RowButton label={`Naikkan ${label}`} disabled={index === 0} onClick={() => move(index, -1)}><ChevronUp aria-hidden className="size-4" /></RowButton>
                <RowButton label={`Turunkan ${label}`} disabled={index === value.length - 1} onClick={() => move(index, 1)}><ChevronDown aria-hidden className="size-4" /></RowButton>
                <RowButton label={`Hapus ${label}`} onClick={() => remove(index)}><X aria-hidden className="size-4" /></RowButton>
              </div>
            </div>
            {open === index && <div id={panelId} className="grid gap-4 border-t border-line bg-cream/45 p-3 sm:p-4">{children(item, (next) => change(index, next))}</div>}
          </div>
        );
      })}
      {removed && <button type="button" className="w-fit py-1 text-xs font-semibold text-maroon underline underline-offset-4" onClick={() => {
        const next = [...value];
        next.splice(removed.index, 0, removed.item);
        setOpen(removed.index);
        onChange(next);
        setRemoved(null);
      }}>Urungkan penghapusan</button>}
      <Button type="button" variant="outline-navy" size="sm" className="mt-1 w-fit" onClick={() => {
        setOpen(value.length);
        onChange([...value, create()]);
      }}>
        <Plus className="size-4" aria-hidden /> Tambah {name.toLowerCase()}
      </Button>
    </div>
  );
}

function referenceOptions(options, current, empty = "Tanpa rujukan") {
  return [["", empty], ...options, ...(current && !options.some(([key]) => key === current) ? [[current, "Rujukan sudah dihapus atau disembunyikan"]] : [])];
}

function Overview({ value, onChange, articles }) {
  const change = (key) => (next) => onChange({ ...value, [key]: next });
  const notice = value.notice;
  const documents = value.docs.filter((doc) => doc.visible).map((doc) => [doc.key, doc.title || "Dokumen baru"]);
  return (
    <>
      <Group title="Pembuka">
        <Fields value={value.copy.hero} onChange={(hero) => change("copy")({ ...value.copy, hero })} specs={[["title", "Judul"], ["accent", "Aksen judul"]]} />
        <Fields value={value} onChange={onChange} specs={[["version", "Edisi pedoman"], ["intro", "Paragraf pengantar", { multiline: 4 }]]} />
        <Lines label="Saran pencarian" {...bind(value, onChange, "suggestions")} />
      </Group>
      <Group title="Pertanyaan populer">
        <EntryList {...bind(value, onChange, "popular")} name="Pertanyaan" describe={(item) => item.question} create={() => ({ question: "", ref: "" })}>
          {(item, update) => <Fields value={item} onChange={update} specs={[["question", "Pertanyaan"], ["ref", "Pasal tujuan", { options: referenceOptions(articles, item.ref, "Pilih pasal") }]]} />}
        </EntryList>
      </Group>
      <Group title="Pengumuman">
        <Fields value={notice} onChange={change("notice")} specs={[
          ["title", "Judul pengumuman", { hint: "Gunakan {version} untuk mengikuti edisi pedoman." }],
          ["body", "Isi pengumuman", { multiline: 3 }],
          ["doc", "Dokumen tujuan", { options: referenceOptions(documents, notice.doc, "Tanpa tindakan") }],
          ["action", "Label tombol"],
        ]} />
        <Flags value={notice} onChange={change("notice")} />
      </Group>
      <Group title="Metadata mesin pencari">
        <Fields value={value.seo} onChange={change("seo")} specs={[["title", "Judul SEO"], ["description", "Deskripsi SEO", { multiline: 3 }]]} />
      </Group>
      <Group title="Tautan di akhir halaman">
        <EntryList {...bind(value, onChange, "links")} name="Tautan" describe={(item) => item.label} create={() => ({ label: "", href: "" })}>
          {(item, update) => <Fields value={item} onChange={update} specs={[["label", "Label tautan"], ["href", "Alamat tautan"]]} />}
        </EntryList>
      </Group>
    </>
  );
}

function Chapters({ value, onChange }) {
  return (
    <>
      <Group title="Susunan pedoman">
        <EntryList {...bind(value, onChange, "chapters")} name="Bab" describe={(chapter) => [chapter.roman, chapter.title].filter(Boolean).join(" · ")} create={newChapter} illustrate>
          {(chapter, update) => <>
            <Fields value={chapter} onChange={update} specs={[["roman", "Nomor bab"], ["title", "Judul bab"]]} />
            <Flags value={chapter} onChange={update} />
            <EntryList {...bind(chapter, update, "pasal")} name="Pasal" describe={(article) => [article.no, article.title].filter(Boolean).join(" · ")} create={newArticle}>
              {(article, updateArticle) => <>
                <Fields value={article} onChange={updateArticle} specs={[
                  ["no", "Nomor pasal"], ["title", "Judul pasal"],
                  ["formal", "Bahasa pedoman", { multiline: 5, hint: `Token tersedia: ${contentTokens}.` }],
                  ["plain", "Bahasa sehari-hari", { multiline: 5 }],
                  ["sim", "Tautan simulator", { options: [["", "Tanpa simulator"], ...Object.entries(kinds)] }],
                ]} />
                <Lines label="Kata kunci pencarian" {...bind(article, updateArticle, "tags")} />
                <Fields value={article.link} onChange={(link) => updateArticle({ ...article, link })} specs={[["label", "Label tautan tambahan"], ["href", "Alamat tautan tambahan"]]} />
                <Flags value={article} onChange={updateArticle} sample={false} />
              </>}
            </EntryList>
          </>}
        </EntryList>
      </Group>
      <Group title="Glosarium">
        <EntryList {...bind(value, onChange, "terms")} name="Istilah" describe={(item) => item.term} create={() => ({ term: "", definition: "" })}>
          {(item, update) => <Fields value={item} onChange={update} specs={[["term", "Istilah"], ["definition", "Definisi", { multiline: 3 }]]} />}
        </EntryList>
      </Group>
    </>
  );
}

const numeric = { number: true };
const simRows = {
  sks: { empty: { min: null, sks: null }, fields: [["sks", "SKS maksimum", numeric]] },
  nilai: { empty: { min: null, letter: "", weight: null }, fields: [["letter", "Huruf mutu"], ["weight", "Bobot", numeric]] },
  predikat: { empty: { min: null, label: "", onTime: false }, fields: [["label", "Nama predikat"]] },
};

function Simulator({ value, onChange, curriculum, articles }) {
  const current = studyVars(value.study, curriculum);
  return (
    <>
      <Group title="Beban dan masa studi">
        <Fields value={value.study} onChange={bind(value, onChange, "study").onChange} specs={[
          ["source", "Sumber total SKS dan semester normal", { options: [["curriculum", "Kurikulum terbit"], ["manual", "Angka manual"]] }],
          ["sks", value.study.source === "manual" ? "Total SKS" : "Total SKS cadangan", numeric],
          ["semester", value.study.source === "manual" ? "Semester normal" : "Semester normal cadangan", numeric],
          ["maximum", "Batas maksimum semester", { number: true, hint: "Kosongkan untuk menghitung batas dari semester normal dan tambahan semester." }],
          ["extra", "Tambahan semester", numeric],
        ]} />
        <output className="text-sm font-medium text-maroon">{current.sks} SKS · {current.semester} semester normal · maksimum {current.maxSemester} semester</output>
      </Group>
      {SIM_TYPES.map((type) => {
        const sim = value.simulator[type];
        const change = (next) => onChange({ ...value, simulator: { ...value.simulator, [type]: next } });
        const shape = simRows[type];
        return (
          <Group key={type} title={kinds[type]}>
            <Fields value={sim} onChange={change} specs={[
              ["title", "Judul simulasi"], ["label", "Label input"],
              ["ref", "Rujukan pasal", { options: referenceOptions(articles, sim.ref) }],
            ]} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Fields value={sim} onChange={change} specs={[["min", "Minimum", numeric], ["max", "Maksimum", numeric], ["step", "Interval", numeric], ["initial", "Nilai awal", numeric]]} />
            </div>
            {type === "nilai" && <Field label="Bobot minimal lulus" {...bind(sim, change, "passWeight")} number />}
            {type === "predikat" && <Flag label="Sakelar tepat waktu aktif saat dibuka" {...bind(sim, change, "onTime")} />}
            <Flag label="Tandai aturan simulasi sebagai contoh" {...bind(sim, change, "sample")} />
            <EntryList {...bind(sim, change, "rows")} name="Aturan" describe={(row) => row.min == null ? "" : `Mulai ${row.min} · ${row.letter ?? row.label ?? row.sks ?? "—"}`} create={() => ({ ...shape.empty })}>
              {(row, update) => <>
                <Fields value={row} onChange={update} specs={[["min", "Ambang bawah", numeric], ...shape.fields]} />
                {type === "predikat" && <Flag label="Hanya untuk kelulusan tepat waktu" {...bind(row, update, "onTime")} />}
              </>}
            </EntryList>
          </Group>
        );
      })}
    </>
  );
}

function Scenarios({ value, onChange, articles }) {
  return (
    <Group title="Situasi dan langkah">
      <EntryList {...bind(value, onChange, "scenarios")} name="Prosedur" describe={(item) => item.title} create={newScenario} illustrate>
        {(item, update) => <>
          <Fields value={item} onChange={update} specs={[
            ["title", "Nama situasi"], ["deadline", "Tenggat"], ["to", "Tujuan"],
            ["ref", "Rujukan pasal", { options: referenceOptions(articles, item.ref) }],
            ["message", "Templat pesan", { multiline: 6, hint: "Nama dan NIM diisi melalui {nama} dan {nim}. Token lain menjadi isian untuk dilengkapi." }],
          ]} />
          <Lines label="Urutan langkah" {...bind(item, update, "steps")} />
          <Lines label="Berkas yang harus disiapkan" {...bind(item, update, "files")} />
          <Flags value={item} onChange={update} />
        </>}
      </EntryList>
    </Group>
  );
}

function Documents({ value, onChange }) {
  return (
    <Group title="Rak dokumen">
      <EntryList {...bind(value, onChange, "docs")} name="Dokumen" describe={(item) => item.title} create={newDocument} illustrate>
        {(item, update) => <>
          <Fields value={item} onChange={update} specs={[
            ["title", "Judul dokumen"], ["short", "Judul pada punggung map"],
            ["href", "URL PDF", { hint: "Gunakan tautan resmi atau alamat berkas dari pustaka Upload Media." }],
            ["image", "URL ilustrasi sampul"], ["tone", "Warna sampul", { options: tones }],
            ["pages", "Jumlah halaman", numeric], ["size", "Ukuran PDF"],
            ["tocMode", "Sumber daftar isi", { options: [["manual", "Tulis sendiri"], ["chapters", "Judul bab yang tampil"]] }],
          ]} />
          {item.tocMode === "manual" && <Lines label="Daftar isi" {...bind(item, update, "toc")} />}
          <Flags value={item} onChange={update} />
        </>}
      </EntryList>
    </Group>
  );
}

function InterfaceCopy({ value, onChange }) {
  return (
    <>
      <Group title="Tirai pembuka">
        <Fields value={value.curtain} onChange={bind(value, onChange, "curtain").onChange} specs={[["kicker", "Nama program"], ["title", "Judul"], ["accent", "Aksen judul"], ["label", "Label memuat"]]} />
      </Group>
      {Object.entries(COPY_GROUPS).map(([key, label]) => (
        <details key={key} className="rounded-md border border-line bg-white">
          <summary className="cursor-pointer px-4 py-3 font-serif text-[1.15rem] text-maroon">{label}</summary>
          <div className="grid gap-4 border-t border-line px-4 py-4 sm:grid-cols-2">
            {Object.entries(COPY[key]).filter(([field]) => key !== "hero" || !["title", "accent"].includes(field)).map(([field, original]) => {
              const tokens = [...new Set(original.match(/\{\w+\}/g) ?? [])];
              return <Field
                key={field}
                label={COPY_LABELS[field]}
                value={value.copy[key][field]}
                onChange={(next) => onChange({ ...value, copy: { ...value.copy, [key]: { ...value.copy[key], [field]: next } } })}
                options={field === "mascotPose" ? [["", "Sembunyikan"], ...MASCOT_POSES.map((pose) => [pose, poses[pose]])] : undefined}
                hint={field.endsWith("Illustration") ? "Alamat /lottie/nama.json. Kosongkan untuk menyembunyikan." : tokens.length ? `Token tersedia: ${tokens.join(", ")}.` : undefined}
                multiline={original.length > 85 ? 3 : undefined}
              />;
            })}
          </div>
        </details>
      ))}
    </>
  );
}

const editors = { overview: Overview, chapters: Chapters, simulator: Simulator, scenarios: Scenarios, documents: Documents, interface: InterfaceCopy };

export function RegulasiFields({ section, value, onChange, curriculum }) {
  const Editor = editors[section];
  const articles = value.chapters.filter((chapter) => chapter.visible).flatMap((chapter) =>
    chapter.pasal.filter((item) => item.visible).map((item) => [item.id, [item.no, item.title].filter(Boolean).join(" · ") || "Pasal baru"])
  );
  return <Editor value={value} onChange={onChange} curriculum={curriculum} articles={articles} />;
}
