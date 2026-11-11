"use client";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard, Mousewheel } from "swiper/modules";
import "swiper/css";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { cn } from "@/lib/utils";

/**
 * Menuju 2030 — timeline horizontal (Swiper). Garis "beam" emas terisi mengikuti progres slide
 * (pola 21st.dev "Timeline with scroll beam"); 2030 sebagai slide tujuan (navy).
 */
export function Roadmap({ milestones }) {
  const [swiper, setSwiper] = useState(null);
  const [progress, setProgress] = useState(0);
  const [edge, setEdge] = useState({ start: true, end: false });
  const hasSample = milestones.some((m) => m.sample);

  const sync = (s) => {
    setProgress(Math.max(0, Math.min(1, s.progress)));
    setEdge({ start: s.isBeginning, end: s.isEnd });
  };

  return (
    <section className="overflow-hidden bg-white py-16 md:py-24">
      <Container>
        <SectionHeader
          title={["Perjalanan", "menuju 2030"]}
          body="Tonggak yang sudah kami lewati dan yang sedang kami kejar."
          action={
            <div className="flex gap-2">
              <Arrow label="Sebelumnya" disabled={edge.start} onClick={() => swiper?.slidePrev()} flip />
              <Arrow label="Berikutnya" disabled={edge.end} onClick={() => swiper?.slideNext()} />
            </div>
          }
        />
        {hasSample && <PlaceholderTag className="mt-5" />}

        <div className="relative mt-10 min-w-0 md:mt-14">
          {/* beam */}
          <div aria-hidden className="absolute inset-x-0 top-[22px] h-[2px] rounded-full bg-line">
            <span className="block h-full origin-left bg-gold transition-transform duration-500 ease-cinematic" style={{ transform: `scaleX(${0.12 + progress * 0.88})` }} />
          </div>
          <Swiper
            modules={[A11y, Keyboard, Mousewheel]}
            keyboard
            mousewheel={{ forceToAxis: true }}
            spaceBetween={20}
            slidesPerView={1.15}
            breakpoints={{ 640: { slidesPerView: 2.1 }, 1024: { slidesPerView: 3.2 } }}
            onSwiper={(s) => {
              setSwiper(s);
              sync(s);
            }}
            onProgress={sync}
            onSlideChange={sync}
            className="!overflow-visible"
          >
            {milestones.map((m, i) => (
              <SwiperSlide key={m.year} className="!h-auto">
                <Milestone item={m} index={i} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Container>
    </section>
  );
}

function Milestone({ item, index }) {
  return (
    <div data-aos="fade-up" data-aos-delay={index * 70} className="group flex h-full flex-col">
      <span
        aria-hidden
        className={cn(
          "relative z-10 ml-5 grid size-[46px] place-items-center rounded-full border-2 bg-white transition-transform duration-500 ease-cinematic group-hover:scale-110",
          item.goal ? "border-maroon" : "border-gold"
        )}
      >
        <span className={cn("size-3 rounded-full", item.goal ? "bg-maroon animate-pulse" : "bg-gold")} />
      </span>
      <article
        className={cn(
          "mt-5 flex flex-1 flex-col rounded-lg border p-6 transition-[transform,box-shadow,border-color] duration-500 ease-cinematic group-hover:-translate-y-1",
          item.goal ? "border-navy bg-navy text-white shadow-[0_30px_60px_-34px_rgb(14_24_48/0.7)]" : "border-line bg-cream/50 group-hover:border-navy/20 group-hover:bg-white group-hover:shadow-[0_24px_50px_-36px_rgb(20_33_61/0.55)]"
        )}
      >
        <p className={cn("font-serif text-[2.5rem] leading-none tabular-nums", item.goal ? "text-gold-soft" : "text-navy")}>{item.year}</p>
        <h3 className={cn("mt-4 text-[17px] font-semibold", item.goal ? "text-white" : "text-navy")}>{item.title}</h3>
        <p className={cn("mt-2 text-[14.5px] leading-relaxed", item.goal ? "text-white/70" : "text-text/65")}>{item.body}</p>
        {item.sample && <span className="mt-auto pt-4 text-[11px] text-text/40">Contoh</span>}
      </article>
    </div>
  );
}

function Arrow({ label, onClick, disabled, flip }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="group grid size-11 place-items-center rounded-md border border-navy/20 bg-white text-navy transition-[border-color,opacity,transform] duration-300 hover:border-navy active:scale-95 disabled:pointer-events-none disabled:opacity-35"
    >
      <svg aria-hidden viewBox="0 0 16 16" className={cn("size-4 transition-transform duration-300", flip ? "rotate-180 group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5")}>
        <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
