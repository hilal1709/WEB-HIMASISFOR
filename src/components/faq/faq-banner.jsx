"use client";
import { useEffect, useState } from "react";
import { BANNER_KEY } from "@/lib/faq-content";
import { Banner } from "@/components/ui/banner";
import { useFaq } from "./faq-provider";

/** Muncul selama masih ada kartu contoh (belum dikonfirmasi CMS). Ditutup → hilang selama sesi. */
export function FaqBanner({ className }) {
  const { cards } = useFaq();
  const [show, setShow] = useState(false);
  const pending = cards.some((c) => c.sample);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(BANNER_KEY) === "1";
    } catch {}
    setShow(!hidden);
  }, []);

  if (!pending || !show) return null;

  return (
    <div className={className}>
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
        <Banner variant="brand" dismissible title="Sebagian jawaban masih menunggu konfirmasi prodi">
          <span>Kartu bertanda contoh akan diperbarui. Untuk keputusan penting, ikuti tautan sumber di tiap kartu.</span>
        </Banner>
      </div>
    </div>
  );
}
