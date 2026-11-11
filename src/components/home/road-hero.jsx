import Image from "next/image";
import Link from "next/link";
import { LordIcon } from "@/components/media/lord-icon";
import { PMB_URL } from "@/lib/home-content";
import { ParallaxScene } from "./parallax";

/**
 * Papan arah kayu — tiap papan tautan ke bidang keahlian di bawah.
 * Kotak papan & tiang = posisi papan di ilustrasi (px pada bingkai 1536×864), sehingga papan HTML
 * menutup papan yang tergambar dan tidak pernah tampak dobel.
 */
const SIGNS = [
  { id: "audit", label: ["IT Audit &", "Governance"], board: [650, 137, 130, 70], post: [708, 205, 12, 64] },
  { id: "enterprise", label: ["Enterprise", "Systems"], board: [832, 205, 122, 62], post: [886, 265, 12, 38] },
  { id: "data", label: ["Data Science"], board: [1196, 394, 174, 70], post: [1277, 462, 13, 46] },
  { id: "msi", label: ["Manajemen SI"], board: [1284, 494, 222, 88], post: [1392, 470, 14, 226], arrow: true },
];
const pct = (v, total) => `${(v / total) * 100}%`;
const box = ([x, y, w, h]) => ({ left: pct(x, 1536), top: pct(y, 864), width: pct(w, 1536), height: pct(h, 864) });

/**
 * Layar pertama: jalan kapur berkelok di Gresik (mockup .impeccable/mocks/comp-road-v2.png).
 * Lapisan parallax: grup latar (gambar + logo + papan + bubble + Elvo, bergerak bersama — Elvo
 * membesar seolah berlari mendekat), teks yang "dicat" di tembok, dan punggung bukit kapur di depan.
 */
export function RoadHero() {
  return (
    <ParallaxScene id="beranda" mode="hero" aria-labelledby="hero-title" className="road-hero">
      <div className="hero-layer scene-group" data-depth="7" data-zoom="0.12">
        <picture>
          <source media="(max-width: 767px)" srcSet="/plates/scene-mobile.webp" />
          <img
            src="/plates/scene.webp"
            alt="Ilustrasi jalan kapur berkelok di Gresik dengan laut biru dan pabrik semen di seberang"
            className="r-scene"
            fetchPriority="high"
          />
        </picture>

        <Link href="/" className="r-logo" aria-label="Sistem Informasi UISI, Universitas Internasional Semen Indonesia, ke beranda">
          <Image src="/plates/logo.png" alt="" fill sizes="22vw" className="object-contain object-left" priority />
        </Link>

        <nav aria-label="Empat bidang keahlian" className="contents">
          {SIGNS.map((s) => (
            <span key={s.id} className="contents">
              <span className="signpost__post" style={box(s.post)} aria-hidden="true" />
              <a href={`#bidang-${s.id}`} className={`signpost${s.arrow ? " signpost--arrow" : ""}`} style={box(s.board)}>
                {s.label.map((l) => (
                  <span key={l} className="block">{l}</span>
                ))}
              </a>
            </span>
          ))}
        </nav>

        <div className="r-elvo" data-approach>
          <div className="hero-elvo">
            <Image src="/plates/elvo.png" alt="Elvo, maskot Sistem Informasi UISI, berlari di jalan" fill sizes="29vw" className="object-contain object-bottom" priority />
          </div>
        </div>

        <p className="r-bubble speech-bubble" role="note">
          Ikut aku<br />jalan-jalan, ya!
        </p>
        <p className="r-far-cliff-text cliff-paint cliff-paint--far" aria-hidden="true">
          Gresik<br />Kota Semen<br />Indonesia
        </p>
      </div>

      {/* teks "dicat" di tembok kapur — bidang 3D mengikuti perspektif tembok */}
      <div className="hero-layer" data-depth="-22">
        <div className="wall-plane">
          <h1 id="hero-title" className="hero-title">
            <span className="r-headline-1">Menghubungkan</span>
            <span className="r-headline-2">Bisnis &amp; Sistem Informasi</span>
            <span className="r-headline-3">untuk Masa Depan</span>
          </h1>
          <p className="r-accreditation hero-accreditation">Terakreditasi Baik Sekali · LAM INFOKOM</p>
          <p className="r-cliff-tagline cliff-paint" aria-hidden="true">
            Dari Gresik<br />untuk Indonesia<br />lebih maju
            <span className="cliff-paint__dash" />
          </p>
        </div>
        <a href={PMB_URL} className="r-cta-primary hero-cta hero-cta--primary">
          Daftar Sekarang
          <LordIcon name="arrow-right" size={28} trigger="hover" target=".hero-cta--primary" colors="primary:#ffffff,secondary:#ffffff" />
        </a>
        <Link href="/curiculum" className="r-cta-secondary hero-cta hero-cta--secondary">
          Lihat Kurikulum
          <LordIcon name="book" size={26} trigger="hover" target=".hero-cta--secondary" colors="primary:#0b1b45,secondary:#0b1b45" />
        </Link>
      </div>

      {/* punggung bukit kapur di latar paling depan: transisi ke babak berikutnya */}
      <div className="hero-ridge" data-depth="-40" aria-hidden="true" />
    </ParallaxScene>
  );
}
