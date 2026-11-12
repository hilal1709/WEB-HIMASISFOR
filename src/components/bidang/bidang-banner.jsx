"use client";
import { useEffect, useState } from "react";
import { BANNER_KEY } from "@/lib/bidang-keahlian-content";
import { Banner } from "@/components/ui/banner";
import { PillLink } from "@/components/home/shared";

/** Catatan kapan bidang dipilih (brand), tampil di rak pilihan saat memutuskan. Ditutup → tidak muncul lagi selama sesi. */
export function BidangBanner({ className }) {
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
    <div className={className}>
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
          title="Fokus bidang dikunci di semester 7"
          action={
            <PillLink href="/curiculum#pilihan" variant="gold" size="sm" className="hidden sm:inline-flex">
              Slot pilihan
            </PillLink>
          }
        >
          Enam semester pertama membekali dasar keempat bidang. Mata kuliah pilihan di semester 7 dan 8 yang menentukan ke mana kamu mendalam.
        </Banner>
      </div>
    </div>
  );
}
