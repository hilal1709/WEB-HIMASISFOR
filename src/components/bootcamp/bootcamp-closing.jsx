"use client";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { smoothTo, useBootcamp } from "./bootcamp-provider";

/**
 * Penutup: panel navy yang kalimatnya mengikuti isi rencana / kohort aktif + tiga tautan editorial. Tanpa CTA PMB
 * dan tanpa FAQ (tidak mengulang halaman lain).
 */
export function BootcampClosing() {
  const { mode, active, planCourses, planHours, openCohort } = useBootcamp();
  const hasPlan = planCourses.length > 0;
  const body = hasPlan
    ? `Rencanamu berisi ${planCourses.length} kursus, ${planHours} jam. Mulai dari yang paling pendek supaya ritmenya terbentuk dulu.`
    : mode === "bootcamp"
      ? `Kursi ${active.title} tersisa ${active.seatsLeft}. Pendaftaran ditutup saat kursi habis atau seminggu sebelum kohort mulai.`
      : "Belum ada kursus di rencana. Pilih satu dari katalog — kamu bisa menjedanya kapan saja.";

  const links = [
    { href: "/konversi-sks#kalkulator", kicker: "Jam belajarmu", title: `Hitung jadi SKS — ±${active.sks} SKS untuk kohort ini` },
    { href: "/magang#lowongan", kicker: "Setelah sertifikat", title: "Pakai keahliannya di tempat magang" },
    { href: "/bidang-keahlian", kicker: "Biar searah", title: "Cocokkan dengan bidang keahlianmu" },
  ];

  return (
    <section className="relative border-t border-line bg-cream pb-28 pt-16 md:pb-32 md:pt-20 lg:pt-24">
      <Container className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative overflow-hidden rounded-xl bg-navy p-7 text-white sm:p-9">
          <LottieIllustration src="/lottie/laptop-code-dark.json" className="pointer-events-none absolute -right-4 -top-4 hidden size-40 opacity-90 sm:block" />
          <span aria-hidden className="mb-5 block h-[3px] w-10 bg-gold" />
          <SceneTitle tone="dark" title={hasPlan ? ["Rencana sudah ada,", "tinggal dimulai"] : ["Satu langkah", "sebelum mulai"]} className="max-w-[15ch]" />
          <p className="mt-4 max-w-md text-pretty text-[15.5px] leading-relaxed text-white/75">{body}</p>
          <button
            type="button"
            onClick={() => (mode === "bootcamp" && !hasPlan ? openCohort(active.slug) : smoothTo("katalog"))}
            className="group mt-7 inline-flex h-12 items-center gap-2 rounded-md bg-gold px-6 text-[15px] font-semibold text-navy transition-[background-color,transform] duration-300 hover:bg-gold-soft active:scale-[0.98]"
          >
            {mode === "bootcamp" && !hasPlan ? "Daftar kohort ini" : hasPlan ? "Tambah kursus lain" : "Buka katalog"}
            <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5">
              <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <ul className="relative border-b border-line">
          <li className="pointer-events-none absolute -top-[112px] right-6 hidden list-none xl:block">
            <span className="relative block"><ElvoPeek pose="laugh" size={92} side="left" say="Sertifikatnya bisa jadi SKS juga, lho." /></span>
          </li>
          {links.map((l, i) => (
            <li key={l.href} className="border-t border-line" data-aos="fade-up" data-aos-delay={i * 80}>
              <a href={l.href} className="group flex items-center gap-5 py-6">
                <span className="min-w-0 flex-1">
                  <span className="kicker block text-[11px] text-maroon">{l.kicker}</span>
                  <span className="mt-1.5 block font-serif text-[clamp(1.25rem,2.1vw,1.7rem)] leading-tight text-navy transition-transform duration-500 ease-cinematic group-hover:translate-x-1.5">{l.title}</span>
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
