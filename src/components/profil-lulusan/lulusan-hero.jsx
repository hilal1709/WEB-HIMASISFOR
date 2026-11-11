"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { VIDEOS } from "@/lib/home-content";
import { CURTAIN_KEY } from "@/lib/profil-lulusan-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { Magnetic } from "@/components/motion/magnetic";
import { WordRotate } from "@/components/motion/word-rotate";
import { Modal, ModalContent, ModalDescription, ModalTitle, ModalTrigger } from "@/components/ui/modal";

const TILTS = [-3, 2.5, -1.5, 3, -2.5, 1.5];
const initials = (name) => name.split(/[ ,.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("");

function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

/**
 * Hero Profil Lulusan (editorial): header majalah dua kolom, kalimat raksasa "berkarier sebagai"
 * dengan jabatan berganti (WordRotate) melintang lebar penuh, lalu kolase polaroid alumni
 * yang masuk bertahap. Elvo `proud` menyembul di atas kolase.
 */
export function LulusanHero({ intro, roles, alumni }) {
  const ref = useRef(null);
  const avatars = alumni.filter((a) => a.photo).slice(0, 6);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(CURTAIN_KEY) === "1";
    } catch {}
    const delay = seen ? 150 : 1900;

    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay: delay / 1000 });
      gsap.from("[data-avatar]", { y: 60, opacity: 0, duration: 0.9, stagger: 0.08, ease: "back.out(1.4)", delay: delay / 1000 + 0.5 });
      gsap.to("[data-parallax]", { yPercent: -8, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.8 } });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li><a href="/profile" className="u-gold transition-colors hover:text-maroon">Profil</a></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Profil Lulusan</li>
          </ol>
        </nav>

        {/* baris atas: header majalah dua kolom, rata atas */}
        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
          <div>
            <span aria-hidden data-hero-fade className="mb-6 block h-[3px] w-10 bg-gold" />
            <SceneTitle as="h1" trigger="mount" title={["Profil", "Lulusan"]} className="!text-[clamp(3rem,7vw,5.75rem)] !leading-[0.98]" />
          </div>
          <div className="lg:border-l lg:border-line lg:pb-2 lg:pl-10">
            <p data-hero-fade className="text-pretty text-[17px] leading-relaxed text-text/70">{intro.body}</p>
            <div data-hero-fade className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Magnetic strength={0.25}>
                <a
                  href="#profil"
                  onClick={(e) => {
                    e.preventDefault();
                    smoothTo("profil");
                  }}
                  className="group inline-flex h-12 items-center gap-2 rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
                >
                  Jelajahi profil
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5">
                    <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </Magnetic>
              <AlumniVideoButton />
            </div>
          </div>
        </div>

        {/* kalimat raksasa melintang */}
        <div data-hero-fade className="mt-14 border-y border-line py-7 md:mt-16 md:py-9">
          <p className="font-serif text-[clamp(1.35rem,2.6vw,2rem)] leading-tight text-text/60">
            Lulusan kami berkarier sebagai
            <span className="mt-1 block min-h-[1.15em] text-[clamp(1.6rem,5.6vw,4.5rem)] italic leading-[1.1] text-maroon">
              <WordRotate words={roles} interval={2600} />
            </span>
          </p>
        </div>

        {/* kolase alumni ala polaroid */}
        {avatars.length > 0 && (
          <div className="relative mt-12 md:mt-14">
            <ul data-parallax className="flex flex-wrap items-start justify-center gap-4 sm:gap-6 lg:flex-nowrap lg:justify-between lg:gap-4">
              {avatars.map((a, i) => (
                <li
                  key={a.name}
                  data-avatar
                  className={`group w-[42%] sm:w-[28%] lg:w-auto lg:min-w-0 lg:flex-1 lg:basis-0 ${i % 2 ? "lg:mt-10" : ""}`}
                >
                  <span
                    style={{ rotate: `${TILTS[i % TILTS.length]}deg` }}
                    className="block rounded-md bg-white p-2 pb-3 shadow-[0_18px_40px_-26px_rgb(20_33_61/0.55)] transition-[rotate,translate,box-shadow] duration-500 ease-cinematic group-hover:!rotate-0 group-hover:-translate-y-2 group-hover:shadow-[0_28px_50px_-28px_rgb(20_33_61/0.6)]"
                  >
                    <span className="relative block aspect-[4/5] overflow-hidden rounded-sm bg-cream-2">
                      {a.photo ? (
                        <Image src={a.photo} alt={a.name} fill sizes="(min-width:1024px) 200px, 40vw" className="object-cover grayscale-[0.2] transition-[filter,transform] duration-700 ease-cinematic group-hover:scale-[1.04] group-hover:grayscale-0" />
                      ) : (
                        <span className="grid h-full place-items-center font-serif text-2xl text-maroon">{initials(a.name)}</span>
                      )}
                    </span>
                    <span className="mt-2.5 block truncate px-1 text-[13px] font-semibold text-navy">{a.name}</span>
                    {a.role && <span className="block truncate px-1 text-[11.5px] text-text/55">{a.role}</span>}
                  </span>
                </li>
              ))}
            </ul>
            <div className="absolute -top-32 right-[2%] hidden lg:block">
              <div className="relative"><ElvoPeek pose="proud" size={92} side="left" say="Kakak-kakak alumni sudah di mana-mana, lho!" delay={0.4} /></div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

/** Tombol "Tonton cerita alumni" → modal video (video baru diunduh saat dibuka). */
function AlumniVideoButton() {
  const v = VIDEOS.alumni;
  return (
    <Modal>
      <ModalTrigger className="group inline-flex h-12 items-center gap-3 text-[15px] font-semibold text-navy">
        <span className="relative grid size-11 place-items-center rounded-full border border-navy/25 transition-[background-color,border-color,color,transform] duration-500 ease-cinematic group-hover:scale-110 group-hover:border-maroon group-hover:bg-maroon group-hover:text-white">
          <svg aria-hidden viewBox="0 0 24 24" className="ml-0.5 size-4" fill="currentColor">
            <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
          </svg>
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full border border-maroon/30 [animation-duration:2.4s] motion-reduce:hidden" />
        </span>
        <span className="u-gold">Tonton cerita alumni</span>
        <span className="tabular text-xs font-normal text-text/50">{v.duration}</span>
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
