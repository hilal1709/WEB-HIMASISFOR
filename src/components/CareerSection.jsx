"use client"
import Erp from "../icons/Erp";
import { ArrowDown } from "../icons/ArrowDown";
import Auditor from "../icons/Auditor";
import Consultant from "../icons/Consultant";
import Analyst from "../icons/Analyst";
import { useState } from "react";
import { motion } from "motion/react";

export default function CareerSection() {
  const [activeCareer, setActiveCareer] = useState("erp");
  const carierContent = {
    erp: {
      description:
        "Berperan dalam analisis kebutuhan bisnis dan solusi/implementasi sistem (ERP, SCM, CRM) sesuaifungsi dan skala perusahaan.",
      img: "img/bidangerp.png",
    },
    auditor: {
      description:
        "Berperan dalam perencanaan, pemantauan dan evaluasi, serta pengukuran kinerja TI perusahaan, termasuk perancangan hingga evaluasi tingkat kematangan Tata Kelola TI.",
      img: "img/bidangauditor.png",
    },
    consultant: {
      description:
        "IT Consultant Berperan dalam pengolahan data dan informasi yang mendukung pengambilan keputusan atau meningkatkan nilai tambah perusahaan.",
      img: "img/bidangconsultant.png",
    },
    analyst: {
      description:
        "Berperan dalam proses supervisi, konsultasi, dan eksekusi pengelolaan proyek TI, termasuk juga dalam pengembangan sistem atau aplikasi dan penjaminan kualitas TI.",
      img: "img/bidanganalyst.png",
    },
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-center items-center gap-12 mx-4 lg:mx-0 my-16 lg:my-24">
        {/* bagian kiri */}
        <div className="w-full lg:w-fit">
          <h1 className="text-4xl lg:text-5xl font-bold text-center lg:text-left">
            Prospek Karir Lulusan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-red-500">
              Sistem Informasi UISI
            </span>
          </h1>

          {/* section karir lulusan */}
          <div className="flex flex-col gap-4 mt-12">
            {/* ERP Analyst */}
            <button
              onClick={() => setActiveCareer("erp")}
              className={`flex justify-between items-center p-4 rounded-lg ${
                activeCareer === "erp" ? "bg-zinc-100" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Icon Erp */}
                <div
                  className={`p-2  rounded-full ${
                    activeCareer === "erp"
                      ? "bg-red-600 outline-8 outline-zinc-200"
                      : "bg-zinc-200"
                  }`}
                >
                  <Erp
                    className={`h-6 ${
                      activeCareer === "erp" ? "text-white" : "text-zinc-500"
                    }`}
                  />
                </div>
                <h2 className="font-medium">Enterprise System Analyst</h2>
              </div>
              <ArrowDown className="h-6 lg:-rotate-90" />
            </button>

            {/* IT/IS Auditor */}
            <button
              onClick={() => setActiveCareer("auditor")}
              className={`flex justify-between items-center p-4 rounded-lg ${
                activeCareer === "auditor" ? "bg-zinc-100" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Icon Auditor */}
                <div
                  className={`p-2  rounded-full ${
                    activeCareer === "auditor"
                      ? "bg-red-600 outline-8 outline-zinc-200"
                      : "bg-zinc-200"
                  }`}
                >
                  <Auditor
                    className={`h-6 ${
                      activeCareer === "auditor"
                        ? "fill-white"
                        : "fill-zinc-500"
                    }`}
                  />
                </div>
                <h2 className="font-medium">IT/IS Auditor</h2>
              </div>
              <ArrowDown className="h-6 lg:-rotate-90 text-zinc-500" />
            </button>

            {/* IT Consultant */}
            <button
              onClick={() => setActiveCareer("consultant")}
              className={`flex justify-between items-center p-4 rounded-lg ${
                activeCareer === "consultant" ? "bg-zinc-100" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Icon Erp */}
                <div
                  className={`p-2  rounded-full ${
                    activeCareer === "consultant"
                      ? "bg-red-600 outline-8 outline-zinc-200"
                      : "bg-zinc-200"
                  }`}
                >
                  <Consultant
                    className={`h-6 ${
                      activeCareer === "consultant"
                        ? "fill-white"
                        : "fill-zinc-500"
                    }`}
                  />
                </div>
                <h2 className="font-medium">IT Consultant</h2>
              </div>
              <ArrowDown className="h-6 lg:-rotate-90 text-zinc-500" />
            </button>

            {/* Data Analyst */}
            <button
              onClick={() => setActiveCareer("analyst")}
              className={`flex justify-between items-center p-4 rounded-lg ${
                activeCareer === "analyst" ? "bg-zinc-100" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Icon Erp */}
                <div
                  className={`p-2 rounded-full ${
                    activeCareer === "analyst"
                      ? "bg-red-600 outline-8 outline-zinc-200"
                      : "bg-zinc-200"
                  }`}
                >
                  <Analyst
                    className={`h-6 ${
                      activeCareer === "analyst"
                        ? "fill-white"
                        : "fill-zinc-500"
                    }`}
                  />
                </div>
                <h2 className="font-medium">Data Analyst</h2>
              </div>
              <ArrowDown className="h-6 lg:-rotate-90 text-zinc-500" />
            </button>
          </div>
          {/* end button */}
        </div>

        {/* bagian kanan */}
        <motion.div
          key={activeCareer}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <img
            src={carierContent[activeCareer].img}
            alt="bidangkeahlian"
            className="border-3 border-white drop-shadow-lg rounded-2xl"
          />
          <p className="lg:w-[36rem] mx-2 lg:mx-0 mt-7 text-sm lg:text-base text-zinc-600">
            {carierContent[activeCareer].description}
          </p>
        </motion.div>

        {/* end section karir lulusan */}
      </div>
    </>
  );
}
