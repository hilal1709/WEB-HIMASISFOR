"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import Image from "next/image";
import { animate } from "animejs";
import { gsap, ScrollTrigger } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Banner } from "@/components/ui/banner";
import { ArrowLink, Container } from "@/components/home/shared";
import { LordIcon } from "@/components/media/lord-icon";
import { useProfileModal } from "./profile-modal";
import { Signature, drawSignature, hideSignature } from "./signature";

const external = (href) => (/^https?:/.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {});

/**
 * Surat editorial dua kolom. Kiri (sticky di lg): potret kecil, progress baca, tombol profil.
 * Kanan: banner pengumuman, drop cap, paragraf, pull quote yang "menyala" kata demi kata saat di-scroll,
 * penutup dengan tanda tangan tergambar. Semua teks dari CMS (bab "Surat").
 */
export function Letter({ content }) {
  const { person: p, letter: l, signature } = content;
  const ref = useRef(null);
  const quote = useRef(null);
  const sign = useRef(null);
  const openProfile = useProfileModal();
  const sigKey = JSON.stringify(signature);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-progress]",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-article]", start: "top 60%", end: "bottom 70%", scrub: 0.4 } }
      );
      if (reduce || !quote.current) return;
      gsap.fromTo(
        quote.current.querySelectorAll("[data-w]"),
        { opacity: 0.16 },
        { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: quote.current, start: "top 80%", end: "bottom 45%", scrub: 0.6 } }
      );
    }, el);

    let anim;
    const st =
      !reduce && sign.current
        ? ScrollTrigger.create({
            trigger: sign.current,
            start: "top 88%",
            once: true,
            onEnter: () => {
              anim = drawSignature(animate, sign.current);
            },
          })
        : null;
    if (st) hideSignature(sign.current); // goresan tersembunyi sampai terlihat
    return () => {
      ctx.revert();
      st?.kill();
      anim?.revert?.();
    };
  }, [l.quote, l.quoteAfter, sigKey]);

  const paragraphs = l.paragraphs ?? [];
  const cut = Math.min(Math.max(l.quoteAfter ?? 0, 0), paragraphs.length);
  const before = paragraphs.slice(0, cut);
  const after = paragraphs.slice(cut);
  const b = l.banner;

  const para = (text, i, dropCap) => (
    <p
      key={i}
      data-aos="fade-up"
      className={
        dropCap
          ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-[4.2rem] first-letter:leading-[0.85] first-letter:text-maroon"
          : undefined
      }
    >
      {text}
    </p>
  );

  return (
    <section id="surat" ref={ref} className="scroll-mt-24 border-t border-line bg-white py-16 md:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-20">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex items-center gap-4 lg:flex-col lg:items-start">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-cream-2 lg:size-20">
                <Image src={p.photo} alt="" fill sizes="80px" className="object-cover object-top" />
              </div>
            </div>

            {l.progressLabels?.length > 0 && (
              <div className="mt-8 hidden gap-4 lg:flex">
                <span className="relative block h-40 w-[2px] overflow-hidden rounded-full bg-line">
                  <span data-progress className="absolute inset-0 origin-top bg-gold" />
                </span>
                <ol className="flex flex-col justify-between py-1 text-[13px] text-text/55">
                  {l.progressLabels.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            )}

            {l.profileButtonLabel && (
              <div className="mt-8 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={openProfile}
                  className="profile-btn inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 text-sm font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-navy-deep active:scale-[0.98]"
                >
                  <LordIcon name="account" size={20} target=".profile-btn" colors="primary:#ffffff,secondary:#e0c56a" />
                  {l.profileButtonLabel}
                </button>
              </div>
            )}
          </aside>

          <article data-article className="min-w-0 max-w-[68ch]">
            {b.show && b.title && (
              <Banner
                variant={b.variant}
                dismissible
                title={b.title}
                action={
                  b.href && b.linkLabel ? (
                    <ArrowLink href={b.href} tone={b.variant === "brand" ? "dark" : "light"} {...external(b.href)} className="hidden sm:inline-flex">
                      {b.linkLabel}
                    </ArrowLink>
                  ) : null
                }
                className="mb-12"
              >
                {b.body || null}
              </Banner>
            )}

            {l.greeting && (
              <p data-aos="fade-up" className="font-serif text-[1.45rem] italic leading-snug text-maroon">
                {l.greeting}
              </p>
            )}

            {before.length > 0 && <div className="mt-8 space-y-6 text-[17.5px] leading-[1.8] text-text/80">{before.map((t, i) => para(t, i, i === 0))}</div>}

            {l.quote && (
              <figure ref={quote} className="relative my-14 border-y border-line py-12 md:my-16 md:py-14">
                <span aria-hidden className="absolute -top-7 left-0 bg-white pr-4 font-serif text-[5.5rem] leading-none text-gold">
                  &ldquo;
                </span>
                <blockquote className="font-serif text-[clamp(1.6rem,3vw,2.35rem)] leading-[1.25] text-navy">
                  {l.quote.split(" ").map((w, i) => (
                    <span key={i} data-w>
                      {w}{" "}
                    </span>
                  ))}
                </blockquote>
              </figure>
            )}

            <div className={`space-y-6 text-[17.5px] leading-[1.8] text-text/80 ${!l.quote && before.length ? "mt-6" : ""}`}>
              {after.map((t, i) => para(t, cut + i, cut === 0 && i === 0))}
              {l.closing && (
                <p data-aos="fade-up" className="font-serif text-[1.2rem] italic text-maroon">
                  {l.closing}
                </p>
              )}
            </div>

            <footer className="mt-12">
              {l.signOff && <p className="text-sm text-text/60">{l.signOff}</p>}
              <Signature ref={sign} signature={signature} className="mt-2" />
              <p className="mt-2 font-serif text-xl text-navy">
                {p.name}
                {p.credentials ? `, ${p.credentials}` : ""}
              </p>
            </footer>
          </article>
        </div>
      </Container>
    </section>
  );
}
