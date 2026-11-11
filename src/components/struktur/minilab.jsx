"use client";
import { useRef, useState } from "react";
import { animate, svg } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, SectionHeader } from "@/components/home/shared";
import { KnowledgeIllustration } from "@/components/illustrations/line-illustrations";
import { SpotlightCard } from "@/components/aceternity/spotlight-card";
import { Avatar, usePersonModal } from "./person-modal";
import { cn } from "@/lib/utils";

/**
 * Minilab (satu-satunya lab prodi) + peta keahlian dosen.
 * - Kartu Minilab: SpotlightCard navy, ilustrasi garis tergambar ulang saat di-hover.
 * - Keahlian: chip dari data dosen; hover/fokus chip menyorot pemiliknya di deret avatar, klik → modal.
 */
export function Minilab({ minilab, people }) {
  const art = useRef(null);
  const open = usePersonModal();
  const [focus, setFocus] = useState(null);
  const byKey = Object.fromEntries(people.map((p) => [p.key, p]));
  const head = minilab.head ? byKey[minilab.head] : null;
  const lecturers = people.filter((p) => p.group !== "staff");
  const skills = lecturers.flatMap((p) => (p.expertise ?? []).map((x) => ({ label: x, owner: p.key })));

  const redraw = () => {
    if (prefersReducedMotion() || !art.current) return;
    animate(svg.createDrawable(art.current.querySelectorAll("[data-line]")), { draw: ["0 0", "0 1"], duration: 900, delay: (_, i) => i * 30, ease: "inOutCubic" });
  };

  return (
    <section id="minilab" className="relative scroll-mt-24 py-20 md:py-28">
      <Container>
        <SectionHeader title={["Fasilitas &", "keahlian"]} body="Satu ruang untuk berlatih, dan beragam keahlian dosen untuk tempat bertanya." />

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

          <div data-aos="fade-up" data-aos-delay="100" className="flex flex-col rounded-lg border border-line bg-white p-7 sm:p-9" onPointerLeave={() => setFocus(null)}>
            <p className="kicker text-maroon">Keahlian dosen</p>
            <h3 className="mt-2 font-serif text-[1.5rem] leading-snug text-navy">Mau konsultasi topik apa?</h3>
            <p className="mt-2 text-[14.5px] text-text/60">Arahkan ke salah satu topik untuk melihat dosennya, klik untuk membuka profil.</p>

            <div className="mt-6 flex -space-x-2" aria-hidden>
              {lecturers.map((p) => (
                <span
                  key={p.key}
                  className={cn(
                    "rounded-full ring-[3px] ring-white transition-[transform,opacity,filter] duration-400 ease-cinematic",
                    focus && focus !== p.key && "opacity-40",
                    focus === p.key && "z-10 -translate-y-1.5 scale-110"
                  )}
                >
                  <Avatar person={p} size={40} />
                </span>
              ))}
            </div>
            <p className="mt-3 h-5 text-[13px] text-navy transition-opacity duration-300" aria-live="polite">
              {focus ? byKey[focus]?.name : ""}
            </p>

            <ul className="mt-4 flex flex-wrap gap-2">
              {skills.map((s) => (
                <li key={`${s.owner}-${s.label}`}>
                  <button
                    type="button"
                    onClick={() => open(s.owner)}
                    onPointerEnter={() => setFocus(s.owner)}
                    onFocus={() => setFocus(s.owner)}
                    onBlur={() => setFocus(null)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-[13px] transition-[border-color,background-color,color,transform] duration-300 active:scale-95",
                      focus === s.owner ? "border-maroon bg-maroon text-white" : "border-line bg-cream/60 text-navy hover:border-navy/30"
                    )}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
