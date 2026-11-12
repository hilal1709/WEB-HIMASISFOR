"use client";
import { useEffect, useRef } from "react";
import { animate, stagger, svg } from "animejs";
import { gsap } from "@/lib/scroll";
import { countUp, prefersReducedMotion } from "@/lib/motion";
import { CURTAIN_KEY } from "@/lib/kurikulum-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { LordIcon } from "@/components/media/lord-icon";
import { CurriculumMapIllustration } from "@/components/illustrations/line-illustrations";
import { useKurikulum } from "./kurikulum-provider";

export function smoothTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

/**
 * Hero Kurikulum: judul serif besar di kiri, tangga delapan semester di kanan (tergambar anime.js;
 * anak tangga ≤ semester aktif menyala). Tiga angka dihitung dari data kurikulum, bukan dikarang.
 */
export function KurikulumHero() {
  const { totals, semester, setSemester, openSearch } = useKurikulum();
  const ref = useRef(null);
  const art = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(CURTAIN_KEY) === "1";
    } catch {}
    const delay = seen ? 0.15 : 1.9;
    const nums = el.querySelectorAll("[data-count]");
    if (prefersReducedMotion()) return;
    nums.forEach((n) => (n.textContent = "0"));
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay });
    }, el);
    const lines = art.current.querySelectorAll("[data-line]");
    const d = svg.createDrawable(lines);
    const draw = animate(d, { draw: ["0 0", "0 1"], duration: 1300, delay: stagger(30, { start: delay * 1000 }), ease: "inOutCubic" });
    const t = setTimeout(() => nums.forEach((n) => countUp(n, Number(n.dataset.count))), delay * 1000 + 300);
    return () => {
      ctx.revert();
      draw.revert?.();
      clearTimeout(t);
    };
  }, []);

  const facts = [
    { n: totals.sks, label: "SKS untuk lulus" },
    { n: totals.wajib, label: "mata kuliah wajib" },
    { n: totals.pilihan, label: "mata kuliah pilihan" },
  ];

  return (
    <section ref={ref} className="relative overflow-hidden pb-14 pt-10 md:pb-20 md:pt-14">
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
            <dl data-hero-fade className="mt-10 grid max-w-lg grid-cols-3 divide-x divide-line border-y border-line">
              {facts.map((f) => (
                <div key={f.label} className="px-4 py-4 first:pl-0">
                  <dt className="sr-only">{f.label}</dt>
                  <dd>
                    <span data-count={f.n} className="block font-serif text-[clamp(1.9rem,3.4vw,2.6rem)] leading-none tabular-nums text-navy">
                      {f.n.toLocaleString("id-ID")}
                    </span>
                    <span className="mt-1.5 block text-[13px] text-text/55">{f.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div
              ref={art}
              className="cur-map relative"
              onClick={(e) => {
                const g = e.target.closest?.("[data-step]");
                if (g) setSemester(Number(g.dataset.step));
              }}
            >
              <CurriculumMapIllustration active={semester} className="h-auto w-full text-ink" />
            </div>
            <p aria-live="polite" className="mt-2 text-right text-[13px] text-text/50">
              Kamu sedang melihat <span className="font-semibold text-navy">semester {semester}</span>
            </p>
            <div className="absolute -top-6 left-2 hidden xl:block">
              <div className="relative"><ElvoPeek pose="think" size={80} side="right" say="Klik anak tangga untuk melompat ke semesternya." delay={0.3} /></div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
