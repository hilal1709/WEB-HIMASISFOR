"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, SectionHeader } from "@/components/home/shared";
import { cn } from "@/lib/utils";
import { useBeasiswa } from "./beasiswa-provider";

/**
 * Setelah diterima `#kewajiban`: lembar perjanjian penerima. Pilih beasiswa lewat chip kecil, lalu klausul
 * kewajibannya disorot stabilo emas satu per satu mengikuti gulir (ScrollTrigger scrub pada `--hl`:
 * garis bawah tebal per baris, tanpa gradien),
 * catatan tangan di margin kanan menjelaskan artinya. Prosedur tidak ditulis ulang — menaut ke halaman lain.
 */
export function Obligations() {
  const { items, open } = useBeasiswa();
  const withKeep = items.filter((s) => s.keep.length);
  const [slug, setSlug] = useState(withKeep[0]?.slug ?? null);
  const sheet = useRef(null);
  const s = withKeep.find((x) => x.slug === slug) ?? withKeep[0];

  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    const marks = el.querySelectorAll("[data-mark]");
    const notes = el.querySelectorAll("[data-note]");
    if (prefersReducedMotion()) {
      gsap.set(marks, { "--hl": 1 });
      gsap.set(notes, { opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      marks.forEach((m, i) => {
        gsap.fromTo(
          m,
          { "--hl": 0 },
          { "--hl": 1, ease: "none", scrollTrigger: { trigger: m.closest("li"), start: "top 78%", end: "top 48%", scrub: 0.6 } }
        );
        gsap.fromTo(notes[i], { opacity: 0, x: -10, rotate: -4 }, { opacity: 1, x: 0, rotate: -2, ease: "none", scrollTrigger: { trigger: m.closest("li"), start: "top 70%", end: "top 50%", scrub: 0.6 } });
      });
      gsap.from(el, { y: 24, opacity: 0, duration: 0.6, ease: "power3.out" });
    }, el);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [slug]);

  if (!s) return null;

  const links = [
    { href: "/layanan-akademik#layanan-surat-aktif", label: "Minta surat aktif kuliah", note: "Diminta hampir semua beasiswa" },
    { href: "/layanan-akademik#layanan-rekomendasi", label: "Ajukan surat rekomendasi prodi", note: "Untuk beasiswa mitra & lembaga" },
    { href: "/regulasi-akademik#simulasi", label: "Hitung IPS yang perlu kamu jaga", note: "Simulator di Regulasi Akademik" },
  ];

  return (
    <section id="kewajiban" className="relative scroll-mt-24 py-20 md:py-28">
      <Container>
        <SectionHeader
          title={["Diterima itu awal,", "bertahan", "itu kuncinya"]}
          body="Setiap beasiswa punya syarat selama kamu menerimanya. Baca perjanjiannya sebelum mendaftar, bukan sesudah dananya berhenti."
        />

        <div role="tablist" aria-label="Pilih beasiswa" className="mt-10 flex flex-wrap gap-2">
          {withKeep.map((x) => (
            <button
              key={x.slug}
              type="button"
              role="tab"
              aria-selected={x.slug === s.slug}
              onClick={() => setSlug(x.slug)}
              className={cn("bs-chip", x.slug === s.slug && "bs-chip-on")}
            >
              {x.name}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_300px] lg:gap-14">
          <article ref={sheet} key={s.slug} role="tabpanel" aria-label={`Perjanjian ${s.name}`} className="bs-contract">
            <header className="text-center">
              <span className="kicker block text-[10.5px] text-maroon">Perjanjian penerima beasiswa</span>
              <h3 className="mt-2 font-serif text-[clamp(1.5rem,2.6vw,2rem)] leading-tight text-navy">{s.name}</h3>
              <p className="mt-1 text-[13px] text-text/55">antara {s.org} dan mahasiswa penerima</p>
            </header>
            <ol className="mt-8 grid gap-7">
              {s.keep.map((k, i) => (
                <li key={i} className="grid gap-3 md:grid-cols-[1fr_200px] md:gap-8">
                  <p className="text-[15.5px] leading-[1.9] text-text/80">
                    <span className="mr-2 font-serif text-maroon">Pasal {i + 1}.</span>
                    <span data-mark className="bs-mark">
                      {k.clause}
                    </span>
                  </p>
                  <p data-note className="bs-note">
                    <span aria-hidden className="mr-1">↳</span>
                    {k.plain}
                  </p>
                </li>
              ))}
            </ol>
            <footer className="mt-10 grid grid-cols-2 gap-8 border-t border-dashed border-navy/20 pt-6 text-[12px] text-text/50">
              <span>
                <span className="block h-8 border-b border-navy/30" />
                Penerima
              </span>
              <span>
                <span className="block h-8 border-b border-navy/30" />
                {s.org}
              </span>
            </footer>
          </article>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-serif text-[1.25rem] leading-snug text-navy">Berkas yang biasanya diminta</p>
            <ul className="mt-4 grid gap-2.5">
              {s.docs.map((d) => (
                <li key={d} className="flex gap-3 text-[14px] leading-snug text-text/70">
                  <span aria-hidden className="mt-[7px] h-px w-4 shrink-0 bg-gold" />
                  {d}
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => open(s.slug)} className="mt-5 text-[14px] font-semibold text-maroon">
              <span className="u-gold">Buka rincian {s.name}</span>
            </button>
            <ul className="mt-10 border-b border-line">
              {links.map((l) => (
                <li key={l.href} className="border-t border-line">
                  <a href={l.href} className="group block py-4">
                    <span className="block text-[15px] font-semibold text-navy transition-transform duration-500 ease-cinematic group-hover:translate-x-1">{l.label}</span>
                    <span className="mt-0.5 block text-[12.5px] text-text/50">{l.note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Container>
    </section>
  );
}
