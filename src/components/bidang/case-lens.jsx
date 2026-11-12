"use client";
import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, EffectCards, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CASE } from "@/lib/bidang-keahlian-content";
import { Container, PlaceholderTag, SceneTitle } from "@/components/home/shared";
import { CompassQuadrantIllustration } from "@/components/illustrations/line-illustrations";
import { cn } from "@/lib/utils";
import { useBidang } from "./bidang-provider";

const SURFACE = ["bg-maroon text-white", "bg-navy text-white", "bg-white text-navy border border-line", "bg-cream-2 text-navy"];

/**
 * "Satu masalah, empat sudut pandang" (storytelling horizonx). Kiri: kartu kasus + kompas mini yang menyalakan
 * kuadran bidang yang sedang dibahas. Kanan: tumpukan kartu Swiper `EffectCards` (geser/seret, ‹ ›, ←/→)
 * berisi langkah pertama dan keluaran tiap spesialis. Bar progres emas mengikuti kartu aktif.
 */
export function CaseLens() {
  const { fields, openField } = useBidang();
  const [active, setActive] = useState(0);
  const swiper = useRef(null);
  const f = fields[active];

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <span aria-hidden className="mb-5 block h-[3px] w-10 bg-gold" />
            <SceneTitle title={["Satu masalah,", "empat", "sudut pandang"]} />
            <div className="mt-8 rounded-xl border border-line bg-cream-2/70 p-6 sm:p-7" data-aos="fade-up">
              <p className="kicker text-[11px] text-maroon">{CASE.kicker}</p>
              <p className="mt-2 font-serif text-[1.45rem] leading-snug text-navy sm:text-[1.65rem]">{CASE.title}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-text/65">{CASE.body}</p>
              {CASE.sample && <PlaceholderTag className="mt-4" />}
            </div>

            <div className="mt-8 flex items-center gap-6">
              <div className="compass w-40 shrink-0 text-ink sm:w-48" data-active-quadrant={f?.quadrant ?? "none"} aria-hidden>
                <CompassQuadrantIllustration compact />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] text-text/50">Sekarang dibahas</p>
                <p key={f?.slug} className="mt-0.5 font-serif text-[1.3rem] leading-tight text-navy animate-in fade-in-0 slide-in-from-bottom-1 duration-500">{f?.title}</p>
                <div className="mt-4 flex items-center gap-3">
                  <span aria-hidden className="relative h-1 flex-1 overflow-hidden rounded-full bg-line">
                    <span className="absolute inset-y-0 left-0 rounded-full bg-gold transition-[width] duration-700 ease-cinematic" style={{ width: `${((active + 1) / fields.length) * 100}%` }} />
                  </span>
                  <span className="tabular text-[12.5px] text-text/50">{active + 1}/{fields.length}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <NavBtn label="Sudut pandang sebelumnya" icon={ChevronLeft} onClick={() => swiper.current?.slidePrev()} disabled={active === 0} />
                  <NavBtn label="Sudut pandang berikutnya" icon={ChevronRight} onClick={() => swiper.current?.slideNext()} disabled={active === fields.length - 1} />
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 px-6 sm:px-10" data-aos="fade-left">
            <Swiper
              modules={[EffectCards, A11y, Keyboard]}
              effect="cards"
              grabCursor
              keyboard
              cardsEffect={{ perSlideOffset: 9, perSlideRotate: 3, slideShadows: false }}
              onSwiper={(s) => (swiper.current = s)}
              onSlideChange={(s) => setActive(s.activeIndex)}
              className="mx-auto max-w-[400px] !overflow-visible"
            >
              {fields.map((x, i) => (
                <SwiperSlide key={x.slug} className={cn("rounded-2xl shadow-[0_30px_60px_-35px_rgb(20_33_61/0.6)]", SURFACE[i % SURFACE.length])}>
                  <article className="flex min-h-[420px] flex-col p-7 sm:p-8">
                    <div className="flex items-start justify-between gap-3">
                      <p className={cn("kicker text-[11px]", i < 2 ? "text-gold-soft" : "text-maroon")}>{x.move.role}</p>
                      <span className={cn("font-serif text-[2.6rem] leading-none", i < 2 ? "text-white/25" : "text-navy/15")}>0{i + 1}</span>
                    </div>
                    <h3 className="mt-3 font-serif text-[1.6rem] leading-tight">{x.title}</h3>
                    <p className={cn("mt-6 text-[12px] font-semibold uppercase tracking-[0.14em]", i < 2 ? "text-white/50" : "text-text/45")}>Langkah pertama</p>
                    <p className={cn("mt-2 text-[15.5px] leading-relaxed", i < 2 ? "text-white/85" : "text-text/75")}>{x.move.step}</p>
                    <div className={cn("mt-auto border-t pt-5", i < 2 ? "border-white/15" : "border-line")}>
                      <p className={cn("text-[12px] font-semibold uppercase tracking-[0.14em]", i < 2 ? "text-white/50" : "text-text/45")}>Keluaran</p>
                      <p className="mt-1.5 font-serif text-[1.15rem] italic leading-snug">{x.move.output}</p>
                      <button
                        type="button"
                        onClick={(e) => openField(i, e.currentTarget)}
                        className={cn("mt-4 text-[14px] font-semibold", i < 2 ? "text-gold-soft" : "text-maroon")}
                      >
                        <span className="u-gold">Pelajari bidangnya</span>
                      </button>
                    </div>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>
            <p className="mt-6 text-center text-[13px] text-text/45">Seret kartu teratas untuk sudut pandang berikutnya.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function NavBtn({ label, onClick, icon: Icon, disabled }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-10 place-items-center rounded-md border border-line bg-white text-navy transition-[border-color,background-color,color,transform,opacity] duration-300 hover:border-maroon hover:bg-maroon hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-35"
    >
      <Icon aria-hidden className="size-4" />
    </button>
  );
}
