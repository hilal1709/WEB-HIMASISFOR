/**
 * Konten halaman Jalur Kelulusan (`/jalur-kelulusan`).
 * SKS & semester mata kuliah tugas akhir dan prasyarat "Metode Penelitian" diturunkan dari kurikulum
 * (`mergeKurikulum`); tanggal sidang dari agenda beranda (`AGENDA`) — tidak ditulis ulang.
 *
 * CMS `PageContent` section `jalur-kelulusan`:
 *   data.intro          → paragraf intro hero
 *   data.paths[]        → ditimpa per `key` (skripsi/lomba/pkm/bisnis; field apa pun di PATHS —
 *                         mengisi `stages` atau `ready` menghapus tanda contoh)
 *   data.notice         → { title, body } untuk banner pengumuman
 * Tahapan, durasi, syarat, dan daftar kesiapan adalah CONTOH (`sample`) → tampil dengan PlaceholderTag.
 */
import { AGENDA } from "@/lib/home-content";

export const CURTAIN_KEY = "sisfor:curtain:jalur-kelulusan";
export const BANNER_KEY = "sisfor:banner:jalur-kelulusan";
export const READY_KEY = "sisfor:kesiapan:";

export const INTRO = {
  body: "Enam SKS terakhirmu tidak harus berupa skripsi. Juara lomba, hibah PKM, atau usaha yang benar-benar berjalan juga bisa mengantarmu ke sidang. Kenali tahapannya, lalu ukur kesiapanmu.",
};

/** Urutan = urutan cabang ilustrasi (kiri → kanan) dan bab scrollytelling. */
export const PATHS = [
  {
    key: "skripsi",
    title: "Skripsi",
    lottie: "/lottie/thesis-book-dark.json",
    oneLiner: "Satu pertanyaan riset, dijawab tuntas, lalu dipertahankan di depan penguji.",
    forWho: "Kamu yang betah menggali satu masalah dalam-dalam, atau berencana lanjut S2.",
    output: "Naskah skripsi dan artikel ilmiah",
    duration: "± 1 semester",
    mentor: "1 pembimbing utama + 1 pendamping",
    risk: "Paling bergantung pada disiplin pribadi. Jadwal mudah molor bila data dari organisasi sulit didapat.",
    stages: [
      { name: "Topik & pembimbing", time: "Minggu 1–3", output: "Usulan topik satu halaman disetujui", needs: ["Lulus Metode Penelitian & Penulisan Ilmiah", "Formulir pengajuan topik", "Persetujuan calon pembimbing"] },
      { name: "Seminar proposal", time: "Minggu 4–8", output: "Bab 1–3 lolos seminar", needs: ["Draf Bab 1–3", "Minimal 4 kali bimbingan tercatat", "Hadir di dua seminar proposal lain"] },
      { name: "Riset & penulisan", time: "Minggu 9–17", output: "Draf lengkap Bab 4–5", needs: ["Surat izin pengambilan data", "Log bimbingan diperbarui", "Cek kemiripan naskah"] },
      { name: "Sidang", time: "Minggu 18–19", output: "Dinyatakan lulus oleh tim penguji", needs: ["Naskah final ditandatangani pembimbing", "Bebas tanggungan laboratorium & perpustakaan", "Pendaftaran sidang"] },
      { name: "Revisi & unggah", time: "Minggu 20", output: "Naskah final di repositori kampus", needs: ["Lembar revisi ditandatangani penguji", "Artikel siap kirim ke jurnal"] },
    ],
    ready: ["Sudah lulus Metode Penelitian & Penulisan Ilmiah", "Punya satu masalah nyata yang ingin dijawab", "Tahu dari mana datanya akan didapat", "Sudah bicara dengan calon pembimbing", "Bisa menyisihkan 10 jam per minggu untuk menulis"],
    sample: true,
  },
  {
    key: "lomba",
    title: "Lomba",
    lottie: "/lottie/trophy-dark.json",
    oneLiner: "Capaian di kompetisi bidang SI direkognisi sebagai tugas akhir.",
    forWho: "Kamu yang terbiasa bekerja dalam tim, cepat, dan di bawah tenggat.",
    output: "Laporan teknis dan bukti capaian",
    duration: "Mengikuti kalender lomba",
    mentor: "1 dosen pembina tim",
    risk: "Hasil tidak bisa dijamin. Bila tidak mencapai peringkat yang diakui, kamu beralih ke skripsi dengan sisa waktu lebih sedikit.",
    stages: [
      { name: "Pilih lomba yang diakui", time: "Sebelum pendaftaran lomba", output: "Lomba masuk daftar rekognisi prodi", needs: ["Lomba tingkat nasional atau internasional", "Tema relevan dengan SI", "Tim dan dosen pembina terbentuk"] },
      { name: "Ajukan rekognisi", time: "Paling lambat saat mendaftar", output: "Surat persetujuan rekognisi", needs: ["Panduan dan jadwal lomba", "Rencana karya tim", "Persetujuan dosen pembina"] },
      { name: "Bertanding", time: "Sesuai jadwal lomba", output: "Karya dikirim dan dipresentasikan", needs: ["Bimbingan rutin dengan pembina", "Dokumentasi proses pengerjaan"] },
      { name: "Bukti capaian", time: "Setelah pengumuman", output: "Sertifikat juara atau finalis", needs: ["Sertifikat resmi penyelenggara", "Tautan pengumuman pemenang"] },
      { name: "Sidang rekognisi", time: "Periode sidang terdekat", output: "Nilai tugas akhir dikonversi", needs: ["Laporan teknis karya", "Presentasi kontribusi pribadi dalam tim"] },
    ],
    ready: ["Sudah punya tim dengan peran yang jelas", "Menemukan lomba bidang SI yang masih buka", "Punya dosen yang bersedia membina", "Pernah ikut lomba sebelumnya", "Siap beralih ke skripsi bila hasil tidak sesuai"],
    sample: true,
  },
  {
    key: "pkm",
    title: "PKM",
    lottie: "/lottie/pkm-bulb-dark.json",
    oneLiner: "Gagasan tim didanai hibah Program Kreativitas Mahasiswa, lalu dijalankan sampai berluaran.",
    forWho: "Kamu yang ingin gagasannya dipakai orang, dengan dana dan pendampingan dari luar kampus.",
    output: "Laporan akhir dan luaran PKM",
    duration: "± 5 bulan pendanaan",
    mentor: "1 dosen pendamping PKM",
    risk: "Kalender mengikuti jadwal penyelenggara nasional, bukan semester kampus. Proposal yang tidak didanai harus menunggu tahun berikutnya.",
    stages: [
      { name: "Gagasan & tim", time: "Awal tahun ajaran", output: "Tim 3–5 orang dengan satu gagasan", needs: ["Skema PKM yang dipilih", "Dosen pendamping bersedia"] },
      { name: "Proposal", time: "Sesuai jadwal nasional", output: "Proposal terunggah", needs: ["Proposal sesuai pedoman PKM tahun berjalan", "Rencana anggaran", "Lolos seleksi internal kampus"] },
      { name: "Pelaksanaan", time: "± 5 bulan", output: "Kegiatan berjalan sesuai rencana", needs: ["Logbook kegiatan", "Laporan kemajuan", "Laporan penggunaan dana"] },
      { name: "Laporan & luaran", time: "Akhir pendanaan", output: "Artikel, prototipe, atau HKI", needs: ["Laporan akhir", "Bukti luaran"] },
      { name: "Sidang luaran", time: "Periode sidang terdekat", output: "Nilai tugas akhir dikonversi", needs: ["Presentasi hasil dan kontribusi pribadi"] },
    ],
    ready: ["Punya gagasan untuk masalah di masyarakat atau industri", "Timnya sudah lengkap", "Tahu skema PKM yang paling cocok", "Punya dosen pendamping", "Siap mengikuti kalender nasional"],
    sample: true,
  },
  {
    key: "bisnis",
    title: "Bisnis",
    lottie: "/lottie/biz-shop-dark.json",
    oneLiner: "Usaha berbasis sistem informasi yang sudah melayani pelanggan sungguhan.",
    forWho: "Kamu yang sudah berjualan, atau punya produk digital yang ingin dibuktikan pasarnya.",
    output: "Laporan bisnis dan produk yang berjalan",
    duration: "Minimal 3 bulan beroperasi",
    mentor: "1 dosen + mentor praktisi",
    risk: "Penguji menilai bukti traksi seperti pelanggan, transaksi, dan pembukuan, bukan sekadar rencana usaha.",
    stages: [
      { name: "Validasi ide", time: "Bulan 1", output: "Masalah pelanggan terbukti ada", needs: ["Wawancara calon pelanggan", "Ringkasan temuan"] },
      { name: "Model bisnis & MVP", time: "Bulan 1–2", output: "Produk minimum siap dipakai", needs: ["Business model canvas", "MVP yang bisa dicoba"] },
      { name: "Beroperasi", time: "Bulan 2–5", output: "Pelanggan dan transaksi tercatat", needs: ["Pembukuan sederhana", "Data penggunaan produk", "Catatan iterasi"] },
      { name: "Laporan bisnis", time: "Bulan 5", output: "Laporan dan pitch deck", needs: ["Analisis kinerja usaha", "Rencana pengembangan"] },
      { name: "Sidang pitching", time: "Periode sidang terdekat", output: "Dinyatakan lulus oleh panel", needs: ["Demo produk", "Bukti traksi"] },
    ],
    ready: ["Sudah punya produk atau jasa yang bisa dijual", "Pernah mendapat pelanggan pertama", "Mencatat transaksi dengan rapi", "Punya mentor praktisi atau inkubator", "Siap memperlihatkan angka usaha ke penguji"],
    sample: true,
  },
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

/** Sidang berikutnya dari agenda beranda (contoh, sampai modul agenda ada di CMS). */
function nextDefense() {
  const a = AGENDA.find((x) => /sidang/i.test(x.title));
  return a ? { day: a.day, month: a.month, place: a.place, title: a.title } : null;
}

/**
 * Gabungkan CMS ke fallback.
 * @param row        PageContent `jalur-kelulusan` (boleh null)
 * @param kurikulum  hasil mergeKurikulum — mata kuliah tugas akhir & prasyarat
 */
export function mergeJalur(row, { kurikulum } = {}) {
  const raw = parse(row?.data);
  const items = Array.isArray(raw?.paths) ? raw.paths : [];
  const courses = kurikulum?.courses ?? [];
  const thesis = courses.find((c) => /skripsi/i.test(c.nama)) ?? null;
  const method = courses.find((c) => /metode penelitian/i.test(c.nama)) ?? null;

  const paths = PATHS.map((p) => {
    const o = items.find((x) => x?.key === p.key) ?? {};
    const merged = { ...p, ...o, key: p.key, lottie: p.lottie };
    if (o.stages || o.ready) merged.sample = false;
    return merged;
  });

  const body = typeof raw?.intro === "string" ? raw.intro.trim() : "";
  const n = raw?.notice;
  const defense = nextDefense();
  const notice =
    n && typeof n.title === "string" && n.title.trim()
      ? { title: n.title.trim(), body: String(n.body ?? "").trim(), sample: false }
      : defense
        ? { title: `${defense.title}: ${Number(defense.day)} ${defense.month}`, body: `Berkas sidang diunggah paling lambat dua minggu sebelumnya. Sidang berlangsung di ${defense.place}.`, sample: true }
        : null;

  return {
    intro: { body: body && body.length > 40 ? body : INTRO.body },
    paths,
    thesis: thesis ? { nama: thesis.nama, sks: thesis.sks, semester: thesis.semester, slug: thesis.slug } : { nama: "Skripsi / Lomba / PKM / Bisnis", sks: 6, semester: 8, slug: null },
    method: method ? { nama: method.nama, slug: method.slug, semester: method.semester, rps: !!method.rps } : null,
    notice,
  };
}
