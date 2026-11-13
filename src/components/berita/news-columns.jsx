"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { Flip, gsap } from "@/lib/scroll";
import { fmtDate } from "@/lib/berita-content";
import { prefersReducedMotion } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loader";
import { useToast } from "@/components/ui/toast";
import { Cover } from "./cover";
import { EmptyEdition } from "./empty-edition";
import { Highlight, useWarta } from "./warta-provider";

const STEP = 6;

/**
 * Rubrik Berita: kolom koran (CSS multi-column + garis rambut antarkolom), butir tanpa kotak.
 * Butir pertama berfoto besar + drop cap; selebihnya berganti ada/tanpa foto agar ritme kolom hidup.
 * Berita di halaman depan tidak diulang selama tidak sedang menyaring. Filter → GSAP Flip.
 */
export function NewsColumns() {
  const { results, front, category, query, visible, setVisible, busy } = useWarta();
  const toast = useToast();
  const ref = useRef(null);
  const flip = useRef(null);
  const [loading, setLoading] = useState(false);

  const filtering = Boolean(category || query);
  const frontSlugs = new Set(front.map((p) => p.slug));
  const all = results.berita.filter((p) => (filtering ? true : !frontSlugs.has(p.slug))).filter((p) => !category || p.category === category);
  const items = all.slice(0, visible);
  const more = all.length - items.length;
  const key = `${category}|${query}|${visible}`;

  // simpan posisi sebelum render berikutnya
  if (typeof window !== "undefined" && ref.current && flip.current?.key !== key) {
    flip.current = { key, state: Flip.getState(ref.current.querySelectorAll("[data-flip]")) };
  }
  useLayoutEffect(() => {
    const st = flip.current?.state;
    if (!st || prefersReducedMotion()) return;
    Flip.from(st, { duration: 0.6, ease: "expo.out", absolute: false, onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.04 }), onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.2 }) });
    flip.current.state = null;
  }, [key]);

  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisible((v) => v + STEP);
      setLoading(false);
      if (more <= STEP) toast.info("Itu edisi paling awal", { description: "Semua berita yang terbit sudah ditampilkan." });
    }, 450);
  };

  if (!busy && !all.length) return <EmptyEdition what="berita" />;

  return (
    <div>
      <div ref={ref} className="columns-1 gap-10 [column-rule:1px_solid_var(--line)] md:columns-2 lg:columns-3">
        {items.map((p, i) => {
          const big = i === 0;
          const photo = big || i % 3 === 2;
          return (
            <article key={p.slug} data-flip={p.slug} className="mb-9 break-inside-avoid">
              <a href={`/berita/${p.slug}`} className="wt-story group block">
                {photo && <Cover src={p.cover} sizes="(min-width:1024px) 360px, (min-width:768px) 45vw, 100vw" className={`mb-4 rounded-md ${big ? "aspect-[4/3]" : "aspect-[16/10]"}`} imgClassName="wt-ink transition-transform duration-[1.2s] ease-cinematic group-hover:scale-[1.04]" />}
                <p className="kicker flex gap-2 text-maroon">
                  <span>{p.category}</span>
                  <span aria-hidden className="text-text/25">/</span>
                  <time dateTime={p.publishedAt} className="text-text/50">{fmtDate(p.publishedAt)}</time>
                </p>
                <h3 className={`wt-headline mt-2 font-serif leading-snug text-navy ${big ? "text-[1.75rem]" : "text-[1.3rem]"}`}>
                  <Highlight text={p.title} query={query} />
                </h3>
                <p className={`mt-2.5 text-[15px] leading-relaxed text-text/65 ${big ? "wt-dropcap" : "line-clamp-4"}`}>
                  <Highlight text={p.excerpt} query={query} />
                </p>
              </a>
            </article>
          );
        })}
        {loading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="mb-9 break-inside-avoid space-y-3">
              <Skeleton className="aspect-[16/10] bg-cream-2" />
              <Skeleton className="h-3 w-24 bg-cream-2" />
              <Skeleton className="h-6 w-4/5 bg-cream-2" />
              <Skeleton className="h-16 bg-cream-2" />
            </div>
          ))}
      </div>

      {more > 0 && (
        <div className="mt-4 flex items-center gap-5">
          <span aria-hidden className="h-px flex-1 bg-line" />
          <Button variant="outline-navy" loading={loading} onClick={loadMore}>
            Muat edisi sebelumnya <span className="tabular text-text/45">({more})</span>
          </Button>
          <span aria-hidden className="h-px flex-1 bg-line" />
        </div>
      )}
    </div>
  );
}
