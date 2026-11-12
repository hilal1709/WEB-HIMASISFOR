"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, FreeMode, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import { gsap, ScrollTrigger } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { smoothTo, useJalur } from "./jalur-provider";

const pad = (n) => String(n).padStart(2, "0");

/**
 * Bentuk jalan per jalur. Struktur perintah SAMA (M + 3×C) agar GSAP bisa menginterpolasi atribut `d`
 * — jalan "berubah bentuk" saat bab berganti. viewBox 360×460, mulai di bawah, berakhir di atas (toga).
 */
const ROADS = {
  skripsi: "M70 430C70 340 290 340 290 250C290 160 70 180 80 100C88 52 200 44 290 34",
  lomba: "M180 430C40 380 40 300 180 262C320 224 320 144 180 112C84 90 120 44 180 34",
  pkm: "M290 430C290 344 70 360 80 270C90 182 290 210 280 122C272 70 130 60 70 34",
  bisnis: "M70 430C170 420 300 380 290 300C280 222 70 250 80 160C90 92 260 110 290 34",
};

const useIsoLayout = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * "Jalan yang kamu tempuh" — scrollytelling (≥ lg). Kiri: papan navy sticky berisi peta jalan SVG; jalan
 * berubah bentuk mengikuti bab jalur yang sedang dibaca (GSAP attr `d`), garis emas & titik pejalan maju
 * mengikuti posisi gulir di dalam bab (ScrollTrigger), tahap yang dilewati terisi emas. Kanan: empat bab,
 * tiap tahap membuka modal. Ponsel: Swiper freeMode per jalur.
 */
export function RouteStory() {
  const { paths, openStage } = useJalur();
  const [chapter, setChapter] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const root = useRef(null);
  const road = useRef(null);
  const trail = useRef(null);
  const mark = useRef(null);
  const walker = useRef(null);
  const nodes = useRef([]);
  const progress = useRef(0);
  const chapterRef = useRef(0);
  chapterRef.current = chapter;

  const p = paths[chapter];
  const n = p.stages.length;

  // posisikan titik tahap + garis emas + pejalan di sepanjang jalan saat ini
  const place = () => {
    const r = road.current;
    if (!r) return;
    const len = r.getTotalLength();
    const count = paths[chapterRef.current].stages.length;
    nodes.current.forEach((c, i) => {
      if (!c) return;
      if (i >= count) {
        c.style.opacity = "0";
        return;
      }
      const pt = r.getPointAtLength((len * i) / Math.max(1, count - 1));
      c.setAttribute("cx", pt.x.toFixed(1));
      c.setAttribute("cy", pt.y.toFixed(1));
      c.style.opacity = "1";
      c.toggleAttribute("data-passed", progress.current >= i / Math.max(1, count - 1) - 0.001);
    });
    mark.current?.setAttribute("d", r.getAttribute("d"));
    const t = trail.current;
    if (t) {
      t.setAttribute("d", r.getAttribute("d"));
      t.style.strokeDasharray = `${len}`;
      t.style.strokeDashoffset = `${len * (1 - progress.current)}`;
    }
    const w = walker.current;
    if (w) {
      const pt = r.getPointAtLength(len * progress.current);
      w.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
    }
  };

  // ScrollTrigger per bab: bab aktif + progres di dalam bab
  useIsoLayout(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      el.querySelectorAll("[data-chapter]").forEach((ch) => {
        const i = Number(ch.getAttribute("data-chapter"));
        ScrollTrigger.create({
          trigger: ch,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setChapter(i),
          onUpdate: (self) => {
            if (chapterRef.current !== i) return;
            progress.current = self.progress;
            const count = paths[i].stages.length;
            setStageIdx(Math.min(count - 1, Math.round(self.progress * (count - 1))));
            place();
          },
        });
      });
      place();
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paths]);

  // jalan berubah bentuk saat bab berganti
  useEffect(() => {
    const r = road.current;
    if (!r) return;
    const d = ROADS[p.key] ?? ROADS.skripsi;
    if (prefersReducedMotion()) {
      r.setAttribute("d", d);
      place();
      return;
    }
    const tw = gsap.to(r, { attr: { d }, duration: 0.9, ease: "power3.inOut", onUpdate: place, onComplete: place });
    return () => tw.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.key]);

  return (
    <section id="jalur" ref={root} className="relative scroll-mt-20 bg-white py-16 md:py-24">
      <Container>
        <SectionHeader title={["Jalan yang", "kamu tempuh"]} body="Dari pengajuan sampai sidang, setiap jalur punya urutan tahapnya sendiri. Ketuk sebuah tahap untuk melihat apa yang perlu kamu siapkan." />

        {/* ≥ lg: papan sticky + bab */}
        <div className="mt-14 hidden gap-14 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="relative">
            <div className="sticky top-24 flex h-[calc(100vh-8rem)] max-h-[680px] min-h-[520px] flex-col overflow-hidden rounded-2xl bg-navy p-6 text-white">
              <div className="flex items-center gap-1 rounded-lg bg-navy-deep/70 p-1" role="tablist" aria-label="Pilih bab jalur">
                {paths.map((x, i) => (
                  <button
                    key={x.key}
                    type="button"
                    role="tab"
                    aria-selected={i === chapter}
                    onClick={() => smoothTo(`bab-${x.key}`)}
                    className={cn(
                      "flex-1 rounded-md px-2 py-1.5 text-[13.5px] font-medium transition-[background-color,color] duration-300 ease-cinematic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
                      i === chapter ? "bg-gold text-navy" : "text-white/65 hover:text-white"
                    )}
                  >
                    {x.title}
                  </button>
                ))}
              </div>

              <div className="relative min-h-0 flex-1">
                <svg viewBox="0 0 360 460" className="absolute inset-0 m-auto h-full w-full" aria-hidden>
                  {/* jalan dasar (lebar) + marka putus-putus */}
                  <path ref={road} d={ROADS[paths[0].key]} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="26" strokeLinecap="round" />
                  <path ref={mark} d={ROADS[paths[0].key]} fill="none" stroke="rgb(255 255 255 / 0.3)" strokeWidth="1.6" strokeDasharray="4 9" strokeLinecap="round" />
                  <path ref={trail} d={ROADS[paths[0].key]} fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" />
                  {Array.from({ length: 6 }, (_, i) => (
                    <circle key={i} ref={(c) => (nodes.current[i] = c)} r="8" className="jk-node" />
                  ))}
                  <g ref={walker}>
                    <circle r="15" fill="var(--gold)" fillOpacity="0.18" className="jk-walker-halo" />
                    <circle r="5.5" fill="var(--gold)" />
                  </g>
                </svg>
                <span key={p.key} className="absolute right-0 top-3 grid size-20 place-items-center rounded-full bg-maroon p-2.5 animate-in fade-in-0 zoom-in-90 duration-500">
                  <LottieIllustration src={p.lottie} label={`Ilustrasi jalur ${p.title}`} />
                </span>
              </div>

              <div aria-live="polite" className="border-t border-white/15 pt-4">
                <p className="kicker text-[10.5px] text-gold-soft">
                  {p.title} · tahap {pad(stageIdx + 1)}/{pad(n)}
                </p>
                <p key={`${p.key}-${stageIdx}`} className="mt-1 font-serif text-[1.3rem] leading-tight animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                  {p.stages[stageIdx]?.name}
                </p>
              </div>
            </div>
          </div>

          <div>
            {paths.map((x, i) => (
              <article key={x.key} id={`bab-${x.key}`} data-chapter={i} className="scroll-mt-28 border-t border-line pb-24 pt-10 first:border-t-0 first:pt-0 last:pb-6">
                <div className="flex items-baseline gap-4">
                  <span className={cn("tabular font-serif text-[1rem] transition-colors duration-500", i === chapter ? "text-gold" : "text-text/35")}>Bab {pad(i + 1)}</span>
                  <span className="h-px flex-1 bg-line" aria-hidden />
                  <span className="text-[13px] text-text/50">{x.mentor}</span>
                </div>
                <h3 className={cn("mt-3 font-serif text-[clamp(2.2rem,3.6vw,3.2rem)] leading-none transition-colors duration-500", i === chapter ? "text-navy" : "text-navy/35")}>{x.title}</h3>
                <ol className="mt-8 space-y-2">
                  {x.stages.map((s, k) => (
                    <li key={s.name}>
                      <StageRow s={s} k={k} on={i === chapter && k <= stageIdx} onClick={() => openStage(i, k)} />
                    </li>
                  ))}
                </ol>
                {x.sample && <PlaceholderTag className="mt-5" />}
              </article>
            ))}
          </div>
        </div>

        {/* < lg: Swiper per jalur */}
        <MobileStory />
      </Container>
    </section>
  );
}

function StageRow({ s, k, on, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group grid w-full grid-cols-[3rem_1fr_auto] items-center gap-4 rounded-lg border px-4 py-4 text-left transition-[background-color,border-color,transform] duration-500 ease-cinematic hover:-translate-y-0.5 hover:border-maroon/30 hover:bg-cream/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
        on ? "border-gold/50 bg-cream/50" : "border-line bg-white"
      )}
    >
      <span className={cn("tabular font-serif text-[1.8rem] leading-none transition-colors duration-500", on ? "text-gold" : "text-navy/20")}>{pad(k + 1)}</span>
      <span className="min-w-0">
        <span className="block text-[16px] font-medium text-navy group-hover:text-maroon">{s.name}</span>
        <span className="mt-0.5 block text-[13.5px] text-text/55">
          {s.time} · <span className="italic">{s.output}</span>
        </span>
      </span>
      <svg aria-hidden viewBox="0 0 16 16" className="size-4 text-maroon opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
        <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function MobileStory() {
  const { paths, openStage, active: chosen } = useJalur();
  const [active, setActive] = useState(0);
  const swiper = useRef(null);
  // jalur yang dipilih di hero → geser ke slide-nya
  useEffect(() => {
    swiper.current?.slideTo(chosen);
  }, [chosen]);
  return (
    <div className="mt-10 min-w-0 lg:hidden">
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-cream-2/70 p-1" role="tablist" aria-label="Pilih jalur">
        {paths.map((x, i) => (
          <button
            key={x.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => swiper.current?.slideTo(i)}
            className={cn("flex-1 rounded-md px-3 py-2 text-[14px] font-medium transition-colors duration-300", i === active ? "bg-navy text-white" : "text-navy/70")}
          >
            {x.title}
          </button>
        ))}
      </div>
      <Swiper
        modules={[FreeMode, A11y, Keyboard]}
        keyboard
        spaceBetween={14}
        slidesPerView={1.06}
        freeMode={{ enabled: true, sticky: true }}
        onSwiper={(s) => (swiper.current = s)}
        onSlideChange={(s) => setActive(s.activeIndex)}
        className="mt-4 !overflow-visible"
      >
        {paths.map((x, i) => (
          <SwiperSlide key={x.key}>
            <article className="rounded-2xl bg-navy p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="kicker text-[10.5px] text-gold-soft">Bab {pad(i + 1)} · {x.mentor}</p>
                  <h3 className="mt-1 font-serif text-[1.9rem] leading-none">{x.title}</h3>
                </div>
                <span className="grid size-16 shrink-0 place-items-center rounded-full bg-maroon p-2">
                  <LottieIllustration src={x.lottie} />
                </span>
              </div>
              <ol className="relative mt-5 space-y-1 border-l border-dashed border-white/25 pl-4">
                {x.stages.map((s, k) => (
                  <li key={s.name}>
                    <button type="button" onClick={() => openStage(i, k)} className="relative w-full rounded-md py-2 text-left active:bg-white/5">
                      <span aria-hidden className="absolute -left-[21px] top-3.5 size-2.5 rounded-full border-2 border-gold bg-navy" />
                      <span className="block text-[15px] font-medium">{pad(k + 1)} · {s.name}</span>
                      <span className="block text-[13px] text-white/55">{s.time}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="mt-5 flex items-center gap-3" aria-hidden>
        <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-line">
          <span className="absolute inset-y-0 left-0 rounded-full bg-gold transition-[width] duration-500 ease-cinematic" style={{ width: `${((active + 1) / paths.length) * 100}%` }} />
        </span>
        <span className="tabular text-[12.5px] text-text/50">{active + 1}/{paths.length}</span>
      </div>
      {paths[active]?.sample && <PlaceholderTag className="mt-4" />}
    </div>
  );
}
