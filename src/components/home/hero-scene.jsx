"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, SplitText } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { HERO_V3, PMB_URL, VIDEOS } from "@/lib/home-content";
import { useIntroReady } from "@/components/intro-loader";
import { Magnetic } from "@/components/motion/magnetic";
import { Container, PillLink } from "./shared";
import { VideoButton } from "./video-player";
import { ElvoPeek } from "./elvo-peek";

/**
 * Hero kampus full-bleed: video b-roll senyap (dipotong dari video Mawapres) sebagai latar,
 * panel navy solid (tanpa gradien) berisi judul serif. Video berhenti saat keluar layar;
 * reduced-motion / hemat data → poster diam.
 */
export function HeroScene() {
  const root = useRef(null);
  const video = useRef(null);
  const ready = useIntroReady();
  const [useVideo, setUseVideo] = useState(false);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const saveData = navigator.connection?.saveData;
    setUseVideo(!prefersReducedMotion() && !saveData);
  }, []);

  // jeda saat hero tidak terlihat
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && playing ? v.play().catch(() => {}) : v.pause()));
    io.observe(v);
    return () => io.disconnect();
  }, [useVideo, playing]);

  useEffect(() => {
    const el = root.current;
    if (!el || !ready) return;
    if (prefersReducedMotion()) {
      gsap.set(el.querySelectorAll("[data-hero-in]"), { autoAlpha: 1 });
      return;
    }
    let split;
    const ctx = gsap.context(() => {
      split = SplitText.create(el.querySelector("h1"), { type: "lines", mask: "lines" });
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .set(el.querySelectorAll("[data-hero-in]"), { autoAlpha: 1 })
        .from(el.querySelector("[data-hero-panel]"), { clipPath: "inset(0 100% 0 0)", duration: 1.2, ease: "expo.inOut" })
        .from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.1 }, "-=0.45")
        .from(el.querySelectorAll("[data-hero-fade]"), { y: 16, opacity: 0, duration: 0.9, stagger: 0.08 }, "-=0.7");
      gsap.fromTo(el.querySelector("[data-hero-media]"), { scale: 1.12 }, { scale: 1, duration: 2.6, ease: "power3.out" });
    }, el);
    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [ready]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section ref={root} id="beranda" className="relative isolate h-[86svh] min-h-[560px] overflow-hidden bg-maroon-deep md:h-[88vh]">
      <div data-hero-media className="absolute inset-0 -z-10">
        {useVideo ? (
          <video ref={video} src={VIDEOS.heroLoop.src} poster={VIDEOS.heroLoop.poster} autoPlay muted loop playsInline preload="auto" aria-hidden className="h-full w-full object-cover" />
        ) : (
          <Image src={VIDEOS.heroLoop.poster} alt="" fill priority sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-maroon-deep/20" />
      </div>

      <Container className="flex h-full items-end pb-24 md:pb-32">
        <div data-hero-in data-hero-panel className="invisible max-w-2xl border-t-4 border-gold bg-maroon/[0.92] p-6 text-white sm:p-7 md:p-10">
          <h1 className="font-serif text-[clamp(2.1rem,4.6vw,3.9rem)] font-normal leading-[1.06] tracking-[-0.01em]">
            {HERO_V3.title[0]} <em className="italic text-gold-soft">{HERO_V3.title[1]}</em> {HERO_V3.title[2]}
          </h1>
          <p data-hero-fade className="mt-5 max-w-lg text-pretty text-[16.5px] leading-relaxed text-white/75">
            {HERO_V3.body}
          </p>
          <div data-hero-fade className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Magnetic strength={0.2}>
              <PillLink href={PMB_URL} variant="gold" target="_blank" rel="noopener noreferrer">
                Daftar PMB
              </PillLink>
            </Magnetic>
            <PillLink href="#bidang" variant="outline-light">
              Jelajahi Program
            </PillLink>
            <VideoButton video={VIDEOS.mawapres}>Tonton kisah mawapres</VideoButton>
          </div>
        </div>
      </Container>

      <div className="pointer-events-none absolute bottom-24 right-[16%] z-10 hidden lg:block">
        <div className="relative">
          <ElvoPeek pose="wave" size={170} say="Hai! Aku Si Elvo, maskot Sistem Informasi UISI. Yuk jelajahi!" />
        </div>
      </div>

      {useVideo && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Jeda video latar" : "Putar video latar"}
          className="absolute bottom-28 right-5 grid size-11 place-items-center rounded-full border border-white/40 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-navy md:bottom-32 md:right-8"
        >
          {playing ? (
            <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="currentColor"><rect x="3.5" y="3" width="3" height="10" rx="1" /><rect x="9.5" y="3" width="3" height="10" rx="1" /></svg>
          ) : (
            <svg aria-hidden viewBox="0 0 16 16" className="ml-0.5 size-4" fill="currentColor"><path d="M4.5 2.8v10.4a.8.8 0 0 0 1.2.7l8.3-5.2a.8.8 0 0 0 0-1.4L5.7 2.1a.8.8 0 0 0-1.2.7z" /></svg>
          )}
        </button>
      )}
    </section>
  );
}
