import { CHAPTERS, DOCS, GRADES, INTRO, PREDIKAT, SCENARIOS, SKS_RULES, TERMS } from "../regulasi-content.js";
import { COPY, fillRegulasi } from "./copy.js";

export const LEGACY = "regulasi-akademik";
export const LIVE = "regulasi-cms:live";
export const DRAFT = "regulasi-cms:draft";
export const REGULASI_SECTIONS = [LEGACY, LIVE, DRAFT];
export const PREVIEW_URL = "/admin/regulasi-akademik/pratinjau";
export const PREVIEW_EVENT = "sisfor:regulasi-preview";

const keyPattern = /^[a-z0-9][a-z0-9-]{0,79}$/;
const articleId = (no) => String(no).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const byKey = (list, key) => Array.isArray(list) ? list.find((item) => item?.key === key) ?? {} : {};
const asText = (value, fallback = "") => typeof value === "string" ? value : fallback;
const asList = (value, fallback = []) => Array.isArray(value) ? value.filter((item) => typeof item === "string") : fallback;
const text = (input, max = 800) => typeof input === "string" && input.length <= max;
const validKey = (input) => typeof input === "string" && keyPattern.test(input);
const finite = (input, min, max) => typeof input === "number" && Number.isFinite(input) && input >= min && input <= max;
const integer = (input, min, max) => finite(input, min, max) && Number.isInteger(input);
const runtimeNumber = (value, fallback) => Number.isFinite(value) ? value : fallback;

export const SIM_TYPES = ["sks", "nilai", "predikat"];
export const MASCOT_POSES = ["wave", "thumbs-up", "confident", "proud", "run", "think", "laugh"];
const SIM_DEFAULTS = {
  sks: { ref: "1-3", title: "Berapa SKS boleh kuambil semester depan?", label: "IPS semester ini", initial: 3.12, min: 0, max: 4, step: 0.01, sample: true, rows: SKS_RULES },
  nilai: { ref: "2-1", title: "Nilai angkaku jadi huruf apa?", label: "Nilai akhir", initial: 79, min: 0, max: 100, step: 1, sample: true, passWeight: 2, rows: GRADES },
  predikat: { ref: "5-4", title: "Predikat apa yang kudapat saat lulus?", label: "IPK akhir", initial: 3.62, min: 2, max: 4, step: 0.01, sample: true, onTime: true, rows: PREDIKAT.map((row) => ({ ...row, onTime: !!row.onTime })) },
};

const POPULAR = [
  { question: "Berapa SKS yang boleh kuambil semester depan?", ref: "1-3" },
  { question: "Berapa kehadiran minimal supaya boleh ikut ujian?", ref: "3-1" },
  { question: "Bolehkah aku mengulang mata kuliah?", ref: "2-3" },
  { question: "Kapan aku boleh mengambil cuti?", ref: "4-1" },
  { question: "Apa yang terjadi kalau IPS-ku turun?", ref: "5-2" },
];

export const newKey = () => crypto.randomUUID();
export const newArticle = () => ({ id: newKey(), no: "", title: "", formal: "", plain: "", tags: [], sim: "", link: { label: "", href: "" }, visible: true });
export const newChapter = () => ({ key: newKey(), roman: "", title: "", pasal: [newArticle()], sample: true, visible: true });
export const newScenario = () => ({ key: newKey(), title: "", deadline: "", to: "", ref: "", steps: [], files: [], message: "", sample: true, visible: true });
export const newDocument = () => ({ key: newKey(), title: "", short: "", tone: "maroon", pages: null, size: "", href: "", image: "", tocMode: "manual", toc: [], sample: true, visible: true });

const DEFAULTS = {
  intro: INTRO.body,
  version: "2026/2027",
  seo: {
    title: "Regulasi Akademik — Sistem Informasi UISI",
    description: "Pedoman akademik S1 Sistem Informasi UISI: batas SKS, penilaian & IPK, kehadiran, cuti, evaluasi studi, dan etika — dengan pencarian pasal, simulator, prosedur, dan dokumen resmi.",
  },
  curtain: { kicker: "Program Studi Sistem Informasi", title: "Regulasi", accent: "Akademik", label: "Memuat regulasi akademik" },
  notice: {
    title: "Pedoman Akademik {version} berlaku mulai semester ganjil",
    body: "Batas SKS kini mengikuti IPS semester sebelumnya, dan cuti akademik wajib diajukan sebelum KRS dibuka.",
    action: "Buka pedoman", doc: "pedoman", visible: true, sample: true,
  },
  study: { source: "curriculum", sks: 144, semester: 8, maximum: null, extra: 6 },
  simulator: SIM_DEFAULTS,
  popular: POPULAR,
  suggestions: ["cuti", "nilai E", "titip absen", "batas SKS"],
  terms: Object.entries(TERMS).map(([term, definition]) => ({ term, definition })),
  links: [
    { href: "/curiculum", label: "Kurikulum & RPS" },
    { href: "/jalur-kelulusan", label: "Jalur kelulusan" },
    { href: "/layanan-akademik", label: "Layanan akademik" },
  ],
  copy: COPY,
};

export function safeRegulasiUrl(value, kind = "link") {
  if (typeof value !== "string" || value.length > 800 || /[\u0000-\u0020\u007f\\]/.test(value)) return false;
  if (!value) return true;
  if (kind === "lottie") return /^\/lottie\/[a-z0-9_-]+\.json$/i.test(value);
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (kind === "link" && /^(#|mailto:|tel:)/i.test(value)) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && /^https?:\/\//i.test(value) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function legacyData(row) {
  try {
    const data = typeof row?.data === "string" ? JSON.parse(row.data) : row?.data;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

export function initialRegulasi(row) {
  const raw = legacyData(row);
  const value = structuredClone(DEFAULTS);
  const version = asText(raw.version).trim();
  if (version) value.version = version;
  const intro = asText(raw.intro).trim();
  if (intro.length > 40) value.intro = intro;

  const ids = new Set();
  value.chapters = CHAPTERS.map((base) => {
    const override = byKey(raw.chapters, base.key);
    const hasArticles = Array.isArray(override.pasal) && override.pasal.length > 0;
    const pasal = (hasArticles ? override.pasal : base.pasal).filter(Boolean).map((p, index) => {
      const no = asText(p.no == null ? null : String(p.no));
      let id = articleId(no);
      if (!validKey(id) || ids.has(id)) id = `legacy-${base.key}-${index + 1}`;
      ids.add(id);
      return {
        id, no, title: asText(p.title), formal: asText(p.formal), plain: asText(p.plain), tags: asList(p.tags),
        sim: SIM_TYPES.includes(p.sim) ? p.sim : "",
        link: { label: asText(p.link?.label), href: safeRegulasiUrl(p.link?.href) ? p.link.href : "" }, visible: true,
      };
    });
    return { key: base.key, roman: asText(override.roman, base.roman), title: asText(override.title, base.title), sample: !hasArticles, visible: true, pasal };
  });
  const legacyArticle = (ref) => {
    const number = String(ref ?? "");
    return value.chapters.flatMap((chapter) => chapter.pasal).find((p) => p.no === number || p.id === number)?.id ?? "";
  };
  value.popular = value.popular.map((item) => ({ ...item, ref: legacyArticle(item.ref) })).filter((item) => item.ref);
  for (const type of SIM_TYPES) value.simulator[type].ref = legacyArticle(value.simulator[type].ref);

  value.scenarios = SCENARIOS.map((base) => {
    const override = byKey(raw.scenarios, base.key);
    const item = { ...base, ...override };
    return {
      key: base.key, title: asText(item.title, base.title), deadline: asText(item.deadline, base.deadline),
      to: asText(item.to, base.to), ref: legacyArticle(item.ref), steps: asList(item.steps, base.steps),
      files: asList(item.files, base.files), message: asText(item.message, base.message), sample: typeof override.sample === "boolean" ? override.sample : !Object.keys(override).length, visible: true,
    };
  });
  value.docs = DOCS.map((base) => {
    const item = { ...base, ...byKey(raw.docs, base.key) };
    const href = safeRegulasiUrl(item.href, "document") ? item.href : "";
    return {
      key: base.key, title: asText(item.title, base.title), short: asText(item.short, base.short), tone: base.tone,
      pages: integer(Number(item.pages), 1, 99999) ? Number(item.pages) : base.pages, size: asText(item.size, base.size),
      href, image: "", tocMode: item.toc === "chapters" ? "chapters" : "manual", toc: asList(item.toc),
      sample: !href, visible: true,
    };
  });
  if (text(raw.notice?.title) && raw.notice.title.trim()) {
    value.notice = { ...value.notice, title: raw.notice.title.trim(), body: asText(raw.notice.body), sample: false };
  }
  return value;
}

export function studyVars(study, curriculum = {}) {
  const sks = study.source === "curriculum" && curriculum.sks > 0 ? curriculum.sks : runtimeNumber(study.sks, 144);
  const semester = study.source === "curriculum" && curriculum.semester > 0 ? curriculum.semester : runtimeNumber(study.semester, 8);
  return { sks, semester, maxSemester: study.maximum ?? (semester + runtimeNumber(study.extra, 6)) };
}

export function orderedRules(rows) {
  return rows.filter((row) => Number.isFinite(row.min)).sort((a, b) => b.min - a.min);
}

export function calculateRule(config, type, input, onTime = true) {
  const rows = orderedRules(config.rows);
  if (type !== "predikat") return rows.find((row) => input >= row.min) ?? null;
  return rows.find((row) => input >= row.min && (!row.onTime || onTime)) ?? null;
}

export function resolveRegulasi(value, curriculum) {
  const vars = studyVars(value.study, curriculum);
  const gradeWeights = value.simulator.nilai.rows.map((row) => row.weight).filter(Number.isFinite);
  const graduationThresholds = value.simulator.predikat.rows.filter((row) => !row.onTime && Number.isFinite(row.min)).map((row) => row.min);
  const simVars = {
    passWeight: value.simulator.nilai.passWeight,
    passGrade: [...orderedRules(value.simulator.nilai.rows)].reverse().find((row) => row.weight >= value.simulator.nilai.passWeight)?.letter ?? "",
    grades: orderedRules(value.simulator.nilai.rows).map((row) => row.letter).filter(Boolean).join(", ").replace(/, ([^,]+)$/, ", dan $1"),
    maxGradeWeight: gradeWeights.length ? formatRegulasi(Math.max(...gradeWeights)) : "—",
    minGradeWeight: gradeWeights.length ? Math.min(...gradeWeights).toLocaleString("id-ID") : "—",
    minGraduationGpa: graduationThresholds.length ? formatRegulasi(Math.min(...graduationThresholds)) : "—",
  };
  const bodyVars = { ...vars, ...simVars };
  const chapters = value.chapters.filter((c) => c.visible).map((chapter) => ({
    ...chapter,
    pasal: chapter.pasal.filter((p) => p.visible).map((p) => ({
      ...p, chapter: chapter.key, formal: fillRegulasi(p.formal, bodyVars), plain: fillRegulasi(p.plain, bodyVars),
      link: p.link.href && p.link.label && safeRegulasiUrl(p.link.href) ? p.link : null,
    })),
  })).filter((c) => c.pasal.length).map((c, index) => ({ ...c, index }));
  const docs = value.docs.filter((d) => d.visible).map((d) => ({
    ...d, href: safeRegulasiUrl(d.href, "document") ? d.href : "",
    image: safeRegulasiUrl(d.image, "document") ? d.image : "",
    toc: d.tocMode === "chapters" ? "chapters" : d.toc.filter((line) => line.trim()),
  }));
  const announcement = value.notice;
  const notice = announcement.visible && announcement.title.trim() ? {
    ...announcement, title: fillRegulasi(announcement.title, { version: value.version, ...bodyVars }),
    body: fillRegulasi(announcement.body, bodyVars),
  } : null;
  const copy = Object.fromEntries(Object.entries(value.copy).map(([group, entries]) => [
    group, Object.fromEntries(Object.entries(entries).map(([name, entry]) => [name, name.endsWith("Illustration") && !safeRegulasiUrl(entry, "lottie") ? "" : entry])),
  ]));
  const terms = Object.fromEntries(value.terms.filter((item) => item.term && item.definition).map(({ term, definition }) => [term, fillRegulasi(definition, bodyVars)]));
  return {
    copy, vars, chapters, docs, notice, terms,
    seo: value.seo, curtain: value.curtain, version: value.version,
    simulator: value.simulator, popular: value.popular, suggestions: value.suggestions,
    intro: fillRegulasi(value.intro, bodyVars),
    scenarios: value.scenarios.filter((s) => s.visible).map((item) => ({
      ...item, steps: item.steps.filter((line) => line.trim()), files: item.files.filter((line) => line.trim()),
    })),
    links: value.links.filter((link) => link.label && link.href && safeRegulasiUrl(link.href)),
    pasalCount: chapters.reduce((count, chapter) => count + chapter.pasal.length, 0),
  };
}

export const formatRegulasi = (value, digits = 2) => Number(value).toLocaleString("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits });

function check(ok, message) {
  if (!ok) throw new Error(message);
}

function object(value, path) {
  check(value && typeof value === "object" && !Array.isArray(value), `${path} tidak valid.`);
}

function list(value, path, max = 100) {
  check(Array.isArray(value) && value.length <= max, `${path} maksimal ${max} entri.`);
  return value;
}

function strings(value, path, max = 30) {
  list(value, path, max).forEach((item) => check(text(item, 500), `${path} memuat teks yang terlalu panjang.`));
}

function fields(value, path, limits) {
  object(value, path);
  for (const [name, max] of Object.entries(limits)) {
    check(text(value[name], max), `${path} · kolom ${name} tidak valid (maksimal ${max} karakter).`);
  }
}

function switches(value, path, names) {
  for (const name of names) check(typeof value[name] === "boolean", `${path} · pilihan ${name} tidak valid.`);
}

function unique(keys, label) {
  check(new Set(keys).size === keys.length, `${label} harus unik.`);
}

function requireText(value, label) {
  check(value.trim(), `Lengkapi ${label} sebelum menerbitkan.`);
}

export function readRegulasiValue(value) {
  const copy = Object.fromEntries(Object.entries(COPY).map(([group, defaults]) => [group, { ...defaults, ...value.copy?.[group] }]));
  return { ...value, copy };
}

export function validateRegulasi(value, { publish = false, curriculum } = {}) {
  fields(value, "Pengantar", { intro: 6000, version: 160 });
  fields(value.seo, "SEO", { title: 180, description: 500 });
  fields(value.curtain, "Tirai", { kicker: 160, title: 160, accent: 160, label: 160 });
  fields(value.notice, "Pengumuman", { title: 200, body: 3000, action: 100, doc: 80 });
  switches(value.notice, "Pengumuman", ["visible", "sample"]);
  object(value.study, "Beban dan masa studi");
  check(["curriculum", "manual"].includes(value.study.source), "Sumber data studi tidak valid.");
  for (const [name, max] of Object.entries({ sks: 999, semester: 40, maximum: 60, extra: 40 })) {
    const input = value.study[name];
    check(input === null || integer(input, name === "extra" ? 0 : 1, max), `Nilai studi ${name} tidak valid.`);
  }

  object(value.copy, "Teks antarmuka");
  const copy = {};
  for (const [key, group] of Object.entries(COPY)) {
    const limits = Object.fromEntries(Object.keys(group).map((name) => [name, 800]));
    fields(value.copy[key], key, limits);
    copy[key] = Object.fromEntries(Object.keys(group).map((name) => [name, value.copy[key][name]]));
    for (const [name, field] of Object.entries(copy[key])) {
      check(!name.endsWith("Illustration") || safeRegulasiUrl(field, "lottie"), `Pilih berkas Lottie lokal pada ${key}.`);
      if (name === "mascotPose") check(!field || MASCOT_POSES.includes(field), "Pilihan pose Elvo tidak valid.");
    }
  }

  const chapterList = list(value.chapters, "Bab", 40);
  const articleKeys = [];
  const publicArticles = new Set();
  const numbers = [];
  for (const chapter of chapterList) {
    fields(chapter, "Bab", { roman: 16, title: 200 });
    const heading = chapter.title || "bab baru";
    check(validKey(chapter.key), "ID bab tidak valid.");
    switches(chapter, heading, ["visible", "sample"]);
    if (publish && chapter.visible) {
      requireText(chapter.roman, `nomor ${heading}`);
      requireText(chapter.title, "judul bab");
    }
    for (const article of list(chapter.pasal, "Pasal", 100)) {
      fields(article, "Pasal", { no: 32, title: 250, formal: 12000, plain: 12000, sim: 16 });
      check(validKey(article.id), "ID pasal tidak valid.");
      articleKeys.push(article.id);
      switches(article, "Pasal", ["visible"]);
      strings(article.tags, "Tag");
      fields(article.link, "Tautan pasal", { label: 160, href: 800 });
      check(safeRegulasiUrl(article.link.href), `URL pasal ${article.no} tidak valid.`);
      check(!article.sim || SIM_TYPES.includes(article.sim), "Rujukan simulator tidak valid.");
      if (publish && chapter.visible && article.visible) {
        requireText(article.no, "nomor pasal");
        requireText(article.title, `judul pasal ${article.no}`);
        requireText(article.formal, `versi pedoman pasal ${article.no}`);
        requireText(article.plain, `versi sehari-hari pasal ${article.no}`);
        check(!!article.link.href === !!article.link.label, `Isi label dan URL tautan pasal ${article.no}.`);
        publicArticles.add(article.id);
        numbers.push(article.no.trim().toLowerCase());
      }
    }
  }
  unique(chapterList.map((chapter) => chapter.key), "ID bab");
  unique(articleKeys, "ID pasal");
  unique(numbers, "Nomor pasal yang tampil");
  const checkRef = (ref, label) => {
    check(ref === "" || validKey(ref), `Rujukan ${label} tidak valid.`);
    if (publish && ref) check(publicArticles.has(ref), `Perbarui rujukan ${label} ke pasal yang tampil atau kosongkan.`);
  };

  for (const item of list(value.popular, "Pertanyaan populer", 30)) {
    fields(item, "Pertanyaan populer", { question: 250, ref: 80 });
    checkRef(item.ref, item.question || "pertanyaan populer");
    if (publish) {
      requireText(item.question, "pertanyaan populer");
      requireText(item.ref, `rujukan pertanyaan “${item.question}”`);
    }
  }
  strings(value.suggestions, "Saran pencarian", 16);
  const terms = list(value.terms, "Glosarium", 80);
  for (const item of terms) {
    fields(item, "Glosarium", { term: 100, definition: 1000 });
    if (publish) {
      requireText(item.term, "istilah glosarium");
      requireText(item.definition, `definisi ${item.term}`);
    }
  }
  if (publish) unique(terms.map((item) => item.term.trim().toLowerCase()), "Istilah glosarium");

  const scenarios = list(value.scenarios, "Prosedur", 50);
  for (const item of scenarios) {
    fields(item, "Prosedur", { title: 220, deadline: 250, to: 250, ref: 80, message: 6000 });
    check(validKey(item.key), "ID prosedur tidak valid.");
    switches(item, "Prosedur", ["visible", "sample"]);
    strings(item.steps, "Langkah");
    strings(item.files, "Berkas");
    if (item.visible) checkRef(item.ref, item.title || "prosedur");
    if (publish && item.visible) {
      requireText(item.title, "judul prosedur");
      check(item.steps.some((step) => step.trim()), `Tambahkan langkah pada prosedur “${item.title}”.`);
    }
  }
  unique(scenarios.map((item) => item.key), "ID prosedur");

  const docs = list(value.docs, "Dokumen", 40);
  for (const item of docs) {
    fields(item, "Dokumen", { title: 250, short: 80, size: 60, href: 800, image: 800 });
    check(validKey(item.key), "ID dokumen tidak valid.");
    switches(item, "Dokumen", ["visible", "sample"]);
    check(item.pages === null || integer(item.pages, 1, 99999), "Jumlah halaman dokumen tidak valid.");
    check(["maroon", "navy", "gold", "ivory"].includes(item.tone), "Warna sampul tidak valid.");
    check(["chapters", "manual"].includes(item.tocMode), "Jenis daftar isi tidak valid.");
    strings(item.toc, "Daftar isi", 80);
    check(safeRegulasiUrl(item.href, "document") && safeRegulasiUrl(item.image, "document"), "URL berkas atau gambar sampul tidak valid.");
    if (publish && item.visible) requireText(item.title, "judul dokumen");
  }
  unique(docs.map((item) => item.key), "ID dokumen");
  check(!value.notice.doc || validKey(value.notice.doc), "Rujukan dokumen pengumuman tidak valid.");
  if (publish && value.notice.visible && value.notice.doc) {
    check(docs.some((doc) => doc.key === value.notice.doc && doc.visible), "Pilih dokumen yang tampil untuk pengumuman atau kosongkan tindakannya.");
  }

  for (const item of list(value.links, "Tautan penutup", 20)) {
    fields(item, "Tautan penutup", { label: 160, href: 800 });
    check(safeRegulasiUrl(item.href), "URL tautan penutup tidak valid.");
    if (publish) check(item.label.trim() && item.href, "Lengkapi label dan URL tautan penutup.");
  }

  object(value.simulator, "Simulator");
  for (const type of SIM_TYPES) {
    const sim = value.simulator[type];
    fields(sim, "Simulator", { title: 200, label: 120, ref: 80 });
    switches(sim, sim.title || "Simulator", type === "predikat" ? ["sample", "onTime"] : ["sample"]);
    checkRef(sim.ref, sim.title || "simulator");
    const limit = type === "nilai" ? 1000 : 100;
    for (const name of ["min", "max", "step", "initial"]) {
      check(sim[name] === null || finite(sim[name], 0, limit), `Isian angka simulator ${type} tidak valid.`);
    }
    if (type === "nilai") check(sim.passWeight === null || finite(sim.passWeight, 0, 100), "Bobot lulus tidak valid.");
    for (const row of list(sim.rows, "Aturan simulator", 40)) {
      object(row, "Aturan simulator");
      check(row.min === null || finite(row.min, 0, limit), "Ambang simulator tidak valid.");
      if (type === "sks") check(row.sks === null || integer(row.sks, 0, 100), "Jumlah SKS per ambang tidak valid.");
      if (type === "nilai") {
        check(text(row.letter, 12), "Huruf mutu tidak valid.");
        check(row.weight === null || finite(row.weight, 0, 100), "Bobot huruf mutu tidak valid.");
      }
      if (type === "predikat") {
        check(text(row.label, 160), "Label predikat tidak valid.");
        switches(row, "Predikat", ["onTime"]);
      }
    }
    if (publish) {
      requireText(sim.title, `judul simulator ${type}`);
      requireText(sim.label, `label masukan simulator ${type}`);
      check(sim.min != null && sim.max > sim.min && sim.step > 0 && sim.step <= sim.max - sim.min && sim.initial != null && sim.initial >= sim.min && sim.initial <= sim.max, `Periksa rentang dan nilai awal simulator “${sim.title}”.`);
      check(sim.rows.length && sim.rows.every((row) => finite(row.min, sim.min, sim.max)), `Periksa ambang pada simulator “${sim.title}”.`);
      unique(sim.rows.map((row) => row.min), `Ambang simulator “${sim.title}”`);
      if (type !== "predikat") check(sim.rows.some((row) => row.min === sim.min), `Tambahkan aturan untuk batas bawah simulator “${sim.title}”.`);
      if (type === "sks") check(sim.rows.every((row) => row.sks != null), "Isi jumlah SKS untuk setiap ambang.");
      if (type === "nilai") {
        check(sim.passWeight != null && sim.rows.every((row) => row.weight != null && row.letter.trim()), "Lengkapi huruf, bobot nilai, dan bobot lulus.");
        check(sim.rows.some((row) => row.weight >= sim.passWeight), "Minimal satu huruf mutu harus memenuhi bobot lulus.");
        unique(sim.rows.map((row) => row.letter.trim().toUpperCase()), "Huruf mutu");
      }
      if (type === "predikat") {
        check(sim.rows.every((row) => row.label.trim()), "Isi label untuk setiap predikat.");
        check(sim.rows.some((row) => !row.onTime), "Tambahkan predikat yang berlaku bagi mahasiswa yang lulus melewati masa studi normal.");
      }
    }
  }
  if (publish) {
    requireText(value.seo.title, "judul SEO");
    requireText(value.copy.hero.title, "judul pembuka");
    requireText(value.copy.search.label, "label pencarian");
    requireText(value.copy.general.close, "label tutup dialog");
    requireText(value.copy.general.closeSheet, "label tutup panel");
    requireText(value.version, "edisi");
    if (value.study.source === "manual") check(value.study.sks != null && value.study.semester != null, "Isi total SKS dan masa studi normal untuk sumber manual.");
    check(value.study.maximum != null || value.study.extra != null, "Isi batas masa studi atau perpanjangan semester.");
    const study = studyVars(value.study, curriculum);
    check(study.maxSemester >= study.semester, "Batas maksimum masa studi harus sama atau lebih panjang dari masa studi normal.");
  }
  return { ...value, copy };
}
