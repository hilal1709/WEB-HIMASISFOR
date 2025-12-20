"use client"


import { useState } from "react";

export default function AwardingRecognition() {
  const dataPrestasi = [
    {
      img: "img/award1.png",
      awardtype: "Awardee",
      type: "lecturer",
      title:
        "Penelitian Hibah The World Academy of Science (TWAS) UNESCO 2021-2023",
      name: "Brina Miftahurrohmah, S.Si., M.Si., MCE, MCF",
    },
    {
      img: "img/award2.png",
      awardtype: "Awardee",
      type: "lecturer",
      title:
        "Penelitian Hibah The World Academy of Science (TWAS) UNESCO 2021-2023",
      name: "Brina Miftahurrohmah, S.Si., M.Si., MCE, MCF",
    },
    {
      img: "img/award3.png",
      awardtype: "Awardee",
      type: "lecturer",
      title:
        "Penelitian Hibah The World Academy of Science (TWAS) UNESCO 2021-2023",
      name: "Brina Miftahurrohmah, S.Si., M.Si., MCE, MCF",
    },
    {
      img: "img/award4.png",
      awardtype: "Awardee",
      type: "lecturer",
      title:
        "Penelitian Hibah The World Academy of Science (TWAS) UNESCO 2021-2023",
      name: "Brina Miftahurrohmah, S.Si., M.Si., MCE, MCF",
    },
    {
      img: "img/award5.png",
      awardtype: "Awardee",
      type: "lecturer",
      title:
        "Penelitian Hibah The World Academy of Science (TWAS) UNESCO 2021-2023",
      name: "Brina Miftahurrohmah, S.Si., M.Si., MCE, MCF",
    },
    {
      img: "img/award6.png",
      awardtype: "Awardee",
      type: "lecturer",
      title:
        "Penelitian Hibah The World Academy of Science (TWAS) UNESCO 2021-2023",
      name: "Brina Miftahurrohmah, S.Si., M.Si., MCE, MCF",
    },
    {
      img: "img/award7.png",
      awardtype: "Awardee",
      type: "student",
      title:
        "Penelitian Hibah The World Academy of Science (TWAS) UNESCO 2021-2023",
      name: "Kocask",
    },
    {
      img: "img/award7.png",
      awardtype: "Awardee",
      type: "student",
      title:
        "Penelitian Hibah The World Academy of Science (TWAS) UNESCO 2021-2023",
      name: "Kocask",
    },
    {
      img: "img/award7.png",
      awardtype: "Awardee",
      type: "student",
      title:
        "Penelitian Hibah The World Academy of Science (TWAS) UNESCO 2021-2023",
      name: "Kocask",
    },
    {
      img: "img/award7.png",
      awardtype: "Awardee",
      type: "student",
      title:
        "Penelitian Hibah The World Academy of Science (TWAS) UNESCO 2021-2023",
      name: "Kocask",
    },
    {
      img: "img/award7.png",
      awardtype: "Awardee",
      type: "student",
      title:
        "Penelitian Hibah The World Academy of Science (TWAS) UNESCO 2021-2023",
      name: "Kocask",
    },
    {
      img: "img/award7.png",
      awardtype: "Awardee",
      type: "student",
      title:
        "Penelitian Hibah The World Academy of Science (TWAS) UNESCO 2021-2023",
      name: "Kocask",
    },
  ];

  const [toggleAwardee, setToggleAwardee] = useState("lecturer");
  const filteredPrestasi = dataPrestasi.filter(
    (prestasi) => prestasi.type === toggleAwardee
  );

  return (
    <>
      <div className="relative flex justify-center items-center">
        <img
          src="/img/awardingbg.svg"
          alt="awarding"
          className="w-full h-[96rem] lg:h-[60rem] object-cover"
        />

        {/* content container */}
        <div className="absolute flex flex-col justify-center items-center text-white">
          <h1 className="text-3xl lg:text-4xl 2xl:text-5xl font-bold">
            Prestasi dan Rekognisi
          </h1>
          <p className="mt-6 text-sm 2xl:text-base">
            Berikut merupakan prestasi dan rekognisi yang diperoleh <br /> dosen
            maupun mahasiswa sistem informasi UISI
          </p>

          {/* button mahasiswa dan dosen */}
          <div className="w-fit mt-6 flex gap-1 p-1 bg-white rounded-xl">
            <button
              onClick={() => setToggleAwardee("lecturer")}
              className={`px-8 lg:px-9 py-2 font-medium 2xl:text-lg rounded-xl hover:cursor-pointer ${
                toggleAwardee === "lecturer"
                  ? "bg-red-600 font-semibold text-white"
                  : "text-zinc-600"
              }`}
            >
              Dosen
            </button>
            <button
              onClick={() => setToggleAwardee("student")}
              className={`px-8 lg:px-9 py-2 font-medium 2xl:text-lg rounded-xl hover:cursor-pointer ${
                toggleAwardee === "student"
                  ? "bg-red-600 font-semibold text-white"
                  : "text-zinc-600"
              }`}
            >
              Mahasiswa
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 my-12 mx-4 lg:mx-0">
            {filteredPrestasi.map((prestasi, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 border border-white rounded-xl"
              >
                <img
                  src={prestasi.img}
                  alt="imgprestasi"
                  className="h-28 2xl:h-max"
                />
                <div className="flex flex-col items-start gap-2">
                  <h1 className="font-bold 2xl:text-xl">
                    {prestasi.awardtype}
                  </h1>
                  <h2 className="lg:w-72 text-sm">{prestasi.title}</h2>
                  <h3 className="px-4 py-2 font-semibold text-xs text-red-600 bg-white rounded-md">
                    {prestasi.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
          {/* button selengkapnya */}
          <a
            href="#"
            className="px-4 lg:px-6 py-2 lg:py-3 font-semibold text-sm text-red-600 bg-white rounded-xl drop-shadow-lg"
          >
            Selengkapnya
          </a>
        </div>
      </div>
    </>
  );
}
