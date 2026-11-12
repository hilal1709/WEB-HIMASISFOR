/**
 * Konten halaman Bidang Keahlian (`/bidang-keahlian`).
 * Data dasar (judul, foto, Lottie, prospek karier) sama dengan kartu beranda (`EXPERTISE` di home-content.js);
 * mata kuliah diturunkan dari kurikulum (`mergeKurikulum`) dan dosen dari direktori (`mergeDosen`) — tidak ditulis ulang.
 *
 * CMS `PageContent` section `bidang-keahlian` (editor Admin › Konten › Bidang Keahlian):
 *   data.intro       → paragraf intro hero
 *   data.items[]     → ditimpa per `slug` (field apa pun di FIELDS; mengisi `learn`/`tools` menghapus tanda contoh)
 * Isi lama editor (`content` "Tiga bidang…" dan array `{ cardId, description }`) sengaja diabaikan: ditulis untuk
 * halaman lama (tiga bidang) dan mengulang butir "Yang kamu pelajari".
 * Profil radar, studi kasus, dan daftar alat adalah CONTOH (`sample`) → tampil dengan PlaceholderTag.
 */
import { EXPERTISE } from "@/lib/home-content";

export const CURTAIN_KEY = "sisfor:curtain:bidang-keahlian";
export const BANNER_KEY = "sisfor:banner:bidang-keahlian";
export const SHORTLIST_KEY = "sisfor:shortlist:bidang-keahlian";

export const INTRO = {
  body: "Setiap bidang menjawab pertanyaan yang berbeda tentang organisasi. Kenali pertanyaannya, cocokkan dengan caramu berpikir, lalu simpan yang paling memanggilmu.",
};

/** Dimensi minat — sama untuk slider pengguna dan profil tiap bidang (skala 0–10). */
export const DIMENSIONS = [
  { key: "angka", label: "Membongkar angka & pola", short: "Angka" },
  { key: "aturan", label: "Merapikan aturan & risiko", short: "Aturan" },
  { key: "alur", label: "Menyusun alur antardivisi", short: "Alur" },
  { key: "strategi", label: "Merancang strategi & memimpin", short: "Strategi" },
  { key: "kode", label: "Membangun dengan kode", short: "Kode" },
];

export const DEFAULT_PROFILE = [6, 4, 5, 5, 6];

/** Studi kasus bersama: satu masalah dilihat dari empat bidang (CONTOH). */
export const CASE = {
  kicker: "Studi kasus",
  title: "Stok semen di gudang distribusi selisih 3% setiap bulan.",
  body: "Catatan sistem dan hitungan fisik tidak pernah cocok. Empat lulusan diminta turun tangan, masing-masing mulai dari titik yang berbeda.",
  sample: true,
};

const BASE = Object.fromEntries(EXPERTISE.items.map((e) => [e.slug, e]));

/** Empat bidang. Urutan = urutan mosaik & modal. */
export const FIELDS = [
  {
    slug: "enterprise",
    accent: "maroon",
    short: "Enterprise",
    question: "Bagaimana seluruh divisi bekerja dalam satu sistem?",
    summary: "Kamu belajar membaca proses bisnis dari pembelian sampai penjualan, lalu menerjemahkannya ke konfigurasi ERP yang dipakai perusahaan sungguhan.",
    learn: ["Memodelkan proses order-to-cash dan procure-to-pay", "Mengonfigurasi modul ERP pada studi kasus manufaktur", "Memimpin uji penerimaan dan migrasi data"],
    tools: ["SAP S/4HANA", "BPMN 2.0", "Signavio", "Odoo"],
    courses: ["Perencanaan Sumber Daya Perusahaan", "Analisis & Desain Proses Bisnis", "Manajemen Rantai Pasok", "Manajemen Hubungan Pelanggan"],
    dosenField: "enterprise",
    profileKey: "erp",
    elective: "erp",
    profile: [4, 5, 10, 6, 6],
    quadrant: 2,
    move: { role: "Konsultan ERP", step: "Memetakan alur barang masuk dan keluar yang masih dicatat manual, lalu memindahkannya ke modul gudang ERP.", output: "Alur goods receipt–goods issue terintegrasi" },
    sample: true,
  },
  {
    slug: "audit",
    accent: "navy",
    short: "IT Audit",
    question: "Bisakah sistem ini dipercaya?",
    summary: "Kamu belajar menilai apakah kontrol TI benar-benar bekerja: siapa boleh mengubah data, bukti apa yang tersisa, dan risiko apa yang belum ditutup.",
    learn: ["Menyusun program audit berbasis risiko", "Menguji pengendalian umum dan aplikasi", "Menulis temuan yang bisa ditindaklanjuti manajemen"],
    tools: ["COBIT 2019", "ISO/IEC 27001", "ITIL 4", "ACL Analytics"],
    courses: ["Audit TI", "Tata Kelola TI", "Manajemen Risiko TI", "Keamanan Siber"],
    dosenField: "tata-kelola",
    profileKey: "audit",
    elective: "tata-kelola",
    profile: [5, 10, 6, 6, 3],
    quadrant: 3,
    move: { role: "IT Auditor", step: "Menelusuri jejak transaksi dan hak akses pada pencatatan stok untuk menemukan kontrol yang bocor.", output: "Laporan temuan + rekomendasi kontrol" },
    sample: true,
  },
  {
    slug: "data",
    accent: "gold",
    short: "Data Science",
    question: "Apa yang akan terjadi bulan depan?",
    summary: "Kamu belajar mengubah data operasional menjadi model prediksi dan dasbor yang dipakai manajer untuk memutuskan, bukan sekadar dilihat.",
    learn: ["Membersihkan dan memodelkan data transaksi", "Membangun model peramalan dan klasifikasi", "Merancang dasbor untuk pengambil keputusan"],
    tools: ["Python", "SQL", "Power BI", "Orange"],
    courses: ["Penambangan Data", "Pergudangan Data & Intelijensia Bisnis", "Sistem Pendukung Keputusan", "Statistika"],
    dosenField: "data",
    profileKey: "data",
    elective: "data",
    profile: [10, 3, 4, 5, 8],
    quadrant: 1,
    move: { role: "Data Analyst", step: "Mencari pola selisih per gudang, shift, dan jenis kemasan dengan model deteksi anomali.", output: "Dasbor peringatan dini selisih stok" },
    sample: true,
  },
  {
    slug: "msi",
    accent: "navy",
    short: "Manajemen SI",
    question: "Teknologi mana yang layak didanai?",
    summary: "Kamu belajar menghitung nilai sebuah inisiatif TI, menyusun peta jalannya, dan menjaga proyek tetap di jalur waktu dan anggaran.",
    learn: ["Menyusun rencana strategis SI/TI", "Menghitung kelayakan investasi TI", "Mengelola proyek dengan Scrum dan PMBOK"],
    tools: ["TOGAF", "Scrum", "PMBOK", "Balanced Scorecard"],
    courses: ["Perencanaan Strategis SI", "Manajemen Proyek TI", "Manajemen Investasi TI", "Manajemen Layanan TI"],
    dosenField: "strategi",
    profileKey: "strategi",
    elective: null,
    profile: [5, 6, 6, 10, 3],
    quadrant: 0,
    move: { role: "IT Project Manager", step: "Membandingkan opsi RFID, barcode, dan perbaikan prosedur dari sisi biaya, waktu, dan dampaknya.", output: "Business case + peta jalan 12 bulan" },
    sample: true,
  },
].map((f) => {
  const b = BASE[f.slug] ?? {};
  return { ...f, title: b.title, image: b.image, crop: !!b.crop, lottie: b.lottie, careers: b.careers ?? [] };
});

/**
 * Kuadran kompas (urutan = data-quadrant): 0 kiri-atas, 1 kanan-atas, 2 kiri-bawah, 3 kanan-bawah.
 * Sumbu X: proses bisnis ↔ teknologi & data. Sumbu Y: kendali & kepatuhan (bawah) ↔ strategi & perubahan (atas).
 */
export const AXES = { left: "Proses bisnis", right: "Teknologi & data", top: "Strategi & perubahan", bottom: "Kendali & operasi" };

/** Skor kecocokan 0–100 dari jarak euclidean; batas jarak ±6 per dimensi agar skor tidak menumpuk di 70-an. */
export function matchScore(user, profile) {
  const max = Math.sqrt(profile.length * 40);
  const d = Math.sqrt(profile.reduce((s, v, i) => s + (v - (user[i] ?? 0)) ** 2, 0));
  return Math.round(Math.max(0, 1 - d / max) * 100);
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

/**
 * Gabungkan CMS ke fallback.
 * @param row        PageContent `bidang-keahlian` (boleh null)
 * @param kurikulum  hasil mergeKurikulum — dipakai untuk mencocokkan mata kuliah (slug RPS)
 * @param dosen      hasil mergeDosen — dipakai untuk dosen per rumpun
 */
export function mergeBidang(row, { kurikulum, dosen } = {}) {
  const raw = parse(row?.data);
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const courseByName = new Map((kurikulum?.courses ?? []).map((c) => [c.nama.toLowerCase(), c]));
  const lecturers = dosen?.lecturers ?? [];

  const fields = FIELDS.map((f) => {
    const o = items.find((x) => x?.slug === f.slug) ?? {};
    const merged = { ...f, ...o };
    if (o.learn || o.tools) merged.sample = false;
    return {
      ...merged,
      courseLinks: merged.courses.map((n) => courseByName.get(String(n).toLowerCase())).filter(Boolean).map((c) => ({ slug: c.slug, nama: c.nama, sks: c.sks, rps: !!c.rps })),
      people: lecturers.filter((l) => l.fields.includes(merged.dosenField)).map((l) => ({ slug: l.slug, name: l.name, photo: l.photo, initials: l.initials })),
    };
  });

  const body = typeof raw?.intro === "string" ? raw.intro.trim() : "";
  return { intro: { body: body && body.length > 40 ? body : INTRO.body }, fields };
}
