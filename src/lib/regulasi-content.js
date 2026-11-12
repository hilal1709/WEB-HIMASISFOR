/**
 * Konten halaman Regulasi Akademik (`/regulasi-akademik`).
 * Total SKS & lama studi normal diturunkan dari kurikulum (`mergeKurikulum`) — tidak ditulis ulang.
 * Tahapan tugas akhir TIDAK dibahas di sini (sudah ada di `/jalur-kelulusan`); pasal kelulusan hanya menaut ke sana.
 *
 * CMS `PageContent` section `regulasi-akademik`:
 *   data.intro          → paragraf intro hero
 *   data.version        → mis. "2026/2027"
 *   data.chapters[]     → ditimpa per `key` (beban/nilai/hadir/status/evaluasi/etika; mengisi `pasal` menghapus tanda contoh)
 *   data.scenarios[]    → ditimpa per `key`
 *   data.docs[]         → ditimpa per `key` (isi `href` = URL PDF resmi)
 *   data.notice         → { title, body } untuk banner
 * Semua angka aturan di bawah adalah CONTOH (`sample`) → tampil dengan PlaceholderTag.
 */

export const CURTAIN_KEY = "sisfor:curtain:regulasi-akademik";
export const BANNER_KEY = "sisfor:banner:regulasi-akademik";
export const MARKS_KEY = "sisfor:regulasi:tandai";
export const DOCS_CHECK_KEY = "sisfor:regulasi:berkas:";

export const INTRO = {
  body: "Batas SKS, cara nilai dihitung, kapan boleh cuti, sampai apa yang terjadi bila IPS turun. Cari pasalnya, baca versi bahasa sehari-harinya, lalu coba angkamu sendiri.",
};

/** Istilah yang diberi garis bawah emas + definisi singkat di pembaca pasal. */
export const TERMS = {
  SKS: "Satuan Kredit Semester. Satu SKS kuliah setara ±170 menit kegiatan belajar per minggu.",
  KRS: "Kartu Rencana Studi: daftar mata kuliah yang kamu ambil di satu semester, disetujui dosen wali.",
  IPS: "Indeks Prestasi Semester: rata-rata bobot nilai di satu semester, ditimbang dengan SKS.",
  IPK: "Indeks Prestasi Kumulatif: rata-rata bobot seluruh mata kuliah yang sudah ditempuh.",
  "dosen wali": "Dosen yang mendampingi rencana studimu sejak semester pertama sampai lulus.",
  BAAK: "Biro Administrasi Akademik dan Kemahasiswaan, pengelola status dan dokumen akademik.",
  yudisium: "Rapat penetapan kelulusan dan predikat sebelum wisuda.",
};

/** Huruf mutu — urutan tertinggi → terendah (tangga nilai simulator). */
export const GRADES = [
  { letter: "A", min: 85, weight: 4.0 },
  { letter: "AB", min: 78, weight: 3.5 },
  { letter: "B", min: 70, weight: 3.0 },
  { letter: "BC", min: 63, weight: 2.5 },
  { letter: "C", min: 55, weight: 2.0 },
  { letter: "D", min: 40, weight: 1.0 },
  { letter: "E", min: 0, weight: 0 },
];

/** IPS semester lalu → batas SKS semester depan (urut dari ambang tertinggi). */
export const SKS_RULES = [
  { min: 3.0, sks: 24 },
  { min: 2.5, sks: 21 },
  { min: 2.0, sks: 18 },
  { min: 0, sks: 15 },
];

/** IPK lulusan → predikat (urut dari ambang tertinggi). `onTime` = syarat masa studi normal. */
export const PREDIKAT = [
  { min: 3.51, label: "Dengan pujian", onTime: true },
  { min: 3.01, label: "Sangat memuaskan" },
  { min: 2.76, label: "Memuaskan" },
  { min: 2.0, label: "Lulus" },
];

export const gradeFor = (score) => GRADES.find((g) => score >= g.min) ?? GRADES[GRADES.length - 1];
export const sksFor = (ips) => (SKS_RULES.find((r) => ips >= r.min) ?? SKS_RULES[SKS_RULES.length - 1]).sks;
export function predikatFor(ipk, onTime) {
  if (ipk < 2) return null;
  const hit = PREDIKAT.find((p) => ipk >= p.min && (!p.onTime || onTime));
  return hit ?? PREDIKAT[PREDIKAT.length - 1];
}

/**
 * Enam bab. Tiap pasal: `formal` (bahasa pedoman) & `plain` (bahasa sehari-hari), `tags` untuk pencarian,
 * opsional `sim` (sks/nilai/predikat → tuas simulator) dan `link`.
 * Token {sks} {semester} {maxSemester} diisi dari kurikulum saat merge.
 */
export const CHAPTERS = [
  {
    key: "beban",
    roman: "I",
    title: "Beban studi & KRS",
    pasal: [
      {
        no: "1.1",
        title: "Beban dan lama studi",
        formal: "Program sarjana Sistem Informasi memiliki beban {sks} SKS yang dirancang untuk ditempuh dalam {semester} semester, dengan batas masa studi paling lama {maxSemester} semester.",
        plain: "Kamu perlu mengumpulkan {sks} SKS. Normalnya selesai dalam {semester} semester, dan paling lambat {maxSemester} semester.",
        tags: ["masa studi", "lama kuliah", "total sks"],
      },
      {
        no: "1.2",
        title: "Pengisian KRS",
        formal: "Mahasiswa wajib mengisi KRS pada masa yang ditetapkan kalender akademik dan memperoleh persetujuan dosen wali. Mahasiswa yang tidak mengisi KRS tanpa izin dinyatakan tidak aktif pada semester tersebut.",
        plain: "Isi KRS tepat waktu dan minta dosen wali menyetujuinya. Lupa mengisi berarti kamu dianggap tidak aktif semester itu.",
        tags: ["krs", "terlambat", "tidak aktif", "perwalian"],
      },
      {
        no: "1.3",
        title: "Batas SKS per semester",
        formal: "Jumlah SKS yang dapat diambil ditentukan oleh IPS semester sebelumnya. Semester pertama dan kedua mengikuti paket yang ditetapkan program studi.",
        plain: "Makin tinggi IPS-mu, makin banyak SKS yang boleh kamu ambil semester depan. Dua semester pertama sudah dipaketkan.",
        tags: ["batas sks", "maksimal sks", "ips"],
        sim: "sks",
      },
      {
        no: "1.4",
        title: "Batal dan tambah mata kuliah",
        formal: "Perubahan KRS dapat dilakukan paling lambat dua minggu setelah perkuliahan dimulai, dengan persetujuan dosen wali.",
        plain: "Salah ambil mata kuliah? Kamu masih bisa menukarnya sampai minggu kedua kuliah.",
        tags: ["batal tambah", "ganti matkul", "drop"],
      },
    ],
  },
  {
    key: "nilai",
    roman: "II",
    title: "Penilaian & indeks prestasi",
    pasal: [
      {
        no: "2.1",
        title: "Huruf mutu dan bobot",
        formal: "Nilai akhir mata kuliah dinyatakan dalam huruf mutu A, AB, B, BC, C, D, dan E, masing-masing dengan bobot 4,00 sampai 0. Mata kuliah dinyatakan lulus dengan nilai paling rendah C.",
        plain: "Nilai angkamu diubah jadi huruf. Minimal C supaya mata kuliahnya dianggap lulus.",
        tags: ["nilai", "huruf mutu", "bobot", "nilai e", "nilai d", "lulus matkul"],
        sim: "nilai",
      },
      {
        no: "2.2",
        title: "Menghitung IPS dan IPK",
        formal: "IPS dan IPK dihitung dari jumlah perkalian bobot nilai dengan SKS dibagi jumlah SKS yang ditempuh.",
        plain: "Kalikan bobot tiap nilai dengan SKS-nya, jumlahkan, lalu bagi dengan total SKS. Mata kuliah ber-SKS besar paling berpengaruh.",
        tags: ["ips", "ipk", "rumus", "hitung"],
      },
      {
        no: "2.3",
        title: "Mengulang mata kuliah",
        formal: "Mahasiswa dapat menempuh ulang mata kuliah yang telah diambil. Nilai yang digunakan dalam perhitungan IPK adalah nilai terbaik.",
        plain: "Boleh mengulang untuk memperbaiki nilai. Yang dihitung nilai terbaikmu, bukan yang terakhir.",
        tags: ["mengulang", "perbaikan nilai", "remedial"],
      },
      {
        no: "2.4",
        title: "Keberatan atas nilai",
        formal: "Keberatan atas nilai diajukan kepada dosen pengampu paling lambat tiga hari kerja setelah nilai diumumkan, dengan tembusan kepada koordinator program studi.",
        plain: "Merasa nilainya keliru? Sampaikan ke dosen dalam tiga hari kerja sejak nilai keluar.",
        tags: ["protes nilai", "keberatan", "salah nilai"],
      },
    ],
  },
  {
    key: "hadir",
    roman: "III",
    title: "Kehadiran & ujian",
    pasal: [
      {
        no: "3.1",
        title: "Syarat kehadiran",
        formal: "Mahasiswa berhak mengikuti ujian akhir semester apabila kehadirannya paling sedikit 80% dari pertemuan yang dilaksanakan.",
        plain: "Hadir minimal 80% pertemuan, atau kamu tidak boleh ikut UAS mata kuliah itu.",
        tags: ["absen", "presensi", "kehadiran", "uas"],
      },
      {
        no: "3.2",
        title: "Ujian susulan",
        formal: "Ujian susulan diberikan kepada mahasiswa yang berhalangan karena sakit, musibah, atau tugas institusi, dengan bukti sah yang diajukan paling lambat tiga hari kerja setelah ujian.",
        plain: "Sakit atau ada musibah saat ujian? Ajukan susulan dengan bukti dalam tiga hari kerja.",
        tags: ["susulan", "sakit", "izin ujian"],
      },
      {
        no: "3.3",
        title: "Tata tertib ujian",
        formal: "Peserta ujian wajib membawa kartu tanda mahasiswa, hadir sebelum ujian dimulai, dan dilarang menggunakan bahan atau perangkat yang tidak diizinkan pengawas.",
        plain: "Bawa KTM, datang sebelum mulai, dan jangan membuka apa pun yang tidak diizinkan pengawas.",
        tags: ["ujian", "ktm", "menyontek", "pengawas"],
      },
    ],
  },
  {
    key: "status",
    roman: "IV",
    title: "Cuti & status mahasiswa",
    pasal: [
      {
        no: "4.1",
        title: "Cuti akademik",
        formal: "Mahasiswa dapat mengajukan cuti akademik paling lama dua semester selama masa studi. Masa cuti tidak diperhitungkan dalam batas masa studi. Permohonan diajukan sebelum masa pengisian KRS.",
        plain: "Kamu boleh cuti total dua semester. Waktunya tidak memotong jatah masa studi, asal diajukan sebelum KRS dibuka.",
        tags: ["cuti", "berhenti sementara", "rehat"],
      },
      {
        no: "4.2",
        title: "Mahasiswa tidak aktif",
        formal: "Mahasiswa yang tidak mengisi KRS dan tidak mengajukan cuti dinyatakan tidak aktif. Semester tidak aktif diperhitungkan dalam masa studi.",
        plain: "Menghilang tanpa cuti tetap menghabiskan jatah semestermu.",
        tags: ["tidak aktif", "mangkir", "status"],
      },
      {
        no: "4.3",
        title: "Aktif kembali",
        formal: "Mahasiswa yang selesai cuti atau tidak aktif wajib mengajukan aktif kembali kepada BAAK sebelum masa pengisian KRS semester berikutnya.",
        plain: "Selesai cuti, lapor ke BAAK dulu supaya bisa mengisi KRS lagi.",
        tags: ["aktif kembali", "kembali kuliah"],
      },
      {
        no: "4.4",
        title: "Pindah dan mengundurkan diri",
        formal: "Mahasiswa yang pindah program studi atau mengundurkan diri mengajukan permohonan tertulis disertai bukti bebas tanggungan akademik dan keuangan.",
        plain: "Mau pindah prodi atau berhenti? Ajukan tertulis dan selesaikan tanggunganmu dulu.",
        tags: ["pindah prodi", "keluar", "mengundurkan diri"],
      },
    ],
  },
  {
    key: "evaluasi",
    roman: "V",
    title: "Evaluasi studi & kelulusan",
    pasal: [
      {
        no: "5.1",
        title: "Evaluasi tahun pertama",
        formal: "Pada akhir semester kedua, mahasiswa harus telah lulus paling sedikit 20 SKS dengan IPK paling rendah 2,00.",
        plain: "Setelah dua semester, minimal 20 SKS harus lulus dan IPK-mu tidak di bawah 2,00.",
        tags: ["evaluasi", "tahun pertama", "do", "drop out"],
      },
      {
        no: "5.2",
        title: "Peringatan akademik",
        formal: "Mahasiswa dengan IPS di bawah 2,00 menerima peringatan tertulis. Peringatan pada dua semester berturut-turut ditindaklanjuti dengan pembinaan khusus oleh dosen wali dan koordinator program studi.",
        plain: "IPS di bawah 2,00 memunculkan surat peringatan. Dua kali berturut-turut, kamu akan didampingi lebih dekat.",
        tags: ["peringatan", "ips rendah", "sp", "pembinaan"],
      },
      {
        no: "5.3",
        title: "Batas akhir masa studi",
        formal: "Mahasiswa yang belum menyelesaikan studi sampai batas {maxSemester} semester dinyatakan tidak dapat melanjutkan studi.",
        plain: "Lewat {maxSemester} semester tanpa lulus, studimu dihentikan.",
        tags: ["batas studi", "kadaluarsa", "do"],
      },
      {
        no: "5.4",
        title: "Kelulusan dan predikat",
        formal: "Mahasiswa dinyatakan lulus dalam yudisium setelah menempuh seluruh beban studi dengan IPK paling rendah 2,00. Predikat dengan pujian hanya diberikan bila masa studi tidak melebihi {semester} semester.",
        plain: "Semua SKS beres dan IPK minimal 2,00, kamu lulus. Predikat tertinggi butuh lulus tepat waktu.",
        tags: ["lulus", "predikat", "cumlaude", "yudisium", "wisuda"],
        sim: "predikat",
        link: { href: "/jalur-kelulusan", label: "Pilihan jalur tugas akhir" },
      },
    ],
  },
  {
    key: "etika",
    roman: "VI",
    title: "Etika akademik & sanksi",
    pasal: [
      {
        no: "6.1",
        title: "Kejujuran akademik",
        formal: "Pelanggaran kejujuran akademik meliputi plagiarisme, menyontek, perjokian, pemalsuan data atau dokumen, dan menitipkan presensi.",
        plain: "Menjiplak, menyontek, memakai joki, memalsukan data, dan titip absen semuanya pelanggaran.",
        tags: ["plagiat", "plagiarisme", "joki", "titip absen", "menyontek", "ai"],
      },
      {
        no: "6.2",
        title: "Tingkat sanksi",
        formal: "Sanksi dijatuhkan berjenjang sesuai berat pelanggaran: teguran tertulis, pembatalan nilai mata kuliah, skorsing paling lama dua semester, hingga pemberhentian sebagai mahasiswa.",
        plain: "Hukumannya bertingkat: dari teguran, nilai dibatalkan, skorsing, sampai dikeluarkan.",
        tags: ["sanksi", "skorsing", "hukuman"],
      },
      {
        no: "6.3",
        title: "Hak membela diri",
        formal: "Mahasiswa yang diduga melanggar berhak memperoleh pemberitahuan tertulis, menyampaikan pembelaan kepada komisi etik, dan mengajukan banding atas keputusan.",
        plain: "Dituduh melanggar? Kamu berhak tahu tuduhannya, membela diri, dan banding.",
        tags: ["banding", "pembelaan", "komisi etik", "dituduh"],
      },
    ],
  },
];

/** "Kalau terjadi…" — prosedur nyata yang sering ditanyakan. `ref` = nomor pasal rujukan. */
export const SCENARIOS = [
  {
    key: "sakit-ujian",
    title: "Aku sakit saat ujian",
    deadline: "3 hari kerja setelah ujian",
    to: "Sekretariat program studi",
    ref: "3.2",
    steps: ["Kabari dosen pengampu di hari ujian", "Minta surat keterangan dokter", "Ajukan formulir ujian susulan", "Ikuti jadwal susulan yang diberikan"],
    files: ["Surat keterangan dokter", "Formulir ujian susulan", "Fotokopi KTM"],
    message: "Selamat pagi, Bapak/Ibu. Saya {nama} ({nim}) tidak dapat mengikuti ujian {matkul} hari ini karena sakit. Surat keterangan dokter akan saya serahkan bersama permohonan ujian susulan. Terima kasih.",
  },
  {
    key: "cuti",
    title: "Aku perlu cuti semester depan",
    deadline: "Sebelum masa KRS dibuka",
    to: "BAAK, dengan persetujuan dosen wali",
    ref: "4.1",
    steps: ["Diskusikan rencana dengan dosen wali", "Selesaikan tanggungan keuangan", "Serahkan formulir cuti ke BAAK", "Simpan surat keputusan cuti"],
    files: ["Formulir cuti bertanda tangan dosen wali", "Surat persetujuan orang tua/wali", "Bukti bebas tanggungan keuangan"],
    message: "Selamat siang, Bapak/Ibu. Saya {nama} ({nim}) ingin berkonsultasi tentang rencana cuti akademik semester depan. Apakah Bapak/Ibu berkenan menentukan waktu perwalian? Terima kasih.",
  },
  {
    key: "ips-rendah",
    title: "IPS-ku di bawah 2,00",
    deadline: "Sebelum KRS semester berikutnya",
    to: "Dosen wali",
    ref: "5.2",
    steps: ["Cek batas SKS semester depan", "Susun rencana studi bersama dosen wali", "Dahulukan mengulang nilai D dan E", "Pantau IPS di akhir semester"],
    files: ["Transkrip sementara", "Draf rencana studi"],
    message: "Selamat pagi, Bapak/Ibu. Saya {nama} ({nim}). IPS saya semester ini di bawah 2,00 dan saya ingin menyusun rencana studi yang lebih realistis. Kapan saya bisa menemui Bapak/Ibu? Terima kasih.",
  },
  {
    key: "telat-krs",
    title: "Aku terlambat mengisi KRS",
    deadline: "Sebelum masa batal-tambah berakhir",
    to: "Dosen wali, lalu BAAK",
    ref: "1.2",
    steps: ["Hubungi dosen wali hari itu juga", "Ajukan permohonan KRS susulan ke BAAK", "Pastikan KRS tervalidasi di sistem"],
    files: ["Surat permohonan KRS susulan", "Bukti pembayaran UKT"],
    message: "Selamat pagi, Bapak/Ibu. Saya {nama} ({nim}) terlambat mengisi KRS karena {alasan}. Mohon arahan agar saya dapat mengajukan KRS susulan. Terima kasih.",
  },
  {
    key: "plagiasi",
    title: "Tugasku dituduh plagiat",
    deadline: "Sesuai surat pemberitahuan",
    to: "Komisi etik program studi",
    ref: "6.3",
    steps: ["Minta pemberitahuan tertulis dan buktinya", "Kumpulkan draf, riwayat versi, dan sumber", "Sampaikan pembelaan ke komisi etik", "Ajukan banding bila keputusan dirasa keliru"],
    files: ["Draf dan riwayat versi tugas", "Daftar sumber yang dikutip", "Surat pembelaan"],
    message: "Selamat siang, Bapak/Ibu. Saya {nama} ({nim}) menerima informasi dugaan plagiarisme pada tugas {matkul}. Mohon saya dapat menerima rincian temuannya agar dapat menyiapkan klarifikasi. Terima kasih.",
  },
];

/** Rak dokumen. `href` kosong = berkas resmi menyusul. `toc: "chapters"` = daftar isi diambil dari CHAPTERS. */
export const DOCS = [
  { key: "pedoman", title: "Pedoman Akademik", short: "Pedoman", tone: "maroon", pages: 64, size: "3,2 MB", toc: "chapters", href: "" },
  { key: "etika", title: "Kode Etik Mahasiswa", short: "Kode Etik", tone: "navy", pages: 18, size: "0,9 MB", toc: ["Nilai yang dijunjung", "Kejujuran akademik", "Perilaku di kampus dan daring", "Prosedur pelaporan", "Sanksi dan banding"], href: "" },
  { key: "panduan-ta", title: "Panduan Penulisan Tugas Akhir", short: "Panduan TA", tone: "gold", pages: 42, size: "2,1 MB", toc: ["Sistematika naskah", "Format dan tata letak", "Kutipan dan daftar pustaka", "Lembar pengesahan", "Unggah repositori"], href: "" },
  { key: "kalender", title: "Kalender Akademik", short: "Kalender", tone: "ivory", pages: 2, size: "0,4 MB", toc: ["Masa KRS dan batal-tambah", "Perkuliahan dan ujian", "Pengumuman nilai", "Periode sidang dan yudisium"], href: "" },
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

const fill = (s, vars) => String(s ?? "").replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
const byKey = (list, key) => (Array.isArray(list) ? list.find((x) => x?.key === key) : null) ?? {};

/**
 * Gabungkan CMS ke fallback.
 * @param row        PageContent `regulasi-akademik` (boleh null)
 * @param kurikulum  hasil mergeKurikulum — total SKS & jumlah semester
 */
export function mergeRegulasi(row, { kurikulum } = {}) {
  const raw = parse(row?.data) ?? {};
  const sks = kurikulum?.totals?.sks || 144;
  const semester = kurikulum?.semesters?.length || 8;
  const vars = { sks, semester, maxSemester: semester + 6 };

  const chapters = CHAPTERS.map((c, ci) => {
    const o = byKey(raw.chapters, c.key);
    const list = Array.isArray(o.pasal) && o.pasal.length ? o.pasal : c.pasal;
    return {
      ...c,
      ...o,
      key: c.key,
      index: ci,
      sample: !(Array.isArray(o.pasal) && o.pasal.length),
      pasal: list.map((p) => ({ ...p, id: String(p.no).replace(/\./g, "-"), chapter: c.key, formal: fill(p.formal, vars), plain: fill(p.plain, vars) })),
    };
  });

  const scenarios = SCENARIOS.map((s) => {
    const o = byKey(raw.scenarios, s.key);
    return { ...s, ...o, key: s.key, sample: !Object.keys(o).length };
  });

  const docs = DOCS.map((d) => {
    const o = byKey(raw.docs, d.key);
    return { ...d, ...o, key: d.key, tone: d.tone, sample: !o.href };
  });

  const version = typeof raw.version === "string" && raw.version.trim() ? raw.version.trim() : "2026/2027";
  const body = typeof raw.intro === "string" ? raw.intro.trim() : "";
  const n = raw.notice;
  const notice =
    n && typeof n.title === "string" && n.title.trim()
      ? { title: n.title.trim(), body: String(n.body ?? "").trim(), sample: false }
      : { title: `Pedoman Akademik ${version} berlaku mulai semester ganjil`, body: "Batas SKS kini mengikuti IPS semester sebelumnya, dan cuti akademik wajib diajukan sebelum KRS dibuka.", sample: true };

  return {
    intro: { body: body.length > 40 ? body : INTRO.body },
    version,
    vars,
    chapters,
    scenarios,
    docs,
    notice,
    pasalCount: chapters.reduce((t, c) => t + c.pasal.length, 0),
  };
}
