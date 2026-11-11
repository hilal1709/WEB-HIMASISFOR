"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { ScrollTrigger } from "@/lib/scroll";
import { countUp } from "@/lib/motion";
import { ACCREDITATION } from "@/lib/home-content";
import { Modal, ModalTrigger, ModalContent, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { Container, Eyebrow, SceneTitle } from "./shared";

/** Akreditasi: panel merah solid, statistik dihitung naik (anime.js), sertifikat bisa diperbesar (Dialog). */
export function AccreditationScene() {
  const stats = useRef(null);

  useEffect(() => {
    const el = stats.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () =>
        el.querySelectorAll("[data-count]").forEach((n) =>
          countUp(n, Number(n.dataset.count), { duration: 1600, format: n.dataset.plain ? (v) => String(v) : undefined })
        ),
    });
    return () => st.kill();
  }, []);

  return (
    <section id="akreditasi" className="bg-background py-6 md:py-10">
      <Container>
        <div className="relative overflow-hidden rounded-[28px] bg-brand-deep px-6 py-12 text-white sm:px-10 md:px-14 md:py-16">
          {/* ornamen garis tipis (bukan gradien) */}
          <svg aria-hidden viewBox="0 0 400 400" className="pointer-events-none absolute -right-24 -top-24 size-[420px] text-white/[0.07]">
            {[60, 100, 140, 180].map((r) => (
              <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="currentColor" strokeWidth="1" />
            ))}
          </svg>

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <div data-aos="fade-up">
                <Eyebrow tone="dark">{ACCREDITATION.eyebrow}</Eyebrow>
              </div>
              <SceneTitle title={ACCREDITATION.title} tone="dark" className="mt-4" />
              <p data-aos="fade-up" data-aos-delay="100" className="mt-4 max-w-md text-pretty leading-relaxed text-white/75">
                {ACCREDITATION.body}
              </p>
              <dl ref={stats} className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/15 pt-8">
                {ACCREDITATION.stats.map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <dt className="order-2 mt-2 text-xs text-white/65">
                      {s.label}
                      {s.placeholder && <span className="ml-1 text-white/45">(contoh)</span>}
                    </dt>
                    <dd
                      data-count={s.value}
                      data-plain={s.plain || undefined}
                      className="order-1 font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-semibold leading-none tabular"
                    >
                      {s.plain ? s.value : 0}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div data-aos="fade-up" data-aos-delay="150" className="rounded-2xl bg-background p-6 text-foreground shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Peringkat akreditasi</p>
                  <p className="font-display mt-1 text-3xl font-semibold tracking-[-0.02em] text-primary">{ACCREDITATION.grade}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{ACCREDITATION.issuer}</p>
                </div>
                <Modal>
                  <ModalTrigger className="group/cert relative block w-28 shrink-0 overflow-hidden rounded-lg border sm:w-32" aria-label="Lihat sertifikat akreditasi">
                    <Image
                      src={ACCREDITATION.certificate}
                      alt="Sertifikat akreditasi"
                      width={1151}
                      height={762}
                      className="h-auto w-full transition-transform duration-500 ease-cinematic group-hover/cert:scale-105"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-1 text-center text-[10px] font-medium text-white opacity-0 transition-opacity duration-300 group-hover/cert:opacity-100">
                      Perbesar
                    </span>
                  </ModalTrigger>
                  <ModalContent className="max-w-3xl p-3 sm:p-4">
                    <ModalTitle className="sr-only">Sertifikat akreditasi {ACCREDITATION.issuer}</ModalTitle>
                    <ModalDescription className="sr-only">{ACCREDITATION.body}</ModalDescription>
                    <Image src={ACCREDITATION.certificate} alt="Sertifikat akreditasi LAM INFOKOM" width={1151} height={762} className="h-auto w-full rounded-lg" />
                  </ModalContent>
                </Modal>
              </div>
              <dl className="mt-6 divide-y border-t">
                {ACCREDITATION.rows.map(([k, v]) => (
                  <div key={k} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 text-sm">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
