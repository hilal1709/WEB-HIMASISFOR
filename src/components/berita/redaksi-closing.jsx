"use client";
import { Container } from "@/components/home/shared";

const NEXT = [
  { label: "Arsip prestasi", body: "Semua capaian dosen & mahasiswa per tahun", href: "/achievement" },
  { label: "Lowongan magang", body: "Posisi yang sedang dibuka mitra industri", href: "/magang#lowongan" },
  { label: "Layanan akademik", body: "Ajukan surat dan lacak prosesnya", href: "/layanan-akademik" },
];

/**
 * Penutup: tiga tautan lanjutan bergaya indeks halaman koran (garis rangkap, "Halaman 02…").
 * Sengaja tanpa panel langganan/CTA — RSS tetap tersedia lewat <link rel="alternate"> di metadata,
 * dan tautan sosial sudah ada di footer.
 */
export function RedaksiClosing() {
  return (
    <section className="pb-20 pt-6 md:pb-28">
      <Container>
        <nav aria-label="Lanjut ke halaman lain" className="grid border-t-[3px] border-double border-navy md:grid-cols-3">
          {NEXT.map((l, i) => (
            <a key={l.href} href={l.href} data-aos="fade-up" data-aos-delay={i * 60} className={`wt-story group flex flex-col gap-1 py-6 md:px-6 ${i ? "border-t border-line md:border-l md:border-t-0" : "md:pl-0"}`}>
              <span className="kicker text-text/45">Halaman {String(i + 2).padStart(2, "0")}</span>
              <span className="wt-headline font-serif text-xl text-navy">{l.label}</span>
              <span className="text-sm text-text/60">{l.body}</span>
            </a>
          ))}
        </nav>
      </Container>
    </section>
  );
}
