export const STAGES = [
  { key: "simpan", label: "Disimpan" },
  { key: "lamar", label: "Melamar" },
  { key: "wawancara", label: "Wawancara" },
  { key: "diterima", label: "Diterima" },
];

export const COPY = {
  hero: {
    title: "Dari ruang kelas,\nke lantai industri",
    homeLabel: "Beranda", homeHref: "/", breadcrumb: "Belajar Luar Prodi", breadcrumbAria: "Navigasi halaman", pageLabel: "Magang",
    findJobs: "Lihat lowongan", compare: "Bandingkan jalurnya",
    cardBrand: "SISFOR UISI", cardRole: "Peserta magang", cardName: "Kamu",
    cardImage: "/mascot/elvo-wave.webp", cardAlt: "",
    semesterLine: "Sisforian, semester {semester}", courseLabel: "Mata kuliah",
    loadLabel: "Beban", semesterLabel: "Diambil", credits: "{sks} SKS", semesterShort: "Smt {semester}",
    turn: "Ketuk untuk membalik", cardAria: "Kartu peserta magang. Ketuk untuk melihat pilihan jalur.",
    routesHeading: "Jalur magang", turnBack: "Balik ke kartu", routesAria: "Pilihan jalur: {routes}",
    curtainTitle: "Magang", curtainAccent: "Sisfor", loading: "Memuat info magang",
  },
  routes: {
    title: "Pilih pintu\nyang paling pas",
    body: "{course} wajib ditempuh semua mahasiswa di semester {semester}. Jalur lainnya bisa menambah pengalamanmu.",
    audience: "Cocok untuk", imageLabel: "Pintu {index} · {title}", illustrationLabel: "Ilustrasi {title}",
    creditsLink: "Cara magang dikonversi ke SKS", creditsHref: "/konversi-sks#kalkulator",
    empty: "Informasi jalur magang menyusul.",
  },
  jobs: {
    title: "Posisi yang\nsedang dibuka",
    body: "Klik posisi untuk membaca tugas dan kebutuhannya. Simpan yang menarik, lalu pantau lamaranmu di bagian berikutnya.",
    bodyWithoutTracker: "Klik posisi untuk membaca tugas dan kebutuhannya.",
    search: "Cari posisi, perusahaan, atau keahlian", count: "{count} posisi",
    clear: "Hapus filter", field: "Bidang", program: "Pintu", mode: "Lokasi kerja", all: "Semua {label}",
    save: "Simpan {title} ke jejak lamaran", remove: "Hapus {title} dari jejak lamaran",
    empty: "Belum ada lowongan yang ditampilkan.", filteredEmpty: "Belum ada posisi yang cocok",
    emptyHint: "Longgarkan filternya, atau cari dengan kata lain.", resetEmpty: "Tampilkan semua posisi",
    illustration: "/lottie/empty-news.json", illustrationAlt: "", more: "Tampilkan {count} posisi lagi",
    closed: "Ditutup", today: "Tutup hari ini", deadline: "Tutup {days} hari lagi",
    noDeadline: "Tenggat menyusul", sample: "Contoh konten · menunggu data CMS", durationMissing: "Menyusul",
  },
  notice: {
    calendar: "Simpan ke kalender", dismiss: "Tutup pengumuman",
    saved: "Jadwal tersimpan", savedBody: "Buka berkas .ics untuk menambahkannya ke kalendermu.",
    unavailable: "Tanggal belum pasti", unavailableBody: "Pantau papan agenda prodi untuk jadwal resminya.",
  },
  jobModal: {
    mode: "Lokasi", duration: "Durasi", summary: "Lowongan {title} di {company}, {program}, durasi {duration}.",
    tasks: "Yang akan kamu kerjakan", needs: "Yang perlu kamu bawa", aboutField: "Tentang bidang {field}",
    closed: "Pendaftaran ditutup", apply: "Lamar posisi ini", save: "Simpan",
    previous: "Posisi sebelumnya", next: "Posisi berikutnya", close: "Tutup",
    noLink: "Tautan lamaran menyusul", noLinkBody: "Koordinator magang akan mengumumkannya di papan agenda prodi.",
    opened: "Semoga lolos!", openedBody: "Tandai lamaran ini sebagai sudah dikirim?", mark: "Tandai Melamar",
  },
  tracker: {
    title: "Jejak\nlamaranmu",
    body: "Geser kartu saat statusnya berubah. Jejak hanya tersimpan di perangkat ini.",
    watched: "{count} posisi dipantau", accepted: "{count} diterima",
    empty: "Papanmu masih kosong", emptyBody: "Simpan posisi yang menarik. Kartunya akan muncul di kolom {saved}, lalu bisa kamu pindahkan hingga {accepted}.",
    emptyLink: "Pilih dari papan lowongan", illustration: "/lottie/briefcase.json", illustrationAlt: "Tas kerja yang masih kosong",
    welcome: "Selamat bergabung", stageLabel: "Tahap lamaran", drop: "Seret kartu ke sini",
    emptyStage: "Belum ada kartu di tahap ini.",
    back: "Mundurkan {title} ke {stage}", forward: "Majukan {title} ke {stage}", remove: "Hapus {title} dari jejak",
    toastRemoved: "Dihapus dari jejak lamaran", undo: "Batalkan",
    toastSaved: "Tersimpan ke jejak lamaran", view: "Lihat jejak",
    toastAccepted: "Selamat, diterima di {company}!", toastAcceptedBody: "Langkah berikutnya: urus surat dan logbook sebelum mulai.",
    viewDocs: "Lihat berkas", toastMoved: "Dipindah ke {stage}", toastApplied: "Ditandai sudah melamar",
  },
  logbook: {
    title: "Dari surat pengantar\nsampai seminar",
    body: "Ikuti urutan administrasi dari persiapan hingga kegiatan selesai.",
    stamp: "Disetujui", files: "Berkas yang dipakai", pagesShort: "{pages} hlm",
    empty: "Panduan administrasi menyusul.",
  },
  docModal: {
    brand: "Sistem Informasi UISI", pages: "{pages} halaman", close: "Tutup",
    outline: "Isi berkas, berurutan:", download: "Unduh berkas", checking: "Memeriksa berkas…",
    missing: "Berkas menyusul", missingBody: "Sekretariat prodi sedang menyiapkan versi terbarunya.",
    opened: "Berkas dibuka di tab baru", failed: "Berkas tidak bisa dimuat",
    failedBody: "Coba lagi nanti atau hubungi sekretariat prodi.",
  },
  closing: {
    body: "Bingung mulai dari mana? Koordinator magang membuka konsultasi setiap pekan.",
    link: "Hubungi koordinator", href: "#kontak", mascot: "thumbs-up", mascotText: "Satu lamaran terkirim lebih baik dari sepuluh rencana.",
    current: "Kamu di sini", next: "Disarankan berikutnya",
  },
};

export function interpolate(template, values = {}) {
  return template.replace(/\{(\w+)\}/g, (token, field) => Object.hasOwn(values, field) ? String(values[field] ?? "") : token);
}

export const titleLines = (title) => title.split("\n").filter(Boolean);
