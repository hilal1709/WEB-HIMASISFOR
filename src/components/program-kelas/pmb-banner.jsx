"use client";
import { useEffect, useState } from "react";
import { PMB_URL } from "@/lib/home-content";
import { BANNER_KEY } from "@/lib/program-kelas-content";
import { Banner } from "@/components/ui/banner";
import { Container, PillLink } from "@/components/home/shared";

/** Banner pengumuman PMB (brand). Bila ditutup, tidak muncul lagi selama sesi. */
export function PmbBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(BANNER_KEY) === "1";
    } catch {}
    setShow(!hidden);
  }, []);

  if (!show) return null;
  return (
    <Container className="relative z-10 -mt-2 mb-4 md:mb-6" data-aos="fade-up">
      <div
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
          title="PMB 2027 sudah dibuka"
          action={
            <PillLink href={PMB_URL} variant="gold" size="sm" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex">
              Daftar
            </PillLink>
          }
        >
          Kuota Kelas Karyawan dan Kemitraan Industri terbatas. Amankan kursimu di gelombang pertama.
        </Banner>
      </div>
    </Container>
  );
}
