"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { TRACKS } from "@/lib/bootcamp-content";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { useBootcamp } from "./bootcamp-provider";

const AUTOPLAY = 6000;
/** Rotasi acak yang stabil per indeks (tanpa Math.random agar SSR = klien). */
const tilt = (i) => [-8, 6, -3, 9, -6, 4][i % 6];

function Portrait({ m }) {
  if (m.photo)
    return <Image src={m.photo} alt={m.name} fill sizes="(min-width: 1024px) 380px, 80vw" className="object-cover object-top" />;
  // praktisi tanpa foto: monogram di atas pola garis (ilustrasi, bukan ikon)
  return (
    <span className="relative grid size-full place-items-center bg-navy">
      <svg aria-hidden viewBox="0 0 200 240" className="absolute inset-0 size-full text-white/10" preserveAspectRatio="none">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M-20 ${20 + i * 20}l240 -60`} stroke="currentColor" strokeWidth="1" />
        ))}
      </svg>
      <span className="relative font-serif text-[4.5rem] leading-none text-gold-soft">{m.initials}</span>
    </span>
  );
}

/**
 * Pola Aceternity "Animated Testimonials": tumpukan potret berotasi; potret aktif naik ke depan dan lurus, kutipan
 * muncul per kata (blur → jelas). Mentor dosen dari data nyata (→ /dosen), praktisi = contoh. Autoplay 6 dtk
 * berhenti saat hover/fokus dan setelah dipilih manual; ‹ › + panah keyboard.
 */
export function MentorStack() {
  const { mentors, active, mode } = useBootcamp();
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });
  const list = useMemo(() => {
    // mode bootcamp: mentor yang jalurnya sama dengan kohort aktif didahulukan
    if (mode !== "bootcamp") return mentors;
    // dosen nyata dulu, lalu yang jalurnya sama dengan kohort aktif
    return [...mentors].sort((a, b) => Number(a.sample) - Number(b.sample) || Number(b.track === active.track) - Number(a.track === active.track));
  }, [mentors, mode, active.track]);
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const [manual, setManual] = useState(false);
  const m = list[i] ?? list[0];

  useEffect(() => setI(0), [list]);

  const go = useCallback((d) => setI((v) => (v + d + list.length) % list.length), [list.length]);
  const pick = (d) => {
    setManual(true);
    go(d);
  };

  useEffect(() => {
    if (hold || manual || !inView || reduce || list.length < 2) return;
    const t = setTimeout(() => go(1), AUTOPLAY);
    return () => clearTimeout(t);
  }, [i, hold, manual, inView, reduce, go, list.length]);

  if (!m) return null;
  const words = m.quote.split(" ");

  return (
    <section id="mentor" className="relative scroll-mt-24 border-t border-line bg-white py-16 md:py-24">
      <Container>
        <SectionHeader title={["Diajar oleh", "yang sudah mengerjakannya"]} body="Dosen pengampu rumpun yang sama dengan kohortnya, ditemani praktisi dari mitra industri." action={list.some((x) => x.sample) && <PlaceholderTag />} />

        <div
          ref={ref}
          onPointerEnter={() => setHold(true)}
          onPointerLeave={() => setHold(false)}
          onFocusCapture={() => setHold(true)}
          onBlurCapture={() => setHold(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") pick(1);
            if (e.key === "ArrowLeft") pick(-1);
          }}
          className="mt-14 grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-20"
        >
          <div className="relative mx-auto aspect-[5/6] w-full max-w-[340px]">
            <AnimatePresence initial={false}>
              {list.map((x, k) => {
                const on = k === i;
                return (
                  <motion.div
                    key={x.slug}
                    aria-hidden={!on}
                    initial={reduce ? false : { opacity: 0, scale: 0.9, rotate: tilt(k), y: 0 }}
                    animate={{
                      opacity: on ? 1 : 0.7,
                      scale: on ? 1 : 0.94,
                      rotate: on ? 0 : tilt(k),
                      zIndex: on ? 40 : list.length - Math.abs(k - i),
                      y: on ? 0 : 10,
                    }}
                    transition={{ duration: reduce ? 0 : 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 origin-bottom overflow-hidden rounded-2xl border border-line shadow-[0_30px_60px_-36px_rgb(14_24_48/0.7)]"
                  >
                    <Portrait m={x} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="flex min-h-[18rem] flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div key={m.slug} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.25 }}>
                <span className="kicker text-[11px] text-maroon">{TRACKS[m.track]?.label ?? "Mentor"}</span>
                <h3 className="mt-2 font-serif text-[clamp(1.6rem,2.6vw,2.2rem)] leading-tight text-navy">
                  {m.href ? (
                    <a href={m.href} className="u-gold">{m.name}</a>
                  ) : (
                    m.name
                  )}
                </h3>
                <p className="mt-1 text-[14px] text-text/55">{m.role}</p>
                <blockquote className="mt-7 font-serif text-[clamp(1.25rem,2vw,1.6rem)] leading-[1.45] text-navy/90">
                  <span aria-hidden className="mr-1 text-gold">“</span>
                  {words.map((w, k) => (
                    <motion.span
                      key={k}
                      initial={reduce ? false : { filter: "blur(8px)", opacity: 0, y: 5 }}
                      animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut", delay: 0.02 * k }}
                      className="inline-block"
                    >
                      {w}&nbsp;
                    </motion.span>
                  ))}
                  <span aria-hidden className="text-gold">”</span>
                </blockquote>
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center gap-4">
              {[-1, 1].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => pick(d)}
                  aria-label={d < 0 ? "Mentor sebelumnya" : "Mentor berikutnya"}
                  className="group grid size-11 place-items-center rounded-full border border-line text-navy transition-[background-color,border-color,color] duration-300 hover:border-navy hover:bg-navy hover:text-white"
                >
                  <svg aria-hidden viewBox="0 0 16 16" className={cn("size-4 transition-transform duration-300", d < 0 ? "rotate-180 group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5")}>
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
              <span className="tabular ml-2 text-[13px] text-text/50">
                {String(i + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
