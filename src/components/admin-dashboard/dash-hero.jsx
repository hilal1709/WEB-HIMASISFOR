"use client";
import Link from "next/link";
import { WordRotate } from "@/components/motion/word-rotate";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { ElvoPeek } from "@/components/home/elvo-peek";

/** Panel hero maroon: sapaan, satu kalimat kerja, dan ilustrasi grafik. Tidak memuat angka (itu tugas pita statistik). */
export function DashHero({ firstName, pendingCount }) {
  return (
    <section data-aos="fade-up" className="grain relative isolate overflow-hidden rounded-xl bg-maroon text-white">
      <div className="relative z-10 grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-6 lg:p-12">
        <div className="min-w-0">
          <p className="kicker text-gold-soft">Selamat datang kembali{firstName ? `, ${firstName}` : ""}</p>
          <h1 className="mt-4 font-serif text-[2.1rem] leading-[1.08] tracking-[-0.01em] sm:text-5xl lg:text-[3.4rem]">
            Ada yang perlu{" "}
            <span className="block italic text-gold-soft sm:inline">
              <WordRotate words={["dirapikan", "dipublikasikan", "diverifikasi"]} interval={2800} />
            </span>{" "}
            hari ini?
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
            {pendingCount > 0
              ? "Antrean layanan, warta, dan agenda prodi dikelola dari satu halaman."
              : "Antrean layanan sedang kosong. Waktu yang tepat untuk merapikan warta dan agenda."}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/admin/warta"
              className="group inline-flex h-11 items-center gap-2 rounded-md bg-gold px-5 text-sm font-semibold text-navy-deep shadow-sm transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Tulis warta baru
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[300px] items-center justify-center lg:max-w-none">
          <LottieIllustration src="/lottie/data-chart-dark.json" className="w-full max-w-[280px]" label="Grafik ringkasan kerja" />
          <div className="absolute -bottom-6 -right-2 hidden sm:block">
            <ElvoPeek pose="wave" size={96} side="right" tone="dark" say="Sudah siap bekerja!" />
          </div>
        </div>
      </div>
    </section>
  );
}
