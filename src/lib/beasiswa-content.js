/**
 * Konten halaman Beasiswa (`/beasiswa`).
 * Benang merah halaman: berapa persen UKT yang ditanggung (`coverage`, 0–100) dan apakah ada biaya hidup (`living`).
 *
 * CMS `PageContent` section `beasiswa` (Admin › Konten › Beasiswa):
 *   data.intro            → paragraf intro hero
 *   data.notice           → { title, body } banner (kosong → diturunkan dari jendela pendaftaran terdekat)
 *   data.items[]          → ditimpa per `slug` (field apa pun dari SCHOLARSHIPS; `href` = tautan resmi).
 *                           Mengisi `rules` atau `href` menghapus tanda contoh pada beasiswa itu.
 *                           Item dengan slug baru ikut tampil (wajib `name`, `coverage`).
 * Semua beasiswa di bawah adalah CONTOH (`sample`) → tampil dengan PlaceholderTag. Kuota & nominal tidak dikarang.
 *
 * Tanggal jendela `open`/`close` ditulis "MM-DD" (berulang tiap tahun); `windowsFor(s, now)` menghitung tanggal nyata.
 */

export const CURTAIN_KEY = "sisfor:curtain:beasiswa";
export const BANNER_KEY = "sisfor:banner:beasiswa";
export const PASSPORT_KEY = "sisfor:beasiswa:paspor";
export const WALLET_KEY = "sisfor:beasiswa:dompet";

export const INTRO = {
  body: "Kuliah di SISFOR bisa ditanggung sebagian sampai seluruhnya. Lihat berapa yang ditanggung tiap beasiswa, cek mana yang cocok dengan kondisimu, lalu simpan tenggatnya supaya tidak terlewat.",
};

/** Rentang penghasilan orang tua per bulan (urutan = makin tinggi). */
export const INCOME = [
  { key: "lt2", label: "< Rp2 juta" },
  { key: "2-4", label: "Rp2–4 juta" },
  { key: "4-8", label: "Rp4–8 juta" },
  { key: "gt8", label: "> Rp8 juta" },
];
export const ACHIEVEMENT = [
  { key: "none", label: "Belum ada" },
  { key: "kampus", label: "Tingkat kampus" },
  { key: "provinsi", label: "Provinsi / regional" },
  { key: "nasional", label: "Nasional ke atas" },
];
export const KELAS = [
  { key: "reguler", label: "Reguler" },
  { key: "karyawan", label: "Karyawan" },
  { key: "kemitraan", label: "Kemitraan Industri" },
];
export const KINDS = { pemerintah: "Pemerintah", kampus: "Kampus", mitra: "Mitra industri", lembaga: "Lembaga" };

export const DEFAULT_PASSPORT = { ipk: 3.2, semester: 3, income: "2-4", achievement: "none", kelas: "reguler" };

/**
 * Beasiswa contoh. `rules`: ipk minimum, semester [min, max], income = indeks INCOME tertinggi yang boleh,
 * achievement = indeks ACHIEVEMENT minimum, kelas = kelas yang boleh.
 * `mono` = monogram 2–3 huruf untuk pin penggaris & segel. `keep[]` = kewajiban selama menerima { clause (bahasa kontrak), plain (artinya) }.
 */
export const SCHOLARSHIPS = [
  {
    slug: "kip-kuliah",
    mono: "KIP",
    name: "KIP Kuliah",
    org: "Kemendiktisaintek",
    kind: "pemerintah",
    coverage: 100,
    living: true,
    lead: "Untuk mahasiswa dari keluarga berpenghasilan rendah yang terdata di data kesejahteraan sosial.",
    covers: ["UKT penuh selama masa studi normal", "Bantuan biaya hidup sesuai klaster daerah"],
    windows: [{ open: "03-01", close: "07-31", label: "Bersamaan dengan PMB" }],
    rules: { ipk: 0, semester: [1, 2], income: 1, achievement: 0, kelas: ["reguler"] },
    keep: [
      { clause: "Penerima wajib mempertahankan IPK sekurang-kurangnya 2,75 pada setiap evaluasi semester.", plain: "Di bawah 2,75 dua kali berturut-turut, bantuan bisa dihentikan." },
      { clause: "Penerima wajib menyelesaikan studi dalam masa studi normal.", plain: "Bantuan berhenti setelah semester 8." },
      { clause: "Penerima wajib melaporkan perubahan status akademik kepada pengelola.", plain: "Cuti atau pindah kelas harus dilaporkan dulu." },
    ],
    docs: ["Kartu KIP / bukti DTKS", "Surat keterangan penghasilan orang tua", "Kartu Keluarga", "Foto rumah tampak depan"],
    href: "",
    sample: true,
  },
  {
    slug: "mitra-sig",
    mono: "SIG",
    name: "Beasiswa Mitra Industri",
    org: "Semen Indonesia Group",
    kind: "mitra",
    coverage: 100,
    living: true,
    lead: "Untuk mahasiswa yang siap berkarier di Semen Indonesia Group setelah lulus.",
    covers: ["UKT penuh mulai semester berjalan", "Uang saku bulanan", "Prioritas magang di unit mitra"],
    windows: [{ open: "09-01", close: "10-15", label: "Semester ganjil" }],
    rules: { ipk: 3.25, semester: [3, 6], income: 3, achievement: 0, kelas: ["reguler", "kemitraan"] },
    keep: [
      { clause: "Penerima wajib mempertahankan IPK sekurang-kurangnya 3,25.", plain: "Batasnya lebih tinggi dari beasiswa umum." },
      { clause: "Penerima bersedia mengikuti ikatan dinas sesuai perjanjian dengan mitra.", plain: "Setelah lulus, kamu bekerja di grup selama masa yang disepakati." },
      { clause: "Penerima wajib menjalani Kerja Praktik di unit yang ditunjuk mitra.", plain: "Tempat magangmu ditentukan, bukan dipilih bebas." },
    ],
    docs: ["Transkrip nilai terakhir", "Surat rekomendasi prodi", "Esai motivasi", "Surat persetujuan orang tua"],
    href: "",
    sample: true,
  },
  {
    slug: "prestasi-uisi",
    mono: "PA",
    name: "Beasiswa Prestasi Akademik",
    org: "UISI",
    kind: "kampus",
    coverage: 50,
    living: false,
    lead: "Untuk mahasiswa dengan IPK tertinggi di angkatannya.",
    covers: ["Potongan 50% UKT untuk satu semester", "Dapat diperpanjang bila syarat tetap terpenuhi"],
    windows: [
      { open: "02-01", close: "02-28", label: "Semester genap" },
      { open: "08-15", close: "09-15", label: "Semester ganjil" },
    ],
    rules: { ipk: 3.5, semester: [2, 7], income: 3, achievement: 0, kelas: ["reguler", "karyawan", "kemitraan"] },
    keep: [
      { clause: "Penerima wajib memperoleh IPS sekurang-kurangnya 3,50 pada semester penerimaan.", plain: "Perpanjangan ditentukan IPS semester itu, bukan IPK." },
      { clause: "Penerima tidak sedang menerima beasiswa lain yang menanggung UKT.", plain: "Tidak bisa digabung dengan KIP Kuliah atau beasiswa mitra." },
    ],
    docs: ["Transkrip nilai terakhir", "Surat keterangan aktif kuliah"],
    href: "",
    sample: true,
  },
  {
    slug: "keringanan-ukt",
    mono: "KU",
    name: "Keringanan UKT",
    org: "UISI",
    kind: "kampus",
    coverage: 50,
    living: false,
    lead: "Untuk mahasiswa yang kondisi ekonomi keluarganya berubah di tengah masa studi.",
    covers: ["Penurunan golongan UKT atau cicilan", "Besaran ditetapkan setelah verifikasi"],
    windows: [
      { open: "01-15", close: "02-10", label: "Sebelum semester genap" },
      { open: "07-15", close: "08-10", label: "Sebelum semester ganjil" },
    ],
    rules: { ipk: 0, semester: [2, 8], income: 1, achievement: 0, kelas: ["reguler", "karyawan", "kemitraan"] },
    keep: [
      { clause: "Keringanan berlaku untuk satu semester dan dapat diajukan kembali.", plain: "Ajukan ulang tiap semester bila masih dibutuhkan." },
      { clause: "Data yang tidak sesuai kenyataan membatalkan keringanan.", plain: "Selisih UKT harus dibayar bila datanya keliru." },
    ],
    docs: ["Surat permohonan", "Bukti perubahan penghasilan (PHK, sakit, wafat)", "Kartu Keluarga"],
    href: "",
    sample: true,
  },
  {
    slug: "bank-indonesia",
    mono: "BI",
    name: "Beasiswa Bank Indonesia",
    org: "Bank Indonesia",
    kind: "lembaga",
    coverage: 40,
    living: true,
    lead: "Untuk mahasiswa aktif berorganisasi yang mau bergabung dengan komunitas penerimanya.",
    covers: ["Bantuan biaya pendidikan per bulan", "Pelatihan kepemimpinan"],
    windows: [{ open: "03-01", close: "04-15", label: "Sekali setahun" }],
    rules: { ipk: 3.0, semester: [3, 6], income: 2, achievement: 0, kelas: ["reguler"] },
    keep: [
      { clause: "Penerima wajib aktif dalam kegiatan komunitas penerima beasiswa.", plain: "Ada kegiatan rutin di luar jam kuliah." },
      { clause: "Penerima wajib mempertahankan IPK sekurang-kurangnya 3,00.", plain: "Dievaluasi tiap akhir semester." },
    ],
    docs: ["Transkrip nilai terakhir", "Surat keterangan tidak menerima beasiswa lain", "Esai"],
    href: "",
    sample: true,
  },
  {
    slug: "djarum-plus",
    mono: "DJ",
    name: "Djarum Beasiswa Plus",
    org: "Djarum Foundation",
    kind: "lembaga",
    coverage: 30,
    living: true,
    lead: "Untuk mahasiswa semester 4 yang berprestasi di dalam dan di luar kelas.",
    covers: ["Dana pendidikan bulanan selama setahun", "Pelatihan soft skill bersama penerima se-Indonesia"],
    windows: [{ open: "04-01", close: "05-31", label: "Sekali setahun" }],
    rules: { ipk: 3.2, semester: [4, 4], income: 3, achievement: 1, kelas: ["reguler"] },
    keep: [
      { clause: "Penerima wajib mengikuti seluruh rangkaian pelatihan soft skill.", plain: "Ketidakhadiran bisa menghentikan dana." },
      { clause: "Penerima wajib menyerahkan laporan nilai tiap akhir semester.", plain: "Unggah transkrip ke portal penyelenggara." },
    ],
    docs: ["Transkrip nilai semester 1–3", "Sertifikat organisasi atau prestasi", "Surat rekomendasi"],
    href: "",
    sample: true,
  },
  {
    slug: "kelas-karyawan",
    mono: "KK",
    name: "Potongan Kelas Karyawan",
    org: "UISI & perusahaan pengirim",
    kind: "mitra",
    coverage: 25,
    living: false,
    lead: "Untuk karyawan yang dikirim perusahaan mitra ke Kelas Karyawan.",
    covers: ["Potongan 25% UKT selama masa studi", "Pembayaran bisa langsung oleh perusahaan"],
    windows: [{ open: "06-01", close: "08-15", label: "Bersamaan dengan PMB" }],
    rules: { ipk: 0, semester: [1, 8], income: 3, achievement: 0, kelas: ["karyawan"] },
    keep: [
      { clause: "Potongan berlaku selama penerima masih berstatus karyawan perusahaan pengirim.", plain: "Pindah kerja berarti potongan berhenti." },
    ],
    docs: ["Surat tugas dari perusahaan", "Perjanjian kerja sama perusahaan dengan UISI"],
    href: "",
    sample: true,
  },
];

/* ------------------------------------------------------------------ util */

const parse = (v) => {
  if (!v) return null;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};
const str = (v) => (typeof v === "string" ? v.trim() : "");
const num = (v, d) => (Number.isFinite(Number(v)) && v !== "" && v != null ? Number(v) : d);
const list = (v) => (Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x.trim() : x)).filter(Boolean) : typeof v === "string" ? v.split("\n").map((s) => s.trim()).filter(Boolean) : null);

export const initials = (s) =>
  String(s)
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w) && !/^(dan|&|beasiswa|potongan)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const MMDD = /^\d{2}-\d{2}$/;

function normalize(s) {
  const name = str(s?.name);
  if (!name || !str(s?.slug)) return null;
  const rules = s.rules ?? {};
  return {
    ...s,
    name,
    org: str(s.org) || "Menyusul",
    kind: KINDS[s.kind] ? s.kind : "kampus",
    coverage: Math.max(0, Math.min(100, Math.round(num(s.coverage, 0)))),
    living: Boolean(s.living),
    windows: (Array.isArray(s.windows) ? s.windows : []).filter((w) => MMDD.test(w?.open) && MMDD.test(w?.close)),
    rules: {
      ipk: num(rules.ipk, 0),
      semester: Array.isArray(rules.semester) && rules.semester.length === 2 ? rules.semester.map(Number) : [1, 8],
      income: Math.max(0, Math.min(3, num(rules.income, 3))),
      achievement: Math.max(0, Math.min(3, num(rules.achievement, 0))),
      kelas: Array.isArray(rules.kelas) && rules.kelas.length ? rules.kelas : KELAS.map((k) => k.key),
    },
    covers: list(s.covers) ?? [],
    keep: Array.isArray(s.keep) ? s.keep.filter((k) => str(k?.clause)) : [],
    docs: list(s.docs) ?? [],
    href: str(s.href),
    monogram: (str(s.mono) || initials(name) || "B").slice(0, 3),
  };
}

/* ------------------------------------------------------------------ jendela pendaftaran */

/** Tanggal nyata (WIB-agnostik, tengah malam lokal) untuk satu jendela pada tahun `y`. */
function at(y, mmdd, end = false) {
  const [m, d] = mmdd.split("-").map(Number);
  return new Date(y, m - 1, d, end ? 23 : 0, end ? 59 : 0, end ? 59 : 0);
}

/**
 * Jendela terdekat yang belum berakhir (sedang buka atau akan buka). `now` disuntik agar mudah diuji.
 * → { open: Date, close: Date, label, state: "buka" | "segera", days } — days = sisa hari sampai tutup (buka) / sampai buka (segera)
 */
export function nextWindow(s, now) {
  if (!now || !s.windows.length) return null;
  const y = now.getFullYear();
  const cands = [];
  for (const w of s.windows) {
    for (const yy of [y - 1, y, y + 1]) {
      const open = at(yy, w.open);
      let close = at(yy, w.close, true);
      if (close < open) close = at(yy + 1, w.close, true);
      if (close >= now) cands.push({ open, close, label: w.label });
    }
  }
  cands.sort((a, b) => a.close - b.close);
  const c = cands.find((x) => x.open <= now) ?? cands.sort((a, b) => a.open - b.open)[0];
  if (!c) return null;
  const isOpen = c.open <= now;
  const days = Math.max(0, Math.ceil(((isOpen ? c.close : c.open) - now) / 86400000));
  return { ...c, state: isOpen ? "buka" : "segera", days };
}

/** Bulan (0–11) fraksional untuk dial tahun: 1 Mar → 2.0, 16 Mar → ±2.5. */
export const monthPos = (mmdd) => {
  const [m, d] = mmdd.split("-").map(Number);
  const dim = new Date(2025, m, 0).getDate();
  return m - 1 + (d - 1) / dim;
};

/* ------------------------------------------------------------------ kelayakan */

const fmtIpk = (v) => v.toFixed(2).replace(".", ",");

/**
 * Cek kelayakan satu beasiswa terhadap isian paspor.
 * → { status: "layak" | "hampir" | "belum", checks: [{ key, label, ok, gap }], gap: string|null }
 * "hampir" = hanya satu syarat yang belum, dan itu syarat yang bisa dikejar (IPK selisih ≤ 0,25 atau semester belum sampai).
 */
export function evaluate(s, p) {
  const r = s.rules;
  const incomeIdx = INCOME.findIndex((x) => x.key === p.income);
  const achIdx = ACHIEVEMENT.findIndex((x) => x.key === p.achievement);
  const checks = [];
  if (r.ipk > 0) {
    const d = r.ipk - p.ipk;
    checks.push({ key: "ipk", label: `IPK ≥ ${fmtIpk(r.ipk)}`, ok: d <= 0.0001, gap: d > 0 ? `IPK kurang ${fmtIpk(d)}` : null, soft: d > 0 && d <= 0.25 });
  }
  const [smin, smax] = r.semester;
  const semOk = p.semester >= smin && p.semester <= smax;
  checks.push({
    key: "semester",
    label: smin === smax ? `Semester ${smin}` : `Semester ${smin}–${smax}`,
    ok: semOk,
    gap: semOk ? null : p.semester < smin ? `Bisa daftar di semester ${smin}` : `Hanya sampai semester ${smax}`,
    soft: p.semester < smin,
  });
  if (r.income < 3)
    checks.push({
      key: "income",
      label: `Penghasilan orang tua ≤ ${INCOME[r.income].label.replace("< ", "")}`,
      ok: incomeIdx <= r.income,
      gap: incomeIdx <= r.income ? null : "Penghasilan di atas batas",
      soft: false,
    });
  if (r.achievement > 0)
    checks.push({
      key: "achievement",
      label: `Prestasi ${ACHIEVEMENT[r.achievement].label.toLowerCase()} ke atas`,
      ok: achIdx >= r.achievement,
      gap: achIdx >= r.achievement ? null : "Perlu sertifikat prestasi",
      soft: true,
    });
  if (r.kelas.length < KELAS.length)
    checks.push({
      key: "kelas",
      label: `Kelas ${r.kelas.map((k) => KELAS.find((x) => x.key === k)?.label).join(" / ")}`,
      ok: r.kelas.includes(p.kelas),
      gap: r.kelas.includes(p.kelas) ? null : "Tidak untuk kelasmu",
      soft: false,
    });
  const fails = checks.filter((c) => !c.ok);
  const status = !fails.length ? "layak" : fails.length === 1 && fails[0].soft ? "hampir" : "belum";
  return { status, checks, gap: fails[0]?.gap ?? null };
}

export function cleanPassport(raw) {
  const p = { ...DEFAULT_PASSPORT, ...(raw ?? {}) };
  return {
    ipk: Math.max(0, Math.min(4, Math.round(num(p.ipk, 3.2) * 100) / 100)),
    semester: Math.max(1, Math.min(8, Math.round(num(p.semester, 3)))),
    income: INCOME.some((x) => x.key === p.income) ? p.income : DEFAULT_PASSPORT.income,
    achievement: ACHIEVEMENT.some((x) => x.key === p.achievement) ? p.achievement : "none",
    kelas: KELAS.some((x) => x.key === p.kelas) ? p.kelas : "reguler",
  };
}

/* ------------------------------------------------------------------ merge */

/** Gabungkan CMS `beasiswa` ke fallback. */
export function mergeBeasiswa(row) {
  const raw = parse(row?.data);
  const cms = Array.isArray(raw?.items) ? raw.items.filter((x) => str(x?.slug)) : [];
  const base = SCHOLARSHIPS.map((s) => {
    const o = cms.find((x) => x.slug === s.slug);
    if (!o) return s;
    const official = Boolean(o.rules || str(o.href));
    return { ...s, ...o, rules: { ...s.rules, ...(o.rules ?? {}) }, sample: official ? false : s.sample };
  });
  const extra = cms.filter((x) => !SCHOLARSHIPS.some((s) => s.slug === x.slug) && str(x.name)).map((x) => ({ ...x, sample: false }));
  const items = [...base, ...extra].map(normalize).filter(Boolean).filter((s) => !s.hidden);

  const body = str(raw?.intro);
  const n = raw?.notice;
  return {
    intro: { body: body.length > 40 ? body : INTRO.body },
    notice: n && str(n.title) ? { title: str(n.title), body: str(n.body) } : null,
    items,
  };
}

export const rupiahLess = (s) => (s.living ? `${s.coverage}% UKT + biaya hidup` : `${s.coverage}% UKT`);

export const fmtDate = (d, opts = { day: "numeric", month: "short" }) => d.toLocaleDateString("id-ID", opts);
