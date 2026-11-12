"use client";
import { CONTACT_URL, PMB_URL } from "@/lib/home-content";
import { Container, PillLink, SceneTitle } from "@/components/home/shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";

const NEXT = [
  { href: "/dosen", title: "Dosen", body: "Para pembimbing di balik capaian mahasiswa." },
  { href: "/profil-lulusan", title: "Profil Lulusan", body: "Ke mana prestasi itu membawa alumni." },
  { href: "/curiculum", title: "Kurikulum", body: "Mata kuliah yang menyiapkan kompetisi." },
];

/**
 * Penutup rata tengah: medali Lottie, ajakan "Prestasi berikutnya bisa milikmu", tombol PMB +
 * tautan lapor prestasi, lalu tautan lanjutan sebagai deretan pil.
 */
export function Closing() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <span aria-hidden className="pointer-events-none absolute left-1/2 top-10 size-[520px] -translate-x-1/2 rounded-full border border-gold/20" />
      <Container className="relative">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="w-28 md:w-32" aria-hidden>
            <LottieIllustration src="/lottie/medal.json" />
          </div>
          <SceneTitle title={["Prestasi berikutnya", "bisa milikmu"]} align="center" className="mt-2 !text-[clamp(2.1rem,4.6vw,3.6rem)]" />
          <p data-aos="fade-up" className="mt-4 text-pretty text-[16.5px] leading-relaxed text-text/65">
            Ikuti jejak para peraih prestasi Sistem Informasi UISI. Mulai perjalananmu dari sini.
          </p>
          <div data-aos="fade-up" data-aos-delay="80" className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <PillLink href={PMB_URL} target="_blank" rel="noopener noreferrer">
              Daftar PMB 2027
            </PillLink>
            <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer" className="text-[15px] font-semibold text-navy">
              <span className="u-gold">Baru juara? Laporkan prestasimu</span>
            </a>
          </div>
        </div>

        <ul className="mt-14 flex flex-wrap justify-center gap-3">
          {NEXT.map((n, i) => (
            <li key={n.href} data-aos="fade-up" data-aos-delay={i * 70}>
              <a
                href={n.href}
                title={n.body}
                className="group inline-flex items-center gap-3 rounded-full border border-line bg-white py-2 pl-5 pr-2 transition-[border-color,box-shadow] duration-500 ease-cinematic hover:border-maroon/30 hover:shadow-[0_18px_40px_-28px_rgb(78_14_25/0.55)]"
              >
                <span className="font-serif text-[1.1rem] text-navy">{n.title}</span>
                <span className="grid size-8 place-items-center rounded-full bg-cream-2 text-maroon transition-[background-color,color] duration-500 group-hover:bg-maroon group-hover:text-white">
                  <svg aria-hidden viewBox="0 0 16 16" className="size-3.5">
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
