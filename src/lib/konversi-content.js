/**
 * Konten halaman Konversi SKS (`/konversi-sks`).
 * Nama & SKS mata kuliah diturunkan dari kurikulum (`getKurikulumData`) — tidak ditulis ulang. Aturan batas SKS per
 * semester ditautkan ke Regulasi (`/regulasi-akademik#pasal-1-3`), logbook ke Magang (`/magang#logbook`).
 *
 * CMS `PageContent` section `konversi-sks` (Admin › Konten › Konversi SKS):
 *   data.intro           → paragraf intro hero
 *   data.notice          → { title, body } untuk banner (kosong → diturunkan dari agenda/berita MBKM beranda)
 *   data.rate            → jam kegiatan per 1 SKS (angka)
 *   data.cap             → batas SKS konversi per semester (angka)
 *   data.programs[]      → ditimpa per `key` { label, lead, weeks, hours }
 *   data.docs[]          → ditimpa per `key` (la/penyetaraan; `href` = URL berkas)
 * Kurs, batas, bentuk kegiatan, alur, kasus, dan berkas adalah CONTOH (`sample`) → tampil dengan PlaceholderTag.
 */
import { AGENDA, NEWS } from "@/lib/home-content";

export const CURTAIN_KEY = "sisfor:curtain:konversi";
export const BANNER_KEY = "sisfor:banner:konversi";
export const SIM_KEY = "sisfor:konversi:simulasi";

export const INTRO = {
  body: "Magang, riset, mengajar, atau membangun desa — kegiatan di luar kelas bisa menggantikan mata kuliah. Hitung berapa SKS yang setara, pilih mata kuliah penggantinya, lalu bawa ringkasannya ke dosen wali.",
};

/** 1 SKS = 170 menit/minggu × 16 minggu ≈ 45 jam kegiatan (contoh, menunggu pedoman resmi). */
export const RATE = 45;
/** Batas SKS konversi dalam satu semester (contoh). */
export const CAP = 20;

/**
 * Bentuk kegiatan. `mode`:
 *   "jam" → SKS = jam total ÷ kurs
 *   "sks" → mata kuliah di kampus tujuan diakui 1:1 (pertukaran)
 * `prefer` = rumpun kurikulum yang paling relevan; `pin` = mata kuliah yang otomatis disarankan pertama.
 */
export const PROGRAMS = [
  { key: "magang", label: "Magang", lead: "Bekerja penuh waktu satu semester di organisasi mitra.", mode: "jam", weeks: 23, hours: 40, prefer: ["enterprise", "tata-kelola", "data"], pin: /kerja praktik/i },
  { key: "studi-independen", label: "Studi Independen", lead: "Kelas intensif bersertifikat dari penyelenggara mitra.", mode: "jam", weeks: 16, hours: 30, prefer: ["data", "enterprise"] },
  { key: "pertukaran", label: "Pertukaran Mahasiswa", lead: "Kuliah satu semester di kampus lain; SKS-nya dibawa pulang.", mode: "sks", sks: 18, prefer: ["fondasi", "data", "enterprise", "tata-kelola"] },
  { key: "riset", label: "Riset", lead: "Bergabung dengan proyek penelitian dosen atau lembaga.", mode: "jam", weeks: 16, hours: 24, prefer: ["data", "tata-kelola"], pin: /metode penelitian/i },
  { key: "asistensi", label: "Asistensi Mengajar", lead: "Mendampingi guru di satuan pendidikan.", mode: "jam", weeks: 16, hours: 24, prefer: ["tata-kelola", "fondasi"] },
  { key: "kemanusiaan", label: "Proyek Kemanusiaan", lead: "Relawan tanggap bencana atau program sosial.", mode: "jam", weeks: 12, hours: 30, prefer: ["tata-kelola", "enterprise"] },
  { key: "wirausaha", label: "Wirausaha", lead: "Merintis usaha dengan pendampingan inkubator.", mode: "jam", weeks: 16, hours: 20, prefer: ["enterprise"] },
  { key: "desa", label: "Membangun Desa", lead: "KKN tematik: memecahkan satu masalah desa bersama warga.", mode: "jam", weeks: 8, hours: 40, prefer: ["tata-kelola", "enterprise"], pin: /kuliah kerja nyata/i },
];

/** Batas nilai scrub field. */
export const LIMITS = { weeks: [1, 26], hours: [4, 48], sks: [1, 24] };

/** Enam tahap pengajuan. `doc` = kunci berkas; `link` = tautan ke halaman lain (bukan diulang di sini). */
export const STEPS = [
  { key: "konsultasi", title: "Konsultasi dosen wali", who: "Kamu & dosen wali", output: "Rencana kegiatan disetujui", when: "Sebelum masa KRS", body: "Bawa struk simulasi dari meja di atas. Dosen wali memeriksa apakah mata kuliah yang kamu pilih masuk akal untuk kegiatanmu dan tidak menabrak prasyarat." },
  { key: "la", title: "Learning Agreement", who: "Kamu, koordinator, mitra", output: "Perjanjian bertanda tangan tiga pihak", when: "≤ 2 minggu sebelum mulai", body: "Dokumen ini mengunci daftar mata kuliah yang disetarakan beserta capaian yang harus kamu buktikan. Tanpa LA, nilai tidak bisa dikonversi.", doc: "la" },
  { key: "krs", title: "Isi KRS konversi", who: "Kamu", output: "Mata kuliah konversi tercantum di KRS", when: "Masa KRS", body: "Ambil mata kuliah sesuai LA di KRS semester berjalan, ditandai kelas konversi. Batas SKS per semester tetap berlaku.", link: { href: "/regulasi-akademik#pasal-1-3", label: "Batas SKS per semester" } },
  { key: "jalan", title: "Jalani kegiatannya", who: "Kamu, mitra, dosen pendamping", output: "Logbook dan bukti capaian", when: "Selama kegiatan", body: "Catat kegiatan harian dan kumpulkan bukti untuk setiap capaian di LA. Format logbooknya sama dengan magang.", link: { href: "/magang#logbook", label: "Format logbook" } },
  { key: "setara", title: "Penilaian & penyetaraan", who: "Dosen pendamping & koordinator", output: "Nilai per mata kuliah", when: "≤ 2 minggu setelah selesai", body: "Nilai dari mitra dipecah ke tiap mata kuliah sesuai bobot di LA. Kamu bisa diminta presentasi singkat untuk mata kuliah yang buktinya kurang.", doc: "penyetaraan" },
  { key: "transkrip", title: "Nilai masuk transkrip", who: "Bagian akademik", output: "Nilai tampil di KHS & transkrip", when: "Akhir semester", body: "Mata kuliah konversi tampil seperti mata kuliah biasa, lengkap dengan huruf mutu, dan ikut dihitung di IPK." },
];

export const DOCS = [
  { key: "la", title: "Templat Learning Agreement", kind: "Perjanjian", pages: 3, href: "", outline: ["Identitas mahasiswa & mitra", "Daftar mata kuliah yang disetarakan", "Capaian dan bukti per mata kuliah", "Bobot penilaian", "Tanda tangan tiga pihak"] },
  { key: "penyetaraan", title: "Formulir penyetaraan nilai", kind: "Formulir", pages: 2, href: "", outline: ["Nilai dari mitra", "Pemetaan ke mata kuliah", "Huruf mutu akhir", "Pengesahan koordinator"] },
];

/** Tiga kasus untuk perbandingan transkrip (nama mata kuliah harus ada di kurikulum). */
export const CASES = [
  { key: "data", label: "Magang data analyst", program: "magang", weeks: 20, hours: 40, courses: [["Kerja Praktik", "A"], ["Pergudangan Data & Intelijensia Bisnis", "AB"], ["Penambangan Data", "A"], ["Sistem Pendukung Keputusan", "AB"], ["Sains Data Terapan", "B"]] },
  { key: "erp", label: "Studi independen ERP", program: "studi-independen", weeks: 16, hours: 30, courses: [["Perencanaan Sumber Daya Perusahaan", "A"], ["Manajemen Proses Bisnis", "AB"], ["Arsitektur Enterprise", "AB"]] },
  { key: "desa", label: "Membangun desa digital", program: "desa", weeks: 8, hours: 40, courses: [["Kuliah Kerja Nyata", "A"], ["Manajemen Proyek TI", "AB"], ["Manajemen Layanan TI", "B"]] },
];

/** Mata kuliah yang tidak bisa dikonversi (wajib universitas / tugas akhir). */
const NOT_CONVERTIBLE = /bahasa|wawasan|skripsi|sertifikasi|etika|pancasila|agama/i;

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
const num = (v, [lo, hi]) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= lo && n <= hi ? Math.round(n) : null;
};

/** SKS setara untuk satu kegiatan (sebelum dipotong batas). */
export function creditsFor({ mode, weeks, hours, sks }, rate = RATE) {
  if (mode === "sks") return sks ?? 0;
  return Math.floor(((weeks ?? 0) * (hours ?? 0)) / rate);
}

/** Pengumuman dari agenda beranda (MBKM/magang) atau berita MBKM. */
function noticeFromHome() {
  const a = AGENDA.find((x) => /mbkm|magang/i.test(x.title));
  if (a) return { title: `Pengajuan konversi dibuka setelah ${a.title}`, body: `${Number(a.day)} ${a.month}, ${a.place}. Siapkan struk simulasimu sebelum sesi agar pertanyaanmu lebih tajam.`, sample: true, event: a };
  const n = NEWS.items.find((x) => /mbkm/i.test(x.title));
  return n ? { title: n.title, body: n.body, sample: true, event: null } : null;
}

/**
 * Gabungkan CMS ke fallback.
 * @param row        PageContent `konversi-sks` (boleh null)
 * @param kurikulum  hasil getKurikulumData — kandidat mata kuliah konversi
 */
export function mergeKonversi(row, { kurikulum } = {}) {
  const raw = parse(row?.data);
  const rate = num(raw?.rate, [10, 120]);
  const cap = num(raw?.cap, [6, 40]);

  const cmsPrograms = Array.isArray(raw?.programs) ? raw.programs : [];
  const programs = PROGRAMS.map((p) => {
    const o = cmsPrograms.find((x) => x?.key === p.key) ?? {};
    return {
      ...p,
      label: str(o.label) || p.label,
      lead: str(o.lead) || p.lead,
      weeks: num(o.weeks, LIMITS.weeks) ?? p.weeks,
      hours: num(o.hours, LIMITS.hours) ?? p.hours,
      pin: p.pin ? p.pin.source : null,
    };
  });

  const all = kurikulum?.courses ?? [];
  const courses = all
    .filter((c) => c.sks && !NOT_CONVERTIBLE.test(c.nama) && (c.track || (c.semester ?? 0) >= 5))
    .map((c) => ({ slug: c.slug, nama: c.nama, sks: c.sks, semester: c.semester, track: c.track ?? null, rumpun: c.rumpun, cpmk: (c.rps?.cpmk ?? []).slice(0, 3).map((x) => (typeof x === "string" ? x : x.teks)) }));

  const bySlugName = (nama) => courses.find((c) => c.nama.toLowerCase() === nama.toLowerCase());
  const cases = CASES.map((k) => ({
    ...k,
    rows: k.courses.map(([nama, grade]) => ({ course: bySlugName(nama), grade })).filter((r) => r.course),
  })).filter((k) => k.rows.length);

  const docItems = Array.isArray(raw?.docs) ? raw.docs : [];
  const docs = DOCS.map((d) => {
    const o = docItems.find((x) => x?.key === d.key) ?? {};
    return { ...d, href: str(o.href) || d.href, sample: !str(o.href) };
  });

  const body = str(raw?.intro);
  const n = raw?.notice;
  const notice = n && str(n.title) ? { title: str(n.title), body: str(n.body), sample: false, event: null } : noticeFromHome();

  return {
    intro: { body: body && body.length > 40 ? body : INTRO.body },
    rate: rate ?? RATE,
    cap: cap ?? CAP,
    rulesSample: rate == null || cap == null,
    programs,
    courses,
    steps: STEPS,
    cases,
    docs,
    notice,
  };
}
