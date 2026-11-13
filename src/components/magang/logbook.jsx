"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { LordIcon } from "@/components/media/lord-icon";
import { useMagang } from "./magang-provider";

// garis buku tulis: pola SVG (bukan gradien CSS) — satu garis tiap 44px
const RULE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='44'%3E%3Cpath d='M0 43.5h8' stroke='%2314213d' stroke-opacity='0.09'/%3E%3C/svg%3E")`;
const pad = (n) => String(n).padStart(2, "0");

/**
 * Logbook (`#logbook`): satu halaman buku catatan bergaris dengan margin maroon dan lubang ring di atas.
 * Tiap entri "tertulis" saat digulir (clip-path, GSAP ScrollTrigger scrub); setelah entri terakhir sebuah babak
 * terbaca, stempel "Disetujui" mengecap (skala + rotasi). Berkas terkait di margin → modal berkas.
 * Reduced-motion: semua tampil tanpa animasi.
 */
export function Logbook() {
  const { logbook, docs, openDoc } = useMagang();
  const ref = useRef(null);
  const docOf = (k) => docs.find((d) => d.key === k);
  let n = 0;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll("[data-entry]").forEach((row) => {
        gsap.fromTo(
          row.querySelector("[data-ink]"),
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: row, start: "top 82%", end: "top 58%", scrub: 0.6 } }
        );
        gsap.from(row.querySelector("[data-num]"), { opacity: 0, x: -6, duration: 0.5, scrollTrigger: { trigger: row, start: "top 82%", toggleActions: "play none none reverse" } });
      });
      el.querySelectorAll("[data-stamp]").forEach((st) => {
        const last = st.closest("[data-chapter]").querySelector("[data-entry]:last-of-type");
        gsap.fromTo(
          st,
          { opacity: 0, scale: 2.2, rotate: -26 },
          {
            opacity: 1,
            scale: 1,
            rotate: -9,
            duration: 0.45,
            ease: "back.out(2.2)",
            scrollTrigger: { trigger: last, start: "top 52%", toggleActions: "play none none reverse" },
            onComplete: () => gsap.fromTo(st.closest("[data-chapter]"), { x: -2 }, { x: 0, duration: 0.25, ease: "elastic.out(1, 0.3)" }),
          }
        );
      });
    }, el);
    const r = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      clearTimeout(r);
      ctx.revert();
    };
  }, []);

  return (
    <section id="logbook" className="scroll-mt-20 py-20 md:py-20">
      <Container>
        <SectionHeader
          title={["Dari surat pengantar", "sampai seminar"]}
          body="Urutan administrasinya, ditulis seperti logbook yang nanti kamu isi sendiri."
          action={docs.some((d) => d.sample) ? <PlaceholderTag /> : null}
        />

        <div ref={ref} className="mt-12 grid gap-8 lg:grid-cols-[1fr_300px] lg:gap-10">
          <div className="relative rounded-xl border border-line bg-white shadow-[0_30px_60px_-45px_rgb(20_33_61/0.6)]">
            {/* lubang ring */}
            <div aria-hidden className="flex justify-around border-b border-line px-10 py-3">
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i} className="size-3 rounded-full bg-cream-2 shadow-[inset_0_1px_2px_rgb(20_33_61/0.25)]" />
              ))}
            </div>
            <div className="relative px-5 pb-10 pt-6 sm:pl-24 sm:pr-10" style={{ backgroundImage: RULE, backgroundPosition: "0 18px" }}>
              <span aria-hidden className="absolute inset-y-0 left-16 hidden w-px bg-maroon/40 sm:block" />
              {logbook.map((ch) => (
                <div key={ch.key} data-chapter className="relative mb-6 last:mb-0">
                  <h3 className="flex h-[44px] items-end pb-2 font-serif text-[1.45rem] italic leading-none text-maroon">{ch.title}</h3>
                  <ol>
                    {ch.entries.map((e) => {
                      n += 1;
                      const d = e.doc ? docOf(e.doc) : null;
                      return (
                        <li key={e.text} data-entry className="relative flex min-h-[44px] items-end gap-3 pb-2.5">
                          <span data-num className="tabular absolute -left-14 bottom-2.5 hidden w-8 text-right font-serif text-[14px] text-text/40 sm:block">
                            {pad(n)}
                          </span>
                          <span data-ink className="flex-1 text-[15.5px] leading-[1.35] text-navy">
                            {e.text}
                          </span>
                          {d && (
                            <button
                              type="button"
                              onClick={() => openDoc(d.key)}
                              className="group inline-flex shrink-0 items-center gap-1.5 rounded border border-maroon/25 bg-white px-2 py-1 text-[12px] font-semibold text-maroon transition-colors hover:border-maroon hover:bg-maroon hover:text-white"
                            >
                              <LordIcon name="document" size={16} target=".group" colors="primary:#6e1423,secondary:#c9a227" />
                              <span className="hidden sm:inline">{d.kind}</span>
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                  <span
                    data-stamp
                    aria-hidden
                    className="pointer-events-none absolute right-0 top-1 hidden select-none rounded-md border-[2.5px] border-maroon/75 px-3 py-1 font-serif text-[13px] font-semibold uppercase tracking-[0.2em] text-maroon/75 sm:block"
                    style={{ transform: "rotate(-9deg)" }}
                  >
                    Disetujui
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start" aria-labelledby="berkas-title">
            <p id="berkas-title" className="kicker text-[11px] text-maroon">Berkas yang dipakai</p>
            <ul className="mt-4 space-y-3">
              {docs.map((d, i) => (
                <li key={d.key} data-aos="fade-up" data-aos-delay={i * 80}>
                  <button
                    type="button"
                    onClick={() => openDoc(d.key)}
                    className="group relative flex w-full items-center gap-4 rounded-lg border border-line bg-white p-4 text-left transition-[border-color,transform,box-shadow] duration-500 ease-cinematic hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-[0_20px_40px_-30px_rgb(20_33_61/0.6)]"
                  >
                    {/* sampul mini: kertas bertumpuk yang bergeser saat hover */}
                    <span aria-hidden className="relative h-14 w-11 shrink-0">
                      <span className="absolute inset-0 translate-x-1 translate-y-1 rounded-sm bg-cream-2 transition-transform duration-500 ease-cinematic group-hover:translate-x-2 group-hover:rotate-6" />
                      <span className="absolute inset-0 flex flex-col gap-1 rounded-sm border border-line bg-white p-1.5 transition-transform duration-500 ease-cinematic group-hover:-rotate-3">
                        <span className="h-1 w-5 rounded bg-maroon" />
                        <span className="h-0.5 w-full rounded bg-navy/15" />
                        <span className="h-0.5 w-4/5 rounded bg-navy/15" />
                        <span className="h-0.5 w-full rounded bg-navy/15" />
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="kicker block text-[10px] text-text/45">{d.kind} · {d.pages} hlm</span>
                      <span className="mt-1 block font-serif text-[1.05rem] leading-snug text-navy group-hover:text-maroon">{d.title}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Container>
    </section>
  );
}
