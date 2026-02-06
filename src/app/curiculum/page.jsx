"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import KnowledgeImg from "@/components/KnowledgeImg";

export default function Curiculum() {
  const [loading, setLoading] = useState(true);
  const [curriculumData, setCurriculumData] = useState({
    title: "Kurikulum",
    subtitle: "Program Studi Sistem Informasi UISI",
    data: [],
  });

  useEffect(() => {
    async function fetchCurriculum() {
      try {
        const response = await fetch("/api/curriculum");
        if (response.ok) {
          const data = await response.json();
          setCurriculumData({
            title: data.title || "Kurikulum",
            subtitle: data.subtitle || "Program Studi Sistem Informasi UISI",
            data: data.data || [],
          });
        }
      } catch (error) {
        console.error("Error fetching curriculum:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCurriculum();
  }, []);

  const kurikulum = curriculumData.data;

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
      <div className="flex flex-col justify-center items-center my-8 md:my-10 lg:my-12 text-center px-4">
        <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
          Body of <span className="text-red-600">Knowledge</span>
        </h1>
        <p className="mt-3 md:mt-4 text-xs md:text-sm lg:text-base text-zinc-500 text-center">
          Program Studi Sistem Informasi UISI
        </p>

        {/* gambar body of knowledge */}
        <KnowledgeImg />
      </div>
      {/* End Body of knowledge */}

      {/* Curiculum */}
      <div className="xl:flex xl:flex-col justify-center items-center py-12 md:py-14 lg:py-16 bg-zinc-100">
        <div className="mb-8 md:mb-10 lg:mb-12 text-center px-4">
          <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-red-600">
            {curriculumData.title}
          </h1>
          <p className="mt-3 md:mt-4 text-xs md:text-sm lg:text-base text-zinc-500">
            {curriculumData.subtitle}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-6 md:py-8">
            <p className="text-base md:text-lg text-gray-500">Loading data kurikulum...</p>
          </div>
        ) : kurikulum.length === 0 ? (
          <div className="text-center py-6 md:py-8">
            <p className="text-base md:text-lg text-gray-500">Data kurikulum belum tersedia</p>
          </div>
        ) : (
          <>
            {/* Tabel Container */}
            {/* Table */}
            {kurikulum.map((k) => (
              <div
                key={k.semester}
                className="overflow-x-auto rounded-xl mt-4 md:mt-5 lg:mt-6 mx-4 md:mx-6 lg:mx-8 xl:mx-24 2xl:mx-96"
              >
                <div className="bg-red-600 px-3 md:px-4 py-2.5 md:py-3 font-semibold text-xs md:text-sm lg:text-base xl:text-lg text-white">
                  <h1>Semester {k.semester}</h1>
                </div>
                <table className="bg-white w-full">
                  {/* head */}
                  <thead className="bg-zinc-200 xl:text-xl font-semibold text-left">
                    <tr className="text-xs md:text-sm lg:text-base xl:text-lg">
                      <th className="px-2 md:px-4 xl:px-8 py-3 md:py-4">No</th>
                      <th className="px-3 md:px-4">Mata Kuliah</th>
                      <th className="px-6 md:px-8 lg:px-40 xl:px-80">SKS</th>
                    </tr>
                  </thead>
                  <tbody className="text-left">
                    {k.matkul.map((mk, index) => (
                      <tr key={index} className="border-b border-zinc-200 text-xs md:text-sm lg:text-base">
                        <td className="px-2 md:px-4 text-center py-3 md:py-4">
                          {(k.semester === 7 && (index === 3 || index === 4)) ||
                          (k.semester === 8 && (index === 2 || index === 3))
                            ? " "
                            : index + 1}
                        </td>
                        <td className="px-3 md:px-4 py-3 md:py-4 w-full xl:w-96">{mk.nama}</td>
                        <td className="px-6 md:px-8 lg:px-40 xl:px-80">{mk.sks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-zinc-200 px-3 md:px-4 py-3 md:py-4 font-semibold text-xs md:text-sm lg:text-base xl:text-lg">
                  <div className="flex justify-between">
                    <h1 className="">Total SKS</h1>
                    <h2 className="lg:px-36 xl:px-72">
                      {k.matkul.reduce((total, mk) => total + mk.sks, 0)} SKS
                    </h2>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Mata Kuliah Pilihan */}
      <div className="xl:flex xl:flex-col justify-center items-center pb-12 md:pb-16 lg:pb-24 bg-zinc-100">
        <div className="overflow-x-auto rounded-xl mt-4 md:mt-5 lg:mt-6 mx-4 md:mx-6 lg:mx-8 xl:mx-24 2xl:mx-96">
          <div className="w-[800px] md:w-[900px] lg:w-[993px] xl:w-[1076px] 2xl:w-[1127px] bg-red-600 px-3 md:px-4 py-2.5 md:py-3 font-semibold text-xs md:text-sm lg:text-base xl:text-lg text-white">
            <h1>Mata Kuliah Pilihan</h1>
          </div>

          <div className="bg-white w-max flex">
            {/* head */}
            {matkulPilihan.map((mp, index) => (
              <div key={index}>
                <div className="bg-zinc-200 xl:text-xl font-semibold text-left text-xs md:text-sm lg:text-base px-3 md:px-4 py-3 md:py-4 pr-16 md:pr-18 lg:pr-20">
                  {mp.bidang}
                </div>
                <table>
                  <tbody className="text-left">
                    {/* Baris "Mata Kuliah" dan "SKS" */}
                    <tr className="text-xs md:text-sm lg:text-base">
                      <td className="px-3 md:px-4 pr-6 md:pr-8 2xl:pr-12 py-3 md:py-4">Mata Kuliah</td>
                      <td className="px-3 md:px-4 pr-4 md:pr-5 py-2 border-x border-zinc-200">
                        SKS
                      </td>
                    </tr>
                    {/* Daftar mata kuliah */}
                    {mp.matkul.map((mk, mkIndex) => (
                      <tr
                        key={mkIndex}
                        className="border border-zinc-200 text-xs md:text-sm lg:text-base"
                      >
                        <td className="px-3 md:px-4 pr-6 md:pr-8 2xl:pr-12 py-3 md:py-4">{mk.nama}</td>
                        <td className="px-3 md:px-4 pr-4 md:pr-5 py-3 md:py-4 text-center border-l border-zinc-200">
                          {mk.sks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* End Curiculum */}

      {/* Footer */}
      <Footer />
      {/* End Footer */}
    </>
  );
}
