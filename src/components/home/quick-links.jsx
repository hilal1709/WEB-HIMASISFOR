import { HOME_DEFAULTS } from "@/lib/home-cms/defaults";
import { Container } from "./shared";
import { ArrowGlyph } from "./glyphs";
import { LottieIllustration } from "@/components/media/lottie-illustration";

/** Tautan cepat per audiens — kartu putih yang menumpang di tepi bawah hero (pola situs kampus). */
export function QuickLinks({ content: c = HOME_DEFAULTS.quicklinks }) {
  if (!c.items?.length) return null;
  return (
    <section id="tautan-cepat" aria-label="Tautan cepat" className="relative z-10 -mt-20 md:-mt-24">
      <Container>
        <ul className="grid gap-px overflow-hidden rounded-lg bg-line shadow-[0_24px_50px_-30px_rgb(20_33_61/0.45)] sm:grid-cols-2 lg:grid-cols-4">
          {c.items.map((q, i) => (
            <li key={q.title + i} data-aos="fade-up" data-aos-delay={i * 70}>
              <a
                href={q.href}
                {...(/^https?:\/\//.test(q.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={`ql-${i} group relative flex h-full gap-4 bg-white p-6 transition-colors duration-300 hover:bg-cream md:p-7`}
              >
                <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gold transition-colors duration-500 group-hover:bg-maroon" />
                <LottieIllustration src={q.lottie} label={q.title} replayOnHover className="size-14 shrink-0 transition-transform duration-500 ease-cinematic group-hover:-translate-y-0.5" />
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-serif text-xl text-navy">{q.title}</span>
                    <ArrowGlyph className="size-4 -translate-x-1 text-maroon opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-text/60">{q.body}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
