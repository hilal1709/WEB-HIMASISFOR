import { HERO } from "@/lib/home-content";
import { Marquee } from "@/components/motion/marquee";
import { Container, PlaceholderTag } from "./shared";

/** Mitra industri: marquee logo abu-abu yang berwarna saat hover. */
export function PartnersMarquee() {
  return (
    <section aria-label="Mitra industri" className="border-y border-line bg-cream">
      <Container className="flex flex-col gap-4 py-8 md:flex-row md:items-center md:gap-10">
        <div className="shrink-0 md:w-52">
          <p className="font-serif text-lg text-navy">Jejaring mitra industri</p>
          <PlaceholderTag className="mt-1.5" />
        </div>
        <Marquee speed={42} className="min-w-0 flex-1">
          {HERO.partners.map((p) => (
            <span key={p.name} className="flex h-10 shrink-0 items-center opacity-55 grayscale transition-[filter,opacity] duration-500 hover:opacity-100 hover:grayscale-0">
              {p.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logo} alt={p.name} className="h-6 w-auto max-w-[130px] object-contain" loading="lazy" />
              ) : (
                <span className="font-serif text-lg text-navy">{p.name}</span>
              )}
            </span>
          ))}
        </Marquee>
      </Container>
    </section>
  );
}
