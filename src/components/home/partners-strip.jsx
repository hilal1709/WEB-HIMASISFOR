import { HERO } from "@/lib/home-content";
import { Marquee } from "@/components/motion/marquee";
import { Container, PlaceholderTag } from "./shared";

/** Strip mitra: logo abu-abu → berwarna saat hover, marquee berhenti saat hover. */
export function PartnersStrip() {
  return (
    <section aria-label="Mitra industri" className="border-y bg-paper">
      <Container className="flex flex-col gap-5 py-8 md:flex-row md:items-center md:gap-10">
        <div className="shrink-0 md:w-48">
          <p className="text-sm font-semibold text-ink">Jejaring mitra industri</p>
          <PlaceholderTag className="mt-2" />
        </div>
        <Marquee speed={40} className="min-w-0 flex-1">
          {HERO.partners.map((p) => (
            <span
              key={p.name}
              className="flex h-10 shrink-0 items-center grayscale opacity-55 transition-[filter,opacity] duration-500 hover:opacity-100 hover:grayscale-0"
            >
              {p.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logo} alt={p.name} className="h-6 w-auto max-w-[110px] object-contain" loading="lazy" />
              ) : (
                <span className="font-display text-lg font-semibold tracking-[-0.02em] text-ink">{p.name}</span>
              )}
            </span>
          ))}
        </Marquee>
      </Container>
    </section>
  );
}
