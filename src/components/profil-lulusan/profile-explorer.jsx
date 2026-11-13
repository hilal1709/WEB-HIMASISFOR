"use client";
import { useLayoutEffect as useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { useProfileModal } from "./profile-modal";

const pad = (n) => String(n).padStart(2, "0");
const AUTOPLAY_MS = 7000;
const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Penjelajah profil lulusan (pola 21st.dev "Feature tabs" + autoplay progress).
 * ≥ lg: tab vertikal di kiri — indikator emas meluncur ke tab aktif, bar progres mengisi selama
 * autoplay (jeda saat kursor/fokus di dalam section, berhenti setelah pengguna memilih tab);
 * panel kanan: Lottie di permukaan navy, ringkasan, kompetensi muncul berurutan (anime.js).
 * Ponsel: kartu Swiper.
 */
export function ProfileExplorer({ profiles }) {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const [indicator, setIndicator] = useState({ y: 0, h: 0 });
  const tabs = useRef([]);
  const panel = useRef(null);
  const openProfile = useProfileModal();
  const item = profiles[active];

  useEffect(() => {
    if (prefersReducedMotion()) setAuto(false);
  }, []);

  // indikator emas mengikuti tab aktif
  useIso(() => {
    const measure = () => {
      const t = tabs.current[active];
      if (t) setIndicator({ y: t.offsetTop, h: t.offsetHeight });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  // isi panel masuk berurutan setiap ganti tab
  useEffect(() => {
    const el = panel.current;
    if (!el || prefersReducedMotion()) return;
    const a = animate(el.querySelectorAll("[data-in]"), { opacity: [0, 1], translateY: [12, 0], duration: 600, delay: stagger(55), ease: "outExpo" });
    return () => a.revert?.();
  }, [active]);

  const select = (i, fromUser = true) => {
    setActive(i);
    if (fromUser) setAuto(false);
  };

  const onKey = (e) => {
    const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (e.key === "Home" || e.key === "End" || k) {
      e.preventDefault();
      const next = e.key === "Home" ? 0 : e.key === "End" ? profiles.length - 1 : (active + k + profiles.length) % profiles.length;
      select(next);
      tabs.current[next]?.focus();
    }
  };

  return (
    <section id="profil" className="scroll-mt-24 overflow-hidden bg-cream py-16 md:py-20">
      <Container>
        <SectionHeader
          title={[`${profiles.length} profil,`, "satu fondasi"]}
          body="Setiap lulusan menguasai proses bisnis dan teknologi, lalu menajamkannya di salah satu jalur karier berikut."
          action={profiles.some((p) => p.sample) ? <PlaceholderTag /> : null}
        />

        {/* ≥ lg */}
        <div
          className="mt-12 hidden gap-10 lg:grid lg:grid-cols-[360px_1fr] xl:gap-14"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div role="tablist" aria-orientation="vertical" aria-label="Profil lulusan" onKeyDown={onKey} className="relative flex flex-col gap-1">
            <span
              aria-hidden
              className="absolute left-0 top-0 w-full rounded-lg border border-line bg-white shadow-[0_18px_40px_-30px_rgb(20_33_61/0.5)] transition-[transform,height] duration-500 ease-cinematic"
              style={{ transform: `translateY(${indicator.y}px)`, height: indicator.h }}
            />
            <span
              aria-hidden
              className="absolute left-0 top-0 w-[3px] rounded-full bg-gold transition-[transform,height] duration-500 ease-cinematic"
              style={{ transform: `translateY(${indicator.y + 14}px)`, height: Math.max(0, indicator.h - 28) }}
            />
            {profiles.map((p, i) => {
              const on = i === active;
              return (
                <button
                  key={p.key}
                  ref={(n) => (tabs.current[i] = n)}
                  id={`tab-${p.key}`}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  aria-controls="profil-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(i)}
                  className="group relative z-10 flex items-start gap-4 rounded-lg px-6 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-maroon/40"
                >
                  <span className={cn("font-serif text-[1.35rem] leading-7 tabular-nums transition-colors duration-500", on ? "text-gold" : "text-text/30 group-hover:text-gold/70")}>{pad(p.n)}</span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block font-serif text-[1.2rem] leading-7 transition-colors duration-500", on ? "text-navy" : "text-text/55 group-hover:text-navy")}>{p.title}</span>
                    <span className={cn("block text-[13px] transition-colors duration-500", on ? "text-maroon" : "text-text/40")}>{p.short}</span>
                    {on && auto && (
                      <span aria-hidden className="mt-3 block h-[2px] overflow-hidden rounded-full bg-line">
                        <span
                          key={active}
                          className="block h-full origin-left bg-maroon"
                          style={{ animation: `pl-progress ${AUTOPLAY_MS}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
                          onAnimationEnd={() => select((active + 1) % profiles.length, false)}
                        />
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div id="profil-panel" role="tabpanel" aria-labelledby={`tab-${item.key}`} ref={panel} className="min-w-0">
            <article className="grid h-full overflow-hidden rounded-lg border border-line bg-white shadow-[0_30px_60px_-40px_rgb(20_33_61/0.45)] xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="relative flex min-h-[280px] items-center justify-center bg-navy p-8">
                <LottieIllustration key={item.key} src={item.lottie} label={`Ilustrasi ${item.title}`} className="w-full max-w-[260px]" />
                <span aria-hidden className="absolute bottom-5 left-6 font-serif text-[4.5rem] leading-none text-gold/90">{pad(item.n)}</span>
                <span aria-hidden className="absolute right-6 top-6 text-[12px] tracking-[0.14em] text-white/45">/ {pad(profiles.length)}</span>
              </div>
              <div className="flex flex-col p-8">
                <p data-in className="kicker text-maroon">{item.short}</p>
                <h3 data-in className="mt-3 font-serif text-[clamp(1.6rem,2.3vw,2rem)] leading-tight text-navy">{item.title}</h3>
                <p data-in className="mt-4 text-pretty text-[15.5px] leading-relaxed text-text/70">{item.summary}</p>
                <ul className="mt-6 flex flex-wrap gap-1.5">
                  {item.competencies.map((c) => (
                    <li key={c} data-in className="rounded-md border border-line bg-cream/60 px-2.5 py-1 text-[13px] text-navy transition-colors duration-300 hover:border-gold hover:bg-white">{c}</li>
                  ))}
                </ul>
                <div data-in className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-8">
                  <p className="text-[13px] text-text/55">
                    Contoh jabatan: <span className="text-navy">{item.roles.slice(0, 2).join(", ")}</span>
                  </p>
                  <DetailButton onClick={() => openProfile(active)} label={item.title} />
                </div>
              </div>
            </article>
          </div>
        </div>

        {/* ponsel & tablet */}
        <div className="mt-10 min-w-0 lg:hidden">
          <Swiper modules={[A11y, Keyboard]} keyboard spaceBetween={14} slidesPerView={1.08} breakpoints={{ 640: { slidesPerView: 1.6 } }} onSlideChange={(s) => setActive(s.activeIndex)} className="!overflow-visible">
            {profiles.map((p, i) => (
              <SwiperSlide key={p.key} className="!h-auto">
                <article className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white">
                  <div className="relative flex h-44 items-center justify-center bg-navy">
                    <LottieIllustration src={p.lottie} className="w-32" />
                    <span aria-hidden className="absolute bottom-3 left-4 font-serif text-[2.5rem] leading-none text-gold/90">{pad(p.n)}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="kicker text-maroon">{p.short}</p>
                    <h3 className="mt-2 font-serif text-[1.35rem] leading-snug text-navy">{p.title}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-text/70">{p.summary}</p>
                    <div className="mt-auto pt-5">
                      <DetailButton onClick={() => openProfile(i)} label={p.title} />
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="mt-6 flex justify-center gap-1.5" aria-hidden>
            {profiles.map((p, i) => (
              <span key={p.key} className={cn("h-1.5 rounded-full transition-[width,background-color] duration-500 ease-cinematic", i === active ? "w-6 bg-maroon" : "w-1.5 bg-navy/15")} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function DetailButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Lihat detail profil ${label}`}
      className="group/btn inline-flex h-10 items-center gap-2 rounded-md bg-maroon px-4 text-sm font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/40 focus-visible:ring-offset-2"
    >
      Lihat detail
      <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-500 ease-cinematic group-hover/btn:translate-x-1">
        <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
