/**
 * Data awal Kurikulum & RPS (aman untuk klien). Hanya dipakai untuk membangun KURIKULUM_DEFAULTS
 * dan memigrasi baris lama `curriculum`; halaman publik membaca isi CMS, bukan berkas ini.
 */

/** Empat rumpun mata kuliah = empat jalur di peta studi. */
export const RUMPUN = [
  { key: "fondasi", name: "Fondasi & Umum", short: "Fondasi", color: "navy", style: "solid" },
  { key: "enterprise", name: "Bisnis & Enterprise", short: "Enterprise", color: "maroon", style: "solid" },
  { key: "tata-kelola", name: "Tata Kelola & Audit TI", short: "Tata Kelola", color: "gold", style: "solid" },
  { key: "data", name: "Data & Rekayasa PL", short: "Data & PL", color: "navy", style: "ring" },
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

/**
 * RPS resmi Kota Cerdas (IS13KC53) — disalin dari dokumen RPS prodi, disusun 10 Oktober 2026.
 * Bentuk inilah yang dipakai editor RPS di Admin › Kurikulum.
 */
const UJIAN = "Ujian";
export const RPS_KOTA_CERDAS = {
  deskripsi:
    "Mata kuliah Kota Cerdas memberikan pemahaman mendalam mengenai konsep, arsitektur, dan implementasi teknologi informasi dalam tata kelola perkotaan modern. Mahasiswa mempelajari enam pilar utama smart city (Governance, Economy, Living, Society, Environment, dan Branding) serta peran teknologi pendukung seperti IoT, Big Data, dan AI, dengan merujuk pada Panduan Penyusunan Masterplan Smart City dan standar ISO 37122. Melalui pendekatan studi kasus dan proyek, mahasiswa menganalisis aspek e-Government, keterbukaan, dan partisipasi publik, mengevaluasi tingkat kematangan kota cerdas, serta merancang solusi berbasis sistem informasi yang inovatif, berkelanjutan, inklusif, dan berorientasi pada warga (citizen-centric) untuk menjawab permasalahan kota.",
  koordinator: "Ardhi Dwi Firmansyah, S.Kom., M.Kom.",
  dosen: "Ardhi Dwi Firmansyah, S.Kom., M.Kom.",
  tanggal: "10 Oktober 2026",
  prasyarat: "–",
  pdf: "/rps/IS13KC53-kota-cerdas.pdf",
  cpl: [
    { kode: "CPL07", teks: "Mampu menganalisa dan menjelaskan aspek terpenting dalam e-Government, implementasi transparansi, keterbukaan dan partisipasi publik dalam pengembangan Smart City." },
    { kode: "CPL09", teks: "Mampu mengevaluasi, merencanakan dan mengimplementasikan solusi TI/SI yang inovatif untuk menjawab permasalahan kota." },
  ],
  cpmk: [
    { kode: "CPMK07.013", bobot: 40, teks: "Mampu menjelaskan konsep dasar, filosofi, arsitektur, dan pilar-pilar utama pengembangan Kota Cerdas, serta menganalisis aspek e-Government, keterbukaan, dan partisipasi publik dalam konteks tata kelola perkotaan." },
    { kode: "CPMK09.026", bobot: 60, teks: "Mampu menganalisis keterkaitan teknologi informasi (IoT, Big Data, Cloud, AI) dengan solusi permasalahan perkotaan, mengevaluasi tingkat kematangan kota cerdas, serta menyusun proposal inisiatif solusi digital yang inovatif untuk tantangan urban tertentu." },
  ],
  subcpmk: [
    { kode: "SubCPMK01", teks: "Mampu menjelaskan konsep dasar, definisi, dan evolusi Kota Cerdas serta membedakannya dari e-Government" },
    { kode: "SubCPMK02", teks: "Mampu menjelaskan framework, dimensi, dan arsitektur teknologi Kota Cerdas (IoT, konektivitas, cloud)" },
    { kode: "SubCPMK03", teks: "Mampu menganalisis penerapan pilar Smart Governance, Economy, Living, dan Society termasuk partisipasi publik digital" },
    { kode: "SubCPMK04", teks: "Mampu mengevaluasi tingkat kematangan kota cerdas (maturity index) dan konsep kota berbasis data (City Operation Center, urban dashboard)" },
    { kode: "SubCPMK05", teks: "Mampu menganalisis studi kasus kota cerdas global dan peran AI dalam tata kelola kota secara kritis dan beretika" },
    { kode: "SubCPMK06", teks: "Mampu menyusun dan mempresentasikan proposal inisiatif solusi digital Kota Cerdas untuk tantangan urban tertentu" },
  ],
  bahanKajian: [
    "Konsep, definisi, evolusi, dan framework Kota Cerdas (Boyd Cohen, Giffinger, ISO 37120/37122)",
    "Arsitektur teknologi: IoT, konektivitas (5G/LPWAN), cloud computing, dan pusat data",
    "Enam pilar smart city: Governance, Economy, Branding, Living, Society, Environment",
    "Tingkat kematangan kota cerdas (IKCI/IKKI) dan kota berbasis data (COC, urban dashboard)",
    "Peran AI dan etika data dalam tata kelola kota; studi kasus global",
    "Penyusunan proposal/masterplan inisiatif solusi digital Kota Cerdas",
  ],
  pustaka: {
    utama: [
      "Direktorat Jenderal Aplikasi Informatika, Kementerian Komunikasi dan Informatika RI. 2017. Buku Panduan Penyusunan Masterplan Smart City — Gerakan Menuju 100 Smart City.",
      "International Organization for Standardization. ISO 37122: Sustainable Cities and Communities — Indicators for Smart Cities.",
    ],
    pendukung: [
      "Anthopoulos, L. 2017. Understanding Smart Cities: A Tool for Smart Government or an Industrial Trick?. Springer.",
      "Artikel jurnal dan studi kasus kota cerdas (Songdo, Barcelona, Singapura).",
    ],
  },
  minggu: [
    { judul: "Pengantar Kota Cerdas", bobot: 5, materi: "Kontrak kuliah, definisi, serta perbedaan e-Government dan smart city.", metode: "Kuliah; Discovery & Self-Directed Learning", subcpmk: "SubCPMK01", penilaian: "Tugas 1 (individu): ringkasan konsep dan perbedaan e-Gov vs smart city" },
    { judul: "Konsep Kota Cerdas", materi: "Konsep smart dan smart city, evolusi kota menuju kota cerdas.", metode: "Kuliah; Discovery Learning", subcpmk: "SubCPMK01", penilaian: "Tugas 1 (individu)" },
    { judul: "Framework & Dimensi Smart City", bobot: 15, materi: "Boyd Cohen vs Giffinger, standar ISO 37120/37122, Gerakan Menuju 100 Smart City.", metode: "Kuliah; Collaborative Learning; Class Discussion", subcpmk: "SubCPMK02", penilaian: "Tugas 2 (kelompok): pemetaan framework dan arsitektur teknologi sebuah kota" },
    { judul: "Arsitektur Teknologi", materi: "Lapisan sensor (IoT), konektivitas (5G/LPWAN), cloud computing, dan pusat data.", metode: "Kuliah; Discovery Learning", subcpmk: "SubCPMK02", penilaian: "Tugas 2 (kelompok)" },
    { judul: "Smart Governance", bobot: 20, materi: "E-Government, Open Data, partisipasi publik digital, dan efisiensi birokrasi.", metode: "Kuliah; Case-based Learning", subcpmk: "SubCPMK03", penilaian: "UTS: analisis penerapan pilar smart city pada sebuah kota" },
    { judul: "Smart Economy & Branding", materi: "Ekosistem startup, sharing economy, dan strategi city branding.", metode: "Kuliah; Case-based Learning", subcpmk: "SubCPMK03", penilaian: "UTS" },
    { judul: "Smart Living", materi: "Smart Mobility/ITS, e-health, dan keamanan publik (public safety).", metode: "Kuliah; Case-based Learning", subcpmk: "SubCPMK03", penilaian: "UTS" },
    { judul: "Reviu & UTS", materi: "Reviu materi minggu ke-1 hingga ke-7.", metode: "Ujian tertulis / analisis kasus (closed book)", subcpmk: "", penilaian: UJIAN },
    { judul: "Maturity Model & Index", bobot: 15, materi: "Penilaian indeks kota cerdas (IKCI, IKKI) dan strategi peningkatannya.", metode: "Kuliah; Problem-based Learning", subcpmk: "SubCPMK04", penilaian: "Tugas 3 (kelompok): evaluasi tingkat kematangan sebuah kota cerdas" },
    { judul: "Data-Driven City", materi: "City Operation Center (COC), command center, urban dashboard, serta peran AI dan etika data warga.", metode: "Kuliah; Problem-based Learning", subcpmk: "SubCPMK04", penilaian: "Tugas 3 (kelompok)" },
    { judul: "Smart Society", materi: "Literasi digital, pembangunan modal manusia, dan inklusivitas (difabel/lansia).", metode: "Kuliah; Collaborative Learning", subcpmk: "SubCPMK05", penilaian: "Formatif: diskusi studi kasus global dan analisis kritis peran AI" },
    { judul: "Global Case Studies", materi: "Analisis kasus Songdo, Barcelona, Singapura, dan tantangan kota-kota berkembang.", metode: "Kuliah; Case-based Learning; Group Discussion", subcpmk: "SubCPMK05", penilaian: "Formatif" },
    { judul: "Project Workshop 1", bobot: 45, materi: "Identifikasi masalah urban dan perumusan inisiatif solusi digital.", metode: "Kuliah; Project-based Learning", subcpmk: "SubCPMK06", penilaian: "Tugas Besar & UAS (kelompok): proposal inisiatif solusi Kota Cerdas dan pameran karya" },
    { judul: "Project Workshop 2", materi: "Penyusunan proposal/masterplan inisiatif solusi Kota Cerdas.", metode: "Kuliah; Project-based Learning", subcpmk: "SubCPMK06", penilaian: "Tugas Besar & UAS (kelompok)" },
    { judul: "Presentasi Final Project", materi: "Penyajian proposal inisiatif solusi digital secara persuasif.", metode: "Kuliah; Group Presentation", subcpmk: "SubCPMK06", penilaian: "Tugas Besar & UAS (kelompok)" },
    { judul: "Reviu & evaluasi akhir", materi: "Reviu dan evaluasi akhir proyek.", metode: "Ujian; pameran karya dan pengumpulan dokumen proposal", subcpmk: "SubCPMK06", penilaian: UJIAN },
  ],
  penilaian: [
    { label: "Tugas Individu", rencana: "Tugas 1 (ringkasan konsep e-Gov vs smart city)", bobot: 5, cpmk: "CPMK07.013" },
    { label: "Tugas Kelompok", rencana: "Tugas 2 & 3 (framework/arsitektur & evaluasi maturity)", bobot: 30, cpmk: "CPMK07.013 & CPMK09.026" },
    { label: "UTS", rencana: "Analisis penerapan pilar smart city", bobot: 20, cpmk: "CPMK07.013" },
    { label: "Tugas Besar", rencana: "Proposal inisiatif solusi Kota Cerdas (masterplan)", bobot: 15, cpmk: "CPMK09.026" },
    { label: "UAS", rencana: "Presentasi akhir & pameran karya", bobot: 30, cpmk: "CPMK09.026" },
  ],
};

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
    matkul: [{ nama: "Perencanaan Induk Sistem Informasi", sks: 3 }, { nama: "Estimasi Biaya Perangkat Lunak", sks: 3 }, { nama: "Pengujian Perangkat Lunak", sks: 3 }, { nama: "Perencanaan Keberlangsungan Bisnis", sks: 3 }, { nama: "Kota Cerdas", sks: 3, kode: "IS13KC53", smt: 7, rps: RPS_KOTA_CERDAS }],
  },
  {
    key: "data", name: "Data Science", short: "Data Science", rumpun: "data", lottie: "/lottie/data-chart-dark.json",
    lead: "Mengubah data operasional menjadi prediksi dan keputusan bisnis.",
    matkul: [{ nama: "Metode Peramalan", sks: 3 }, { nama: "Sains Data Terapan", sks: 3 }, { nama: "Pengantar Data Besar", sks: 3 }, { nama: "Mesin Pembelajar Untuk Bisnis", sks: 3 }],
  },
];

/** Klasifikasi awal rumpun per nama mata kuliah (bisa ditimpa field `rumpun` di CMS). */
export const RUMPUN_BY_COURSE = {
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
export const COURSE_RUMPUN = Object.fromEntries(Object.entries(RUMPUN_BY_COURSE).flatMap(([k, names]) => names.map((n) => [n.toLowerCase(), k])));

/**
 * Body of Knowledge prodi (struktur dari diagram resmi): fondasi → 4 blok inti → strategi → manajemen proyek
 * → 3 peminatan, diapit dua pilar. `courses` = pemetaan AWAL nama mata kuliah ke blok (usulan, bisa ditimpa
 * field `bok` per mata kuliah di CMS).
 */
export const BOK = [
  { key: "enterprise", group: "peak", name: "Enterprise Systems", lottie: "/lottie/erp-gears-dark.json",
    courses: ["Perencanaan Sumber Daya Perusahaan", "Perencanaan & Pengendalian Produksi", "Manajemen Proses Bisnis", "Arsitektur Enterprise", "Analisis Proses Bisnis Lanjut"] },
  { key: "governance", group: "peak", name: "IT Governance & Audit", lottie: "/lottie/shield-audit-dark.json",
    courses: ["Tata Kelola TI", "Audit TI", "Manajemen Risiko TI", "Perencanaan Induk Sistem Informasi", "Perencanaan Keberlangsungan Bisnis", "Kota Cerdas"] },
  { key: "data-science", group: "peak", name: "Data Science", lottie: "/lottie/data-chart-dark.json",
    courses: ["Penambangan Data", "Metode Peramalan", "Sains Data Terapan", "Pengantar Data Besar", "Mesin Pembelajar Untuk Bisnis"] },
  { key: "project", group: "band", name: "Information System Project Management",
    courses: ["Manajemen Proyek TI", "Simulasi Manajemen Proyek TI", "Simulasi Proyek TI Lanjut (Audit TI / Enterprise Sistem / Data Science)", "Estimasi Biaya Perangkat Lunak"] },
  { key: "strategy", group: "band", name: "Information System Management & Strategy",
    courses: ["Manajemen Organisasi & SDM", "Perencanaan Strategis SI", "Manajemen Layanan TI", "Manajemen Investasi TI", "Manajemen Hubungan Pelanggan", "Manajemen Rantai Pasok"] },
  { key: "design", group: "core", name: "System Design & Analysis",
    courses: ["Rekayasa Kebutuhan Perangkat Lunak", "Analisis & Desain Proses Bisnis", "Desain Pengalaman Pengguna", "Sistem Pendukung Keputusan"] },
  { key: "appdev", group: "core", name: "Application Development / Programming",
    courses: ["Pemrograman Terstruktur", "Pemrograman Berorientasi Objek", "Pemrograman Web", "Pemrograman Perangkat Bergerak", "Pengembangan & Implementasi Perangkat Lunak", "Pengujian Perangkat Lunak"] },
  { key: "infra", group: "core", name: "IT Infrastructure & Systems",
    courses: ["Sistem Operasi", "Jaringan Komputer", "Keamanan Siber", "Komputasi Awan"] },
  { key: "data-mgmt", group: "core", name: "Data / Information Management",
    courses: ["Manajemen Basis Data", "Pergudangan Data & Intelijensia Bisnis"] },
  { key: "foundation", group: "base", name: "Foundation of Information System",
    courses: ["Pengantar Teknologi Informasi", "Pengantar Sistem Informasi", "Matematika Diskrit", "Kalkulus & Aljabar Linier", "Statistika", "Pengenalan Akuntansi Keuangan"] },
  { key: "alignment", group: "pillar", name: "Business-ICT Value Alignment",
    courses: ["Kewirausahaan", "Wawasan Semen Indonesia", "Kerja Praktik", "Sertifikasi Profesional SI"] },
  { key: "ethics", group: "pillar", name: "Strong Ethics & Interpersonal Skills",
    courses: ["Keterampilan Interpersonal Bisnis", "Etika Profesional SI", "Pendidikan Agama", "Pancasila & Kewarganegaraan", "Bahasa Inggris 1", "Bahasa Inggris 2", "Bahasa Indonesia", "Wawasan Lingkungan Hidup", "Kuliah Kerja Nyata", "Metode Penelitian & Penulisan Ilmiah", "Skripsi / Lomba / PKM / Bisnis"] },
];
export const BOK_KEYS = BOK.map((b) => b.key);
