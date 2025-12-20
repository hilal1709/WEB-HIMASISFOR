export default function JumbotronPromo() {
  return (
    <>
      {/* jumbotron mari bergabung */}
      <div className="flex flex-col justify-center items-center my-32 mx-2 lg:mx-0">
        {/* container */}
        <div className="relative flex flex-col justify-center items-center">
          <img
            src="img/gabung.png"
            alt=""
            className="rounded-2xl lg:rounded-3xl drop-shadow-lg h-68 lg:h-fit object-cover"
          />

          {/* content */}
          <div className="absolute flex flex-col justify-center items-center text-white">
            <div className="px-4 py-2 border-[0.5px] border-white bg-white/20 rounded-lg text-center text-xs lg:text-sm uppercase tracking-widest font-semibold">
              sisfor uisi
            </div>
            <h1 className="my-4 font-bold text-2xl lg:text-4xl">
              Mari Bergabung Bersama Kami
            </h1>
            <p className="text-center text-sm lg:text-lg">
              Bergabung bersama kami dan menjadi bagian <br />
              dari keluarga Sistem Informasi Universitas Internasional Semen
              Indonesia
            </p>
            <a
              href="https://s.id/DaftarSisforUISI"
              className="mt-4 px-6 py-3 font-semibold text-xs lg:text-sm text-red-600 bg-white rounded-xl drop-shadow-lg"
            >
              Mari Bergabung
            </a>
          </div>
        </div>
      </div>
      {/* dot pattern */}
      <div className="relative overflow-x-clip -z-20">
        <div className="flex justify-between">
          <div className="-mt-72 -ml-20">
            <img src="img/dot.svg" alt="dot kiri" className="mt-6" />
          </div>
          <div className="-mt-[32rem] mr-4 2xl:mr-80">
            <img src="img/dot.svg" alt="dot kanan" className="mt-6" />
          </div>
        </div>
      </div>
      {/* end dot pattern */}
      {/* end jumbotron mari bergabung */}
    </>
  );
}
