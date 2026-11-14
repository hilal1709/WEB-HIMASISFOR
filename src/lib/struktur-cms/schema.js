/**
 * Skema isi Struktur Organisasi (aman untuk klien): bentuk data, pembersih, lapisan Studio Bagan,
 * dan alat bantu pohon. Server selalu menjalankan `cleanStruktur` sebelum menyimpan.
 */
import { b, clean, e, l, o, s, sameJson, url } from "@/lib/cms/shape";
import { MASCOT_POSES } from "@/lib/sambutan-cms/schema";

export { MASCOT_POSES };

export const ROW = "struktur";
export const DRAFT_ROW = "struktur-draft";
/** Baris lama (override setengah jadi tanpa editor) — hanya dibaca bila belum pernah terbit. */
export const LEGACY_ROW = "struktur-organisasi";
export const HISTORY_MAX = 5;

export const LIMITS = { people: 40, expertise: 8, duties: 8, uses: 8, next: 5, breadcrumb: 4, divisions: 8 };
export const BANNER_VARIANTS = ["info", "success", "warning", "brand"];
export const GROUPS = ["main", "staff"];
/** Bentuk bagan publik. */
export const CHART_LAYOUTS = ["tree", "horizontal", "divisions"];
export const CARD_PHOTOS = ["portrait", "round", "none"];
export const CARD_SIZES = ["lg", "md", "sm"];
export const DIVISION_TONES = ["maroon", "navy", "gold"];

/** Ilustrasi garis untuk kartu Minilab (kunci `ILLUSTRATIONS`). */
export const MINILAB_ILLUSTRATIONS = [
  ["knowledge", "Pengetahuan"],
  ["lecturer", "Dosen mengajar"],
  ["erp", "Sistem ERP"],
  ["org-tree", "Pohon organisasi"],
  ["lecturer-network", "Jejaring dosen"],
  ["class-paths", "Jalur kelas"],
];
const ILLU_KEYS = MINILAB_ILLUSTRATIONS.map(([k]) => k);

/**
 * Lapisan Studio Bagan. `people` = kanvas; sisanya panel teks.
 * `anchor` = id section publik untuk menggulir pratinjau.
 */
export const LAYERS = [
  { key: "people", label: "Bagan", hint: "Orang, jabatan, dan garis koordinasi", anchor: "bagan" },
  { key: "hero", label: "Pembuka", hint: "Judul, ajakan, maskot", anchor: "top" },
  { key: "chart", label: "Bentuk bagan", hint: "Tata letak, kartu, divisi, judul", anchor: "bagan" },
  { key: "modal", label: "Kartu profil", hint: "Label di jendela detail orang", anchor: "bagan" },
  { key: "minilab", label: "Minilab", hint: "Fasilitas & direktori dosen", anchor: "minilab" },
  { key: "closing", label: "Penutup", hint: "Layanan & tautan lanjutan", anchor: "struktur-closing" },
  { key: "curtain", label: "Tirai", hint: "Layar pembuka sekali per sesi", anchor: "top" },
  { key: "seo", label: "Meta", hint: "Tampilan di mesin pencari", anchor: "top" },
];

const KEY_RE = /^[a-z0-9][a-z0-9-]{0,39}$/;
const mascot = o({ show: b, pose: e(MASCOT_POSES), say: s(120) });

export const PERSON = o({
  key: s(40, KEY_RE),
  reportsTo: s(40),
  group: e(GROUPS),
  name: s(90),
  credentials: s(120),
  role: s(80),
  photo: url,
  expertise: l(s(60), LIMITS.expertise),
  duties: l(s(160), LIMITS.duties),
  hidden: b,
  division: s(40),
});

const TIER = o({ photo: e(CARD_PHOTOS), size: e(CARD_SIZES), credentials: b, expertise: b, cta: b });

export const SHAPE = o({
  seo: o({ title: s(90), description: s(200) }),
  curtain: o({ enabled: b, kicker: s(60), title: s(40), accent: s(40), label: s(60) }),
  hero: o({
    breadcrumb: l(o({ label: s(40), href: url }), LIMITS.breadcrumb),
    current: s(60),
    titleTop: s(40),
    titleAccent: s(40),
    body: s(280),
    primaryLabel: s(30),
    secondaryLabel: s(30),
    leadBadge: s(24),
    mascot,
  }),
  chart: o({
    titleTop: s(40),
    titleAccent: s(40),
    body: s(240),
    banner: o({ show: b, variant: e(BANNER_VARIANTS), title: s(100), body: s(240) }),
    cardCta: s(30),
    layout: e(CHART_LAYOUTS),
    cards: o({ lead: TIER, level1: TIER, deeper: TIER }),
    divisions: l(o({ key: s(40, KEY_RE), name: s(60), body: s(160), tone: e(DIVISION_TONES) }), LIMITS.divisions),
    ungroupedLabel: s(40),
  }),
  modal: o({ duties: s(40), expertise: s(40), services: s(40), reportsTo: s(30), manages: s(30) }),
  people: l(PERSON, LIMITS.people),
  minilab: o({
    titleTop: s(40),
    titleAccent: s(40),
    body: s(200),
    card: o({ kicker: s(30), title: s(80), body: s(300), uses: l(s(50), LIMITS.uses), head: s(40), headLabel: s(30), illustration: e(ILLU_KEYS) }),
    directory: o({ show: b, kicker: s(40), title: s(60), body: s(200), href: url }),
  }),
  closing: o({
    titleTop: s(40),
    titleAccent: s(40),
    service: o({ show: b, title: s(60), body: s(200), label: s(30), href: url }),
    mascot,
    next: l(o({ kicker: s(30), title: s(60), body: s(140), href: url }), LIMITS.next),
  }),
});

/* ───────────── alat bantu pohon (dipakai klien & server) ───────────── */

export const slugKey = (name) =>
  String(name ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/^dr\.?\s+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "orang";

/** Key unik baru berdasar nama. */
export function uniqueKey(name, people) {
  const taken = new Set(people.map((p) => p.key));
  const base = slugKey(name);
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

/** Apakah `key` adalah keturunan `of` (atau dirinya sendiri)? Dipakai untuk mencegah siklus. */
export function isDescendant(people, key, of) {
  const byKey = Object.fromEntries(people.map((p) => [p.key, p]));
  let k = key;
  const seen = new Set();
  while (k && byKey[k] && !seen.has(k)) {
    if (k === of) return true;
    seen.add(k);
    k = byKey[k].reportsTo;
  }
  return false;
}

/** Puncak bagan: orang non-staf tanpa atasan valid. */
export function findRoot(people) {
  const keys = new Set(people.map((p) => p.key));
  return people.find((p) => p.group !== "staff" && (!p.reportsTo || !keys.has(p.reportsTo))) ?? people[0] ?? null;
}

/**
 * Rapikan daftar orang: key unik & valid, atasan menunjuk orang yang ada, tanpa siklus,
 * satu puncak (puncak lain digantung ke puncak pertama), staf selalu punya atasan.
 */
export function normalizePeople(list) {
  const seen = new Set();
  const people = [];
  for (const p of list) {
    if (!p?.name?.trim()) continue;
    let key = p.key && KEY_RE.test(p.key) ? p.key : slugKey(p.name);
    if (seen.has(key)) key = uniqueKey(key, people);
    seen.add(key);
    // urutan field tetap (sama dengan defaults) supaya perbandingan JSON tidak salah menandai "berubah"
    people.push({
      key,
      reportsTo: p.reportsTo ?? "",
      group: p.group ?? "main",
      name: p.name,
      credentials: p.credentials ?? "",
      role: p.role ?? "",
      photo: p.photo ?? "",
      expertise: p.expertise ?? [],
      duties: p.duties ?? [],
      hidden: p.hidden ?? false,
      division: p.division ?? "",
    });
  }
  const keys = new Set(people.map((p) => p.key));
  for (const p of people) if (p.reportsTo === p.key || !keys.has(p.reportsTo)) p.reportsTo = "";
  // putus siklus: jalan ke atas; bila kembali ke diri sendiri → jadikan puncak sementara
  for (const p of people) {
    const byKey = Object.fromEntries(people.map((x) => [x.key, x]));
    const path = new Set([p.key]);
    let k = p.reportsTo;
    while (k && byKey[k]) {
      if (path.has(k)) {
        p.reportsTo = "";
        break;
      }
      path.add(k);
      k = byKey[k].reportsTo;
    }
  }
  const roots = people.filter((p) => !p.reportsTo && p.group !== "staff");
  const root = roots[0] ?? people.find((p) => !p.reportsTo) ?? people[0];
  if (root) {
    root.group = "main";
    for (const p of people) if (p !== root && !p.reportsTo) p.reportsTo = root.key;
  }
  return people;
}

/** Bersihkan + tegakkan aturan pohon. */
export function cleanStruktur(v) {
  const out = clean(SHAPE, v);
  if (!out) return null;
  if (out.people) {
    out.people = normalizePeople(out.people);
    if (!out.people.length) delete out.people;
  }
  if (out.chart?.divisions) {
    const seen = new Set();
    out.chart.divisions = out.chart.divisions
      .filter((d) => d.name?.trim())
      .map((d) => {
        let key = d.key && KEY_RE.test(d.key) ? d.key : slugKey(d.name);
        while (seen.has(key)) key = `${key}-2`;
        seen.add(key);
        return { key, name: d.name, body: d.body ?? "", tone: d.tone ?? "maroon" };
      });
    if (out.people) for (const p of out.people) if (p.division && !seen.has(p.division)) p.division = "";
  }
  const keys = new Set((out.people ?? []).map((p) => p.key));
  if (out.minilab?.card?.head && out.people && !keys.has(out.minilab.card.head)) out.minilab.card.head = "";
  return out;
}

/** Lapisan mana yang berbeda antara dua versi (titik di rel lapisan & modal terbit). */
export function changedLayers(a, b) {
  return LAYERS.map((x) => x.key).filter((k) => !sameJson(a?.[k], b?.[k]));
}

/** Ringkasan perubahan susunan orang: ditambah, dihapus, pindah atasan, diubah isinya. */
export function rosterDiff(before = [], after = []) {
  const A = Object.fromEntries(before.map((p) => [p.key, p]));
  const B = Object.fromEntries(after.map((p) => [p.key, p]));
  const added = after.filter((p) => !A[p.key]);
  const removed = before.filter((p) => !B[p.key]);
  const moved = [];
  const edited = [];
  for (const p of after) {
    const q = A[p.key];
    if (!q) continue;
    if ((q.reportsTo || "") !== (p.reportsTo || "") || (q.group || "main") !== (p.group || "main")) moved.push({ person: p, from: B[q.reportsTo] ?? A[q.reportsTo] ?? null, to: B[p.reportsTo] ?? null });
    else if (!sameJson(q, p)) edited.push(p);
  }
  return { added, removed, moved, edited, total: added.length + removed.length + moved.length + edited.length };
}
