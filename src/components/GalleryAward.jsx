'use client'
import { useState, useEffect } from 'react'

export default function GalleryAward() {
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGalleries()
  }, [])

  const fetchGalleries = async () => {
    try {
      // Ambil data galeri dari API gallery (bukan achievements)
      const response = await fetch('/api/gallery')
      const data = await response.json()
      
      if (data.success) {
        // Data sudah dalam format yang siap digunakan
        setGalleries(data.data)
      }
    } catch (error) {
      console.error('Error fetching galleries:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <article className="bg-[url('/img/awardingbg.svg')] bg-cover w-full min-h-screen flex flex-col justify-center items-center pt-12 md:pt-16 lg:pt-24 mb-12 px-4">
        <div className="text-white text-center">
          <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl">Galeri Prestasi</h1>
          <h3 className="mt-2 font-serif text-sm md:text-base lg:text-lg">
            Program Studi Sistem Informasi UISI
          </h3>
        </div>
        <div className="mt-8 md:mt-10 lg:mt-12 text-white text-center">
          <p className="text-sm md:text-base">Loading galeri...</p>
        </div>
      </article>
    )
  }

  if (galleries.length === 0) {
    return (
      <article className="bg-[url('/img/awardingbg.svg')] bg-cover w-full min-h-screen flex flex-col justify-center items-center pt-12 md:pt-16 lg:pt-24 mb-12 px-4">
        <div className="text-white text-center">
          <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl">Galeri Prestasi</h1>
          <h3 className="mt-2 font-serif text-sm md:text-base lg:text-lg">
            Program Studi Sistem Informasi UISI
          </h3>
        </div>
        <div className="mt-8 md:mt-10 lg:mt-12 text-white text-center">
          <p className="text-sm md:text-base">Belum ada data galeri</p>
        </div>
      </article>
    )
  }

  // Duplicate array untuk seamless loop
  const displayGalleries = galleries.length < 6 ? [...galleries, ...galleries, ...galleries] : galleries

  return (
    <>
      <article className="bg-[url('/img/awardingbg.svg')] bg-cover w-full min-h-screen flex flex-col justify-center items-center pt-12 md:pt-16 lg:pt-24 mb-12 px-4 md:px-0">
        <div className="text-white text-center">
          <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl">Galeri Prestasi</h1>
          <h3 className="mt-2 font-serif text-sm md:text-base lg:text-lg">
            Program Studi Sistem Informasi UISI
          </h3>
        </div>
        <section className="mt-8 md:mt-10 lg:mt-12 overflow-x-auto w-full">
          <div className="w-full flex gap-4 md:gap-5 lg:gap-6 overflow-x-clip">
            <div className="flex gap-4 md:gap-5 lg:gap-6 animate-award-marquee">
              {displayGalleries.concat(displayGalleries).map((gallery, index) => (
                <div key={index} className="group relative">
                  <div className="relative">
                    <img
                      src={gallery.image}
                      alt={gallery.title}
                      className="h-48 md:h-56 lg:h-60 xl:h-80 max-w-none rounded-xl object-cover"
                      onError={(e) => {
                        e.target.src = '/img/award/image.png'
                      }}
                    />
                    <div className="absolute inset-0 m-3 md:m-4 mb-4 md:mb-5 bg-transparent group-hover:bg-black/60 transition duration-300 rounded-lg"></div>
                  </div>
                  <div className="hidden group-hover:block mx-4 md:mx-5 lg:mx-6 bg-white rounded-lg p-3 md:p-4 -mt-32 md:-mt-36 lg:-mt-44 absolute left-0 right-0 z-10">
                    <h2 className="font-medium line-clamp-2 text-xs md:text-sm lg:text-base">{gallery.title}</h2>
                    <div className="flex justify-between items-center mt-3 md:mt-4 pt-3 md:pt-4 border-t border-zinc-100 text-[10px] md:text-xs">
                      <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
                        {gallery.photoProfile && (
                          <img
                            src={gallery.photoProfile}
                            alt={gallery.name}
                            className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = '/img/mhs/default.png'
                            }}
                          />
                        )}
                        <p className="line-clamp-1">{gallery.name}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="font-semibold">{gallery.year}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* section 2 */}
          <div className="w-full flex gap-4 md:gap-5 lg:gap-6 mt-3 md:mt-4 overflow-x-clip">
            <div className="flex gap-4 md:gap-5 lg:gap-6 animate-award-marquee-reverse">
              {displayGalleries
                .slice(Math.floor(displayGalleries.length / 2))
                .concat(displayGalleries.slice(0, Math.floor(displayGalleries.length / 2)))
                .concat(displayGalleries.slice(Math.floor(displayGalleries.length / 2)))
                .map((gallery, index) => (
                  <div key={index} className="group relative">
                    <div className="relative">
                      <img
                        src={gallery.image}
                        alt={gallery.title}
                        className="h-48 md:h-56 lg:h-60 xl:h-80 max-w-none rounded-xl object-cover"
                        onError={(e) => {
                          e.target.src = '/img/award/image.png'
                        }}
                      />
                      <div className="absolute inset-0 m-3 md:m-4 mb-4 md:mb-5 bg-transparent group-hover:bg-black/60 transition duration-300 rounded-lg"></div>
                    </div>
                    <div className="hidden group-hover:block mx-4 md:mx-5 lg:mx-6 bg-white rounded-lg p-3 md:p-4 -mt-32 md:-mt-36 lg:-mt-44 absolute left-0 right-0 z-10">
                      <h2 className="font-medium line-clamp-2 text-xs md:text-sm lg:text-base">{gallery.title}</h2>
                      <div className="flex justify-between items-center mt-3 md:mt-4 pt-3 md:pt-4 border-t border-zinc-100 text-[10px] md:text-xs">
                        <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
                          {gallery.photoProfile && (
                            <img
                              src={gallery.photoProfile}
                              alt={gallery.name}
                              className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = '/img/mhs/default.png'
                              }}
                            />
                          )}
                          <p className="line-clamp-1">{gallery.name}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="font-semibold">{gallery.year}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </article>
    </>
  )
}
