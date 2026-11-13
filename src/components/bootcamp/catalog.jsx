"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { TRACKS } from "@/lib/bootcamp-content";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { BootcampBanner } from "./bootcamp-banner";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { SentenceFilter, CourseGrid } from "./course-catalog";
import { useBootcamp } from "./bootcamp-provider";

const TONES = ["bg-navy", "bg-maroon", "bg-navy-deep"];
const fmtDate = (d) => new Date(`${d}T00:00:00+07:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

function CohortCard({ b, i, onOpen, className, ...props }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(b.slug)}
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-xl p-7 text-left text-white shadow-[0_40px_80px_-40px_rgb(14_24_48/0.85)] outline-none ring-gold/70 focus-visible:ring-2",
        TONES[i % TONES.length],
        className
      )}
      {...props}
    >
      <LottieIllustration src={TRACKS[b.track]?.lottie} replayOnHover className="pointer-events-none absolute -right-4 -top-4 size-32 opacity-90" />
      <span className="kicker text-[10.5px] text-gold-soft">{TRACKS[b.track]?.label}</span>
      <span className="mt-3 block max-w-[14ch] font-serif text-[1.85rem] leading-[1.05]">{b.title}</span>
      <span className="mt-4 block text-pretty text-[14.5px] leading-relaxed text-white/70">{b.lead}</span>
      <span className="mt-auto grid grid-cols-3 gap-3 border-t border-white/12 pt-5">
        <span>
          <span className="tabular block font-serif text-[1.6rem] leading-none text-gold-soft">{b.weeks}</span>
          <span className="mt-1 block text-[11.5px] text-white/55">minggu</span>
        </span>
        <span>
          <span className="tabular block font-serif text-[1.6rem] leading-none text-gold-soft">{b.hours}</span>
          <span className="mt-1 block text-[11.5px] text-white/55">jam/minggu</span>
        </span>
        <span>
          <span className="tabular block font-serif text-[1.6rem] leading-none text-gold-soft">{fmtDate(b.start)}</span>
          <span className="mt-1 block text-[11.5px] text-white/55">mulai</span>
        </span>
      </span>
      <span className="mt-5 flex items-center justify-between text-[13px]">
        <span className="text-white/60">{b.format}</span>
        <span className="flex items-center gap-1.5 font-semibold text-gold-soft">
          Lihat kohort
          <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-x-1">
            <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </button>
  );
}

/**
 * Pola 21st.dev "Hover Stack": kartu kohort bertumpuk miring; kartu yang di-hover/fokus terangkat & lurus, tetangganya
 * menyingkir ke samping (GSAP quickTo). Berdiam 160 ms di satu kartu → kohort itu jadi aktif untuk silabus.
 */
function HoverStack() {
  const { bootcamps, openCohort, setCohort, cohort } = useBootcamp();
  const wrap = useRef(null);
  const tweens = useRef([]);
  const dwell = useRef(null);
  const [hot, setHot] = useState(null);
  const n = bootcamps.length;
  const base = (i) => ({ x: (i - (n - 1) / 2) * 250, y: Math.abs(i - (n - 1) / 2) * 18, rotate: (i - (n - 1) / 2) * 5 });

  useEffect(() => {
    const root = wrap.current;
    if (!root) return;
    const reduce = prefersReducedMotion();
    // gsap.context + revert: aman untuk Strict Mode (efek dijalankan dua kali di dev) — tanpa ini
    // tween "from" kedua membaca opacity setengah jalan sebagai nilai akhir dan kartu membeku transparan.
    const ctx = gsap.context(() => {
      const cards = root.querySelectorAll("[data-stack-card]");
      tweens.current = [...cards].map((el, i) => {
        gsap.set(el, { ...base(i), xPercent: -50 });
        if (reduce) return null;
        return {
          x: gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" }),
          r: gsap.quickTo(el, "rotate", { duration: 0.6, ease: "power3.out" }),
          s: gsap.quickTo(el, "scale", { duration: 0.6, ease: "power3.out" }),
        };
      });
      // animasi masuk di elemen dalam agar tidak bertabrakan dengan quickTo (x/y/rotate) di elemen luar
      if (!reduce) {
        gsap.fromTo(
          root.querySelectorAll("[data-stack-inner]"),
          { yPercent: 18, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: root, start: "top 80%", once: true } }
        );
      }
    }, root);
    return () => {
      clearTimeout(dwell.current);
      tweens.current = [];
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const focus = (hot) => {
    setHot(hot);
    tweens.current.forEach((t, i) => {
      if (!t) return;
      const b = base(i);
      if (hot == null) return t.x(b.x), t.y(b.y), t.r(b.rotate), t.s(1);
      const d = i - hot;
      t.x(b.x + (d === 0 ? 0 : Math.sign(d) * 70));
      t.y(d === 0 ? -22 : b.y + 10);
      t.r(d === 0 ? 0 : b.rotate + Math.sign(d) * 3);
      t.s(d === 0 ? 1.04 : 0.96);
    });
    clearTimeout(dwell.current);
    if (hot != null) dwell.current = setTimeout(() => setCohort(bootcamps[hot].slug), 160);
  };

  return (
    <div ref={wrap} onPointerLeave={() => focus(null)} className="relative mx-auto hidden h-[520px] max-w-[1000px] md:block">
      {bootcamps.map((b, i) => (
        <div
          key={b.slug}
          data-stack-card
          onPointerEnter={() => focus(i)}
          onFocus={() => focus(i)}
          className={cn("absolute left-1/2 top-6 h-[460px] w-[min(380px,40vw)] will-change-transform", (hot ?? bootcamps.findIndex((x) => x.slug === cohort)) === i ? "z-30" : i === 1 ? "z-20" : "z-10")}
        >
          <div data-stack-inner className="h-full">
            <CohortCard b={b} i={i} onOpen={openCohort} />
          </div>
        </div>
      ))}
    </div>
  );
}

function CohortSwiper() {
  const { bootcamps, openCohort, setCohort } = useBootcamp();
  return (
    <div className="md:hidden">
      <Swiper
        modules={[Pagination, A11y]}
        spaceBetween={14}
        slidesPerView={1.08}
        pagination={{ clickable: true }}
        onSlideChange={(s) => setCohort(bootcamps[s.activeIndex]?.slug)}
        className="!pb-10 [--swiper-pagination-color:var(--maroon)]"
      >
        {bootcamps.map((b, i) => (
          <SwiperSlide key={b.slug} className="!h-auto">
            <CohortCard b={b} i={i} onOpen={openCohort} className="min-h-[440px]" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

/** Katalog `#katalog`: isi mengikuti mode hero — tumpukan kohort, atau filter kalimat + kartu sampul kursus. */
export function Catalog() {
  const { mode, bootcamps, filtered } = useBootcamp();
  const reduce = useReducedMotion();
  const sample = mode === "bootcamp" ? bootcamps.some((b) => b.sample) : filtered.some((c) => c.sample);
  return (
    <section id="katalog" className="relative scroll-mt-24 border-t border-line bg-white py-16 md:py-24">
      <Container>
        <SectionHeader
          key={mode}
          title={mode === "bootcamp" ? ["Tiga kohort,", "satu proyek akhir masing-masing"] : ["Susun kalimatnya,", "kursusnya menyesuaikan"]}
          body={
            mode === "bootcamp"
              ? "Arahkan kursor ke salah satu kartu untuk mengangkatnya; silabus di bawah ikut berganti."
              : "Ganti kata bergaris emas untuk menyaring kursus. Yang cocok bisa langsung dimasukkan ke rencana belajar."
          }
          action={sample && <PlaceholderTag />}
        />
        <div className="mt-8">
          <BootcampBanner />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12"
          >
            {mode === "bootcamp" ? (
              <>
                <HoverStack />
                <CohortSwiper />
              </>
            ) : (
              <>
                <SentenceFilter />
                <CourseGrid />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </Container>
    </section>
  );
}
