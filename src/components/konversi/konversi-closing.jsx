"use client";
import { useRef } from "react";
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { useKonversi } from "./konversi-provider";

/** Pola Aceternity "Moving Border", versi kampus: satu keping emas solid mengelilingi tombol (tanpa gradien). */
function OrbitButton({ href, children }) {
  const rect = useRef(null);
  const reduce = useReducedMotion();
  const progress = useMotionValue(0);
  useAnimationFrame((t) => {
    if (reduce) return;
    const len = rect.current?.getTotalLength();
    if (len) progress.set((t * (len / 4200)) % len);
  });
  const x = useTransform(progress, (v) => rect.current?.getPointAtLength(v).x ?? 0);
  const y = useTransform(progress, (v) => rect.current?.getPointAtLength(v).y ?? 0);
  const transform = useMotionTemplate`translate(${x}px, ${y}px) translate(-50%, -50%)`;
  return (
    <a href={href} className="group relative inline-flex h-12 overflow-hidden rounded-md p-[2px]">
      <span aria-hidden className="absolute inset-0 rounded-md bg-maroon-deep" />
      <svg aria-hidden className="absolute inset-0 size-full" preserveAspectRatio="none">
        <rect ref={rect} width="100%" height="100%" rx="6" fill="none" />
      </svg>
      {!reduce && <motion.span aria-hidden style={{ transform }} className="absolute left-0 top-0 h-3 w-12 rounded-full bg-gold" />}
      <span className="relative flex items-center gap-2 rounded-[5px] bg-maroon px-6 text-[15px] font-semibold text-white transition-colors duration-300 group-hover:bg-maroon-deep">
        {children}
        <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5">
          <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}

/**
 * Penutup: ajakan ke koordinator MBKM (tombol orbit) + tiga tautan lanjutan editorial.
 * Tautan pertama mengikuti kegiatan di meja (magang → halaman Magang; lainnya → Kurikulum). Tanpa CTA PMB.
 */
export function KonversiClosing() {
  const { program, credits } = useKonversi();
  const links = [
    program.key === "magang"
      ? { href: "/magang#lowongan", kicker: "Belum punya tempat?", title: "Cari lowongan magang" }
      : { href: "/curiculum", kicker: "Sebelum memilih", title: "Pelajari isi mata kuliahnya" },
    { href: "/bidang-keahlian", kicker: "Supaya searah", title: "Pilih kegiatan sesuai peminatanmu" },
    { href: "/jalur-kelulusan", kicker: "Kegiatanmu berbuah karya?", title: "Jadikan jalur kelulusan" },
  ];

  return (
    <section className="relative border-t border-line bg-cream pb-20 pt-16 md:pb-20 md:pt-20 lg:pt-20">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="relative overflow-hidden rounded-xl bg-maroon p-7 text-white sm:p-9">
          <LottieIllustration src="/lottie/credit-swap-dark.json" className="pointer-events-none absolute -right-6 -top-6 hidden size-44 opacity-90 sm:block" />
          <SceneTitle tone="dark" title={["Bawa strukmu", "ke koordinator"]} className="max-w-[14ch]" />
          <p className="mt-4 max-w-md text-pretty text-[15.5px] leading-relaxed text-white/75">
            {credits > 0
              ? `Simulasimu: ${credits} SKS dari ${program.label.toLowerCase()}. Koordinator MBKM memeriksa kecocokan mata kuliahnya sebelum Learning Agreement dibuat.`
              : "Koordinator MBKM membantu memilih kegiatan dan mata kuliah yang cocok sebelum Learning Agreement dibuat."}
          </p>
          <div className="mt-7">
            <OrbitButton href="#kontak">Hubungi koordinator MBKM</OrbitButton>
          </div>
        </div>

        <ul className="relative border-b border-line">
          <li className="pointer-events-none absolute -top-[112px] right-6 hidden list-none lg:block">
            <span className="relative block"><ElvoPeek pose="confident" size={92} side="left" say="Satu struk rapi menghemat satu kali bolak-balik." /></span>
          </li>
          {links.map((l, i) => (
            <li key={l.title} className="border-t border-line" data-aos="fade-up" data-aos-delay={i * 80}>
              <a href={l.href} className="group flex items-center gap-5 py-6">
                <span className="min-w-0 flex-1">
                  <span className="kicker block text-[11px] text-maroon">{l.kicker}</span>
                  <span className="mt-1.5 block font-serif text-[clamp(1.3rem,2.2vw,1.75rem)] leading-tight text-navy transition-transform duration-500 ease-cinematic group-hover:translate-x-1.5">{l.title}</span>
                </span>
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-maroon transition-[background-color,border-color,color,transform] duration-500 ease-cinematic group-hover:-rotate-45 group-hover:border-maroon group-hover:bg-maroon group-hover:text-white">
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4">
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
