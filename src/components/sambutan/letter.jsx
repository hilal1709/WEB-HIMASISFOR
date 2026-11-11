"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { animate } from "animejs";
import { gsap, ScrollTrigger } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { PMB_URL } from "@/lib/home-content";
import { Banner } from "@/components/ui/banner";
import { ArrowLink, Container } from "@/components/home/shared";
import { LordIcon } from "@/components/media/lord-icon";
import { useProfileModal } from "./profile-modal";

/** Tanda tangan bergaya tulisan tangan (dekoratif), digambar dengan anime.js. */
const SIGNATURE = [
  "M6 58c10-22 22-44 30-48 6-3 4 14-2 30-5 13-9 22-6 22 6 0 18-30 26-30 5 0 0 18 4 18s10-14 16-14c4 0 2 10 6 10 6 0 12-16 20-16",
  "M108 44c-4 8-6 16 0 16 8 0 14-22 22-22-6 0-8 20 0 20 6 0 10-10 14-18 2 10 2 18 8 18 8 0 16-26 26-26",
  "M60 74c40-6 90-10 140-8",
];

const SECTIONS = ["Salam pembuka", "Tentang kami", "Pesan Kaprodi", "Penutup"];

/**
 * Surat editorial dua kolom. Kiri (sticky di lg): potret kecil, progress baca, tombol profil.
 * Kanan: banner pengumuman, drop cap, paragraf, pull quote yang "menyala" kata demi kata saat di-scroll,
 * penutup dengan tanda tangan tergambar.
 */
export function Letter({ data }) {
  const ref = useRef(null);
  const quote = useRef(null);
  const sign = useRef(null);
  const openProfile = useProfileModal();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-progress]",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-article]", start: "top 60%", end: "bottom 70%", scrub: 0.4 } }
      );
      if (reduce) return;
      gsap.fromTo(
        quote.current.querySelectorAll("[data-w]"),
        { opacity: 0.16 },
        { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: quote.current, start: "top 80%", end: "bottom 45%", scrub: 0.6 } }
      );
    }, el);

    // tanda tangan: sembunyikan lewat dash, lalu gambar saat terlihat
    let anim;
    const paths = reduce ? [] : [...(sign.current?.querySelectorAll("path") ?? [])];
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });
    const st = paths.length
      ? ScrollTrigger.create({
          trigger: sign.current,
          start: "top 88%",
          once: true,
          onEnter: () => {
            anim = animate(paths, { strokeDashoffset: 0, duration: 1400, delay: (_, i) => i * 380, ease: "inOutQuad" });
          },
        })
      : null;
    return () => {
      ctx.revert();
      st?.kill();
      anim?.revert?.();
    };
  }, []);

  const [first, ...rest] = data.paragraphs;
  const mid = Math.ceil(rest.length / 2);

  return (
    <section id="surat" ref={ref} className="scroll-mt-24 border-t border-line bg-white py-16 md:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-20">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex items-center gap-4 lg:flex-col lg:items-start">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-cream-2 lg:size-20">
                <Image src={data.photo} alt="" fill sizes="80px" className="object-cover object-top" />
              </div>
              <div>
                <p className="font-serif text-lg leading-tight text-navy">{data.name}</p>
                <p className="mt-1 text-[13px] text-text/60">{data.role}</p>
              </div>
            </div>

            <div className="mt-8 hidden gap-4 lg:flex">
              <span className="relative block h-40 w-[2px] overflow-hidden rounded-full bg-line">
                <span data-progress className="absolute inset-0 origin-top bg-gold" />
              </span>
              <ol className="flex flex-col justify-between py-1 text-[13px] text-text/55">
                {SECTIONS.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openProfile}
                className="profile-btn inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 text-sm font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-navy-deep active:scale-[0.98]"
              >
                <LordIcon name="account" size={20} target=".profile-btn" colors="primary:#ffffff,secondary:#e0c56a" />
                Profil
              </button>
            </div>
          </aside>

          <article data-article className="min-w-0 max-w-[68ch]">
            <Banner
              variant="brand"
              dismissible
              title="Pendaftaran mahasiswa baru telah dibuka"
              action={
                <ArrowLink href={PMB_URL} tone="dark" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex">
                  Daftar
                </ArrowLink>
              }
              className="mb-12"
            >
              Bergabunglah bersama Sisforians angkatan berikutnya.
            </Banner>

            <p data-aos="fade-up" className="font-serif text-[1.45rem] italic leading-snug text-maroon">
              {data.greeting}
            </p>

            <div className="mt-8 space-y-6 text-[17.5px] leading-[1.8] text-text/80">
              <p
                data-aos="fade-up"
                className="first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-[4.2rem] first-letter:leading-[0.85] first-letter:text-maroon"
              >
                {first}
              </p>
              {rest.slice(0, mid).map((p, i) => (
                <p key={i} data-aos="fade-up">
                  {p}
                </p>
              ))}
            </div>

            <figure ref={quote} className="relative my-14 border-y border-line py-12 md:my-16 md:py-14">
              <span aria-hidden className="absolute -top-7 left-0 bg-white pr-4 font-serif text-[5.5rem] leading-none text-gold">
                &ldquo;
              </span>
              <blockquote className="font-serif text-[clamp(1.6rem,3vw,2.35rem)] leading-[1.25] text-navy">
                {data.quote.split(" ").map((w, i) => (
                  <span key={i} data-w>
                    {w}{" "}
                  </span>
                ))}
              </blockquote>
              <figcaption className="mt-6 text-sm text-text/55">— {data.name}</figcaption>
            </figure>

            <div className="space-y-6 text-[17.5px] leading-[1.8] text-text/80">
              {rest.slice(mid).map((p, i) => (
                <p key={i} data-aos="fade-up">
                  {p}
                </p>
              ))}
              <p data-aos="fade-up" className="font-serif text-[1.2rem] italic text-maroon">
                {data.closing}
              </p>
            </div>

            <footer className="mt-12">
              <p className="text-sm text-text/60">Salam hangat,</p>
              <svg ref={sign} viewBox="0 0 210 84" aria-hidden className="mt-2 h-20 w-auto text-navy">
                {SIGNATURE.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    fill="none"
                    stroke={i === 2 ? "var(--gold)" : "currentColor"}
                    strokeWidth={i === 2 ? 1.4 : 2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
              </svg>
              <p className="mt-2 font-serif text-xl text-navy">
                {data.name}
                {data.credentials ? `, ${data.credentials}` : ""}
              </p>
              <p className="text-sm text-text/60">{data.role}</p>
            </footer>
          </article>
        </div>
      </Container>
    </section>
  );
}
