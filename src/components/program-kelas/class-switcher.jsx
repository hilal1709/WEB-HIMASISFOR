"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import "swiper/css";
import { PMB_URL } from "@/lib/home-content";
import { countUp, prefersReducedMotion } from "@/lib/motion";
import { Container, PillLink, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { useKelas } from "./kelas-provider";

const pad = (n) => String(n).padStart(2, "0");
const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Pemilih kelas (pola 21st.dev "segmented control + pricing card").
 * Segmented control dengan latar navy yang meluncur ke tab aktif (←/→ berpindah tab).
 * ≥ md: satu panel besar — kiri permukaan navy (Lottie, nomor, biaya), kanan detail;
 * angka berhitung & isi masuk berurutan setiap ganti tab. Ponsel: panel jadi Swiper yang
 * tersinkron dengan tab.
 */
export function ClassSwitcher() {
  const { classes, active, setActive } = useKelas();
  const tabs = useRef([]);
  const [pill, setPill] = useState({ x: 0, w: 0 });
  const swiper = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useIso(() => {
    const measure = () => {
      const t = tabs.current[active];
      if (t) setPill({ x: t.offsetLeft, w: t.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  useEffect(() => {
    const s = swiper.current;
    if (s && !s.destroyed && s.activeIndex !== active) s.slideTo(active);
  }, [active]);

  const onKey = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : -1) + classes.length) % classes.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="kelas" className="scroll-mt-24 py-16 md:py-24">
      <Container>
        <SectionHeader
          title={["Pilih", "ritme belajarmu"]}
          body="Semua kelas menempuh 144 SKS dengan dosen dan gelar yang sama. Bedanya ada di waktu, cara, dan tempat belajar."
        />

        <div className="mt-10 flex justify-start md:mt-12" data-aos="fade-up">
          <div role="tablist" aria-label="Program kelas" onKeyDown={onKey} className="relative inline-flex max-w-full rounded-lg border border-line bg-white p-1.5 shadow-[0_10px_30px_-24px_rgb(20_33_61/0.5)]">
            <span
              aria-hidden
              className="absolute bottom-1.5 top-1.5 rounded-md bg-navy transition-[transform,width] duration-500 ease-cinematic"
              style={{ width: pill.w, transform: `translateX(${pill.x - 6}px)`, left: 6 }}
            />
            {classes.map((c, i) => (
              <button
                key={c.key}
                ref={(el) => (tabs.current[i] = el)}
                role="tab"
                id={`tab-${c.key}`}
                aria-selected={i === active}
                aria-controls="kelas-panel"
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                className={cn(
                  "relative z-10 flex items-center gap-2 rounded-md px-3.5 py-2.5 text-[14px] font-semibold transition-colors duration-300 sm:px-5 sm:text-[15px]",
                  i === active ? "text-white" : "text-navy/70 hover:text-navy"
                )}
              >
                <span className={cn("tabular hidden font-serif text-[13px] font-normal sm:inline", i === active ? "text-gold" : "text-text/40")}>{pad(i + 1)}</span>
                {c.short}
              </button>
            ))}
          </div>
        </div>

        {/* desktop/tablet */}
        <div id="kelas-panel" role="tabpanel" aria-labelledby={`tab-${classes[active].key}`} className="mt-6 hidden md:block">
          <Panel item={classes[active]} index={active} key={active} />
        </div>

        {/* ponsel */}
        <div className="mt-6 min-w-0 md:hidden">
          <Swiper
            modules={[A11y]}
            spaceBetween={14}
            slidesPerView={1.04}
            onSwiper={(s) => (swiper.current = s)}
            onSlideChange={(s) => s.activeIndex !== activeRef.current && s.width > 0 && setActive(s.activeIndex)}
          >
            {classes.map((c, i) => (
              <SwiperSlide key={c.key} className="!h-auto">
                <Panel item={c} index={i} compact />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Container>
    </section>
  );
}

function Panel({ item, index, compact = false }) {
  const { openDetail } = useKelas();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || compact) return;
    el.querySelectorAll("[data-count]").forEach((n, i) => setTimeout(() => countUp(n, Number(n.dataset.count), { duration: 1100 }), i * 90));
    if (prefersReducedMotion()) return;
    const a = animate(el.querySelectorAll("[data-in]"), { opacity: [0, 1], translateY: [14, 0], duration: 650, delay: stagger(50), ease: "outExpo" });
    return () => a.revert?.();
  }, [compact]);

  const stats = [
    { value: item.duration, label: item.durationLabel },
    { value: item.sks, label: "SKS" },
    { value: item.seats, label: "kuota kursi" },
  ];

  return (
    <article ref={ref} className="grid h-full overflow-hidden rounded-lg border border-line bg-white shadow-[0_30px_60px_-45px_rgb(20_33_61/0.55)] md:grid-cols-[300px_1fr] lg:grid-cols-[340px_1fr]">
      {/* permukaan navy */}
      <div className="relative flex flex-col justify-between gap-6 bg-navy p-6 text-white md:p-8">
        <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full border border-white/10" />
        <div className="flex items-start justify-between gap-4">
          <span className="font-serif text-[3.25rem] leading-none text-gold">{pad(index + 1)}</span>
          <div data-lottie-hover className="w-24 rounded-md bg-cream p-2 md:w-32">
            <LottieIllustration src={item.lottie} replayOnHover />
          </div>
        </div>
        <div data-in>
          <p className="text-[13px] text-white/55">Biaya kuliah</p>
          <p className="mt-1 font-serif text-[2rem] leading-none">{item.fee}</p>
          <p className="mt-1.5 text-[13px] text-white/55">{item.feeNote}</p>
          <span aria-hidden className="mt-5 block h-[2px] w-10 bg-gold" />
          <p className="mt-4 text-[14px] leading-relaxed text-white/75">{item.mode}</p>
          <p className="text-[14px] text-white/55">{item.location}</p>
        </div>
      </div>

      {/* detail */}
      <div className="flex flex-col p-6 md:p-8 lg:p-10">
        <div data-in className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="font-serif text-[clamp(1.6rem,2.6vw,2.25rem)] leading-tight text-navy">{item.name}</h3>
          {item.sample && <PlaceholderTag />}
        </div>
        <p data-in className="mt-2 text-[16px] leading-relaxed text-text/65">{item.tagline}</p>
        <p data-in className="mt-4 inline-flex w-fit rounded-md bg-cream px-3 py-1.5 text-[13.5px] font-medium text-navy">{item.schedule}</p>

        <dl data-in className="mt-6 grid grid-cols-3 divide-x divide-line border-y border-line">
          {stats.map((s) => (
            <div key={s.label} className="group py-4 pr-3 [&:not(:first-child)]:pl-4">
              <dd className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] leading-none tabular-nums text-navy">
                <span data-count={s.value}>{s.value}</span>
              </dd>
              <dt className="mt-1.5 text-[12.5px] text-text/55">{s.label}</dt>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:gap-10">
          <div data-in>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-text/45">Cocok untuk</p>
            <ul className="space-y-2">
              {item.forWho.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[14.5px] text-navy">
                  <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-gold" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div data-in>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-text/45">Keunggulan</p>
            <ol className="divide-y divide-line">
              {item.highlights.map((h, i) => (
                <li key={h} className="group flex gap-3 py-2.5 text-[14.5px] text-text/75 first:pt-0">
                  <span className="tabular font-serif text-maroon transition-transform duration-300 group-hover:-translate-y-0.5">{pad(i + 1)}</span>
                  <span className="transition-colors duration-300 group-hover:text-navy">{h}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div data-in className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-8">
          <button
            type="button"
            onClick={() => openDetail(index)}
            className="group inline-flex h-11 items-center gap-2 rounded-md border border-navy/25 bg-white px-5 text-[14.5px] font-semibold text-navy transition-[border-color,background-color,transform] duration-300 ease-cinematic hover:border-navy hover:bg-cream active:scale-[0.98]"
          >
            Lihat detail & syarat
            <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:rotate-45">
              <path d="M5 11l6-6M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <PillLink href={PMB_URL} size="sm" target="_blank" rel="noopener noreferrer" className="h-11">
            Daftar {item.short}
          </PillLink>
        </div>
      </div>
    </article>
  );
}
