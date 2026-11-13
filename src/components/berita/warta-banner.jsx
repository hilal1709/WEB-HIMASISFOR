"use client";
import { useEffect, useState } from "react";
import { BANNER_KEY } from "@/lib/berita-content";
import { Banner } from "@/components/ui/banner";
import { Container } from "@/components/home/shared";

/** Ajakan mengirim liputan ke redaksi. Ditutup → hilang selama sesi. */
export function WartaBanner() {
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
    <Container className="mt-2">
      <div
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
          title="Punya kabar dari kegiatanmu?"
          action={
            <a href="/kontak" className="inline-flex h-9 items-center rounded-md bg-gold px-3.5 text-sm font-semibold text-navy transition-colors hover:bg-gold-soft">
              Kirim ke redaksi
            </a>
          }
        >
          Lomba, kepanitiaan, atau riset kelompok bisa jadi berita. Kirim foto dan ringkasannya, redaksi yang menyunting.
        </Banner>
      </div>
    </Container>
  );
}
