"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { gsap } from "@/lib/scroll";
import { curtainDelay, prefersReducedMotion } from "@/lib/motion";
import { CURTAIN_KEY, edition, fmtDate } from "@/lib/berita-content";
import { Container, PlaceholderTag } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { Cover } from "./cover";
import { useWarta } from "./warta-provider";

const roman = (n) => {
  const map = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [v, s] of map) while (n >= v) (out += s), (n -= v);
  return out;
};

function Meta({ p, className }) {
  return (
    <p className={`kicker flex flex-wrap items-center gap-x-2 text-maroon ${className ?? ""}`}>
      <span>{p.category}</span>
      <span aria-hidden className="text-text/25">/</span>
      <time dateTime={p.publishedAt} className="text-text/50">{fmtDate(p.publishedAt)}</time>
    </p>
  );
}

/**
 * Hero "Halaman Depan": masthead koran (nomor edisi & tanggal dari data), garis rangkap, berita utama
 * dengan foto terbuka clip-path + dua kolom sekunder dipisah garis rambut. "Telinga" koran di samping nama
 * terbitan meringkas isi edisi (jumlah tulisan & rubrik dari data). Tanpa ilustrasi garis.
 */
export function MastheadHero() {
  const { front, posts, sample } = useWarta();
  const ref = useRef(null);
  const ed = edition(posts);
  const [lead, ...side] = front;
  // tahun berdiri prodi 2014 → tahun terbit ke-
  const volume = ed.date ? new Date(ed.date).getFullYear() - 2013 : 1;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const delay = curtainDelay(CURTAIN_KEY);
    const ctx = gsap.context(() => {
      gsap.from("[data-mh-rule]", { scaleX: 0, transformOrigin: "left", duration: 1.1, ease: "expo.inOut", stagger: 0.12, delay });
      gsap.from("[data-mh-letter]", { yPercent: 110, duration: 0.9, ease: "expo.out", stagger: 0.035, delay: delay + 0.15 });
      gsap.from("[data-mh-fade]", { y: 14, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.06, delay: delay + 0.35 });
      gsap.from("[data-mh-photo]", { clipPath: "inset(0 0 100% 0)", duration: 1.3, ease: "expo.inOut", delay: delay + 0.45 });
      gsap.from("[data-mh-col]", { y: 24, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.12, delay: delay + 0.7 });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative pb-10 pt-8 md:pb-14 md:pt-12">
      <Container>
        <nav aria-label="Breadcrumb" data-mh-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Warta</li>
          </ol>
        </nav>

        {/* masthead */}
        <header className="relative mt-6">
          <div data-mh-fade className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-[12.5px] text-text/60">
            <span className="tabular">
              Tahun {roman(volume)} · Edisi No. {ed.number}
            </span>
            <span className="hidden sm:inline">Gresik, {fmtDate(ed.date)}</span>
            <span className="tabular">{posts.length} tulisan terbit</span>
          </div>
          <span data-mh-rule className="mt-3 block h-[3px] bg-navy" />
          <span data-mh-rule className="mt-[3px] block h-px bg-navy" />

          <div className="relative grid items-center gap-6 py-5 md:grid-cols-[1fr_auto] md:py-6">
            <h1 className="font-serif text-[clamp(3rem,8.4vw,7.75rem)] font-normal leading-[0.9] tracking-[-0.02em] text-navy">
              <span className="sr-only">Warta SISFOR — berita, artikel, dan agenda Program Studi Sistem Informasi UISI</span>
              <span aria-hidden className="inline-flex overflow-hidden pb-[0.08em]">
                {"Warta".split("").map((c, i) => (
                  <span key={i} data-mh-letter className="inline-block">
                    {c}
                  </span>
                ))}
              </span>{" "}
              <em aria-hidden className="inline-flex overflow-hidden pb-[0.08em] italic text-maroon">
                {"SISFOR".split("").map((c, i) => (
                  <span key={i} data-mh-letter className="inline-block">
                    {c}
                  </span>
                ))}
              </em>
            </h1>
            {/* "telinga" koran: ringkasan isi edisi, dihitung dari data */}
            <div data-mh-fade className="relative hidden w-[210px] border-2 border-navy px-4 py-3 text-center md:block">
              <span className="kicker block text-[10.5px] text-maroon">Dalam edisi ini</span>
              <span className="mt-1 block font-serif text-[2.4rem] leading-none tabular-nums text-navy">{posts.length}</span>
              <span className="block text-[12px] text-text/60">tulisan dari {new Set(posts.map((x) => x.category)).size} rubrik</span>
              <div className="pointer-events-none absolute -left-24 top-2 hidden xl:block">
                <div className="relative">
                  <ElvoPeek pose="think" size={80} say="Koran pagi sudah terbit. Mau baca yang mana dulu?" delay={0.6} />
                </div>
              </div>
            </div>
          </div>

          <span data-mh-rule className="block h-px bg-navy" />
          <p data-mh-fade className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm text-text/65">
            <span>Kabar kampus, gagasan dosen & mahasiswa, dan agenda Program Studi Sistem Informasi UISI.</span>
            {sample.posts && <PlaceholderTag />}
          </p>
          <span data-mh-rule className="block h-[3px] bg-navy" />
        </header>

        {/* halaman depan */}
        {lead && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.65fr_1fr] lg:gap-0">
            <a href={`/berita/${lead.slug}`} className="wt-story group lg:border-r lg:border-line lg:pr-10">
              <Cover data-mh-photo src={lead.cover} sizes="(min-width:1024px) 720px, 100vw" priority className="aspect-[16/9] rounded-md" imgClassName="transition-transform duration-[1.2s] ease-cinematic group-hover:scale-[1.04]" />
              <Meta p={lead} className="mt-5" />
              <h2 className="wt-headline mt-2 font-serif text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.05] text-navy">{lead.title}</h2>
              <p className="wt-dropcap mt-4 max-w-[62ch] text-[16.5px] leading-relaxed text-text/70">{lead.excerpt}</p>
              <p className="mt-4 text-sm text-text/50">{lead.readMinutes} menit baca</p>
            </a>
            <div className="grid content-start gap-7 lg:pl-10">
              {side.map((p, i) => (
                <a key={p.slug} data-mh-col href={`/berita/${p.slug}`} className={`wt-story group grid gap-4 sm:grid-cols-[1fr_9rem] lg:grid-cols-1 ${i ? "border-t border-line pt-7" : ""}`}>
                  <div>
                    <Meta p={p} />
                    <h3 className="wt-headline mt-2 font-serif text-[1.45rem] leading-snug text-navy">{p.title}</h3>
                    <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-text/65">{p.excerpt}</p>
                  </div>
                  {i === 0 && <Cover src={p.cover} sizes="(min-width:1024px) 380px, 40vw" className="aspect-[16/10] rounded-md sm:order-first lg:order-none" imgClassName="wt-ink" />}
                </a>
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
