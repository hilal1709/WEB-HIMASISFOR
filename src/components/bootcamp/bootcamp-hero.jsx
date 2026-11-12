"use client";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { animate, svg, stagger } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { CURTAIN_KEY, TRACKS, untilStart } from "@/lib/bootcamp-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { SprintTrackIllustration } from "@/components/illustrations/line-illustrations";
import { cn } from "@/lib/utils";
import { BootcampBanner } from "./bootcamp-banner";
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
      <span className="grid h-14 w-[3.6rem] place-items-center overflow-hidden rounded-md bg-navy sm:h-16 sm:w-[4.2rem]">
        <span ref={ref} className="tabular block font-serif text-[1.9rem] leading-none text-white sm:text-[2.2rem]">
          {value}
        </span>
      </span>
      <span className="kicker mt-2 text-[10px] text-text/50">{label}</span>
    </span>
  );
}

function Countdown() {
  const { nextCohort, now, openCohort } = useBootcamp();
  const left = untilStart(nextCohort.start, now);
  const date = new Date(`${nextCohort.start}T00:00:00+07:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div data-hero-fade className="mt-10 flex flex-col gap-5 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <span className="kicker text-[11px] text-maroon">Kohort berikutnya</span>
        <button type="button" onClick={() => openCohort(nextCohort.slug)} className="mt-1 block text-left font-serif text-[1.35rem] leading-tight text-navy">
          <span className="u-gold">{nextCohort.title}</span>
        </button>
        <span className="mt-1 block text-[13.5px] text-text/60">Mulai {date} · {TRACKS[nextCohort.track]?.label}</span>
      </div>
      <div className="flex items-start gap-2 sm:gap-2.5" aria-live="off" aria-label={left ? `${left.d} hari ${left.h} jam ${left.m} menit lagi` : "Menghitung waktu mulai"}>
        <Digit value={left ? left.d : "--"} label="hari" />
        <Digit value={left ? pad(left.h) : "--"} label="jam" />
        <Digit value={left ? pad(left.m) : "--"} label="menit" />
        <Digit value={left ? pad(left.s) : "--"} label="detik" />
      </div>
    </div>
  );
}

/**
 * Hero "Belajar ngebut, pulang bawa sertifikat". Kiri: judul, intro yang mengikuti mode, sakelar Bootcamp ⇄ Course
 * (mengubah mode seluruh halaman), hitung mundur kohort. Kanan: kanvas cream berisi `SprintTrackIllustration` —
 * garis adegan aktif digambar ulang anime.js setiap mode berganti; di mode bootcamp titik pelari emas menyusuri
 * lintasan (`svg.createMotionPath`).
 */
export function BootcampHero() {
  const { mode, intro, active, bootcamps, courses } = useBootcamp();
  const ref = useRef(null);
  const art = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const delay = curtainDelay(CURTAIN_KEY);
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay });
      gsap.from("[data-canvas]", { clipPath: "inset(12% 12% 12% 12% round 16px)", opacity: 0, duration: 1.2, ease: "expo.out", delay: delay + 0.15 });
    }, el);
    return () => ctx.revert();
  }, []);

  // gambar ulang adegan aktif + pelari
  useEffect(() => {
    const root = art.current;
    if (!root || prefersReducedMotion()) return;
    const scene = root.querySelector(`[data-scene="${mode}"]`);
    const lines = scene?.querySelectorAll("[data-line]");
    const a = lines?.length ? animate(svg.createDrawable(lines), { draw: ["0 0", "0 1"], duration: 1000, delay: stagger(28), ease: "inOutCubic" }) : null;
    let run = null;
    const runner = root.querySelector("[data-runner]");
    const track = root.querySelector("[data-scene='bootcamp'] [data-line]");
    if (mode === "bootcamp" && runner && track) {
      runner.setAttribute("cx", 0);
      runner.setAttribute("cy", 0);
      run = animate(runner, { ...svg.createMotionPath(track), duration: 5200, delay: 900, loop: true, ease: "inOutSine" });
    }
    return () => {
      a?.revert?.();
      run?.revert?.();
    };
  }, [mode]);

  return (
    <section ref={ref} className="relative overflow-hidden pb-12 pt-10 md:pb-16 md:pt-14">
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

        <div className="mt-10 grid gap-12 lg:mt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <div className="relative z-10">
            <SceneTitle as="h1" trigger="mount" title={["Belajar ngebut,", "pulang bawa sertifikat"]} className="!text-[clamp(2.5rem,5.4vw,4.75rem)] !leading-[0.98]" />
            <div data-hero-fade className="mt-6 min-h-[5.5rem] max-w-xl">
              <motion.p key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="text-pretty text-[17px] leading-relaxed text-text/70">
                {mode === "bootcamp" ? intro.bootcamp : intro.course}
              </motion.p>
            </div>
            <div data-hero-fade className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-5">
              <ModeSwitch />
              <button type="button" onClick={() => smoothTo("katalog")} className="text-[15px] font-semibold text-navy">
                <span className="u-gold">{mode === "bootcamp" ? `Lihat ${bootcamps.length} kohort` : `Jelajahi ${courses.length} kursus`}</span>
              </button>
            </div>
            <Countdown />
          </div>

          <div data-canvas className="relative rounded-2xl border border-line bg-cream-2/70 p-6 sm:p-9">
            <span aria-hidden className="pointer-events-none absolute -right-6 -top-16 z-10 hidden xl:block">
              <ElvoPeek pose="run" size={88} side="left" say={mode === "bootcamp" ? "Satu gawang per minggu, jangan ngebut sendirian!" : "Rak ini buka 24 jam."} />
            </span>
            <div ref={art}>
              <SprintTrackIllustration mode={mode} hurdles={active.weeks} className="h-auto w-full text-navy" />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-[12.5px] text-text/55">
              <span>{mode === "bootcamp" ? `${active.weeks} gawang = ${active.weeks} minggu ${active.title}` : "Tanpa jadwal: ambil satu buku, jeda, lanjut lagi"}</span>
              <span aria-hidden className="h-[3px] w-10 shrink-0 bg-gold" />
            </div>
          </div>
        </div>
      </Container>
      <Container className="mt-12">
        <BootcampBanner />
      </Container>
    </section>
  );
}
