"use client";
import { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { Container, PlaceholderTag, SectionHeader } from "@/components/home/shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { useBootcamp } from "./bootcamp-provider";

const ZOOM = 2.2;
const R = 78;

/** Isi sertifikat (dirender dua kali: dasar + salinan yang dibesarkan di dalam lensa). */
function Sheet({ title, hours, code, year }) {
  return (
    <div className="relative aspect-[1.414/1] w-full overflow-hidden rounded-lg border border-line bg-white p-[6%]">
      <div className="absolute inset-[3%] rounded border border-gold/60" />
      <div className="absolute inset-[4%] rounded border border-gold/25" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between">
          <span className="kicker text-[clamp(7px,1vw,10px)] text-maroon">S1 Sistem Informasi · UISI</span>
          <span className="tabular text-[clamp(7px,0.9vw,9.5px)] text-text/45">No. {code}</span>
        </div>
        <span className="mt-[5%] font-serif text-[clamp(1.1rem,2.6vw,2.2rem)] leading-none text-navy">Sertifikat Kompetensi</span>
        <span className="mt-[2%] text-[clamp(8px,1.1vw,12px)] text-text/55">diberikan kepada</span>
        <span className="mt-[2%] w-fit border-b border-navy/30 pb-1 font-serif text-[clamp(1rem,2.2vw,1.8rem)] italic text-maroon">Nama Pesertamu</span>
        <span className="mt-[3%] max-w-[70%] text-[clamp(8px,1.1vw,12.5px)] leading-relaxed text-text/70">
          telah menyelesaikan <b className="font-semibold text-navy">{title}</b> selama <b className="font-semibold text-navy">{hours} jam</b> belajar terbimbing, termasuk proyek akhir yang dinilai praktisi.
        </span>
        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="flex gap-[8%]">
            {["Ketua Program Studi", "Mitra industri"].map((r) => (
              <span key={r} className="flex flex-col">
                <svg viewBox="0 0 90 26" aria-hidden className="h-[clamp(14px,2.2vw,26px)] w-auto text-navy">
                  <path d="M4 18c10-14 16 6 24-4s10-6 16 2 12-10 18-4 10 6 24-2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span className="mt-1 border-t border-navy/30 pt-1 text-[clamp(6.5px,0.85vw,9.5px)] text-text/55">{r}</span>
              </span>
            ))}
          </div>
          <div className="flex items-end gap-3">
            <svg viewBox="0 0 7 7" aria-label="Kode QR verifikasi" className="size-[clamp(28px,5vw,54px)]" shapeRendering="crispEdges">
              {[..."1110111100100110111011010101110111001001111101110"].map((b, k) => b === "1" && <rect key={k} x={k % 7} y={Math.floor(k / 7)} width="1" height="1" fill="var(--navy)" />)}
            </svg>
            <span className="grid size-[clamp(36px,6.5vw,72px)] place-items-center rounded-full bg-gold text-center font-serif text-[clamp(6px,0.9vw,10px)] leading-tight text-navy ring-4 ring-gold/30">
              {year}
              <br />
              terverifikasi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Sertifikat `#sertifikat` dengan pola Aceternity "Lens": kursor membesarkan bagian lembar (kode verifikasi, jam
 * belajar, tanda tangan). Jam belajar kohort aktif memberi perkiraan SKS yang ditautkan ke Konversi SKS.
 */
export function CertificateLens() {
  const { active, mode } = useBootcamp();
  const reduce = useReducedMotion();
  const box = useRef(null);
  const [hover, setHover] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 500, damping: 40 });
  const sy = useSpring(y, { stiffness: 500, damping: 40 });
  const clip = useMotionTemplate`circle(${R}px at ${sx}px ${sy}px)`;
  // perbesar di sekitar titik kursor: geser (1 − zoom) × posisi, lalu skala dari pojok kiri atas
  const tx = useTransform(sx, (v) => v * (1 - ZOOM));
  const ty = useTransform(sy, (v) => v * (1 - ZOOM));
  const zoomT = useMotionTemplate`translate(${tx}px, ${ty}px) scale(${ZOOM})`;

  const hours = active.weeks * active.hours;
  const year = active.start.slice(0, 4);
  const code = `SI-${active.slug.split("-")[0].toUpperCase()}-${year}-0142`;
  const move = (e) => {
    const r = box.current.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  return (
    <section id="sertifikat" className="relative scroll-mt-24 border-t border-line bg-cream py-16 md:py-24">
      <Container className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:gap-16">
        <div>
          <SectionHeader variant="rule" title={["Satu lembar,", "bisa dicek siapa saja"]} body="Arahkan kursor ke sertifikat untuk melihat detailnya dari dekat." />
          <dl className="mt-10 divide-y divide-line border-y border-line">
            <div className="flex items-baseline justify-between gap-6 py-4">
              <dt className="text-[14.5px] text-text/65">Kode verifikasi</dt>
              <dd className="tabular text-[14.5px] font-semibold text-navy">{code}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 py-4">
              <dt className="text-[14.5px] text-text/65">Jam belajar tercatat</dt>
              <dd className="tabular text-[14.5px] font-semibold text-navy">{hours} jam</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 py-4">
              <dt className="text-[14.5px] text-text/65">Perkiraan setara</dt>
              <dd className="text-right text-[14.5px]">
                <a href="/konversi-sks#kalkulator" className="font-semibold text-maroon">
                  <span className="u-gold">{active.sks} SKS</span>
                </a>
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex items-center gap-4">
            <LottieIllustration src="/lottie/certificate.json" label="Sertifikat terverifikasi" className="size-20 shrink-0" />
            <p className="text-[13.5px] leading-relaxed text-text/60">
              {mode === "bootcamp" ? "Kursus mandiri juga bersertifikat, tanpa penilaian proyek." : `Contoh di sini memakai kohort ${active.title}; sertifikat kursus mandiri tidak memuat penilaian proyek.`}
            </p>
          </div>
          {active.sample && <PlaceholderTag className="mt-5" />}
        </div>

        <div
          ref={box}
          onPointerEnter={(e) => (move(e), setHover(true))}
          onPointerMove={move}
          onPointerLeave={() => setHover(false)}
          className="relative cursor-none select-none rounded-xl shadow-[0_50px_90px_-50px_rgb(14_24_48/0.75)] [@media(pointer:coarse)]:cursor-auto"
          style={{ transform: "rotate(-1.2deg)" }}
        >
          <Sheet title={active.title} hours={hours} code={code} year={year} />
          {!reduce && (
            <motion.div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg" style={{ clipPath: clip, opacity: hover ? 1 : 0, transition: "opacity .25s" }}>
              <motion.div className="absolute inset-0 origin-top-left" style={{ transform: zoomT }}>
                <Sheet title={active.title} hours={hours} code={code} year={year} />
              </motion.div>
            </motion.div>
          )}
          {!reduce && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 rounded-full border-2 border-gold"
              style={{ width: R * 2, height: R * 2, x: sx, y: sy, translateX: "-50%", translateY: "-50%", opacity: hover ? 1 : 0, transition: "opacity .25s" }}
            />
          )}
        </div>
      </Container>
    </section>
  );
}
