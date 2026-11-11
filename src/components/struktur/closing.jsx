"use client";
import { ArrowLink, Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { LordIcon } from "@/components/media/lord-icon";

const NEXT = [
  { href: "/sambutan-kaprodi", kicker: "Profil", title: "Sambutan Kaprodi", body: "Pesan dari ketua program studi." },
  { href: "/visi-misi", kicker: "Profil", title: "Visi & Misi", body: "Arah program studi menuju 2030." },
  { href: "/profil-lulusan", kicker: "Profil", title: "Profil Lulusan", body: "Kompetensi dan peran lulusan." },
];

/** Penutup "indeks bernomor": kiri judul + kartu layanan akademik, kanan daftar tautan 01/02/03. */
export function Closing() {
  return (
    <section className="relative bg-cream-2/60 py-16 md:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="relative">
            <SceneTitle title={["Jelajahi", "lebih jauh"]} />
            <div data-aos="fade-up" className="mt-8 rounded-lg border-l-4 border-gold bg-maroon p-6 text-white">
              <p className="font-serif text-xl">Butuh layanan akademik?</p>
              <p className="mt-2 text-sm leading-relaxed text-white/70">Persuratan dan approval kaprodi diurus lewat layanan akademik program studi.</p>
              <ArrowLink href="/profile#layanan" tone="dark" className="group mt-5 items-center gap-2">
                <LordIcon name="chat" size={20} trigger="hover" target=".group" colors="primary:#ffffff,secondary:#e6d3a1" />
                Layanan akademik
              </ArrowLink>
            </div>
            <div className="absolute -bottom-6 right-0 hidden xl:block">
              <div className="relative"><ElvoPeek pose="wave" size={80} say="Kenalan juga dengan visi dan lulusan kita!" delay={0.2} /></div>
            </div>
          </div>

          <ol className="border-t border-navy/15">
            {NEXT.map((n, i) => (
              <li key={n.href} data-aos="fade-up" data-aos-delay={i * 80} className="border-b border-navy/15">
                <a href={n.href} className="group flex items-center gap-5 py-6 md:gap-8 md:py-8">
                  <span className="font-serif text-[clamp(2rem,4vw,3.25rem)] leading-none tabular-nums text-gold transition-colors duration-500 group-hover:text-maroon">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="kicker block text-maroon">{n.kicker}</span>
                    <span className="mt-1 block font-serif text-[clamp(1.35rem,2.4vw,1.9rem)] leading-tight text-navy">{n.title}</span>
                    <span className="mt-1 block text-sm text-text/60">{n.body}</span>
                  </span>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-navy/20 text-navy transition-[background-color,border-color,color,transform] duration-500 ease-cinematic group-hover:translate-x-1 group-hover:border-maroon group-hover:bg-maroon group-hover:text-white">
                    <svg aria-hidden viewBox="0 0 16 16" className="size-4">
                      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
