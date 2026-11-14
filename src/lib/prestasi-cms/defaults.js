/**
 * Isi bawaan halaman Prestasi (`/achievement`). Komponen publik tidak menyimpan teks sendiri:
 * semua kalimat, label, dan aset berasal dari sini (ditimpa Ruang Kurator).
 * Token `{…}` diisi angka saat render.
 */
export const PRESTASI_DEFAULTS = {
  curtain: { enabled: true, title: "Prestasi", accent: "Sisfor", label: "Memuat prestasi" },

  hero: {
    breadcrumb: [
      { label: "Beranda", href: "/" },
      { label: "Profil", href: "" },
      { label: "Prestasi", href: "" },
    ],
    titleTop: "Jejak juara,",
    titleAccent: "dari kelas ke panggung",
    lead: "Panggung",
    rotateWords: ["konferensi internasional", "kejuaraan nasional", "kompetisi desain", "sertifikasi Microsoft", "forum human capital"],
    countTemplate: "{n} prestasi dari {people} peraih",
    spanTemplate: "tercatat {from}–{to}.",
    body: "Dosen dipercaya menjadi editor, reviewer, dan profesor tamu di luar negeri; mahasiswa naik podium kejuaraan nasional dan tampil di konferensi internasional.",
    ctaLabel: "Jelajahi arsip",
    storyLinkLabel: "Tonton kisah mawapres",
    chipsLabel: "Tingkat:",
    fame: { show: true, limit: 12 },
    mascot: { show: true, pose: "proud", say: "Ini para juara kita. Giliranmu berikutnya!" },
  },

  labels: {
    levels: { internasional: "Internasional", nasional: "Nasional", regional: "Regional" },
    categories: { all: "Semua", mahasiswa: "Mahasiswa", dosen: "Dosen" },
    ongoing: "Berjalan",
    now: "kini",
  },

  roles: [
    { keyword: "juara", label: "Juara" },
    { keyword: "finalis", label: "Finalis" },
    { keyword: "editor", label: "Editor" },
    { keyword: "visiting", label: "Profesor tamu" },
    { keyword: "presenter", label: "Presenter" },
    { keyword: "reviewer, moderator", label: "Reviewer" },
    { keyword: "delegasi", label: "Delegasi" },
    { keyword: "riset, hibah", label: "Riset" },
  ],
  roleFallback: "Rekognisi",

  archive: {
    titleTop: "Arsip",
    titleAccent: "prestasi",
    body: "Saring menurut peraih, tingkat, atau tahun. Klik baris mana pun untuk membuka semua capaian orang tersebut.",
    lottie: "/lottie/medal.json",
    searchPlaceholder: "Cari nama atau kompetisi…",
    yearAllLabel: "Semua tahun",
    countLabel: "Menampilkan {shown} dari {total} prestasi",
    clearLabel: "Hapus {n} filter",
    groupLabel: "{n} prestasi",
    pageSize: 10,
    moreLabel: "Tampilkan {n} lagi",
    doneToast: "Ujung arsip tercapai",
    doneDetail: "{n} prestasi cocok dengan saringan ini.",
    empty: {
      lottie: "/lottie/empty-news.json",
      title: "Belum ada prestasi yang cocok",
      body: "Coba kata kunci lain, atau buka semua tingkat dan tahun.",
      resetLabel: "Tampilkan semua prestasi",
    },
  },

  story: {
    show: true,
    kicker: "Kisah sukses",
    quote: "Magang bersertifikat, pertukaran mahasiswa, dan kompetisi: cerita mahasiswa berprestasi Sistem Informasi UISI tentang belajar di luar kelas.",
    accentWords: 4,
    lottie: "/lottie/trophy-dark.json",
    people: [{ name: "Felix Atmaja", role: "Mahasiswa Berprestasi Sistem Informasi UISI 2023", photo: "/img/mhs/felix.png" }],
    video: { src: "/video/mawapres.mp4", poster: "/video/mawapres.jpg", title: "Kisah Sukses Mawapres Sistem Informasi UISI", duration: "2:31" },
    mascot: { show: true, pose: "laugh", say: "Kakak tingkat keren banget!" },
  },

  closing: {
    show: true,
    lottie: "/lottie/medal.json",
    titleTop: "Prestasi berikutnya",
    titleAccent: "bisa milikmu",
    body: "Ikuti jejak para peraih di Sistem Informasi UISI. Langkah pertamanya dimulai dari pendaftaran.",
    cta: { label: "Daftar PMB 2027", href: "https://pmb.uisi.ac.id/prosedur" },
    report: { label: "Baru juara? Laporkan prestasimu", href: "https://s.id/DaftarSisforUISI" },
    next: [
      { href: "/dosen", title: "Dosen", body: "Para pembimbing di balik capaian mahasiswa." },
      { href: "/profil-lulusan", title: "Profil Lulusan", body: "Ke mana prestasi itu membawa alumni." },
      { href: "/curiculum", title: "Kurikulum", body: "Mata kuliah yang menyiapkan kompetisi." },
    ],
  },

  modal: {
    countLabel: "{n} prestasi",
    sinceLabel: "sejak {year}",
    description: "Linimasa capaian, dari yang terbaru.",
    prevLabel: "Peraih sebelumnya",
    nextLabel: "Peraih berikutnya",
    lottie: "/lottie/medal-dark.json",
  },

  sample: { enabled: true },

  seo: {
    title: "Prestasi — Sistem Informasi UISI",
    description: "Prestasi dan rekognisi dosen serta mahasiswa Program Studi Sistem Informasi UISI di tingkat nasional dan internasional.",
  },
};
