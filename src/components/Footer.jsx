import { Tiktok } from "../icons/Tiktok";
import { Youtube } from "../icons/Youtube";
import { Instagram } from "../icons/Instagram";

export default function Footer() {
  return (
    <footer className="lg:mx-12 2xl:mx-32">
      {/* logo sisfor dan sosmed */}
      <div className="flex flex-col lg:flex-row justify-between border-y border-zinc-200 py-6 px-4 lg:px-0">
        {/* logo sisfor */}
        <div className="flex items-center gap-6">
          <img src="img/logo.png" alt="logo" className="h-12" />
          <div className="border-l border-zinc-200 pl-6">
            <h2
              className="font-semibold text-lg
             lg:text-xl"
            >
              Sistem Informasi
            </h2>
            <h4 className="text-sm lg:text-base text-zinc-400">
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
      <div className="my-4 lg:my-12 flex flex-col lg:flex-row justify-between mx-4 lg:mx-0">
        {/* alamat */}
        <p className="lg:w-[30rem] text-sm lg:text-base text-zinc-500">
          Kompleks PT. Semen Indonesia (Persero) Tbk., Jl. Veteran, Sidokumpul,
          Gresik, Sidokumpul, Kec. Gresik, Kabupaten Gresik, Jawa Timur 61122,
          Indonesia
        </p>
        <div className="flex lg:hidden items-center gap-4 mt-2">
          <a
            target="blank"
            href="https://www.instagram.com/sisforuisi"
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 group"
          >
            <Instagram className="text-red-600 group-hover:text-red-700 h-4" />
          </a>
          <a
            target="blank"
            href="https://www.youtube.com/@sisforuisi"
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 group"
          >
            <Youtube className="text-red-600 group-hover:text-red-700 h-4" />
          </a>
          <a
            target="blank"
            href="https://www.tiktok.com/@sisfor_uisi"
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 group"
          >
            <Tiktok className="text-red-600 group-hover:text-red-700 h-4" />
          </a>
        </div>

        {/* navigasi */}
        <div className="flex justify-between lg:justify-normal lg:gap-8 2xl:gap-12 mt-8 lg:mt-0">
          {/* profil */}
          <ul>
            <li className="font-medium lg:text-xl mb-2">Profil</li>
            <li>
              <a
                href="/profile"
                className="text-sm lg:text-lg text-zinc-500 hover:text-zinc-600"
              >
                Profil Prodi
              </a>
            </li>
            <li>
              <a
                href="/profile"
                className="text-sm lg:text-lg text-zinc-500 hover:text-zinc-600"
              >
                Profil Lulusan
              </a>
            </li>
            <li>
              <a
                href="/profile"
                className="text-sm lg:text-lg text-zinc-500 hover:text-zinc-600"
              >
                Kerjasama
              </a>
            </li>
          </ul>

          {/* kurikulum */}
          <ul>
            <li className="font-medium lg:text-xl mb-2">Kurikulum</li>
            <li>
              <a
                href="/curiculum"
                className="text-sm lg:text-lg text-zinc-500 hover:text-zinc-600"
              >
                Kurikulum Matkul
              </a>
            </li>
          </ul>

          {/* prestasi */}
          <ul>
            <li className="font-medium lg:text-xl mb-2">Prestasi</li>
            <li>
              <a
                href="/achievement"
                className="text-sm lg:text-lg text-zinc-500 hover:text-zinc-600"
              >
                Prestasi Dosen
              </a>
            </li>
            <li>
              <a
                href="/achievement"
                className="text-sm lg:text-lg text-zinc-500 hover:text-zinc-600"
              >
                Prestasi Mahasiswa
              </a>
            </li>
          </ul>
        </div>
      </div>
      {/* uisi */}
      <p className="mt-8 mb-4 lg:my-10 text-center text-xs lg:text-base text-zinc-500">
        Sistem Informasi | Universitas Internasional Semen Indonesia
      </p>
    </footer>
  );
}
