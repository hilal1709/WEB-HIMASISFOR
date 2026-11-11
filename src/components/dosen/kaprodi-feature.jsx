"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { ArrowLink, Container } from "@/components/home/shared";
import { useDosen } from "./dosen-provider";

/**
 * Sorotan Kaprodi (satu-satunya band maroon di isi halaman): potret terbuka lewat clip-path saat
 * masuk layar (GSAP), kutipan serif, keahlian, tautan ke sambutan & profil lengkap (modal).
 */
export function KaprodiFeature() {
  const { lecturers, openProfile } = useDosen();
  const k = lecturers.find((l) => l.key === "kaprodi") ?? lecturers[0];
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-clip]",
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 75%" } }
      );
      gsap.fromTo("[data-clip] img", { scale: 1.2 }, { scale: 1, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 75%" } });
    }, el);
    return () => ctx.revert();
  }, []);

  if (!k) return null;
  return (
    <section ref={ref} className="relative overflow-hidden bg-maroon py-16 text-white md:py-24">
      <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full border border-white/10" />
      <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 size-[260px] rounded-full border border-gold/25" />
      <Container className="relative grid items-center gap-10 md:grid-cols-[320px_1fr] lg:grid-cols-[380px_1fr] lg:gap-16">
        <div data-clip className="relative mx-auto aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-lg bg-maroon-deep md:max-w-none">
          {k.photo && <Image src={k.photo} alt={k.name} fill sizes="(min-width:1024px) 380px, 320px" className="object-cover object-top" />}
          <span className="absolute inset-x-0 bottom-0 bg-navy/90 px-5 py-3.5">
            <span className="kicker block text-gold-soft">{k.role}</span>
            <span className="mt-0.5 block text-sm font-medium">{k.name}</span>
          </span>
        </div>
        <div>
          <span aria-hidden data-aos="fade-up" className="block font-serif text-[5rem] leading-[0.6] text-gold">“</span>
          <blockquote data-aos="fade-up" data-aos-delay="80" className="mt-4 text-balance font-serif text-[clamp(1.6rem,3.2vw,2.6rem)] leading-[1.15]">
            {k.quote ?? "Dosen kami mengajar dari pengalaman nyata di industri."}
          </blockquote>
          <p data-aos="fade-up" data-aos-delay="140" className="mt-6 text-[15px] text-white/70">
            {k.name}, {k.credentials}
          </p>
          <ul data-aos="fade-up" data-aos-delay="180" className="mt-6 flex flex-wrap gap-2">
            {k.expertise.map((x) => (
              <li key={x} className="rounded-full border border-white/25 px-3.5 py-1 text-[13px] text-white/85 transition-colors duration-300 hover:border-gold hover:text-gold-soft">{x}</li>
            ))}
          </ul>
          <div data-aos="fade-up" data-aos-delay="220" className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <button type="button" onClick={() => openProfile(k.slug)} className="group inline-flex items-center gap-2 text-sm font-semibold text-white">
              <span className="u-gold">Profil lengkap</span>
              <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:rotate-45">
                <path d="M5 11l6-6M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <ArrowLink href="/sambutan-kaprodi" tone="dark">Baca sambutan Kaprodi</ArrowLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
