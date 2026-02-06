const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedCurriculum() {
  try {
    const curriculumData = [
      {
        semester: 1,
        matkul: [
          { nama: "Bahasa Inggris 1", sks: 2 },
          { nama: "Pendidikan Agama", sks: 2 },
          { nama: "Pengantar Teknologi Informasi", sks: 2 },
          { nama: "Pengantar Sistem Informasi", sks: 2 },
          { nama: "Matematika Diskrit", sks: 3 },
          { nama: "Kalkulus & Aljabar Linier", sks: 3 },
          { nama: "Sistem Operasi", sks: 2 },
          { nama: "Keterampilan Interpersonal Bisnis", sks: 2 },
        ],
      },
      {
        semester: 2,
        matkul: [
          { nama: "Bahasa Inggris 2", sks: 2 },
          { nama: "Pancasila & Kewarganegaraan", sks: 3 },
          { nama: "Pengenalan Akuntansi Keuangan", sks: 2 },
          { nama: "Statistika", sks: 3 },
          { nama: "Jaringan Komputer", sks: 2 },
          { nama: "Rekayasa Kebutuhan Perangkat Lunak", sks: 3 },
          { nama: "Pemrograman Terstruktur", sks: 4 },
        ],
      },
      {
        semester: 3,
        matkul: [
          { nama: "Wawasan Lingkungan Hidup", sks: 2 },
          { nama: "Manajemen Organisasi & SDM", sks: 3 },
          { nama: "Analisis & Desain Proses Bisnis", sks: 3 },
          { nama: "Perencanaan & Pengendalian Produksi", sks: 2 },
          { nama: "Keamanan Siber", sks: 2 },
          { nama: "Desain Pengalaman Pengguna", sks: 2 },
          { nama: "Pemrograman Berorientasi Objek", sks: 3 },
        ],
      },
      {
        semester: 4,
        matkul: [
          { nama: "Kewirausahaan", sks: 3 },
          { nama: "Manajemen Hubungan Pelanggan", sks: 2 },
          { nama: "Manajemen Rantai Pasok", sks: 2 },
          { nama: "Tata Kelola TI", sks: 3 },
          { nama: "Manajemen Basis Data", sks: 4 },
          { nama: "Pengembangan & Implementasi Perangkat Lunak", sks: 3 },
          { nama: "Pemrograman Web", sks: 3 },
        ],
      },
      {
        semester: 5,
        matkul: [
          { nama: "Bahasa Indonesia", sks: 2 },
          { nama: "Perencanaan Sumber Daya Perusahaan", sks: 4 },
          { nama: "Audit TI", sks: 2 },
          { nama: "Manajemen Risiko TI", sks: 2 },
          { nama: "Pergudangan Data & Intelijensia Bisnis", sks: 4 },
          { nama: "Pemrograman Perangkat Bergerak", sks: 3 },
          { nama: "Manajemen Proyek TI", sks: 2 },
        ],
      },
      {
        semester: 6,
        matkul: [
          { nama: "Wawasan Semen Indonesia", sks: 2 },
          { nama: "Manajemen Layanan TI", sks: 3 },
          { nama: "Perencanaan Strategis SI", sks: 3 },
          { nama: "Manajemen Investasi TI", sks: 2 },
          { nama: "Penambangan Data", sks: 3 },
          { nama: "Sistem Pendukung Keputusan", sks: 3 },
          { nama: "Simulasi Manajemen Proyek TI", sks: 3 },
        ],
      },
      {
        semester: 7,
        matkul: [
          { nama: "Kuliah Kerja Nyata", sks: 2 },
          { nama: "Kerja Praktik", sks: 2 },
          { nama: "Elective 1", sks: null },
          {
            nama: "Simulasi Proyek TI Lanjut (Audit TI / Enterprise Sistem / Data Science)",
            sks: 3,
          },
          { nama: "Metode Penelitian & Penulisan Ilmiah", sks: 3 },
          { nama: "Elective 2", sks: 6 },
        ],
      },
      {
        semester: 8,
        matkul: [
          { nama: "Skripsi / Lomba / PKM / Bisnis", sks: 6 },
          { nama: "Elective 1", sks: null },
          { nama: "Sertifikasi Profesional SI", sks: 2 },
          { nama: "Etika Profesional SI", sks: 2 },
          { nama: "Elective 2", sks: 6 },
        ],
      },
    ];

    // Check if curriculum already exists
    const existing = await prisma.pageContent.findUnique({
      where: { section: "curriculum" },
    });

    if (existing) {
      console.log("✓ Data kurikulum sudah ada di database");
      return;
    }

    // Create curriculum data
    await prisma.pageContent.create({
      data: {
        section: "curriculum",
        title: "Kurikulum Program Studi",
        subtitle: "Sistem Informasi Bisnis",
        data: JSON.stringify(curriculumData),
        isActive: true,
        order: 0,
      },
    });

    console.log("✓ Data kurikulum berhasil ditambahkan");
  } catch (error) {
    console.error("Error seeding curriculum:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCurriculum();
