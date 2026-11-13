"use client";
import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import { HOME_DEFAULTS } from "@/lib/home-cms/defaults";
import { Container, SectionHeader } from "./shared";
import { VideoCard } from "./video-player";
import { ArrowGlyph } from "./glyphs";
import { ElvoPeek } from "./elvo-peek";
import { LottieIllustration } from "@/components/media/lottie-illustration";

/** Testimoni alumni: video profil alumni + slider kutipan serif besar dengan tanda kutip emas. */
export function AlumniScene({ content: ALUMNI = HOME_DEFAULTS.alumni }) {
  const [swiper, setSwiper] = useState(null);
  const [i, setI] = useState(0);
  const n = ALUMNI.items.length;
  return (
    <section id="alumni" className="bg-cream-2 py-16 md:py-24">
      <Container>
        <SectionHeader title={ALUMNI.title} body={ALUMNI.body} action={ALUMNI.lottie ? <LottieIllustration src={ALUMNI.lottie} className="hidden w-32 md:block" /> : null} />
        <div className="mt-10 grid gap-10 md:mt-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <div data-aos="fade-up" className="min-w-0">
            {ALUMNI.video?.src && <VideoCard video={ALUMNI.video} label={ALUMNI.videoLabel} />}
          </div>

          <div data-aos="fade-up" data-aos-delay="100" className="min-w-0">
            <div className="flex items-end justify-between">
              <span aria-hidden className="block font-serif text-[6rem] leading-[0.6] text-gold">“</span>
              <div className="relative -mb-2 hidden sm:block"><ElvoPeek pose={ALUMNI.mascot.pose} size={84} say={ALUMNI.mascot.say} delay={1.2} /></div>
            </div>
            <Swiper modules={[Autoplay, A11y, Keyboard]} onSwiper={setSwiper} onSlideChange={(s) => setI(s.realIndex)} loop keyboard speed={700} autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }} className="mt-2">
              {ALUMNI.items.map((a, k) => (
                <SwiperSlide key={a.name + k}>
                  <figure>
                    <blockquote className="font-serif text-[clamp(1.4rem,2.2vw,1.85rem)] leading-snug text-navy">{a.quote}</blockquote>
                    <figcaption className="mt-6 flex items-center gap-3">
                      <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-white text-sm font-semibold text-maroon ring-2 ring-gold/60">
                        {a.photo ? <Image src={a.photo} alt="" fill sizes="48px" className="object-cover" /> : a.name.split(/[ ,.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("")}
                      </span>
                      <span>
                        <span className="block font-semibold text-navy">{a.name}</span>
                        <span className="block text-sm text-text/60">{a.role}</span>
                      </span>
                    </figcaption>
                  </figure>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="mt-8 flex items-center gap-4">
              <button type="button" aria-label="Sebelumnya" onClick={() => swiper?.slidePrev()} className="grid size-11 place-items-center rounded-full border border-navy/20 text-navy transition-colors hover:border-maroon hover:bg-maroon hover:text-white">
                <ArrowGlyph dir="left" className="size-4" />
              </button>
              <button type="button" aria-label="Berikutnya" onClick={() => swiper?.slideNext()} className="grid size-11 place-items-center rounded-full border border-navy/20 text-navy transition-colors hover:border-maroon hover:bg-maroon hover:text-white">
                <ArrowGlyph className="size-4" />
              </button>
              <span className="relative ml-2 h-px flex-1 bg-navy/15">
                <span className="absolute inset-y-0 left-0 bg-maroon transition-[width] duration-700 ease-cinematic" style={{ width: `${((i + 1) / n) * 100}%`, height: 2, top: -0.5 }} />
              </span>
              <span className="tabular text-sm text-text/55">{String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
