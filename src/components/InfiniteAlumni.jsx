export default function InfiniteAlumni() {
  const alumni = [
    {
      name: "Rizqi A. W. Y., S.Kom",
      img: "img/alumni/rizqi.png",
      job: "Surveyor SPBE PT. Tatacipta Teknologi Indonesia",
    },
    {
      name: "Edwin R. Putra, S.Kom",
      img: "img/alumni/edwin.png",
      job: "Management Information System PT. Wilmar Nabati Indonesia",
    },
    {
      name: "Felix Atmaja, S.Kom",
      img: "img/alumni/felix.png",
      job: "Officer Program Retailership Semen Indonesia Group",
    },
    {
      name: "Juliana Kristi, S.Kom",
      img: "img/alumni/juliana.png",
      job: "IT Planning & Control di PT. Petrokimia Gresik",
    },
    {
      name: "Rizqi A. W. Y., S.Kom",
      img: "img/alumni/rizqi.png",
      job: "Surveyor SPBE PT. Tatacipta Teknologi Indonesia",
    },
    {
      name: "Edwin R. Putra, S.Kom",
      img: "img/alumni/edwin.png",
      job: "Management Information System PT. Wilmar Nabati Indonesia",
    },
    {
      name: "Felix Atmaja, S.Kom",
      img: "img/alumni/felix.png",
      job: "Officer Program Retailership Semen Indonesia Group",
    },
    {
      name: "Juliana Kristi, S.Kom",
      img: "img/alumni/juliana.png",
      job: "IT Planning & Control di PT. Petrokimia Gresik",
    },
  ];

  return (
    <>
      {/* infinite scroll */}
      <div className="overflow-x-hidden -mr-18">
        <div className="w-96 2xl:w-[60rem] flex gap-12 overflow-hidden [mask-image:_linear-gradient(to_right,_transparent_0,_white_128px,white_calc(100%-128px),_transparent_100%)]">
          <div className="flex gap-8 animate-marquee">
            {alumni.concat(alumni).map((alumni, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border border-zinc-200 rounded-lg w-max"
              >
                <img src={alumni.img} alt="" className="h-20 max-w-none" />
                <div>
                  <h2 className="font-bold text-lg">{alumni.name}</h2>
                  <p className="text-sm">{alumni.job}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-96 2xl:w-[60rem] mt-4 ml-12 flex gap-12 overflow-hidden [mask-image:_linear-gradient(to_right,_transparent_0,_white_128px,white_calc(100%-128px),_transparent_100%)]">
          <div className="flex gap-12 animate-marquee-reverse">
            {alumni
              .slice(3)
              .concat(alumni.slice(0, 3))
              .concat(alumni.slice(3))
              .map((al, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border border-zinc-200 rounded-lg w-max"
                >
                  <img src={al.img} alt="" className="h-20 max-w-none" />
                  <div>
                    <h2 className="font-bold text-lg">{al.name}</h2>
                    <p className="text-sm">{al.job}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
