"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { CURTAIN_KEY } from "@/lib/dosen-content";
import { VIDEOS } from "@/lib/home-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { WordRotate } from "@/components/motion/word-rotate";
import { Modal, ModalContent, ModalDescription, ModalTitle, ModalTrigger } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useDosen } from "./dosen-provider";

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

/**
 * Hero Dosen "pencarian dulu": judul + WordRotate keahlian, kipas potret & video di kanan, lalu panel
 * pencarian besar yang langsung mengisi `query` direktori, chip rumpun (filter `field`), dan saran topik.
 */
export function DosenHero() {
  const { intro, lecturers, fields, field, setField, query, setQuery } = useDosen();
  const ref = useRef(null);
  const [draft, setDraft] = useState(query);
  useEffect(() => setDraft(query), [query]);
  const go = (q) => {
    setQuery(q);
    smoothTo("direktori");
  };
  const fan = useRef(null);
  const allTopics = [...new Set(lecturers.flatMap((l) => l.expertise))];
  const topicCount = allTopics.length;
  const topics = allTopics.filter((t) => t.length <= 22).slice(0, 8);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const delay = curtainDelay(CURTAIN_KEY) * 1000;

    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay: delay / 1000 });
      gsap.from("[data-portrait]", { y: 40, opacity: 0, rotate: 0, duration: 0.9, stagger: 0.07, ease: "back.out(1.4)", delay: delay / 1000 + 0.3 });
      gsap.from("[data-search]", { y: 30, opacity: 0, scale: 0.98, duration: 1, ease: "expo.out", delay: delay / 1000 + 0.2 });
      gsap.from("[data-chip]", { y: 12, opacity: 0, duration: 0.6, stagger: 0.05, ease: "back.out(1.6)", delay: delay / 1000 + 0.45 });
    }, el);
    return () => ctx.revert();
  }, []);

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
            <li>Profil</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Dosen</li>
          </ol>
        </nav>

        {/* baris judul: kiri judul, kanan potret + video */}
        <div className="mt-10 flex flex-col gap-8 lg:mt-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <SceneTitle as="h1" trigger="mount" title={["Belajar dari", "yang mengerjakannya"]} className="!text-[clamp(2.5rem,5.6vw,4.5rem)] !leading-[1.02]" />
            <p data-hero-fade className="mt-4 font-serif text-[clamp(1.15rem,2vw,1.45rem)] leading-tight text-text/60">
              Ahli di{" "}
              <span className="inline-block min-w-[12ch] italic text-maroon">
                <WordRotate words={topics} interval={2400} />
              </span>
            </p>
          </div>
          <div data-hero-fade className="flex flex-wrap items-center gap-x-8 gap-y-4 lg:flex-col lg:items-end lg:gap-3">
            <button
              ref={fan}
              type="button"
              onPointerEnter={() => spread(true)}
              onPointerLeave={() => spread(false)}
              onFocus={() => spread(true)}
              onBlur={() => spread(false)}
              onClick={() => smoothTo("direktori")}
              aria-label={`Lihat ${lecturers.length} dosen`}
              className="group flex items-center gap-4"
            >
              <span className="flex pl-3">
                {lecturers.slice(0, 6).map((l, i) => (
                  <span
                    key={l.slug}
                    data-portrait
                    className="relative -ml-3 h-14 w-11 overflow-hidden rounded-md border-2 border-cream bg-cream-2 shadow-[0_10px_20px_-12px_rgb(20_33_61/0.6)]"
                    style={{ zIndex: 10 - i }}
                  >
                    {l.photo ? <Image src={l.photo} alt="" fill sizes="44px" className="object-cover object-top" /> : <span className="grid size-full place-items-center text-xs text-maroon">{l.initials}</span>}
                  </span>
                ))}
              </span>
              <span className="text-left text-[13px] leading-snug text-text/60">
                <span className="block font-semibold text-navy">{lecturers.length} dosen tetap</span>
                <span className="u-gold">{topicCount} topik keahlian</span>
              </span>
            </button>
            <VideoLink />
          </div>
        </div>

        {/* panel pencarian */}
        <div data-search className="relative mt-10 rounded-2xl border border-line bg-white p-4 shadow-[0_30px_60px_-44px_rgb(20_33_61/0.5)] sm:p-6 md:mt-12">
          <div className="absolute -top-16 right-6 hidden lg:block">
            <div className="relative"><ElvoPeek pose="wave" size={80} side="left" say="Ketik topiknya, aku carikan dosennya!" delay={0.3} /></div>
          </div>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              go(draft.trim());
            }}
            className="flex items-center gap-2 rounded-xl border border-navy/15 bg-cream/60 p-1.5 pl-4 transition-[border-color,box-shadow] duration-300 focus-within:border-maroon/50 focus-within:shadow-[0_0_0_4px_rgb(110_20_35/0.08)]"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0 text-text/40">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16 16l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <label htmlFor="hero-dosen-q" className="sr-only">Cari dosen</label>
            <input
              id="hero-dosen-q"
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Cari nama dosen, topik, atau mata kuliah…"
              className="h-12 min-w-0 flex-1 bg-transparent text-[16px] text-navy outline-none placeholder:text-text/40 md:h-14 md:text-[17px]"
            />
            <button type="submit" className="h-11 shrink-0 rounded-lg bg-maroon px-5 text-[15px] font-semibold text-white transition-colors duration-300 hover:bg-maroon-deep md:h-12 md:px-7">
              Cari
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8">
            <div role="group" aria-label="Filter rumpun keahlian" className="flex flex-wrap gap-2">
              {[{ key: "all", name: "Semua rumpun" }, ...fields].map((f) => {
                const on = field === f.key;
                const n = f.key === "all" ? lecturers.length : lecturers.filter((l) => l.fields.includes(f.key)).length;
                return (
                  <button
                    key={f.key}
                    type="button"
                    data-chip
                    aria-pressed={on}
                    onClick={() => {
                      setField(f.key);
                      smoothTo("direktori");
                    }}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13.5px] transition-colors duration-300",
                      on ? "border-maroon bg-maroon text-white" : "border-line bg-cream text-navy hover:border-navy/30"
                    )}
                  >
                    {f.name}
                    <span className={cn("tabular-nums text-[12px]", on ? "text-white/70" : "text-text/45")}>{n}</span>
                  </button>
                );
              })}
            </div>
            <p className="shrink-0 text-[13px] text-text/50">
              Coba:{" "}
              {topics.slice(0, 3).map((t, i) => (
                <span key={t}>
                  {i > 0 && ", "}
                  <button type="button" onClick={() => go(t)} className="u-gold font-medium text-navy">
                    {t}
                  </button>
                </span>
              ))}
            </p>
          </div>
        </div>

        <p data-hero-fade className="mt-6 max-w-2xl text-pretty text-[15.5px] leading-relaxed text-text/65">{intro.body}</p>
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
