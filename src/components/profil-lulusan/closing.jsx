"use client";
import { Container, PillLink, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";

const external = (href) => /^https?:\/\//i.test(href ?? "");

/**
 * Penutup band maroon full-bleed: judul ajakan + kalimat penjelas + tombol (mis. PMB),
 * lalu tautan lanjutan sebagai daftar baris berpemisah garis. Semua isi dari Galeri Wisuda.
 */
export function Closing({ content: c }) {
  const links = c.links ?? [];
  return (
    <>
      <section id="pl-closing" className="relative overflow-hidden bg-maroon py-16 text-white md:py-20">
        <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full border border-white/10" />
        <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 size-[260px] rounded-full border border-gold/25" />
        <Container className="relative">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <SceneTitle title={[c.titleTop, c.titleAccent]} tone="dark" className="!text-[clamp(2.25rem,5vw,4rem)]" />
              {c.body && <p className="mt-5 max-w-xl text-pretty text-[16.5px] leading-relaxed text-white/70">{c.body}</p>}
            </div>
            {(c.cta?.label || c.note) && (
              <div className="flex flex-col items-start gap-3 lg:items-end">
                {c.cta?.label && c.cta.href && (
                  <PillLink href={c.cta.href} variant="white" {...(external(c.cta.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    {c.cta.label}
                  </PillLink>
                )}
                {c.note && <p className="text-sm text-white/60">{c.note}</p>}
              </div>
            )}
          </div>
          {c.mascot?.show && (
            <div className="absolute -top-10 right-8 hidden xl:block">
              <div className="relative"><ElvoPeek pose={c.mascot.pose} size={84} tone="dark" say={c.mascot.say} delay={0.2} /></div>
            </div>
          )}
        </Container>
      </section>

      {links.length > 0 && (
        <section className="bg-cream py-12 md:py-16">
          <Container>
            <ul className="divide-y divide-line border-y border-line">
              {links.map((n, i) => (
                <li key={`${n.href}-${i}`} data-aos="fade-up" data-aos-delay={i * 70}>
                  <a href={n.href || "#"} className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-5 md:grid-cols-[140px_1fr_1.2fr_auto] md:py-6">
                    <p className="kicker text-maroon md:order-none">{n.kicker}</p>
                    <p className="col-start-1 font-serif text-[1.4rem] leading-tight text-navy md:col-start-auto">
                      <span className="u-gold">{n.title}</span>
                    </p>
                    <p className="col-start-1 text-sm text-text/60 md:col-start-auto">{n.body}</p>
                    <svg aria-hidden viewBox="0 0 16 16" className="col-start-2 row-span-3 row-start-1 size-5 text-maroon transition-transform duration-500 ease-cinematic group-hover:translate-x-1.5 md:col-start-auto md:row-span-1 md:row-start-auto">
                      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}
