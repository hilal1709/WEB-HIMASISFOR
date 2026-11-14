import { PMB_URL } from "@/lib/home-content";

/**
 * Isi default halaman Visi & Misi — setiap teks yang tampil di halaman publik ada di sini,
 * tidak ada literal di komponen. Ruang Kompas (CMS) hanya menimpa bagian yang diubah.
 * Visi & misi = teks resmi. Penjelasan misi & tonggak bertanda `sample` = contoh (diberi label di publik).
 */
export const VISI_MISI_DEFAULTS = {
  curtain: { enabled: true, title: "Visi", accent: "& Misi", label: "Memuat visi dan misi" },
  hero: {
    breadcrumb: [
      { label: "Beranda", href: "/" },
      { label: "Profil", href: "" },
      { label: "Visi & Misi", href: "" },
    ],
    kicker: "Menuju 2030 · sejak 2014",
    titleTop: "Visi",
    titleAccent: "& Misi",
    subtitle: "Satu visi dan lima misi yang menjadi pegangan setiap keputusan program studi, dari ruang kelas sampai kerja sama industri.",
    ctaLabel: "Baca visi kami",
    yearFrom: 2014,
    yearTo: 2030,
    showHorizon: true,
    mascot: { show: true, pose: "confident", say: "2030 tinggal sebentar lagi. Ayo ikut mewujudkannya!" },
  },
  visi: {
    label: "Visi",
    sublabel: "Program Studi Sistem Informasi UISI",
    text: "Menjadi Departemen Sistem Informasi yang unggul dalam bidang Sistem Enterprise, Tata Kelola dan Audit TI serta Sains Data pada tahun 2030 melalui sistem pengajaran, penelitian dan pengabdian masyarakat yang inovatif, berkualitas tinggi, dan berdaya-saing internasional serta oleh praktik-praktik terbaik industri",
    highlights: ["unggul", "2030", "berdaya-saing internasional", "praktik-praktik terbaik industri"],
    caption: "— Visi 2030",
    mascot: { show: true, pose: "proud", say: "Ini arah kami. Mau ikut menempuhnya?" },
  },
  misi: {
    titleTop: "{jumlah} misi,",
    titleAccent: "satu arah",
    intro: "Langkah nyata yang kami tempuh setiap semester untuk mewujudkan visi itu.",
    moreLabel: "Selengkapnya",
    sampleNote: "Contoh konten · menunggu data resmi",
    items: [
      {
        key: "Tridarma",
        text: "Menyelenggarakan pengajaran, penelitian dan pengabdian masyarakat di bidang Sistem Informasi yang inovatif, berkualitas tinggi dan berdaya saing internasional.",
        detail: "Pengajaran, penelitian, dan pengabdian dijalankan sebagai satu siklus: hasil riset dosen masuk ke kelas, dan proyek mahasiswa diuji langsung di masyarakat.",
        tags: ["Pengajaran", "Penelitian", "Pengabdian"],
        illustration: "lecturer",
        sample: true,
      },
      {
        key: "Kurikulum",
        text: "Menyusun dan melaksanakan kurikulum yang didasarkan pada kebutuhan masyarakat, bisnis dan industri.",
        detail: "Kurikulum ditinjau berkala bersama mitra industri dan alumni, sehingga mata kuliah selalu mengikuti kebutuhan bisnis dan perkembangan teknologi.",
        tags: ["Mitra industri", "OBE", "Studi kasus nyata"],
        illustration: "industry",
        sample: true,
      },
      {
        key: "Tata kelola",
        text: "Menyelenggarakan tata kelola pendidikan yang profesional, akuntabel dengan dukungan teknologi informasi dan komunikasi.",
        detail: "Layanan akademik dikelola secara profesional dan akuntabel, didukung sistem informasi terintegrasi yang transparan bagi mahasiswa dan dosen.",
        tags: ["Akuntabel", "Layanan digital", "Penjaminan mutu"],
        illustration: "erp",
        sample: true,
      },
      {
        key: "Budaya berbagi",
        text: "Membentuk sivitas akademika yang amanah, beretika dan berorientasi pada kemajuan, serta menjunjung tinggi budaya berbagi pengetahuan.",
        detail: "Komunitas, kelompok riset, dan forum diskusi menjadi tempat dosen dan mahasiswa saling bertukar ilmu.",
        tags: ["Amanah", "Etika", "Komunitas"],
        illustration: "knowledge",
        sample: true,
      },
      {
        key: "Lulusan",
        text: "Menghasilkan lulusan Sistem Informasi yang berbudi luhur, berwawasan internasional, menjunjung kearifan lokal dan profesional.",
        detail: "Bekal sertifikasi, magang, dan pertukaran pelajar menyiapkan lulusan bersaing di perusahaan multinasional.",
        tags: ["Profesional", "Global", "Kearifan lokal"],
        illustration: "career",
        sample: true,
      },
    ],
  },
  roadmap: {
    titleTop: "Perjalanan",
    titleAccent: "menuju 2030",
    body: "Tonggak yang sudah kami lewati dan yang sedang kami kejar.",
    sampleLabel: "Contoh",
    prevLabel: "Sebelumnya",
    nextLabel: "Berikutnya",
    items: [
      { year: "2014", title: "Program studi berdiri", body: "SK Dirjen Dikti No. 502/E/O/2014, 16 Oktober 2014.", sample: false, goal: false },
      { year: "2018", title: "Lulusan pertama", body: "Angkatan pertama Sisforians memasuki dunia industri.", sample: true, goal: false },
      { year: "2022", title: "Kurikulum OBE", body: "Kurikulum berbasis capaian disusun bersama mitra industri.", sample: true, goal: false },
      { year: "2024", title: "Akreditasi Baik Sekali", body: "Diraih dari LAM INFOKOM.", sample: true, goal: false },
      { year: "2027", title: "Rekognisi internasional", body: "Kolaborasi riset dan mobilitas mahasiswa lintas negara.", sample: true, goal: false },
      { year: "2030", title: "Unggul & berdaya saing", body: "Titik akhir rencana strategis program studi.", sample: false, goal: true },
    ],
  },
  closing: {
    titleTop: "Langkah",
    titleAccent: "berikutnya",
    mascot: { show: true, pose: "thumbs-up", say: "Masih penasaran? Jelajahi halaman lainnya." },
    stops: [
      { kicker: "Profil", title: "Sambutan Kaprodi", body: "Cerita di balik visi, langsung dari kaprodi.", href: "/sambutan-kaprodi", final: false },
      { kicker: "Akademik", title: "Kurikulum", body: "Mata kuliah per bidang keahlian.", href: "/curiculum", final: false },
      { kicker: "Profil", title: "Dosen", body: "Pengajar dan bidang risetnya.", href: "/dosen", final: false },
      { kicker: "2030", title: "Daftar PMB 2027", body: "Ikut menempuh perjalanan ini.", href: PMB_URL, final: true },
    ],
  },
  seo: {
    title: "Visi & Misi — Sistem Informasi UISI",
    description: "Visi, misi, dan arah Program Studi Sistem Informasi Universitas Internasional Semen Indonesia menuju 2030.",
  },
};
