/**
 * Konten halaman Struktur Organisasi.
 *
 * Yang SUDAH pasti: Ketua Program Studi + daftar dosen & bidang keahliannya (sama dengan /profile)
 * dan satu Minilab. Jabatan lain (sekretaris, koordinator, unit) BELUM dikonfirmasi, jadi tidak
 * ditampilkan. Bila nanti sudah ada, cukup tambahkan orang dengan `reportsTo` + `role`:
 * bagan otomatis bercabang (lihat OrgChart).
 *
 * Bisa ditimpa dari CMS: PageContent section "struktur-organisasi"
 *   title/subtitle → judul & paragraf intro,
 *   data → JSON { people: [...], minilab: {...}, confirmed: true } (bentuk sama dengan di bawah).
 */

/** Kunci sessionStorage tirai masuk halaman. */
export const CURTAIN_KEY = "sisfor:curtain:struktur";

export const INTRO = {
  title: "Struktur Organisasi",
  body: "Kenali pimpinan dan dosen Program Studi Sistem Informasi UISI, beserta bidang keahlian masing-masing.",
};

/**
 * Orang dalam bagan.
 *   reportsTo: key atasan langsung (kosong = puncak bagan)
 *   group: "staff" → tenaga kependidikan, digambar di garis samping Kaprodi (bukan baris dosen)
 *   duties: opsional, hanya ditampilkan bila diisi
 */
export const PEOPLE = [
  {
    key: "kaprodi",
    name: "Grandys Frieska Prassida",
    credentials: "S.Kom., M.Kom., Ph.D., MCE, CIIQA",
    role: "Ketua Program Studi",
    photo: "/img/profil/grandys.jpg",
    expertise: ["IS Strategic Planning", "Enterprise Architecture", "IT Governance & Risk Management"],
  },
  {
    key: "ardhi",
    reportsTo: "kaprodi",
    name: "Ardhi Dwi Firmansyah",
    credentials: "S.Kom., M.Kom., MCE",
    role: "Dosen",
    photo: "/img/profil/ardhi.jpg",
    expertise: ["IT Governance", "Data Governance", "IT Service Management"],
  },
  {
    key: "putri",
    reportsTo: "kaprodi",
    name: "Dr. Putri Amelia",
    credentials: "S.T., M.T., M.Eng., MCE, MOS",
    role: "Dosen",
    photo: "/img/profil/putri.jpg",
    expertise: ["Modelling", "System Dynamic", "Supply Chain"],
  },
  {
    key: "brina",
    reportsTo: "kaprodi",
    name: "Brina Miftahurrohmah",
    credentials: "S.Si., M.Si., MCE, MCF",
    role: "Dosen",
    photo: "/img/profil/brina.jpg",
    expertise: ["Intelligence Decision Support Systems", "Statistics", "Forecasting"],
  },
  {
    key: "catur",
    reportsTo: "kaprodi",
    name: "Catur Wulandari",
    credentials: "S.Kom., M.Sc., MCE, MOS, MCF",
    role: "Dosen",
    photo: "/img/profil/catur.jpg",
    expertise: ["Education Technology", "Data Science", "Software Engineering"],
  },
  {
    key: "tikno",
    reportsTo: "kaprodi",
    name: "Tikno",
    credentials: "S.T., M.Kom., MCE",
    role: "Dosen",
    photo: "/img/profil/tikno.jpg",
    expertise: ["Enterprise Resource Planning", "IT Audit", "Customer Behavior"],
  },
  {
    key: "staf",
    reportsTo: "kaprodi",
    group: "staff",
    // TODO: isi nama & foto staf prodi bila sudah ada
    name: "Staf Program Studi",
    credentials: "",
    role: "Staf Prodi",
    photo: null,
    expertise: ["Administrasi akademik", "Persuratan", "Layanan mahasiswa"],
  },
];

/** Satu-satunya laboratorium prodi. Deskripsi & kegiatan masih umum, lengkapi lewat CMS. */
export const MINILAB = {
  title: "Minilab Sistem Informasi",
  body: "Ruang praktikum dan diskusi program studi: tempat mahasiswa mengerjakan tugas praktik, belajar kelompok, dan berkegiatan bersama dosen.",
  uses: ["Praktikum mata kuliah", "Belajar kelompok", "Bimbingan & diskusi"],
  head: null, // key PEOPLE penanggung jawab, bila sudah ditetapkan
};

/** Inisial nama (lewati gelar "Dr"). */
export const initials = (name) =>
  name
    .split(/[ ,.]+/)
    .filter((w) => w && w !== "Dr" && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

/** Gabungkan baris CMS ke fallback. `confirmed` = struktur resmi sudah diisi dari CMS. */
export function mergeStruktur(row) {
  const base = { intro: INTRO, people: PEOPLE, minilab: MINILAB, confirmed: false };
  if (!row) return base;
  let data = {};
  try {
    data = row.data ? (typeof row.data === "string" ? JSON.parse(row.data) : row.data) : {};
  } catch {}
  const hasPeople = Array.isArray(data.people) && data.people.length > 0;
  return {
    intro: { title: row.title || INTRO.title, body: row.subtitle || row.content || INTRO.body },
    people: hasPeople ? data.people : PEOPLE,
    minilab: { ...MINILAB, ...(data.minilab || {}) },
    confirmed: hasPeople && data.confirmed !== false,
  };
}
