"use client";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { useJalur } from "./jalur-provider";

/**
 * Penutup ringkas: satu kalimat arahan + tautan lanjutan. Tautan pertama mengikuti jalur yang sedang dicek
 * (skripsi → RPS Metode Penelitian; jalur lain → ringkasan jalurnya). Tanpa CTA PMB (tidak mengulang beranda).
 */
export function JalurClosing() {
  const { paths, active, method, thesis, openPath } = useJalur();
  const p = paths[active];

  const next = [
    p.key === "skripsi" && method?.slug
      ? { href: `/curiculum#rps-${method.slug}`, kicker: `Semester ${method.semester}`, title: method.nama }
      : { onClick: () => openPath(active), kicker: `Jalur ${p.title}`, title: "Ringkasan tahapannya" },
    { href: "/curiculum#semester", kicker: `Semester ${thesis.semester}`, title: "Beban studi tahun terakhir" },
    { href: "/bidang-keahlian", kicker: "Bidang keahlian", title: "Tentukan topik dari minatmu" },
    { href: "/dosen", kicker: "Dosen", title: "Temukan calon pembimbing" },
  ];

  return (
    <section className="relative overflow-hidden pb-20 pt-16 md:pb-24 md:pt-20">
      <Container>
        <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <span aria-hidden className="mb-5 block h-[3px] w-10 bg-gold" />
            <SceneTitle title={["Masih ragu?", "Mulai dari", "satu percakapan."]} />
            <p className="mt-4 max-w-md text-pretty text-[16px] leading-relaxed text-text/65">
              Dosen wali bisa membantumu menimbang jalur sebelum semester {thesis.semester} dimulai. Bawa hasil cek kesiapanmu sebagai bahan diskusi.
            </p>
          </div>
          <div className="pointer-events-none absolute -top-10 right-0 hidden lg:block">
            <div className="relative"><ElvoPeek pose="thumbs-up" size={110} side="left" say="Ngobrol dulu, baru pilih." /></div>
          </div>
        </div>

        <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {next.map((l) => {
            const inner = (
              <>
                <span>
                  <span className="kicker block text-[11px] text-maroon">{l.kicker}</span>
                  <span className="mt-1 block font-serif text-[1.15rem] leading-tight text-navy">{l.title}</span>
                </span>
                <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0 text-maroon transition-transform duration-500 ease-cinematic group-hover:translate-x-1">
                  <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            );
            const cls = "group flex h-full w-full items-center justify-between gap-4 p-5 text-left transition-colors duration-300 hover:bg-cream sm:p-6";
            return (
              <li key={l.title} className="bg-white">
                {l.href ? (
                  <a href={l.href} className={cls}>{inner}</a>
                ) : (
                  <button type="button" onClick={l.onClick} className={cls}>{inner}</button>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
