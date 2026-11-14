"use client";
import { useState } from "react";
import Image from "next/image";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/loader";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { VelocityMarquee } from "@/components/motion/velocity-marquee";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { cn } from "@/lib/utils";

const initials = (name) => name.split(/[ ,.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("");

/**
 * Jejak alumni: dua baris marquee yang lajunya mengikuti kecepatan scroll (berlawanan arah).
 * Foto grayscale → berwarna saat hover, kartu terangkat; klik kartu → modal cerita alumni.
 * Foto memuat dengan Skeleton.
 */
export function AlumniWall({ content: c, note }) {
  const alumni = c.items;
  const [current, setCurrent] = useState(null);
  const half = Math.ceil(alumni.length / 2);
  const rows = [alumni.slice(0, half), alumni.slice(half)].filter((r) => r.length);
  // baris pendek diulang agar marquee tidak bolong di layar lebar
  const fill = (r) => (r.length >= 6 ? r : Array.from({ length: Math.ceil(6 / r.length) }, () => r).flat());

  return (
    <section id="alumni" className="relative overflow-hidden bg-cream-2 py-16 md:py-20">
      <Container>
        <SectionHeader
          title={[c.titleTop, c.titleAccent]}
          body={c.body}
          action={c.lottie ? <LottieIllustration src={c.lottie} className="hidden w-28 md:block" /> : null}
        />
      </Container>

      <div className="mt-10 space-y-4 md:mt-14">
        {rows.map((r, k) => (
          <VelocityMarquee key={k} base={k ? 34 : 42} reverse={k === 1}>
            {fill(r).map((a, i) => (
              <AlumniCard key={`${a.name}-${i}`} a={a} onOpen={() => setCurrent(a)} />
            ))}
          </VelocityMarquee>
        ))}
      </div>

      <Container className="relative">
        {alumni.some((a) => a.sample) && <PlaceholderTag className="mt-8">{note}</PlaceholderTag>}
        {c.mascot?.show && (
          <div className="absolute -top-6 right-8 hidden xl:block">
            <div className="relative"><ElvoPeek pose={c.mascot.pose} size={82} say={c.mascot.say} delay={0.6} /></div>
          </div>
        )}
      </Container>

      <Modal open={!!current} onOpenChange={(o) => !o && setCurrent(null)}>
        <ModalContent className="max-w-xl p-0">
          {current && (
            <div className="grid sm:grid-cols-[180px_1fr]">
              <div className="relative aspect-[4/3] bg-navy sm:aspect-auto">
                {current.photo ? (
                  <Image src={current.photo} alt={current.name} fill sizes="180px" className="object-cover" />
                ) : (
                  <span className="grid h-full place-items-center font-serif text-5xl text-gold">{initials(current.name)}</span>
                )}
              </div>
              <div className="p-6 sm:p-7">
                <p className="kicker text-maroon">{c.kicker}</p>
                <ModalTitle className="mt-2 text-[1.45rem]">{current.name}</ModalTitle>
                <ModalDescription className="mt-1">{current.role}</ModalDescription>
                {(current.quote || c.fallbackQuote) && (
                  <blockquote className="relative mt-6 border-l-[3px] border-gold pl-4 font-serif text-[1.2rem] leading-snug text-navy">
                    {current.quote || c.fallbackQuote}
                  </blockquote>
                )}
                {(current.sample || !current.quote) && <PlaceholderTag className="mt-5">{note}</PlaceholderTag>}
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}

function AlumniCard({ a, onOpen }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Cerita alumni: ${a.name}`}
      className="group mx-2 flex w-[300px] shrink-0 items-center gap-4 rounded-lg border border-line bg-white p-3 pr-5 text-left transition-[transform,border-color,box-shadow] duration-500 ease-cinematic hover:-translate-y-1 hover:border-navy/20 hover:shadow-[0_20px_40px_-30px_rgb(20_33_61/0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/40"
    >
      <span className="relative size-16 shrink-0 overflow-hidden rounded-md bg-cream">
        {a.photo ? (
          <>
            {!loaded && <Skeleton className="absolute inset-0 rounded-md" />}
            <Image
              src={a.photo}
              alt=""
              fill
              sizes="64px"
              onLoad={() => setLoaded(true)}
              className={cn("object-cover grayscale transition-[filter,transform,opacity] duration-700 ease-cinematic group-hover:scale-105 group-hover:grayscale-0", loaded ? "opacity-100" : "opacity-0")}
            />
          </>
        ) : (
          <span className="grid h-full place-items-center font-serif text-xl text-maroon">{initials(a.name)}</span>
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold text-navy">{a.name}</span>
        <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-text/60">{a.role}</span>
      </span>
      <svg aria-hidden viewBox="0 0 16 16" className="ml-auto size-4 shrink-0 -translate-x-1 text-maroon opacity-0 transition-[opacity,transform] duration-500 ease-cinematic group-hover:translate-x-0 group-hover:opacity-100">
        <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
