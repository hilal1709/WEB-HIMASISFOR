"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { CURTAIN_KEY, QUIZ } from "@/lib/program-kelas-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { cn } from "@/lib/utils";
import { useKelas } from "./kelas-provider";

function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

const LETTERS = ["A", "B", "C", "D"];

/**
 * Hero Program Kelas "pertanyaan persona": judul & intro di kiri, kartu pertanyaan besar di kanan
 * ("Saat ini kamu sedang…", dari QUIZ[0]). Memilih jawaban langsung menyarankan kelas dengan skor
 * tertinggi (setActive), lalu kartu berganti jadi hasil: lihat detail, ulangi, atau kuis lengkap.
 */
export function KelasHero() {
  const { intro, classes, setActive, openQuiz } = useKelas();
  const ref = useRef(null);
  const card = useRef(null);
  const [pick, setPick] = useState(null); // index kelas hasil
  const q = QUIZ[0];

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const delay = curtainDelay(CURTAIN_KEY);
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay });
      gsap.from("[data-card]", { y: 40, rotate: 1.5, opacity: 0, duration: 1.1, ease: "expo.out", delay: delay + 0.2 });
      gsap.from("[data-option]", { x: 24, opacity: 0, duration: 0.7, stagger: 0.08, ease: "expo.out", delay: delay + 0.5 });
    }, el);
    return () => ctx.revert();
  }, []);

  // kartu "membalik" pelan saat berganti antara pertanyaan dan hasil
  useEffect(() => {
    if (!card.current || prefersReducedMotion()) return;
    const t = gsap.fromTo(card.current.querySelectorAll("[data-swap]"), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: "expo.out" });
    return () => t.revert();
  }, [pick]);

  const answer = (opt) => {
    const best = opt.score.indexOf(Math.max(...opt.score));
    setPick(best);
    setActive(best);
  };

  const result = pick !== null ? classes[pick] : null;

  return (
    <section ref={ref} className="relative overflow-hidden pb-10 pt-10 md:pb-14 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li>Profil</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Program Kelas</li>
          </ol>
        </nav>

        <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
          <div>
            <span aria-hidden data-hero-fade className="mb-6 block h-[3px] w-10 bg-gold" />
            <SceneTitle as="h1" trigger="mount" title={["Satu prodi,", "tiga cara", "belajar"]} className="!text-[clamp(2.6rem,5.8vw,4.75rem)] !leading-[1]" />
            <p data-hero-fade className="mt-6 max-w-lg text-pretty text-[17px] leading-relaxed text-text/70">{intro.body}</p>
            <ul data-hero-fade className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-text/60">
              {classes.map((c, i) => (
                <li key={c.key} className="flex items-center gap-2">
                  <span aria-hidden className={cn("size-2 rounded-full", ["bg-maroon", "bg-gold", "bg-navy"][i % 3])} />
                  {c.name}
                </li>
              ))}
            </ul>
          </div>

          {/* kartu pertanyaan */}
          <div className="relative">
            <span aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-gold/25" />
            <div ref={card} data-card className="relative rounded-2xl border border-line bg-white p-6 shadow-[0_40px_80px_-50px_rgb(20_33_61/0.55)] sm:p-8">
              {!result ? (
                <div key="question">
                  <div data-swap className="flex items-center justify-between">
                    <p className="kicker text-maroon">Kamu yang mana?</p>
                    <p className="text-[12.5px] tabular-nums text-text/45">1 dari {QUIZ.length} pertanyaan</p>
                  </div>
                  <p data-swap className="mt-3 font-serif text-[clamp(1.6rem,3vw,2.3rem)] leading-tight text-navy">{q.q}</p>
                  <ul className="mt-6 space-y-3">
                    {q.options.map((o, i) => (
                      <li key={o.label} data-option data-swap>
                        <button
                          type="button"
                          onClick={() => answer(o)}
                          className="group flex w-full items-center gap-4 rounded-xl border border-line bg-cream/50 p-3.5 text-left transition-[border-color,background-color,transform] duration-300 ease-cinematic hover:-translate-y-0.5 hover:border-maroon/40 hover:bg-white sm:p-4"
                        >
                          <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-navy/15 bg-white font-serif text-lg text-navy transition-colors duration-300 group-hover:border-maroon group-hover:bg-maroon group-hover:text-white">
                            {LETTERS[i]}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15.5px] font-semibold text-navy">{o.label}</span>
                            <span className="block text-[13px] text-text/55">{o.hint}</span>
                          </span>
                          <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0 text-maroon opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                            <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={openQuiz} data-swap className="mt-5 text-[14px] font-semibold text-navy">
                    <span className="u-gold">Jawab kuis lengkap ({QUIZ.length} pertanyaan)</span>
                  </button>
                </div>
              ) : (
                <div key="result" aria-live="polite">
                  <p data-swap className="kicker text-maroon">Paling pas untukmu</p>
                  <p data-swap className="mt-3 font-serif text-[clamp(1.9rem,3.6vw,2.75rem)] leading-tight text-navy">{result.name}</p>
                  <p data-swap className="mt-3 text-pretty text-[15.5px] leading-relaxed text-text/70">{result.tagline}</p>
                  <dl data-swap className="mt-6 grid grid-cols-2 gap-4 border-y border-line py-4 text-[14px]">
                    <div>
                      <dt className="text-[12px] text-text/50">Jadwal</dt>
                      <dd className="mt-0.5 font-semibold text-navy">{result.schedule}</dd>
                    </div>
                    <div>
                      <dt className="text-[12px] text-text/50">Biaya</dt>
                      <dd className="mt-0.5 font-semibold text-navy">
                        {result.fee} <span className="font-normal text-text/50">{result.feeNote}</span>
                      </dd>
                    </div>
                  </dl>
                  <div data-swap className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <button
                      type="button"
                      onClick={() => smoothTo("kelas")}
                      className="group inline-flex h-12 items-center gap-2 rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
                    >
                      Lihat detail kelas
                      <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5">
                        <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => setPick(null)} className="text-[14.5px] font-semibold text-navy">
                      <span className="u-gold">Ulangi</span>
                    </button>
                    <button type="button" onClick={openQuiz} className="text-[14.5px] text-text/60">
                      <span className="u-gold">Kuis lengkap</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute -left-14 -top-14 hidden xl:block">
              <div className="relative"><ElvoPeek pose="think" size={84} side="right" say="Pilih jawabanmu, aku tebak kelasnya!" delay={0.4} /></div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
