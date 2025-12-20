import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import KnowledgeImg from "@/components/KnowledgeImg";
export default function Curiculum() {
  const kurikulum = [
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

  const matkulPilihan = [
    {
      bidang: "Enterprise Resource Planning",
      matkul: [
        { nama: "Manajemen Proses Bisnis", sks: 3 },
        { nama: "Arsitektur Enterprise", sks: 3 },
        { nama: "Analisis Proses Bisnis Lanjut", sks: 3 },
        { nama: "Komputasi Awan", sks: 3 },
      ],
    },
    {
      bidang: "Tata Kelola TI",
      matkul: [
        { nama: "Perencanaan Induk Sistem Informasi", sks: 3 },
        { nama: "Estimasi Biaya Perangkat Lunak", sks: 3 },
        { nama: "Pengujian Perangkat Lunak", sks: 3 },
        { nama: "Perencanaan Keberlangsungan Bisnis", sks: 3 },
      ],
    },
    {
      bidang: "Data Science",
      matkul: [
        { nama: "Metode Peramalan", sks: 3 },
        { nama: "Sains Data Terapan", sks: 3 },
        { nama: "Pengantar Data Besar", sks: 3 },
        { nama: "Mesin Pembelajar Untuk Bisnis", sks: 3 },
      ],
    },
  ];
  return (
    <>
      <Navbar />
      {/* Body of knowledge */}
      <div className="flex flex-col justify-center items-center my-12 text-center">
        <h1 className="font-bold text-3xl lg:text-5xl">
          Body of <span className="text-red-600">Knowledge</span>
        </h1>
        <p className="mt-4 text-sm lg:text-base text-zinc-500 text-center">
          Program Studi Sistem Informasi UISI
        </p>

        {/* gambar body of knowledge */}
        <KnowledgeImg />
      </div>
      {/* End Body of knowledge */}

      {/* Curiculum */}
      <div className="xl:flex xl:flex-col justify-center items-center py-16 bg-zinc-100">
        <div className="mb-12 text-center">
          <h1 className="font-bold text-3xl lg:text-5xl text-red-600">Kurikulum</h1>
          <p className="mt-4 text-sm lg:text-base text-zinc-500">
            Program Studi Sistem Informasi UISI
          </p>
        </div>

        {/* Tabel Container */}
        {/* Table */}
        {kurikulum.map((k) => (
          <div
            key={k.semester}
            className="overflow-x-auto rounded-xl mt-6 mx-4 lg:mx-8 xl:mx-24 2xl:mx-96"
          >
            <div className="bg-red-600 px-4 py-3 font-semibold text-sm xl:text-lg text-white">
              <h1>Semester {k.semester}</h1>
            </div>
            <table className="bg-white">
              {/* head */}
              <thead className="bg-zinc-200 xl:text-xl font-semibold text-left">
                <tr className="text-sm xl:text-lg">
                  <th className="px-2 xl:px-8 py-4">No</th>
                  <th className="px-4">Mata Kuliah</th>
                  <th className="px-8 xl:px-80">SKS</th>
                </tr>
              </thead>
              <tbody className="text-left">
                {k.matkul.map((mk, index) => (
                  <tr key={index} className="border-b border-zinc-200 text-sm xl:text-base">
                    <td className="px-4 text-center py-4">
                      {(k.semester === 7 && (index === 3 || index === 4)) ||
                      (k.semester === 8 && (index === 2 || index === 3))
                        ? " "
                        : index + 1}
                    </td>
                    <td className="px-4 py-4 w-full xl:w-96">{mk.nama}</td>
                    <td className="px-8 xl:px-80">{mk.sks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-zinc-200 px-4 py-4 font-semibold text-sm xl:text-lg">
              <div className="flex justify-between">
                <h1 className="">Total SKS</h1>
                <h2 className="xl:px-72">
                  {k.matkul.reduce((total, mk) => total + mk.sks, 0)} SKS
                </h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mata Kuliah Pilihan */}
      <div className="xl:flex xl:flex-col justify-center items-center pb-24 bg-zinc-100">
        <div className="overflow-x-auto rounded-xl mt-6 mx-4 lg:mx-8 xl:mx-24 2xl:mx-96">
          <div className="w-[993px] lg:w-[1076px] 2xl:w-[1127px] bg-red-600 px-4 py-3 font-semibold text-sm xl:text-lg text-white">
            <h1>Mata Kuliah Pilihan</h1>
          </div>

          <table className="bg-white w-max">
            {/* head */}
            <thead className="bg-zinc-200 xl:text-xl font-semibold text-left flex">
              <tr className="text-sm xl:text-lg">
                {matkulPilihan.map((mt, index) => (
                  <th
                    key={mt.bidang}
                    className={`px-4 py-4 pr-20 ${
                      index === 1 ? "pr-66" : "pr-12"
                    }`}
                  >
                    {mt.bidang}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-left flex">
              {matkulPilihan.map((mp, index) => (
                <thead key={index}>
                  {/* Baris "Mata Kuliah" dan "SKS" */}
                  <tr>
                    <td className="px-4 pr-8 2xl:pr-12 py-4">Mata Kuliah</td>
                    <td className="px-4 pr-5 py-2 border-x border-zinc-200">
                      SKS
                    </td>
                  </tr>
                  {/* Daftar mata kuliah */}

                  {mp.matkul.map((mk, index) => (
                    <tr
                      key={index}
                      className="border border-zinc-200 text-sm xl:text-base"
                    >
                      <td className="px-4 pr-8 2xl:pr-12 py-4">{mk.nama}</td>
                      <td className="px-4 pr-5 py-4 text-center border-l border-zinc-200">
                        {mk.sks}
                      </td>
                    </tr>
                  ))}
                </thead>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* End Curiculum */}

      {/* Footer */}
      <Footer />
      {/* End Footer */}
    </>
  );
}
