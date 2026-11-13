"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { CURTAIN_KEY } from "@/lib/kurikulum-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { LordIcon } from "@/components/media/lord-icon";
import { useKurikulum } from "./kurikulum-provider";

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

/**
 * Hero Kurikulum "daftar isi": judul + palet cari mata kuliah di kiri, halaman "Daftar isi" bergaya buku
 * di kanan (bab I–IV dengan titik penuntun) yang menggulir ke tiap bagian. Angka ringkas dihitung dari data.
 */
export function KurikulumHero() {
  const { totals, openSearch } = useKurikulum();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const d = curtainDelay(CURTAIN_KEY);
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay: d });
      gsap.from("[data-toc]", { y: 24, opacity: 0, rotate: -1, duration: 1, ease: "expo.out", delay: d + 0.15 });
      gsap.from("[data-toc-row]", { opacity: 0, x: 16, duration: 0.6, stagger: 0.07, ease: "expo.out", delay: d + 0.4 });
    }, el);
    return () => ctx.revert();
  }, []);

  const toc = [
    { id: "peta", title: "Peta studi", note: "rumpun & prasyarat", page: "Smt 1–8" },
    { id: "semester", title: "Buku semester", note: "mata kuliah per semester", page: `${totals.sks} SKS` },
    { id: "pilihan", title: "Mata kuliah pilihan", note: "semester 7 & 8", page: `${totals.pilihan} mk` },
    { id: "rps", title: "Cara membaca RPS", note: "capaian, topik, penilaian", page: "4 bagian" },
  ];

  return (
    <section ref={ref} className="relative overflow-hidden pb-10 pt-10 md:pb-14 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li>Akademik</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Kurikulum & RPS</li>
          </ol>
        </nav>

        <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-14">
          <div>
            <span aria-hidden data-hero-fade className="mb-6 block h-[3px] w-10 bg-gold" />
            <SceneTitle as="h1" trigger="mount" title={["Delapan semester,", "satu peta", "menuju S.Kom."]} className="!text-[clamp(2.5rem,4.8vw,4.25rem)] !leading-[1]" />
            <p data-hero-fade className="mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-text/70">
              Lihat urutan mata kuliah dari semester pertama sampai tugas akhir, lalu buka rencana pembelajaran tiap mata kuliah: capaian, topik mingguan, dan cara penilaiannya.
            </p>
            <div data-hero-fade className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => smoothTo("peta")}
                className="group inline-flex h-12 items-center gap-2 rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
              >
                Jelajahi peta studi
                <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5">
                  <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={openSearch}
                className="cur-search-btn group inline-flex h-12 items-center gap-3 rounded-md border border-navy/20 bg-white pl-4 pr-3 text-[15px] text-text/60 transition-[border-color,box-shadow] duration-300 hover:border-navy/40 hover:shadow-[0_12px_30px_-20px_rgb(20_33_61/0.6)]"
              >
                <LordIcon name="document" size={22} target=".cur-search-btn" colors="primary:#14213d,secondary:#6e1423" />
                <span>Cari mata kuliah</span>
                <kbd className="ml-3 rounded border border-line bg-cream px-1.5 py-0.5 font-sans text-[11px] text-text/50">Ctrl K</kbd>
              </button>
            </div>
            <p data-hero-fade className="mt-8 text-[14px] text-text/55">
              <span className="font-semibold text-navy">{totals.sks} SKS</span> untuk lulus · {totals.wajib} mata kuliah wajib · {totals.pilihan} pilihan
            </p>
          </div>

          {/* daftar isi bergaya halaman buku */}
          <div className="relative">
            <span aria-hidden className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-sm border border-line bg-cream-2" />
            <nav
              data-toc
              aria-label="Daftar isi halaman kurikulum"
              className="relative rounded-sm border border-line bg-white px-6 pb-7 pt-8 shadow-[0_40px_80px_-50px_rgb(20_33_61/0.45)] sm:px-10 sm:pb-9 sm:pt-10"
            >
              <p className="text-center font-serif text-[1.6rem] italic text-navy">Daftar isi</p>
              <span aria-hidden className="mx-auto mt-3 block h-px w-12 bg-gold" />
              <ol className="mt-7 space-y-1">
                {toc.map((t, i) => (
                  <li key={t.id} data-toc-row>
                    <button type="button" onClick={() => smoothTo(t.id)} className="group flex w-full items-baseline gap-3 rounded py-2.5 text-left outline-none focus-visible:bg-cream">
                      <span className="w-6 shrink-0 font-serif text-[15px] tabular-nums text-gold">{["I", "II", "III", "IV"][i]}</span>
                      <span className="min-w-0">
                        <span className="block font-serif text-[1.2rem] leading-tight text-navy transition-colors group-hover:text-maroon sm:text-[1.3rem]">{t.title}</span>
                        <span className="block text-[12.5px] text-text/50">{t.note}</span>
                      </span>
                      <span aria-hidden className="mx-1 min-w-6 flex-1 translate-y-[-4px] border-b border-dotted border-navy/30" />
                      <span className="shrink-0 text-[13px] tabular-nums text-text/60 transition-colors group-hover:text-maroon">{t.page}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="absolute -right-6 -top-16 hidden xl:block">
              <div className="relative"><ElvoPeek pose="think" size={80} side="left" say="Mulai dari bab mana pun, semuanya saling terhubung." delay={0.3} /></div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
