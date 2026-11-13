/**
 * Contoh isi Warta SISFOR selama tabel `Post`/`Event` kosong. Semua ditandai "Contoh konten" di UI.
 * Berita = `NEWS` beranda (judul, ringkasan, foto sama) + isi lengkap; agenda = `AGENDA` beranda.
 * Penulis contoh sengaja "Redaksi" — tidak menaruh opini atas nama dosen sungguhan.
 */
import { AGENDA, NEWS } from "./home-content";

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5, jul: 6, agu: 7, agt: 7, sep: 8, okt: 9, nov: 10, des: 11 };
/** "12 Okt 2026" → Date (09.00 WIB). */
const parseNewsDate = (s) => {
  const [d, m, y] = s.split(" ");
  return new Date(Date.UTC(Number(y), MONTHS[m.slice(0, 3).toLowerCase()], Number(d), 2));
};
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const BODIES = {
  "Mahasiswa SISFOR Raih Juara Nasional": `Tiga mahasiswa angkatan 2023 membawa pulang gelar juara pada kompetisi analitik bisnis tingkat nasional. Tim menyusun dasbor pemantauan rantai pasok untuk studi kasus perusahaan distribusi, lalu mempertahankannya di depan juri praktisi.

## Dari tugas kuliah ke panggung final

Ide awalnya lahir dari proyek mata kuliah Business Intelligence. Data penjualan dan stok gudang yang biasa dipakai di kelas diolah ulang menjadi model peramalan permintaan, lalu disajikan sebagai dasbor yang bisa dibaca manajer tanpa latar teknis.

> Juri paling banyak bertanya soal keputusan apa yang bisa diambil dari dasbor, bukan soal grafiknya.

## Persiapan delapan minggu

Tim berlatih presentasi setiap pekan bersama dosen pembimbing, menguji asumsi model dengan data tiga tahun, dan memangkas tampilan sampai tersisa empat indikator utama.

- Pekan 1–3: eksplorasi data dan definisi masalah
- Pekan 4–6: pemodelan dan validasi
- Pekan 7–8: penyederhanaan dasbor dan latihan pitch`,
  "Workshop ERP bersama Praktisi Industri": `Lab ERP penuh selama dua hari ketika praktisi dari lingkungan Semen Indonesia Group membawakan sesi langsung SAP S/4HANA untuk mahasiswa semester lima.

## Satu siklus bisnis, dari pesanan sampai faktur

Peserta tidak hanya menekan tombol transaksi. Setiap kelompok menjalankan alur *order-to-cash* lengkap, lalu menelusuri dampaknya ke modul keuangan untuk melihat bagaimana satu pesanan menggerakkan banyak bagian perusahaan.

![Suasana praktik di Lab ERP](/img/erp.jpeg "Peserta menelusuri dokumen penjualan di Lab ERP")

## Yang dibawa pulang

Di akhir sesi, peserta memetakan masalah yang paling sering muncul saat implementasi ERP di pabrik: data induk yang tidak rapi, persetujuan berlapis, dan kebiasaan lama yang belum berubah.`,
  "Kuliah Tamu: Tren Data & AI di Bisnis": `Auditorium terisi mahasiswa dari tiga angkatan pada kuliah tamu yang membedah penerapan AI generatif untuk pengambilan keputusan bisnis.

## Bukan soal alat, tapi soal pertanyaan

Pemateri menekankan bahwa nilai AI muncul ketika organisasi tahu keputusan mana yang ingin dipercepat. Contoh yang dibahas mulai dari ringkasan laporan harian sampai penyusunan draf analisis pasar.

> Model yang bagus tidak menolong kalau datanya tersebar di sepuluh lembar kerja yang berbeda.

## Tata kelola ikut dibahas

Sesi tanya jawab banyak menyinggung risiko: kebocoran data, jawaban yang terdengar yakin tapi keliru, dan siapa yang bertanggung jawab atas keputusan akhir.`,
  "Informasi Magang dan MBKM Semester Genap": `Program studi membuka pendataan peserta magang dan MBKM untuk semester genap. Mahasiswa yang berencana mengambil kerja praktik, magang mandiri, atau program Kampus Merdeka diminta melapor ke koordinator sebelum tenggat.

## Yang perlu disiapkan

- Transkrip terbaru dan rencana studi semester genap
- Surat penerimaan atau bukti pendaftaran dari mitra
- Rencana kegiatan yang akan diajukan untuk konversi SKS

Rincian alur, lowongan, dan simulasi konversi tersedia di halaman Magang dan Konversi SKS.`,
};

const EXTRA_NEWS = [
  {
    title: "Kunjungan Industri ke Pusat Data Perusahaan Semen",
    tag: "Kegiatan",
    date: "26 Agu 2026",
    image: "/img/governance.jpeg",
    body: "Mahasiswa melihat langsung pengelolaan pusat data dan prosedur pemulihan bencana di lingkungan industri.",
    content: `Rombongan mahasiswa mata kuliah Tata Kelola TI berkunjung ke pusat data perusahaan untuk melihat bagaimana standar yang dipelajari di kelas dijalankan sehari-hari.

## Prosedur yang terlihat sederhana

Petugas menunjukkan catatan perubahan konfigurasi, jadwal uji pemulihan, dan daftar akses ruang server. Semuanya terdokumentasi dan diaudit berkala.

> Dokumentasi yang membosankan justru yang menyelamatkan saat terjadi gangguan.`,
  },
  {
    title: "Penandatanganan Kerja Sama Riset Sistem Informasi Logistik",
    tag: "Kerja Sama",
    date: "14 Agu 2026",
    image: "/img/award/image-1.png",
    body: "Kesepakatan riset bersama mitra logistik membuka topik tugas akhir dan tempat magang baru bagi mahasiswa.",
    content: `Program studi menandatangani nota kesepahaman riset dengan mitra di bidang logistik. Kerja sama ini mencakup penelitian bersama, topik tugas akhir berbasis kasus nyata, dan kuota magang.

## Ruang lingkup

- Optimasi rute dan penjadwalan armada
- Integrasi data gudang dengan sistem ERP
- Dasbor kinerja pengiriman untuk manajemen`,
  },
  {
    title: "Yudisium Periode Agustus: 38 Lulusan Baru",
    tag: "Akademik",
    date: "02 Agu 2026",
    image: "/img/heroprofile.png",
    body: "Program studi melepas lulusan periode Agustus dengan tiga jalur tugas akhir yang berbeda.",
    content: `Sidang yudisium periode Agustus menetapkan lulusan baru Program Studi Sistem Informasi. Sebagian menyelesaikan studi lewat skripsi, sebagian lewat jalur prestasi lomba dan rencana bisnis.

## Pesan untuk lulusan

Lulusan diajak tetap terhubung lewat jejaring alumni, baik untuk berbagi lowongan maupun menjadi pembicara bagi adik tingkat.`,
  },
];

const ARTICLES = [
  {
    title: "Membaca Proses Bisnis Sebelum Menulis Kode",
    category: "Industri",
    date: "05 Okt 2026",
    image: "/img/erp.jpeg",
    featured: true,
    excerpt: "Banyak proyek sistem gagal bukan karena teknologinya, tapi karena alur kerja yang tidak pernah dipetakan.",
    content: `Sebelum membuka editor, analis sistem perlu tahu siapa melakukan apa, kapan, dan dengan dokumen apa. Tanpa itu, aplikasi yang rapi pun hanya memindahkan kekacauan ke layar.

## Mulai dari satu dokumen

Ikuti perjalanan satu dokumen, misalnya permintaan pembelian. Catat setiap meja yang dilewatinya, berapa lama ia menunggu, dan siapa yang berhak menolak.

## Gambar, lalu tanya

Diagram alur sederhana sudah cukup untuk memancing pertanyaan yang penting: langkah mana yang bisa dihapus, mana yang bisa berjalan bersamaan, dan mana yang sebenarnya hanya kebiasaan.

> Otomasi terbaik sering kali dimulai dengan menghapus langkah, bukan menambah fitur.`,
  },
  {
    title: "Lima Kebiasaan yang Membuat Tugas Akhir Lebih Ringan",
    category: "Tips Kuliah",
    date: "28 Sep 2026",
    image: "/img/data.jpeg",
    featured: true,
    excerpt: "Tugas akhir terasa berat ketika semuanya dikerjakan di bulan terakhir. Kebiasaan kecil sejak awal mengubah itu.",
    content: `Tugas akhir jarang gagal karena kurang pintar. Lebih sering karena ritme kerja yang tidak terjaga.

## 1. Tulis catatan harian riset

Dua atau tiga kalimat tentang apa yang dikerjakan hari ini dan apa yang membingungkan. Catatan ini akan jadi bahan bab metodologi.

## 2. Simpan sumber sejak hari pertama

Gunakan pengelola referensi. Mencari ulang jurnal yang pernah dibaca bisa memakan satu akhir pekan.

## 3. Jadwalkan bimbingan, jangan menunggu siap

Bimbingan dengan draf setengah jadi lebih berguna daripada menunggu draf sempurna yang tidak kunjung selesai.

## 4. Pisahkan menulis dan menyunting

Menulis dulu tanpa berhenti, menyunting di hari lain. Keduanya memakai cara berpikir yang berbeda.

## 5. Cadangkan berkas di dua tempat

Satu di laptop, satu di penyimpanan awan. Kehilangan data seminggu sebelum sidang bukan cerita langka.`,
  },
  {
    title: "Data Governance di Kampus: Siapa Pemilik Data Mahasiswa?",
    category: "Opini",
    date: "16 Sep 2026",
    image: "/img/governance.jpeg",
    excerpt: "Data mahasiswa tersebar di banyak unit. Tanpa pemilik yang jelas, kualitasnya sulit dijaga.",
    content: `Nilai ada di sistem akademik, pembayaran di keuangan, data magang di program studi. Ketika semua unit menyimpan versinya sendiri, siapa yang menjamin datanya benar?

## Pemilik bukan berarti penjaga server

Pemilik data adalah unit yang berhak menetapkan definisi dan memutuskan perubahan. Tim TI menjaga sistemnya, tapi tidak bisa menentukan arti sebuah status mahasiswa.

## Langkah kecil yang bisa dimulai

- Sepakati kamus data untuk istilah yang paling sering dipakai
- Tunjuk satu pemilik untuk setiap kelompok data
- Catat setiap perubahan definisi beserta alasannya`,
  },
  {
    title: "Mengapa Dasbor yang Ramai Jarang Dipakai",
    category: "Riset",
    date: "03 Sep 2026",
    image: "/img/award/image-2.png",
    excerpt: "Semakin banyak grafik, semakin sulit menemukan keputusan. Riset kecil di kelas BI menunjukkan polanya.",
    content: `Dalam satu semester, mahasiswa kelas Business Intelligence membandingkan dua versi dasbor untuk tugas yang sama. Versi ringkas dengan empat indikator lebih sering dipakai dan menghasilkan keputusan lebih cepat.

## Temuan utama

Pengguna menghabiskan waktu paling lama mencari angka yang relevan, bukan membaca angkanya. Setiap grafik tambahan menambah waktu cari.

> Dasbor yang baik menjawab satu pertanyaan dengan jelas, bukan sepuluh pertanyaan dengan samar.`,
  },
];

export const SEED_POSTS = [
  ...NEWS.items.map((n, i) => ({
    slug: slug(n.title),
    type: "berita",
    title: n.title,
    excerpt: n.body,
    content: BODIES[n.title] ?? n.body,
    cover: n.image,
    category: n.tag === "Workshop" || n.tag === "Kuliah Tamu" ? "Kegiatan" : n.tag,
    featured: i === 0,
    publishedAt: parseNewsDate(n.date),
  })),
  ...EXTRA_NEWS.map((n) => ({ slug: slug(n.title), type: "berita", title: n.title, excerpt: n.body, content: n.content, cover: n.image, category: n.tag, publishedAt: parseNewsDate(n.date) })),
  ...ARTICLES.map((a) => ({ slug: slug(a.title), type: "artikel", title: a.title, excerpt: a.excerpt, content: a.content, cover: a.image, category: a.category, featured: !!a.featured, publishedAt: parseNewsDate(a.date) })),
];

const CAT = (t) => (/kuliah tamu/i.test(t) ? "Kuliah Tamu" : /workshop/i.test(t) ? "Workshop" : /magang|karier/i.test(t) ? "Karier" : "Akademik");
const SUMMARY = {
  "Kuliah Tamu": "Praktisi industri berbagi pengalaman nyata membangun arsitektur data di pabrik.",
  Workshop: "Praktik langsung di laboratorium, peserta membawa laptop dan akun SAP dari prodi.",
  Karier: "Penjelasan alur pendaftaran, mitra, dan konversi SKS, dilanjutkan tanya jawab.",
  Akademik: "Jadwal sidang dibagikan ke mahasiswa yang sudah dinyatakan siap oleh pembimbing.",
};

export const SEED_EVENTS = AGENDA.map((a) => {
  const [h, m] = a.time.match(/\d{1,2}/g).map(Number);
  const month = MONTHS[a.month.slice(0, 3).toLowerCase()];
  const start = new Date(Date.UTC(2026, month, Number(a.day), h - 7, m));
  const category = CAT(a.title);
  return {
    slug: slug(a.title),
    title: a.title,
    summary: SUMMARY[category],
    category,
    startAt: start,
    endAt: new Date(start.getTime() + 2 * 3600e3),
    place: a.place,
    mode: /daring|zoom/i.test(a.place) ? "daring" : "luring",
  };
});
