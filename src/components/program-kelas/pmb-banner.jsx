"use client";
import { useEffect, useState } from "react";
import { BANNER_KEY } from "@/lib/program-kelas-content";
import { Banner } from "@/components/ui/banner";
import { Container, PillLink } from "@/components/home/shared";

/** Banner pengumuman (isi dari CMS). Bila ditutup, tidak muncul lagi selama sesi untuk `version` yang sama. */
export function PmbBanner({ content: b }) {
  const key = `${BANNER_KEY}:${b.version || "1"}`;
  const [show, setShow] = useState(false);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(key) === "1";
    } catch {}
    setShow(!hidden);
  }, [key]);

  if (!show) return null;
  return (
    <Container className="relative z-10 -mt-2 mb-4 md:mb-6" data-aos="fade-up">
      <div
        onClickCapture={(e) => {
          if (e.target.closest?.('[aria-label="Tutup banner"]')) {
            try {
              sessionStorage.setItem(key, "1");
            } catch {}
          }
        }}
      >
        <Banner
          variant={b.variant || "brand"}
          dismissible
          title={b.title}
          action={
            b.cta && b.href ? (
              <PillLink href={b.href} variant={b.variant === "brand" ? "gold" : "maroon"} size="sm" target={/^https?:/.test(b.href) ? "_blank" : undefined} rel="noopener noreferrer" className="hidden sm:inline-flex">
                {b.cta}
              </PillLink>
            ) : null
          }
        >
          {b.body}
        </Banner>
      </div>
    </Container>
  );
}
