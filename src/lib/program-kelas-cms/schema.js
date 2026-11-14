/**
 * Skema isi Program Kelas (aman untuk klien): bentuk data, pembersih input, daftar rel Papan Jadwal.
 * Server selalu menjalankan `cleanProgramKelas` sebelum menyimpan.
 */
import { b, clean, e, half as hf, l, n, o, s, sameJson, url } from "@/lib/cms/shape";
import { MASCOT_POSES } from "@/lib/sambutan-cms/schema";

export { MASCOT_POSES };

export const ROW = "program-kelas-v2";
export const DRAFT_ROW = "program-kelas-draft";
/** Baris lama (intro + override kelas + FAQ) — dibaca sebagai warisan sampai Papan Jadwal pertama kali terbit. */
export const LEGACY_ROW = "program-kelas";
export const HISTORY_MAX = 5;

export const LIMITS = { classes: 4, list: 6, week: 16, rows: 14, questions: 5, options: 4, faq: 12, links: 4, breadcrumb: 4, title: 3 };

/** Rel Papan Jadwal, urut seperti halaman publik. `anchor` = id section publik untuk pratinjau. */
export const SECTIONS = [
  { key: "hero", label: "Pembuka", hint: "Judul, intro, kartu pertanyaan", anchor: "top" },
  { key: "banner", label: "Pengumuman", hint: "Pita PMB di bawah pembuka", anchor: "top" },
  { key: "classes", label: "Kelas", hint: "Kartu tiap program kelas", anchor: "kelas" },
  { key: "schedule", label: "Jadwal", hint: "Blok kuliah seminggu", anchor: "jadwal" },
  { key: "compare", label: "Banding", hint: "Tabel perbandingan", anchor: "banding" },
  { key: "quiz", label: "Kuis", hint: "Pemilih kelas & skornya", anchor: "top" },
  { key: "faq", label: "Tanya", hint: "Pertanyaan umum", anchor: "faq" },
  { key: "closing", label: "Penutup", hint: "Ajakan daftar & tautan", anchor: "penutup" },
  { key: "links", label: "Tautan", hint: "Alamat PMB & kontak", anchor: "penutup" },
  { key: "meta", label: "Tirai & Meta", hint: "Layar pembuka & mesin pencari", anchor: "top" },
];

export const ACCENTS = [
  ["maroon", "Maroon"],
  ["gold", "Emas"],
  ["navy", "Navy"],
];
export const BLOCK_KINDS = ["kampus", "daring", "industri"];
export const CELL_KINDS = ["yes", "no", "text"];
export const BANNER_VARIANTS = ["brand", "info", "success", "warning"];

/** Lottie terang yang cocok di kartu kelas (permukaan cream). */
export const CLASS_LOTTIES = [
  ["/lottie/campus.json", "Kampus"],
  ["/lottie/calendar.json", "Kalender"],
  ["/lottie/industry.json", "Industri"],
  ["/lottie/briefcase.json", "Koper kerja"],
  ["/lottie/laptop-code.json", "Laptop kode"],
  ["/lottie/data-chart.json", "Grafik data"],
  ["/lottie/lecturer.json", "Dosen"],
  ["/lottie/grad-cap.json", "Toga"],
  ["/lottie/grad-path.json", "Jalur lulus"],
  ["/lottie/erp-nodes.json", "Simpul ERP"],
  ["/lottie/certificate.json", "Sertifikat"],
  ["/lottie/wallet.json", "Dompet"],
];
export const CLOSING_LOTTIES = [
  ["/lottie/rocket-pmb-dark.json", "Roket"],
  ["/lottie/briefcase-dark.json", "Koper"],
  ["/lottie/certificate-dark.json", "Sertifikat"],
  ["/lottie/trophy-dark.json", "Piala"],
];

const LOTTIE = /^\/[\w\-/]+\.json$/;
const SLUG = /^[a-z0-9][a-z0-9-]{0,39}$/;
const mascot = o({ show: b, pose: e(MASCOT_POSES), say: s(120) });
const list = (len = 140, max = LIMITS.list) => l(s(len), max);
const title = l(s(40), LIMITS.title);

export const SHAPE = o({
  curtain: o({ enabled: b, title: s(40), accent: s(40), label: s(60) }),
  seo: o({ title: s(90), description: s(200), sampleNote: s(60) }),
  links: o({ pmb: url, contact: url }),
  hero: o({
    breadcrumb: l(o({ label: s(40), href: url }), LIMITS.breadcrumb),
    title,
    body: s(320),
    cardKicker: s(40),
    cardCounter: s(40),
    fullQuiz: s(60),
    resultKicker: s(40),
    scheduleLabel: s(20),
    feeLabel: s(20),
    detailCta: s(40),
    retry: s(20),
    quizCta: s(30),
    mascot,
  }),
  banner: o({ show: b, variant: e(BANNER_VARIANTS), title: s(60), body: s(200), cta: s(24), href: url, version: s(20) }),
  classes: o({
    title,
    body: s(240),
    feeLabel: s(30),
    sksLabel: s(20),
    seatsLabel: s(30),
    forWhoLabel: s(30),
    highlightsLabel: s(30),
    requirementsLabel: s(30),
    detailCta: s(40),
    registerCta: s(40),
    modalKicker: s(60),
    modalSeats: s(30),
    modalLocationLabel: s(20),
    modalSeatsLabel: s(20),
    items: l(
      o({
        key: s(40, SLUG),
        name: s(60),
        short: s(24),
        accent: e(ACCENTS.map(([k]) => k)),
        tagline: s(160),
        lottie: s(200, LOTTIE),
        schedule: s(60),
        mode: s(60),
        duration: n(1, 14),
        durationLabel: s(20),
        sks: n(0, 300),
        fee: s(30),
        feeNote: s(30),
        seats: n(0, 2000),
        location: s(80),
        reason: s(240),
        forWho: list(),
        highlights: list(),
        requirements: list(),
        week: l(o({ day: n(0, 6), start: hf(0, 24), end: hf(0, 24), label: s(60), kind: e(BLOCK_KINDS) }), LIMITS.week),
        sample: b,
      }),
      LIMITS.classes
    ),
  }),
  schedule: o({
    title,
    body: s(240),
    totalLabel: s(40),
    switchLabel: s(30),
    days: l(s(6), 7),
    start: n(0, 23),
    end: n(1, 24),
    kinds: o({ kampus: s(30), daring: s(30), industri: s(30) }),
    emptyDay: s(30),
  }),
  compare: o({
    title,
    body: s(240),
    diffLabel: s(30),
    aspectLabel: s(20),
    yesLabel: s(12),
    noLabel: s(12),
    swipeHint: s(100),
    rows: l(o({ label: s(60), values: l(o({ cls: s(40, SLUG), kind: e(CELL_KINDS), text: s(40) }), LIMITS.classes) }), LIMITS.rows),
  }),
  quiz: o({
    counter: s(40),
    back: s(20),
    computingLabel: s(30),
    computing: s(80),
    resultLabel: s(20),
    resultKicker: s(40),
    goCta: s(30),
    retry: s(20),
    toastTitle: s(60),
    toastBody: s(120),
    questions: l(
      o({ q: s(120), options: l(o({ label: s(60), hint: s(60), scores: l(o({ cls: s(40, SLUG), points: n(0, 5) }), LIMITS.classes) }), LIMITS.options) }),
      LIMITS.questions
    ),
  }),
  faq: o({ title, body: s(240), quizCta: s(40), items: l(o({ q: s(160), a: s(600) }), LIMITS.faq) }),
  closing: o({
    kicker: s(60),
    title,
    cta: s(40),
    note: s(160),
    lottie: s(200, LOTTIE),
    stubKicker: s(40),
    stubBody: s(160),
    stubCta: s(30),
    mascot,
    links: l(o({ title: s(40), body: s(100), href: url }), LIMITS.links),
  }),
});

/** Bagian rel → kunci isi yang dicakup (rel "meta" mencakup tirai + seo). */
export const SECTION_KEYS = { meta: ["curtain", "seo"] };
export const keysOf = (section) => SECTION_KEYS[section] ?? [section];

export const slugify = (t) =>
  String(t ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "kelas";

function uniqueKeys(items) {
  const seen = new Set();
  return items.map((it, i) => {
    let k = it.key || slugify(it.short || it.name) || `kelas-${i + 1}`;
    const base = k;
    let c = 2;
    while (seen.has(k)) k = `${base}-${c++}`.slice(0, 40);
    seen.add(k);
    return { ...it, key: k };
  });
}

/** Bersihkan + tegakkan aturan lintas field (kunci kelas unik, sel & skor tanpa kelas yatim, blok jadwal sah). */
export function cleanProgramKelas(v) {
  const out = clean(SHAPE, v);
  if (!out) return null;
  const tidy = (arr) => [...new Set((arr ?? []).map((x) => x.trim()).filter(Boolean))];
  if (out.classes?.items) {
    out.classes.items = uniqueKeys(out.classes.items).map((c) => ({
      ...c,
      forWho: tidy(c.forWho),
      highlights: tidy(c.highlights),
      requirements: tidy(c.requirements),
      week: (c.week ?? []).filter((w) => w.start == null || w.end == null || w.end > w.start),
    }));
    const keys = new Set(out.classes.items.map((c) => c.key));
    if (out.compare?.rows) out.compare.rows = out.compare.rows.map((r) => ({ ...r, values: (r.values ?? []).filter((x) => keys.has(x.cls)) }));
    if (out.quiz?.questions)
      out.quiz.questions = out.quiz.questions.map((q) => ({
        ...q,
        options: (q.options ?? []).map((op) => ({ ...op, scores: (op.scores ?? []).filter((x) => keys.has(x.cls)) })),
      }));
  }
  if (out.schedule && out.schedule.start != null && out.schedule.end != null && out.schedule.end <= out.schedule.start) out.schedule.end = Math.min(24, out.schedule.start + 1);
  return out;
}

const WORDS = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam"];
/** Isi token teks: `{jumlah}` → kata bilangan jumlah kelas, token lain dari `vars`. */
export function fill(text, vars = {}) {
  return String(text ?? "").replace(/\{(\w+)\}/g, (m, k) => {
    if (k === "jumlah" && typeof vars.jumlah === "number") return WORDS[vars.jumlah] ?? String(vars.jumlah);
    return vars[k] != null ? String(vars[k]) : m;
  });
}

/** Rel mana yang berbeda antara dua versi. */
export function changedSections(a, z) {
  const weeks = (v) => (v?.classes?.items ?? []).map((c) => [c.key, c.week]);
  return SECTIONS.map((x) => x.key).filter(
    (k) => keysOf(k).some((kk) => !sameJson(a?.[kk], z?.[kk])) || (k === "schedule" && !sameJson(weeks(a), weeks(z)))
  );
}

/** Nilai sel tabel banding untuk satu kelas (default "—"). */
export const cellOf = (row, cls) => row?.values?.find((x) => x.cls === cls) ?? { cls, kind: "text", text: "" };
/** Skor satu opsi kuis untuk satu kelas. */
export const scoreOf = (option, cls) => option?.scores?.find((x) => x.cls === cls)?.points ?? 0;
