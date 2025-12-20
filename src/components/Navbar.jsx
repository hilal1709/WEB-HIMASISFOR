/* eslint-disable no-unused-vars */
"use client"
import { ArrowDown } from "../icons/ArrowDown";
import { useEffect, useState } from "react";
import Profile from "../icons/Profile";
import Partner from "../icons/Partner";
import Graduation from "../icons/Graduation";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";


export default function Navbar() {
  const [open, setOpen] = useState(null);
  const [openNav, setOpenNav] = useState(null);
  const location = usePathname();

  const openMenu = (menu) => {
    setOpen(open === menu ? null : menu);
  };

  const closeMenu = () => {
    setOpen(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown")) {
        closeMenu();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-4 bg-white z-50 mx-4 shadow-xl rounded-xl">
      {/* navigasi desktop */}
      <nav className="hidden max-w-7xl lg:flex justify-between items-center px-8 pr-4 py-3 text-sm mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/">
            <img src="/img/logo.png" alt="Logo Sistem Informasi UISI" className="h-6" />
          </Link>
          <ul className="flex items-center gap-2">
            <li>
              <Link
                href="/"
                className={`px-4 ${
                  location.pathname === "/"
                    ? "font-medium text-red-600"
                    : "text-zinc-500"
                }`}
              >
                Beranda
              </Link>
            </li>
            <li className="flex items-center gap-2 dropdown">
              <button
                onClick={() => openMenu("profil")}
                className={`px-4 ${
                  location.pathname === "/profile"
                    ? "flex items-center gap-2 px-4 py-2 font-medium text-red-600"
                    : "flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 text-zinc-500 rounded-lg"
                }`}
              >
                Profil
                <ArrowDown
                  className={`h-4 transition-transform duration-300 ${
                    open === "profil" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === "profil" && (
                <motion.div
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    type: "spring",
                    visualDuration: 0.2,
                    bounce: 0.2,
                  }}
                  className="absolute top-20 left-58 2xl:left-134 p-4 flex items-center gap-4 bg-white shadow-lg rounded-lg text-zinc-800"
                >
                  <div className="p-4 border-r border-zinc-200">
                    <h3 className="font-medium text-lg">Profil Kami</h3>
                    <p className="w-54 mt-4 text-zinc-400">
                      Mencetak lulusan unggul melalui kurikulum relevan dan
                      lingkungan belajar suportif
                    </p>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 mt-6 text-red-600 font-medium group hover:scale-95 transition-all duration-200"
                    >
                      Pelajari lebih lanjut
                      <ArrowDown className="h-4 -rotate-120 group-hover:-rotate-95 transition-all duration-200" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2">
                    {/* profil prodi */}
                    <Link
                      href="/profile"
                      className="flex gap-2 p-4 rounded-xl hover:bg-zinc-200"
                    >
                      <Profile className="h-5 text-zinc-600" />
                      <div>
                        <h3 className="font-medium">Profil Prodi</h3>
                        <p className="text-sm text-zinc-400">
                          Visi dan misi program studi
                        </p>
                      </div>
                    </Link>

                    {/*kerja sama  */}
                    <Link
                      href="/profile"
                      className="flex gap-2 p-4 rounded-xl hover:bg-zinc-200"
                    >
                      <Partner className="h-5 text-zinc-600" />
                      <div>
                        <h3 className="font-medium">Kerja Sama</h3>
                        <p className="text-sm text-zinc-400">
                          Kerja sama dengan lembaga dan industri
                        </p>
                      </div>
                    </Link>

                    {/* profil lulusan */}
                    <Link
                      href="/profile"
                      className="flex gap-2 p-4 rounded-xl hover:bg-zinc-200"
                    >
                      <Graduation className="h-5 text-zinc-600" />
                      <div>
                        <h3 className="font-medium">Profil Lulusan</h3>
                        <p className="text-sm text-zinc-400">
                          Prospek karier lulusan dari alumni
                        </p>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              )}
            </li>
            <li className="flex items-center gap-2 dropdown">
              <button
                onClick={() => openMenu("prestasi")}
                className={`px-4 ${
                  location.pathname === "/achievement"
                    ? "flex items-center gap-2 px-4 py-2 font-medium text-red-600"
                    : "flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 text-zinc-500 rounded-lg"
                }`}
              >
                Prestasi
                <ArrowDown
                  className={`h-4 transition-transform duration-300 ${
                    open === "prestasi" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === "prestasi" && (
                <motion.div
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    type: "spring",
                    visualDuration: 0.2,
                    bounce: 0.2,
                  }}
                  className="absolute top-20 left-84 2xl:left-156 p-4 pr-24 flex items-center gap-4 bg-white shadow-lg rounded-lg text-zinc-800"
                >
                  <div className="p-4 border-r border-zinc-200">
                    <h3 className="font-medium text-lg">Prestasi Kami</h3>
                    <p className="w-54 mt-4 text-zinc-400">
                      Capaian akademik dan non-akademik yang diraih oleh dosen
                      dan mahasiswa
                    </p>

                    <Link
                      href="/achievement"
                      className="flex items-center gap-2 mt-6 text-red-600 font-medium group hover:scale-95 transition-all duration-200"
                    >
                      Pelajari lebih lanjut
                      <ArrowDown className="h-4 -rotate-120 group-hover:-rotate-95 transition-all duration-200" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1">
                    {/* Prestasi Dosen */}
                    <Link
                      href="/achievement"
                      className="flex gap-2 p-4 rounded-xl hover:bg-zinc-200"
                    >
                      <Profile className="h-5 text-zinc-600" />
                      <div>
                        <h3 className="font-medium">Prestasi Dosen</h3>
                        <p className="text-sm text-zinc-400">
                          Penghargaan, publikasi, dan riset
                        </p>
                      </div>
                    </Link>

                    {/* Prestasi Mahasiswa  */}
                    <Link
                      href="/achievement"
                      className="flex gap-2 p-4 rounded-xl hover:bg-zinc-200"
                    >
                      <Partner className="h-5 text-zinc-600" />
                      <div>
                        <h3 className="font-medium">Prestasi Mahasiswa</h3>
                        <p className="text-sm text-zinc-400">
                          Capaian lomba akademik dan non-akademik
                        </p>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              )}
            </li>
            <li>
              <Link
                href="/curiculum"
                className={`px-4 ${
                  location.pathname === "/curiculum"
                    ? "font-medium text-red-600"
                    : "text-zinc-500"
                }`}
              >
                Kurikulum
              </Link>
            </li>
          </ul>
        </div>

        {/* hubungi kami */}
        <a
          href="https://s.id/DaftarSisforUISI"
          className="bg-gradient-to-r from-[#C10F11] to-[#E31515] hover:scale-105 transition-all duration-300 px-5 py-3 text-xs rounded-lg font-medium text-white"
        >
          Hubungi Kami
        </a>
      </nav>

      {/* navigasi mobile */}
      <nav className="lg:hidden flex justify-between px-4 py-4">
        <Link href="/">
          <img src="/img/logo.png" alt="Logo Sistem Informasi UISI" className="h-6" />
        </Link>
        <button onClick={() => setOpenNav(openNav ? null : true)}>
          <svg
            className="h-6 w-6 stroke-red-600"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              className={!openNav ? "block" : "hidden"}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              className={openNav ? "block" : "hidden"}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {openNav && (
          <div className="absolute w-72 right-4 top-24 flex flex-col gap-4 p-6 rounded-lg bg-white shadow-xl">
            <Link href="/" className="px-4 py-2 rounded-lg bg-red-500 text-white">
              Beranda
            </Link>

            {/* Profil */}
            <div>
              <h2 className="text-sm text-zinc-400">Profil</h2>
              <div className="flex flex-col gap-1 text-zinc-500">
                <Link href="/profile" className="px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white">
                  Profil Prodi
                </Link>
                <Link href="/profile" className="px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white">
                  Kerjasama
                </Link>
                <Link href="/profile" className="px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white">
                  Profil Lulusan
                </Link>
              </div>
            </div>

            {/* Prestasi */}
            <div>
              <h2 className="text-sm text-zinc-400">Prestasi</h2>
              <div className="flex flex-col gap-1 text-zinc-500">
                <Link href="/achievement" className="px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white">
                  Prestasi Dosen
                </Link>
                <Link href="/achievement" className="px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white">
                  Prestasi Mahasiswa
                </Link>
              </div>
            </div>

            {/* Kurikulum */}
            <div>
              <h2 className="text-sm text-zinc-400">Kurikulum</h2>
              <div className="flex flex-col gap-1 text-zinc-500">
                <Link
                  href="/curiculum"
                  className="px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white"
                >
                  Kurikulum Prodi
                </Link>
              </div>
            </div>

            {/* hubungi kami */}
            <a href="https://s.id/DaftarSisforUISI" className="flex justify-center items-center py-2 bg-gradient-to-r from-[#C10F11] to-[#E31515] hover:from-[#94080a] hover:to-[#f22b2b] rounded-xl font-medium text-sm text-white cursor-pointer">
              Hubungi Kami
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
