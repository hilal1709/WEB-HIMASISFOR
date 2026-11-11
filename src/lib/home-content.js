/**
 * Konten default beranda (redesign profesional 2026).
 * Struktur informasi mengikuti situs prodi SI pada umumnya (rujukan: si.amikom.ac.id).
 * Data CMS menimpa bagian terkait bila tersedia (mis. prestasi dari /api/achievements).
 * Konten yang belum resmi ditandai <PlaceholderTag/> di UI — jangan mengarang angka.
 */

export const PMB_URL = "https://s.id/DaftarSisforUISI";
export const CONTACT_URL = "https://s.id/DaftarSisforUISI";
export const VIDEO_URL = "https://www.youtube.com/@sisforuisi";

/** Menu utama. Item dengan `items` menjadi dropdown. */
export const NAV = [
  { label: "Beranda", href: "/" },
  {
    label: "Profil",
    href: "/profile",
    items: [
      { label: "Sambutan Kaprodi", href: "/sambutan-kaprodi", desc: "Pesan dari ketua program studi" },
      { label: "Visi & Misi", href: "/visi-misi", desc: "Arah dan tujuan pendidikan" },
      { label: "Struktur Organisasi", href: "/struktur-organisasi", desc: "Pimpinan dan dosen program studi" },
      { label: "Profil Lulusan", href: "/profil-lulusan", desc: "Kompetensi dan peran lulusan" },
      { label: "Dosen", href: "/profile#dosen", desc: "Pengajar dan bidang risetnya" },
      { label: "Prestasi", href: "/achievement", desc: "Capaian dosen dan mahasiswa" },
    ],
  },
  {
    label: "Akademik",
    href: "/curiculum",
    items: [
      { label: "Kurikulum & RPS", href: "/curiculum", desc: "Struktur mata kuliah per semester" },
      { label: "Bidang Keahlian", href: "/#bidang", desc: "Empat peminatan unggulan" },
      { label: "Jalur Kelulusan", href: "/curiculum#kelulusan", desc: "Skripsi dan jalur non-reguler" },
      { label: "Regulasi Akademik", href: "/curiculum#regulasi", desc: "Pedoman dan peraturan studi" },
    ],
  },
  {
    label: "Belajar Luar Prodi",
    href: "/profile#mbkm",
    items: [
      { label: "Magang", href: "/profile#magang", desc: "Magang mandiri dan program Dikti" },
      { label: "Konversi SKS", href: "/profile#konversi", desc: "Panduan dan klaim konversi" },
      { label: "Bootcamp & Course", href: "/profile#bootcamp", desc: "Belajar independen bersertifikat" },
    ],
  },
  {
    label: "Layanan",
    href: "/profile#layanan",
    items: [
      { label: "Layanan Akademik", href: "/profile#layanan", desc: "Persuratan dan approval kaprodi" },
      { label: "Kontak", href: "#kontak", desc: "Hubungi sekretariat prodi" },
    ],
  },
];

export const TOPBAR = [
  { label: "UISI", href: "https://uisi.ac.id" },
  { label: "PMB", href: PMB_URL },
  { label: "Kontak", href: "#kontak" },
];

export const HERO = {
  eyebrow: "Program Studi S1 Sistem Informasi",
  title: ["Menghubungkan Bisnis &", "Sistem Informasi", "untuk Masa Depan"],
  body: "Belajar ERP, tata kelola TI, dan data science langsung di kawasan industri Semen Indonesia Group, bersama dosen praktisi dan mitra industri.",
  slides: [
    { image: "/img/heroprofile.png", label: "Komunitas", caption: "Sisforians, mahasiswa aktif lintas angkatan", position: "50% 40%", tone: "lift" },
    { image: "/img/award/image-1.png", label: "Kolaborasi", caption: "Diskusi proyek bersama praktisi industri", position: "50% 50%", crop: true },
    { image: "/img/award/image-3.png", label: "Prestasi", caption: "Tim mahasiswa di kompetisi nasional", position: "50% 40%", crop: true },
  ],
  facts: [
    { label: "Gelar", value: "S.Kom." },
    { label: "Masa studi", value: "8 semester" },
    { label: "Kampus", value: "Gresik" },
  ],
  chips: [
    { label: "Mitra utama", value: "Semen Indonesia Group" },
    { label: "Kurikulum", value: "Berbasis ERP" },
  ],
  partners: [
    { name: "Semen Indonesia" },
    { name: "SAP" },
    { name: "Oracle", logo: "/img/logo/oracle.svg" },
    { name: "Microsoft", logo: "/img/logo/microsoft.svg" },
    { name: "Google", logo: "/img/logo/google.svg" },
    { name: "Intel", logo: "/img/logo/intel.svg" },
    { name: "NVIDIA", logo: "/img/logo/nvidia.svg" },
    { name: "Samsung", logo: "/img/logo/samsung.svg" },
  ],
};

export const WHY = {
  eyebrow: "Keunggulan",
  title: ["Mengapa Memilih", "Sistem Informasi UISI?"],
  body: "Empat alasan utama mahasiswa tumbuh bersama kami.",
  items: [
    { illustration: "erp", lottie: "/lottie/erp-nodes.json", title: "Kurikulum Berbasis ERP", body: "Praktik langsung ERP dari proses bisnis Semen Indonesia Group hingga ruang kelas." },
    { illustration: "lecturer", lottie: "/lottie/lecturer.json", title: "Dosen Praktisi & Peneliti", body: "Dosen bersertifikat dan aktif meneliti di tingkat nasional hingga internasional." },
    { illustration: "industry", lottie: "/lottie/industry.json", title: "Kolaborasi Industri", body: "Jejaring mitra industri untuk magang, proyek nyata, dan penempatan kerja." },
    { illustration: "career", lottie: "/lottie/grad-path.json", title: "Lulusan Siap Kerja", body: "Berkarier sebagai konsultan, system analyst, IT auditor, hingga data analyst." },
  ],
};

export const ACCREDITATION = {
  eyebrow: "Akreditasi",
  title: ["Terakreditasi", "“Baik Sekali”"],
  body: "Diakui LAM INFOKOM melalui SK No.026/SK/LAM-INFOKOM/Ak/S/IV/2023, berlaku sejak 3 April 2023.",
  grade: "Baik Sekali",
  issuer: "LAM INFOKOM",
  certificate: "/img/sertif_akreditasi.png",
  rows: [
    ["No. SK", "026/SK/LAM-INFOKOM/Ak/S/IV/2023"],
    ["Berlaku sejak", "3 April 2023"],
    ["SK Pendirian", "502/E/O/2014"],
  ],
  stats: [
    { value: 2014, label: "Tahun berdiri", plain: true },
    { value: 11, label: "Prestasi 2026", placeholder: true },
    { value: 4, label: "Bidang keahlian" },
  ],
};

export const EXPERTISE = {
  eyebrow: "Bidang Keahlian",
  title: ["Empat Bidang", "Keahlian Unggulan"],
  body: "Pilih fokus yang sesuai minat dan arah kariermu.",
  items: [
    {
      slug: "audit",
      lottie: "/lottie/shield-audit-dark.json",
      title: "IT Audit & Governance",
      body: "Audit sistem informasi dan tata kelola TI berbasis COBIT & ISO 27001: memastikan teknologi aman, patuh, dan bernilai bagi organisasi.",
      careers: ["IT Auditor", "GRC Analyst", "IT Risk Consultant"],
      image: "/img/governance.jpeg",
    },
    {
      slug: "enterprise",
      lottie: "/lottie/erp-gears-dark.json",
      title: "Enterprise Systems",
      body: "Merancang dan mengimplementasikan ERP (SAP) untuk mengintegrasikan proses bisnis. Inilah keunggulan khas SISFOR UISI.",
      careers: ["ERP Consultant", "Business Process Analyst", "SAP Functional"],
      image: "/img/erp.jpeg",
    },
    {
      slug: "data",
      lottie: "/lottie/data-chart-dark.json",
      title: "Data Science",
      body: "Mengolah data menjadi insight: analitik bisnis, machine learning, dan visualisasi untuk pengambilan keputusan.",
      careers: ["Data Analyst", "BI Developer", "Data Scientist"],
      image: "/img/data.jpeg",
    },
    {
      slug: "msi",
      lottie: "/lottie/strategy-target-dark.json",
      title: "Manajemen SI",
      body: "Menyelaraskan strategi bisnis dan teknologi: perencanaan SI/TI, manajemen proyek, dan transformasi digital.",
      careers: ["System Analyst", "IT Project Manager", "Product Manager"],
      image: "/img/award/image-1.png",
      crop: true,
    },
  ],
};

export const ALUMNI = {
  eyebrow: "Testimoni Alumni",
  title: ["Apa Kata", "Alumni"],
  body: "Cerita lulusan yang kini berkarier di berbagai industri.",
  items: [
    { quote: "Kurikulum ERP membuat saya percaya diri saat masuk dunia kerja.", name: "Melania F., S.Kom.", role: "Business Analyst · Kalbe Farma", photo: "/img/melenia.png" },
    { quote: "Dosen SISFOR sangat suportif dan materi kuliahnya relevan dengan kebutuhan industri.", name: "M. Rusydani S., S.Kom.", role: "PMO Solution Analyst", photo: "/img/rusydani.png" },
    { quote: "Lingkungan belajar kolaboratif dan penuh tantangan yang membentuk karakter.", name: "Rizqi A. Y., S.Kom.", role: "Associate SAP Consultant", photo: "/img/rizqi.png" },
    { quote: "Proyek nyata bersama industri membuka jalan karier saya sebagai IT auditor.", name: "Tati, S.Kom.", role: "IT Auditor", photo: null },
  ],
};

export const ACHIEVEMENTS = {
  eyebrow: "Prestasi & Rekognisi",
  title: ["Prestasi", "Dosen dan Mahasiswa"],
  body: "Capaian di tingkat nasional dan internasional.",
  tabs: {
    dosen: [
      { level: "Internasional", title: "Awardee TWAS-UNESCO 2021–2023", body: "Penerima Associate The World Academy of Sciences (TWAS).", image: "/img/award/image-4.png" },
      { level: "Nasional", title: "Hibah Riset Nasional", body: "Pendanaan riset tata kelola TI untuk industri publik.", image: "/img/award/image-1.png" },
      { level: "Nasional", title: "Reviewer Jurnal Sinta 2", body: "Dosen dipercaya menjadi reviewer jurnal nasional terakreditasi.", image: "/img/award/image.png" },
    ],
    mahasiswa: [
      { level: "Nasional", title: "Juara Kompetisi Data Science", body: "Tim mahasiswa meraih juara di kompetisi analitik data nasional.", image: "/img/award/image-2.png" },
      { level: "Nasional", title: "Finalis Gemastik", body: "Melaju ke final divisi Pengembangan Bisnis TIK.", image: "/img/award/image-3.png" },
      { level: "Regional", title: "Juara UI/UX Competition", body: "Desain aplikasi layanan publik terbaik se-Jawa Timur.", image: "/img/award/image-5.jpg" },
    ],
  },
};

export const NEWS = {
  eyebrow: "Berita & Kegiatan",
  title: ["Berita", "Terbaru"],
  body: "Kabar terkini dari lingkungan Sistem Informasi UISI.",
  items: [
    { date: "12 Okt 2026", tag: "Prestasi", title: "Mahasiswa SISFOR Raih Juara Nasional", body: "Tim mahasiswa SI UISI meraih juara pada kompetisi tingkat nasional bidang analitik bisnis.", image: "/img/award/image-2.png" },
    { date: "03 Okt 2026", tag: "Workshop", title: "Workshop ERP bersama Praktisi Industri", body: "Sesi hands-on SAP S/4HANA bersama praktisi Semen Indonesia Group.", image: "/img/erp.jpeg" },
    { date: "21 Sep 2026", tag: "Kuliah Tamu", title: "Kuliah Tamu: Tren Data & AI di Bisnis", body: "Membedah penerapan AI generatif pada pengambilan keputusan bisnis.", image: "/img/data.jpeg" },
    { date: "08 Sep 2026", tag: "Akademik", title: "Informasi Magang dan MBKM Semester Genap", body: "Jadwal, syarat, dan mitra program magang serta MBKM semester genap.", image: "/img/governance.jpeg" },
  ],
};

export const JOIN = {
  eyebrow: "PMB 2027",
  title: ["Mari Bergabung", "Bersama Kami"],
  body: "Wujudkan kariermu di bidang sistem informasi bersama Universitas Internasional Semen Indonesia.",
};

export const FOOTER = {
  address: "Kompleks PT. Semen Indonesia (Persero) Tbk., Jl. Veteran, Sidokumpul, Kec. Gresik, Kabupaten Gresik, Jawa Timur 61122",
  socials: [
    { name: "Instagram", href: "https://www.instagram.com/sisforuisi" },
    { name: "TikTok", href: "https://www.tiktok.com/@sisfor_uisi" },
    { name: "YouTube", href: "https://www.youtube.com/@sisforuisi" },
  ],
  instagram: "https://www.instagram.com/sisforuisi/",
  columns: [
    { title: "Profil", links: [["Sambutan Kaprodi", "/sambutan-kaprodi"], ["Visi & Misi", "/visi-misi"], ["Struktur Organisasi", "/struktur-organisasi"], ["Profil Lulusan", "/profil-lulusan"], ["Dosen", "/profile#dosen"]] },
    { title: "Akademik", links: [["Kurikulum & RPS", "/curiculum"], ["Jalur Kelulusan", "/curiculum#kelulusan"], ["Prestasi", "/achievement"]] },
    { title: "Tautan Penting", links: [["Universitas (UISI)", "https://uisi.ac.id"], ["PMB UISI", PMB_URL], ["Instagram Prodi", "https://www.instagram.com/sisforuisi/"]] },
  ],
};

export const ABOUT = {
  title: "Sistem Informasi, di jantung kawasan industri",
  body: [
    "Program studi S1 Sistem Informasi UISI berdiri sejak 16 Oktober 2014 (SK DIRJEN DIKTI No. 502/E/O/2014), satu dari 10 program studi di Universitas Internasional Semen Indonesia.",
    "Kampusnya berada di kompleks PT Semen Indonesia, Gresik, sehingga proses bisnis industri yang dipelajari di kelas bisa dilihat langsung di sekitar kampus.",
  ],
};

/* ---- Warisan beranda "cinematic" (komponen lama, tidak lagi dirender di beranda) ---- */
export const CHAPTERS = [
  { id: "beranda", label: "Beranda", guide: false, pose: "wave", say: "Hai, aku Elvo! Yuk kenalan sama Sistem Informasi UISI." },
  { id: "keunggulan", label: "Keunggulan", pose: "thumbs-up", say: "Empat alasan kenapa banyak yang betah di SISFOR." },
  { id: "akreditasi", label: "Akreditasi", pose: "confident", say: "Terakreditasi “Baik Sekali” dari LAM INFOKOM, lho." },
  { id: "bidang", label: "Bidang Keahlian", pose: "run", say: "Terus scroll, kartunya geser ke samping →" },
  { id: "alumni", label: "Alumni", pose: "laugh", say: "Ini cerita kakak tingkat yang sudah berkarier." },
  { id: "prestasi", label: "Prestasi", pose: "proud", say: "Bangga! Dosen dan mahasiswa kita juara." },
  { id: "berita", label: "Berita", pose: "think", say: "Kabar terbaru dari kampus, jangan sampai ketinggalan." },
  { id: "gabung", label: "Bergabung", guide: false, pose: "wave", say: "Siap jadi Sisforians? Aku tunggu di kelas!" },
];

export const ELVO_LINES = {
  kampus: { pose: "confident", say: "Prodi kita terakreditasi “Baik Sekali”, lho!" },
  bidang: { pose: "run", say: "Ada empat jalur. Kamu mau lewat yang mana?" },
  keunggulan: { pose: "thumbs-up", say: "Ini alasan kakak tingkatmu betah di sini." },
  alumni: { pose: "laugh", say: "Dengar cerita kakak-kakak yang sudah berlayar ke industri." },
  prestasi: { pose: "proud", say: "Dosen dan mahasiswa kita juara!" },
  berita: { pose: "think", say: "Cek papan pengumuman dulu, siapa tahu ada info magang." },
  gabung: { pose: "wave", say: "Sampai ketemu di kampus, Sisforians!" },
};

/** Konten yang belum dari sumber resmi ditandai di UI. */
export const PLACEHOLDER_NOTE = "Contoh konten, akan diganti data resmi dari CMS prodi.";

/* ---- Premium v2 ---- */
export const HERO_V2 = {
  label: "Program Studi S1 · Terakreditasi Baik Sekali",
  lead: "Menghubungkan Bisnis &",
  words: ["Sistem Informasi", "Enterprise ERP", "Data Science", "Tata Kelola TI"],
  srTail: "Sistem Informasi untuk masa depan",
  body: "Belajar langsung di kawasan industri Semen Indonesia Group dengan kurikulum berbasis ERP, dosen praktisi, dan jejaring mitra industri.",
};

/** Kartu carousel silinder hero (foto nyata + kartu fakta). */
export const HERO_CARDS = [
  { image: "/img/heroprofile.png", caption: "Sisforians", position: "45% 40%", lift: true },
  { type: "stat", label: "Akreditasi", value: "Baik Sekali", caption: "LAM INFOKOM · 2023", tone: "red" },
  { image: "/img/erp.jpeg", caption: "Praktik ERP" },
  { image: "/img/award/image-2.png", caption: "Juara nasional", crop: true },
  { type: "lottie", label: "Data Science", src: "/lottie/data-chart.json", caption: "Analitik untuk keputusan bisnis" },
  { image: "/img/profil/grandys.jpg", caption: "Dosen praktisi", position: "50% 25%" },
  { image: "/img/governance.jpeg", caption: "IT Governance" },
  { type: "stat", label: "Berdiri", value: "2014", caption: "SK 502/E/O/2014" },
  { image: "/img/award/image-3.png", caption: "Kompetisi", crop: true },
  { image: "/img/data.jpeg", caption: "Riset data" },
  { image: "/img/award/image-4.png", caption: "Konferensi", crop: true },
  { type: "lottie", label: "Enterprise Systems", src: "/lottie/erp-nodes.json", caption: "Proses bisnis terintegrasi" },
  { image: "/img/profil/putri.jpg", caption: "Pengajar", position: "50% 25%" },
  { image: "/img/award/image-1.png", caption: "Kolaborasi industri", crop: true },
];

/* ---- Kampus v3 ---- */
export const VIDEOS = {
  heroLoop: { src: "/video/hero-loop.mp4", poster: "/video/hero-loop.jpg" },
  mawapres: { src: "/video/mawapres.mp4", poster: "/video/mawapres.jpg", title: "Kisah Sukses Mawapres Sistem Informasi UISI", duration: "2:31" },
  dosen: { src: "/video/dosen.mp4", poster: "/video/dosen.jpg", title: "Video Profil Dosen Sistem Informasi UISI", duration: "6:43" },
  alumni: { src: "/video/alumni.mp4", poster: "/video/alumni.jpg", title: "Video Profil Alumni Sistem Informasi UISI", duration: "5:04" },
};

export const AUDIENCE = [
  { label: "Calon Mahasiswa", href: PMB_URL },
  { label: "Mahasiswa", href: "/curiculum" },
  { label: "Alumni", href: "/profil-lulusan" },
  { label: "Dosen & Tendik", href: "/profile#dosen" },
];

export const HERO_V3 = {
  title: ["Menghubungkan Bisnis &", "Sistem Informasi", "untuk Masa Depan"],
  body: "Program studi S1 di kawasan industri Semen Indonesia Group dengan kurikulum berbasis ERP, dosen praktisi, dan mitra industri.",
};

/** Kartu fitur di tiap panel mega menu. */
export const MEGA_FEATURE = {
  Profil: { image: "/img/heroprofile.png", title: "Mengenal SISFOR", body: "Sejarah, visi misi, dan dosen program studi.", href: "/profile" },
  Akademik: { image: "/img/erp.jpeg", title: "Kurikulum berbasis ERP", body: "Struktur mata kuliah dan empat bidang keahlian.", href: "/curiculum" },
  "Belajar Luar Prodi": { image: "/img/award/image-1.png", title: "Magang & MBKM", body: "Belajar langsung di industri, dikonversi ke SKS.", href: "/profile#mbkm" },
  Layanan: { image: "/img/governance.jpeg", title: "Layanan akademik", body: "Persuratan, approval kaprodi, dan kontak.", href: "/profile#layanan" },
};

export const QUICK_LINKS = [
  { title: "Calon Mahasiswa", body: "Jalur masuk, biaya, dan pendaftaran PMB.", href: PMB_URL, icon: "target", lottie: "/lottie/qa-campus.json", external: true },
  { title: "Mahasiswa Aktif", body: "Kurikulum, RPS, magang, dan layanan prodi.", href: "/curiculum", icon: "book", lottie: "/lottie/qa-student.json" },
  { title: "Alumni", body: "Jejaring alumni dan profil lulusan.", href: "/profil-lulusan", icon: "account", lottie: "/lottie/qa-alumni.json" },
  { title: "Mitra Industri", body: "Kerja sama riset, magang, dan rekrutmen.", href: "#kontak", icon: "suitcase", lottie: "/lottie/qa-industry.json" },
];

export const ABOUT_V3 = {
  title: ["Sistem informasi,", "di jantung", "kawasan industri"],
  quote: "Kami menyiapkan lulusan yang memahami proses bisnis dan teknologi sekaligus, karena di Gresik keduanya bertemu setiap hari.",
  quoteBy: "Grandys Frieska Prassida, Ketua Program Studi Sistem Informasi",
  photo: "/img/profil/grandys.jpg",
};

/** Agenda — contoh, menunggu modul agenda di CMS. */
export const AGENDA = [
  { day: "18", month: "Nov", title: "Kuliah Tamu: Arsitektur Data di Industri Manufaktur", place: "Auditorium UISI", time: "09.00 WIB" },
  { day: "25", month: "Nov", title: "Workshop SAP S/4HANA untuk Mahasiswa Semester 5", place: "Lab ERP", time: "13.00 WIB" },
  { day: "02", month: "Des", title: "Info Session Magang Mandiri & Program Dikti", place: "Daring (Zoom)", time: "15.30 WIB" },
  { day: "10", month: "Des", title: "Sidang Tugas Akhir Periode Desember", place: "Gedung B", time: "08.00 WIB" },
];
