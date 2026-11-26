import { CAP, LIMITS, RATE, SEMESTER_WEEKS, creditsFor, mergeKonversi } from "../konversi-content.js";
import { eventDate } from "../ics.js";
import { COPY, konversiText } from "./copy.js";

export const LEGACY = "konversi-sks";
export const LIVE = "konversi-sks:terbit";
export const DRAFT = "konversi-sks:draf";
export const KONVERSI_SECTIONS = [LEGACY, LIVE, DRAFT];

export const BLOCKS = {
  hero: "Pembuka",
  calculator: "Meja konversi",
  steps: "Alur pengajuan",
  notice: "Pengumuman",
  examples: "Contoh transkrip",
  closing: "Penutup",
};

export const DEFAULT_RULES = {
  rate: RATE, semesterWeeks: SEMESTER_WEEKS, cap: CAP, transferRatio: 1, rounding: "floor", limits: LIMITS, sample: true,
};

export const POSES = ["wave", "thumbs-up", "think", "run", "confident", "laugh", "proud"];

const DEFAULT_LINKS = [
  { key: "magang", program: "magang", href: "/magang#lowongan", kicker: "Belum punya tempat?", title: "Cari lowongan magang" },
  { key: "kurikulum", fallback: true, href: "/curiculum", kicker: "Sebelum memilih", title: "Pelajari isi mata kuliahnya" },
  { key: "peminatan", href: "/bidang-keahlian", kicker: "Supaya searah", title: "Pilih kegiatan sesuai peminatanmu" },
  { key: "kelulusan", href: "/jalur-kelulusan", kicker: "Kegiatanmu berbuah karya?", title: "Jadikan jalur kelulusan" },
];

export const DEFAULT_SEO = {
  title: "Konversi SKS — Sistem Informasi UISI",
  description: "Hitung berapa SKS yang setara dengan magang, studi independen, riset, atau kegiatan MBKM lain, pilih mata kuliah penggantinya, dan ikuti enam langkah pengajuan konversi di S1 Sistem Informasi UISI.",
  image: "",
};

const byId = (courses) => new Map(courses.map((c) => [String(c.id), c]));

export function readKonversiValue(value) {
  const copy = Object.fromEntries(Object.entries(COPY).map(([group, fields]) => [group, { ...fields, ...value.copy?.[group] }]));
  return { ...value, copy };
}

function rankLegacy(courses, program) {
  const pin = program.pin ? new RegExp(program.pin, "i") : null;
  const pref = (course) => {
    const index = program.prefer.indexOf(course.rumpun);
    return index < 0 ? 9 : index;
  };
  return [...courses].sort((a, b) => Number(!!pin?.test(b.nama)) - Number(!!pin?.test(a.nama))
    || pref(a) - pref(b) || (a.semester ?? 9) - (b.semester ?? 9));
}

export function initialKonversi(legacy, catalog = []) {
  const old = mergeKonversi(legacy, { kurikulum: { courses: catalog } });
  const ids = new Map(catalog.map((c) => [c.slug, String(c.id)]));
  const event = old.notice?.event;
  const date = event ? eventDate(event) : null;
  const wib = date && !Number.isNaN(date.getTime()) ? new Date(date.getTime() + 7 * 3600000).toISOString().slice(0, 16) : "";
  return {
    blocks: Object.keys(BLOCKS).map((key) => ({ key, visible: true })),
    copy: structuredClone(COPY),
    seo: { ...DEFAULT_SEO },
    intro: old.intro.body,
    rules: { ...structuredClone(DEFAULT_RULES), cap: old.cap, sample: old.rulesSample },
    eligible: old.courses.map((c) => ids.get(c.slug)),
    programs: old.programs.map((p) => ({
      key: p.key, label: p.label, lead: p.lead, mode: p.mode,
      weeks: p.weeks ?? 16, hours: p.hours ?? 40, sks: p.sks ?? 18,
      recommended: rankLegacy(old.courses, p).map((c) => ids.get(c.slug)),
    })),
    stepsSample: true,
    steps: old.steps.map((step) => ({ ...step, doc: step.doc ?? "", link: step.link ?? { href: "", label: "" } })),
    examplesSample: true,
    cases: old.cases.map(({ key, label, program, weeks, hours, rows }) => ({
      key, label, program, weeks, hours, sks: 18, rows: rows.map((row) => ({ courseId: ids.get(row.course.slug), grade: row.grade })),
    })),
    docs: old.docs.map((d) => ({
      ...d, column: d.key === "la" ? "Bobot" : "Nilai", blank: d.key === "la" ? "__%" : "__",
      signers: d.key === "la" ? ["Mahasiswa", "Koordinator", "Mitra"] : ["Pendamping", "Koordinator", "Kaprodi"],
    })),
    notice: {
      title: old.notice?.title ?? "", body: old.notice?.body ?? "", sample: old.notice?.sample ?? false,
      action: "", href: "", calendarAt: wib, calendarTitle: event?.title ?? "", place: event?.place ?? "",
    },
    links: DEFAULT_LINKS.map((link) => ({ program: "", fallback: false, ...link })),
  };
}

export function resolveKonversi(value, catalog) {
  const base = byId(catalog);
  const eligible = value.eligible.map((id) => base.get(id)).filter(Boolean);
  const courses = eligible.map((c) => ({
    id: String(c.id), slug: c.slug, nama: c.nama, sks: c.sks, semester: c.semester, track: c.track ?? null, rumpun: c.rumpun,
    cpmk: (c.rps?.cpmk ?? []).slice(0, 3).map((item) => typeof item === "string" ? item : item.teks).filter(Boolean),
  }));
  const listed = byId(courses);
  const programs = new Set(value.programs.map((p) => p.key));
  const docs = new Set(value.docs.map((d) => d.key));
  return {
    ...readKonversiValue(value),
    intro: { body: value.intro },
    courses,
    steps: value.steps.map((step) => ({ ...step, doc: docs.has(step.doc) ? step.doc : "", link: step.link.href ? step.link : null })),
    cases: value.cases.filter((item) => programs.has(item.program)).map((item) => ({
      ...item, rows: item.rows.map((row) => ({ course: listed.get(row.courseId), grade: row.grade })).filter((row) => row.course),
    })).filter((item) => item.rows.length),
  };
}

export function creditEstimate(input, rules = DEFAULT_RULES) {
  return Math.min(creditsFor(input, rules), rules.cap);
}

export function validUrl(value, type = "link") {
  if (value === "") return true;
  if (type === "lottie") return /^\/lottie\/[a-z0-9_-]+\.json$/i.test(value);
  if (/[\s\\\u0000-\u001f\u007f]/u.test(value)) return false;
  if (/^\/(?!\/)/.test(value)) return true;
  if (type === "link" && /^(?:#[a-z][\w-]*|mailto:[^?]+|tel:\+?[\d-]+)$/i.test(value)) return true;
  if (!/^https?:\/\//i.test(value)) return false;
  try {
    const url = new URL(value);
    return Boolean(url.hostname && !url.username && !url.password);
  } catch {
    return false;
  }
}

export function clampInput(value, [min, max], fallback) {
  const n = Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(max, Math.max(min, n));
}

export function fitCourses(slugs, courses, credits) {
  const bySlug = new Map(courses.map((course) => [course.slug, course]));
  const selected = new Set();
  let remaining = credits;
  for (const slug of slugs) {
    const course = bySlug.get(slug);
    if (!course || selected.has(slug) || course.sks > remaining) continue;
    selected.add(slug);
    remaining -= course.sks;
  }
  return [...selected];
}

export function rankCourses(courses, program) {
  const order = new Map(program.recommended.map((id, index) => [id, index]));
  return [...courses].sort((a, b) => (order.get(a.id) ?? order.size) - (order.get(b.id) ?? order.size));
}

const invalid = (label, message) => { throw new Error(label + " · " + message); };
const unique = (items, label) => new Set(items).size === items.length || invalid(label, "Entri ganda.");
const text = (value, label, { required = false, max = 3500 } = {}) => {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) invalid(label, "Teks belum lengkap atau terlalu panjang.");
  return value;
};
const numeric = (value, label, min, max, integer = true) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
    invalid(label, "Masukkan angka antara " + min + " dan " + max + ".");
  }
  return value;
};
const object = (value, label) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid(label, "Isian tidak valid.");
  return value;
};
const list = (value, label, max = 100) => {
  if (!Array.isArray(value) || value.length > max) invalid(label, "Daftar tidak valid atau terlalu panjang.");
  return value;
};
const flag = (value, label) => {
  if (typeof value !== "boolean") invalid(label, "Pilihan tidak valid.");
  return value;
};
const key = (value, label) => {
  if (typeof value !== "string" || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(value)) invalid(label, "ID tidak valid.");
  return value;
};
const url = (value, label, type) => {
  if (!validUrl(text(value, label, { max: 1024 }), type)) invalid(label, "Tautan tidak valid.");
  return value;
};
const titleList = (value, label, max) => list(value, label, max).map((item) => text(item, label, { max: 350 }).trim()).filter(Boolean);

export function validateKonversi(value, { publish = false, catalog = [] } = {}) {
  object(value, "Halaman");
  const required = { required: publish };
  const copy = Object.fromEntries(Object.entries(COPY).map(([group, fields]) => {
    const incoming = object(value.copy?.[group], group);
    return [group, Object.fromEntries(Object.entries(fields).map(([name, example]) => {
      const label = group + "." + name;
      const field = text(incoming[name], label, { max: 1400 });
      // URL templates have a fixed set of interpolation tokens.
      const tokens = new Set([...example.matchAll(/\{\w+\}/g)].map(([token]) => token));
      if ([...field.matchAll(/\{\w+\}/g)].some(([token]) => !tokens.has(token))) invalid(label, "Variabel teks tidak dikenal.");
      if (name === "illustration") url(field, label, "lottie");
      if (name.endsWith("Href")) url(konversiText(field, { slug: "mata-kuliah" }), label);
      if (name === "pose" && field && !POSES.includes(field)) invalid(label, "Pilih pose Elvo yang tersedia.");
      return [name, field];
    }))];
  }));
  if (publish && !copy.hero.title.trim() && !copy.hero.accent.trim()) invalid("Pembuka", "Isi salah satu baris judul.");

  const blocks = list(value.blocks, "Blok", Object.keys(BLOCKS).length).map((item) => {
    const { key: id, visible } = object(item, "Blok");
    if (!Object.hasOwn(BLOCKS, id)) invalid("Blok", "Jenis blok tidak tersedia.");
    return { key: id, visible: flag(visible, "Visibilitas") };
  });
  unique(blocks.map((block) => block.key), "Blok");
  if (blocks.length !== Object.keys(BLOCKS).length) invalid("Blok", "Daftar blok tidak lengkap.");

  const seo = object(value.seo, "SEO");
  const r = object(value.rules, "Aturan konversi");
  const limits = Object.fromEntries(Object.keys(LIMITS).map((id) => {
    const range = list(r.limits?.[id], id, 2);
    const best = id === "hours" ? 168 : id === "weeks" ? 104 : 99;
    return [id, [numeric(range[0], id, 0, best), numeric(range[1], id, range[0], best)]];
  }));
  const rules = {
    rate: numeric(r.rate, "Menit per SKS", 1, 1440),
    semesterWeeks: numeric(r.semesterWeeks, "Minggu per semester", 1, 104),
    cap: numeric(r.cap, "Batas SKS", 1, 99),
    transferRatio: numeric(r.transferRatio, "Rasio transfer", 0.01, 10, false),
    rounding: ["floor", "nearest", "ceil"].includes(r.rounding) ? r.rounding : invalid("Pembulatan", "Pilihan tidak valid."),
    sample: flag(r.sample, "Status aturan"),
    limits,
  };
  const known = byId(catalog);
  const courseId = (id, label) => text(id, label, { max: 200 });
  const eligible = list(value.eligible, "Mata kuliah", 800).map((id) => courseId(id, "Mata kuliah"));
  unique(eligible, "Mata kuliah");
  if (publish && eligible.some((id) => !known.has(id))) invalid("Mata kuliah", "Hapus mata kuliah yang sudah tidak ada di Kurikulum terbit.");
  const selected = new Set(eligible);
  const modeOf = new Map();

  const activity = (item, label) => ({
    weeks: numeric(item.weeks, label + " · minggu", ...(item.mode === "jam" ? limits.weeks : [0, 104])),
    hours: numeric(item.hours, label + " · jam", ...(item.mode === "jam" ? limits.hours : [0, 168])),
    sks: numeric(item.sks, label + " · SKS", ...(item.mode === "sks" ? limits.sks : [0, 99])),
  });
  const programs = list(value.programs, "Kegiatan", 50).map((item) => {
    const p = object(item, "Kegiatan");
    const id = key(p.key, "Kegiatan");
    const label = p.label || id;
    if (!["jam", "sks"].includes(p.mode)) invalid(label, "Mode konversi tidak valid.");
    const recommended = list(p.recommended, label, 800).map((course) => courseId(course, label));
    unique(recommended, label);
    if (publish && recommended.some((course) => !selected.has(course))) invalid(label, "Rekomendasi harus dipilih di daftar mata kuliah pengganti.");
    modeOf.set(id, p.mode);
    return { key: id, label: text(p.label, label, required), lead: text(p.lead, label), mode: p.mode, ...activity(p, label), recommended };
  });
  unique(programs.map((item) => item.key), "Kegiatan");

  const docs = list(value.docs, "Templat", 50).map((item) => {
    const d = object(item, "Templat");
    const label = d.title || "Templat";
    return {
      key: key(d.key, label), title: text(d.title, label, required), kind: text(d.kind, label),
      pages: numeric(d.pages, label, 1, 999), href: url(d.href, label, "file"), outline: titleList(d.outline, label, 80),
      column: text(d.column, label), blank: text(d.blank, label), signers: titleList(d.signers, label, 12),
      sample: flag(d.sample, label),
    };
  });
  unique(docs.map((item) => item.key), "Templat");
  const docIds = new Set(docs.map((d) => d.key));
  const steps = list(value.steps, "Tahap", 40).map((item) => {
    const s = object(item, "Tahap");
    const label = s.title || "Tahap";
    const link = object(s.link, label);
    const doc = text(s.doc, label);
    if (publish && doc && !docIds.has(doc)) invalid(label, "Templat yang dipilih sudah dihapus.");
    return {
      key: key(s.key, label), title: text(s.title, label, required), who: text(s.who, label), output: text(s.output, label),
      when: text(s.when, label), body: text(s.body, label), doc,
      link: { href: url(link.href, label), label: text(link.label, label, { required: publish && !!link.href }) },
    };
  });
  unique(steps.map((item) => item.key), "Tahap");

  const cases = list(value.cases, "Contoh transkrip", 40).map((item) => {
    const c = object(item, "Contoh transkrip");
    const label = c.label || "Contoh transkrip";
    if (publish && !modeOf.has(c.program)) invalid(label, "Pilih kegiatan yang tersedia.");
    const rows = list(c.rows, label).map((row) => {
      object(row, label);
      const id = courseId(row.courseId, label);
      if (publish && !selected.has(id)) invalid(label, "Pilih mata kuliah dari daftar mata kuliah pengganti.");
      return { courseId: id, grade: text(row.grade, label, { max: 20, ...required }) };
    });
    unique(rows.map((row) => row.courseId), label);
    if (publish && !rows.length) invalid(label, "Tambahkan mata kuliah untuk contoh ini.");
    return { key: key(c.key, label), label: text(c.label, label, required), program: text(c.program, label), ...activity({ ...c, mode: modeOf.get(c.program) }, label), rows };
  });
  unique(cases.map((item) => item.key), "Contoh transkrip");

  const n = object(value.notice, "Pengumuman");
  const calendarAt = text(n.calendarAt, "Jadwal pengumuman", { max: 16 });
  if (calendarAt) {
    const date = new Date(calendarAt + "Z");
    if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 16) !== calendarAt) invalid("Jadwal pengumuman", "Tanggal WIB tidak valid.");
  }
  const notice = {
    title: text(n.title, "Judul pengumuman"), body: text(n.body, "Isi pengumuman"),
    sample: flag(n.sample, "Status pengumuman"), href: url(n.href, "Tautan pengumuman"),
    action: text(n.action, "Tombol pengumuman", { required: publish && !!n.href }),
    calendarAt, calendarTitle: text(n.calendarTitle, "Judul kalender"), place: text(n.place, "Lokasi"),
  };

  const links = list(value.links, "Tautan penutup", 40).map((item) => {
    const l = object(item, "Tautan penutup");
    const label = l.title || "Tautan penutup";
    const program = text(l.program, label);
    if (publish && program && !modeOf.has(program)) invalid(label, "Kegiatan untuk tautan ini sudah dihapus.");
    if (publish && !l.href) invalid(label, "Isi alamat tautan.");
    return { key: key(l.key, label), title: text(l.title, label, required), kicker: text(l.kicker, label), href: url(l.href, label), program, fallback: flag(l.fallback, label) };
  });
  unique(links.map((link) => link.key), "Tautan penutup");

  return {
    blocks, copy, rules, eligible, programs, cases, docs, notice, links, steps,
    seo: { title: text(seo.title, "Judul SEO", required), description: text(seo.description, "Deskripsi SEO", required), image: url(seo.image, "Gambar SEO", "file") },
    intro: text(value.intro, "Isi pembuka"),
    stepsSample: flag(value.stepsSample, "Status alur"),
    examplesSample: flag(value.examplesSample, "Status contoh"),
  };
}
