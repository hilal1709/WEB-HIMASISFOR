"use client";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { useMagang } from "./magang-provider";

/**
 * Penutup: ajakan berkonsultasi dengan koordinator magang + tiga tautan lanjutan (baris editorial).
 * Tautan pertama mengikuti isi jejak: bila sudah ada yang diterima → Konversi SKS; selain itu → Bidang Keahlian.
 * Tanpa CTA PMB (tidak mengulang beranda).
 */
export function MagangClosing() {
  const { track, kp } = useMagang();
  const accepted = Object.values(track).includes("diterima");

  const links = [
    accepted
      ? { href: "/konversi-sks#alur", kicker: "Sudah diterima", title: "Ajukan konversi SKS" }
      : { href: "/bidang-keahlian", kicker: "Belum yakin posisinya?", title: "Cocokkan dengan bidang minatmu" },
    accepted
      ? { href: "/bidang-keahlian", kicker: "Bidang keahlian", title: "Kaitkan magang dengan peminatanmu" }
      : { href: "/konversi-sks#kalkulator", kicker: "Setelah selesai", title: "Cara magang diakui sebagai SKS" },
    { href: "/jalur-kelulusan", kicker: `Semester ${kp.semester} ke atas`, title: "Jadikan temuan magang topik tugas akhir" },
  ];

  return (
    <section className="relative border-t border-line bg-white pb-20 pt-16 md:pb-24 md:pt-20 lg:pt-28">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="relative">
          <span aria-hidden className="mb-5 block h-[3px] w-10 bg-gold" />
          <SceneTitle title={["Bingung mulai", "dari mana?"]} />
          <p className="mt-4 max-w-md text-pretty text-[16px] leading-relaxed text-text/65">
            Koordinator magang membuka konsultasi setiap pekan. Tunjukkan jejak lamaranmu, dan kalian bisa menyusun rencana bersama.
          </p>
          <a
            href="#kontak"
            className="group mt-7 inline-flex h-12 items-center gap-2 rounded-md bg-navy px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-navy-deep active:scale-[0.98]"
          >
            Hubungi koordinator magang
            <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5">
              <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <ul className="relative border-b border-line">
          {/* Elvo "bertengger" di garis atas daftar tautan — di dalam section, tidak terpotong */}
          <li aria-hidden={false} className="pointer-events-none absolute -top-[104px] right-6 hidden list-none lg:block">
            <span className="relative block"><ElvoPeek pose="thumbs-up" size={88} side="left" say="Satu lamaran terkirim lebih baik dari sepuluh rencana." /></span>
          </li>
          {links.map((l, i) => (
            <li key={l.title} className="border-t border-line" data-aos="fade-up" data-aos-delay={i * 80}>
              <a href={l.href} className="group flex items-center gap-5 py-6">
                <span className="min-w-0 flex-1">
                  <span className="kicker block text-[11px] text-maroon">{l.kicker}</span>
                  <span className="mt-1.5 block font-serif text-[clamp(1.3rem,2.2vw,1.75rem)] leading-tight text-navy transition-transform duration-500 ease-cinematic group-hover:translate-x-1.5">
                    {l.title}
                  </span>
                </span>
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-maroon transition-[background-color,border-color,color,transform] duration-500 ease-cinematic group-hover:-rotate-45 group-hover:border-maroon group-hover:bg-maroon group-hover:text-white">
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4">
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
