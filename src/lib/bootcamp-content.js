/**
 * Konten halaman Bootcamp & Course (`/bootcamp`).
 * Dua mode dalam satu halaman:
 *   - Bootcamp : kohort intensif berjadwal (mulai bersama, ada mentor, proyek akhir)
 *   - Course   : kursus mandiri, mulai kapan saja, ritme sendiri
 * Mentor dosen diturunkan dari `mergeDosen` (per rumpun) — tidak ditulis ulang. Perkiraan SKS kohort dihitung dengan
 * `creditsFor` dari konversi SKS; aturan konversinya tidak dijelaskan ulang, hanya ditautkan ke `/konversi-sks`.
 *
 * CMS `PageContent` section `bootcamp` (Admin › Konten › Bootcamp & Course, `BootcampEditor`):
 *   data.intro          → paragraf hero
 *   data.notice         → { title, body } banner pendaftaran
 *   data.bootcamps[]    → ditimpa per `slug` { title, lead, start YYYY-MM-DD, weeks, hours, seats, seatsLeft, href }
 *   data.courses[]      → mengganti SEMUA kursus contoh { title, topic, level, hours, perWeek, lessons[{t, min}], href }
 *   data.tiers[]        → ditimpa per `key` { prices { mahasiswa, alumni, umum } }
 * Semua kohort, kursus, harga, dan mentor praktisi adalah CONTOH (`sample`) → tampil dengan PlaceholderTag.
 */
import { RATE, creditsFor } from "@/lib/konversi-content";

export const CURTAIN_KEY = "sisfor:curtain:bootcamp";
export const BANNER_KEY = "sisfor:banner:bootcamp";
export const PLAN_KEY = "sisfor:bootcamp:rencana";
/** Batas wajar beban belajar mandiri per minggu di luar kuliah (contoh). */
export const WEEKLY_LIMIT = 20;

export const INTRO = {
  bootcamp: "Delapan sampai dua belas minggu bersama satu kohort, satu mentor, dan satu proyek nyata yang kamu presentasikan di akhir.",
  course: "Kursus pendek yang bisa dimulai malam ini dan dijeda kapan saja. Ambil satu, atau susun beberapa jadi rencana belajarmu sendiri.",
};

export const TRACKS = {
  enterprise: { label: "ERP & proses bisnis", short: "ERP", lottie: "/lottie/erp-gears-dark.json" },
  data: { label: "Data & analitik", short: "Data", lottie: "/lottie/data-chart-dark.json" },
  "tata-kelola": { label: "Audit & tata kelola", short: "Audit", lottie: "/lottie/shield-audit-dark.json" },
  dev: { label: "Pengembangan aplikasi", short: "Dev", lottie: "/lottie/laptop-code-dark.json" },
};

export const LEVELS = [
  { key: "pemula", label: "pemula" },
  { key: "menengah", label: "menengah" },
  { key: "mahir", label: "mahir" },
];

/** Isian filter kalimat di mode Course. `all` = tidak dibatasi. */
export const FILTERS = {
  topic: [{ key: "all", label: "apa saja" }, ...Object.entries(TRACKS).map(([key, t]) => ({ key, label: t.label }))],
  pace: [
    { key: "all", label: "berapa pun jam", test: () => true },
    { key: "light", label: "≤ 3 jam", test: (c) => c.perWeek <= 3 },
    { key: "mid", label: "3–6 jam", test: (c) => c.perWeek > 3 && c.perWeek <= 6 },
    { key: "deep", label: "lebih dari 6 jam", test: (c) => c.perWeek > 6 },
  ],
  level: [{ key: "all", label: "level mana pun" }, ...LEVELS],
};

/**
 * Kohort bootcamp. `plan` = minggu → yang dipelajari + yang sudah bisa kamu lakukan.
 * `build` = bagian artefak proyek yang muncul mulai minggu `w` (dirender oleh ProjectArtifact).
 */
export const BOOTCAMPS = [
  {
    slug: "erp-sap",
    title: "ERP Functional Consultant",
    track: "enterprise",
    lead: "Konfigurasi modul pengadaan sampai penjualan di sistem ERP latihan, lalu memimpin simulasi go-live.",
    start: "2027-01-11",
    weeks: 10,
    hours: 12,
    seats: 30,
    seatsLeft: 9,
    format: "Hybrid · Sabtu di kampus",
    project: "Rancangan go-live modul pengadaan",
    needs: ["Sudah lulus Manajemen Proses Bisnis atau setara", "Laptop dengan RAM 8 GB", "Bisa hadir 4 Sabtu tatap muka"],
    plan: [
      { t: "Peta proses order-to-cash", can: "menggambar alur bisnis perusahaan dari pesanan sampai kas masuk" },
      { t: "Master data material & vendor", can: "menyiapkan data induk yang bersih sebelum sistem dipakai" },
      { t: "Siklus pengadaan", can: "membuat permintaan pembelian sampai PO di sistem latihan" },
      { t: "Persediaan & gudang", can: "mencatat penerimaan barang dan membaca stok real-time" },
      { t: "Penjualan & penagihan", can: "menjalankan pesanan jual sampai faktur terbit" },
      { t: "Integrasi keuangan", can: "menelusuri jurnal otomatis dari setiap transaksi" },
      { t: "Laporan & dasbor", can: "menyusun laporan operasional untuk manajer" },
      { t: "Uji terima pengguna", can: "menulis skenario uji dan mencatat temuan" },
      { t: "Rencana cut-over", can: "menyusun langkah peralihan dari sistem lama" },
      { t: "Simulasi go-live", can: "mempresentasikan kesiapan go-live di depan panel praktisi" },
    ],
    build: [
      { w: 1, part: "flow", label: "Alur O2C" },
      { w: 2, part: "nav", label: "Master data" },
      { w: 3, part: "table", label: "Daftar PO" },
      { w: 7, part: "kpi", label: "Stok & tagihan" },
      { w: 10, part: "stamp", label: "Siap go-live" },
    ],
    href: "",
  },
  {
    slug: "data-analyst",
    title: "Data Analyst for Business",
    track: "data",
    lead: "Dari spreadsheet berantakan ke dasbor yang dipakai rapat manajemen — dengan SQL, Python, dan cerita data.",
    start: "2027-02-08",
    weeks: 8,
    hours: 14,
    seats: 35,
    seatsLeft: 14,
    format: "Daring · dua malam per minggu",
    project: "Dasbor penjualan untuk UMKM mitra",
    needs: ["Sudah lulus Statistika atau setara", "Terbiasa dengan spreadsheet", "Akun GitHub"],
    plan: [
      { t: "Bertanya yang benar", can: "mengubah keluhan bisnis jadi pertanyaan data yang bisa dijawab" },
      { t: "SQL untuk analis", can: "menarik dan menggabungkan tabel tanpa menunggu tim IT" },
      { t: "Membersihkan data", can: "menemukan duplikat, nilai hilang, dan format yang kacau" },
      { t: "Analisis eksploratif", can: "menemukan pola dan anomali dengan Python" },
      { t: "Visualisasi", can: "memilih grafik yang jujur untuk setiap pertanyaan" },
      { t: "Dasbor", can: "merakit dasbor interaktif yang bisa difilter pengguna" },
      { t: "Bercerita dengan data", can: "menyusun alur presentasi dari temuan ke rekomendasi" },
      { t: "Demo day", can: "mempertahankan rekomendasi di depan pemilik usaha" },
    ],
    build: [
      { w: 2, part: "table", label: "Tabel transaksi" },
      { w: 4, part: "chart", label: "Tren penjualan" },
      { w: 6, part: "kpi", label: "KPI utama" },
      { w: 6, part: "nav", label: "Filter dasbor" },
      { w: 8, part: "stamp", label: "Dipresentasikan" },
    ],
    href: "",
  },
  {
    slug: "it-audit",
    title: "IT Audit & GRC Practitioner",
    track: "tata-kelola",
    lead: "Merencanakan audit TI berbasis risiko, menguji kontrol, dan menulis laporan temuan yang bisa ditindaklanjuti.",
    start: "2027-03-01",
    weeks: 8,
    hours: 10,
    seats: 25,
    seatsLeft: 18,
    format: "Hybrid · studi kasus industri",
    project: "Laporan audit akses sistem keuangan",
    needs: ["Sudah lulus Tata Kelola TI atau setara", "Membaca dokumen berbahasa Inggris"],
    plan: [
      { t: "Kerangka tata kelola", can: "memetakan COBIT dan ISO 27001 ke kebutuhan organisasi" },
      { t: "Penilaian risiko", can: "menyusun daftar risiko TI beserta peringkatnya" },
      { t: "Rencana audit", can: "menentukan ruang lingkup dan program kerja audit" },
      { t: "Pengujian kontrol akses", can: "menguji hak akses pengguna dengan sampel" },
      { t: "Kontrol perubahan", can: "menelusuri jejak perubahan sistem dan bukti persetujuan" },
      { t: "Kertas kerja", can: "mendokumentasikan bukti audit yang bisa diperiksa ulang" },
      { t: "Laporan temuan", can: "menulis temuan dengan kondisi, kriteria, sebab, dan akibat" },
      { t: "Exit meeting", can: "menyampaikan temuan dan menyepakati rencana perbaikan" },
    ],
    build: [
      { w: 2, part: "kpi", label: "Peta risiko" },
      { w: 3, part: "nav", label: "Program audit" },
      { w: 5, part: "table", label: "Uji kontrol" },
      { w: 6, part: "flow", label: "Jejak perubahan" },
      { w: 8, part: "stamp", label: "Laporan final" },
    ],
    href: "",
  },
];

const lessons = (...pairs) => pairs.map(([t, min]) => ({ t, min }));

/** Kursus mandiri. `perWeek` = saran jam per minggu; `hours` = total jam. */
export const COURSES = [
  { slug: "dasar-sap", title: "Navigasi ERP untuk pemula", topic: "enterprise", level: "pemula", hours: 6, perWeek: 2, lessons: lessons(["Kenapa perusahaan memakai ERP", 12], ["Berkeliling layar utama", 18], ["Membaca dokumen transaksi", 22], ["Kuis akhir", 10]) },
  { slug: "bpmn", title: "Memodelkan proses dengan BPMN", topic: "enterprise", level: "pemula", hours: 8, perWeek: 3, lessons: lessons(["Simbol yang benar-benar dipakai", 15], ["Swimlane dan serah terima", 20], ["Menemukan pemborosan", 25], ["Latihan studi kasus", 40]) },
  { slug: "supply-chain", title: "Rantai pasok di sistem ERP", topic: "enterprise", level: "menengah", hours: 14, perWeek: 5, lessons: lessons(["Dari perencanaan ke pengadaan", 25], ["MRP sederhana", 30], ["Mengukur kinerja pemasok", 20], ["Proyek mini", 60]) },
  { slug: "excel-analis", title: "Spreadsheet untuk analis", topic: "data", level: "pemula", hours: 5, perWeek: 2, lessons: lessons(["Tabel yang rapi sejak awal", 15], ["Pivot dan ringkasan", 20], ["Rumus pencarian", 18], ["Grafik yang jujur", 15]) },
  { slug: "sql-dasar", title: "SQL dari nol", topic: "data", level: "pemula", hours: 10, perWeek: 4, lessons: lessons(["SELECT pertamamu", 12], ["Filter dan urutkan", 18], ["JOIN tanpa takut", 28], ["Agregasi", 22], ["Tantangan akhir", 30]) },
  { slug: "python-data", title: "Python untuk analisis data", topic: "data", level: "menengah", hours: 18, perWeek: 6, lessons: lessons(["Notebook dan pandas", 25], ["Membersihkan data", 35], ["Visualisasi", 30], ["Studi kasus penjualan", 60]) },
  { slug: "ml-bisnis", title: "Machine learning untuk keputusan bisnis", topic: "data", level: "mahir", hours: 24, perWeek: 8, lessons: lessons(["Kapan ML tidak perlu", 15], ["Regresi dan klasifikasi", 45], ["Mengevaluasi model", 35], ["Menjelaskan ke manajer", 25]) },
  { slug: "cobit", title: "Pengantar COBIT 2019", topic: "tata-kelola", level: "menengah", hours: 9, perWeek: 3, lessons: lessons(["Tujuan tata kelola", 18], ["Faktor desain", 22], ["Tingkat kapabilitas", 25], ["Latihan penilaian", 35]) },
  { slug: "iso-27001", title: "Dasar keamanan informasi ISO 27001", topic: "tata-kelola", level: "pemula", hours: 7, perWeek: 3, lessons: lessons(["Aset, ancaman, kerentanan", 15], ["Kontrol Annex A", 25], ["Menyusun kebijakan", 20], ["Simulasi audit internal", 30]) },
  { slug: "web-dasar", title: "Membangun aplikasi web pertama", topic: "dev", level: "pemula", hours: 12, perWeek: 4, lessons: lessons(["HTML dan CSS seperlunya", 25], ["Formulir dan data", 30], ["Menyimpan ke basis data", 35], ["Unggah ke internet", 20]) },
  { slug: "api-integrasi", title: "Integrasi sistem lewat API", topic: "dev", level: "mahir", hours: 16, perWeek: 7, lessons: lessons(["REST dan JSON", 20], ["Autentikasi", 30], ["Menghubungkan ERP ke aplikasi", 45], ["Menangani kegagalan", 25]) },
];

/** Paket biaya. Harga per audiens dalam Rupiah; `null` = hubungi kami. */
export const AUDIENCES = [
  { key: "mahasiswa", label: "Mahasiswa UISI" },
  { key: "alumni", label: "Alumni" },
  { key: "umum", label: "Umum" },
];

export const TIERS = [
  {
    key: "course",
    name: "Course mandiri",
    note: "per kursus",
    prices: { mahasiswa: 0, alumni: 99000, umum: 199000 },
    items: [["Akses", "selamanya"], ["Sertifikat", "digital"], ["Forum tanya jawab", "ada"]],
  },
  {
    key: "bootcamp",
    name: "Bootcamp kohort",
    note: "per kohort",
    popular: true,
    prices: { mahasiswa: 350000, alumni: 1500000, umum: 2750000 },
    items: [["Mentor", "1 : 12"], ["Proyek akhir", "dinilai praktisi"], ["Sertifikat", "terverifikasi"], ["Bisa dikonversi", "ke SKS"]],
  },
  {
    key: "korporat",
    name: "Kelas korporat",
    note: "untuk tim",
    prices: { mahasiswa: null, alumni: null, umum: null },
    items: [["Materi", "disesuaikan"], ["Jadwal", "mengikuti tim"], ["Laporan", "per peserta"]],
  },
];

/** Mentor praktisi (contoh) — nama dikosongkan sampai ada data resmi; tampil sebagai peran + inisial. */
export const PRACTITIONERS = [
  { slug: "praktisi-erp", name: "Konsultan ERP", role: "Praktisi mitra · industri semen", track: "enterprise", quote: "Go-live yang mulus jarang soal teknologi. Biasanya soal data induk yang dibereskan jauh sebelumnya." },
  { slug: "praktisi-data", name: "Analis Data Senior", role: "Praktisi mitra · ritel nasional", track: "data", quote: "Dasbor terbaik adalah yang membuat rapat jadi lebih pendek, bukan lebih panjang." },
];

export const fmtRp = (n) => (n === 0 ? "Gratis" : n == null ? "Hubungi kami" : `Rp${n.toLocaleString("id-ID")}`);

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
const num = (v, lo, hi) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= lo && n <= hi ? Math.round(n) : null;
};
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(str(v));
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Sisa hari sampai tanggal mulai (null bila `now` belum ada — hindari hidrasi meleset). */
export function untilStart(start, now) {
  if (!now) return null;
  const ms = new Date(`${start}T08:00:00+07:00`).getTime() - now.getTime();
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0, past: true };
  const s = Math.floor(ms / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, past: false };
}

/**
 * Gabungkan CMS ke fallback.
 * @param row    PageContent `bootcamp` (boleh null)
 * @param dosen  hasil mergeDosen — mentor dosen per rumpun
 */
export function mergeBootcamp(row, { dosen } = {}) {
  const raw = parse(row?.data) ?? {};

  const over = Array.isArray(raw.bootcamps) ? raw.bootcamps : [];
  const bootcamps = BOOTCAMPS.map((b) => {
    const o = over.find((x) => x?.slug === b.slug) ?? {};
    const weeks = num(o.weeks, 2, 24) ?? b.weeks;
    const hours = num(o.hours, 2, 40) ?? b.hours;
    const seats = num(o.seats, 1, 500) ?? b.seats;
    const touched = Object.keys(o).length > 1;
    return {
      ...b,
      title: str(o.title) || b.title,
      lead: str(o.lead) || b.lead,
      start: isDate(o.start) ? str(o.start) : b.start,
      weeks,
      hours,
      seats,
      seatsLeft: Math.min(seats, num(o.seatsLeft, 0, 500) ?? b.seatsLeft),
      href: str(o.href) || b.href,
      plan: b.plan.slice(0, weeks),
      sks: creditsFor({ mode: "jam", weeks, hours }, RATE),
      sample: !touched,
    };
  });

  const cmsCourses = (Array.isArray(raw.courses) ? raw.courses : []).filter((c) => str(c?.title) && TRACKS[c.topic]);
  const courses = cmsCourses.length
    ? cmsCourses.map((c) => ({
        slug: str(c.slug) || slugify(c.title),
        title: str(c.title),
        topic: c.topic,
        level: LEVELS.some((l) => l.key === c.level) ? c.level : "pemula",
        hours: num(c.hours, 1, 200) ?? 6,
        perWeek: num(c.perWeek, 1, 40) ?? 3,
        lessons: (Array.isArray(c.lessons) ? c.lessons : []).filter((l) => str(l?.t)).map((l) => ({ t: str(l.t), min: num(l.min, 1, 600) ?? 15 })),
        href: str(c.href),
        sample: false,
      }))
    : COURSES.map((c) => ({ ...c, href: "", sample: true }));

  const tierOver = Array.isArray(raw.tiers) ? raw.tiers : [];
  const tiers = TIERS.map((t) => {
    const o = tierOver.find((x) => x?.key === t.key);
    const prices = { ...t.prices };
    for (const a of AUDIENCES) {
      const v = o?.prices?.[a.key];
      if (v === null || v === "") prices[a.key] = null;
      else if (num(v, 0, 1e9) !== null) prices[a.key] = num(v, 0, 1e9);
    }
    return { ...t, prices, sample: !o };
  });

  // Mentor: dosen yang rumpunnya sama dengan jalur kohort (data nyata) + praktisi contoh
  const lecturers = dosen?.lecturers ?? [];
  const tracks = new Set(bootcamps.map((b) => b.track));
  const fromDosen = lecturers
    .filter((l) => l.quote && l.fields.some((f) => tracks.has(f)))
    .slice(0, 4)
    .map((l) => ({
      slug: l.slug,
      name: l.name,
      role: l.role || "Dosen",
      photo: l.photo,
      initials: l.initials,
      track: l.fields.find((f) => tracks.has(f)),
      quote: l.quote,
      href: `/dosen#dosen-${l.slug}`,
      sample: false,
    }));
  const mentors = [...fromDosen, ...PRACTITIONERS.map((p) => ({ ...p, photo: null, initials: p.name.split(" ").map((w) => w[0]).join("").slice(0, 2), href: null, sample: true }))];

  const notice = raw.notice && str(raw.notice.title)
    ? { title: str(raw.notice.title), body: str(raw.notice.body), sample: false }
    : { title: `Pendaftaran kohort ${bootcamps[0].title} dibuka`, body: "Kursi dibatasi agar satu mentor tetap memegang paling banyak dua belas peserta.", sample: true };

  return {
    intro: { bootcamp: str(raw.intro) || INTRO.bootcamp, course: INTRO.course },
    notice,
    bootcamps,
    courses,
    tiers,
    mentors,
  };
}
