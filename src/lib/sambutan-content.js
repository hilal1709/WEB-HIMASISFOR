/**
 * Konten fallback halaman Sambutan Kaprodi.
 * Bisa ditimpa dari CMS: PageContent section "sambutan-kaprodi"
 *   title    → nama kaprodi, subtitle → jabatan, image → foto,
 *   content  → paragraf surat (dipisah baris kosong),
 *   data     → JSON { greeting, quote, closing, credentials, research, education, certifications }.
 * Teks di bawah adalah CONTOH (PRODUCT.md) — tampil dengan PlaceholderTag sampai CMS terisi.
 */
export const SAMBUTAN = {
  name: "Grandys Frieska Prassida",
  credentials: "S.Kom., M.Kom., Ph.D., MCE, CIIQA",
  role: "Ketua Program Studi Sistem Informasi",
  photo: "/img/profil/grandys.jpg",
  greeting: "Assalamu’alaikum warahmatullahi wabarakatuh, salam sejahtera untuk kita semua.",
  paragraphs: [
    "Selamat datang di laman Program Studi Sistem Informasi Universitas Internasional Semen Indonesia. Terima kasih sudah meluangkan waktu untuk mengenal kami lebih dekat, entah Anda calon mahasiswa, orang tua, alumni, maupun mitra industri.",
    "Sejak berdiri pada 2014, kami percaya bahwa sistem informasi bukan sekadar soal kode atau perangkat. Ia adalah jembatan antara proses bisnis dan teknologi, antara keputusan manusia dan data yang mendukungnya. Karena itu kurikulum kami dibangun di atas empat bidang keahlian: Sistem Enterprise, Tata Kelola dan Audit TI, Sains Data, serta Strategi Sistem Informasi.",
    "Berada di jantung kawasan industri Gresik memberi kami keistimewaan yang jarang dimiliki program studi lain. Mahasiswa belajar langsung dari praktisi, mengerjakan studi kasus nyata, dan magang di perusahaan yang setiap harinya menjalankan sistem ERP berskala besar.",
    "Kami juga ingin lulusan kami tumbuh sebagai pribadi yang amanah dan beretika. Kemampuan teknis akan terus berganti mengikuti zaman, tetapi integritas, rasa ingin tahu, dan kemauan untuk berbagi pengetahuan adalah bekal yang bertahan seumur hidup.",
    "Kepada seluruh dosen, tenaga kependidikan, mahasiswa, dan alumni, terima kasih atas kerja keras yang membawa kita meraih akreditasi “Baik Sekali” dari LAM INFOKOM. Mari terus melangkah bersama menuju visi 2030.",
  ],
  quote: "Teknologi akan terus berganti. Yang kami tanamkan adalah cara berpikir: memahami masalah bisnis lebih dulu, lalu memilih teknologi yang tepat untuk menyelesaikannya.",
  closing: "Wassalamu’alaikum warahmatullahi wabarakatuh.",
  // Kampus asal tiap jenjang belum diketahui — tambahkan `place` bila sudah ada.
  education: [
    { degree: "Doktor (Ph.D.)" },
    { degree: "Magister Komputer (M.Kom.)" },
    { degree: "Sarjana Komputer (S.Kom.)" },
  ],
  research: ["IS Strategic Planning", "Enterprise Architecture", "IT Governance & Risk Management"],
  certifications: ["MCE (Microsoft Certified Educator)", "CIIQA"],
};

/** Gabungkan baris CMS (PageContent) ke fallback. */
export function mergeSambutan(row) {
  if (!row) return { ...SAMBUTAN, isPlaceholder: true };
  let data = {};
  try {
    data = row.data ? (typeof row.data === "string" ? JSON.parse(row.data) : row.data) : {};
  } catch {}
  const paragraphs = row.content ? row.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : null;
  return {
    ...SAMBUTAN,
    ...data,
    name: row.title || SAMBUTAN.name,
    role: row.subtitle || SAMBUTAN.role,
    photo: row.image || SAMBUTAN.photo,
    paragraphs: paragraphs?.length ? paragraphs : SAMBUTAN.paragraphs,
    isPlaceholder: false,
  };
}
