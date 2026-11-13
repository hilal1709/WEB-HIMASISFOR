import { PMB_URL } from "@/lib/home-content";

/**
 * Konten halaman FAQ (`/faq`) — konsep "lemari katalog perpustakaan".
 * Tiap pertanyaan = kartu katalog bernomor panggil (`FAQ·PMB·01`), tiap topik = laci.
 * Jawaban sengaja ringkas dan selalu menunjuk halaman sumbernya (`source`) agar tidak mengulang
 * isi halaman lain. FAQ khusus kelas (Program Kelas) dan persuratan (Layanan Akademik) tidak diulang di sini.
 *
 * CMS `PageContent` section `faq` (Admin › Konten › FAQ):
 *   content           → paragraf hero
 *   data.cards[]      → ditimpa per `slug` { q, a, personas? }; mengisi `a` menghapus tanda contoh
 *   data.extra[]      → kartu tambahan { slug, drawer, q, a, personas?, source? }
 */

export const CURTAIN_KEY = "sisfor:curtain:faq";
export const BANNER_KEY = "sisfor:banner:faq";

export const INTRO = {
  body: "Lemari ini menyimpan pertanyaan yang paling sering sampai ke meja prodi. Jawabannya pendek, lengkapnya ada di halaman yang ditunjuk tiap kartu.",
};

/** Persona di kalimat isian hero. `all` = tanpa filter. */
export const PERSONAS = [
  { key: "all", label: "siapa saja" },
  { key: "camaba", label: "calon mahasiswa" },
  { key: "mahasiswa", label: "mahasiswa aktif" },
  { key: "ortu", label: "orang tua / wali" },
  { key: "mitra", label: "mitra industri" },
];

/** Laci = topik. `code` dipakai di nomor panggil, `desk` = meja tujuan di halaman Kontak. */
export const DRAWERS = [
  { key: "daftar", code: "PMB", label: "Pendaftaran", desk: "pmb" },
  { key: "kuliah", code: "KUL", label: "Perkuliahan", desk: "sekretariat" },
  { key: "biaya", code: "BYA", label: "Biaya & Beasiswa", desk: "pmb" },
  { key: "lulus", code: "LLS", label: "Kelulusan & Konversi", desk: "sekretariat" },
  { key: "karier", code: "KRR", label: "Magang & Karier", desk: "kaprodi" },
  { key: "kampus", code: "KMP", label: "Kampus & Prodi", desk: "sekretariat" },
];

const PMB = { href: PMB_URL, label: "Portal PMB UISI", external: true };

export const CARDS = [
  // Pendaftaran
  { slug: "jurusan-sekolah", drawer: "daftar", personas: ["camaba", "ortu"], q: "Lulusan jurusan apa yang bisa mendaftar?", a: "Syarat jurusan asal sekolah ditetapkan universitas untuk tiap periode penerimaan, bukan oleh prodi. Daftar lengkapnya terbit bersama jadwal seleksi.", source: PMB },
  { slug: "belum-bisa-coding", drawer: "daftar", personas: ["camaba", "ortu"], q: "Belum bisa coding, apakah akan tertinggal?", a: "Tidak. Pemrograman diajarkan dari dasar, dan bootcamp prodi membantu yang ingin mengejar lebih cepat di luar jam kuliah.", source: { href: "/bootcamp", label: "Bootcamp" } },
  { slug: "pilih-kelas", drawer: "daftar", personas: ["camaba"], q: "Kelas mana yang cocok untukku?", a: "Pilihannya bergantung pada waktu luang dan status kerjamu. Kuis singkat di halaman Program Kelas memberi rekomendasi dalam satu menit.", source: { href: "/program-kelas", label: "Program Kelas" } },

  // Perkuliahan
  { slug: "beda-informatika", drawer: "kuliah", personas: ["camaba", "ortu"], q: "Apa bedanya dengan Teknik Informatika?", a: "Informatika berangkat dari mesin dan algoritma. Sistem Informasi berangkat dari organisasi: bagaimana data dan aplikasi membuat proses bisnis berjalan lebih baik.", source: { href: "/profil-lulusan", label: "Profil Lulusan" } },
  { slug: "peminatan", drawer: "kuliah", personas: ["camaba", "mahasiswa"], q: "Kapan dan bagaimana memilih peminatan?", a: "Peminatan dipilih setelah mata kuliah dasar selesai. Kenali dulu isi tiap bidang dan mata kuliah pilihannya sebelum memutuskan.", source: { href: "/bidang-keahlian", label: "Bidang Keahlian" } },
  { slug: "rps", drawer: "kuliah", personas: ["mahasiswa"], q: "Di mana melihat RPS dan sebaran mata kuliah?", a: "Sebaran per semester beserta RPS tiap mata kuliah tersusun di halaman Kurikulum.", source: { href: "/curiculum", label: "Kurikulum" } },

  // Biaya & Beasiswa
  { slug: "biaya-kuliah", drawer: "biaya", personas: ["camaba", "ortu"], q: "Berapa biaya kuliahnya?", a: "Biaya ditetapkan universitas per periode dan diumumkan resmi di portal PMB. Prodi tidak menerbitkan angka sendiri agar tidak ada informasi ganda.", source: PMB },
  { slug: "beasiswa-ganda", drawer: "biaya", personas: ["camaba", "mahasiswa", "ortu"], q: "Bolehkah menerima dua beasiswa sekaligus?", a: "Tergantung aturan tiap penyelenggara. Cek kolom kewajiban di kartu beasiswanya sebelum mendaftar yang kedua.", source: { href: "/beasiswa", label: "Beasiswa" } },
  { slug: "ipk-turun", drawer: "biaya", personas: ["mahasiswa", "ortu"], q: "Kalau IPK turun, apakah beasiswa dicabut?", a: "Setiap beasiswa punya syarat bertahan sendiri. Bicarakan dengan dosen wali sebelum semester berakhir agar ada waktu memperbaiki.", source: { href: "/beasiswa", label: "Beasiswa" } },

  // Kelulusan & Konversi
  { slug: "selain-skripsi", drawer: "lulus", personas: ["mahasiswa", "camaba"], q: "Apakah tugas akhir harus berupa skripsi?", a: "Tidak harus. Ada beberapa jalur kelulusan dengan luaran berbeda, masing-masing dengan syarat dan pembimbingnya sendiri.", source: { href: "/jalur-kelulusan", label: "Jalur Kelulusan" } },
  { slug: "sertifikat-sks", drawer: "lulus", personas: ["mahasiswa"], q: "Sertifikasi atau lomba bisa jadi SKS?", a: "Bisa, selama kegiatannya memenuhi ketentuan konversi dan diajukan dengan bukti yang lengkap.", source: { href: "/konversi-sks", label: "Konversi SKS" } },
  { slug: "masa-studi", drawer: "lulus", personas: ["mahasiswa", "ortu"], q: "Berapa lama batas masa studi?", a: "Batas masa studi, cuti, dan evaluasi akademik diatur dalam peraturan akademik universitas.", source: { href: "/regulasi-akademik", label: "Regulasi Akademik" } },

  // Magang & Karier
  { slug: "mulai-magang", drawer: "karier", personas: ["mahasiswa", "mitra"], q: "Di semester berapa mahasiswa magang?", a: "Jadwal, syarat, dan alur pendaftaran magang dijelaskan di halaman Magang, termasuk logbook yang harus diisi.", source: { href: "/magang", label: "Magang" } },
  { slug: "magang-sendiri", drawer: "karier", personas: ["mahasiswa"], q: "Boleh mencari tempat magang sendiri?", a: "Boleh, asalkan perusahaannya disetujui prodi sebelum magang dimulai. Mitra yang sudah bekerja sama juga terbuka untuk dipilih.", source: { href: "/magang", label: "Magang" } },
  { slug: "rekrut-lulusan", drawer: "karier", personas: ["mitra"], q: "Perusahaan kami ingin merekrut lulusan.", a: "Sampaikan kebutuhannya ke koordinator kerja sama. Profil kompetensi lulusan bisa dicek lebih dulu agar posisinya tepat.", source: { href: "/profil-lulusan", label: "Profil Lulusan" } },

  // Kampus & Prodi
  { slug: "lokasi-kuliah", drawer: "kampus", personas: ["camaba", "ortu", "mitra"], q: "Di mana perkuliahan berlangsung?", a: "Di kampus UISI, kompleks PT Semen Indonesia, Gresik. Rute dan peta ada di halaman Kontak.", source: { href: "/kontak#lokasi", label: "Kontak" } },
  { slug: "pengelola-prodi", drawer: "kampus", personas: ["mahasiswa", "ortu", "mitra"], q: "Siapa saja pengelola prodi?", a: "Kaprodi, sekretaris, dan koordinator tiap bidang tercantum di bagan struktur organisasi.", source: { href: "/struktur-organisasi", label: "Struktur Organisasi" } },
  { slug: "kabar-prodi", drawer: "kampus", personas: ["camaba", "mahasiswa", "ortu"], q: "Di mana mengikuti agenda terbaru prodi?", a: "Pengumuman resmi dan liputan kegiatan dimuat di Warta. Kabar harian lebih dulu muncul di media sosial prodi.", source: { href: "/berita", label: "Warta" } },
].map((c) => ({ ...c, sample: true }));

const str = (v) => (typeof v === "string" ? v.trim() : "");
const parse = (v) => {
  if (!v) return {};
  try {
    return typeof v === "string" ? JSON.parse(v) : v;
  } catch {
    return {};
  }
};
const personasOf = (v, fb) => (Array.isArray(v) && v.length ? v.filter((p) => PERSONAS.some((x) => x.key === p)) : fb);

/** Nomor panggil kartu: FAQ·PMB·01 (urut di dalam lacinya). */
function withCallNo(cards) {
  const seen = {};
  return cards.map((c) => {
    const d = DRAWERS.find((x) => x.key === c.drawer) ?? DRAWERS[0];
    seen[d.key] = (seen[d.key] ?? 0) + 1;
    return { ...c, drawer: d.key, callNo: `FAQ·${d.code}·${String(seen[d.key]).padStart(2, "0")}` };
  });
}

export function mergeFaq(row) {
  const data = parse(row?.data);
  const overrides = Array.isArray(data.cards) ? data.cards : [];
  const base = CARDS.map((c) => {
    const o = overrides.find((x) => x?.slug === c.slug);
    if (!o) return c;
    const a = str(o.a);
    return { ...c, q: str(o.q) || c.q, a: a || c.a, personas: personasOf(o.personas, c.personas), sample: !a && c.sample };
  });
  const extra = (Array.isArray(data.extra) ? data.extra : [])
    .filter((x) => str(x?.q) && str(x?.a) && str(x?.slug) && !base.some((c) => c.slug === x.slug))
    .map((x) => ({
      slug: str(x.slug),
      drawer: DRAWERS.some((d) => d.key === x.drawer) ? x.drawer : DRAWERS[0].key,
      personas: personasOf(x.personas, PERSONAS.slice(1).map((p) => p.key)),
      q: str(x.q),
      a: str(x.a),
      source: str(x.source?.href) ? { href: str(x.source.href), label: str(x.source.label) || "Selengkapnya", external: /^https?:/.test(x.source.href) } : null,
      sample: false,
    }));
  const cards = withCallNo(DRAWERS.flatMap((d) => [...base, ...extra].filter((c) => c.drawer === d.key)));
  const body = str(row?.content);
  return { intro: { body: body.length > 40 ? body : INTRO.body }, drawers: DRAWERS, personas: PERSONAS, cards };
}

/** Pencocokan longgar: semua kata kunci harus muncul di pertanyaan/jawaban/laci (tanpa peduli huruf & aksen). */
export const fold = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
export function matches(card, query, drawerLabel = "") {
  const words = fold(query).split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return true;
  const hay = fold(`${card.q} ${card.a} ${drawerLabel} ${card.source?.label ?? ""}`);
  return words.every((w) => hay.includes(w));
}
