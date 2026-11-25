import { mergeJalur } from "../jalur-kelulusan-content.js";
import { JALUR_COPY } from "./copy.js";

export const JALUR_SECTION = "jalur-kelulusan";
export const JALUR_LIVE = "jalur-kelulusan:terbit";
export const JALUR_DRAFT = "jalur-kelulusan:draf";
export const JALUR_SECTIONS = [JALUR_SECTION, JALUR_LIVE, JALUR_DRAFT];
export const ROAD_STYLES = ["skripsi", "lomba", "pkm", "bisnis"];
export const ELVO_POSES = ["wave", "thumbs-up", "confident", "proud", "run", "think", "laugh"];

export const newItem = () => ({ id: crypto.randomUUID(), text: "", visible: true });
export const newStage = () => ({ id: crypto.randomUUID(), name: "", time: "", output: "", visible: true, needs: [] });
export const newPath = () => ({
  key: crypto.randomUUID(), title: "", oneLiner: "", forWho: "", output: "", duration: "", mentor: "", risk: "",
  visible: true, sample: false, road: "skripsi", media: { src: "", alt: "" }, stages: [], ready: [],
});
export const newLink = () => ({ id: crypto.randomUUID(), label: "", href: "", visible: true });

const initialItems = (values) => (Array.isArray(values) ? values : []).filter((value) => typeof value === "string")
  .map((text, index) => ({ id: `item-${index + 1}`, text, visible: true }));

export function initialJalur(legacy) {
  const source = mergeJalur(legacy);
  return {
    copy: structuredClone(JALUR_COPY),
    intro: source.intro.body,
    sections: { story: true, readiness: true, compare: true, closing: true },
    paths: source.paths.map((p) => ({
      key: p.key, title: p.title, oneLiner: p.oneLiner, forWho: p.forWho, output: p.output, duration: p.duration,
      mentor: p.mentor, risk: p.risk, visible: true, sample: p.sample === true, road: p.key,
      media: { src: p.lottie, alt: "Ilustrasi jalur {path}" },
      stages: (Array.isArray(p.stages) ? p.stages : []).filter(Boolean).map((s, i) => ({
        id: `tahap-${i + 1}`, name: s.name ?? "", time: s.time ?? "", output: s.output ?? "", visible: true, needs: initialItems(s.needs),
      })),
      ready: initialItems(p.ready),
    })),
    academic: { courseId: "", sks: "", semester: "", prerequisiteMode: "kurikulum", prerequisiteId: "", prerequisitePath: "skripsi", name: "", href: "", courseSemester: "" },
    notice: {
      visible: !!source.notice, title: source.notice?.title ?? "", body: source.notice?.body ?? "", sample: source.notice?.sample ?? false,
      dismissible: true, label: "Agenda prodi", href: "/berita?rubrik=agenda",
    },
    readinessMedia: { src: "/lottie/grad-cap.json", alt: "Ilustrasi toga" },
    heroMascot: { visible: true, pose: "think" },
    closingMascot: { visible: true, pose: "thumbs-up" },
    closingAction: { mode: "default", title: "", note: "", kicker: "", href: "" },
    links: [
      { id: "beban-studi", label: "Beban studi semester {semester}", href: "/curiculum#semester", visible: true },
      { id: "topik", label: "Topik dari minatmu", href: "/bidang-keahlian", visible: true },
      { id: "pembimbing", label: "Calon pembimbing", href: "/dosen", visible: true },
    ],
  };
}

const model = initialJalur();
const itemModel = { id: "", text: "", visible: true };
const stageModel = { id: "", name: "", time: "", output: "", visible: true, needs: [itemModel] };
const pathModel = { ...model.paths[0], stages: [stageModel], ready: [itemModel] };
const documentModel = { ...model, paths: [pathModel], links: [model.links[0]] };
const idPattern = /^[a-z0-9][a-z0-9-]{0,79}$/;

function matchShape(value, template) {
  if (Array.isArray(template)) {
    if (!Array.isArray(value) || value.length > 80) throw new Error("Daftar tidak valid atau melebihi 80 entri.");
    return value.map((item) => matchShape(item, template[0]));
  }
  if (typeof value !== typeof template || value === null) throw new Error("Struktur konten tidak valid.");
  if (typeof template === "object") {
    return Object.fromEntries(Object.keys(template).map((key) => [key, matchShape(value[key], template[key])]));
  }
  if (typeof value === "string" && value.length > 3000) throw new Error("Satu kolom teks melebihi 3.000 karakter.");
  return value;
}

function assertIds(items, field = "id") {
  const keys = items.map((item) => item[field]);
  if (!keys.every((key) => idPattern.test(key)) || new Set(keys).size !== keys.length) throw new Error("ID konten tidak valid atau ganda.");
}

export function safeJalurUrl(value) {
  const url = value.trim();
  if (!url || /[\x00-\x20\\]/.test(url)) return "";
  if (/^\/(?!\/)|^#/.test(url)) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password ? url : "";
  } catch {
    return "";
  }
}

export function validateJalur(raw, { publish = false } = {}) {
  if (!raw || JSON.stringify(raw).length > 150_000) throw new Error("Konten terlalu besar atau tidak valid.");
  const value = matchShape(raw, documentModel);
  const sources = [value.copy.identity.breadcrumbHref, value.copy.identity.seoImage, value.academic.href, value.notice.href, value.readinessMedia.src, value.closingAction.href];
  assertIds(value.paths, "key");
  assertIds(value.links);
  for (const path of value.paths) {
    if (!ROAD_STYLES.includes(path.road)) throw new Error("Bentuk peta jalur tidak valid.");
    assertIds(path.stages);
    assertIds(path.ready);
    for (const stage of path.stages) assertIds(stage.needs);
    sources.push(path.media.src);
    if (publish && path.visible && (!path.title.trim() || path.stages.some((stage) => stage.visible && !stage.name.trim()))) {
      throw new Error("Beri nama pada setiap jalur dan tahap yang ditampilkan.");
    }
  }
  sources.push(...value.links.map((link) => link.href));
  if (!["kurikulum", "manual", "hidden"].includes(value.academic.prerequisiteMode)
      || !["default", "link", "hidden"].includes(value.closingAction.mode)
      || ![value.heroMascot, value.closingMascot].every((mascot) => ELVO_POSES.includes(mascot.pose))) throw new Error("Pilihan konten tidak valid.");
  if (publish && sources.some((url) => url.trim() && !safeJalurUrl(url))) throw new Error("Gunakan tautan internal atau URL HTTPS yang valid.");
  if (publish && [value.academic.sks, value.academic.semester, value.academic.courseSemester].some((n) => n.trim() && !/^\d{1,3}$/.test(n.trim()))) {
    throw new Error("SKS dan semester harus berupa angka bulat.");
  }
  return value;
}

export function resolveJalur(value, courses, { preview = false } = {}) {
  const { academic } = value;
  const find = (id, fallback) => id ? courses.find((c) => String(c.id) === id || c.slug === id) : courses.find((c) => fallback.test(c.nama));
  const course = find(academic.courseId, /skripsi/i);
  const prerequisite = find(academic.prerequisiteId, /metode penelitian/i);
  const useInitialCredits = !academic.courseId && !course;
  const number = (text, fallback) => /^\d{1,3}$/.test(text.trim()) ? Number(text) : fallback;
  const thesis = {
    sks: number(academic.sks, course?.sks ?? (useInitialCredits ? 6 : null)),
    semester: number(academic.semester, course?.semester ?? (useInitialCredits ? 8 : null)),
  };
  const method = academic.prerequisiteMode === "manual"
    ? { nama: academic.name, href: safeJalurUrl(academic.href), semester: number(academic.courseSemester, null) }
    : academic.prerequisiteMode === "kurikulum" && prerequisite
      ? { nama: prerequisite.nama, href: `/curiculum#rps-${encodeURIComponent(prerequisite.slug)}`, semester: prerequisite.semester }
      : null;
  const paths = value.paths.filter((p) => p.visible).map((p) => ({
    ...p, stages: p.stages.filter((s) => s.visible).map((s) => ({ ...s, needs: s.needs.filter((item) => item.visible && item.text.trim()) })),
    ready: p.ready.filter((item) => item.visible && item.text.trim()),
  }));
  return { ...value, paths, thesis, method: method?.nama.trim() ? method : null, preview };
}

export function stageFromHash(paths, hash) {
  const match = /^#jalur-([a-z0-9-]+)\/tahap\/([a-z0-9-]+)$/.exec(hash);
  if (match) {
    const path = paths.find((p) => p.key === match[1]);
    return path?.stages.some((s) => s.id === match[2]) ? { key: path.key, stage: match[2] } : null;
  }
  const key = hash.startsWith("#jalur-") ? hash.slice(7) : "";
  if (paths.some((p) => p.key === key)) return { key };
  const legacy = /^(skripsi|lomba|pkm|bisnis)-(\d+)$/.exec(key);
  if (!legacy) return null;
  const stage = `tahap-${Number(legacy[2])}`;
  return paths.find((p) => p.key === legacy[1])?.stages.some((s) => s.id === stage) ? { key: legacy[1], stage } : null;
}

export function readJalurChecks(saved) {
  if (Array.isArray(saved)) return Object.fromEntries(saved.flatMap((done, i) => done === true ? [[`item-${i + 1}`, true]] : []));
  if (!saved || typeof saved !== "object") return {};
  return Object.fromEntries(Object.entries(saved).filter(([id, done]) => idPattern.test(id) && done === true));
}
