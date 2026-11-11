"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { animate, stagger, svg } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { CURTAIN_KEY } from "@/lib/dosen-content";
import { VIDEOS } from "@/lib/home-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { LecturerNetworkIllustration } from "@/components/illustrations/line-illustrations";
import { Magnetic } from "@/components/motion/magnetic";
import { WordRotate } from "@/components/motion/word-rotate";
import { Modal, ModalContent, ModalDescription, ModalTitle, ModalTrigger } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useDosen } from "./dosen-provider";

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

/**
 * Hero Dosen: judul serif + WordRotate bidang keahlian, intro + CTA, tumpukan potret dosen yang
 * mengipas saat di-hover (GSAP), lalu ilustrasi "jejaring keahlian" yang tergambar garis demi garis
 * (anime.js). Rumpun aktif menyala di ilustrasi; label rumpun di bawahnya memfilter direktori.
 */
export function DosenHero() {
  const { intro, lecturers, fields, field, setField } = useDosen();
  const ref = useRef(null);
  const fan = useRef(null);
  const topics = [...new Set(lecturers.flatMap((l) => l.expertise))].filter((t) => t.length <= 22).slice(0, 8);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(CURTAIN_KEY) === "1";
    } catch {}
    const delay = seen ? 150 : 1900;

    const draw = animate(svg.createDrawable(el.querySelectorAll("[data-art] [data-line]")), {
      draw: ["0 0", "0 1"],
      duration: 1300,
      delay: stagger(24, { start: delay }),
      ease: "inOutCubic",
    });
    const fills = animate(el.querySelectorAll("[data-art] [fill]:not([fill='none'])"), { opacity: [0, 1], duration: 700, delay: delay + 900, ease: "outCubic" });
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay: delay / 1000 });
      gsap.from("[data-portrait]", { y: 40, opacity: 0, rotate: 0, duration: 0.9, stagger: 0.07, ease: "back.out(1.4)", delay: delay / 1000 + 0.3 });
      gsap.to("[data-parallax]", { yPercent: -6, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.8 } });
    }, el);
    return () => {
      draw.revert?.();
      fills.revert?.();
      ctx.revert();
    };
  }, []);

  // titik konektor rumpun aktif berdenyut
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || field === "all") return;
    const n = el.querySelector(`[data-art] [data-field="${field}"] [data-node]`);
    if (!n) return;
    const a = animate(n, { scale: [1, 2.1, 1], duration: 1300, loop: true, loopDelay: 400, ease: "inOutSine" });
    return () => a.revert?.();
  }, [field]);

  // kipas potret
  const spread = (on) => {
    const cards = fan.current?.querySelectorAll("[data-portrait]");
    if (!cards || prefersReducedMotion()) return;
    const mid = (cards.length - 1) / 2;
    gsap.to(cards, {
      x: (i) => (on ? (i - mid) * 14 : 0),
      rotate: (i) => (on ? (i - mid) * 5 : 0),
      y: (i) => (on ? Math.abs(i - mid) * 4 : 0),
      duration: 0.6,
      ease: "expo.out",
      stagger: on ? 0.02 : 0,
    });
  };

  return (
    <section ref={ref} className="relative overflow-hidden pb-14 pt-10 md:pb-20 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li><a href="/profile" className="u-gold transition-colors hover:text-maroon">Profil</a></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Dosen</li>
          </ol>
        </nav>

        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
          <div>
            <span aria-hidden data-hero-fade className="mb-6 block h-[3px] w-10 bg-gold" />
            <SceneTitle as="h1" trigger="mount" title={["Belajar dari", "yang mengerjakannya"]} className="!text-[clamp(2.75rem,6.4vw,5.25rem)] !leading-[1]" />
            <p data-hero-fade className="mt-6 font-serif text-[clamp(1.2rem,2.2vw,1.6rem)] leading-tight text-text/60">
              Ahli di{" "}
              <span className="inline-block min-w-[12ch] italic text-maroon">
                <WordRotate words={topics} interval={2400} />
              </span>
            </p>
          </div>
          <div className="lg:border-l lg:border-line lg:pb-2 lg:pl-10">
            {/* tumpukan potret */}
            <button
              ref={fan}
              type="button"
              data-hero-fade
              onPointerEnter={() => spread(true)}
              onPointerLeave={() => spread(false)}
              onFocus={() => spread(true)}
              onBlur={() => spread(false)}
              onClick={() => smoothTo("direktori")}
              aria-label={`Lihat ${lecturers.length} dosen`}
              className="group mb-6 flex items-center gap-4"
            >
              <span className="flex pl-3">
                {lecturers.slice(0, 6).map((l, i) => (
                  <span
                    key={l.slug}
                    data-portrait
                    className="relative -ml-3 h-16 w-12 overflow-hidden rounded-md border-2 border-cream bg-cream-2 shadow-[0_10px_20px_-12px_rgb(20_33_61/0.6)]"
                    style={{ zIndex: 10 - i }}
                  >
                    {l.photo ? <Image src={l.photo} alt="" fill sizes="48px" className="object-cover object-top" /> : <span className="grid size-full place-items-center text-xs text-maroon">{l.initials}</span>}
                  </span>
                ))}
              </span>
              <span className="text-left text-[13.5px] leading-snug text-text/60">
                <span className="block font-semibold text-navy">{lecturers.length} dosen tetap</span>
                <span className="u-gold">satu ruang diskusi</span>
              </span>
            </button>
            <p data-hero-fade className="text-pretty text-[17px] leading-relaxed text-text/70">{intro.body}</p>
            <div data-hero-fade className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Magnetic strength={0.25}>
                <a
                  href="#direktori"
                  onClick={(e) => {
                    e.preventDefault();
                    smoothTo("direktori");
                  }}
                  className="group inline-flex h-12 items-center gap-2 rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
                >
                  Kenali dosen
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5">
                    <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </Magnetic>
              <VideoLink />
            </div>
          </div>
        </div>

        {/* ilustrasi jejaring keahlian */}
        <div className="relative mx-auto mt-12 max-w-[900px] md:mt-14">
          <div data-art data-parallax data-active-field={field} className="lecturer-net">
            <LecturerNetworkIllustration className="h-auto w-full text-navy" />
          </div>
          <div className="absolute -right-4 top-0 hidden lg:block xl:-right-24">
            <div className="relative"><ElvoPeek pose="wave" size={88} side="left" say="Klik rumpunnya, aku tunjukkan dosennya!" delay={0.3} /></div>
          </div>
          <div role="group" aria-label="Filter rumpun keahlian" className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
            {fields.map((f, i) => {
              const on = field === f.key;
              const n = lecturers.filter((l) => l.fields.includes(f.key)).length;
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setField(on ? "all" : f.key);
                    smoothTo("direktori");
                  }}
                  className={cn("group border-t-2 pt-3 text-left transition-colors duration-500", on ? "border-gold" : "border-line hover:border-navy/30")}
                >
                  <span className="kicker block text-[11px] text-text/45">Rumpun {String(i + 1).padStart(2, "0")} · {n} dosen</span>
                  <span className={cn("mt-1 block font-serif text-[clamp(1rem,1.6vw,1.25rem)] leading-tight transition-colors", on ? "text-maroon" : "text-navy group-hover:text-maroon")}>
                    {f.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Tombol "▶ Video profil dosen" untuk permukaan terang. */
function VideoLink() {
  const v = VIDEOS.dosen;
  return (
    <Modal>
      <ModalTrigger className="group inline-flex h-12 items-center gap-3 text-[15px] font-semibold text-navy">
        <span className="relative grid size-11 place-items-center rounded-full border border-navy/25 transition-[background-color,border-color,transform,color] duration-500 ease-cinematic group-hover:scale-110 group-hover:border-maroon group-hover:bg-maroon group-hover:text-white">
          <svg aria-hidden viewBox="0 0 24 24" className="ml-0.5 size-4" fill="currentColor">
            <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
          </svg>
          <span aria-hidden className="absolute inset-0 rounded-full ring-2 ring-maroon/30 transition-[transform,opacity] duration-700 group-hover:scale-125 group-hover:opacity-0" />
        </span>
        <span className="u-gold">Video profil dosen</span>
        <span className="tabular text-xs font-normal text-text/45">{v.duration}</span>
      </ModalTrigger>
      <ModalContent className="max-w-5xl bg-maroon-deep p-0 text-white sm:p-0">
        <ModalTitle className="sr-only">{v.title}</ModalTitle>
        <ModalDescription className="sr-only">Pemutar video</ModalDescription>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video src={v.src} poster={v.poster} controls autoPlay playsInline preload="none" className="aspect-video w-full bg-black" />
      </ModalContent>
    </Modal>
  );
}
