import { CONTACT_URL, VIDEOS } from "@/lib/home-content";

/**
 * Isi bawaan halaman Dosen — semua teks yang tampil di /dosen ada di sini; komponen tidak lagi
 * memuat literal. Katalog Dosen (CMS) hanya menimpa yang diubah.
 */

/** Tambahan akademik bawaan per dosen (key = key orang di Studio Bagan). courses & research = CONTOH. */
export const LECTURER_EXTRA = {
  kaprodi: {
    slug: "grandys",
    fields: ["strategi", "tata-kelola"],
    quote: "Sistem informasi yang baik selalu berangkat dari strategi bisnis, bukan dari teknologinya.",
    courses: ["Perencanaan Strategis SI", "Arsitektur Enterprise", "Manajemen Risiko TI"],
    research: ["Penyelarasan strategi bisnis dan TI di industri manufaktur", "Kerangka arsitektur enterprise untuk BUMN"],
  },
  ardhi: {
    slug: "ardhi",
    fields: ["tata-kelola"],
    courses: ["Tata Kelola TI", "Manajemen Layanan TI", "Tata Kelola Data"],
    research: ["Kematangan tata kelola data di perguruan tinggi", "Penerapan ITIL pada layanan TI korporat"],
  },
  putri: {
    slug: "putri",
    fields: ["enterprise", "data"],
    courses: ["Pemodelan Sistem", "Sistem Dinamik", "Manajemen Rantai Pasok"],
    research: ["Model sistem dinamik untuk rantai pasok semen", "Simulasi kebijakan persediaan berbasis data"],
  },
  brina: {
    slug: "brina",
    fields: ["data"],
    courses: ["Statistika", "Peramalan Bisnis", "Sistem Pendukung Keputusan"],
    research: ["Peramalan permintaan dengan model hibrida", "Sistem pendukung keputusan cerdas untuk UMKM"],
  },
  catur: {
    slug: "catur",
    fields: ["data", "strategi"],
    courses: ["Data Science", "Rekayasa Perangkat Lunak", "Teknologi Pendidikan"],
    research: ["Analitik pembelajaran pada platform daring", "Rekayasa kebutuhan aplikasi pendidikan"],
  },
  tikno: {
    slug: "tikno",
    fields: ["enterprise", "tata-kelola"],
    courses: ["Sistem Enterprise (ERP)", "Audit Sistem Informasi", "Perilaku Konsumen Digital"],
    research: ["Evaluasi pasca-implementasi ERP", "Audit TI berbasis COBIT di sektor industri"],
  },
};

/** Ilustrasi Lottie versi gelap yang tersedia untuk rumpun. */
export const FIELD_LOTTIES = [
  "/lottie/shield-audit-dark.json",
  "/lottie/erp-gears-dark.json",
  "/lottie/data-chart-dark.json",
  "/lottie/strategy-target-dark.json",
];

export const DOSEN_DEFAULTS = {
  curtain: { enabled: true, title: "Dosen", accent: "Sisfor", label: "Memuat profil dosen" },
  hero: {
    breadcrumb: [
      { label: "Beranda", href: "/" },
      { label: "Profil", href: "" },
      { label: "Dosen", href: "" },
    ],
    titleTop: "Belajar dari",
    titleAccent: "yang mengerjakannya",
    rotatePrefix: "Ahli di",
    rotateWords: [],
    countLabel: "dosen tetap",
    topicLabel: "topik keahlian",
    intro:
      "Akademisi bersertifikat yang juga praktisi: tata kelola TI, ERP, data, dan strategi sistem informasi diajarkan langsung oleh orang yang mengerjakannya di industri.",
    search: { placeholder: "Cari nama dosen, topik, atau mata kuliah…", tryLabel: "Coba:", allLabel: "Semua rumpun", submitLabel: "Cari" },
    mascot: { show: true, pose: "wave", say: "Ketik topiknya, aku carikan dosennya!" },
    video: {
      show: true,
      label: "Video profil dosen",
      src: VIDEOS.dosen.src,
      poster: VIDEOS.dosen.poster,
      title: VIDEOS.dosen.title,
      duration: VIDEOS.dosen.duration,
    },
  },
  directory: {
    titleTop: "Direktori",
    titleAccent: "dosen",
    body: "Klik dosen untuk melihat mata kuliah yang diampu, bidang riset, dan profil lengkapnya.",
    sampleLabel: "Contoh konten · menunggu data CMS",
    cardCta: "Lihat profil",
    leadBadge: "Kaprodi",
    empty: { title: "Belum ada dosen yang cocok", body: "Coba kata kunci lain atau tampilkan semua rumpun.", resetLabel: "Tampilkan semua dosen" },
  },
  fields: [
    { key: "tata-kelola", name: "Tata Kelola & Audit TI", short: "Tata Kelola", lottie: FIELD_LOTTIES[0], body: "IT governance, data governance, layanan TI, dan audit sistem." },
    { key: "enterprise", name: "Enterprise & ERP", short: "Enterprise", lottie: FIELD_LOTTIES[1], body: "Sistem ERP, rantai pasok, dan proses bisnis perusahaan." },
    { key: "data", name: "Data & Keputusan", short: "Data", lottie: FIELD_LOTTIES[2], body: "Statistika, peramalan, data science, dan sistem pendukung keputusan." },
    { key: "strategi", name: "Strategi & Arsitektur SI", short: "Strategi", lottie: FIELD_LOTTIES[3], body: "Perencanaan strategis SI, enterprise architecture, dan teknologi pendidikan." },
  ],
  map: {
    show: true,
    titleTop: "Empat rumpun,",
    titleAccent: "satu ekosistem",
    body: "Keahlian dosen saling melengkapi: dari tata kelola hingga data, semuanya bermuara pada sistem enterprise di industri.",
    ctaLabel: "dosen",
  },
  closing: {
    show: true,
    titleTop: "Ingin berkolaborasi dengan",
    titleAccent: "dosen kami?",
    body: "Sekretariat prodi akan menghubungkan Anda dengan dosen yang tepat untuk kebutuhan Anda.",
    ways: ["Riset bersama", "Narasumber", "Magang", "Proyek industri"],
    cta: { label: "Hubungi prodi", href: CONTACT_URL },
    mascot: { show: true, pose: "thumbs-up", say: "Dosennya ramah, kok!" },
    next: [
      { href: "/struktur-organisasi", kicker: "Profil", title: "Struktur Organisasi", body: "Pimpinan prodi dan Minilab Sistem Informasi." },
      { href: "/curiculum", kicker: "Akademik", title: "Kurikulum", body: "Mata kuliah yang diampu para dosen." },
      { href: "/achievement", kicker: "Profil", title: "Prestasi", body: "Capaian dosen dan mahasiswa." },
      { href: "/sambutan-kaprodi", kicker: "Profil", title: "Sambutan Kaprodi", body: "Pandangan kaprodi tentang pendidikan Sisfor." },
    ],
  },
  modal: {
    labels: {
      tabProfile: "Profil",
      tabTeach: "Mengajar",
      tabResearch: "Riset",
      nuptk: "NUPTK",
      email: "Email",
      pending: "menyusul",
      fallback: "Dosen Sistem Informasi",
      expertise: "Bidang keahlian",
      education: "Jenjang pendidikan",
      certs: "Sertifikasi",
      courses: "Mata kuliah yang diampu",
      research: "Topik riset",
      prev: "Dosen sebelumnya",
      next: "Dosen berikutnya",
    },
    links: { scholar: "Google Scholar", scopus: "Scopus", sinta: "SINTA" },
  },
  certs: [
    { code: "MCE", label: "Microsoft Certified Educator" },
    { code: "MOS", label: "Microsoft Office Specialist" },
    { code: "MCF", label: "Microsoft Certified Fundamentals" },
    { code: "CIIQA", label: "Certified International Indonesian Quality Assurance" },
  ],
  lecturers: [],
  seo: {
    title: "Dosen — Sistem Informasi UISI",
    description: "Profil dosen Program Studi Sistem Informasi UISI: bidang keahlian, jenjang pendidikan, sertifikasi, mata kuliah, dan topik riset.",
  },
};
