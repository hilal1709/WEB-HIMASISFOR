'use client'
import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'
import { Skeleton } from '@/components/ui/skeleton'

function GalleryCard({ gallery }) {
  return (
    <div className="group relative overflow-hidden rounded-xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={gallery.image}
        alt={gallery.title}
        className="h-48 w-auto max-w-none rounded-xl object-cover transition-transform duration-700 ease-brand group-hover:scale-105 md:h-56 lg:h-60 xl:h-80"
        onError={(e) => { e.currentTarget.src = '/img/award/image.png' }}
      />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-x-3 bottom-3 translate-y-4 rounded-lg bg-white p-3 opacity-0 shadow-soft transition-all duration-300 ease-brand group-hover:translate-y-0 group-hover:opacity-100 md:inset-x-4 md:bottom-4 md:p-4">
        <h2 className="line-clamp-2 text-xs font-medium md:text-sm lg:text-base">{gallery.title}</h2>
        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 text-[10px] md:text-xs">
          <div className="flex items-center gap-2 md:gap-3">
            {gallery.photoProfile && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gallery.photoProfile} alt={gallery.name} className="size-6 rounded-full object-cover md:size-8"
                onError={(e) => { e.currentTarget.src = '/img/mhs/default.png' }} />
            )}
            <p className="line-clamp-1">{gallery.name}</p>
          </div>
          <p className="font-semibold text-brand-600">{gallery.year}</p>
        </div>
      </div>
    </div>
  )
}

function MarqueeRow({ items, reverse = false }) {
  return (
    <Swiper
      modules={[Autoplay, FreeMode]}
      slidesPerView="auto"
      spaceBetween={20}
      loop
      freeMode={{ enabled: true, momentum: false }}
      speed={6000}
      allowTouchMove
      autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true, reverseDirection: reverse }}
      className="gallery-marquee w-full"
    >
      {items.map((g, i) => (
        <SwiperSlide key={`${g.id}-${i}`} className="!w-auto">
          <GalleryCard gallery={g} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

function Heading() {
  return (
    <div className="text-center text-white" data-aos="fade-up">
      <h1 className="text-2xl font-bold md:text-3xl lg:text-4xl xl:text-5xl">Galeri Prestasi</h1>
      <h3 className="mt-2 font-serif text-sm md:text-base lg:text-lg">Program Studi Sistem Informasi UISI</h3>
    </div>
  )
}

export default function GalleryAward() {
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/gallery')
        const data = await response.json()
        if (data.success) setGalleries(data.data)
      } catch (error) {
        console.error('Error fetching galleries:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const wrapper = "bg-[url('/img/awardingbg.svg')] bg-cover w-full min-h-screen flex flex-col justify-center items-center pt-12 md:pt-16 lg:pt-24 mb-12"

  if (loading) {
    return (
      <article className={`${wrapper} px-4`}>
        <Heading />
        <div className="mt-10 flex w-full gap-4 overflow-hidden">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-80 shrink-0 rounded-xl opacity-40 lg:h-80" />)}
        </div>
      </article>
    )
  }

  if (galleries.length === 0) {
    return (
      <article className={`${wrapper} px-4`}>
        <Heading />
        <p className="mt-10 text-sm text-white md:text-base">Belum ada data galeri</p>
      </article>
    )
  }

  // Swiper loop butuh slide yang cukup banyak agar mulus
  const items = galleries.length < 6 ? [...galleries, ...galleries, ...galleries] : galleries
  const half = Math.floor(items.length / 2)
  const second = items.slice(half).concat(items.slice(0, half))

  return (
    <article className={wrapper}>
      <Heading />
      <section className="mt-8 w-full space-y-4 md:mt-10 lg:mt-12">
        <MarqueeRow items={items} />
        <MarqueeRow items={second} reverse />
      </section>
    </article>
  )
}
