"use client";
import { useEffect, useRef } from "react";
import { Play } from "../icons/Play";
import SplitType from "split-type";
import { animate, stagger } from "motion";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";

export default function Hero() {
  const containerRef = useRef(null);

  useEffect(() => {
    document.fonts.ready.then(() => {
      if (!containerRef.current) return;

      containerRef.current.style.visibility = "visible";

      const h1 = containerRef.current.querySelector("h1");
      const h3 = containerRef.current.querySelector("h3");

      const h1Split = new SplitType(h1, { types: "words" });
      const h3Split = new SplitType(h3, { types: "words" });

      animate(
        h1Split.words,
        { opacity: [0, 1], y: [10, 0] },
        {
          type: "spring",
          stiffness: 200,
          damping: 30,
          delay: stagger(0.05),
        }
      );

      animate(
        h3Split.words,
        { opacity: [0, 1], y: [10, 0] },
        {
          type: "spring",
          stiffness: 200,
          damping: 30,
          delay: stagger(0.05),
        }
      );
    });
  }, []);

  return (
    <section className="-mt-18 lg:-mt-16">
      {/* top circle */}
      <img src="img/heroCircle.svg" alt="HeroCircle" className="h-40 -z-10" />

      {/* content */}
      <main className="flex flex-col lg:flex-row justify-center items-center gap-12 lg:-mt-10">
        <motion.img
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.5,
            scale: { type: "spring", visualDuration: 0.7, bounce: 0.1 },
          }}
          src="img/heroPict.png"
          alt="heroPict"
          className="lg:h-100"
        />

        {/* introduce */}
        <div className="mx-4 lg:mx-0">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1.5,
              scale: { type: "spring", visualDuration: 0.9, bounce: 0.1 },
            }}
            className="w-fit px-4 py-1 rounded-lg border border-red-400 bg-red-50 font-semibold text-red-600 text-xs 2xl:text-sm tracking-wide"
          >
            SISFOR UISI
          </motion.div>
          <div ref={containerRef} className="invisible">
            <h1 className="w-90 lg:w-120 font-bold text-4xl lg:text-5xl mt-6">
              Program Studi{" "}
              <span className="text-red-600">Sistem Informasi UISI</span>
            </h1>
            <h3 className="text-sm lg:text-base lg:w-[38rem] mt-6 text-zinc-600">
              Keberhasilan Semen Indonesia Group dalam penerapan Good Corporate
              Governance salah satunya melalui implementasi Enterprise Resource
              Planning (ERP), mampu menjadi dukungan best practice dalam sistem
              pembelajaran di Program Studi Sistem Informasi Universitas
              Internasional Semen Indonesia.
            </h3>
            <style>{`.split-word { will-change: transform, opacity; }`}</style>
          </div>

          {/* button hubungi dan profil */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              scale: { type: "spring", visualDuration: 1, bounce: 0.1 },
            }}
            className="flex items-center gap-4 lg:gap-8 mt-10"
          >
            <a
              target="blank"
              href="https://s.id/DaftarSisforUISI"
              className="bg-gradient-to-r from-[#C10F11] to-[#E31515] hover:scale-95 transition-all duration-200 px-6 py-3 rounded-xl font-medium text-sm 2xl:text-base text-white"
            >
              Hubungi Kami
            </a>
            <a
              target="blank"
              href="https://www.youtube.com/watch?v=WQ4avou98wc&ab_channel=SistemInformasiUISI"
              className="flex items-center gap-4 font-medium text-sm 2xl:text-base text-red-600 px-6 py-3 rounded-lg hover:scale-95  hover:border hover:border-red-400 transition-all duration-200"
            >
              <Play className="h-4 text-red-600" />
              <span>Video Profile</span>
            </a>
          </motion.div>

          {/* akreditasi */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              scale: { type: "spring", visualDuration: 1.2, bounce: 0.1 },
            }}
            className="flex items-center gap-4 mt-8"
          >
            <img src="/img/akreditasi.png" alt="akreditasi" className="h-10" />
            <div>
              <h2 className="2xl:text-lg">
                Terakreditasi{" "}
                <span className="font-semibold text-red-600">
                  ”Baik Sekali”
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                LAM INFOKOM No.026/SK/LAM-INFOKOM/Ak/S/IV/2023.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* bottom circle */}
      <div className="flex justify-end items-end">
        <img
          src="img/heroCircle.svg"
          alt="HeroCircle"
          className="rotate-180 h-40"
        />
      </div>
    </section>
  );
}
