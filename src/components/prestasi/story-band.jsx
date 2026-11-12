"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag } from "@/components/home/shared";
import { VideoCard } from "@/components/home/video-player";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { usePrestasi } from "./prestasi-provider";

/**
 * Band maroon "Kisah sukses" (CMS `kisah-mawapres`): cerita yang menyala per kata saat digulir
 * (GSAP scrub), daftar mahasiswa di video (bisa lebih dari satu), Lottie piala, kartu video (modal).
 */
export function StoryBand() {
  const { story } = usePrestasi();
  const ref = useRef(null);
  const words = story.quote.split(/\s+/);
  const people = story.people;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-word]", { opacity: 0.22 }, { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: "[data-quote]", start: "top 80%", end: "bottom 45%", scrub: 0.6 } });
    }, el);
    return () => ctx.revert();
  }, [story.quote]);

  return (
    <section ref={ref} id="kisah" className="relative scroll-mt-20 overflow-hidden bg-maroon-deep py-16 text-white md:py-24">
      <span aria-hidden className="pointer-events-none absolute -left-32 top-10 size-96 rounded-full border border-white/10" />
      <Container className="relative grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
        <div>
          <div className="flex items-center gap-4">
            <span aria-hidden className="block h-[3px] w-10 bg-gold" />
            <span className="kicker text-gold-soft">{story.kicker}</span>
          </div>
          <blockquote data-quote className="mt-6 font-serif text-[clamp(1.5rem,2.8vw,2.25rem)] leading-[1.22]">
            <span aria-hidden className="mr-1 text-gold">“</span>
            {words.map((w, i) => (
              <span key={i} data-word className={i >= words.length - 4 ? "italic text-gold-soft" : undefined}>
                {w}{" "}
              </span>
            ))}
            <span aria-hidden className="text-gold">”</span>
          </blockquote>

          <div className="mt-8 flex items-center gap-5">
            <LottieIllustration src="/lottie/trophy-dark.json" className="hidden w-16 shrink-0 sm:block" label="Ilustrasi piala" />
            <ul className={people.length > 1 ? "grid flex-1 gap-4 sm:grid-cols-2" : "flex-1"}>
              {people.map((p, i) => (
                <li key={p.name + i} data-aos="fade-up" data-aos-delay={i * 90} className="group flex items-center gap-3">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 border-gold/70 bg-white/10 transition-transform duration-500 ease-cinematic group-hover:scale-110">
                    {p.photo ? (
                      <Image src={p.photo} alt="" fill sizes="48px" className="object-cover object-top" />
                    ) : (
                      <span className="grid size-full place-items-center text-sm font-semibold text-gold-soft">{p.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}</span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-snug">{p.name}</span>
                    {p.role && <span className="block text-[13px] leading-snug text-white/60">{p.role}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {story.sample && <PlaceholderTag tone="dark" className="mt-5" />}
        </div>
        <div data-aos="fade-up" className="relative">
          <VideoCard video={story.video} label={story.kicker} />
          <div className="absolute -top-14 right-8 hidden lg:block">
            <div className="relative"><ElvoPeek pose="laugh" size={84} say="Kakak tingkat keren banget!" tone="dark" delay={0.4} /></div>
          </div>
        </div>
      </Container>
    </section>
  );
}
