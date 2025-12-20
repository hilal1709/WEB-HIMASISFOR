"use client"
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { ArrowDown } from "@/icons/ArrowDown";
import Gallery from "@/components/GalleryAward";
import Footer from "@/components/Footer";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "motion/react";

export default function Students() {
  const [open, setOpen] = useState("dosen");
  const [expand, setExpand] = useState(false);

  const openTable = (table) => {
    setOpen(table);
    setExpand(null);
  };

  const toggleExpand = (index) => {
    setExpand(expand === index ? null : index);
  };

  const dataDosen = [
    {
      nama: "Grandys Frieska Prassida, S.Kom., M.Kom., Ph.D., MCE, CIIQA",
      pencapaian: [
        {
          nama: "Reviewer, Moderator, dan Presenter (Online) Information Systems International Conference (ISICO) 2023",
          tingkatan: "Internasional",
          tahun: 2023,
        },
        {
          nama: "Second Place Excellent Paper Award International Big Data and ERP Conference 2020",
          tingkatan: "Internasional",
          tahun: 2020,
        },
      ],
      img: "../img/dosen/grandys.png",
    },
    {
      nama: "Tikno, S.T., M.Kom.",
      pencapaian: [
        {
          nama: "Moderator dan Reviewer (Online) Information Systems International Conference (ISICO) 2023",
          tingkatan: "Internasional",
          tahun: 2023,
        },
        {
          nama: "Reviewer, Moderator, dan Presenter (Online) Information Systems International Conference (ISICO) 2023",
          tingkatan: "Internasional",
          tahun: 2023,
        },
      ],

      img: "../img/dosen/tikno.png",
    },
    {
      nama: "Brina Miftahurrohmah, S.Si., M.Si., MCE, MCF",
      pencapaian: [
        {
          nama: "Moderator, Presenter, dan Reviewer Information Systems International Conference (ISICO) 2019, 2021, dan 2023",
          tingkatan: "Internasional",
          tahun: "2019, 2021, 2023",
        },
        {
          nama: "Peserta Terbaik Pelatihan Applied Approach (AA) Bagi Dosen Umum Batch 4 di Direktorat Inovasi dan Pengembangan Pendidikan UNAIR 13 - 17 Juni 2022",
          tingkatan: "Nasional",
          tahun: 2022,
        },
        {
          nama: "Instruktur Digital Talent Scholarship Fresh Graduate Academy Kementerian Komunikasi dan Informatika 2022",
          tingkatan: "Nasional",
          tahun: 2022,
        },
        {
          nama: "Penelitian Hibah The World Academy of Science (TWAS) UNESCO 2021-2023",
          tingkatan: "Nasional",
          tahun: 2021,
        },
        {
          nama: "Pendanaan UNESCO Penelitian Internasional (Project SRMGI dengan BMKG) 2018 - 2021",
          tingkatan: "Nasional",
          tahun: 2018,
        },
      ],
      img: "../img/dosen/brina.png",
    },
    {
      nama: "Catur W., S.Kom., M.Sc., MCE, MOS",
      pencapaian: [
        {
          nama: "Moderator dan Reviewer Information Systems International Conference (ISICO) 2019 dan 2023",
          tingkatan: "Internasional",
          tahun: "2019, 2023",
        },
        {
          nama: "Instruktur Digital Talent Scholarship Fresh Graduate Academy Kementerian Komunikasi dan Informatika 2022",
          tingkatan: "Nasional",
          tahun: 2022,
        },
      ],
      img: "../img/dosen/catur.png",
    },
    {
      nama: "Dr. Putri Amelia, S.T., M.T., M.Eng., MCE, MOS",
      pencapaian: [
        {
          nama: "Moderator dan Reviewer Information Systems International Conference (ISICO) 2019 dan 2021",
          tingkatan: "Internasional",
          tahun: "2019, 2021",
        },
      ],
      img: "../img/dosen/putri.png",
    },
    // {
    //   nama: "Ardhi Dwi Firmansyah, S.Kom., M.Kom., MCE",
    //   pencapaian: [
    //     {
    //       nama: "Reviewer, Moderator, dan Presenter (Online) Information Systems International Conference (ISICO) 2023",
    //       tingkatan: "Internasional",
    //       tahun: 2023,
    //     },
    //     {
    //       nama: "Reviewer, Moderator, dan Presenter (Online) Information Systems International Conference (ISICO) 2023",
    //       tingkatan: "Internasional",
    //       tahun: 2023,
    //     },
    //   ],
    //   tingkatan: "Internasional",
    //   tahun: 2023,
    //   img: "../img/dosen/ardhi.png",
    // },
  ];

  const dataMahasiswa = [
    {
      nama: "Sony Abdhillah",
      pencapaian: [
        {
          nama: "Finalis 10 Besar Lomba Desain Toko Online Kompetisi The 9th UTU Awards Universitas Teuku Umar Aceh",
          tingkatan: "Nasional",
          tahun: "2023",
        },
      ],
      img: "../img/mhs/sony.png",
    },
    {
      nama: "Muhammad Fajar Ramadhoni",
      pencapaian: [
        {
          nama: "Finalis 10 Besar Lomba Desain Toko Online Kompetisi The 9th UTU Awards Universitas Teuku Umar Aceh",
          tingkatan: "Nasional",
          tahun: "2023",
        },
      ],
      img: "../img/mhs/fajar.png",
    },
    {
      nama: "Uston Nawawi Christanto",
      pencapaian: [
        {
          nama: "Finalis 10 Besar Lomba Desain Toko Online Kompetisi The 9th UTU Awards Universitas Teuku Umar Aceh",
          tingkatan: "Nasional",
          tahun: "2023",
        },
      ],
      img: "../img/mhs/uston.png",
    },
    {
      nama: "Arif Muhammad Iqbal",
      pencapaian: [
        {
          nama: "Delegasi Mahasiswa The 4th Indonesia Human Capital Summit 2023",
          tingkatan: "Nasional",
          tahun: "2023",
        },
      ],
      img: "../img/mhs/arif.png",
    },
    {
      nama: "Puji Astutik",
      pencapaian: [
        {
          nama: "Presenter (On-Site) Information Systems International Conference (ISICO) 2023",
          tingkatan: "Internasional",
          tahun: "2023",
        },
      ],
      img: "../img/mhs/puji.png",
    },
    {
      nama: "Felix Atmaja",
      pencapaian: [
        {
          nama: "Presenter (Online) Information Systems International Conference (ISICO) 2023",
          tingkatan: "Internasional",
          tahun: "2023",
        },
      ],
      img: "../img/mhs/felix.png",
    },
    {
      nama: "Ahmat Rendi Saputra",
      pencapaian: [
        {
          nama: "Juara 1 Tanding Kelas Putra Tingkat Mahasiswa/Dewasa Kejuaraan Pencak Silat Jember National Championship 1 Tahun 2023",
          tingkatan: "Nasional",
          tahun: "2023",
        },
        {
          nama: "Juara 2 Kejurnas Pencak Silat PSHT Kategori Seni Tunggal UNEJ CUP VI",
          tingkatan: "Nasional",
          tahun: "2023",
        },
        {
          nama: "Juara 2 Seni Tunggal Tangan Kosong Tingkat Mahasiswa/Dewasa Kejuaraan Pencak Silat Jember National Championship 1 Tahun 2023",
          tingkatan: "Nasional",
          tahun: "2023",
        },
      ],
      img: "../img/mhs/rendi.png",
    },
    {
      nama: "Fairianto Alfandy Firmanza",
      pencapaian: [
        {
          nama: "Juara 1 & 2 Microsoft Office Specialist National Championship 2021",
          tingkatan: "Nasional",
          tahun: "2021",
        },
      ],
      img: "../img/mhs/fairianto.png",
    },
    {
      nama: "Abror Aqomaddin",
      pencapaian: [
        {
          nama: "Juara 1 & 2 Microsoft Office Specialist National Championship 2021",
          tingkatan: "Nasional",
          tahun: "2021",
        },
      ],
      img: "../img/mhs/abror.png",
    },
  ];

  const data = open === "dosen" ? dataDosen : dataMahasiswa;

  return (
    <>
      <Navbar />
      <article className="max-w-7xl mx-auto my-24">
        <div className="mx-4 lg:mx-8">
          <section className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2">
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold">
                Data Prestasi dan Rekognisi
              </h1>
              <h3 className="2xl:text-xl font-serif mt-2">
                Sistem Informasi UISI
              </h3>
            </div>

            {/* button dosen dan mahasiswa */}
            <div className="w-fit flex mt-4 lg:mt-0 p-1 rounded-xl bg-zinc-100 text-sm lg:text-lg font-semibold">
              <button
                onClick={() => openTable("dosen")}
                className={`px-8 py-2 rounded-lg cursor-pointer ${
                  open === "dosen"
                    ? "bg-red-600 text-white font-semibold"
                    : "text-black font-medium"
                }`}
              >
                Dosen
              </button>
              <button
                onClick={() => openTable("mahasiswa")}
                className={`px-8 py-2 rounded-lg cursor-pointer ${
                  open === "mahasiswa"
                    ? "bg-red-600 text-white font-semibold"
                    : "text-black font-medium"
                }`}
              >
                Mahasiswa
              </button>
            </div>
          </section>

          <AnimatePresence>
            <motion.div
              key={open}
              className="mt-4 lg:mt-12"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                scale: { type: "spring", visualDuration: 0.4, bounce: 0.1 },
              }}
            >
              <div className="bg-red-600 px-4 py-3 font-semibold text-sm xl:text-lg text-white rounded-t-xl">
                <h1>Dosen Sistem Informasi</h1>
              </div>

              {/* table */}
              <div className="relative overflow-x-auto border border-zinc-200 rounded-b-xl">
                <div className="flex w-max lg:w-full px-4 py-4 bg-zinc-200 font-semibold text-sm lg:text-lg lg:min-w-[700px] whitespace-nowrap">
                  <h3 className="px-2 lg:px-4 pr-8 lg:pr-10">No</h3>
                  <h3 className="pr-24 lg:pr-46">Nama Dosen</h3>
                  <h3 className="lg:pr-47 px-15 lg:px-24">Pencapaian</h3>
                  <h3 className="pl-43 lg:pl-42 pr-17 lg:pr-20">Tingkatan</h3>
                  <h3>Tahun</h3>
                  <div className="lg:hidden w-16 lg:w-0"></div>
                </div>
                {data.map((prestasi, index) => (
                  <div key={index} className="lg:min-w-[700px]">
                    {expand !== index ? (
                      <div className="flex items-center gap-2 text-sm lg:text-base px-4 py-4 border-t border-zinc-200">
                        <h3 className="lg:w-18 px-4 lg:px-6">{index + 1}</h3>
                        <div className="flex items-center gap-4 w-58 lg:w-78 shrink-0 lg:shrink">
                          <img
                            src={prestasi.img}
                            alt="img"
                            className="h-10 lg:h-14"
                          />
                          <h3>{prestasi.nama}</h3>
                        </div>
                        <div className="w-80 lg:w-130 shrink-0 lg:shrink px-4 lg:px-18">
                          {prestasi.pencapaian[0].nama}
                        </div>
                        <h3 className="w-32 lg:w-40 shrink-0 lg:shrink">
                          {prestasi.pencapaian[0].tingkatan}
                        </h3>
                        <h3 className="w-12 lg:w-24 shrink-0 lg:shrink">
                          {prestasi.pencapaian[0].tahun}
                        </h3>
                        <div className="px-4 lg:px-0 lg:w-10 text-right">
                          {prestasi.pencapaian.length > 1 && (
                            <button
                              onClick={() => toggleExpand(index)}
                              className="h-fit p-1 rounded-lg shadow-md"
                            >
                              <ArrowDown
                                className={`text-zinc-600 h-5 transition-transform duration-300 ${
                                  expand === index ? "rotate-180" : "rotate-0"
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {prestasi.pencapaian.map((item, i) => (
                          <motion.div
                            key={i}
                            className="flex items-center gap-2 text-sm lg:text-base px-4 py-4 border-t border-zinc-200"
                            animate={{ opacity: 1, y: 0 }}
                            initial={{ opacity: 0, y: 20 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.15 }}
                          >
                            <h3 className="lg:w-18 px-4 lg:x-6">
                              {i === 0 ? index + 1 : ""}
                            </h3>
                            <div className="flex items-center gap-4 w-58 lg:w-78 shrink-0 lg:shrink">
                              {i === 0 ? (
                                <>
                                  <img
                                    src={prestasi.img}
                                    className="h-10 lg:h-14"
                                  />
                                  <h3>{prestasi.nama}</h3>
                                </>
                              ) : (
                                <div />
                              )}
                            </div>
                            <div className="w-74 lg:w-130 shrink-0 lg:shrink px-4 lg:px-18">
                              {item.nama}
                            </div>
                            <h3 className="w-32 lg:w-40 shrink-0 lg:shrink">
                              {item.tingkatan}
                            </h3>
                            <h3 className="w-12 lg:w-24 shrink-0 lg:shrink">
                              {item.tahun}
                            </h3>
                            <div className="px-4 lg:px-0 lg:w-10 text-right">
                              {i === 0 && prestasi.pencapaian.length > 1 && (
                                <button
                                  onClick={() => toggleExpand(index)}
                                  className="h-fit p-1 rounded-lg shadow-md"
                                >
                                  <ArrowDown
                                    className={`text-zinc-600 h-5 transition-transform duration-300 ${
                                      expand === index
                                        ? "rotate-180"
                                        : "rotate-0"
                                    }`}
                                  />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </article>
      <Gallery />
      <Footer />
    </>
  );
}
