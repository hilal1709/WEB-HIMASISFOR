import Image from "next/image";
import { CONTACT_URL, JOIN, PMB_URL } from "@/lib/home-content";
import { Magnetic } from "@/components/motion/magnetic";
import { Container, PillLink, SceneTitle } from "./shared";
import { ElvoPeek } from "./elvo-peek";
import { LottieIllustration } from "@/components/media/lottie-illustration";

/** CTA PMB: pita maroon terbagi dengan foto, tombol magnetik, (Elvo punya section sendiri: mascot-scene). */
export function JoinScene() {
  return (
    <section id="gabung" className="py-16 md:py-20">
      <Container>
        <div className="grid overflow-hidden rounded-lg border-t-4 border-maroon bg-navy text-white md:grid-cols-[1.1fr_1fr]">
          <div className="relative p-8 md:p-14 lg:pr-44">
            <LottieIllustration src="/lottie/rocket-pmb-dark.json" className="absolute right-8 top-8 hidden w-28 lg:block" />
            <span aria-hidden className="mb-5 block h-[3px] w-10 bg-gold" />
            <p className="kicker text-gold-soft">{JOIN.eyebrow}</p>
            <SceneTitle title={JOIN.title} tone="dark" className="mt-3" />
            <p data-aos="fade-up" className="mt-4 max-w-md text-[16.5px] leading-relaxed text-white/80">{JOIN.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Magnetic strength={0.25}>
                <PillLink href={PMB_URL} variant="gold" target="_blank" rel="noopener noreferrer">Daftar sekarang</PillLink>
              </Magnetic>
              <PillLink href={CONTACT_URL} variant="maroon" target="_blank" rel="noopener noreferrer">Hubungi kami</PillLink>
            </div>
            <div className="absolute -bottom-2 right-6 hidden md:block">
              <div className="relative"><ElvoPeek pose="run" size={124} say="Ayo daftar, aku tunggu di kampus!" tone="dark" /></div>
            </div>
          </div>
          <div className="group relative min-h-[260px] overflow-hidden">
            <Image src="/img/heroprofile.png" alt="Mahasiswa Sistem Informasi UISI" fill sizes="(min-width:768px) 600px, 100vw" className="object-cover brightness-[1.3] transition-transform duration-1000 ease-cinematic group-hover:scale-[1.04]" />
          </div>
        </div>
      </Container>
    </section>
  );
}
