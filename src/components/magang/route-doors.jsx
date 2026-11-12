"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { useMagang } from "./magang-provider";

const pad = (n) => String(n).padStart(2, "0");

function Facts({ r, tone = "light" }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
      {r.facts.map((f) => (
        <div key={f.k} className={cn("border-t pt-3", tone === "light" ? "border-line" : "border-white/15")}>
          <dt className={cn("kicker text-[10.5px]", tone === "light" ? "text-maroon" : "text-gold-soft")}>{f.k}</dt>
          <dd className={cn("mt-1 text-[14px] leading-snug", tone === "light" ? "text-navy" : "text-white/85")}>{f.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Tiga pintu (`#pintu`). ≥ lg: daftar editorial serif besar di kiri — baris aktif membuka fakta (grid-rows 0fr→1fr),
 * baris lain meredup — dan panel navy sticky di kanan yang mengganti foto dengan mask-wipe clip-path (GSAP)
 * serta Lottie `-dark` per pintu. Ponsel: Swiper tersinkron dengan pintu aktif.
 */
export function RouteDoors() {
  const { routes, route, setRoute, kp } = useMagang();
  const panel = useRef(null);
  const prev = useRef(route);
  const dwell = useRef();
  const swiper = useRef(null);

  // foto pintu aktif "menyapu" masuk dari kiri, di atas foto sebelumnya
  useEffect(() => {
    const host = panel.current;
    if (!host) return;
    const imgs = host.querySelectorAll("[data-door-img]");
    imgs.forEach((el, i) => {
      el.style.zIndex = i === route ? 2 : i === prev.current ? 1 : 0;
    });
    const el = imgs[route];
    if (el && prev.current !== route && !prefersReducedMotion()) {
      gsap.fromTo(el, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "expo.inOut" });
      gsap.fromTo(el.querySelector("img"), { scale: 1.12 }, { scale: 1, duration: 1.3, ease: "expo.out" });
    } else if (el) {
      gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)" });
    }
    prev.current = route;
    if (swiper.current && swiper.current.activeIndex !== route) swiper.current.slideTo(route);
  }, [route]);

  const r = routes[route];

  return (
    <section id="pintu" className="relative scroll-mt-24 bg-white py-20 md:py-28">
      <Container>
        <SectionHeader
          title={["Pilih pintu", "yang paling pas"]}
          body={`${kp.nama} wajib ditempuh semua mahasiswa di semester ${kp.semester}. Dua pintu lainnya boleh kamu ambil sebagai tambahan pengalaman.`}
        />

        {/* ≥ lg */}
        <div className="mt-14 hidden gap-12 lg:grid lg:grid-cols-[1.1fr_0.9fr]">
          <ol className="border-b border-line">
            {routes.map((x, i) => {
              const on = i === route;
              return (
                <li key={x.key} className={cn("border-t border-line transition-opacity duration-500 ease-cinematic", !on && "opacity-45 hover:opacity-80")}>
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls={`pintu-${x.key}`}
                    onClick={() => setRoute(i)}
                    onPointerEnter={() => {
                      clearTimeout(dwell.current);
                      dwell.current = setTimeout(() => setRoute(i), 180);
                    }}
                    onPointerLeave={() => clearTimeout(dwell.current)}
                    className="group flex w-full items-baseline gap-6 py-7 text-left outline-none focus-visible:text-maroon"
                  >
                    <span className={cn("tabular w-10 font-serif text-[1.1rem] transition-colors", on ? "text-gold" : "text-text/40")}>{pad(i + 1)}</span>
                    <span className="flex-1 font-serif text-[clamp(2rem,3.4vw,3rem)] leading-none text-navy transition-transform duration-500 ease-cinematic group-hover:translate-x-1.5">
                      {x.title}
                    </span>
                    <span className={cn("kicker text-[11px] transition-colors", on ? "text-maroon" : "text-text/45")}>{x.tag}</span>
                  </button>
                  <div id={`pintu-${x.key}`} className={cn("grid transition-[grid-template-rows] duration-700 ease-cinematic", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                    <div className="overflow-hidden">
                      <div className={cn("pb-8 pl-16 transition-[opacity,transform] duration-500 ease-cinematic", on ? "translate-y-0 opacity-100 delay-150" : "translate-y-2 opacity-0")}>
                        <p className="max-w-lg text-pretty text-[16.5px] leading-relaxed text-text/70">{x.lead}</p>
                        <div className="mt-6">
                          <Facts r={x} />
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="relative">
            <div ref={panel} className="sticky top-28 overflow-hidden rounded-2xl bg-navy text-white shadow-[0_40px_80px_-50px_rgb(14_24_48/0.8)]" data-lottie-hover>
              <div className="relative aspect-[4/3]">
                {routes.map((x, i) => (
                  <div key={x.key} data-door-img className="absolute inset-0" style={{ clipPath: i === 0 ? "inset(0% 0% 0% 0%)" : "inset(0% 100% 0% 0%)" }}>
                    <Image src={x.image} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                    <span className="absolute inset-0 bg-navy/35" />
                  </div>
                ))}
                <span className="absolute left-5 top-5 z-10 rounded bg-navy/80 px-2.5 py-1 text-[11.5px] font-semibold text-gold-soft backdrop-blur-sm">
                  Pintu {pad(route + 1)} · {r.title}
                </span>
              </div>
              <div className="flex items-center gap-5 p-6">
                <span className="grid size-24 shrink-0 place-items-center rounded-full bg-maroon p-3">
                  <LottieIllustration key={r.lottie} src={r.lottie} label={`Ilustrasi ${r.title}`} />
                </span>
                <div key={r.key} className="min-w-0 animate-in fade-in-0 slide-in-from-bottom-1 duration-500">
                  <p className="kicker text-[10.5px] text-gold-soft">Cocok untuk</p>
                  <p className="mt-1.5 text-pretty font-serif text-[1.2rem] leading-snug">{r.forWho}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ponsel & tablet */}
        <div className="mt-10 lg:hidden">
          <div className="-mx-5 min-w-0 md:-mx-8">
            <Swiper
              modules={[A11y, Keyboard]}
              keyboard
              slidesPerView={1.12}
              spaceBetween={14}
              slidesOffsetBefore={20}
              slidesOffsetAfter={20}
              breakpoints={{ 768: { slidesPerView: 1.6, slidesOffsetBefore: 32, slidesOffsetAfter: 32 } }}
              onSwiper={(s) => (swiper.current = s)}
              onSlideChange={(s) => setRoute(s.activeIndex)}
            >
              {routes.map((x, i) => (
                <SwiperSlide key={x.key} className="!h-auto">
                  <article className="flex h-full flex-col overflow-hidden rounded-xl bg-navy text-white">
                    <div className="relative aspect-[16/10]">
                      <Image src={x.image} alt="" fill sizes="90vw" className="object-cover" />
                      <span className="absolute inset-0 bg-navy/35" />
                      <span className="absolute left-4 top-4 rounded bg-navy/80 px-2 py-0.5 text-[11px] font-semibold text-gold-soft">{x.tag}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="tabular font-serif text-gold">{pad(i + 1)}</p>
                      <h3 className="mt-1 font-serif text-[1.8rem] leading-none">{x.title}</h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-white/75">{x.lead}</p>
                      <div className="mt-5">
                        <Facts r={x} tone="dark" />
                      </div>
                    </div>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="mt-4 flex justify-center gap-1.5" aria-hidden>
            {routes.map((_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full transition-[width,background-color] duration-500 ease-cinematic", i === route ? "w-6 bg-maroon" : "w-1.5 bg-line")} />
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3" data-aos="fade-up">
          <a href="/konversi-sks#kalkulator" className="group inline-flex items-center gap-2 text-[14.5px] font-semibold text-maroon">
            <span className="u-gold">Cara magang dikonversi ke SKS</span>
            <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-500 ease-cinematic group-hover:translate-x-1">
              <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          {routes.some((x) => x.sample) && <PlaceholderTag />}
        </div>
      </Container>
    </section>
  );
}
