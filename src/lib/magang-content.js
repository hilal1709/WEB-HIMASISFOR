/**
 * Konten halaman Magang (`/magang`).
 * SKS & semester Kerja Praktik diturunkan dari kurikulum (`mergeKurikulum`); tanggal Info Session dari
 * agenda beranda (`AGENDA`) — tidak ditulis ulang. Konversi SKS & Bootcamp punya halaman sendiri (hanya ditautkan).
 *
 * CMS `PageContent` section `magang` (Admin › Konten › Magang):
 *   data.intro      → paragraf intro hero
 *   data.jobs[]     → papan lowongan { title, company, field, mode, program, duration, deadline (YYYY-MM-DD),
 *                     needs[], tasks[], href }. Mengisi `jobs` menghapus tanda contoh.
 *   data.notice     → { title, body } untuk banner
 *   data.docs[]     → ditimpa per `key` (surat/logbook/laporan; `href` = URL berkas)
 * Pintu, lowongan, tahapan logbook, dan berkas adalah CONTOH (`sample`) → tampil dengan PlaceholderTag.
 */
import { AGENDA, CONTACT_URL } from "@/lib/home-content";

export const CURTAIN_KEY = "sisfor:curtain:magang";
export const BANNER_KEY = "sisfor:banner:magang";
export const TRACK_KEY = "sisfor:magang:jejak";
export { CONTACT_URL };

export const INTRO = {
  body: "Sebelum lulus, setiap Sisforian bekerja sungguhan di organisasi: membaca proses bisnisnya, memegang datanya, dan pulang dengan laporan yang dinilai. Pilih pintumu, temukan posisinya, lalu catat perjalananmu di sini.",
};

/** Bidang lowongan = slug bidang keahlian (tautan ke /bidang-keahlian#bidang-<slug>). */
export const FIELDS = [
  { key: "enterprise", label: "Enterprise System" },
  { key: "data", label: "Data Science" },
  { key: "audit", label: "Audit & Tata Kelola TI" },
  { key: "msi", label: "Manajemen SI" },
];
export const MODES = [
  { key: "onsite", label: "Di lokasi" },
  { key: "hybrid", label: "Hibrida" },
  { key: "remote", label: "Jarak jauh" },
];

/** Tiga pintu belajar di industri. `kp` mendapat SKS & semester dari kurikulum. */
export const ROUTES = [
  {
    key: "kp",
    title: "Kerja Praktik",
    tag: "Wajib",
    image: "/img/erp.jpeg",
    lottie: "/lottie/briefcase-dark.json",
    lead: "Satu periode bekerja di organisasi mitra untuk mengamati dan memperbaiki satu proses bisnis.",
    facts: [
      { k: "Durasi", v: "± 1–2 bulan, umumnya saat libur semester" },
      { k: "Pembimbing", v: "1 dosen + 1 pembimbing lapangan" },
      { k: "Penilaian", v: "Logbook, laporan, dan seminar KP" },
    ],
    forWho: "Semua mahasiswa. Cocok untuk pengalaman kerja pertamamu.",
    sample: true,
  },
  {
    key: "mandiri",
    title: "Magang Mandiri",
    tag: "Pilihan",
    image: "/img/data.jpeg",
    lottie: "/lottie/data-chart-dark.json",
    lead: "Kamu melamar sendiri ke perusahaan, lalu prodi menilai kesetaraan kegiatannya.",
    facts: [
      { k: "Durasi", v: "3–6 bulan, bisa paruh waktu" },
      { k: "Pembimbing", v: "1 dosen pendamping" },
      { k: "Syarat awal", v: "Persetujuan dosen wali sebelum mulai" },
    ],
    forWho: "Kamu yang sudah punya incaran perusahaan dan ingin jadwal fleksibel.",
    sample: true,
  },
  {
    key: "dikti",
    title: "Program Dikti",
    tag: "Seleksi nasional",
    image: "/img/governance.jpeg",
    lottie: "/lottie/strategy-target-dark.json",
    lead: "Magang bersertifikat dari Kemendiktisaintek yang dibuka berkala dengan seleksi nasional.",
    facts: [
      { k: "Durasi", v: "Satu semester penuh" },
      { k: "Pembimbing", v: "Mentor perusahaan + dosen pendamping" },
      { k: "Jadwal", v: "Mengikuti kalender nasional" },
    ],
    forWho: "Kamu yang ingin pengalaman di perusahaan besar di luar Gresik.",
    sample: true,
  },
];

const PROGRAM_OF = { kp: "Kerja Praktik", mandiri: "Magang Mandiri", dikti: "Program Dikti" };
export const programLabel = (k) => PROGRAM_OF[k] ?? k;

/** Lowongan contoh. `deadline` ISO; yang sudah lewat otomatis turun ke bawah. */
export const JOBS = [
  { title: "SAP MM Functional Intern", company: "Semen Indonesia Group", field: "enterprise", mode: "onsite", program: "kp", duration: "2 bulan", deadline: "2026-11-30", tasks: ["Memetakan alur pengadaan di modul MM", "Menyusun dokumentasi master data material", "Mendampingi uji pengguna perubahan konfigurasi"], needs: ["Lulus Enterprise Resource Planning", "Terbiasa dengan Excel lanjutan"] },
  { title: "Data Analyst Intern", company: "Solusi Bangun Indonesia", field: "data", mode: "hybrid", program: "mandiri", duration: "4 bulan", deadline: "2026-11-18", tasks: ["Membersihkan data produksi harian", "Membuat dasbor kinerja pabrik", "Menyajikan temuan mingguan ke supervisor"], needs: ["SQL dasar", "Power BI atau Tableau", "Komunikasi tertulis yang rapi"] },
  { title: "IT Audit Assistant", company: "Kantor Akuntan Publik mitra", field: "audit", mode: "onsite", program: "mandiri", duration: "3 bulan", deadline: "2026-12-12", tasks: ["Mengumpulkan bukti kendali akses aplikasi", "Menguji sampel log perubahan sistem", "Menyusun kertas kerja audit"], needs: ["Lulus Audit Sistem Informasi", "Teliti dan tahan membaca dokumen panjang"] },
  { title: "Business Process Analyst", company: "Pelabuhan Gresik", field: "msi", mode: "onsite", program: "kp", duration: "2 bulan", deadline: "2026-12-05", tasks: ["Wawancara pengguna layanan bongkar muat", "Memodelkan proses dengan BPMN", "Mengusulkan satu perbaikan proses"], needs: ["Paham BPMN", "Berani wawancara"] },
  { title: "Magang Bersertifikat — Data Engineering", company: "BUMN mitra Program Dikti", field: "data", mode: "remote", program: "dikti", duration: "1 semester", deadline: "2026-12-20", tasks: ["Membangun pipeline ETL sederhana", "Mendokumentasikan skema data", "Proyek akhir bersama tim"], needs: ["Python dasar", "Lolos seleksi nasional"] },
  { title: "ERP Support Intern", company: "Petrokimia Gresik", field: "enterprise", mode: "onsite", program: "mandiri", duration: "3 bulan", deadline: "2026-11-25", tasks: ["Menangani tiket pengguna SAP", "Menyusun panduan singkat transaksi", "Merekap masalah berulang"], needs: ["Lulus Enterprise Resource Planning", "Sabar melayani pengguna"] },
  { title: "IT Governance Intern", company: "Pemerintah Kabupaten Gresik", field: "audit", mode: "hybrid", program: "kp", duration: "2 bulan", deadline: "2026-11-10", tasks: ["Menilai tingkat kematangan layanan TI", "Membantu penyusunan SOP", "Rekap inventaris aplikasi"], needs: ["Paham COBIT dasar"] },
  { title: "Product Analyst — Startup Logistik", company: "Startup binaan inkubator", field: "msi", mode: "remote", program: "mandiri", duration: "6 bulan", deadline: "2026-12-31", tasks: ["Menganalisis perilaku pengguna aplikasi", "Menulis spesifikasi fitur", "Merancang uji A/B"], needs: ["Rasa ingin tahu tentang pengguna", "Excel atau SQL"] },
  { title: "Magang Bersertifikat — Cyber Security GRC", company: "Perusahaan teknologi mitra Program Dikti", field: "audit", mode: "hybrid", program: "dikti", duration: "1 semester", deadline: "2027-01-08", tasks: ["Memetakan risiko keamanan informasi", "Menyusun kebijakan berbasis ISO 27001", "Simulasi audit internal"], needs: ["Lolos seleksi nasional", "Minat pada keamanan informasi"] },
  { title: "Machine Learning Intern", company: "Divisi riset Semen Indonesia Group", field: "data", mode: "onsite", program: "mandiri", duration: "4 bulan", deadline: "2026-12-15", tasks: ["Membuat model prakiraan kebutuhan suku cadang", "Mengevaluasi akurasi model", "Presentasi hasil ke tim"], needs: ["Python & scikit-learn", "Statistika dasar"] },
];

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);

const initials = (s) =>
  String(s)
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w) && !/^(dan|di|—|mitra)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/** Tiga babak logbook. `doc` = kunci berkas di DOCS. */
export const LOGBOOK = [
  {
    key: "sebelum",
    title: "Sebelum berangkat",
    entries: [
      { text: "Diskusikan tempat dan pintu magang dengan dosen wali.", doc: null },
      { text: "Ajukan surat pengantar ke sekretariat prodi.", doc: "surat" },
      { text: "Terima surat balasan dan kirimkan salinannya ke koordinator.", doc: null },
    ],
  },
  {
    key: "selama",
    title: "Selama di lapangan",
    entries: [
      { text: "Isi logbook harian dan minta paraf pembimbing lapangan tiap minggu.", doc: "logbook" },
      { text: "Bimbingan dengan dosen minimal dua kali sebulan.", doc: null },
      { text: "Pilih satu masalah nyata sebagai inti laporanmu.", doc: null },
    ],
  },
  {
    key: "sesudah",
    title: "Setelah selesai",
    entries: [
      { text: "Susun laporan sesuai format prodi.", doc: "laporan" },
      { text: "Minta lembar penilaian dari pembimbing lapangan.", doc: null },
      { text: "Daftar dan presentasikan hasilnya di seminar.", doc: null },
    ],
  },
];

export const DOCS = [
  { key: "surat", title: "Permohonan surat pengantar", kind: "Formulir", pages: 1, href: "", outline: ["Data mahasiswa", "Tujuan instansi", "Periode dan pintu magang", "Persetujuan dosen wali"] },
  { key: "logbook", title: "Templat logbook harian", kind: "Lembar kerja", pages: 4, href: "", outline: ["Identitas dan tempat magang", "Catatan kegiatan harian", "Paraf pembimbing lapangan", "Rekap mingguan"] },
  { key: "laporan", title: "Format laporan magang", kind: "Pedoman", pages: 12, href: "", outline: ["Sampul dan lembar pengesahan", "Profil organisasi", "Analisis proses dan masalah", "Usulan perbaikan", "Lampiran logbook"] },
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

const str = (v) => (typeof v === "string" ? v.trim() : "");
const list = (v) => (Array.isArray(v) ? v.map(str).filter(Boolean) : typeof v === "string" ? v.split("\n").map((s) => s.trim()).filter(Boolean) : []);

function normalizeJob(j, i) {
  const title = str(j?.title);
  const company = str(j?.company);
  if (!title || !company) return null;
  return {
    title,
    company,
    logo: initials(company) || "?",
    field: FIELDS.some((f) => f.key === j.field) ? j.field : "msi",
    mode: MODES.some((m) => m.key === j.mode) ? j.mode : "onsite",
    program: PROGRAM_OF[j.program] ? j.program : "mandiri",
    duration: str(j.duration) || "Menyusul",
    deadline: /^\d{4}-\d{2}-\d{2}$/.test(str(j.deadline)) ? str(j.deadline) : "",
    tasks: list(j.tasks),
    needs: list(j.needs),
    href: str(j.href),
    slug: `${slugify(title)}-${i + 1}`,
  };
}

/** Info Session magang berikutnya dari agenda beranda (contoh, sampai modul agenda ada di CMS). */
function infoSession() {
  const a = AGENDA.find((x) => /magang/i.test(x.title));
  return a ? { ...a } : null;
}

/**
 * Gabungkan CMS ke fallback.
 * @param row        PageContent `magang` (boleh null)
 * @param kurikulum  hasil mergeKurikulum — SKS & semester Kerja Praktik
 */
export function mergeMagang(row, { kurikulum } = {}) {
  const raw = parse(row?.data);
  const courses = kurikulum?.courses ?? [];
  const kp = courses.find((c) => /kerja praktik/i.test(c.nama)) ?? null;
  const cmsJobs = Array.isArray(raw?.jobs) ? raw.jobs.map(normalizeJob).filter(Boolean) : [];
  const jobs = cmsJobs.length ? cmsJobs : JOBS.map(normalizeJob).filter(Boolean);

  const docItems = Array.isArray(raw?.docs) ? raw.docs : [];
  const docs = DOCS.map((d) => {
    const o = docItems.find((x) => x?.key === d.key) ?? {};
    return { ...d, href: str(o.href) || d.href, sample: !str(o.href) };
  });

  const body = str(raw?.intro);
  const n = raw?.notice;
  const session = infoSession();
  const notice =
    n && str(n.title)
      ? { title: str(n.title), body: str(n.body), sample: false, event: null }
      : session
        ? {
            title: `${session.title}: ${Number(session.day)} ${session.month}`,
            body: `${session.place}, ${session.time}. Bawa pertanyaanmu soal syarat, jadwal, dan mitra semester genap.`,
            sample: true,
            event: session,
          }
        : null;

  return {
    intro: { body: body && body.length > 40 ? body : INTRO.body },
    kp: kp ? { nama: kp.nama, sks: kp.sks, semester: kp.semester, slug: kp.slug } : { nama: "Kerja Praktik", sks: 2, semester: 7, slug: null },
    routes: ROUTES,
    jobs,
    jobsSample: !cmsJobs.length,
    logbook: LOGBOOK,
    docs,
    notice,
  };
}

/** Sisa hari sampai tenggat (dibulatkan ke atas; negatif = sudah lewat). `today` disuntik agar mudah diuji. */
export function daysLeft(deadline, today = new Date()) {
  if (!deadline) return null;
  const end = new Date(`${deadline}T23:59:59`);
  return Math.ceil((end - today) / 86400000) - 1;
}
