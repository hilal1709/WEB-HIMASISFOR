"use client";
import { useEffect, useState } from "react";
import { BANNER_KEY } from "@/lib/kontak-content";
import { Banner } from "@/components/ui/banner";
import { useKontak } from "./kontak-provider";

/** Muncul hanya selama email & WhatsApp resmi belum diisi di CMS. Ditutup → hilang selama sesi. */
export function KontakBanner({ className }) {
  const { hasChannel, office } = useKontak();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(BANNER_KEY) === "1";
    } catch {}
    setShow(!hidden);
  }, []);

  if (hasChannel || !show) return null;

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
        <Banner variant="brand" dismissible title="Email & WhatsApp resmi prodi segera diumumkan">
          <span>
            Suratmu tetap bisa disusun dan disalin di sini, lalu diserahkan langsung ke {office.room}, {office.building}.
          </span>
        </Banner>
      </div>
    </div>
  );
}
