import Image from 'next/image';
import { Tiktok } from "../icons/Tiktok";
import { Youtube } from "../icons/Youtube";
import { Instagram } from "../icons/Instagram";

export default function Footer() {
  return (
    <footer className="px-4 md:px-8 lg:mx-12 2xl:mx-32">
      {/* logo sisfor dan sosmed */}
      <div className="flex flex-col lg:flex-row justify-between border-y border-zinc-200 py-6 gap-4 lg:gap-0">
        {/* logo sisfor */}
        <div className="flex items-center gap-4 md:gap-6">
          <Image src="/img/logo.png" alt="logo" width={48} height={48} className="h-10 md:h-12 flex-shrink-0" loading="lazy" />
          <div className="border-l border-zinc-200 pl-4 md:pl-6">
            <h2
              className="font-semibold text-base md:text-lg lg:text-xl"
            >
              Sistem Informasi
            </h2>
            <h4 className="text-xs md:text-sm lg:text-base text-zinc-400">
              Universitas Internasional Semen Indonesia
            </h4>
          </div>
        </div>

        {/* sosmed */}
        <div className="hidden lg:flex items-center gap-4">
          <a
            target="blank"
            href="https://www.instagram.com/sisforuisi"
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 group"
          >
            <Instagram className="text-red-600 group-hover:text-red-700 h-6" />
          </a>
          <a
            target="blank"
            href="https://www.youtube.com/@sisforuisi"
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 group"
          >
            <Youtube className="text-red-600 group-hover:text-red-700 h-6" />
          </a>
          <a
            target="blank"
            href="https://www.tiktok.com/@sisfor_uisi"
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 group"
          >
            <Tiktok className="text-red-600 group-hover:text-red-700 h-6" />
          </a>
        </div>
      </div>

      {/* alamat dan navigasi */}
      <div className="my-8 md:my-10 lg:my-12 flex flex-col lg:flex-row justify-between gap-6 lg:gap-8">
        {/* alamat */}
        <p className="lg:w-[30rem] text-xs md:text-sm lg:text-base text-zinc-500">
          Kompleks PT. Semen Indonesia (Persero) Tbk., Jl. Veteran, Sidokumpul,
          Gresik, Sidokumpul, Kec. Gresik, Kabupaten Gresik, Jawa Timur 61122,
          Indonesia
        </p>
        <div className="flex lg:hidden items-center gap-3 md:gap-4">
          <a
            target="blank"
            href="https://www.instagram.com/sisforuisi"
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 group"
          >
            <Instagram className="text-red-600 group-hover:text-red-700 h-4 md:h-5" />
          </a>
          <a
            target="blank"
            href="https://www.youtube.com/@sisforuisi"
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 group"
          >
            <Youtube className="text-red-600 group-hover:text-red-700 h-4 md:h-5" />
          </a>
          <a
            target="blank"
            href="https://www.tiktok.com/@sisfor_uisi"
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 group"
          >
            <Tiktok className="text-red-600 group-hover:text-red-700 h-4 md:h-5" />
          </a>
        </div>

        {/* navigasi */}
        <div className="flex justify-between md:justify-normal md:gap-6 lg:gap-8 2xl:gap-12">
          {/* profil */}
          <ul>
            <li className="font-medium text-base md:text-lg lg:text-xl mb-2">Profil</li>
            <li>
              <a
                href="/profile"
                className="text-xs md:text-sm lg:text-lg text-zinc-500 hover:text-zinc-600"
              >
                Profil Prodi
              </a>
            </li>
            <li>
              <a
                href="/profile"
                className="text-xs md:text-sm lg:text-lg text-zinc-500 hover:text-zinc-600"
              >
                Profil Lulusan
              </a>
            </li>
            <li>
              <a
                href="/profile"
                className="text-xs md:text-sm lg:text-lg text-zinc-500 hover:text-zinc-600"
              >
                Kerjasama
              </a>
            </li>
          </ul>

          {/* kurikulum */}
          <ul>
            <li className="font-medium text-base md:text-lg lg:text-xl mb-2">Kurikulum</li>
            <li>
              <a
                href="/curiculum"
                className="text-xs md:text-sm lg:text-lg text-zinc-500 hover:text-zinc-600"
              >
                Kurikulum Matkul
              </a>
            </li>
          </ul>

          {/* prestasi */}
          <ul>
            <li className="font-medium text-base md:text-lg lg:text-xl mb-2">Prestasi</li>
            <li>
              <a
                href="/achievement"
                className="text-xs md:text-sm lg:text-lg text-zinc-500 hover:text-zinc-600"
              >
                Prestasi Dosen
              </a>
            </li>
            <li>
              <a
                href="/achievement"
                className="text-xs md:text-sm lg:text-lg text-zinc-500 hover:text-zinc-600"
              >
                Prestasi Mahasiswa
              </a>
            </li>
          </ul>
        </div>
      </div>
      {/* uisi */}
      <p className="mt-6 md:mt-8 lg:mt-10 mb-4 lg:mb-10 text-center text-xs md:text-sm lg:text-base text-zinc-500">
        Sistem Informasi | Universitas Internasional Semen Indonesia
      </p>
    </footer>
  );
}
