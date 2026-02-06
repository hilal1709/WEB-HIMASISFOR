"use client"
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { ArrowDown } from "@/icons/ArrowDown";
import Gallery from "@/components/GalleryAward";
import Footer from "@/components/Footer";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "motion/react";

export default function Students() {
  const [open, setOpen] = useState("dosen");
  const [expand, setExpand] = useState(false);
  const [dataDosen, setDataDosen] = useState([]);
  const [dataMahasiswa, setDataMahasiswa] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      
      // Fetch dosen achievements
      const resDosen = await fetch('/api/achievements?category=dosen');
      const jsonDosen = await resDosen.json();
      
      // Fetch mahasiswa achievements
      const resMahasiswa = await fetch('/api/achievements?category=mahasiswa');
      const jsonMahasiswa = await resMahasiswa.json();
      
      if (jsonDosen.success) {
        setDataDosen(jsonDosen.data);
      }
      
      if (jsonMahasiswa.success) {
        setDataMahasiswa(jsonMahasiswa.data);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTable = (table) => {
    setOpen(table);
    setExpand(null);
  };

  const toggleExpand = (index) => {
    setExpand(expand === index ? null : index);
  };

  const data = open === "dosen" ? dataDosen : dataMahasiswa;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl font-semibold">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <article className="max-w-7xl mx-auto my-12 md:my-16 lg:my-24 px-4">
        <div className="md:mx-4 lg:mx-8">
          <section className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 md:gap-4">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold">
                Data Prestasi dan Rekognisi
              </h1>
              <h3 className="text-sm md:text-base lg:text-lg 2xl:text-xl font-serif mt-1 md:mt-2">
                Sistem Informasi UISI
              </h3>
            </div>

            {/* button dosen dan mahasiswa */}
            <div className="w-full sm:w-fit flex mt-3 lg:mt-0 p-1 rounded-xl bg-zinc-100 text-xs md:text-sm lg:text-base xl:text-lg font-semibold">
              <button
                onClick={() => openTable("dosen")}
                className={`flex-1 sm:flex-none px-4 md:px-6 lg:px-8 py-2 md:py-2.5 rounded-lg cursor-pointer transition-colors ${
                  open === "dosen"
                    ? "bg-red-600 text-white font-semibold"
                    : "text-black font-medium"
                }`}
              >
                Dosen
              </button>
              <button
                onClick={() => openTable("mahasiswa")}
                className={`flex-1 sm:flex-none px-4 md:px-6 lg:px-8 py-2 md:py-2.5 rounded-lg cursor-pointer transition-colors ${
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
              className="mt-6 md:mt-8 lg:mt-12"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                scale: { type: "spring", visualDuration: 0.4, bounce: 0.1 },
              }}
            >
              <div className="bg-red-600 px-3 md:px-4 py-2.5 md:py-3 font-semibold text-xs md:text-sm lg:text-base xl:text-lg text-white rounded-t-xl">
                <h1>{open === "dosen" ? "Dosen" : "Mahasiswa"} Sistem Informasi</h1>
              </div>

              {/* table */}
              <div className="relative overflow-x-auto border border-zinc-200 rounded-b-xl">
                <div className="flex w-max lg:w-full px-3 md:px-4 py-3 md:py-4 bg-zinc-200 font-semibold text-xs md:text-sm lg:text-base xl:text-lg lg:min-w-[700px] whitespace-nowrap">
                  <h3 className="px-2 md:px-2 lg:px-4 pr-6 md:pr-8 lg:pr-10">No</h3>
                  <h3 className="pr-16 md:pr-20 lg:pr-24 xl:pr-46">Nama {open === "dosen" ? "Dosen" : "Mahasiswa"}</h3>
                  <h3 className="lg:pr-47 px-10 md:px-12 lg:px-15 xl:px-24">Pencapaian</h3>
                  <h3 className="pl-32 md:pl-36 lg:pl-42 xl:pl-43 pr-12 md:pr-14 lg:pr-17 xl:pr-20">Tingkatan</h3>
                  <h3>Tahun</h3>
                  <div className="lg:hidden w-12 md:w-16 lg:w-0"></div>
                </div>
                {data.length === 0 ? (
                  <div className="text-center py-6 md:py-8 text-gray-500 text-sm md:text-base">
                    Tidak ada data prestasi
                  </div>
                ) : (
                  <>
                    {data.map((prestasi, index) => (
                      <div key={index} className="lg:min-w-[700px]">
                      {expand !== index ? (
                        <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm lg:text-base px-3 md:px-4 py-3 md:py-4 border-t border-zinc-200">
                          <h3 className="lg:w-18 px-3 md:px-4 lg:px-6">{index + 1}</h3>
                          <div className="flex items-center gap-2 md:gap-3 lg:gap-4 w-48 md:w-52 lg:w-58 xl:w-78 shrink-0 lg:shrink">
                            <img
                              src={prestasi.img}
                              alt="img"
                              className="h-8 md:h-9 lg:h-10 xl:h-14"
                            />
                            <h3 className="line-clamp-2">{prestasi.nama}</h3>
                          </div>
                          <div className="w-64 md:w-72 lg:w-80 xl:w-130 shrink-0 lg:shrink px-3 md:px-4 lg:px-18">
                            {prestasi.pencapaian[0].nama}
                          </div>
                          <h3 className="w-28 md:w-32 lg:w-32 xl:w-40 shrink-0 lg:shrink text-xs md:text-sm lg:text-base">
                            {prestasi.pencapaian[0].tingkatan}
                          </h3>
                          <h3 className="w-10 md:w-12 lg:w-12 xl:w-24 shrink-0 lg:shrink text-xs md:text-sm lg:text-base">
                            {prestasi.pencapaian[0].tahun}
                          </h3>
                          <div className="px-2 md:px-3 lg:px-4 xl:px-0 lg:w-10 text-right">
                            {prestasi.pencapaian.length > 1 && (
                              <button
                                onClick={() => toggleExpand(index)}
                                className="h-fit p-0.5 md:p-1 rounded-lg shadow-md"
                              >
                                <ArrowDown
                                  className={`text-zinc-600 h-4 md:h-5 transition-transform duration-300 ${
                                    expand === index ? "rotate-180" : "rotate-0"
                                  }`}
                                />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          {prestasi.pencapaian.map((item, i) => (
                            <motion.div
                              key={`${index}-${i}`}
                              className="flex items-center gap-1 md:gap-2 text-xs md:text-sm lg:text-base px-3 md:px-4 py-3 md:py-4 border-t border-zinc-200"
                              animate={{ opacity: 1, y: 0 }}
                              initial={{ opacity: 0, y: 20 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.15 }}
                            >
                              <h3 className="lg:w-18 px-3 md:px-4 lg:px-6">
                                {i === 0 ? index + 1 : ""}
                              </h3>
                              <div className="flex items-center gap-2 md:gap-3 lg:gap-4 w-48 md:w-52 lg:w-58 xl:w-78 shrink-0 lg:shrink">
                                {i === 0 ? (
                                  <>
                                    <img
                                      src={prestasi.img}
                                      alt="img"
                                      className="h-8 md:h-9 lg:h-10 xl:h-14"
                                    />
                                    <h3 className="line-clamp-2">{prestasi.nama}</h3>
                                  </>
                                ) : (
                                  <div />
                                )}
                              </div>
                              <div className="w-64 md:w-72 lg:w-74 xl:w-130 shrink-0 lg:shrink px-3 md:px-4 lg:px-18">
                                {item.nama}
                              </div>
                              <h3 className="w-28 md:w-32 lg:w-32 xl:w-40 shrink-0 lg:shrink text-xs md:text-sm lg:text-base">
                                {item.tingkatan}
                              </h3>
                              <h3 className="w-10 md:w-12 lg:w-12 xl:w-24 shrink-0 lg:shrink text-xs md:text-sm lg:text-base">
                                {item.tahun}
                              </h3>
                              <div className="px-2 md:px-3 lg:px-4 xl:px-0 lg:w-10 text-right">
                                {i === prestasi.pencapaian.length - 1 && (
                                  <button
                                    onClick={() => toggleExpand(index)}
                                    className="h-fit p-0.5 md:p-1 rounded-lg shadow-md"
                                  >
                                    <ArrowDown
                                      className={`text-zinc-600 h-4 md:h-5 transition-transform duration-300 ${
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
                        </>
                      )}
                    </div>
                  ))}
                  </>
                )}
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
