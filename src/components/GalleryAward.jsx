export default function GalleryAward() {
  const dataAward = [
    {
      nama: "Delegasi Mahasiswa The 4th Indonesia Human Capital Summit 2023",
      tahun: "2023",
      img: "img/award/image.png",
      namaMhs: "Arif Muhammad Iqbal",
      imgMhs: "img/mhs/arif.png",
    },
    {
      nama: "Excellent Paper Award International Big Data and ERP Conference 2020",
      tahun: "2023",
      img: "img/award/image-1.png",
      namaMhs: "Grandys Frieska Prassida, S.Kom., M.Kom., Ph.D., MCE, CIIQA",
      imgMhs: "img/dosen/grandys.png",
    },
    {
      nama: "Lomba Desain Toko Online Kompetisi The 9th UTU Awards Universitas Teuku Umar Aceh",
      tahun: "2023",
      img: "img/award/image-3.png",
      namaMhs: "Uston, Sony, Fajar",
      imgMhs: "img/mhs/uston.png",
    },
    {
      nama: "Presenter (On-Site) Information Systems International Conference (ISICO) 20233",
      tahun: "2023",
      img: "img/award/image-4.png",
      namaMhs: "Puji Astutik",
      imgMhs: "img/mhs/puji.png",
    },
    {
      nama: "Presenter (Online) Information Systems International Conference (ISICO) 2023",
      tahun: "2023",
      img: "img/award/image-5.jpg",
      namaMhs: "Felix Atmaja",
      imgMhs: "img/mhs/felix.png",
    },
    {
      nama: "Penelitian Hibah The World Academy of Science (TWAS) UNESCO 2021-2023",
      tahun: "2023",
      img: "img/award/image.png",
      namaMhs: "Brina Miftahurrohmah, S.Si., M.Si., MCE, MCF",
      imgMhs: "img/dosen/brina.png",
    },
  ];
  return (
    <>
      <article className="bg-[url('/img/awardingbg.svg')] bg-cover w-full min-h-screen flex flex-col justify-center items-center pt-24 mb-12">
        <div className="text-white text-center">
          <h1 className="font-bold text-3xl lg:text-5xl">Galeri Prestasi</h1>
          <h3 className="mt-2 font-serif lg:text-lg">
            Program Studi Sistem Informasi UISI
          </h3>
        </div>
        <section className="mt-12 overflow-x-auto w-full">
          <div className="w-full flex gap-6 overflow-x-clip">
            <div className="flex gap-6 animate-award-marquee">
              {dataAward.concat(dataAward).map((award, index) => (
                <div key={index} className="group relative">
                  <div className="relative">
                    <img
                      src={award.img}
                      alt={award.name}
                      className="h-60 lg:h-80 max-w-none rounded-xl"
                    />
                    <div className="absolute inset-0 m-4 mb-5 bg-transparent group-hover:bg-black/60 transition duration-300 rounded-lg"></div>
                  </div>
                  <div className="hidden group-hover:block mx-6 bg-white rounded-lg p-4 -mt-44 absolute left-0 right-0">
                    <h2 className="font-medium">{award.nama}</h2>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-100 text-xs">
                      <div className="flex items-center gap-4 ">
                        <img
                          src={award.imgMhs}
                          alt={award.namaMhs}
                          className="h-8"
                        />
                        <p>{award.namaMhs}</p>
                      </div>
                      <p>{award.tahun}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* section 2 */}
          <div className="w-full flex gap-6 mt-4 overflow-x-clip">
            <div className="flex gap-6 animate-award-marquee-reverse">
              {dataAward
                .slice(3)
                .concat(dataAward.slice(0, 3))
                .concat(dataAward.slice(3))
                .map((award, index) => (
                  <div key={index} className="group relative">
                    <div className="relative">
                      <img
                        src={award.img}
                        alt={award.name}
                        className="h-60 lg:h-80  max-w-none rounded-xl"
                      />
                      <div className="absolute inset-0 m-4 mb-5 bg-transparent group-hover:bg-black/60 transition duration-300 rounded-lg"></div>
                    </div>
                    <div className="hidden group-hover:block mx-6 bg-white rounded-lg p-4 -mt-44 absolute left-0 right-0">
                      <h2 className="font-medium">{award.nama}</h2>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-100 text-xs">
                        <div className="flex items-center gap-4 ">
                          <img
                            src={award.imgMhs}
                            alt={award.namaMhs}
                            className="h-8"
                          />
                          <p>{award.namaMhs}</p>
                        </div>
                        <p>{award.tahun}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* section 3 */}
          <div className="w-full flex gap-6 mt-4 overflow-x-clip ">
            <div className="flex gap-6 animate-award-marquee">
              {dataAward.concat(dataAward).map((award, index) => (
                <div key={index} className="group relative">
                  <div className="relative">
                    <img
                      src={award.img}
                      alt={award.name}
                      className="h-60 lg:h-80 max-w-none rounded-xl"
                    />
                    <div className="absolute inset-0 m-4 mb-5 bg-transparent group-hover:bg-black/60 transition duration-300 rounded-lg"></div>
                  </div>
                  <div className="hidden group-hover:block mx-6 bg-white rounded-lg p-4 -mt-44 absolute left-0 right-0">
                    <h2 className="font-medium">{award.nama}</h2>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-100 text-xs">
                      <div className="flex items-center gap-4 ">
                        <img
                          src={award.imgMhs}
                          alt={award.namaMhs}
                          className="h-8"
                        />
                        <p>{award.namaMhs}</p>
                      </div>
                      <p>{award.tahun}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
