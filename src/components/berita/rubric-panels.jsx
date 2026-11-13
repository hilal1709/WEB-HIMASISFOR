"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { NewsColumns } from "./news-columns";
import { ArticleJournal } from "./article-journal";
import { TearoffCalendar } from "./tearoff-calendar";
import { useWarta } from "./warta-provider";

const HEAD = {
  berita: { title: ["Kabar dari", "kampus"], body: "Liputan kegiatan, prestasi, dan pengumuman akademik, disusun dari yang terbaru." },
  artikel: { title: ["Tulisan &", "gagasan"], body: "Esai, catatan riset, dan kiat kuliah dari dosen, mahasiswa, dan praktisi mitra." },
  agenda: { title: ["Catat", "tanggalnya"], body: "Kuliah tamu, workshop, dan tenggat akademik. Sobek lembarnya untuk melihat acara berikutnya." },
};

/** Panel rubrik aktif. Berganti dengan tirai halaman (clip-path GSAP). */
export function RubricPanels() {
  const { rubric, sample } = useWarta();
  const ref = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (prefersReducedMotion() || !ref.current) return;
    const t = gsap.fromTo(ref.current, { clipPath: "inset(0 0 0 100%)", opacity: 0.4 }, { clipPath: "inset(0 0 0 0%)", opacity: 1, duration: 0.7, ease: "expo.out", clearProps: "clipPath" });
    return () => t.kill();
  }, [rubric]);

  const h = HEAD[rubric];
  const isSample = rubric === "agenda" ? sample.events : sample.posts;

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div ref={ref} id={`panel-${rubric}`} role="tabpanel" aria-label={h.title.join(" ")}>
          <SectionHeader title={h.title} body={h.body} action={isSample ? <PlaceholderTag /> : null} />
          <div className="mt-10">
            {rubric === "berita" && <NewsColumns />}
            {rubric === "artikel" && <ArticleJournal />}
            {rubric === "agenda" && <TearoffCalendar />}
          </div>
        </div>
      </Container>
    </section>
  );
}
