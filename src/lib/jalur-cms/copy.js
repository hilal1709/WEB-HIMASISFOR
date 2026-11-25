export const JALUR_COPY = {
  identity: {
    seoTitle: "Jalur Kelulusan — Sistem Informasi UISI",
    seoDescription: "Empat jalur tugas akhir S1 Sistem Informasi UISI: skripsi, lomba, PKM, dan bisnis — tahapan, syarat, luaran, risiko, dan cek kesiapan untuk tiap jalur.",
    seoImage: "/img/logo.png", seoImageAlt: "",
    breadcrumbRoot: "Beranda", breadcrumbHref: "/", breadcrumbParent: "Akademik", breadcrumbCurrent: "Jalur Kelulusan",
    curtainKicker: "Program Studi Sistem Informasi", curtainTitle: "Jalur", curtainAccent: "Kelulusan", loading: "Memuat jalur kelulusan",
  },
  hero: {
    titleStart: "Aku ingin", titleEnd: "lulus lewat", kicker: "Jalur kelulusan", credits: "tugas akhir {sks} SKS", semester: "semester {semester}",
    select: "Pilih jalur kelulusan", readiness: "Cek kesiapan {path}", compare: "Bandingkan risikonya",
    mascot: "Ganti kata yang digarisbawahi, ceritanya ikut berubah.", empty: "Belum ada jalur kelulusan yang ditampilkan.",
  },
  story: {
    title: "Jalan yang\nkamu tempuh", body: "Dari pengajuan sampai sidang, setiap jalur punya urutan tahapnya sendiri. Ketuk sebuah tahap untuk melihat apa yang perlu kamu siapkan.",
    desktopSelect: "Pilih bab jalur", mobileSelect: "Pilih jalur", chapter: "Bab {number}", progress: "{path} · tahap {number}/{total}",
  },
  readiness: {
    title: "Cek\nkesiapanku", body: "Centang yang sudah benar-benar kamu punya. Jawabanmu hanya tersimpan di perangkat ini.", select: "Jalur yang dicek",
    complete: "Siap berangkat.", almost: "Hampir siap.", started: "Masih ada yang perlu disiapkan.", initial: "Mulai dari butir yang sudah pasti.",
    count: "{done} dari {total} butir untuk jalur {path}", reset: "Mulai ulang", empty: "Belum ada butir kesiapan untuk jalur ini.",
    success: "Kamu siap menempuh jalur {path}", successBody: "Bawa daftar ini saat menemui calon pembimbing.", successAction: "Lihat tahapan",
    resetToast: "Daftar kesiapan {path} dikosongkan", undo: "Batalkan",
  },
  compare: {
    title: "Kalau aku pilih\njalur ini,\napa taruhannya?", body: "Balik kartunya untuk melihat siapa yang paling cocok dan apa yang perlu kamu pertimbangkan.",
    flip: "Balik kartu", back: "Kembali", details: "Ringkasan jalur",
  },
  labels: {
    output: "Luaran", duration: "Durasi", mentor: "Pendamping", audience: "Cocok untuk", risk: "Pertimbangkan", stages: "Tahapan",
    pathNumber: "Jalur {number}", prerequisite: "Prasyarat: {course}", sample: "Contoh konten · menunggu data CMS", close: "Tutup", closeBanner: "Tutup banner",
    previousPath: "Jalur sebelumnya", nextPath: "Jalur berikutnya", previousStage: "Tahap sebelumnya", nextStage: "Tahap berikutnya",
    stageNumber: "Tahap {number}: {stage}", stageProgress: "Jalur {path} · tahap {number} dari {total}", stageOutput: "Selesai bila",
    requirements: "Yang perlu disiapkan", next: "Berikutnya:", last: "Tahap terakhir",
  },
  closing: {
    prompt: "Masih ragu? Bawa hasil cek kesiapanmu ke dosen wali sebelum semester {semester} dimulai.",
    promptWithoutSemester: "Masih ragu? Bawa hasil cek kesiapanmu ke dosen wali.",
    kicker: "Langkah berikutnya", courseKicker: "Semester {semester}", courseNote: "Mata kuliah yang menyiapkan proposal skripsimu.",
    pathKicker: "Jalur {path}", pathTitle: "Ringkasan tahapannya", pathNote: "Semua tahap, syarat, dan luaran jalur ini dalam satu lembar.",
    linksLabel: "Juga berguna:", mascot: "Ngobrol dulu, baru pilih.",
  },
};

export const fillJalur = (text, data = {}) => text.replace(/\{(\w+)\}/g, (_, key) => String(data[key] ?? ""));
