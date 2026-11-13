"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { ADDRESS, CURTAIN_KEY } from "@/lib/kontak-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { Postmark, PostWaves } from "./postmark";
import { smoothTo, useKontak } from "./kontak-provider";

const [street, ...rest] = ADDRESS.split(", Jl. ");
const addressLines = ["Program Studi Sistem Informasi", street, `Jl. ${rest.join(", Jl. ")}`];

/**
 * Hero "amplop": seluruh hero adalah satu amplop. Judul + intro ditulis di kiri atas (tempat pesan), perangko + cap
 * pos di kanan atas, aksi "Mulai menulis" di kiri bawah, alamat tujuan prodi di kanan bawah (baris demi baris).
 * Peta urusan → meja ada di papan sambung tepat di bawahnya, jadi tidak diulang di sini. Tanpa ilustrasi garis.
 */
export function PostcardHero() {
  const { intro } = useKontak();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const delay = curtainDelay(CURTAIN_KEY);
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay });
      gsap.fromTo("[data-envelope]", { y: 50, rotate: -1.5, opacity: 0 }, { y: 0, rotate: 0, opacity: 1, duration: 1.2, ease: "expo.out", delay: delay + 0.15, clearProps: "transform,opacity" });
      gsap.fromTo("[data-addr]", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.9, stagger: 0.25, ease: "power2.inOut", delay: delay + 0.7 });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden pb-10 pt-10 md:pb-14 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li>Layanan</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Kontak</li>
          </ol>
        </nav>

        {/* amplop = hero: pesan di kiri atas, perangko kanan atas, alamat tujuan kanan bawah, aksi kiri bawah */}
        <div data-envelope className="relative mt-8 lg:mt-10">
          <span aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 rotate-[0.6deg] rounded-md bg-cream-2" />
          <div className="relative overflow-hidden rounded-md border border-line bg-white shadow-[0_40px_80px_-50px_rgb(20_33_61/0.55)]">
            <span aria-hidden className="block h-2.5 w-full [background:repeating-linear-gradient(135deg,var(--maroon)_0_14px,transparent_14px_28px,var(--navy)_28px_42px,transparent_42px_56px)] opacity-80" />
            <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.25fr_0.75fr] lg:grid-rows-[auto_auto] lg:gap-x-14 lg:gap-y-12 lg:p-12">
              {/* pesan (kiri atas) */}
              <div className="lg:col-start-1 lg:row-start-1">
                <SceneTitle as="h1" trigger="mount" title={["Satu surat,", "sampai ke meja yang tepat"]} className="!text-[clamp(2.3rem,4.6vw,4.2rem)] !leading-[1.02]" />
                <p data-hero-fade className="mt-5 max-w-xl text-pretty text-[16.5px] leading-relaxed text-text/70">{intro.body}</p>
              </div>

              {/* perangko + cap (kanan atas) */}
              <div className="relative order-first flex justify-end lg:order-none lg:col-start-2 lg:row-start-1 lg:items-start">
                <span className="kt-perf relative grid h-[104px] w-[86px] place-items-center bg-maroon text-gold-soft">
                  <span className="font-serif text-3xl italic leading-none">Si</span>
                  <span className="absolute bottom-2 text-[9px] font-bold tracking-[0.18em]">UISI</span>
                </span>
                <span className="absolute right-14 top-6">
                  <Postmark spin className="size-[116px] opacity-80" />
                </span>
                <PostWaves className="absolute right-24 top-32 hidden h-6 w-32 sm:block" />
              </div>

              {/* aksi (kiri bawah) */}
              <div data-hero-fade className="flex flex-wrap items-end gap-x-7 gap-y-4 lg:col-start-1 lg:row-start-2">
                <button
                  type="button"
                  onClick={() => smoothTo("papan-sambung")}
                  className="group inline-flex h-12 items-center gap-3 rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
                >
                  Mulai menulis
                  <svg aria-hidden viewBox="0 0 20 20" className="size-4 transition-transform duration-500 ease-cinematic group-hover:-rotate-12 group-hover:translate-x-0.5">
                    <path d="M3 10l14-6-5 14-2.5-5.5z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  </svg>
                </button>
                <button type="button" onClick={() => smoothTo("lokasi")} className="text-[15px] font-semibold text-navy">
                  <span className="u-gold">Datang ke kampus</span>
                </button>
              </div>

              {/* alamat tujuan (kanan bawah) */}
              <div className="lg:col-start-2 lg:row-start-2">
                <p className="font-serif text-[15px] italic text-maroon">Kepada Yth.</p>
                <ul className="mt-2 space-y-2.5 font-serif text-[clamp(1.05rem,1.6vw,1.25rem)] leading-snug text-navy">
                  {addressLines.map((l) => (
                    <li key={l} data-addr className="border-b border-navy/15 pb-1.5">{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -top-20 right-40 z-10 hidden xl:block">
            <div className="relative"><ElvoPeek pose="wave" size={80} side="left" say="Tulis saja, aku antar sampai mejanya." delay={0.4} /></div>
          </div>
        </div>
      </Container>
    </section>
  );
}
