"use client";
import { useEffect, useState } from "react";
import { BANNER_KEY } from "@/lib/dosen-content";
import { CONTACT_URL } from "@/lib/home-content";
import { Banner } from "@/components/ui/banner";
import { Container, PillLink } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";

const NEXT = [
  { href: "/struktur-organisasi", kicker: "Profil", title: "Struktur Organisasi", body: "Pimpinan prodi dan Minilab Sistem Informasi." },
  { href: "/curiculum", kicker: "Akademik", title: "Kurikulum", body: "Mata kuliah yang diampu para dosen." },
  { href: "/achievement", kicker: "Profil", title: "Prestasi", body: "Capaian dosen dan mahasiswa." },
];

/** Penutup: banner kolaborasi (tutup diingat selama sesi) + tautan lanjutan. Elvo `thumbs-up`. */
export function Closing() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(BANNER_KEY) === "1";
    } catch {}
    setShow(!hidden);
  }, []);

  return (
    <section className="relative py-16 md:py-20">
      <Container>
        {show && (
          <div
            className="relative mb-10"
            data-aos="fade-up"
            onClickCapture={(e) => {
              if (e.target.closest?.('[aria-label="Tutup banner"]')) {
                try {
                  sessionStorage.setItem(BANNER_KEY, "1");
                } catch {}
              }
            }}
          >
            <Banner
              variant="brand"
              dismissible
              title="Ingin berkolaborasi dengan dosen kami?"
              action={
                <PillLink href={CONTACT_URL} variant="gold" size="sm" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex">
                  Hubungi prodi
                </PillLink>
              }
            >
              Riset bersama, narasumber, magang, atau proyek industri: sekretariat prodi akan menghubungkan Anda dengan dosen yang tepat.
            </Banner>
            <div className="absolute -top-16 right-6 hidden lg:block">
              <div className="relative"><ElvoPeek pose="thumbs-up" size={72} say="Dosennya ramah, kok!" delay={0.2} /></div>
            </div>
          </div>
        )}
        <ul className="divide-y divide-line border-y border-line">
          {NEXT.map((n, i) => (
            <li key={n.href} data-aos="fade-up" data-aos-delay={i * 70}>
              <a href={n.href} className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-5 md:grid-cols-[140px_1fr_1.2fr_auto] md:py-6">
                <p className="kicker text-maroon">{n.kicker}</p>
                <p className="col-start-1 font-serif text-[1.4rem] leading-tight text-navy md:col-start-auto">
                  <span className="u-gold">{n.title}</span>
                </p>
                <p className="col-start-1 text-sm text-text/60 md:col-start-auto">{n.body}</p>
                <svg aria-hidden viewBox="0 0 16 16" className="col-start-2 row-span-3 row-start-1 size-5 text-maroon transition-transform duration-500 ease-cinematic group-hover:translate-x-1.5 md:col-start-auto md:row-span-1 md:row-start-auto">
                  <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
