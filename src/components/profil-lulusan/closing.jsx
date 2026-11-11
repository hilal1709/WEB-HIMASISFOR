"use client";
import { PMB_URL } from "@/lib/home-content";
import { Container, PillLink, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";

const NEXT = [
  { href: "/curiculum", kicker: "Akademik", title: "Kurikulum", body: "Mata kuliah yang membentuk tiap profil." },
  { href: "/visi-misi", kicker: "Profil", title: "Visi & Misi", body: "Arah program studi menuju 2030." },
  { href: "/sambutan-kaprodi", kicker: "Profil", title: "Sambutan Kaprodi", body: "Pesan dari ketua program studi." },
];

/**
 * Penutup band maroon full-bleed: "Mau jadi yang mana?" + chip jabatan + tombol PMB,
 * lalu tautan lanjutan sebagai daftar baris berpemisah garis.
 */
export function Closing({ roles = [] }) {
  const chips = roles.slice(0, 9);
  return (
    <>
      <section className="relative overflow-hidden bg-maroon py-16 text-white md:py-24">
        <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full border border-white/10" />
        <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 size-[260px] rounded-full border border-gold/25" />
        <Container className="relative">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <SceneTitle title={["Mau jadi", "yang mana?"]} tone="dark" className="!text-[clamp(2.25rem,5vw,4rem)]" />
              {chips.length > 0 && (
                <ul className="mt-8 flex max-w-3xl flex-wrap gap-2.5">
                  {chips.map((r, i) => (
                    <li
                      key={r}
                      data-aos="fade-up"
                      data-aos-delay={i * 40}
                      className="rounded-full border border-white/25 px-4 py-1.5 text-sm text-white/85 transition-colors duration-300 hover:border-gold hover:text-gold-soft"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <PillLink href={PMB_URL} variant="white" target="_blank" rel="noopener noreferrer">
                Daftar PMB 2027
              </PillLink>
              <p className="text-sm text-white/60">Mulai jalur kariermu sebagai Sisforians berikutnya.</p>
            </div>
          </div>
          <div className="absolute -top-10 right-8 hidden xl:block">
            <div className="relative"><ElvoPeek pose="thumbs-up" size={84} tone="dark" say="Sudah tahu mau jadi apa? Cek kurikulumnya!" delay={0.2} /></div>
          </div>
        </Container>
      </section>

      <section className="bg-cream py-12 md:py-16">
        <Container>
          <ul className="divide-y divide-line border-y border-line">
            {NEXT.map((n, i) => (
              <li key={n.href} data-aos="fade-up" data-aos-delay={i * 70}>
                <a href={n.href} className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-5 md:grid-cols-[140px_1fr_1.2fr_auto] md:py-6">
                  <p className="kicker text-maroon md:order-none">{n.kicker}</p>
                  <p className="col-start-1 font-serif text-[1.4rem] leading-tight text-navy md:col-start-auto">
                    <span className="u-gold">{n.title}</span>
                  </p>
                  <p className="col-start-1 text-sm text-text/60 md:col-start-auto">{n.body}</p>
                  <svg aria-hidden viewBox="0 0 16 16" className="col-start-2 row-span-3 row-start-1 size-5 text-maroon transition-transform duration-500 ease-cinematic group-hover:translate-x-1.5 md:col-start-auto md:row-span-1 md:row-start-auto">
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
