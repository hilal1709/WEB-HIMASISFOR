"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import { EXPERTISE } from "@/lib/home-content";
import { cn } from "@/lib/utils";
import { ArrowLink, Container, SectionHeader } from "./shared";
import { ElvoPeek } from "./elvo-peek";
import { LottieIllustration } from "@/components/media/lottie-illustration";

/**
 * Bidang keahlian — kartu foto dengan bar keterangan maroon. Hover: foto zoom, bar memanjang
 * memperlihatkan prospek karier. Ponsel: Swiper.
 */
export function ExpertiseScene() {
  return (
    <section id="bidang" className="relative bg-cream-2 py-16 md:py-24">
      <Container className="relative">
        <div className="absolute -top-6 right-[38%] z-10 hidden xl:block">
          <div className="relative"><ElvoPeek pose="think" size={92} say="Bingung pilih bidang? Arahkan kursor ke kartunya." side="right" delay={0.3} /></div>
        </div>
        <SectionHeader title={EXPERTISE.title} body={EXPERTISE.body} action={<ArrowLink href="/curiculum">Lihat kurikulum lengkap</ArrowLink>} />
        <ul className="mt-10 hidden gap-5 md:mt-12 md:grid md:grid-cols-2 lg:grid-cols-4">
          {EXPERTISE.items.map((item, i) => (
            <li key={item.slug} data-aos="fade-up" data-aos-delay={i * 80}>
              <Card item={item} index={i} />
            </li>
          ))}
        </ul>
      </Container>
      <div className="mt-8 md:hidden">
        <Swiper modules={[A11y, Keyboard]} keyboard spaceBetween={14} slidesPerView={1.15} slidesOffsetBefore={20} slidesOffsetAfter={20}>
          {EXPERTISE.items.map((item, i) => (
            <SwiperSlide key={item.slug}>
              <Card item={item} index={i} open />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

function Card({ item, index, open }) {
  return (
    <a href="/curiculum" className="group relative block aspect-[3/4] overflow-hidden rounded-lg bg-maroon-deep text-white">
      <Image src={item.image} alt="" fill sizes="(min-width:1024px) 300px, (min-width:768px) 45vw, 85vw" className={cn("object-cover transition-transform duration-1000 ease-cinematic group-hover:scale-[1.07]", item.crop && "scale-[1.12]")} />
      <span className="absolute left-4 top-4 grid size-9 place-items-center rounded-full bg-gold font-serif text-sm text-navy">0{index + 1}</span>
      <div className="absolute inset-x-0 bottom-0 bg-maroon/[0.94] p-5">
        <div className="flex items-center gap-3">
          {item.lottie && <LottieIllustration src={item.lottie} replayOnHover className="size-12 shrink-0" />}
          <h3 className="font-serif text-[1.45rem] leading-tight">{item.title}</h3>
        </div>
        <div className={cn("grid transition-[grid-template-rows] duration-700 ease-cinematic", open ? "grid-rows-[1fr]" : "grid-rows-[0fr] group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]")}>
          <div className="overflow-hidden">
            <p className="pt-3 text-sm leading-relaxed text-white/80">{item.body}</p>
            <p className="kicker mt-4 text-[11px] text-gold-soft">Prospek karier</p>
            <p className="mt-1 text-sm text-white/90">{item.careers.join(" · ")}</p>
          </div>
        </div>
      </div>
    </a>
  );
}
