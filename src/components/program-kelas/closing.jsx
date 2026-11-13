"use client";
import { CONTACT_URL, PMB_URL } from "@/lib/home-content";
import { Container, PillLink, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { useKelas } from "./kelas-provider";

const NEXT = [
  { href: "/curiculum", title: "Kurikulum", body: "Daftar mata kuliah per semester." },
  { href: "/profil-lulusan", title: "Profil Lulusan", body: "Ke mana lulusan Sisfor berkarier." },
  { href: "/visi-misi", title: "Visi & Misi", body: "Arah yang sama untuk ketiga kelas." },
];

/**
 * Penutup "tiket": kartu ala boarding pass di tengah. Badan tiket maroon (judul, chip kelas, PMB),
 * sobekan putih di kanan (kontak sekretariat prodi), dipisah garis putus-putus berlekuk.
 * Tautan lanjutan sebaris teks di bawahnya.
 */
export function Closing() {
  const { classes, active, setActive } = useKelas();
  return (
    <section className="relative bg-cream py-16 md:py-20">
      <Container className="relative">
        <div className="absolute -top-12 right-10 z-10 hidden xl:block">
          <div className="relative"><ElvoPeek pose="run" size={76} side="left" say="Ayo, kursinya terbatas!" delay={0.2} /></div>
        </div>
        <div data-aos="fade-up" className="relative mx-auto flex max-w-5xl flex-col overflow-hidden rounded-xl shadow-[0_40px_80px_-50px_rgb(78_14_25/0.6)] md:flex-row">
          {/* badan tiket */}
          <div className="relative flex-1 bg-maroon p-7 text-white md:p-10">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="kicker text-gold-soft">PMB 2027 sudah dibuka · Sistem Informasi</p>
                <SceneTitle title={["Siap mulai", "kelasmu?"]} tone="dark" className="mt-3 !text-[clamp(2rem,4.2vw,3.25rem)]" />
              </div>
              <div className="hidden w-20 shrink-0 md:block" aria-hidden>
                <LottieIllustration src="/lottie/rocket-pmb-dark.json" />
              </div>
            </div>
            <ul className="mt-7 flex flex-wrap gap-2">
              {classes.map((c, i) => (
                <li key={c.key}>
                  <a
                    href="#kelas"
                    onClick={() => setActive(i, { hash: false })}
                    className={cn(
                      "inline-flex rounded-full border px-4 py-1.5 text-sm transition-colors duration-300 hover:border-gold hover:text-gold-soft",
                      i === active ? "border-gold bg-white/10 text-gold-soft" : "border-white/25 text-white/85"
                    )}
                  >
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <PillLink href={PMB_URL} variant="white" target="_blank" rel="noopener noreferrer">
                Daftar PMB 2027
              </PillLink>
              <p className="text-sm text-white/60">Kuota Kelas Karyawan & Kemitraan terbatas. Pilih kelasnya saat mengisi formulir.</p>
            </div>
          </div>

          {/* garis sobek */}
          <div aria-hidden className="relative h-0 border-t-2 border-dashed border-maroon/30 md:h-auto md:w-0 md:border-l-2 md:border-t-0">
            <span className="absolute -left-3 -top-3 size-6 rounded-full bg-cream md:-left-3 md:-top-3" />
            <span className="absolute -right-3 -top-3 size-6 rounded-full bg-cream md:-bottom-3 md:-left-3 md:right-auto md:top-auto" />
          </div>

          {/* sobekan */}
          <div className="relative flex flex-col justify-between gap-6 bg-white p-7 md:w-[300px] md:p-8">
            <div>
              <p className="kicker text-maroon">Masih ragu?</p>
              <p className="mt-2 font-serif text-[1.35rem] leading-snug text-navy">Tanyakan langsung ke sekretariat prodi soal jadwal, kuota, atau beasiswa.</p>
            </div>
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-md border border-navy/25 px-5 text-[15px] font-semibold text-navy transition-[border-color,background-color] duration-300 hover:border-gold hover:bg-gold/10"
            >
              Hubungi prodi
              <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5">
                <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        {/* tautan lanjutan sebaris */}
        <ul className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
          {NEXT.map((n, i) => (
            <li key={n.href} data-aos="fade-up" data-aos-delay={i * 70}>
              <a href={n.href} className="group block">
                <span className="inline-flex items-center gap-2 font-serif text-[1.25rem] text-navy">
                  <span className="u-gold">{n.title}</span>
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4 text-maroon transition-transform duration-500 ease-cinematic group-hover:translate-x-1">
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="mt-1 block text-sm text-text/60">{n.body}</span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
