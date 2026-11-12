"use client";
import { useEffect, useState } from "react";
import { BANNER_KEY } from "@/lib/regulasi-content";
import { Banner } from "@/components/ui/banner";
import { Container, PlaceholderTag } from "@/components/home/shared";
import { useRegulasi } from "./regulasi-provider";

/** Pengumuman berlakunya pedoman (brand). Tombolnya membuka modal dokumen Pedoman. Tutup diingat per sesi. */
export function RegulasiBanner() {
  const { notice, openDoc } = useRegulasi();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(BANNER_KEY) === "1";
    } catch {}
    setShow(!hidden);
  }, []);

  if (!show || !notice) return null;
  return (
    <Container className="relative z-10 -mt-4 mb-6 md:mb-10" data-aos="fade-up">
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
          title={notice.title}
          action={
            <button
              type="button"
              onClick={() => openDoc(0)}
              className="hidden h-10 items-center rounded-md bg-gold px-4 text-sm font-semibold text-navy transition-[background-color,transform] duration-300 hover:bg-gold-soft active:scale-[0.98] sm:inline-flex"
            >
              Buka pedoman
            </button>
          }
        >
          {notice.body}
          {notice.sample && <PlaceholderTag tone="dark" className="ml-2 align-middle" />}
        </Banner>
      </div>
    </Container>
  );
}
