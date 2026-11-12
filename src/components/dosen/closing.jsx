"use client";
import { CONTACT_URL } from "@/lib/home-content";
import { Container, PillLink } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";

const NEXT = [
  { href: "/struktur-organisasi", kicker: "Profil", title: "Struktur Organisasi", body: "Pimpinan prodi dan Minilab Sistem Informasi." },
  { href: "/curiculum", kicker: "Akademik", title: "Kurikulum", body: "Mata kuliah yang diampu para dosen." },
  { href: "/achievement", kicker: "Profil", title: "Prestasi", body: "Capaian dosen dan mahasiswa." },
  { href: "/sambutan-kaprodi", kicker: "Profil", title: "Sambutan Kaprodi", body: "Pandangan kaprodi tentang pendidikan Sisfor." },
];

const WAYS = ["Riset bersama", "Narasumber", "Magang", "Proyek industri"];

/**
 * Penutup "panel kolaborasi": kiri kartu cream-2 besar (ajakan kolaborasi + cara kerja sama + tombol
 * emas), kanan tiga tautan lanjutan bertumpuk dengan panah melingkar. Elvo `thumbs-up`.
 */
export function Closing() {
  return (
    <section className="relative py-16 md:py-24">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:gap-8">
          <div data-aos="fade-up" className="relative rounded-xl border border-line bg-cream-2 p-7 md:p-10">
            <span aria-hidden className="block h-[3px] w-10 bg-gold" />
            <p className="mt-5 font-serif text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.1] text-navy">
              Ingin berkolaborasi dengan <em className="italic text-maroon">dosen kami?</em>
            </p>
            <p className="mt-4 max-w-xl text-pretty text-[16px] leading-relaxed text-text/65">
              Sekretariat prodi akan menghubungkan Anda dengan dosen yang tepat untuk kebutuhan Anda.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {WAYS.map((w) => (
                <li key={w} className="rounded-full border border-navy/15 bg-cream px-3.5 py-1 text-[13px] text-navy/80">
                  {w}
                </li>
              ))}
            </ul>
            <PillLink href={CONTACT_URL} variant="gold" target="_blank" rel="noopener noreferrer" className="mt-8">
              Hubungi prodi
            </PillLink>
            <div className="absolute -top-14 right-8 hidden lg:block">
              <div className="relative"><ElvoPeek pose="thumbs-up" size={76} side="left" say="Dosennya ramah, kok!" delay={0.2} /></div>
            </div>
          </div>

          <ul className="flex flex-col gap-3">
            {NEXT.map((n, i) => (
              <li key={n.href} data-aos="fade-up" data-aos-delay={i * 80} className="flex-1">
                <a
                  href={n.href}
                  className="group flex h-full items-center gap-5 rounded-xl border border-line bg-white px-6 py-5 transition-[border-color,box-shadow] duration-500 ease-cinematic hover:border-navy/20 hover:shadow-[0_24px_50px_-36px_rgb(20_33_61/0.55)]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="inline-block rounded bg-maroon/8 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-maroon">{n.kicker}</span>
                    <span className="mt-2 block font-serif text-[1.3rem] leading-tight text-navy">{n.title}</span>
                    <span className="mt-0.5 block text-sm text-text/60">{n.body}</span>
                  </span>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-navy/20 text-navy transition-[background-color,border-color,color,transform] duration-500 ease-cinematic group-hover:-rotate-45 group-hover:border-maroon group-hover:bg-maroon group-hover:text-white">
                    <svg aria-hidden viewBox="0 0 16 16" className="size-4">
                      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
