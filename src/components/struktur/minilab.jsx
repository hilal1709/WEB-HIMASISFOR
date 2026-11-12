"use client";
import { useRef } from "react";
import { animate, svg } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, SectionHeader } from "@/components/home/shared";
import { KnowledgeIllustration } from "@/components/illustrations/line-illustrations";
import { SpotlightCard } from "@/components/aceternity/spotlight-card";
import { Avatar, usePersonModal } from "./person-modal";

/**
 * Minilab (satu-satunya lab prodi) + tautan ke direktori dosen.
 * - Kartu Minilab: SpotlightCard navy, ilustrasi garis tergambar ulang saat di-hover.
 * - Peta keahlian dosen ada di halaman /dosen, di sini cukup tautannya.
 */
export function Minilab({ minilab, people }) {
  const art = useRef(null);
  const open = usePersonModal();
  const byKey = Object.fromEntries(people.map((p) => [p.key, p]));
  const head = minilab.head ? byKey[minilab.head] : null;
  const lecturers = people.filter((p) => p.group !== "staff");

  const redraw = () => {
    if (prefersReducedMotion() || !art.current) return;
    animate(svg.createDrawable(art.current.querySelectorAll("[data-line]")), { draw: ["0 0", "0 1"], duration: 900, delay: (_, i) => i * 30, ease: "inOutCubic" });
  };

  return (
    <section id="minilab" className="relative scroll-mt-24 py-20 md:py-28">
      <Container>
        <SectionHeader title={["Fasilitas", "prodi"]} body="Tempat sebagian besar kegiatan praktik program studi berlangsung." />

        <div className="mt-12 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div data-aos="fade-up">
            <SpotlightCard
              onPointerEnter={redraw}
              className="flex h-full flex-col rounded-lg border border-navy bg-navy p-7 text-white transition-[border-color,box-shadow] duration-500 ease-cinematic hover:!border-gold/40 hover:shadow-[0_30px_60px_-36px_rgb(14_24_48/0.8)] sm:p-9"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -z-10 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                style={{ left: "var(--mx, 50%)", top: "var(--my, 50%)" }}
              />
              <div ref={art} className="max-w-[220px] [&_svg]:text-gold-soft">
                <KnowledgeIllustration />
              </div>
              <p className="kicker mt-8 text-gold-soft">Laboratorium</p>
              <h3 className="mt-2 font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] leading-tight">{minilab.title}</h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/70">{minilab.body}</p>
              {minilab.uses?.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {minilab.uses.map((u, i) => (
                    <li
                      key={u}
                      className="rounded-md border border-white/15 px-3 py-1.5 text-[13px] text-white/80 transition-colors duration-300 hover:border-gold/60 hover:text-white"
                      style={{ transitionDelay: `${i * 30}ms` }}
                    >
                      {u}
                    </li>
                  ))}
                </ul>
              )}
              {head && (
                <button type="button" onClick={() => open(head.key)} className="mt-8 flex items-center gap-3 border-t border-white/10 pt-5 text-left">
                  <Avatar person={head} size={34} />
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">Penanggung jawab</span>
                    <span className="block text-[14px] text-white">{head.name}</span>
                  </span>
                </button>
              )}
            </SpotlightCard>
          </div>

          <a
            href="/dosen"
            data-aos="fade-up"
            data-aos-delay="100"
            className="group flex flex-col justify-between gap-8 rounded-lg border border-line bg-white p-7 transition-[border-color,box-shadow] duration-500 ease-cinematic hover:border-maroon/30 hover:shadow-[0_30px_60px_-40px_rgb(78_14_25/0.5)] sm:p-9"
          >
            <div>
              <p className="kicker text-maroon">Butuh pembimbing?</p>
              <h3 className="mt-2 font-serif text-[1.5rem] leading-snug text-navy">Cari dosen per topik</h3>
              <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-text/60">Direktori dosen memuat bidang keahlian, mata kuliah, dan profil lengkap tiap pengajar.</p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex -space-x-2" aria-hidden>
                {lecturers.map((p) => (
                  <span key={p.key} className="rounded-full ring-[3px] ring-white">
                    <Avatar person={p} size={36} />
                  </span>
                ))}
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-navy/20 text-navy transition-[background-color,border-color,color,transform] duration-500 ease-cinematic group-hover:translate-x-1 group-hover:border-maroon group-hover:bg-maroon group-hover:text-white">
                <svg aria-hidden viewBox="0 0 16 16" className="size-4">
                  <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </a>
        </div>
      </Container>
    </section>
  );
}
