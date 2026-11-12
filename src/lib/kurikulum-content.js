/**
 * Konten halaman Kurikulum & RPS (/curiculum).
 * Sumber utama: CMS PageContent section "curriculum" (Admin › Kurikulum).
 *   data = [ { semester, matkul: [{ nama, sks, kode?, rumpun?, rps? }] } ]          ← bentuk lama (tetap didukung)
 *   data = { semesters: [...], electives: [...] }   ← bentuk baru
 * rps = { dosen, cpmk[], minggu[] (16 topik), penilaian[{ label, bobot }], pdf, revisi }
 * Ringkasan RPS di SAMPLE_RPS adalah CONTOH (`rpsSample`) → tampil dengan PlaceholderTag sampai CMS mengisinya.
 * Jalur kelulusan dan regulasi akademik punya halaman sendiri (menu Akademik), tidak dimuat di sini.
 */

export const CURTAIN_KEY = "sisfor:curtain:kurikulum";
export const BANNER_KEY = "sisfor:banner:kurikulum-rps";

/** Empat rumpun mata kuliah = empat jalur di peta studi. */
export const RUMPUN = [
  { key: "fondasi", name: "Fondasi & Umum", short: "Fondasi", color: "var(--navy)", dash: null },
  { key: "enterprise", name: "Bisnis & Enterprise", short: "Enterprise", color: "var(--maroon)", dash: null },
  { key: "tata-kelola", name: "Tata Kelola & Audit TI", short: "Tata Kelola", color: "var(--gold)", dash: null },
  { key: "data", name: "Data & Rekayasa PL", short: "Data & PL", color: "var(--navy)", dash: "2 7" },
];
export const RUMPUN_BY_KEY = Object.fromEntries(RUMPUN.map((r) => [r.key, r]));

/** Fallback bila CMS kosong — salinan prisma/seed-curriculum.js. */
export const FALLBACK_SEMESTERS = [
  { semester: 1, matkul: [
    { nama: "Bahasa Inggris 1", sks: 2 }, { nama: "Pendidikan Agama", sks: 2 }, { nama: "Pengantar Teknologi Informasi", sks: 2 },
    { nama: "Pengantar Sistem Informasi", sks: 2 }, { nama: "Matematika Diskrit", sks: 3 }, { nama: "Kalkulus & Aljabar Linier", sks: 3 },
    { nama: "Sistem Operasi", sks: 2 }, { nama: "Keterampilan Interpersonal Bisnis", sks: 2 },
  ] },
  { semester: 2, matkul: [
    { nama: "Bahasa Inggris 2", sks: 2 }, { nama: "Pancasila & Kewarganegaraan", sks: 3 }, { nama: "Pengenalan Akuntansi Keuangan", sks: 2 },
    { nama: "Statistika", sks: 3 }, { nama: "Jaringan Komputer", sks: 2 }, { nama: "Rekayasa Kebutuhan Perangkat Lunak", sks: 3 },
    { nama: "Pemrograman Terstruktur", sks: 4 },
  ] },
  { semester: 3, matkul: [
    { nama: "Wawasan Lingkungan Hidup", sks: 2 }, { nama: "Manajemen Organisasi & SDM", sks: 3 }, { nama: "Analisis & Desain Proses Bisnis", sks: 3 },
    { nama: "Perencanaan & Pengendalian Produksi", sks: 2 }, { nama: "Keamanan Siber", sks: 2 }, { nama: "Desain Pengalaman Pengguna", sks: 2 },
    { nama: "Pemrograman Berorientasi Objek", sks: 3 },
  ] },
  { semester: 4, matkul: [
    { nama: "Kewirausahaan", sks: 3 }, { nama: "Manajemen Hubungan Pelanggan", sks: 2 }, { nama: "Manajemen Rantai Pasok", sks: 2 },
    { nama: "Tata Kelola TI", sks: 3 }, { nama: "Manajemen Basis Data", sks: 4 }, { nama: "Pengembangan & Implementasi Perangkat Lunak", sks: 3 },
    { nama: "Pemrograman Web", sks: 3 },
  ] },
  { semester: 5, matkul: [
    { nama: "Bahasa Indonesia", sks: 2 }, { nama: "Perencanaan Sumber Daya Perusahaan", sks: 4 }, { nama: "Audit TI", sks: 2 },
    { nama: "Manajemen Risiko TI", sks: 2 }, { nama: "Pergudangan Data & Intelijensia Bisnis", sks: 4 }, { nama: "Pemrograman Perangkat Bergerak", sks: 3 },
    { nama: "Manajemen Proyek TI", sks: 2 },
  ] },
  { semester: 6, matkul: [
    { nama: "Wawasan Semen Indonesia", sks: 2 }, { nama: "Manajemen Layanan TI", sks: 3 }, { nama: "Perencanaan Strategis SI", sks: 3 },
    { nama: "Manajemen Investasi TI", sks: 2 }, { nama: "Penambangan Data", sks: 3 }, { nama: "Sistem Pendukung Keputusan", sks: 3 },
    { nama: "Simulasi Manajemen Proyek TI", sks: 3 },
  ] },
  { semester: 7, matkul: [
    { nama: "Kuliah Kerja Nyata", sks: 2 }, { nama: "Kerja Praktik", sks: 2 }, { nama: "Elective 1", sks: null },
    { nama: "Simulasi Proyek TI Lanjut (Audit TI / Enterprise Sistem / Data Science)", sks: 3 },
    { nama: "Metode Penelitian & Penulisan Ilmiah", sks: 3 }, { nama: "Elective 2", sks: 6 },
  ] },
  { semester: 8, matkul: [
    { nama: "Skripsi / Lomba / PKM / Bisnis", sks: 6 }, { nama: "Elective 1", sks: null }, { nama: "Sertifikasi Profesional SI", sks: 2 },
    { nama: "Etika Profesional SI", sks: 2 }, { nama: "Elective 2", sks: 6 },
  ] },
];

/** Mata kuliah pilihan per bidang (dari halaman kurikulum lama). */
export const ELECTIVES = [
  {
    key: "erp", name: "Enterprise Resource Planning", short: "ERP", rumpun: "enterprise", lottie: "/lottie/erp-gears-dark.json",
    lead: "Merancang dan mengintegrasikan proses bisnis perusahaan di atas platform enterprise.",
    matkul: [{ nama: "Manajemen Proses Bisnis", sks: 3 }, { nama: "Arsitektur Enterprise", sks: 3 }, { nama: "Analisis Proses Bisnis Lanjut", sks: 3 }, { nama: "Komputasi Awan", sks: 3 }],
  },
  {
    key: "tata-kelola", name: "Tata Kelola TI", short: "Tata Kelola", rumpun: "tata-kelola", lottie: "/lottie/shield-audit-dark.json",
    lead: "Menjaga investasi TI tetap selaras, terukur, dan siap menghadapi gangguan.",
    matkul: [{ nama: "Perencanaan Induk Sistem Informasi", sks: 3 }, { nama: "Estimasi Biaya Perangkat Lunak", sks: 3 }, { nama: "Pengujian Perangkat Lunak", sks: 3 }, { nama: "Perencanaan Keberlangsungan Bisnis", sks: 3 }],
  },
  {
    key: "data", name: "Data Science", short: "Data Science", rumpun: "data", lottie: "/lottie/data-chart-dark.json",
    lead: "Mengubah data operasional menjadi prediksi dan keputusan bisnis.",
    matkul: [{ nama: "Metode Peramalan", sks: 3 }, { nama: "Sains Data Terapan", sks: 3 }, { nama: "Pengantar Data Besar", sks: 3 }, { nama: "Mesin Pembelajar Untuk Bisnis", sks: 3 }],
  },
];

/** Klasifikasi awal rumpun per nama mata kuliah (bisa ditimpa field `rumpun` di CMS). */
const RUMPUN_BY_COURSE = {
  enterprise: [
    "Pengenalan Akuntansi Keuangan", "Manajemen Organisasi & SDM", "Analisis & Desain Proses Bisnis", "Perencanaan & Pengendalian Produksi",
    "Kewirausahaan", "Manajemen Hubungan Pelanggan", "Manajemen Rantai Pasok", "Perencanaan Sumber Daya Perusahaan",
    "Simulasi Proyek TI Lanjut (Audit TI / Enterprise Sistem / Data Science)",
  ],
  "tata-kelola": [
    "Keamanan Siber", "Tata Kelola TI", "Audit TI", "Manajemen Risiko TI", "Manajemen Proyek TI", "Manajemen Layanan TI",
    "Perencanaan Strategis SI", "Manajemen Investasi TI", "Simulasi Manajemen Proyek TI",
  ],
  data: [
    "Sistem Operasi", "Statistika", "Jaringan Komputer", "Rekayasa Kebutuhan Perangkat Lunak", "Pemrograman Terstruktur",
    "Desain Pengalaman Pengguna", "Pemrograman Berorientasi Objek", "Manajemen Basis Data", "Pengembangan & Implementasi Perangkat Lunak",
    "Pemrograman Web", "Pergudangan Data & Intelijensia Bisnis", "Pemrograman Perangkat Bergerak", "Penambangan Data", "Sistem Pendukung Keputusan",
  ],
};
const COURSE_RUMPUN = Object.fromEntries(Object.entries(RUMPUN_BY_COURSE).flatMap(([k, names]) => names.map((n) => [n.toLowerCase(), k])));

const week = (topics) => topics.map((t, i) => (i === 7 ? "Ujian Tengah Semester" : i === 15 ? "Ujian Akhir Semester" : t));

/** Ringkasan RPS CONTOH untuk beberapa mata kuliah inti (kunci = slug). */
export const SAMPLE_RPS = {
  "perencanaan-sumber-daya-perusahaan": {
    cpmk: [
      "Menjelaskan konsep, arsitektur, dan modul utama sistem ERP.",
      "Memetakan proses bisnis order-to-cash dan procure-to-pay ke konfigurasi ERP.",
      "Menjalankan transaksi inti pada sistem ERP dalam studi kasus manufaktur.",
      "Mengevaluasi kesiapan dan risiko implementasi ERP di organisasi.",
    ],
    minggu: week([
      "Konsep dan evolusi ERP", "Struktur organisasi & master data", "Proses procure-to-pay", "Praktik modul pembelian",
      "Proses order-to-cash", "Praktik modul penjualan", "Manajemen persediaan", "", "Perencanaan produksi", "Praktik modul produksi",
      "Integrasi akuntansi", "Pelaporan & analitik ERP", "Metodologi implementasi", "Manajemen perubahan", "Presentasi studi kasus", "",
    ]),
    penilaian: [{ label: "Tugas & praktikum", bobot: 30 }, { label: "Proyek studi kasus", bobot: 20 }, { label: "UTS", bobot: 25 }, { label: "UAS", bobot: 25 }],
  },
  "audit-ti": {
    cpmk: [
      "Menjelaskan standar dan kerangka kerja audit sistem informasi.",
      "Menyusun program audit berbasis risiko untuk satu proses TI.",
      "Mengumpulkan dan menilai bukti audit pengendalian umum dan aplikasi.",
    ],
    minggu: week([
      "Peran auditor SI", "Standar & kode etik audit", "Kerangka COBIT untuk audit", "Penilaian risiko audit", "Perencanaan & program audit",
      "Pengendalian umum TI", "Pengendalian aplikasi", "", "Teknik pengumpulan bukti", "Audit berbantuan komputer", "Audit keamanan informasi",
      "Audit kelangsungan bisnis", "Temuan & rekomendasi", "Penyusunan laporan audit", "Simulasi audit kelompok", "",
    ]),
    penilaian: [{ label: "Tugas", bobot: 25 }, { label: "Simulasi audit", bobot: 25 }, { label: "UTS", bobot: 25 }, { label: "UAS", bobot: 25 }],
  },
  "tata-kelola-ti": {
    cpmk: [
      "Menjelaskan prinsip tata kelola TI dan kaitannya dengan tata kelola perusahaan.",
      "Menerapkan kerangka COBIT untuk menilai kapabilitas proses TI.",
      "Merumuskan rekomendasi perbaikan tata kelola TI sebuah organisasi.",
    ],
    minggu: week([
      "Tata kelola perusahaan & TI", "Penyelarasan bisnis–TI", "Pengenalan COBIT", "Tujuan berjenjang (goals cascade)", "Struktur & peran pengambil keputusan",
      "Pengelolaan nilai TI", "Pengelolaan risiko TI", "", "Penilaian kapabilitas proses", "Studi kasus penilaian", "Kebijakan & prosedur TI",
      "Kepatuhan & regulasi", "Pengukuran kinerja TI", "Rekomendasi perbaikan", "Presentasi proyek", "",
    ]),
    penilaian: [{ label: "Tugas", bobot: 25 }, { label: "Proyek kelompok", bobot: 25 }, { label: "UTS", bobot: 25 }, { label: "UAS", bobot: 25 }],
  },
  "pergudangan-data-intelijensia-bisnis": {
    cpmk: [
      "Merancang model dimensional untuk kebutuhan analitik bisnis.",
      "Membangun proses ETL dari sumber data operasional ke gudang data.",
      "Menyajikan dashboard yang menjawab pertanyaan bisnis.",
    ],
    minggu: week([
      "Data operasional vs analitik", "Arsitektur gudang data", "Pemodelan dimensional", "Skema bintang & snowflake", "Desain tabel fakta",
      "Proses ETL", "Praktik ETL", "", "Kualitas data", "OLAP & kubus data", "Visualisasi data", "Perancangan dashboard",
      "KPI & metrik bisnis", "Self-service BI", "Presentasi proyek BI", "",
    ]),
    penilaian: [{ label: "Praktikum", bobot: 30 }, { label: "Proyek BI", bobot: 20 }, { label: "UTS", bobot: 25 }, { label: "UAS", bobot: 25 }],
  },
  "analisis-desain-proses-bisnis": {
    cpmk: [
      "Mengidentifikasi dan memodelkan proses bisnis dengan notasi BPMN.",
      "Menganalisis inefisiensi proses menggunakan metrik waktu dan biaya.",
      "Merancang ulang proses bisnis yang didukung sistem informasi.",
    ],
    minggu: week([
      "Konsep proses bisnis", "Identifikasi proses", "Notasi BPMN dasar", "BPMN lanjutan", "Penemuan proses (process discovery)",
      "Analisis kualitatif proses", "Analisis kuantitatif proses", "", "Perancangan ulang proses", "Otomasi proses", "Simulasi proses",
      "Process mining", "Pemantauan proses", "Studi kasus industri", "Presentasi rancangan", "",
    ]),
    penilaian: [{ label: "Tugas", bobot: 30 }, { label: "Proyek pemodelan", bobot: 20 }, { label: "UTS", bobot: 25 }, { label: "UAS", bobot: 25 }],
  },
  "manajemen-basis-data": {
    cpmk: [
      "Merancang basis data relasional dari kebutuhan bisnis.",
      "Menulis kueri SQL untuk manipulasi dan analisis data.",
      "Menerapkan normalisasi, indeks, dan transaksi untuk menjaga integritas data.",
    ],
    minggu: week([
      "Konsep sistem basis data", "Model entitas-relasi", "Model relasional", "Normalisasi", "SQL: DDL", "SQL: DML dasar", "SQL: join & agregasi", "",
      "Subkueri & view", "Prosedur tersimpan & trigger", "Transaksi & konkurensi", "Indeks & optimasi kueri", "Keamanan basis data",
      "Basis data NoSQL", "Presentasi proyek basis data", "",
    ]),
    penilaian: [{ label: "Praktikum", bobot: 30 }, { label: "Proyek", bobot: 20 }, { label: "UTS", bobot: 25 }, { label: "UAS", bobot: 25 }],
  },
};

export function slugify(s = "") {
  return String(s)
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const parse = (v) => {
  if (!v) return null;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

const isSlot = (nama = "") => /^elective\b/i.test(nama.trim());
const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : Number.isFinite(Number(v)) && v !== null && v !== "" ? Number(v) : null);

function hasRps(r) {
  return !!r && (r.pdf || (Array.isArray(r.cpmk) && r.cpmk.length) || (Array.isArray(r.minggu) && r.minggu.some(Boolean)));
}

function buildCourse(mk, extra, used) {
  const nama = String(mk?.nama ?? "").trim();
  let slug = slugify(nama) || "mata-kuliah";
  while (used.has(slug)) slug = `${slug}-${extra.semester ?? "p"}`;
  used.add(slug);
  const cmsRps = mk?.rps && hasRps(mk.rps) ? mk.rps : null;
  const sample = !cmsRps && SAMPLE_RPS[slug] ? SAMPLE_RPS[slug] : null;
  return {
    slug,
    nama,
    sks: num(mk?.sks),
    kode: mk?.kode || "",
    rumpun: RUMPUN_BY_KEY[mk?.rumpun] ? mk.rumpun : extra.rumpun ?? COURSE_RUMPUN[nama.toLowerCase()] ?? "fondasi",
    rps: cmsRps ?? sample,
    rpsSample: !!sample,
    ...extra,
  };
}

/** Gabungkan baris CMS ke fallback. `row` = PageContent "curriculum" (boleh null). */
export function mergeKurikulum(row) {
  const raw = parse(row?.data);
  const obj = Array.isArray(raw) ? { semesters: raw } : raw ?? {};
  const cmsSem = Array.isArray(obj.semesters) && obj.semesters.some((s) => Array.isArray(s?.matkul) && s.matkul.length) ? obj.semesters : null;
  const used = new Set();

  const semesters = (cmsSem ?? FALLBACK_SEMESTERS)
    .map((s, i) => ({ semester: num(s.semester) ?? i + 1, matkul: Array.isArray(s.matkul) ? s.matkul : [] }))
    .sort((a, b) => a.semester - b.semester)
    .map((s) => {
      const items = s.matkul.map((mk) =>
        isSlot(mk?.nama) ? { slot: true, nama: String(mk.nama).trim(), sks: num(mk.sks), slug: `slot-${s.semester}-${slugify(mk.nama)}` } : buildCourse(mk, { semester: s.semester }, used)
      );
      const sks = items.reduce((t, c) => t + (c.sks ?? 0), 0);
      return { semester: s.semester, items, sks };
    });

  const cmsEl = Array.isArray(obj.electives) ? obj.electives : [];
  const electives = ELECTIVES.map((e) => {
    const o = cmsEl.find((x) => x?.key === e.key);
    const list = Array.isArray(o?.matkul) && o.matkul.length ? o.matkul : e.matkul;
    return { ...e, ...(o ?? {}), lottie: e.lottie, matkul: list.map((mk) => buildCourse(mk, { semester: null, track: e.key, rumpun: e.rumpun }, used)) };
  });

  const core = semesters.flatMap((s) => s.items.filter((c) => !c.slot));
  const optional = electives.flatMap((e) => e.matkul);
  const courses = [...core, ...optional];
  const totalSks = semesters.reduce((t, s) => t + s.sks, 0);
  const maxSks = Math.max(...courses.map((c) => c.sks ?? 0), 1);

  return {
    title: row?.title || "Kurikulum Program Studi",
    semesters,
    electives,
    courses,
    totals: { sks: totalSks, wajib: core.length, pilihan: optional.length, rps: courses.filter((c) => c.rps).length },
    maxSks,
  };
}

