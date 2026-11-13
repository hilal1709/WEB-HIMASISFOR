"use client";
import { useLayoutEffect as useEffect, useMemo, useRef } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { CURTAIN_KEY } from "@/lib/regulasi-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { useRegulasi } from "./regulasi-provider";
import { RuleSearch } from "./rule-search";

/** Pertanyaan yang paling sering diajukan ke dosen wali, masing-masing ditautkan ke satu pasal. */
const POPULAR = [
  { q: "Berapa SKS yang boleh kuambil semester depan?", no: "1.3" },
  { q: "Berapa kehadiran minimal supaya boleh ikut ujian?", no: "3.1" },
  { q: "Bolehkah aku mengulang mata kuliah?", no: "2.3" },
  { q: "Kapan aku boleh mengambil cuti?", no: "4.1" },
  { q: "Apa yang terjadi kalau IPS-ku turun?", no: "5.2" },
];

/**
 * Hero "pertanyaan populer": kiri judul + pencarian pasal (RuleSearch), kanan lima pertanyaan bernomor
 * yang paling sering ditanyakan, masing-masing berlabel pasalnya. Klik → pasal itu dibuka di pembaca (goPasal),
 * jadi jawabannya hanya ada di satu tempat.
 */
export function RegulasiHero() {
  const { intro, version, chapters, goPasal, pasalCount } = useRegulasi();
  const ref = useRef(null);

  const items = useMemo(() => {
    const all = chapters.flatMap((c) => c.pasal);
    return POPULAR.map((x) => ({ ...x, pasal: all.find((p) => p.no === x.no) })).filter((x) => x.pasal);
  }, [chapters]);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const d = curtainDelay(CURTAIN_KEY);
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay: d });
      gsap.from("[data-faq]", { y: 22, opacity: 0, duration: 0.8, stagger: 0.07, ease: "expo.out", delay: d + 0.2 });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative pb-10 pt-10 md:pb-14 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li>Akademik</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Regulasi Akademik</li>
          </ol>
        </nav>

        <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p data-hero-fade className="kicker text-[11.5px] text-maroon">
              Pedoman akademik {version} · {chapters.length} bab · {pasalCount} pasal
            </p>
            <SceneTitle as="h1" trigger="mount" title={["Aturan main,", "tanpa tebak-tebakan"]} className="mt-5 !text-[clamp(2.5rem,5vw,4.25rem)] !leading-[1]" />
            <p data-hero-fade className="mt-6 max-w-md text-pretty text-[16.5px] leading-relaxed text-text/70">{intro.body}</p>
            <div data-hero-fade className="relative z-30 mt-8">
              <RuleSearch />
            </div>
          </div>

          {/* pertanyaan populer */}
          <div className="relative">
            <p data-hero-fade className="mb-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-text/45">Paling sering ditanyakan</p>
            <ol className="border-t border-navy/15">
              {items.map((x, i) => (
                <li key={x.no} data-faq className="border-b border-navy/15">
                  <button
                    type="button"
                    onClick={() => goPasal(x.no)}
                    aria-label={`${x.q} Buka pasal ${x.no}, ${x.pasal.title}`}
                    className="group flex w-full items-baseline gap-4 py-5 text-left outline-none focus-visible:bg-white/60 md:gap-6"
                  >
                    <span className="w-8 shrink-0 font-serif text-[1.35rem] tabular-nums text-gold transition-colors group-hover:text-maroon">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-serif text-[clamp(1.2rem,2.2vw,1.6rem)] leading-snug text-navy transition-colors group-hover:text-maroon">{x.q}</span>
                      <span className="mt-1 block text-[12.5px] text-text/50">Pasal {x.no} · {x.pasal.title}</span>
                    </span>
                    <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full border border-navy/20 text-navy transition-[transform,background-color,border-color,color] duration-300 group-hover:translate-y-0.5 group-hover:border-maroon group-hover:bg-maroon group-hover:text-white">
                      <svg viewBox="0 0 16 16" className="size-4">
                        <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="pointer-events-none absolute -right-4 -top-20 hidden xl:block">
              <div className="relative"><ElvoPeek pose="think" size={84} side="left" say="Pertanyaanmu tidak ada? Ketik saja di kolom cari." delay={0.3} /></div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
