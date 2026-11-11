"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { Magnetic } from "@/components/motion/magnetic";
import { useProfileModal } from "./profile-modal";

/**
 * Hero sambutan: breadcrumb, judul serif, dua CTA, potret dengan clip-path reveal
 * + bingkai emas bergeser + parallax lembut, kartu nama melayang.
 */
export function SambutanHero({ data }) {
  const ref = useRef(null);
  const openProfile = useProfileModal();

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: window.sessionStorage?.getItem("sisfor:curtain:sambutan") ? 0.1 : 1.9 });
      tl.fromTo("[data-photo]", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: "expo.out" })
        .from("[data-photo] img", { scale: 1.18, duration: 1.6, ease: "expo.out" }, 0)
        .from("[data-frame]", { x: -16, y: 16, opacity: 0, duration: 1, ease: "expo.out" }, 0.3)
        .from("[data-namecard]", { y: 24, opacity: 0, duration: 0.8, ease: "back.out(1.6)" }, 0.6)
        .from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out" }, 0.15);
      gsap.to("[data-parallax]", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.8 },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const toLetter = (e) => {
    e.preventDefault();
    document.getElementById("surat")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  };

  return (
    <section ref={ref} className="relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li><a href="/profile" className="u-gold transition-colors hover:text-maroon">Profil</a></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Sambutan Kaprodi</li>
          </ol>
        </nav>

        <div className="mt-10 grid items-center gap-14 lg:mt-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div className="relative">
            <span aria-hidden data-hero-fade className="mb-6 block h-[3px] w-10 bg-gold" />
            <SceneTitle as="h1" trigger="mount" title={["Sambutan", "Ketua Program Studi"]} className="!text-[clamp(2.5rem,5.4vw,4.5rem)]" />
            <p data-hero-fade className="mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-text/70">
              Pesan dari {data.name} untuk calon mahasiswa, orang tua, alumni, dan mitra Sistem Informasi UISI.
            </p>
            <div data-hero-fade className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic strength={0.25}>
                <a
                  href="#surat"
                  onClick={toLetter}
                  className="group inline-flex h-12 items-center gap-2 rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
                >
                  Baca sambutan
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5">
                    <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </Magnetic>
              <button
                type="button"
                onClick={openProfile}
                className="inline-flex h-12 items-center rounded-md border border-navy/25 bg-white px-6 text-[15px] font-semibold text-navy transition-[border-color,transform] duration-300 ease-cinematic hover:border-navy active:scale-[0.98]"
              >
                Profil lengkap
              </button>
            </div>
            {data.isPlaceholder && <PlaceholderTag className="mt-6" />}
            <LottieIllustration src="/lottie/lecturer.json" className="pointer-events-none absolute -bottom-20 right-4 hidden w-36 text-navy opacity-90 xl:block" />
          </div>

          <figure className="group relative mx-auto w-full max-w-[420px] lg:mx-0 lg:justify-self-end">
            <div data-parallax className="relative">
              <span data-frame aria-hidden className="absolute -right-4 -top-4 h-full w-full rounded-lg border-2 border-gold transition-transform duration-700 ease-cinematic group-hover:translate-x-1.5 group-hover:-translate-y-1.5" />
              <div data-photo className="relative aspect-[4/5] overflow-hidden rounded-lg bg-cream-2">
                <Image
                  src={data.photo}
                  alt={`${data.name}, ${data.role}`}
                  fill
                  priority
                  sizes="(min-width:1024px) 420px, 90vw"
                  className="object-cover object-top transition-transform duration-1000 ease-cinematic group-hover:scale-[1.03]"
                />
              </div>
              <figcaption
                data-namecard
                className="absolute -bottom-6 -left-4 max-w-[86%] rounded-lg border-t-[3px] border-gold bg-navy px-5 py-4 text-white shadow-[0_24px_50px_-20px_rgb(14_24_48/0.7)] sm:-left-8"
              >
                <p className="font-serif text-lg leading-tight">{data.name}</p>
                <p className="mt-1 text-[13px] text-white/70">{data.role}</p>
              </figcaption>
            </div>
            <div className="absolute -right-10 bottom-10 hidden lg:block">
              <div className="relative"><ElvoPeek pose="wave" size={92} say="Halo! Yuk baca pesan dari Kaprodi kami." delay={0.4} /></div>
            </div>
          </figure>
        </div>
      </Container>
    </section>
  );
}
