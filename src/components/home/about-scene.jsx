"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import Image from "next/image";
import { ScrollTrigger } from "@/lib/scroll";
import { countUp } from "@/lib/motion";
import { HOME_DEFAULTS } from "@/lib/home-cms/defaults";
import { ILLUSTRATIONS } from "@/components/illustrations/line-illustrations";
import { ArrowLink, Container, SceneTitle } from "./shared";
import { VideoCard } from "./video-player";
import { ElvoPeek } from "./elvo-peek";
import { LottieIllustration } from "@/components/media/lottie-illustration";

/**
 * Tentang prodi: foto + kutipan kaprodi (bingkai emas bergeser), ringkasan, baris statistik
 * (angka emas dihitung naik), empat keunggulan dengan ilustrasi garis, dan video profil dosen.
 */
export function AboutScene({ total, content: c = HOME_DEFAULTS.about }) {
  const stats = useRef(null);
  useEffect(() => {
    const el = stats.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => el.querySelectorAll("[data-count]").forEach((n) => countUp(n, Number(n.dataset.count), { duration: 1700, format: (v) => String(v) })),
    });
    return () => st.kill();
  }, []);

  // nilai murni angka dihitung naik; selain itu tampil apa adanya
  const STATS = [
    ...c.stats.map((s) => (/^\d+$/.test(String(s.value).trim()) ? { v: Number(s.value), l: s.label } : { text: s.value, l: s.label })),
    ...(c.showTotal && total ? [{ v: total, l: c.totalLabel }] : []),
  ].slice(0, 4);

  return (
    <section id="tentang" className="py-16 md:py-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <figure data-aos="fade-up" className="group relative mx-auto w-full max-w-md lg:mx-0">
            <span aria-hidden className="absolute -right-4 -top-4 h-full w-full rounded-lg border-2 border-gold transition-transform duration-700 ease-cinematic group-hover:translate-x-1 group-hover:-translate-y-1" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-cream-2">
              <Image src={c.photo} alt={c.photoAlt} fill sizes="420px" className="object-cover object-top transition-transform duration-1000 ease-cinematic group-hover:scale-[1.03]" />
            </div>
          </figure>

          <div>
            <span aria-hidden className="mb-5 block h-[3px] w-10 bg-gold" />
            <SceneTitle title={c.title} />
            <blockquote data-aos="fade-up" className="mt-8 border-l-2 border-maroon pl-6">
              <p className="font-serif text-[1.35rem] italic leading-snug text-navy">“{c.quote}”</p>
              <footer className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text/60">
                {c.quoteBy}
              </footer>
            </blockquote>
            <p data-aos="fade-up" className="mt-6 text-[16.5px] leading-relaxed text-text/70">{c.body}</p>
            {c.more?.label && <ArrowLink href={c.more.href} className="mt-6">{c.more.label}</ArrowLink>}
          </div>
        </div>

        <div className="relative">
        <div className="absolute -top-[104px] right-2 z-10 hidden md:block">
          <div className="relative"><ElvoPeek pose={c.mascot.pose} size={96} say={c.mascot.say} delay={0.6} /></div>
        </div>
        <dl ref={stats} className="mt-16 grid grid-cols-2 gap-y-8 border-y border-line py-8 md:mt-20 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.l + i} className={`flex flex-col px-2 md:px-6 ${i ? "md:border-l md:border-line" : ""}`}>
              <dt className="order-2 mt-2 text-sm text-text/60">{s.l}</dt>
              <dd className="order-1 font-serif text-[clamp(2rem,3.4vw,2.9rem)] leading-none text-gold tabular">
                {s.text ?? <span data-count={s.v}>{s.v}</span>}
              </dd>
            </div>
          ))}
        </dl>
        </div>

        <div className="mt-16 grid gap-10 md:mt-20 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {c.features.map((it, i) => {
              const Ill = ILLUSTRATIONS[it.illustration];
              return (
                <li key={it.title + i} data-aos="fade-up" data-aos-delay={i * 70} className="group">
                  <div className="w-28 text-navy transition-transform duration-500 ease-cinematic group-hover:-translate-y-1">
                    <LottieIllustration src={it.lottie} label={it.title} fallback={Ill ? <Ill /> : null} />
                  </div>
                  <h3 className="mt-3 font-serif text-xl text-navy">{it.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-text/60">{it.body}</p>
                </li>
              );
            })}
          </ul>
          <div data-aos="fade-up">
            {c.video?.src && <VideoCard video={c.video} label={c.videoLabel} />}
          </div>
        </div>
      </Container>
    </section>
  );
}
