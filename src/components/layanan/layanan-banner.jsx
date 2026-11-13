"use client";
import { useEffect, useState } from "react";
import { BANNER_KEY } from "@/lib/layanan-content";
import { Banner } from "@/components/ui/banner";
import { PlaceholderTag } from "@/components/home/shared";
import { useLayanan } from "./layanan-provider";

/** Pengumuman layanan (CMS `notice`). Bila ditutup, tidak muncul lagi selama sesi. */
export function LayananBanner({ className }) {
  const { notice, openWizard } = useLayanan();
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
        <Banner
          variant="brand"
          dismissible
          title={notice.title}
          action={
            <button
              type="button"
              onClick={() => openWizard(notice.service ? { serviceKey: notice.service } : {})}
              className="hidden h-10 items-center rounded-md bg-gold px-4 text-sm font-semibold text-navy transition-[background-color,transform] duration-300 hover:bg-gold-soft active:scale-[0.97] sm:inline-flex"
            >
              Ajukan sekarang
            </button>
          }
        >
          {notice.body && <span>{notice.body}</span>}
          <button
            type="button"
            onClick={() => openWizard(notice.service ? { serviceKey: notice.service } : {})}
            className="mt-2 block text-[13px] font-semibold text-gold-soft underline decoration-gold/50 underline-offset-4 sm:hidden"
          >
            Ajukan sekarang
          </button>
          {notice.sample && <PlaceholderTag tone="dark" className="mt-2" />}
        </Banner>
      </div>
    </div>
  );
}
