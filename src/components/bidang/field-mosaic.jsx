"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, SectionHeader } from "@/components/home/shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { Skeleton } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { useBidang } from "./bidang-provider";

/** Tata letak mosaik ≥ lg (4 kolom × 2 baris). Enterprise = tile besar (keunggulan khas prodi). */
const SPAN = {
  enterprise: "lg:col-span-2 lg:row-span-2",
  audit: "lg:col-span-2",
  data: "lg:col-span-1",
  msi: "lg:col-span-1",
};
const SURFACE = { maroon: "bg-maroon/[0.95]", navy: "bg-navy/[0.95]", gold: "bg-navy/[0.95]" };
const FROM = [{ yPercent: -100 }, { xPercent: 100 }, { yPercent: 100 }, { xPercent: -100 }];

/** Sisi masuk/keluar kursor: 0 atas, 1 kanan, 2 bawah, 3 kiri. */
function sideOf(e, el) {
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left - r.width / 2) * (r.width > r.height ? r.height / r.width : 1);
  const y = (e.clientY - r.top - r.height / 2) * (r.height > r.width ? r.width / r.height : 1);
  return Math.round((Math.atan2(y, x) * (180 / Math.PI) + 180) / 90 + 3) % 4;
}

/**
 * Mosaik bidang (pola Aceternity "Direction-aware hover" + "Focus cards" + 21st.dev "Layout grid").
 * ≥ lg: grid asimetris; lapisan warna solid masuk dari sisi kursor datang dan keluar ke sisi kursor pergi
 * (GSAP), memperlihatkan pertanyaan inti + Lottie. Tile lain meredup & buram (CSS `.bk-mosaic`).
 * Klik → modal yang tumbuh dari tile. Ponsel: Swiper dengan pertanyaan selalu terlihat.
 */
export function FieldMosaic() {
  const { fields } = useBidang();
  return (
    <section id="bidang" className="relative scroll-mt-24 bg-cream-2/60 py-16 md:py-24">
      <Container>
        <SectionHeader
          title={["Pilih pertanyaan", "yang ingin", "kamu jawab"]}
          body="Buka satu tile untuk rangkumannya: yang dipelajari, alat kerja, mata kuliah, dan dosen pengampunya."
        />
        <ul className="bk-mosaic mt-10 hidden gap-4 md:mt-12 lg:grid lg:h-[620px] lg:grid-cols-4 lg:grid-rows-2">
          {fields.map((f, i) => (
            <li key={f.slug} data-aos="fade-up" data-aos-delay={i * 70} className={cn("bk-tile min-h-0", SPAN[f.slug])}>
              <Tile field={f} index={i} big={f.slug === "enterprise"} />
            </li>
          ))}
        </ul>
      </Container>
      <div className="mt-8 lg:hidden">
        <Swiper modules={[A11y, Keyboard]} keyboard spaceBetween={14} slidesPerView={1.12} slidesOffsetBefore={20} slidesOffsetAfter={20} breakpoints={{ 640: { slidesPerView: 1.8 } }}>
          {fields.map((f, i) => (
            <SwiperSlide key={f.slug}>
              <Tile field={f} index={i} touch />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

function Tile({ field: f, index, big = false, touch = false }) {
  const { openField, setFocus } = useBidang();
  const btn = useRef(null);
  const layer = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const enter = (e) => {
    setFocus(index);
    if (touch) return;
    const reduce = prefersReducedMotion();
    gsap.killTweensOf(layer.current);
    if (reduce) return gsap.to(layer.current, { autoAlpha: 1, xPercent: 0, yPercent: 0, duration: 0.2 });
    gsap.fromTo(layer.current, { autoAlpha: 1, xPercent: 0, yPercent: 0, ...FROM[sideOf(e, btn.current)] }, { xPercent: 0, yPercent: 0, duration: 0.55, ease: "expo.out" });
    gsap.fromTo(layer.current.querySelectorAll("[data-rise]"), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: "expo.out", delay: 0.12 });
  };
  const leave = (e) => {
    setFocus(null);
    if (touch) return;
    gsap.killTweensOf(layer.current);
    if (prefersReducedMotion()) return gsap.to(layer.current, { autoAlpha: 0, duration: 0.2 });
    gsap.to(layer.current, { ...FROM[sideOf(e, btn.current)], duration: 0.5, ease: "expo.inOut", onComplete: () => gsap.set(layer.current, { autoAlpha: 0 }) });
  };

  return (
    <button
      ref={btn}
      type="button"
      data-lottie-hover
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={() => setFocus(index)}
      onBlur={() => setFocus(null)}
      onClick={(e) => openField(index, e.currentTarget)}
      aria-label={`${f.title}: ${f.question} Buka rangkuman`}
      className={cn(
        "group relative block w-full overflow-hidden rounded-xl bg-navy text-left text-white outline-none focus-visible:ring-4 focus-visible:ring-gold/50",
        touch ? "aspect-[4/5]" : "h-full"
      )}
    >
      {!loaded && <Skeleton className="absolute inset-0 rounded-none bg-navy-deep/60" />}
      <Image
        src={f.image}
        alt=""
        fill
        onLoad={() => setLoaded(true)}
        sizes={big ? "(min-width:1024px) 600px, 90vw" : "(min-width:1024px) 600px, 90vw"}
        className={cn("object-cover transition-transform duration-1000 ease-cinematic group-hover:scale-[1.05]", f.crop && "scale-[1.12]")}
      />

      {/* bar dasar */}
      <div className={cn("absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-navy-deep/80 p-5 transition-opacity duration-300 sm:p-6", !touch && "group-hover:opacity-0")}>
        <div className="min-w-0">
          <span className="tabular text-[11px] tracking-[0.18em] text-gold-soft">0{index + 1}</span>
          <h3 className={cn("mt-1 font-serif leading-tight", big ? "text-[clamp(1.6rem,2.4vw,2.2rem)]" : "text-[1.4rem]")}>{f.title}</h3>
          {(touch || big) && <p className="mt-2 max-w-md text-[14px] italic leading-snug text-white/75">“{f.question}”</p>}
        </div>
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full border border-white/25 transition-[background-color,border-color] duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-navy">
          <svg viewBox="0 0 16 16" className="size-4">
            <path d="M4 12L12 4M6 4h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {/* lapisan arah-kursor (desktop) */}
      {!touch && (
        <div ref={layer} className={cn("invisible absolute inset-0 flex flex-col justify-between p-6 opacity-0 sm:p-7", SURFACE[f.accent])}>
          <div className="flex items-start justify-between gap-4">
            <span data-rise className="tabular text-[11px] tracking-[0.18em] text-gold-soft">0{index + 1} · {f.short}</span>
            {f.lottie && <LottieIllustration data-rise src={f.lottie} replayOnHover className={cn("shrink-0", big ? "size-24" : "size-16")} />}
          </div>
          <div>
            <p data-rise className={cn("font-serif italic leading-[1.12] text-white", big ? "text-[clamp(2rem,3.2vw,3rem)]" : "text-[1.55rem]")}>“{f.question}”</p>
            <p data-rise className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-gold-soft">
              <span className="u-gold">Buka rangkuman</span>
              <svg aria-hidden viewBox="0 0 16 16" className="size-4">
                <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </p>
          </div>
        </div>
      )}
    </button>
  );
}
