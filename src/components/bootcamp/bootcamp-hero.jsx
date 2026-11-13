"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { animate } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { CURTAIN_KEY, TRACKS, untilStart } from "@/lib/bootcamp-content";
import { Container } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { cn } from "@/lib/utils";
import { smoothTo, useBootcamp } from "./bootcamp-provider";

const MODES = [
  { key: "bootcamp", label: "Bootcamp", hint: "kohort berjadwal" },
  { key: "course", label: "Course", hint: "mulai kapan saja" },
];
const pad = (n) => String(n).padStart(2, "0");

/** Sakelar mode besar: knob emas meluncur pegas (`motion` layoutId), ←/→ berpindah, peran radiogroup. */
function ModeSwitch() {
  const { mode, setMode } = useBootcamp();
  const reduce = useReducedMotion();
  const refs = useRef({});
  const onKey = (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    const next = mode === "bootcamp" ? "course" : "bootcamp";
    setMode(next);
    refs.current[next]?.focus();
  };
  return (
    <div role="radiogroup" aria-label="Pilih cara belajar" onKeyDown={onKey} className="relative inline-grid grid-cols-2 rounded-full border border-line bg-white p-1.5 shadow-[0_18px_40px_-28px_rgb(14_24_48/0.5)]">
      {MODES.map((m) => {
        const on = mode === m.key;
        return (
          <button
            key={m.key}
            ref={(el) => (refs.current[m.key] = el)}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => setMode(m.key)}
            className="relative z-10 flex min-w-[9.5rem] flex-col items-center rounded-full px-6 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-maroon/40 sm:min-w-[11rem]"
          >
            {on && (
              <motion.span
                layoutId="bc-mode-knob"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-full bg-navy"
              />
            )}
            <span className={cn("font-serif text-[1.35rem] leading-none transition-colors duration-300", on ? "text-white" : "text-navy")}>{m.label}</span>
            <span className={cn("mt-1 text-[11.5px] transition-colors duration-300", on ? "text-gold-soft" : "text-text/50")}>{m.hint}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Satu angka hitung mundur: digit baru jatuh dari atas (anime.js) setiap kali berubah. */
function Digit({ value, label }) {
  const ref = useRef(null);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current === value || !ref.current || prefersReducedMotion()) {
      prev.current = value;
      return;
    }
    prev.current = value;
    animate(ref.current, { translateY: ["-60%", "0%"], opacity: [0, 1], duration: 420, ease: "outBack(1.6)" });
  }, [value]);
  return (
    <span className="flex flex-col items-center">
      <span className="grid h-[clamp(4.5rem,13vw,10rem)] w-full place-items-center overflow-hidden rounded-xl bg-navy-deep ring-1 ring-white/10">
        <span ref={ref} className="tabular block font-serif text-[clamp(2.6rem,9vw,7.5rem)] leading-none text-white">
          {value}
        </span>
      </span>
      <span className="kicker mt-2 text-[10px] text-gold-soft sm:text-[11px]">{label}</span>
    </span>
  );
}

/** Poster hitung mundur: angka hari/jam/menit/detik raksasa di pita navy selebar konten. */
function CountdownPoster() {
  const { nextCohort, now, openCohort } = useBootcamp();
  const left = untilStart(nextCohort.start, now);
  const date = new Date(`${nextCohort.start}T00:00:00+07:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const parts = [
    [left ? left.d : "--", "hari"],
    [left ? pad(left.h) : "--", "jam"],
    [left ? pad(left.m) : "--", "menit"],
    [left ? pad(left.s) : "--", "detik"],
  ];
  return (
    <div data-poster className="relative mt-5 overflow-hidden rounded-2xl bg-navy px-5 pb-7 pt-6 text-white sm:px-10 sm:pb-10 sm:pt-8">
      <span aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full border border-white/10" />
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <span className="kicker text-[11px] text-gold-soft">Kohort berikutnya · {TRACKS[nextCohort.track]?.label}</span>
          <button type="button" onClick={() => openCohort(nextCohort.slug)} className="mt-1 block text-left font-serif text-[clamp(1.4rem,2.6vw,2rem)] leading-tight">
            <span className="u-gold">{nextCohort.title}</span>
          </button>
        </div>
        <span className="text-[13.5px] text-white/60">Mulai {date}</span>
      </div>
      <div
        className="relative mt-6 grid grid-cols-4 gap-2 sm:mt-8 sm:gap-4"
        aria-live="off"
        aria-label={left ? `${left.d} hari ${left.h} jam ${left.m} menit lagi` : "Menghitung waktu mulai"}
      >
        {parts.map(([v, l]) => (
          <Digit key={l} value={v} label={l} />
        ))}
      </div>
    </div>
  );
}

/**
 * Hero "roti lapis": baris judul pertama, lalu pita navy hitung mundur kohort berikutnya (angka raksasa), lalu baris
 * judul kedua rata kanan — judul mengapit hitung mundur. Di bawahnya intro yang mengikuti mode + sakelar
 * Bootcamp ⇄ Course (mengubah mode seluruh halaman). Tanpa ilustrasi garis.
 */
export function BootcampHero() {
  const { mode, intro, bootcamps, courses } = useBootcamp();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const delay = curtainDelay(CURTAIN_KEY);
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay });
      gsap.fromTo("[data-poster]", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", delay: delay + 0.2, clearProps: "transform,opacity" });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden pb-10 pt-10 md:pb-14 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li>Belajar Luar Prodi</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Bootcamp & Course</li>
          </ol>
        </nav>

        <h1 className="sr-only">Belajar ngebut, pulang bawa sertifikat — Bootcamp & Course Sistem Informasi UISI</h1>
        {/* roti lapis: baris judul pertama — hitung mundur — baris judul kedua */}
        <p aria-hidden data-hero-fade className="mt-8 font-serif text-[clamp(2.6rem,6.4vw,5.5rem)] leading-[0.95] tracking-[-0.015em] text-navy lg:mt-10">
          Belajar ngebut,
        </p>
        <div className="relative">
          <span aria-hidden className="pointer-events-none absolute -top-24 right-6 z-10 hidden xl:block">
            <ElvoPeek pose="run" size={84} side="left" say={mode === "bootcamp" ? "Satu minggu satu target, jangan ngebut sendirian!" : "Rak kursus buka 24 jam."} />
          </span>
          <CountdownPoster />
        </div>
        <p aria-hidden data-hero-fade className="mt-6 text-right font-serif text-[clamp(2.6rem,6.4vw,5.5rem)] italic leading-[0.95] tracking-[-0.015em] text-maroon">
          pulang bawa sertifikat
        </p>

        <div className="mt-8 grid gap-6 border-t border-line pt-7 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-14">
          <div data-hero-fade className="min-h-[3.5rem] max-w-2xl">
            <motion.p key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="text-pretty text-[17px] leading-relaxed text-text/70">
              {mode === "bootcamp" ? intro.bootcamp : intro.course}
            </motion.p>
          </div>
          <div data-hero-fade className="flex flex-wrap items-center gap-x-7 gap-y-5">
            <ModeSwitch />
            <button type="button" onClick={() => smoothTo("katalog")} className="text-[15px] font-semibold text-navy">
              <span className="u-gold">{mode === "bootcamp" ? `Lihat ${bootcamps.length} kohort` : `Jelajahi ${courses.length} kursus`}</span>
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
