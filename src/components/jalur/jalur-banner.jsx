"use client";
import { useEffect, useState } from "react";
import { BANNER_KEY } from "@/lib/jalur-kelulusan-content";
import { Banner } from "@/components/ui/banner";
import { PillLink } from "@/components/home/shared";
import { safeJalurUrl } from "@/lib/jalur-cms/schema";
import { JalurSample } from "./jalur-media";
import { useJalur } from "./jalur-provider";

/** Pengumuman periode sidang (brand), tampil di "Cek kesiapanku". Ditutup → tidak muncul lagi selama sesi. */
export function JalurBanner({ className }) {
  const { notice, preview, copy: { labels } } = useJalur();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(BANNER_KEY) === "1";
    } catch {}
    setShow(preview || !notice.dismissible || !hidden);
  }, [notice.dismissible, preview]);

  if (!show || !notice.visible || !(notice.title || notice.body)) return null;
  const href = safeJalurUrl(notice.href);
  return (
    <div className={className}>
      <div>
        <Banner
          variant="brand"
          dismissible={notice.dismissible}
          dismissLabel={labels.closeBanner}
          onDismiss={() => { if (!preview) try { sessionStorage.setItem(BANNER_KEY, "1"); } catch {} }}
          title={notice.title}
          action={
            href && notice.label && <PillLink href={href} variant="gold" size="sm" className="hidden sm:inline-flex">
              {notice.label}
            </PillLink>
          }
        >
          {notice.body}
          {notice.sample && <JalurSample tone="dark" className="ml-2 align-middle">{labels.sample}</JalurSample>}
        </Banner>
      </div>
    </div>
  );
}
