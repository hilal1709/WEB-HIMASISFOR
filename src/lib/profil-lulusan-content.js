/**
 * Konten halaman Profil Lulusan.
 * Bisa ditimpa dari CMS (PageContent):
 *   section "profil-alumni"   → title/subtitle/content (intro hero)
 *   section "career"          → data.careers[] {id,title,description} (ringkasan profil, dicocokkan lewat `cmsId`)
 *   section "infinite-alumni" → data.alumni[] {name,img,job} (dinding alumni)
 * Data bertanda `sample` adalah CONTOH → tampil dengan PlaceholderTag.
 */
import { ALUMNI as HOME_ALUMNI } from "@/lib/home-content";

/** Kunci sessionStorage tirai masuk halaman. */
export const CURTAIN_KEY = "sisfor:curtain:profil-lulusan";

export const INTRO = {
  title: "Profil Lulusan",
  body: "Lulusan Sistem Informasi UISI memahami proses bisnis dan teknologi sekaligus, sehingga siap berperan di jantung transformasi digital industri.",
};

/** Jabatan yang berganti di kartu hero. */
export const ROLES = ["ERP Consultant", "IT Auditor", "Data Analyst", "System Analyst", "Technopreneur"];

/** Profil lulusan (PL). Urutan = urutan tab. */
export const PROFILES = [
  {
    key: "erp",
    cmsId: "erp",
    title: "Konsultan Sistem Enterprise",
    short: "ERP Consultant",
    lottie: "/lottie/erp-gears-dark.json",
    summary:
      "Merancang, mengimplementasikan, dan mengoptimalkan sistem ERP agar proses bisnis perusahaan terintegrasi dari hulu ke hilir.",
    competencies: ["Analisis proses bisnis", "Konfigurasi modul ERP", "Integrasi data lintas fungsi", "Manajemen perubahan"],
    roles: ["SAP Functional Consultant", "Business Process Analyst", "ERP Implementation Specialist"],
    courses: ["Sistem Enterprise", "Rekayasa Proses Bisnis", "ERP Lanjut (SAP S/4HANA)"],
  },
  {
    key: "audit",
    cmsId: "auditor",
    title: "Auditor & Tata Kelola TI",
    short: "IT Auditor",
    lottie: "/lottie/shield-audit-dark.json",
    summary:
      "Menilai kendali, risiko, dan kepatuhan sistem informasi menggunakan kerangka kerja tata kelola TI yang diakui internasional.",
    competencies: ["Audit sistem informasi", "Manajemen risiko TI", "COBIT & ITIL", "Keamanan informasi"],
    roles: ["IT Auditor", "IT Governance Officer", "GRC Analyst"],
    courses: ["Tata Kelola TI", "Audit Sistem Informasi", "Manajemen Risiko & Keamanan"],
  },
  {
    key: "data",
    cmsId: "analyst",
    title: "Analis Data & Intelijen Bisnis",
    short: "Data Analyst",
    lottie: "/lottie/data-chart-dark.json",
    summary:
      "Mengolah data menjadi wawasan: membangun dashboard, model analitik, dan rekomendasi yang menopang keputusan manajemen.",
    competencies: ["Pengolahan & visualisasi data", "Business intelligence", "Statistik & machine learning dasar", "Storytelling data"],
    roles: ["Data Analyst", "BI Developer", "Data Engineer"],
    courses: ["Sains Data", "Data Warehouse & BI", "Penambangan Data"],
  },
  {
    key: "strategi",
    cmsId: "consultant",
    title: "Analis & Perencana Sistem",
    short: "System Analyst",
    lottie: "/lottie/strategy-target-dark.json",
    summary:
      "Menjembatani kebutuhan bisnis dan tim teknis: menganalisis kebutuhan, merancang solusi, dan mengawal proyek SI sampai berjalan.",
    competencies: ["Analisis kebutuhan sistem", "Perancangan solusi SI", "Manajemen proyek TI", "Perencanaan strategis SI"],
    roles: ["System Analyst", "IT Project Manager", "Product Owner"],
    courses: ["Analisis & Perancangan SI", "Manajemen Proyek SI", "Perencanaan Strategis SI"],
  },
  {
    key: "technopreneur",
    title: "Technopreneur Digital",
    short: "Technopreneur",
    lottie: "/lottie/rocket-pmb-dark.json",
    summary:
      "Membangun usaha berbasis teknologi: menemukan peluang, memvalidasi model bisnis, dan meluncurkan produk digital.",
    competencies: ["Desain model bisnis", "Pengembangan produk digital", "Validasi pasar", "Kepemimpinan tim"],
    roles: ["Founder Startup", "Digital Business Developer", "Product Manager"],
    courses: ["Technopreneurship", "E-Business", "Pengembangan Aplikasi"],
    sample: true,
  },
];

/** Capaian pembelajaran lulusan (CPL) — contoh, menunggu dokumen kurikulum resmi. */
export const CPL = [
  {
    key: "sikap",
    title: "Sikap",
    illustration: "knowledge",
    items: [
      "Bertakwa, berbudi luhur, dan menjunjung etika profesi.",
      "Bertanggung jawab dan amanah atas pekerjaan di bidang keahliannya.",
      "Menghargai keragaman budaya serta menjunjung kearifan lokal.",
      "Bekerja sama dan peka terhadap persoalan sosial dan lingkungan.",
    ],
  },
  {
    key: "pengetahuan",
    title: "Pengetahuan",
    illustration: "lecturer",
    items: [
      "Menguasai konsep proses bisnis, sistem enterprise, dan arsitektur SI.",
      "Menguasai prinsip tata kelola, audit, dan manajemen risiko TI.",
      "Menguasai teknik pengolahan, analisis, dan visualisasi data.",
    ],
  },
  {
    key: "umum",
    title: "Keterampilan Umum",
    illustration: "career",
    items: [
      "Berpikir logis, kritis, sistematis, dan inovatif.",
      "Mengambil keputusan berdasarkan analisis informasi dan data.",
      "Berkomunikasi efektif, lisan maupun tulisan, dalam konteks global.",
      "Mengelola pembelajaran diri secara mandiri dan berkelanjutan.",
    ],
  },
  {
    key: "khusus",
    title: "Keterampilan Khusus",
    illustration: "erp",
    items: [
      "Menganalisis, merancang, dan mengimplementasikan solusi sistem enterprise.",
      "Melakukan audit dan evaluasi tata kelola TI sesuai kerangka kerja standar.",
      "Membangun solusi analitik data untuk mendukung keputusan bisnis.",
      "Mengelola proyek sistem informasi dari perencanaan hingga evaluasi.",
    ],
  },
];

/** Angka sorotan — contoh, menunggu tracer study resmi. */
export const STATS = [
  { value: 3, suffix: " bln", label: "Rata-rata masa tunggu kerja" },
  { value: 87, suffix: "%", label: "Bekerja ≤ 6 bulan setelah lulus" },
  { value: 600, suffix: "+", label: "Alumni Sisforians" },
  { value: 120, suffix: "+", label: "Perusahaan perekrut" },
];

const FALLBACK_ALUMNI = [
  { name: "Rizqi A. W. Y., S.Kom", img: "/img/alumni/rizqi.png", job: "Surveyor SPBE PT. Tatacipta Teknologi Indonesia" },
  { name: "Edwin R. Putra, S.Kom", img: "/img/alumni/edwin.png", job: "Management Information System PT. Wilmar Nabati Indonesia" },
  { name: "Felix Atmaja, S.Kom", img: "/img/alumni/felix.png", job: "Officer Program Retailership Semen Indonesia Group" },
  { name: "Juliana Kristi, S.Kom", img: "/img/alumni/juliana.png", job: "IT Planning & Control di PT. Petrokimia Gresik" },
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

const normImg = (src) => (!src ? null : /^(https?:)?\//.test(src) ? src : `/${src}`);

/** Gabungkan baris CMS ke fallback. `rows` = PageContent[] (boleh kosong). */
export function mergeProfilLulusan(rows = []) {
  const by = (s) => rows.find((r) => r.section === s);
  const intro = by("profil-alumni");
  const careers = parse(by("career")?.data)?.careers;
  const cmsAlumni = parse(by("infinite-alumni")?.data)?.alumni;

  const profiles = PROFILES.map((p, i) => {
    const c = Array.isArray(careers) ? careers.find((x) => x?.id === p.cmsId) : null;
    // sebagian deskripsi CMS diawali judulnya sendiri ("IT Consultant Berperan …") → buang awalan itu
    let desc = c?.description?.trim() || "";
    if (c?.title && desc.toLowerCase().startsWith(c.title.toLowerCase() + " ")) desc = desc.slice(c.title.length).trim();
    const summary = desc ? desc[0].toUpperCase() + desc.slice(1) : p.summary;
    return { ...p, n: i + 1, summary };
  });

  const alumniList = (Array.isArray(cmsAlumni) && cmsAlumni.length ? cmsAlumni : FALLBACK_ALUMNI)
    .filter((a) => a?.name)
    .map((a) => ({ name: a.name, photo: normImg(a.img), role: a.job || "" }));
  // testimoni beranda (punya kutipan) digabung; nama yang sama tidak diulang
  const quotes = HOME_ALUMNI.items.map((a) => ({ name: a.name, photo: a.photo, role: a.role, quote: a.quote, sample: true }));
  const firstWord = (s) => s.toLowerCase().split(/[ .,]+/)[0];
  const alumni = [...quotes, ...alumniList.filter((a) => !quotes.some((q) => firstWord(q.name) === firstWord(a.name)))];

  return {
    intro: {
      title: INTRO.title,
      body: intro?.content?.trim() && intro.content.trim().length > 40 ? intro.content.trim() : INTRO.body,
    },
    roles: ROLES,
    profiles,
    cpl: CPL,
    stats: STATS,
    alumni,
  };
}
