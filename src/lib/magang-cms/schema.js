import { FIELDS, MODES, initials, mergeMagang } from "../magang-content.js";
import { COPY, STAGES, interpolate } from "./copy.js";

export const LEGACY = "magang";
export const LIVE = "magang:terbit";
export const DRAFT = "magang:draf";
export const MAGANG_SECTIONS = [LEGACY, LIVE, DRAFT];
export const MAGANG_PREVIEW_EVENT = "sisfor:magang:preview";

export const BLOCKS = {
  hero: "Pembuka",
  routes: "Jalur magang",
  jobs: "Lowongan",
  tracker: "Jejak lamaran",
  logbook: "Logbook dan berkas",
  closing: "Penutup",
};
const OPTIONAL = Object.keys(BLOCKS).filter((key) => key !== "hero");

const DEFAULT_STOPS = [
  { key: "bidang", href: "/bidang-keahlian", step: "Sebelum", title: "Bidang keahlian", body: "Cocokkan posisi dengan minatmu.", highlight: "before" },
  { key: "magang", href: "", step: "Sekarang", title: "Magang", body: "{course} · {sks} SKS", highlight: "here" },
  { key: "konversi", href: "/konversi-sks#alur", step: "Sesudah", title: "Konversi SKS", body: "Ajukan agar magang diakui.", highlight: "after" },
  { key: "tugas-akhir", href: "/jalur-kelulusan", step: "Semester {semester}+", title: "Tugas akhir", body: "Jadikan temuan magang topiknya.", highlight: "none" },
];

export function initialMagang(row) {
  const legacy = mergeMagang(row);
  const safe = (href) => validMagangUrl(href) ? href : "";
  return {
    seo: {
      title: "Magang — Sistem Informasi UISI",
      description: "Kerja Praktik, Magang Mandiri, dan Program Dikti untuk mahasiswa S1 Sistem Informasi UISI: lowongan dari mitra industri, pelacak lamaran, dan berkas administrasi magang.",
      image: "/img/logo.png",
    },
    blocks: OPTIONAL.map((key) => ({ key, visible: true })),
    intro: legacy.intro.body,
    copy: structuredClone(COPY),
    kp: { source: "curriculum", courseId: "", nama: "Kerja Praktik", sks: 2, semester: 7 },
    routes: legacy.routes.map((route) => ({ ...route, alt: "", facts: route.facts.map((fact, i) => ({ ...fact, key: route.key + "-" + (i + 1) })) })),
    jobs: legacy.jobs.map((job) => ({ ...job, href: safe(job.href), logo: "", deadline: isMagangDate(job.deadline) ? job.deadline : "", sample: legacy.jobsSample })),
    jobOrder: "deadline",
    fields: FIELDS.map((field) => ({ ...field, href: "/bidang-keahlian#bidang-" + field.key })),
    modes: structuredClone(MODES),
    stages: structuredClone(STAGES),
    notice: {
      visible: !!legacy.notice, title: legacy.notice?.title ?? "", body: legacy.notice?.body ?? "",
      sample: !!legacy.notice?.sample, actionLabel: "", actionHref: "", calendarSource: legacy.notice?.event ? "legacy" : "none",
      date: "", time: "", place: "",
    },
    logbook: legacy.logbook.map((chapter) => ({
      ...chapter, sample: true, entries: chapter.entries.map((entry, i) => ({ ...entry, key: chapter.key + "-" + (i + 1), doc: entry.doc ?? "" })),
    })),
    docs: legacy.docs.map((doc) => ({ ...doc, href: safe(doc.href), sample: doc.sample || !safe(doc.href) })),
    stops: structuredClone(DEFAULT_STOPS),
  };
}

const hasKey = (items, key) => items.some((item) => item.key === key);
const fail = (label, help) => { throw new Error(label + " " + help); };
const object = (value, label) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(label, "harus berupa objek.");
  return value;
};
const string = (value, label, max = 1000, required = false) => {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) fail(label, required ? "wajib diisi dan maksimal " + max + " karakter." : "maksimal " + max + " karakter.");
  return value.trim();
};
const bool = (value, label) => {
  if (typeof value !== "boolean") fail(label, "harus berupa pilihan ya atau tidak.");
  return value;
};
const integer = (value, label, min, max) => {
  if (!Number.isInteger(value) || value < min || value > max) fail(label, "harus di antara " + min + " dan " + max + ".");
  return value;
};
const choices = (value, options, label) => {
  if (!options.includes(value)) fail(label, "pilih nilai yang tersedia.");
  return value;
};
const keyOf = (value, label) => {
  if (typeof value !== "string" || !/^[a-z0-9_-]{1,110}$/i.test(value) || value === "all") fail(label, "ID tidak valid.");
  return value;
};

export function validMagangUrl(value, type = "link") {
  if (!value) return true;
  if (/[\u0000-\u0020\u007f\\]/.test(value)) return false;
  if (type === "lottie") return /^\/lottie\/[a-z0-9_-]+\.json$/i.test(value);
  if (type === "link" && /^#[a-z0-9_-]+$/i.test(value)) return true;
  if (/^\/(?!\/)/.test(value)) {
    try {
      const decoded = decodeURIComponent(value);
      return !/^\/[/\\]/.test(decoded) && !/[\u0000-\u001f\u007f\\]/.test(decoded);
    } catch {
      return false;
    }
  }
  try {
    const url = new URL(value);
    return /^https:\/\//i.test(value) && url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

const url = (value, label, type) => {
  const href = string(value, label, 2000);
  if (!validMagangUrl(href, type)) fail(label, type === "lottie" ? "pilih aset Lottie situs." : "gunakan alamat HTTPS atau path situs yang valid.");
  return href;
};

const rows = (value, label, max, fn, id = "key") => {
  if (!Array.isArray(value) || value.length > max) fail(label, "maksimal " + max + " entri.");
  const result = value.map((item, i) => fn(object(item, label), label + " " + (i + 1)));
  if (id && new Set(result.map((item) => item[id])).size !== result.length) fail(label, "memiliki ID yang berulang.");
  return result;
};

const lines = (value, label, max = 24) => {
  if (!Array.isArray(value) || value.length > max) fail(label, "maksimal " + max + " baris.");
  return value.map((line) => string(line, label, 500)).filter(Boolean);
};

export function isMagangDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value;
}

const date = (value, label) => {
  if (value !== "" && (typeof value !== "string" || !isMagangDate(value))) fail(label, "masukkan tanggal yang valid.");
  return value;
};

const time = (value, label) => {
  if (value !== "" && (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value))) fail(label, "masukkan jam yang valid.");
  return value;
};

export function validateMagang(input, { publish = false } = {}) {
  const v = object(input, "Konten");
  const seo = object(v.seo, "SEO");
  const kp = object(v.kp, "Kerja Praktik");
  const notice = object(v.notice, "Pengumuman");
  const copy = object(v.copy, "Teks halaman");
  const blocks = rows(v.blocks, "Susunan", OPTIONAL.length, (row, label) => ({
    key: choices(row.key, OPTIONAL, label), visible: bool(row.visible, label),
  }));
  if (blocks.length !== OPTIONAL.length) fail("Susunan", "harus memuat semua blok opsional.");
  const has = (key) => publish && blocks.some((block) => block.key === key && block.visible);
  const text = (item, key, label, required = false, max = 1000) => string(item[key], label, max, required);
  const options = (items, label, withLink = false) => rows(items, label, 40, (row, path) => ({
    key: keyOf(row.key, path), label: text(row, "label", path, publish, 100),
    ...(withLink && { href: url(row.href, path) }),
  }));
  const result = {
    seo: { title: text(seo, "title", "Judul SEO", publish, 170), description: text(seo, "description", "Deskripsi SEO", publish, 350), image: url(seo.image, "Gambar SEO", "image") },
    blocks,
    intro: text(v, "intro", "Pengantar", false, 2500),
    copy: Object.fromEntries(Object.entries(COPY).map(([group, defaults]) => {
      const fields = object(copy[group], BLOCKS[group] ?? group);
      return [group, Object.fromEntries(Object.entries(defaults).map(([key, example]) => {
        const label = (BLOCKS[group] ?? group) + " · " + (example || key);
        const media = { image: "image", cardImage: "image", illustration: "lottie", href: "link", creditsHref: "link", homeHref: "link" }[key];
        const heading = key === "title" && (group === "hero" ? publish : has(group));
        const required = heading || (publish && ["breadcrumbAria", "close", "dismiss"].includes(key));
        const translated = media ? url(fields[key], label, media) : string(fields[key], label, key === "title" ? 160 : 1000, required);
        if (key === "mascot") choices(translated, ["", "wave", "thumbs-up", "confident", "proud", "run", "think", "laugh"], label);
        const tokens = [...translated.matchAll(/\{(\w+)\}/g)].map((match) => match[0]);
        if (tokens.some((token) => !example.includes(token))) fail(label, "memuat variabel yang tidak tersedia.");
        return [key, translated];
      }))];
    })),
    kp: {
      source: choices(kp.source, ["curriculum", "manual", "hidden"], "Sumber Kerja Praktik"),
      courseId: text(kp, "courseId", "Mata kuliah terkait", false, 110),
      nama: text(kp, "nama", "Nama mata kuliah", publish && kp.source === "manual", 140),
      sks: integer(kp.sks, "SKS", 0, 30), semester: integer(kp.semester, "Semester", 1, 30),
    },
    routes: rows(v.routes, "Jalur", 30, (row, path) => ({
      key: keyOf(row.key, path), title: text(row, "title", path + " · nama", publish, 140), tag: text(row, "tag", path + " · keterangan", false, 90),
      image: url(row.image, path + " · foto", "image"), alt: text(row, "alt", path + " · alt text", false, 200),
      lottie: url(row.lottie, path + " · animasi", "lottie"), lead: text(row, "lead", path + " · ringkasan"),
      forWho: text(row, "forWho", path + " · cocok untuk"), sample: bool(row.sample, path),
      facts: rows(row.facts, path + " · fakta", 16, (fact, label) => ({
        key: keyOf(fact.key, label), k: text(fact, "k", label + " · label", publish, 110), v: text(fact, "v", label + " · nilai", publish, 500),
      })),
    })),
    fields: options(v.fields, "Bidang", true), modes: options(v.modes, "Lokasi kerja"),
    stages: options(v.stages, "Tahap lamaran"),
    jobOrder: choices(v.jobOrder, ["deadline", "manual"], "Urutan lowongan"),
    jobs: rows(v.jobs, "Lowongan", 300, (row, path) => ({
      slug: keyOf(row.slug, path), title: text(row, "title", path + " · posisi", publish, 160),
      company: text(row, "company", path + " · perusahaan", publish, 160),
      logo: text(row, "logo", path + " · inisial", false, 8),
      field: text(row, "field", path + " · bidang", false, 110),
      mode: text(row, "mode", path + " · lokasi", false, 110),
      program: text(row, "program", path + " · jalur", false, 110),
      duration: text(row, "duration", path + " · durasi", false, 100),
      deadline: date(row.deadline, path + " · tenggat"), href: url(row.href, path + " · tautan"),
      tasks: lines(row.tasks, path + " · tugas"), needs: lines(row.needs, path + " · syarat"),
      sample: bool(row.sample, path),
    }), "slug"),
    notice: {
      visible: bool(notice.visible, "Pengumuman"), title: text(notice, "title", "Judul pengumuman", has("jobs") && notice.visible, 180),
      body: text(notice, "body", "Isi pengumuman"), sample: bool(notice.sample, "Status contoh pengumuman"),
      actionLabel: text(notice, "actionLabel", "Tombol pengumuman", has("jobs") && notice.visible && !!notice.actionHref, 100),
      actionHref: url(notice.actionHref, "Tautan pengumuman"),
      calendarSource: choices(notice.calendarSource, ["none", "legacy", "manual"], "Kalender"),
      date: date(notice.date, "Tanggal pengumuman"), time: time(notice.time, "Jam pengumuman"),
      place: text(notice, "place", "Lokasi pengumuman", false, 250),
    },
    logbook: rows(v.logbook, "Bab logbook", 40, (row, path) => ({
      key: keyOf(row.key, path), title: text(row, "title", path + " · judul", publish, 160), sample: bool(row.sample, path),
      entries: rows(row.entries, path + " · langkah", 50, (entry, label) => ({
        key: keyOf(entry.key, label), text: text(entry, "text", label + " · teks", publish, 500),
        doc: text(entry, "doc", label + " · berkas", false, 110),
      })),
    })),
    docs: rows(v.docs, "Berkas", 100, (row, path) => ({
      key: keyOf(row.key, path), title: text(row, "title", path + " · judul", publish, 160),
      kind: text(row, "kind", path + " · jenis", false, 100), pages: integer(row.pages, path + " · halaman", 0, 9999),
      href: url(row.href, path + " · tautan"), outline: lines(row.outline, path + " · isi"),
      sample: bool(row.sample, path),
    })),
    stops: rows(v.stops, "Tautan penutup", 30, (row, path) => ({
      key: keyOf(row.key, path), href: url(row.href, path + " · tautan"),
      step: text(row, "step", path + " · label", false, 120), title: text(row, "title", path + " · judul", publish, 150),
      body: text(row, "body", path + " · ringkasan"),
      highlight: choices(row.highlight, ["none", "before", "after", "here"], path),
    })),
  };

  if (result.stages.map((stage) => stage.key).join() !== STAGES.map((stage) => stage.key).join()) fail("Tahap lamaran", "urutan status harus dipertahankan.");
  if (!publish) return result;
  for (const job of result.jobs) {
    const references = [[result.routes, job.program, "jalur"], [result.fields, job.field, "bidang"], [result.modes, job.mode, "lokasi"]];
    for (const [items, key, label] of references) {
      if (key && !hasKey(items, key)) fail("Lowongan “" + job.title + "”", "merujuk " + label + " yang sudah dihapus.");
    }
  }
  for (const chapter of result.logbook) {
    for (const entry of chapter.entries) {
      if (entry.doc && !hasKey(result.docs, entry.doc)) fail("Bab “" + chapter.title + "”", "merujuk berkas yang sudah dihapus.");
    }
  }
  if (has("jobs") && result.notice.visible && result.notice.calendarSource === "manual" && (!result.notice.date || !result.notice.time)) {
    fail("Kalender pengumuman", "isi tanggal dan jam acara dalam WIB.");
  }
  return result;
}

export function resolveMagang(value, courses = []) {
  const { kp, notice, copy } = value;
  const course = kp.source === "curriculum" && (kp.courseId
    ? courses.find((item) => String(item.id) === kp.courseId)
    : courses.find((item) => /kerja praktik/i.test(item.nama)));
  const details = kp.source === "hidden" ? null : course
    ? { nama: course.nama, sks: course.sks, semester: course.semester, slug: course.slug }
    : { nama: kp.nama, sks: kp.sks, semester: kp.semester, slug: null };

  const legacyEvent = notice.calendarSource === "legacy" ? mergeMagang(null).notice?.event : null;
  const startAt = notice.calendarSource === "manual" && notice.date && notice.time ? notice.date + "T" + notice.time + ":00+07:00" : null;
  return {
    ...value,
    kp: details,
    intro: { body: value.intro },
    jobs: value.jobs.map((job) => ({ ...job, logo: job.logo || initials(job.company) || "?", duration: job.duration || copy.jobs.durationMissing })),
    notice: notice.visible ? { ...notice, legacyEvent, startAt } : null,
  };
}

const SECTION_FOR_HASH = { "#pintu": "routes", "#lowongan": "jobs", "#jejak": "tracker", "#logbook": "logbook" };

export function magangLink(data, href) {
  const hash = href.startsWith("/magang#") ? href.slice(7) : href;
  const block = SECTION_FOR_HASH[hash] ?? (hash.startsWith("#pintu-") ? "routes" : hash.startsWith("#lowongan-") ? "jobs" : "");
  return !block || data.blocks.some((item) => item.key === block && item.visible) ? href : "";
}

export function kpText(template, kp) {
  if (!kp && /\{(?:course|semester|sks)\}/.test(template)) return "";
  return interpolate(template, { course: kp?.nama, semester: kp?.semester, sks: kp?.sks });
}
