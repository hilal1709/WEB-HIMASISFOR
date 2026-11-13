import Image from "next/image";
import { HOME_DEFAULTS } from "@/lib/home-cms/defaults";

const ext = (href = "") => (/^https?:\/\//.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {});
import { Magnetic } from "@/components/motion/magnetic";
import { Container, PillLink, SceneTitle } from "./shared";
import { ElvoPeek } from "./elvo-peek";
import { LottieIllustration } from "@/components/media/lottie-illustration";

/** CTA PMB: pita maroon terbagi dengan foto, tombol magnetik, (Elvo punya section sendiri: mascot-scene). */
export function JoinScene({ content: JOIN = HOME_DEFAULTS.join }) {
  return (
    <section id="gabung" className="py-16 md:py-20">
      <Container>
        <div className="grid overflow-hidden rounded-lg border-t-4 border-maroon bg-navy text-white md:grid-cols-[1.1fr_1fr]">
          <div className="relative p-8 md:p-14 lg:pr-44">
            {JOIN.lottie && <LottieIllustration src={JOIN.lottie} className="absolute right-8 top-8 hidden w-28 lg:block" />}
            <span aria-hidden className="mb-5 block h-[3px] w-10 bg-gold" />
            <p className="kicker text-gold-soft">{JOIN.eyebrow}</p>
            <SceneTitle title={JOIN.title} tone="dark" className="mt-3" />
            <p data-aos="fade-up" className="mt-4 max-w-md text-[16.5px] leading-relaxed text-white/80">{JOIN.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {JOIN.primary?.label && (
                <Magnetic strength={0.25}>
                  <PillLink href={JOIN.primary.href} variant="gold" {...ext(JOIN.primary.href)}>{JOIN.primary.label}</PillLink>
                </Magnetic>
              )}
              {JOIN.secondary?.label && <PillLink href={JOIN.secondary.href} variant="maroon" {...ext(JOIN.secondary.href)}>{JOIN.secondary.label}</PillLink>}
            </div>
            <div className="absolute -bottom-2 right-6 hidden md:block">
              <div className="relative"><ElvoPeek pose={JOIN.mascot.pose} size={124} say={JOIN.mascot.say} tone="dark" /></div>
            </div>
          </div>
          <div className="group relative min-h-[260px] overflow-hidden">
            <Image src={JOIN.image} alt={JOIN.imageAlt} fill sizes="(min-width:768px) 600px, 100vw" className="object-cover brightness-[1.3] transition-transform duration-1000 ease-cinematic group-hover:scale-[1.04]" />
          </div>
        </div>
      </Container>
    </section>
  );
}
