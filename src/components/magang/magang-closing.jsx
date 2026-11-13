"use client";
import { Container } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { cn } from "@/lib/utils";
import { useMagang } from "./magang-provider";

/**
 * Penutup "jejak perjalanan": empat halte (Bidang → Magang → Konversi → Tugas akhir) dihubungkan garis.
 * Halte Magang ditandai "kamu di sini"; halte berikutnya yang disarankan mengikuti isi jejak lamaran
 * (sudah ada yang diterima → Konversi SKS; belum → Bidang Keahlian). Ajakan konsultasi sebaris di atasnya.
 */
export function MagangClosing() {
  const { track, kp } = useMagang();
  const accepted = Object.values(track).includes("diterima");

  const stops = [
    { href: "/bidang-keahlian", step: "Sebelum", title: "Bidang keahlian", body: "Cocokkan posisi dengan minatmu.", next: !accepted },
    { here: true, step: "Sekarang", title: "Magang", body: `${kp.nama} · ${kp.sks} SKS` },
    { href: "/konversi-sks#alur", step: "Sesudah", title: "Konversi SKS", body: "Ajukan agar magang diakui.", next: accepted },
    { href: "/jalur-kelulusan", step: `Semester ${kp.semester}+`, title: "Tugas akhir", body: "Jadikan temuan magang topiknya." },
  ];

  return (
    <section className="relative border-t border-line bg-white pb-20 pt-12 md:pb-20 md:pt-16">
      <Container>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl font-serif text-[clamp(1.35rem,2.4vw,1.8rem)] leading-snug text-navy">
            Bingung mulai dari mana? Koordinator magang membuka konsultasi setiap pekan.
          </p>
          <a
            href="#kontak"
            className="group inline-flex h-12 shrink-0 items-center gap-2 rounded-md bg-navy px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-navy-deep active:scale-[0.98]"
          >
            Hubungi koordinator
            <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5">
              <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div className="relative mt-14">
          <div className="pointer-events-none absolute -top-24 right-4 hidden lg:block">
            <div className="relative"><ElvoPeek pose="thumbs-up" size={84} side="left" say="Satu lamaran terkirim lebih baik dari sepuluh rencana." /></div>
          </div>
          {/* garis rute */}
          <span aria-hidden className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-line md:inset-x-[12.5%] md:bottom-auto md:left-[12.5%] md:top-[11px] md:h-0.5 md:w-auto" />
          <ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
            {stops.map((s, i) => {
              const dot = (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-0 grid size-6 place-items-center rounded-full border-2 bg-white md:left-1/2 md:-translate-x-1/2",
                    s.here ? "border-maroon bg-maroon" : s.next ? "border-gold" : "border-navy/30"
                  )}
                >
                  {s.here && <span className="size-2 rounded-full bg-white" />}
                </span>
              );
              const body = (
                <>
                  <span className={cn("kicker block text-[10.5px]", s.here ? "text-maroon" : "text-text/45")}>
                    {s.here ? "Kamu di sini" : s.next ? "Disarankan berikutnya" : s.step}
                  </span>
                  <span className={cn("mt-1.5 block font-serif text-[1.3rem] leading-tight", s.here ? "text-maroon" : "text-navy")}>
                    {s.href ? <span className="u-gold">{s.title}</span> : s.title}
                  </span>
                  <span className="mt-1 block text-[13.5px] leading-snug text-text/60">{s.body}</span>
                </>
              );
              return (
                <li key={s.title} data-aos="fade-up" data-aos-delay={i * 80} className="relative pl-10 md:pl-0 md:pt-11 md:text-center">
                  {dot}
                  {s.href ? (
                    <a href={s.href} className={cn("group block rounded-lg md:px-3", s.next && "md:-mx-1 md:bg-gold/10 md:py-3")}>{body}</a>
                  ) : (
                    <div className="md:px-3">{body}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
