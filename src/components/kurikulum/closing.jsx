"use client";
import { Container } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";

const NEXT = [
  { href: "/dosen", title: "Dosen", body: "Pengampu mata kuliah dan bidang risetnya." },
  { href: "/profil-lulusan", title: "Profil Lulusan", body: "Peran yang dituju seluruh kurikulum ini." },
  { href: "/program-kelas", title: "Program Kelas", body: "Kurikulum yang sama, tiga ritme belajar." },
];

/** Penutup ringkas halaman Kurikulum: tautan lanjutan + Elvo. */
export function Closing() {
  return (
    <section className="relative bg-white pb-20 pt-14 md:pb-24">
      <Container className="relative">
        <div className="absolute -top-14 right-8 hidden lg:block">
          <div className="relative"><ElvoPeek pose="thumbs-up" size={72} side="left" say="Simpan halaman ini untuk tiap awal semester!" /></div>
        </div>
        <p className="kicker text-maroon">Lanjut menjelajah</p>
        <ul className="mt-5 grid gap-6 sm:grid-cols-3">
          {NEXT.map((n, i) => (
            <li key={n.href} data-aos="fade-up" data-aos-delay={i * 70}>
              <a href={n.href} className="group block">
                <span className="inline-flex items-center gap-2 font-serif text-[1.25rem] text-navy">
                  <span className="u-gold">{n.title}</span>
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4 text-maroon transition-transform duration-500 ease-cinematic group-hover:translate-x-1">
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="mt-1 block text-sm text-text/60">{n.body}</span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
