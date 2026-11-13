/**
 * Konten halaman Layanan Akademik (`/layanan-akademik`).
 * Pengajuan dikirim sungguhan ke model `ServiceRequest` (lihat `/api/layanan/*`) dan diproses staf di Admin › Kotak Masuk Layanan.
 * Prosedur yang sudah dijelaskan halaman lain (cuti, batas SKS, tahapan tugas akhir, konversi) tidak ditulis ulang — cukup ditautkan.
 *
 * CMS `PageContent` section `layanan-akademik` (Admin › Konten › Layanan Akademik):
 *   data.intro          → paragraf hero
 *   data.notice         → { title, body } untuk banner
 *   data.contact        → { email, whatsapp, room, building, map } (kosong = "menyusul")
 *   data.hours[]        → { day (0 = Minggu … 6 = Sabtu), open "08:00", close "15:30", rest ["12:00","13:00"]? }
 *   data.services[]     → ditimpa per `key` (title, lead, sla, channel, output, needs[], steps[]); mengisi `needs` menghapus tanda contoh
 * Daftar layanan, jam, ruang, dan SLA adalah CONTOH (`sample`) → tampil dengan PlaceholderTag.
 */

export const CURTAIN_KEY = "sisfor:curtain:layanan";
export const BANNER_KEY = "sisfor:banner:layanan";
export const CODES_KEY = "sisfor:layanan:kode";
export const DRAFT_KEY = "sisfor:layanan:draf";
export const NEEDS_KEY = "sisfor:layanan:syarat";

export const INTRO = {
  body: "Surat keterangan, persetujuan kaprodi, dan janji konsultasi diajukan dari sini. Isi sekali, simpan kodenya, lalu pantau sampai berkasmu siap.",
};

export const CATEGORIES = [
  { key: "surat", label: "Persuratan", note: "Dokumen resmi bertanda tangan prodi", lottie: "/lottie/stamp-dark.json" },
  { key: "persetujuan", label: "Persetujuan Kaprodi", note: "Izin dan pengesahan akademik", lottie: "/lottie/service-bell-dark.json" },
  { key: "konsultasi", label: "Konsultasi", note: "Janji temu tatap muka atau daring", lottie: "/lottie/calendar.json" },
];

export const CHANNELS = {
  daring: "Daring",
  loket: "Ambil di loket",
  temu: "Tatap muka",
};

const reason = { name: "keperluan", label: "Untuk keperluan apa?", type: "textarea", placeholder: "Contoh: syarat beasiswa daerah tahun 2026", required: true };

/** Katalog layanan. `sla` = hari kerja. `fields` = isian khusus di wizard (selain data diri). */
export const SERVICES = [
  // — Persuratan
  {
    key: "surat-aktif",
    category: "surat",
    title: "Surat Keterangan Aktif Kuliah",
    lead: "Bukti status mahasiswa aktif untuk beasiswa, tunjangan orang tua, atau keperluan instansi.",
    sla: 2,
    channel: "daring",
    output: "PDF bertanda tangan elektronik, dikirim ke email",
    needs: ["KRS semester berjalan sudah disetujui", "UKT semester berjalan lunas"],
    steps: ["Ajukan dari halaman ini", "Staf mencocokkan status di SIAKAD", "Kaprodi menandatangani", "PDF dikirim ke emailmu"],
    fields: [reason, { name: "bahasa", label: "Bahasa surat", type: "select", options: ["Indonesia", "Inggris"], required: true }],
    sample: true,
  },
  {
    key: "pengantar-kp",
    category: "surat",
    title: "Surat Pengantar Kerja Praktik",
    lead: "Surat permohonan resmi dari prodi untuk instansi tempat kamu melamar kerja praktik.",
    sla: 3,
    channel: "daring",
    output: "PDF bertanda tangan, ditujukan ke instansi",
    needs: ["Sudah memilih instansi dan posisi", "Nama penerima surat di instansi (HR / atasan)"],
    steps: ["Ajukan dengan data instansi", "Koordinator magang memeriksa", "Kaprodi menandatangani", "PDF dikirim ke emailmu"],
    fields: [
      { name: "instansi", label: "Nama instansi", type: "text", placeholder: "PT Semen Gresik", required: true },
      { name: "penerima", label: "Ditujukan kepada", type: "text", placeholder: "Manajer SDM", required: true },
      { name: "periode", label: "Rencana periode", type: "text", placeholder: "Juli – Agustus 2027", required: true },
    ],
    related: { href: "/magang", label: "Cari posisi di papan lowongan magang" },
    sample: true,
  },
  {
    key: "izin-penelitian",
    category: "surat",
    title: "Surat Izin Penelitian / Survei",
    lead: "Izin mengambil data atau menyebar kuesioner di organisasi untuk tugas akhir maupun mata kuliah.",
    sla: 3,
    channel: "daring",
    output: "PDF bertanda tangan, ditujukan ke organisasi",
    needs: ["Judul atau topik sudah disetujui pembimbing", "Instrumen penelitian (kuesioner / panduan wawancara)"],
    steps: ["Ajukan dengan data organisasi", "Pembimbing dikonfirmasi oleh staf", "Kaprodi menandatangani", "PDF dikirim ke emailmu"],
    fields: [
      { name: "judul", label: "Judul / topik penelitian", type: "textarea", required: true },
      { name: "instansi", label: "Organisasi tujuan", type: "text", required: true },
      { name: "pembimbing", label: "Dosen pembimbing", type: "text", required: true },
    ],
    related: { href: "/jalur-kelulusan", label: "Tahapan tugas akhir" },
    sample: true,
  },
  {
    key: "rekomendasi",
    category: "surat",
    title: "Surat Rekomendasi",
    lead: "Rekomendasi prodi untuk beasiswa, lomba, pertukaran pelajar, atau program magang bersertifikat.",
    sla: 5,
    channel: "daring",
    output: "PDF bertanda tangan Kaprodi",
    needs: ["Pengumuman / tautan program yang dituju", "Ringkasan prestasi atau CV singkat"],
    steps: ["Ajukan dengan tautan program", "Kaprodi membaca berkasmu", "Bila perlu, kamu diundang berbincang singkat", "PDF dikirim ke emailmu"],
    fields: [
      { name: "program", label: "Program yang dituju", type: "text", required: true },
      { name: "tenggat", label: "Tenggat pendaftaran", type: "date", required: true },
      reason,
    ],
    sample: true,
  },
  {
    key: "transkrip-sementara",
    category: "surat",
    title: "Transkrip Nilai Sementara",
    lead: "Rekap nilai sampai semester terakhir yang sudah dinilai, bertanda tangan prodi.",
    sla: 2,
    channel: "loket",
    output: "Lembar bercap basah, diambil di loket",
    needs: ["Semua nilai semester lalu sudah keluar di SIAKAD"],
    steps: ["Ajukan dari halaman ini", "Staf mencetak dari SIAKAD", "Kaprodi menandatangani dan mencap", "Ambil di loket dengan KTM"],
    fields: [{ name: "rangkap", label: "Jumlah rangkap", type: "select", options: ["1", "2", "3"], required: true }, reason],
    sample: true,
  },

  // — Persetujuan Kaprodi
  {
    key: "krs-lebih",
    category: "persetujuan",
    title: "KRS Melebihi Batas SKS",
    lead: "Persetujuan mengambil SKS di atas batas yang ditentukan IPS-mu.",
    sla: 2,
    channel: "daring",
    output: "Catatan persetujuan di SIAKAD",
    needs: ["IPS semester lalu", "Daftar mata kuliah yang ingin ditambahkan"],
    steps: ["Ajukan dengan rencana KRS", "Dosen wali memberi pertimbangan", "Kaprodi memutuskan", "Status diperbarui di SIAKAD"],
    fields: [
      { name: "ips", label: "IPS semester lalu", type: "text", placeholder: "3,62", required: true },
      { name: "tambahan", label: "Mata kuliah tambahan", type: "textarea", required: true },
    ],
    related: { href: "/regulasi-akademik#pasal-1-3", label: "Aturan batas SKS per semester" },
    sample: true,
  },
  {
    key: "judul-ta",
    category: "persetujuan",
    title: "Pengesahan Judul & Pembimbing TA",
    lead: "Pengesahan judul tugas akhir beserta dosen pembimbing yang sudah bersedia.",
    sla: 5,
    channel: "daring",
    output: "SK pembimbing dalam PDF",
    needs: ["Proposal singkat (latar belakang, tujuan, metode)", "Kesediaan dosen pembimbing"],
    steps: ["Ajukan dengan proposal", "Dibahas di rapat bidang keahlian", "Kaprodi mengesahkan", "SK pembimbing dikirim ke emailmu"],
    fields: [
      { name: "judul", label: "Usulan judul", type: "textarea", required: true },
      { name: "jalur", label: "Jalur tugas akhir", type: "select", options: ["Skripsi", "Lomba", "PKM", "Bisnis"], required: true },
      { name: "pembimbing", label: "Calon pembimbing", type: "text", required: true },
    ],
    related: { href: "/jalur-kelulusan", label: "Bandingkan empat jalur tugas akhir" },
    sample: true,
  },
  {
    key: "pengakuan-sks",
    category: "persetujuan",
    title: "Pengakuan SKS Kegiatan Luar Kampus",
    lead: "Persetujuan penyetaraan kegiatan MBKM, magang, atau bootcamp menjadi mata kuliah.",
    sla: 7,
    channel: "daring",
    output: "Berita acara penyetaraan",
    needs: ["Learning agreement yang sudah ditandatangani", "Sertifikat / laporan kegiatan"],
    steps: ["Ajukan dengan berkas kegiatan", "Tim penyetaraan menilai CPMK", "Kaprodi mengesahkan", "Nilai masuk transkrip"],
    fields: [
      { name: "kegiatan", label: "Nama kegiatan", type: "text", required: true },
      { name: "matkul", label: "Mata kuliah yang diajukan", type: "textarea", required: true },
    ],
    related: { href: "/konversi-sks#kalkulator", label: "Hitung dulu SKS-nya di meja konversi" },
    sample: true,
  },
  {
    key: "pindah-kelas",
    category: "persetujuan",
    title: "Pindah Program Kelas",
    lead: "Persetujuan pindah antara kelas Reguler, Karyawan, dan Kemitraan Industri.",
    sla: 5,
    channel: "daring",
    output: "Surat persetujuan pindah kelas",
    needs: ["Alasan pindah (pekerjaan, jadwal, dll.)", "Surat keterangan kerja bila pindah ke kelas Karyawan"],
    steps: ["Ajukan dengan alasan", "Dosen wali memberi pertimbangan", "Kaprodi memutuskan", "BAAK memperbarui data kelas"],
    fields: [
      { name: "dari", label: "Kelas sekarang", type: "select", options: ["Reguler", "Karyawan", "Kemitraan Industri"], required: true },
      { name: "ke", label: "Kelas tujuan", type: "select", options: ["Reguler", "Karyawan", "Kemitraan Industri"], required: true },
      { name: "alasan", label: "Alasan", type: "textarea", required: true },
    ],
    related: { href: "/program-kelas", label: "Lihat beda ketiga program kelas" },
    sample: true,
  },

  // — Konsultasi
  {
    key: "temu-kaprodi",
    category: "konsultasi",
    title: "Janji Temu dengan Kaprodi",
    lead: "Bicarakan rencana studi, masalah akademik, atau usulan kegiatan langsung dengan Kaprodi.",
    sla: 3,
    channel: "temu",
    output: "Undangan jadwal dikirim ke email",
    needs: ["Topik yang ingin dibicarakan"],
    steps: ["Ajukan dengan dua pilihan waktu", "Staf mencocokkan jadwal Kaprodi", "Undangan dikirim", "Bertemu di ruang Kaprodi / daring"],
    fields: [
      { name: "topik", label: "Topik", type: "textarea", required: true },
      { name: "waktu", label: "Dua pilihan waktu", type: "text", placeholder: "Selasa 10.00 atau Kamis 13.30", required: true },
      { name: "cara", label: "Cara bertemu", type: "select", options: ["Tatap muka", "Daring"], required: true },
    ],
    sample: true,
  },
  {
    key: "temu-wali",
    category: "konsultasi",
    title: "Konsultasi Dosen Wali di Luar Jadwal",
    lead: "Untuk urusan mendesak di luar masa perwalian, misalnya revisi KRS atau rencana cuti.",
    sla: 2,
    channel: "temu",
    output: "Konfirmasi jadwal dari dosen wali",
    needs: ["Nama dosen wali"],
    steps: ["Ajukan dengan topik", "Staf meneruskan ke dosen wali", "Dosen wali menentukan waktu", "Konfirmasi dikirim ke email"],
    fields: [
      { name: "wali", label: "Dosen wali", type: "text", required: true },
      { name: "topik", label: "Topik", type: "textarea", required: true },
    ],
    related: { href: "/regulasi-akademik#prosedur", label: "Prosedur cuti dan situasi akademik lain" },
    sample: true,
  },
];

/** Jam layanan loket. day: 0 = Minggu … 6 = Sabtu. */
export const HOURS = [
  { day: 1, open: "08:00", close: "15:30", rest: ["12:00", "13:00"] },
  { day: 2, open: "08:00", close: "15:30", rest: ["12:00", "13:00"] },
  { day: 3, open: "08:00", close: "15:30", rest: ["12:00", "13:00"] },
  { day: 4, open: "08:00", close: "15:30", rest: ["12:00", "13:00"] },
  { day: 5, open: "08:00", close: "15:30", rest: ["11:30", "13:00"] },
];

export const CONTACT = {
  email: "",
  whatsapp: "",
  room: "Sekretariat Prodi Sistem Informasi",
  building: "Gedung Kuliah Bersama, Lantai 3",
  sample: true,
};

/** Ruang pada denah (`FloorPlanIllustration`). `key` = atribut `data-room`. */
export const ROOMS = [
  { key: "sekretariat", label: "Sekretariat Prodi", note: "Loket layanan, pengambilan berkas" },
  { key: "kaprodi", label: "Ruang Kaprodi", note: "Janji temu dengan Kaprodi" },
  { key: "dosen", label: "Ruang Dosen", note: "Perwalian dan bimbingan", href: "/dosen" },
  { key: "minilab", label: "Minilab SI", note: "Praktikum dan belajar kelompok", href: "/struktur-organisasi" },
];

export const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/** Status pengajuan (urutan = alur normal). `perlu-perbaikan` & `ditolak` di luar alur. */
export const STATUSES = [
  { key: "diterima", label: "Diterima", desc: "Pengajuan masuk ke kotak layanan prodi." },
  { key: "diverifikasi", label: "Diverifikasi", desc: "Staf sudah memeriksa data dan syaratmu." },
  { key: "diproses", label: "Diproses", desc: "Menunggu tanda tangan atau keputusan." },
  { key: "siap", label: "Siap", desc: "Berkas terkirim ke email atau siap diambil di loket." },
  { key: "selesai", label: "Selesai", desc: "Pengajuan ditutup." },
];
export const SIDE_STATUSES = [
  { key: "perlu-perbaikan", label: "Perlu perbaikan", desc: "Ada data atau syarat yang perlu kamu lengkapi." },
  { key: "ditolak", label: "Ditolak", desc: "Pengajuan tidak dapat diproses." },
];
export const ALL_STATUSES = [...STATUSES, ...SIDE_STATUSES];
export const statusOf = (key) => ALL_STATUSES.find((s) => s.key === key) ?? STATUSES[0];

/** Pertanyaan "Tanya Elvo". `action`: { type: "apply", service } | { type: "track" } | { href, label }. */
export const FAQ = [
  {
    q: "Berapa lama suratku jadi?",
    a: "Tergantung jenisnya, 2 sampai 7 hari kerja, dihitung sejak hari kerja berikutnya kalau kamu mengajukan setelah loket tutup. Perkiraan tanggalnya muncul saat kamu memilih layanan.",
  },
  {
    q: "Kodeku hilang, bagaimana?",
    a: "Kode tersimpan otomatis di perangkat yang kamu pakai saat mengajukan, jadi coba buka halaman ini dari perangkat itu. Kalau tetap hilang, datang ke loket dengan KTM dan staf akan mencarikannya dengan NIM-mu.",
    action: { type: "track", label: "Buka pelacak" },
  },
  {
    q: "Statusku “perlu perbaikan”, harus apa?",
    a: "Baca catatan staf di pelacak, lengkapi yang diminta, lalu tekan “Ajukan ulang”. Isian lamamu terisi otomatis, kamu tinggal memperbaiki bagian yang kurang.",
    action: { type: "track", label: "Lihat catatan" },
  },
  {
    q: "Boleh diwakilkan temanku?",
    a: "Untuk berkas yang diambil di loket boleh, asal temanmu membawa KTM-mu dan menyebut kode pengajuan. Surat yang dikirim lewat email selalu ke alamat yang kamu isi sendiri.",
  },
  {
    q: "Aku butuh surat aktif kuliah besok pagi.",
    a: "Ajukan sekarang dan tulis tenggatnya di kolom keperluan. Staf mendahulukan pengajuan yang tenggatnya dekat, tapi tanda tangan tetap menunggu Kaprodi.",
    action: { type: "apply", service: "surat-aktif", label: "Ajukan surat aktif" },
  },
];

/* ---------------- waktu & estimasi ---------------- */

const toMin = (hhmm) => {
  const [h, m] = String(hhmm).split(/[:.]/).map(Number);
  return h * 60 + (m || 0);
};
export const fmtTime = (hhmm) => String(hhmm).replace(":", ".");
const minutesOf = (d) => d.getHours() * 60 + d.getMinutes();

/** Status loket saat `now`: { open, resting, until, next: {day, time} }. */
export function loketStatus(now, hours = HOURS) {
  if (!now) return null;
  const today = hours.find((h) => h.day === now.getDay());
  const m = minutesOf(now);
  if (today && m >= toMin(today.open) && m < toMin(today.close)) {
    if (today.rest && m >= toMin(today.rest[0]) && m < toMin(today.rest[1])) {
      return { open: false, resting: true, until: today.rest[1], next: { day: now.getDay(), time: today.rest[1], today: true } };
    }
    const until = today.rest && m < toMin(today.rest[0]) ? today.rest[0] : today.close;
    return { open: true, resting: false, until, closing: today.close };
  }
  // cari pembukaan berikutnya
  for (let i = 0; i < 8; i++) {
    const d = (now.getDay() + i) % 7;
    const h = hours.find((x) => x.day === d);
    if (!h) continue;
    if (i === 0 && m >= toMin(h.open)) continue;
    return { open: false, resting: false, next: { day: d, time: h.open, today: i === 0, tomorrow: i === 1 } };
  }
  return { open: false, resting: false, next: null };
}

/**
 * Perkiraan tanggal siap: `sla` hari kerja (hari yang punya jam layanan), dihitung mulai hari kerja berikutnya bila
 * diajukan setelah loket tutup atau di hari libur.
 */
export function estimateReady(sla, from = new Date(), hours = HOURS) {
  const work = new Set(hours.map((h) => h.day));
  const d = new Date(from);
  d.setHours(12, 0, 0, 0);
  const today = hours.find((h) => h.day === from.getDay());
  let counted = 0;
  // hari ini dihitung sebagai hari ke-0 hanya bila masih dalam jam layanan
  if (!today || minutesOf(from) >= toMin(today.close)) {
    do d.setDate(d.getDate() + 1);
    while (!work.has(d.getDay()));
  }
  while (counted < sla) {
    d.setDate(d.getDate() + 1);
    if (work.has(d.getDay())) counted++;
  }
  return d;
}

export const fmtDate = (d, opts = { weekday: "long", day: "numeric", month: "long" }) =>
  new Date(d).toLocaleDateString("id-ID", opts);
export const fmtStamp = (d) =>
  new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/* ---------------- CMS ---------------- */

function parse(raw) {
  if (!raw) return {};
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
}

const str = (v) => (typeof v === "string" ? v.trim() : "");

/** Gabungkan konten bawaan dengan CMS `PageContent` section `layanan-akademik`. Aman dipakai di server & klien. */
export function mergeLayanan(row) {
  const data = parse(row?.data);
  const intro = { body: str(data.intro) || str(row?.content) || INTRO.body };
  const notice =
    data.notice && str(data.notice.title)
      ? { title: str(data.notice.title), body: str(data.notice.body), service: str(data.notice.service) }
      : {
          title: "Transkrip sementara untuk wisuda dibuka lebih awal",
          body: "Ajukan paling lambat dua minggu sebelum gladi agar berkasmu siap tepat waktu.",
          service: "transkrip-sementara",
          sample: true,
        };

  const c = data.contact ?? {};
  const contact = {
    email: str(c.email) || CONTACT.email,
    whatsapp: str(c.whatsapp).replace(/[^\d+]/g, "") || CONTACT.whatsapp,
    room: str(c.room) || CONTACT.room,
    building: str(c.building) || CONTACT.building,
    map: str(c.map),
    sample: !(str(c.room) || str(c.building)),
  };

  const hoursOk =
    Array.isArray(data.hours) &&
    data.hours.length > 0 &&
    data.hours.every((h) => Number.isInteger(h.day) && /^\d{1,2}[:.]\d{2}$/.test(h.open) && /^\d{1,2}[:.]\d{2}$/.test(h.close));
  const hours = hoursOk
    ? data.hours.map((h) => ({ day: h.day, open: h.open.replace(".", ":"), close: h.close.replace(".", ":"), rest: Array.isArray(h.rest) && h.rest.length === 2 ? h.rest : null }))
    : HOURS;

  const overrides = Array.isArray(data.services) ? data.services : [];
  const services = SERVICES.map((s) => {
    const o = overrides.find((x) => x?.key === s.key);
    if (!o) return s;
    const list = (v, d) => (Array.isArray(v) && v.length ? v.map(str).filter(Boolean) : d);
    const needs = list(o.needs, null);
    return {
      ...s,
      title: str(o.title) || s.title,
      lead: str(o.lead) || s.lead,
      output: str(o.output) || s.output,
      sla: Number.isFinite(Number(o.sla)) && Number(o.sla) > 0 ? Number(o.sla) : s.sla,
      channel: CHANNELS[o.channel] ? o.channel : s.channel,
      needs: needs ?? s.needs,
      steps: list(o.steps, s.steps),
      hidden: o.hidden === true,
      sample: needs ? false : s.sample,
    };
  }).filter((s) => !s.hidden);

  return { intro, notice, contact, hours, hoursSample: !hoursOk, services, categories: CATEGORIES, faq: FAQ, rooms: ROOMS };
}

export const serviceByKey = (key, services = SERVICES) => services.find((s) => s.key === key) ?? null;
