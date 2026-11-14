"use client";
import { useEffect, useState } from "react";
import { BANNER_KEY } from "@/lib/bidang-keahlian-content";
import { Banner } from "@/components/ui/banner";
import { PillLink } from "@/components/home/shared";

/** Catatan di rak pilihan (isi & varian dari Konsol). Ditutup → tidak muncul lagi selama sesi. */
export function BidangBanner({ banner, className }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(BANNER_KEY) === "1";
    } catch {}
    setShow(!hidden);
  }, []);

  if (!show || !banner?.show) return null;
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
          variant={banner.variant}
          dismissible
          title={banner.title}
          action={
            banner.linkLabel && banner.href ? (
              <PillLink href={banner.href} variant="gold" size="sm" className="hidden sm:inline-flex">
                {banner.linkLabel}
              </PillLink>
            ) : null
          }
        >
          {banner.body}
        </Banner>
      </div>
    </div>
  );
}
