export default function Testimoni() {
  const dataAlumni = [
    {
      name: "M. Rusydani S., S.Kom.",
      work: "ERP Solution Analyst",
      image: "img/rusydani.png",
      companyLogo: "img/kompas.png",
      description:
        "“Selama saya menjadi mahasiswa di Sistem Informasi UISI, pengembangan studi, karir, dan organisasi sangat di dukung penuh oleh dosen-dosen serta rekan kuliah. Semangat dari bapak/ibu dosen dan rekan kuliah menular kepada diri saya untuk terus aktif dalam belajar serta aktif dalam berpikir kreatif.”",
    },
    {
      name: "Melenia Yolanda F., S.Kom.",
      work: "Business Analyst Functional Odoo",
      image: "img/melenia.png",
      companyLogo: "img/alugra.png",
      description:
        "“Active, Dosen SISFOR identik dengan kata ini karena semangat dan antusias yang selalu mengajarkan kita untuk competitive, creative, dan open-challenging. Tidak hanya berkutat di bidang keilmuan, organisasi dan interaksi atau networking di lingkungan kampus juga ditekankan di sini, jadi sangat organized. Sistem dan mata kuliah yang ada di SISFOR juga sangat menarik seperti penjurusan di bidang yang diminati, sehingga bisa jadi batu loncatan untuk praktik di dunia kerja.”",
    },
    {
      name: "Rizqi A. W. Y., S.Kom.",
      work: "Surveyor SPBE",
      image: "img/rizqi.png",
      companyLogo: "img/tati.png",
      description:
        "“Saya sangat puas dengan pengalaman kuliah di program studi Sistem Informasi UISI. Dosen-dosen yang kompeten, kurikulum yang  relevan dengan lapangan kerja dimasa sekarang, dan fasilitas pendukung teknologi yang memadai membuat perjalanan akademik saya  menjadi sangat  berharga. Terima kasih atas pengalaman berharga ini!”",
    },
  ];
  return (
    <>
      <div className="relative flex justify-center items-center">
        <img
          src="/img/awardingbg.svg"
          alt="awarding"
          className="w-full h-[42rem] lg:h-[60rem] object-cover"
        />

        {/* content container */}
        <div className="absolute w-full h-full flex flex-col justify-center items-center text-white">
          <div className="px-4 py-2 border-[0.5px] border-white bg-white/20 rounded-lg text-center text-sm uppercase tracking-widest font-semibold">
            testimoni alumni
          </div>
          <h1 className="mt-5 mb-12 text-4xl 2xl:text-5xl font-bold">
            Apa Kata Alumni?
          </h1>

          {/* content card */}
          <div className="w-full overflow-x-auto no-scrollbar flex lg:justify-center">
            <div className="flex justify-center w-max gap-6 lg:gap-4 2xl:gap-12 text-black mx-4 lg:mx-0">
              {dataAlumni.map((alumni, index) => (
                <div
                  key={index}
                  className="w-80 lg:w-96 h-fit px-8 py-7 rounded-lg bg-white border-t-8 border-yellow-500 drop-shadow-lg"
                >
                  <p className="text-sm lg:text-base text-zinc-600">{alumni.description}</p>
                  <div className="mt-5 pt-5 flex items-center gap-5 text-xs lg:text-base border-t border-zinc-200">
                    <img src={alumni.image} alt={alumni.name} />
                    <div>
                      <h1>{alumni.name}</h1>
                      <h2>{alumni.work}</h2>
                      <img src={alumni.companyLogo} alt={alumni.work} className="mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
