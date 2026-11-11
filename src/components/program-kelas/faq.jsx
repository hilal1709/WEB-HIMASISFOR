"use client";
import { useState } from "react";
import { Container, SceneTitle } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { useKelas } from "./kelas-provider";

/**
 * FAQ akordion: satu terbuka sekaligus, tinggi beranimasi lewat grid-rows 0fr→1fr,
 * tanda plus berputar menjadi minus, nomor serif menyala emas saat terbuka.
 */
export function Faq() {
  const { faq, openQuiz } = useKelas();
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-white py-16 md:py-24">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <span aria-hidden className="mb-5 block h-[3px] w-10 bg-gold" />
          <SceneTitle title={["Masih", "ragu?"]} />
          <p data-aos="fade-up" className="mt-4 max-w-sm text-[16.5px] leading-relaxed text-text/65">
            Pertanyaan yang paling sering diajukan calon Sisforians tentang program kelas.
          </p>
          <button type="button" onClick={openQuiz} data-aos="fade-up" className="u-gold mt-6 text-[15px] font-semibold text-maroon">
            Coba kuis pemilih kelas
          </button>
        </div>

        <ul className="divide-y divide-line border-y border-line">
          {faq.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} data-aos="fade-up" data-aos-delay={i * 50}>
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={on}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(on ? null : i)}
                    className="group flex w-full items-start gap-4 py-5 text-left md:py-6"
                  >
                    <span className={cn("tabular w-7 shrink-0 pt-0.5 font-serif text-[15px] transition-colors duration-300", on ? "text-gold" : "text-text/35")}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={cn("flex-1 font-serif text-[1.2rem] leading-snug transition-colors duration-300 md:text-[1.35rem]", on ? "text-maroon" : "text-navy group-hover:text-maroon")}>
                      {f.q}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "relative mt-1 grid size-8 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,transform] duration-500 ease-cinematic",
                        on ? "rotate-180 border-maroon bg-maroon text-white" : "border-navy/20 text-navy group-hover:border-maroon"
                      )}
                    >
                      <span className="absolute h-[1.5px] w-3 rounded bg-current" />
                      <span className={cn("absolute h-3 w-[1.5px] rounded bg-current transition-transform duration-500 ease-cinematic", on && "scale-y-0")} />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className={cn("grid transition-[grid-template-rows,opacity] duration-500 ease-cinematic", on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 pl-11 pr-12 text-[15.5px] leading-relaxed text-text/70">{f.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
