"use client";
import { useEffect, useState } from "react";
import { BANNER_KEY } from "@/lib/jalur-kelulusan-content";
import { Banner } from "@/components/ui/banner";
import { Container, PillLink, PlaceholderTag } from "@/components/home/shared";
import { useJalur } from "./jalur-provider";

/** Pengumuman periode sidang (brand). Bila ditutup, tidak muncul lagi selama sesi. */
export function JalurBanner() {
  const { notice } = useJalur();
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
    <Container className="relative z-10 mb-4 md:mb-8" data-aos="fade-up">
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
            <PillLink href="/#berita" variant="gold" size="sm" className="hidden sm:inline-flex">
              Agenda prodi
            </PillLink>
          }
        >
          {notice.body}
          {notice.sample && <PlaceholderTag tone="dark" className="ml-2 align-middle" />}
        </Banner>
      </div>
    </Container>
  );
}
