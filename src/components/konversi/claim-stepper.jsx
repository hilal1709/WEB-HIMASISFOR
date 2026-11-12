"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { gsap, ScrollTrigger } from "@/lib/scroll";
import { Container, PlaceholderTag, SceneTitle } from "@/components/home/shared";
import { KonversiBanner } from "./konversi-banner";
import { cn } from "@/lib/utils";
import { useKonversi } from "./konversi-provider";

const pad = (n) => String(n).padStart(2, "0");

function StepBody({ step, onDoc, tone = "light" }) {
  const dark = tone === "dark";
  return (
    <>
      <dl className={cn("grid gap-4 border-y py-5 sm:grid-cols-3", dark ? "border-white/10" : "border-line")}>
        {[
          ["Siapa", step.who],
          ["Hasilnya", step.output],
          ["Kapan", step.when],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className={cn("kicker text-[10.5px]", dark ? "text-gold-soft" : "text-maroon")}>{k}</dt>
            <dd className={cn("mt-1.5 text-[14.5px] font-medium leading-snug", dark ? "text-white" : "text-navy")}>{v}</dd>
          </div>
        ))}
      </dl>
      <p className={cn("mt-5 max-w-xl text-pretty text-[15.5px] leading-relaxed", dark ? "text-white/70" : "text-text/70")}>{step.body}</p>
      {(step.doc || step.link) && (
        <div className="mt-6 flex flex-wrap gap-3">
          {step.doc && (
            <button
              type="button"
              onClick={() => onDoc(step.doc)}
              className="group inline-flex h-11 items-center gap-2.5 rounded-md bg-gold px-4 text-[14px] font-semibold text-navy transition-[background-color,transform] duration-300 hover:bg-gold-soft active:scale-[0.97]"
            >
              <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:-rotate-6">
                <path d="M4 1.5h5.5L12.5 4.5v10h-8.5zM9.5 1.5v3h3M6 8h4.5M6 10.5h4.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
              Lihat templat
            </button>
          )}
          {step.link && (
            <a href={step.link.href} className={cn("group inline-flex h-11 items-center gap-2 text-[14px] font-semibold", dark ? "text-white" : "text-maroon")}>
              <span className="u-gold">{step.link.label}</span>
              <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5">
                <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Alur pengajuan `#alur` — stepper vertikal (pola 21st.dev Steps dengan thumb bergeser).
 * ≥ lg & tanpa reduced-motion: section disematkan (ScrollTrigger pin), progres scroll memilih tahap; thumb emas
 * meluncur di rel kiri, panel kanan berganti lewat mask-wipe clip-path. Klik nomor → gulir ke tahap itu.
 * Ponsel: Swiper dengan pagination fraksi.
 */
export function ClaimStepper() {
  const { steps, openDoc } = useKonversi();
  const reduce = useReducedMotion();
  const pin = useRef(null);
  const st = useRef(null);
  const [active, setActive] = useState(0);
  const n = steps.length;

  useEffect(() => {
    const el = pin.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      st.current = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${window.innerHeight * 0.55 * (n - 1)}`,
        pin: true,
        anticipatePin: 1,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.15, max: 0.4 }, ease: "power2.out", delay: 0.05 },
        onUpdate: (self) => setActive(Math.min(n - 1, Math.round(self.progress * (n - 1)))),
      });
      // Konten di atas section (kantong yang dibuka, banner ditutup, Lottie dimuat) mengubah tinggi halaman →
      // posisi pin harus dihitung ulang, kalau tidak section ini menumpuk di atas meja konversi.
      let t;
      const ro = new ResizeObserver(() => {
        clearTimeout(t);
        t = setTimeout(() => ScrollTrigger.refresh(), 120);
      });
      ro.observe(document.body);
      return () => {
        clearTimeout(t);
        ro.disconnect();
        st.current?.kill();
        st.current = null;
      };
    });
    return () => mm.revert();
  }, [n]);

  const go = (i) => {
    const t = st.current;
    if (t) {
      window.scrollTo({ top: t.start + ((t.end - t.start) * i) / (n - 1), behavior: "smooth" });
    } else setActive(i);
  };

  const step = steps[active];

  return (
    <section id="alur" className="scroll-mt-20 bg-cream max-lg:overflow-x-clip">
      <div ref={pin} className="relative z-0 bg-cream py-16 md:py-24 lg:min-h-screen lg:pb-10 lg:pt-28">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span aria-hidden className="mb-5 block h-[3px] w-10 bg-gold" />
              <SceneTitle title={["Enam langkah", "sampai nilainya masuk"]} />
            </div>
            <PlaceholderTag className="self-start md:self-end" />
          </div>
          <KonversiBanner className="mt-8" />

          {/* ≥ lg: rel + panel */}
          <div className="mt-12 hidden gap-12 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
            <ol className="relative" aria-label="Tahap pengajuan">
              <span aria-hidden className="absolute bottom-5 left-[19px] top-5 w-px bg-line" />
              <motion.span
                aria-hidden
                className="absolute left-[18px] top-5 w-[3px] origin-top rounded-full bg-gold"
                animate={{ height: `calc(${(active / (n - 1)) * 100}% - ${(active / (n - 1)) * 40}px)` }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 26 }}
              />
              {steps.map((s, i) => {
                const on = i === active;
                const done = i < active;
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-current={on ? "step" : undefined}
                      className="group relative flex w-full items-center gap-4 py-2.5 text-left outline-none"
                    >
                      <span
                        className={cn(
                          "relative z-10 grid size-10 shrink-0 place-items-center rounded-full border text-[13px] font-semibold transition-[background-color,border-color,color] duration-300 group-focus-visible:ring-2 group-focus-visible:ring-gold",
                          on ? "border-maroon bg-maroon text-white" : done ? "border-gold bg-gold text-navy" : "border-line bg-white text-text/50 group-hover:border-navy/40"
                        )}
                      >
                        {on && <motion.span layoutId="konversi-step-thumb" className="absolute -inset-1.5 rounded-full border-2 border-gold" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28 }} />}
                        {done ? (
                          <svg aria-hidden viewBox="0 0 16 16" className="size-4"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        ) : (
                          <span className="tabular">{pad(i + 1)}</span>
                        )}
                      </span>
                      <span className={cn("text-[15px] leading-snug transition-colors duration-300", on ? "font-semibold text-navy" : "text-text/55 group-hover:text-navy")}>{s.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="relative min-h-[360px]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={step.key}
                  initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)", y: 24 }}
                  animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)", y: 0 }}
                  exit={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)", y: -24 }}
                  transition={{ duration: reduce ? 0.01 : 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-lg border border-line bg-white p-8 xl:p-10"
                >
                  <div className="flex items-baseline gap-5">
                    <span className="tabular font-serif text-[4.5rem] leading-none text-gold">{pad(active + 1)}</span>
                    <h3 className="font-serif text-[clamp(1.7rem,2.6vw,2.3rem)] leading-tight text-navy">{step.title}</h3>
                  </div>
                  <div className="mt-6">
                    <StepBody step={step} onDoc={openDoc} />
                  </div>
                </motion.div>
              </AnimatePresence>
              <p className="mt-4 text-[12.5px] text-text/45">Gulir untuk lanjut ke tahap berikutnya, atau pilih nomornya.</p>
            </div>
          </div>

          {/* < lg: Swiper */}
          <div className="mt-10 min-w-0 lg:hidden">
            <Swiper
              modules={[Pagination, A11y]}
              spaceBetween={14}
              slidesPerView={1.06}
              pagination={{ type: "fraction", el: ".konversi-step-pg" }}
              a11y={{ prevSlideMessage: "Tahap sebelumnya", nextSlideMessage: "Tahap berikutnya" }}
              className="!overflow-visible"
            >
              {steps.map((s, i) => (
                <SwiperSlide key={s.key} className="!h-auto">
                  <article className="flex h-full flex-col rounded-lg bg-navy p-6 text-white">
                    <span className="tabular font-serif text-[3rem] leading-none text-gold">{pad(i + 1)}</span>
                    <h3 className="mt-3 font-serif text-[1.6rem] leading-tight">{s.title}</h3>
                    <div className="mt-5">
                      <StepBody step={s} onDoc={openDoc} tone="dark" />
                    </div>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>
            <p className="konversi-step-pg tabular mt-4 !static text-[13px] font-semibold text-navy" />
          </div>
        </Container>
      </div>
    </section>
  );
}
