/**
 * Konten halaman Program Kelas.
 * Bisa ditimpa dari CMS (PageContent) section "program-kelas":
 *   content        → paragraf intro hero
 *   data.classes[] → ditimpa per `key` (reguler | karyawan | kemitraan); field apa pun di CLASSES boleh diisi
 *   data.faq[]     → { q, a } menggantikan FAQ
 * SEMUA data kelas di bawah adalah CONTOH (`sample`) → tampil dengan PlaceholderTag.
 */

/** Kunci sessionStorage tirai masuk halaman. */
export const CURTAIN_KEY = "sisfor:curtain:program-kelas";
/** Kunci sessionStorage banner PMB yang ditutup. */
export const BANNER_KEY = "sisfor:banner:program-kelas";

export const INTRO = {
  body: "Kurikulum, dosen, dan gelar yang sama, dengan tiga ritme belajar. Pilih kelas yang paling pas dengan jadwal dan rencana kariermu.",
};

export const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
export const HOURS = { start: 7, end: 22 };

/** Program kelas. Urutan = urutan tab. */
export const CLASSES = [
  {
    key: "reguler",
    name: "Kelas Reguler",
    short: "Reguler",
    tagline: "Kuliah penuh waktu di kampus, ritme mahasiswa pada umumnya.",
    path: 0,
    lottie: "/lottie/campus.json",
    schedule: "Senin–Jumat · 07.30–16.00",
    mode: "Tatap muka di kampus",
    duration: 8,
    durationLabel: "semester",
    sks: 144,
    fee: "Rp6,5 jt",
    feeNote: "per semester",
    seats: 120,
    location: "Kampus UISI, Gresik",
    forWho: ["Lulusan SMA/SMK/MA sederajat", "Ingin pengalaman kampus penuh: organisasi, lomba, dan riset", "Siap kuliah di hari kerja"],
    highlights: [
      "Praktikum ERP di laboratorium setiap minggu",
      "Akses penuh organisasi, UKM, dan kompetisi",
      "Magang industri di semester 6",
    ],
    requirements: ["Ijazah/SKL SMA/SMK/MA sederajat", "Nilai rapor atau UTBK sesuai jalur PMB", "Tes potensi akademik UISI"],
    week: [
      { day: 0, start: 7.5, end: 10, label: "Sistem Enterprise" },
      { day: 0, start: 13, end: 15.5, label: "Praktikum ERP" },
      { day: 1, start: 8, end: 10.5, label: "Basis Data" },
      { day: 1, start: 13, end: 15, label: "Statistika" },
      { day: 2, start: 7.5, end: 10, label: "Rekayasa Proses Bisnis" },
      { day: 2, start: 10.5, end: 12, label: "Bahasa Inggris" },
      { day: 3, start: 8, end: 10.5, label: "Pemrograman Web" },
      { day: 3, start: 13, end: 16, label: "Praktikum Web" },
      { day: 4, start: 8, end: 10, label: "Tata Kelola TI" },
    ],
    sample: true,
  },
  {
    key: "karyawan",
    name: "Kelas Karyawan",
    short: "Karyawan",
    tagline: "Kuliah malam dan akhir pekan untuk yang sudah bekerja.",
    path: 1,
    lottie: "/lottie/calendar.json",
    schedule: "Senin–Kamis malam · Sabtu",
    mode: "Hybrid: tatap muka + daring",
    duration: 8,
    durationLabel: "semester",
    sks: 144,
    fee: "Rp7,5 jt",
    feeNote: "per semester",
    seats: 40,
    location: "Kampus UISI + kelas daring",
    forWho: ["Karyawan aktif atau wirausaha", "Lulusan SMA/SMK/D3 yang ingin naik jenjang", "Butuh jadwal di luar jam kantor"],
    highlights: [
      "Kuliah 18.30–21.00 dan Sabtu pagi",
      "Hingga 30% pertemuan daring sinkron",
      "Rekognisi pengalaman kerja (RPL) untuk mata kuliah tertentu",
    ],
    requirements: ["Ijazah SMA/SMK/D3 sederajat", "Surat keterangan bekerja", "Wawancara dengan program studi"],
    week: [
      { day: 0, start: 18.5, end: 21, label: "Sistem Enterprise" },
      { day: 1, start: 18.5, end: 21, label: "Basis Data", online: true },
      { day: 2, start: 18.5, end: 21, label: "Rekayasa Proses Bisnis" },
      { day: 3, start: 18.5, end: 21, label: "Tata Kelola TI", online: true },
      { day: 5, start: 8, end: 11, label: "Praktikum ERP" },
      { day: 5, start: 12.5, end: 15, label: "Pemrograman Web" },
    ],
    sample: true,
  },
  {
    key: "kemitraan",
    name: "Kelas Kemitraan Industri",
    short: "Kemitraan",
    tagline: "Kuliah sambil praktik di lingkungan Semen Indonesia Group.",
    path: 2,
    lottie: "/lottie/industry.json",
    schedule: "Blok kampus + blok industri",
    mode: "Kampus & lokasi mitra",
    duration: 8,
    durationLabel: "semester",
    sks: 144,
    fee: "Beasiswa mitra",
    feeNote: "sebagian/penuh",
    seats: 30,
    location: "Kampus UISI + unit SIG",
    forWho: ["Lulusan SMA/SMK terpilih jalur mitra", "Karyawan yang ditugaskan perusahaan mitra", "Ingin langsung menangani proyek nyata"],
    highlights: [
      "Proyek capstone dari kasus nyata perusahaan mitra",
      "Mentor praktisi + sertifikasi SAP",
      "Peluang ikatan kerja setelah lulus",
    ],
    requirements: ["Rekomendasi atau seleksi perusahaan mitra", "Ijazah SMA/SMK sederajat", "Tes potensi dan wawancara"],
    week: [
      { day: 0, start: 8, end: 11, label: "Sistem Enterprise" },
      { day: 0, start: 13, end: 15, label: "Analitik Bisnis" },
      { day: 1, start: 8, end: 16, label: "Blok industri · unit SIG", industry: true },
      { day: 2, start: 8, end: 16, label: "Blok industri · unit SIG", industry: true },
      { day: 3, start: 8, end: 10.5, label: "Tata Kelola TI" },
      { day: 3, start: 13, end: 16, label: "Proyek capstone" },
      { day: 4, start: 8, end: 10, label: "Mentoring praktisi" },
    ],
    sample: true,
  },
];

/**
 * Baris perbandingan. `values` berurutan sama dengan CLASSES.
 * true/false = centang/silang; string = teks.
 */
export const COMPARE = [
  { label: "Gelar & ijazah", values: ["S.Kom.", "S.Kom.", "S.Kom."] },
  { label: "Kurikulum & dosen", values: ["Sama", "Sama", "Sama"] },
  { label: "Waktu kuliah", values: ["Pagi–sore", "Malam & Sabtu", "Blok kampus/industri"] },
  { label: "Pertemuan daring", values: [false, "Hingga 30%", false] },
  { label: "Praktikum ERP (SAP)", values: [true, true, true] },
  { label: "Sertifikasi SAP", values: ["Opsional", "Opsional", true] },
  { label: "Magang industri", values: ["Semester 6", "Diakui dari kerja", "Sepanjang studi"] },
  { label: "Rekognisi pengalaman kerja", values: [false, true, true] },
  { label: "Organisasi & UKM", values: [true, "Terbatas", true] },
  { label: "Biaya / semester", values: ["Rp6,5 jt", "Rp7,5 jt", "Beasiswa mitra"] },
];

/** Kuis "Bantu aku memilih". `score` = poin per kelas [reguler, karyawan, kemitraan]. */
export const QUIZ = [
  {
    q: "Saat ini kamu sedang…",
    options: [
      { label: "Baru lulus SMA/SMK", hint: "Fokus penuh kuliah", score: [3, 0, 2] },
      { label: "Sudah bekerja", hint: "Kuliah di sela pekerjaan", score: [0, 3, 1] },
      { label: "Dikirim perusahaan", hint: "Ada rekomendasi mitra", score: [0, 1, 3] },
    ],
  },
  {
    q: "Waktu belajar yang paling longgar?",
    options: [
      { label: "Pagi sampai sore", hint: "Senin–Jumat", score: [3, 0, 2] },
      { label: "Malam & akhir pekan", hint: "Setelah jam kerja", score: [0, 3, 0] },
      { label: "Fleksibel, ikut proyek", hint: "Kampus + lokasi industri", score: [1, 0, 3] },
    ],
  },
  {
    q: "Yang paling kamu cari dari kuliah?",
    options: [
      { label: "Pengalaman kampus lengkap", hint: "Organisasi, lomba, riset", score: [3, 0, 1] },
      { label: "Naik jenjang karier", hint: "Gelar tanpa berhenti kerja", score: [0, 3, 1] },
      { label: "Langsung pegang proyek nyata", hint: "Mentor praktisi industri", score: [1, 0, 3] },
    ],
  },
];

export const REASONS = {
  reguler: "Kamu punya waktu penuh di hari kerja dan ingin merasakan kehidupan kampus seutuhnya.",
  karyawan: "Jadwal malam dan Sabtu membuatmu tetap bisa bekerja sambil meraih gelar S.Kom.",
  kemitraan: "Kamu cocok belajar langsung dari kasus nyata bersama praktisi Semen Indonesia Group.",
};

export const FAQ = [
  { q: "Apakah ijazah semua kelas sama?", a: "Ya. Semua kelas menempuh kurikulum, dosen, dan beban 144 SKS yang sama, sehingga gelar dan ijazah yang diterima identik: Sarjana Komputer (S.Kom.)." },
  { q: "Bisakah pindah kelas di tengah studi?", a: "Bisa, dengan pengajuan ke program studi di awal semester dan selama kuota kelas tujuan masih tersedia." },
  { q: "Kelas Karyawan wajib sudah bekerja?", a: "Diutamakan untuk yang sudah bekerja atau berwirausaha. Calon mahasiswa lain tetap bisa mendaftar setelah wawancara dengan program studi." },
  { q: "Bagaimana cara masuk Kelas Kemitraan Industri?", a: "Melalui rekomendasi perusahaan mitra atau seleksi khusus jalur mitra pada periode PMB. Informasi kuota diumumkan bersama jadwal PMB." },
  { q: "Apakah ada beasiswa?", a: "Ada beasiswa prestasi, beasiswa mitra industri, dan KIP Kuliah sesuai ketentuan universitas. Detail tiap periode diumumkan di laman PMB." },
];

const parse = (v) => {
  if (!v) return null;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

/** Gabungkan baris CMS ke fallback. `rows` = PageContent[] (boleh kosong). */
export function mergeProgramKelas(rows = []) {
  const row = rows.find((r) => r.section === "program-kelas");
  const data = parse(row?.data) ?? {};
  const cmsClasses = Array.isArray(data.classes) ? data.classes : [];
  const classes = CLASSES.map((c, i) => {
    const o = cmsClasses.find((x) => x?.key === c.key);
    return { ...c, ...(o ?? {}), n: i + 1, sample: o ? false : c.sample };
  });
  const faq = Array.isArray(data.faq) && data.faq.some((f) => f?.q && f?.a) ? data.faq.filter((f) => f?.q && f?.a) : FAQ;
  const body = row?.content?.trim();
  return {
    intro: { body: body && body.length > 40 ? body : INTRO.body },
    classes,
    compare: COMPARE,
    quiz: QUIZ,
    reasons: REASONS,
    faq,
  };
}
