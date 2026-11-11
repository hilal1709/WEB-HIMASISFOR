/**
 * Konten halaman Visi & Misi.
 * Visi & misi bisa ditimpa dari CMS (PageContent) — editor yang sama dengan halaman Profil:
 *   section "visi" → content (teks visi)
 *   section "misi" → data.items (array string)
 * Teks visi & misi di bawah adalah teks resmi (sama dengan fallback /profile).
 * Penjelasan misi & tonggak bertanda `sample` adalah CONTOH → tampil dengan PlaceholderTag.
 */
/** Kunci sessionStorage tirai masuk halaman. */
export const CURTAIN_KEY = "sisfor:curtain:visi-misi";

export const VISI =
  "Menjadi Departemen Sistem Informasi yang unggul dalam bidang Sistem Enterprise, Tata Kelola dan Audit TI serta Sains Data pada tahun 2030 melalui sistem pengajaran, penelitian dan pengabdian masyarakat yang inovatif, berkualitas tinggi, dan berdaya-saing internasional serta oleh praktik-praktik terbaik industri";

/** Frasa visi yang diberi garis bawah emas (dicocokkan apa adanya, tidak peka huruf besar). */
export const VISI_HIGHLIGHTS = ["unggul", "2030", "berdaya-saing internasional", "praktik-praktik terbaik industri"];

export const MISI = [
  "Menyelenggarakan pengajaran, penelitian dan pengabdian masyarakat di bidang Sistem Informasi yang inovatif, berkualitas tinggi dan berdaya saing internasional.",
  "Menyusun dan melaksanakan kurikulum yang didasarkan pada kebutuhan masyarakat, bisnis dan industri.",
  "Menyelenggarakan tata kelola pendidikan yang profesional, akuntabel dengan dukungan teknologi informasi dan komunikasi.",
  "Membentuk sivitas akademika yang amanah, beretika dan berorientasi pada kemajuan, serta menjunjung tinggi budaya berbagi pengetahuan.",
  "Menghasilkan lulusan Sistem Informasi yang berbudi luhur, berwawasan internasional, menjunjung kearifan lokal dan profesional.",
];

/** Kata kunci + ilustrasi + penjelasan (contoh) per misi, urut sesuai MISI. */
export const MISI_META = [
  {
    key: "Tridarma",
    illustration: "lecturer",
    detail:
      "Pengajaran, penelitian, dan pengabdian dijalankan sebagai satu siklus: hasil riset dosen masuk ke kelas, dan proyek mahasiswa diuji langsung di masyarakat.",
    tags: ["Pengajaran", "Penelitian", "Pengabdian"],
  },
  {
    key: "Kurikulum",
    illustration: "industry",
    detail:
      "Kurikulum ditinjau berkala bersama mitra industri dan alumni, sehingga mata kuliah selalu mengikuti kebutuhan bisnis dan perkembangan teknologi.",
    tags: ["Mitra industri", "OBE", "Studi kasus nyata"],
  },
  {
    key: "Tata kelola",
    illustration: "erp",
    detail:
      "Layanan akademik dikelola secara profesional dan akuntabel, didukung sistem informasi terintegrasi yang transparan bagi mahasiswa dan dosen.",
    tags: ["Akuntabel", "Layanan digital", "Penjaminan mutu"],
  },
  {
    key: "Budaya berbagi",
    illustration: "knowledge",
    detail:
      "Sivitas akademika dibiasakan berbagi pengetahuan lewat komunitas, kelompok riset, dan forum diskusi, dengan menjunjung amanah dan etika.",
    tags: ["Amanah", "Etika", "Komunitas"],
  },
  {
    key: "Lulusan",
    illustration: "career",
    detail:
      "Lulusan disiapkan menjadi profesional berbudi luhur yang siap bersaing di tingkat internasional tanpa melupakan kearifan lokal.",
    tags: ["Profesional", "Global", "Kearifan lokal"],
  },
];

/** Tonggak menuju visi 2030. `sample: true` = contoh, menunggu data resmi. */
export const MILESTONES = [
  { year: "2014", title: "Program studi berdiri", body: "SK Dirjen Dikti No. 502/E/O/2014, 16 Oktober 2014." },
  { year: "2018", title: "Lulusan pertama", body: "Angkatan pertama Sisforians memasuki dunia industri.", sample: true },
  { year: "2022", title: "Kurikulum OBE", body: "Kurikulum berbasis capaian disusun bersama mitra industri.", sample: true },
  { year: "2024", title: "Akreditasi Baik Sekali", body: "Diraih dari LAM INFOKOM.", sample: true /* tahun perlu dikonfirmasi */ },
  { year: "2027", title: "Rekognisi internasional", body: "Kolaborasi riset dan mobilitas mahasiswa lintas negara.", sample: true },
  { year: "2030", title: "Unggul & berdaya saing", body: "Visi tercapai: unggul di Sistem Enterprise, Tata Kelola & Audit TI, dan Sains Data.", goal: true },
];

/** Gabungkan baris CMS ke fallback. */
export function mergeVisiMisi(visiRow, misiRow) {
  let items = null;
  try {
    const data = misiRow?.data ? (typeof misiRow.data === "string" ? JSON.parse(misiRow.data) : misiRow.data) : null;
    if (Array.isArray(data?.items)) items = data.items.map((s) => String(s).trim()).filter(Boolean);
  } catch {}
  const visi = (visiRow?.content || VISI).trim().replace(/^["“]|["”]$/g, "");
  const misi = items?.length ? items : MISI;
  return {
    visi,
    highlights: VISI_HIGHLIGHTS,
    misi: misi.map((text, i) => ({ text, n: i + 1, ...(MISI_META[i] ?? { key: `Misi ${i + 1}`, illustration: "lecturer", detail: "", tags: [] }) })),
    milestones: MILESTONES,
  };
}
