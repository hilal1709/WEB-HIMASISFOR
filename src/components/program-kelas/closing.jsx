"use client";
import { PMB_URL } from "@/lib/home-content";
import { Container, PillLink, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { useKelas } from "./kelas-provider";

const NEXT = [
  { href: "/curiculum", kicker: "Akademik", title: "Kurikulum", body: "144 SKS yang sama untuk semua kelas." },
  { href: "/profil-lulusan", kicker: "Profil", title: "Profil Lulusan", body: "Ke mana lulusan Sisfor berkarier." },
  { href: "/visi-misi", kicker: "Profil", title: "Visi & Misi", body: "Arah program studi menuju 2030." },
];

/** Penutup band maroon: "Siap mulai kelasmu?" + chip kelas (pilih → gulir ke switcher) + PMB, lalu tautan lanjutan. */
export function Closing() {
  const { classes, active, setActive } = useKelas();
  return (
    <>
      <section className="relative overflow-hidden bg-maroon py-16 text-white md:py-24">
        <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full border border-white/10" />
        <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 size-[260px] rounded-full border border-gold/25" />
        <Container className="relative">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <SceneTitle title={["Siap mulai", "kelasmu?"]} tone="dark" className="!text-[clamp(2.25rem,5vw,4rem)]" />
              <ul className="mt-8 flex max-w-3xl flex-wrap gap-2.5">
                {classes.map((c, i) => (
                  <li key={c.key} data-aos="fade-up" data-aos-delay={i * 50}>
                    <a
                      href="#kelas"
                      onClick={() => setActive(i, { hash: false })}
                      className={cn(
                        "inline-flex rounded-full border px-4 py-1.5 text-sm transition-colors duration-300 hover:border-gold hover:text-gold-soft",
                        i === active ? "border-gold text-gold-soft" : "border-white/25 text-white/85"
                      )}
                    >
                      {c.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <div className="hidden w-24 md:block" aria-hidden>
                <LottieIllustration src="/lottie/rocket-pmb-dark.json" />
              </div>
              <PillLink href={PMB_URL} variant="white" target="_blank" rel="noopener noreferrer">
                Daftar PMB 2027
              </PillLink>
              <p className="text-sm text-white/60">Pilih kelasnya saat mengisi formulir pendaftaran.</p>
            </div>
          </div>
          <div className="absolute -top-10 right-40 hidden xl:block">
            <div className="relative"><ElvoPeek pose="run" size={84} tone="dark" say="Ayo, kursinya terbatas!" delay={0.2} /></div>
          </div>
        </Container>
      </section>

      <section className="bg-cream py-12 md:py-16">
        <Container>
          <ul className="divide-y divide-line border-y border-line">
            {NEXT.map((n, i) => (
              <li key={n.href} data-aos="fade-up" data-aos-delay={i * 70}>
                <a href={n.href} className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-5 md:grid-cols-[140px_1fr_1.2fr_auto] md:py-6">
                  <p className="kicker text-maroon">{n.kicker}</p>
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
