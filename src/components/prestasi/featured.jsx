"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Keyboard } from "swiper/modules";
import "swiper/css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container, SectionHeader } from "@/components/home/shared";
import { Skeleton } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { LevelBadge, usePrestasi } from "./prestasi-provider";

const pad = (n) => String(n).padStart(2, "0");

/**
 * Sorotan / Hall of Fame (pola 21st.dev "achievement cards" + team showcase):
 * Swiper berjalan otomatis (jeda saat kursor di atasnya) dengan bar progres emas,
 * foto membesar halus saat hover, kartu aktif bergaris emas, klik kartu → modal peraih.
 */
export function Featured() {
  const { featured } = usePrestasi();
  const swiper = useRef(null);
  const bar = useRef(null);
  const [active, setActive] = useState(0);
  if (!featured.length) return null;

  return (
    <section id="sorotan" className="scroll-mt-20 overflow-hidden bg-cream-2/60 py-16 md:py-24">
      <Container>
        <SectionHeader
          title={["Sorotan", "hall of fame"]}
          body="Satu capaian paling menonjol dari tiap peraih: podium kejuaraan, panggung konferensi internasional, hingga kursi editor jurnal."
          action={
            <div className="flex items-center gap-4">
              <span className="tabular font-serif text-[1.4rem] text-navy">
                {pad(active + 1)}
                <span className="text-text/35"> / {pad(featured.length)}</span>
              </span>
              <div className="flex gap-2">
                <NavBtn label="Sorotan sebelumnya" onClick={() => swiper.current?.slidePrev()} icon={ChevronLeft} />
                <NavBtn label="Sorotan berikutnya" onClick={() => swiper.current?.slideNext()} icon={ChevronRight} />
              </div>
            </div>
          }
        />

        <div className="relative mt-10 h-[2px] w-full overflow-hidden bg-line md:mt-12" aria-hidden>
          <span ref={bar} className="absolute inset-y-0 left-0 w-0 bg-gold" />
        </div>

        <div className="mt-8 min-w-0">
          <Swiper
            modules={[A11y, Autoplay, Keyboard]}
            onSwiper={(s) => (swiper.current = s)}
            onSlideChange={(s) => setActive(s.realIndex)}
            onAutoplayTimeLeft={(_, __, p) => bar.current && (bar.current.style.width = `${(1 - p) * 100}%`)}
            autoplay={{ delay: 5200, pauseOnMouseEnter: true, disableOnInteraction: false }}
            keyboard={{ enabled: true, onlyInViewport: true }}
            loop={featured.length > 3}
            spaceBetween={18}
            slidesPerView={1.12}
            breakpoints={{ 640: { slidesPerView: 2.1 }, 1024: { slidesPerView: 3.2, spaceBetween: 22 } }}
            className="!overflow-visible"
          >
            {featured.map((f, i) => (
              <SwiperSlide key={f.id} className="!h-auto">
                {({ isActive }) => <FeatureCard item={f} n={i + 1} active={isActive} />}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Container>
    </section>
  );
}

function FeatureCard({ item, n, active }) {
  const { openProfile } = usePrestasi();
  const [loaded, setLoaded] = useState(!item.photo);
  return (
    <button
      type="button"
      onClick={() => openProfile(item.slug)}
      aria-label={`${item.title} — ${item.short}`}
      className={cn(
        "group flex h-full w-full flex-col overflow-hidden rounded-lg border bg-white text-left transition-[border-color,box-shadow,transform,opacity] duration-700 ease-cinematic hover:-translate-y-1.5 hover:shadow-[0_34px_60px_-38px_rgb(20_33_61/0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/40",
        active ? "border-gold/60" : "border-line hover:border-navy/20"
      )}
    >
      <span className="relative block aspect-[4/3.4] overflow-hidden bg-cream-2">
        {!loaded && <Skeleton className="absolute inset-0 rounded-none bg-cream-2" />}
        {item.photo ? (
          <Image
            src={item.photo}
            alt=""
            fill
            sizes="(min-width:1024px) 380px, (min-width:640px) 48vw, 88vw"
            onLoad={() => setLoaded(true)}
            className={cn(
              "object-cover object-[50%_18%] transition-[transform,opacity] duration-700 ease-cinematic group-hover:scale-[1.05]",
              loaded ? "opacity-100" : "opacity-0"
            )}
          />
        ) : (
          <span className="grid size-full place-items-center bg-navy font-serif text-6xl text-gold-soft">{item.short.split(" ").slice(-2).map((w) => w[0]).join("")}</span>
        )}
        <span className="tabular absolute left-3 top-3 rounded bg-navy/85 px-2 py-1 font-serif text-[15px] leading-none text-gold-soft">{pad(n)}</span>
        <span className="absolute right-3 top-3">
          <LevelBadge level={item.level} label={item.levelLabel} />
        </span>
        {/* garis emas tumbuh di dasar foto */}
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gold transition-transform duration-700 ease-cinematic group-hover:scale-x-100" />
      </span>
      <span className="flex flex-1 flex-col p-5">
        <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-maroon">
          {item.role}
          <span className="tabular font-medium normal-case tracking-normal text-text/45">{item.yearLabel}</span>
        </span>
        <span className="mt-2 line-clamp-3 font-serif text-[1.22rem] leading-snug text-navy transition-colors duration-300 group-hover:text-maroon">{item.title}</span>
        <span className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-semibold text-navy">{item.short}</span>
            <span className="text-[12.5px] text-text/50">{item.category === "dosen" ? "Dosen" : "Mahasiswa"}</span>
          </span>
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-navy transition-[background-color,border-color,color,transform] duration-500 ease-cinematic group-hover:rotate-45 group-hover:border-maroon group-hover:bg-maroon group-hover:text-white">
            <svg aria-hidden viewBox="0 0 16 16" className="size-4">
              <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </span>
    </button>
  );
}

function NavBtn({ label, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-11 place-items-center rounded-full border border-navy/20 bg-white text-navy transition-[border-color,background-color,color,transform] duration-300 hover:border-maroon hover:bg-maroon hover:text-white active:scale-95"
    >
      <Icon aria-hidden className="size-4" />
    </button>
  );
}
