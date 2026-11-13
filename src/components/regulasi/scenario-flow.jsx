"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { useRegulasi } from "./regulasi-provider";

const pad = (n) => String(n).padStart(2, "0");

/**
 * "Kalau terjadi…" — kiri: daftar situasi editorial (baris serif, baris lain meredup saat hover);
 * kanan: alur langkah vertikal yang garis penghubungnya tergambar ulang (GSAP) setiap situasi berganti.
 * Berkas, contoh pesan, dan pasal rujukan ada di modal prosedur (tidak diulang di sini). Ponsel: chip Swiper FreeMode.
 */
export function ScenarioFlow() {
  const { scenarios, openProc, findPasal } = useRegulasi();
  const [i, setI] = useState(0);
  const flow = useRef(null);
  const s = scenarios[i];
  const ref = findPasal(s.ref);

  useEffect(() => {
    const el = flow.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-wire]", { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: "expo.out", transformOrigin: "50% 0%" });
      gsap.fromTo("[data-step]", { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.09, ease: "expo.out" });
      gsap.fromTo("[data-dot]", { scale: 0 }, { scale: 1, duration: 0.5, stagger: 0.09, ease: "back.out(3)" });
    }, el);
    return () => ctx.revert();
  }, [i]);

  const onKey = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setI((v) => (v + 1) % scenarios.length);
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setI((v) => (v - 1 + scenarios.length) % scenarios.length);
    }
  };

  return (
    <section id="prosedur" className="relative scroll-mt-20 py-16 md:py-20">
      <Container>
        <SectionHeader title={["Kalau terjadi", "sesuatu…"]} body="Situasi yang paling sering ditanyakan ke sekretariat, lengkap dengan urutan langkahnya." action={s.sample ? <PlaceholderTag /> : null} />

        <div className="mt-8 min-w-0 md:hidden">
          <Swiper modules={[FreeMode, A11y]} freeMode slidesPerView="auto" spaceBetween={8}>
            {scenarios.map((x, k) => (
              <SwiperSlide key={x.key} className="!w-auto">
                <button
                  type="button"
                  onClick={() => setI(k)}
                  aria-pressed={k === i}
                  className={cn("rounded-full border px-4 py-2 text-[14px] transition-colors duration-300", k === i ? "border-navy bg-navy text-white" : "border-line bg-white text-navy")}
                >
                  {x.title}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-[1fr_1.05fr] md:gap-12 lg:gap-16">
          <div role="tablist" aria-orientation="vertical" aria-label="Situasi" onKeyDown={onKey} className="rg-rows hidden border-t border-line md:block">
            {scenarios.map((x, k) => (
              <button
                key={x.key}
                type="button"
                role="tab"
                aria-selected={k === i}
                tabIndex={k === i ? 0 : -1}
                onClick={() => setI(k)}
                onPointerEnter={() => setI(k)}
                className="rg-row group flex w-full items-baseline gap-5 border-b border-line py-5 text-left outline-none focus-visible:bg-cream"
              >
                <span className={cn("tabular w-8 font-serif text-[15px] transition-colors", k === i ? "text-gold" : "text-text/35")}>{pad(k + 1)}</span>
                <span className={cn("flex-1 font-serif text-[clamp(1.35rem,2.2vw,1.85rem)] leading-tight transition-colors duration-300", k === i ? "text-maroon" : "text-navy")}>
                  {x.title}
                </span>
                <svg aria-hidden viewBox="0 0 16 16" className={cn("size-5 shrink-0 text-maroon transition-[opacity,transform] duration-500 ease-cinematic", k === i ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0")}>
                  <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>

          <div ref={flow} role="tabpanel" aria-live="polite" className="rounded-2xl border border-line bg-white p-6 shadow-[0_30px_70px_-50px_rgb(20_33_61/0.6)] sm:p-8 md:sticky md:top-24 md:self-start">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-gold/15 px-2.5 py-1 text-[12.5px] font-semibold text-navy">
                <span aria-hidden className="size-1.5 rounded-full bg-gold" />
                {s.deadline}
              </span>
              <span className="inline-flex items-center rounded-md bg-cream px-2.5 py-1 text-[12.5px] text-text/70">Ke: {s.to}</span>
            </div>
            <h3 className="mt-4 font-serif text-[1.6rem] leading-tight text-navy md:hidden">{s.title}</h3>

            <ol className="relative mt-6">
              <span aria-hidden data-wire className="absolute bottom-4 left-[11px] top-3 w-[2px] bg-gold/60" />
              {s.steps.map((step, k) => (
                <li key={`${s.key}-${k}`} data-step className="relative flex gap-5 pb-6 last:pb-0">
                  <span data-dot className={cn("relative z-10 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold", k === s.steps.length - 1 ? "bg-maroon text-white" : "border-2 border-gold bg-white text-navy")}>
                    {k + 1}
                  </span>
                  <span className="pt-0.5 text-[16px] leading-snug text-navy">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
              <span className="text-[13.5px] text-text/55">
                {s.files.length} berkas · rujukan pasal {ref?.no ?? s.ref}
              </span>
              <button
                type="button"
                onClick={() => openProc(i)}
                className="group inline-flex h-11 items-center gap-2 rounded-md bg-maroon px-5 text-[14.5px] font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-maroon-deep active:scale-[0.98]"
              >
                Siapkan berkasnya
                <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5">
                  <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
