"use client";
import { PMB_URL } from "@/lib/home-content";
import { Banner } from "@/components/ui/banner";
import { ArrowLink, Container } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";

const NEXT = [
  { href: "/sambutan-kaprodi", kicker: "Profil", title: "Sambutan Kaprodi", body: "Pesan dari ketua program studi." },
  { href: "/curiculum", kicker: "Akademik", title: "Kurikulum", body: "Mata kuliah per bidang keahlian." },
  { href: "/profile#dosen", kicker: "Profil", title: "Dosen", body: "Pengajar dan bidang risetnya." },
];

/** Penutup ramping: banner PMB + tautan lanjutan (CTA besar sudah ada di beranda). */
export function Closing() {
  return (
    <section className="relative bg-cream-2 py-16 md:py-20">
      <Container>
        <Banner
          variant="brand"
          dismissible
          title="Pendaftaran mahasiswa baru telah dibuka"
          action={
            <ArrowLink href={PMB_URL} tone="dark" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex">
              Daftar
            </ArrowLink>
          }
        >
          Jadilah bagian dari perjalanan menuju 2030 bersama Sisforians.
        </Banner>

        <div className="relative mt-12 grid gap-4 md:grid-cols-3">
          <div className="absolute -top-20 right-2 hidden xl:block">
            <div className="relative"><ElvoPeek pose="thumbs-up" size={84} say="Masih penasaran? Jelajahi halaman lainnya." delay={0.2} /></div>
          </div>
          {NEXT.map((n, i) => (
            <a
              key={n.href}
              href={n.href}
              data-aos="fade-up"
              data-aos-delay={i * 80}
              className="group relative overflow-hidden rounded-lg border border-line bg-white p-6 transition-[transform,border-color,box-shadow] duration-500 ease-cinematic hover:-translate-y-1 hover:border-navy/20 hover:shadow-[0_24px_50px_-36px_rgb(20_33_61/0.55)]"
            >
              <span aria-hidden className="absolute inset-x-0 top-0 block h-[3px] origin-left scale-x-0 bg-gold transition-transform duration-700 ease-cinematic group-hover:scale-x-100" />
              <p className="kicker text-maroon">{n.kicker}</p>
              <p className="mt-2 font-serif text-[1.45rem] text-navy">{n.title}</p>
              <p className="mt-1 text-sm text-text/60">{n.body}</p>
              <svg aria-hidden viewBox="0 0 16 16" className="absolute bottom-6 right-6 size-4 text-maroon transition-transform duration-500 ease-cinematic group-hover:translate-x-1">
                <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
