"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/scroll";
import { countUp, prefersReducedMotion } from "@/lib/motion";
import { ACCREDITATION, HERO, ABOUT } from "@/lib/home-content";
import { Modal, ModalTrigger, ModalContent, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { Container, PlaceholderTag, SectionHeader } from "./shared";

const LECTURERS = ["ardhi", "brina", "catur", "grandys", "putri", "tikno"];

/**
 * Bento "Sekilas Prodi" (pola 21st.dev bento + tile horizonx).
 * Tile naik berurutan (GSAP), miring halus mengikuti kursor, angka dihitung naik (anime.js).
 */
export function BentoScene() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (!prefersReducedMotion()) {
        gsap.from(el.querySelectorAll("[data-tile]"), {
          y: 70,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: el.querySelector("[data-grid]"), start: "top 85%", once: true },
        });
      }
      ScrollTrigger.create({
        trigger: el.querySelector("[data-grid]"),
        start: "top 75%",
        once: true,
        onEnter: () =>
          el.querySelectorAll("[data-count]").forEach((n) =>
            countUp(n, Number(n.dataset.count), { duration: 1800, format: (v) => String(v) })
          ),
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="sekilas" className="py-12 md:py-20">
      <Container>
        <SectionHeader eyebrow="Sekilas Prodi" title={["Belajar sistem informasi di", "jantung kawasan industri"]} body={ABOUT.body[1]} />

        <div data-grid className="mt-10 grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-4 md:mt-12 md:grid-cols-12 md:gap-5">
          {/* Akreditasi — tile gelap besar */}
          <Tile className="grain relative flex flex-col justify-between overflow-hidden bg-primary p-7 text-white md:col-span-7 md:row-span-2 md:p-10" dark>
            <div className="flex items-start justify-between gap-6">
              <span className="text-[13px] font-medium text-white/75">Akreditasi {ACCREDITATION.issuer}</span>
              <Modal>
                <ModalTrigger data-cursor="Lihat" className="group/cert relative w-28 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/15 md:w-36" aria-label="Lihat sertifikat akreditasi">
                  <Image src={ACCREDITATION.certificate} alt="Sertifikat akreditasi" width={1151} height={762} className="h-auto w-full transition-transform duration-700 ease-cinematic group-hover/cert:scale-110" />
                </ModalTrigger>
                <ModalContent className="max-w-3xl p-3 sm:p-4">
                  <ModalTitle className="sr-only">Sertifikat akreditasi {ACCREDITATION.issuer}</ModalTitle>
                  <ModalDescription className="sr-only">{ACCREDITATION.body}</ModalDescription>
                  <Image src={ACCREDITATION.certificate} alt="Sertifikat akreditasi LAM INFOKOM" width={1151} height={762} className="h-auto w-full rounded-lg" />
                </ModalContent>
              </Modal>
            </div>
            <div className="mt-16">
              <p className="display-xl text-[clamp(3.25rem,7vw,6rem)]">{ACCREDITATION.grade}</p>
              <dl className="mt-8 grid gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-sm sm:grid-cols-2">
                {ACCREDITATION.rows.slice(0, 2).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-white/45">{k}</dt>
                    <dd className="mt-1 font-medium text-white/90">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Tile>

          {/* ERP Lottie */}
          <Tile className="flex items-center gap-5 bg-brand-deep p-6 text-white md:col-span-5" dark>
            <LottieIllustration src="/lottie/erp-nodes.json" className="w-32 shrink-0 md:w-36" />
            <div>
              <p className="text-[13px] font-medium text-white/55">Keunggulan khas</p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em]">Kurikulum berbasis ERP</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">Proses bisnis Semen Indonesia Group dibawa langsung ke kelas lewat SAP.</p>
            </div>
          </Tile>

          {/* Angka */}
          <Tile className="grid grid-cols-3 divide-x divide-hairline bg-tile p-0 md:col-span-5">
            {[
              { v: 2014, l: "Tahun berdiri" },
              { v: 4, l: "Bidang keahlian" },
              { v: 8, l: "Semester" },
            ].map((s) => (
              <div key={s.l} className="flex flex-col justify-end p-5 md:p-6">
                <span data-count={s.v} className="display-xl tabular text-[clamp(2rem,3.4vw,3rem)] text-night">
                  {s.v}
                </span>
                <span className="mt-2 text-xs text-night/55">{s.l}</span>
              </div>
            ))}
          </Tile>

          {/* Foto kampus */}
          <Tile className="relative min-h-[320px] overflow-hidden bg-tile-muted p-0 md:col-span-4 md:row-span-2" cursor="Kampus">
            <Image src="/plates/campus.webp" alt="Ilustrasi kampus UISI di Gresik" fill sizes="(min-width:768px) 400px, 100vw" className="object-cover transition-transform duration-1000 ease-cinematic group-hover/tile:scale-[1.06]" />
            <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1.5 text-xs font-medium text-night backdrop-blur-md">Kampus Gresik, Jawa Timur</span>
          </Tile>

          {/* Dosen */}
          <Tile className="flex flex-col justify-between bg-tile p-6 md:col-span-4">
            <div className="flex -space-x-3">
              {LECTURERS.map((n, i) => (
                <span key={n} className="relative size-12 overflow-hidden rounded-full ring-[3px] ring-tile transition-transform duration-500 ease-cinematic group-hover/tile:translate-y-[-4px]" style={{ transitionDelay: `${i * 40}ms` }}>
                  <Image src={`/img/profil/${n}.jpg`} alt="" fill sizes="48px" className="object-cover" />
                </span>
              ))}
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-semibold tracking-[-0.02em] text-night">Dosen praktisi & peneliti</h3>
              <p className="mt-2 text-sm leading-relaxed text-night/60">Bersertifikat dan aktif meneliti di tingkat nasional hingga internasional.</p>
            </div>
          </Tile>

          {/* Mitra — marquee vertikal */}
          <Tile className="relative overflow-hidden bg-tile p-6 md:col-span-4 md:row-span-2">
            <p className="text-[13px] font-medium text-night/55">Jejaring mitra industri</p>
            <PlaceholderTag className="mt-2" />
            <div className="marquee-col mt-6 h-[300px] overflow-hidden">
              <div className="marquee-y flex flex-col gap-3" style={{ "--dur": "26s" }}>
                {[...HERO.partners, ...HERO.partners].map((p, i) => (
                  <span key={i} aria-hidden={i >= HERO.partners.length || undefined} className="flex h-14 shrink-0 items-center justify-center rounded-2xl bg-canvas px-4 grayscale transition hover:grayscale-0">
                    {p.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.logo} alt={p.name} className="h-6 w-auto max-w-[140px] object-contain opacity-70" loading="lazy" />
                    ) : (
                      <span className="font-display text-lg font-semibold tracking-[-0.02em] text-night/70">{p.name}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </Tile>

          {/* Lulusan */}
          <Tile className="flex items-center gap-5 bg-tile p-6 md:col-span-4">
            <LottieIllustration src="/lottie/grad-path.json" className="w-28 shrink-0" />
            <div>
              <h3 className="text-xl font-semibold tracking-[-0.02em] text-night">Lulusan siap kerja</h3>
              <p className="mt-2 text-sm leading-relaxed text-night/60">Konsultan ERP, system analyst, IT auditor, hingga data analyst.</p>
            </div>
          </Tile>
        </div>
      </Container>
    </section>
  );
}

/** Tile bento: miring halus mengikuti kursor (desktop), bayangan lembut. */
function Tile({ className, children, dark, cursor }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, { rotateY: px * 5, rotateX: -py * 5, duration: 0.6, ease: "power3.out", transformPerspective: 1200 });
  };
  const reset = () => gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.9, ease: "elastic.out(1, 0.6)" });
  return (
    <div
      ref={ref}
      data-tile
      data-cursor={cursor}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cn(
        "group/tile rounded-[28px] border shadow-tile will-change-transform",
        dark ? "border-white/5" : "border-hairline",
        className
      )}
    >
      {children}
    </div>
  );
}
