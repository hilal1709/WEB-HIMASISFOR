"use client";
import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, EffectCreative, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-creative";
import { fmtDate } from "@/lib/berita-content";
import { prefersReducedMotion } from "@/lib/motion";
import { Cover } from "./cover";
import { EmptyEdition } from "./empty-edition";
import { Highlight, useWarta } from "./warta-provider";

/** Cincin waktu baca: terisi sesuai menit (maks. 12) saat baris di-hover/fokus. */
function ReadRing({ minutes }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const part = Math.min(minutes / 12, 1);
  return (
    <span className="relative grid size-11 shrink-0 place-items-center" aria-label={`${minutes} menit baca`}>
      <svg aria-hidden viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--line)" strokeWidth="2" />
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--gold)" strokeWidth="2.4" strokeLinecap="round" strokeDasharray={c} style={{ "--ring-full": c, "--ring-to": c * (1 - part) }} className="wt-ring" />
      </svg>
      <span className="tabular text-[13px] font-semibold text-navy">{minutes}′</span>
    </span>
  );
}

function Author({ p, tone = "light" }) {
  return (
    <span className="flex items-center gap-2">
      {p.authorPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.authorPhoto} alt="" className="size-7 rounded-full object-cover" />
      ) : (
        <span className={`grid size-7 place-items-center rounded-full font-serif text-xs ${tone === "light" ? "bg-cream-2 text-navy" : "bg-white/10 text-gold-soft"}`}>{p.author.replace(/^Dr\.?\s*/, "").slice(0, 1)}</span>
      )}
      <span className={tone === "light" ? "text-text/65" : "text-white/70"}>{p.author}</span>
    </span>
  );
}

/**
 * Pilihan Redaksi: Swiper `EffectCreative` seperti membalik halaman majalah (bayangan lipatan, poros di tepi),
 * autoplay 7 dtk dengan bar progres emas yang jeda saat di-hover; ‹ › + panah keyboard.
 */
function EditorsPick({ items }) {
  const bar = useRef(null);
  const [active, setActive] = useState(0);
  const reduce = typeof window !== "undefined" && prefersReducedMotion();
  if (!items.length) return null;
  return (
    <section aria-labelledby="pilihan-redaksi" className="relative mb-14 rounded-lg bg-navy p-5 text-white md:p-8">
      <div className="flex items-end justify-between gap-4">
        <h3 id="pilihan-redaksi" className="font-serif text-2xl md:text-3xl">
          Pilihan <em className="italic text-gold-soft">redaksi</em>
        </h3>
        <p className="tabular text-sm text-white/55">
          {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </p>
      </div>
      <span className="mt-4 block h-0.5 overflow-hidden bg-white/10">
        <span ref={bar} className="block h-full origin-left bg-gold" style={{ transform: "scaleX(0)" }} />
      </span>
      <Swiper
        modules={[EffectCreative, Autoplay, Keyboard, A11y]}
        effect="creative"
        grabCursor
        loop={items.length > 2}
        speed={reduce ? 0 : 900}
        keyboard={{ enabled: true }}
        autoplay={reduce ? false : { delay: 7000, pauseOnMouseEnter: true, disableOnInteraction: false }}
        creativeEffect={{
          prev: { shadow: true, origin: "left center", translate: ["-4%", 0, -220], rotate: [0, 72, 0] },
          next: { shadow: true, origin: "right center", translate: ["4%", 0, -220], rotate: [0, -72, 0] },
        }}
        onAutoplayTimeLeft={(_, __, progress) => bar.current && (bar.current.style.transform = `scaleX(${1 - progress})`)}
        onSlideChange={(s) => setActive(s.realIndex)}
        className="mt-6 !overflow-visible md:!overflow-hidden"
        a11y={{ prevSlideMessage: "Artikel sebelumnya", nextSlideMessage: "Artikel berikutnya" }}
      >
        {items.map((p) => (
          <SwiperSlide key={p.slug} className="!h-auto">
            <a href={`/berita/${p.slug}`} className="wt-story group grid h-full overflow-hidden rounded-md bg-white text-text md:grid-cols-[1.05fr_1fr]">
              <Cover src={p.cover} sizes="(min-width:768px) 560px, 100vw" className="aspect-[16/10] md:aspect-auto md:min-h-[320px]" imgClassName="transition-transform duration-[1.2s] ease-cinematic group-hover:scale-[1.04]" />
              <div className="flex flex-col p-6 md:p-8">
                <p className="kicker text-maroon">{p.category}</p>
                <h4 className="wt-headline mt-3 font-serif text-[clamp(1.5rem,2.4vw,2.1rem)] leading-tight text-navy">{p.title}</h4>
                <p className="mt-3 text-[15.5px] leading-relaxed text-text/65">{p.excerpt}</p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-6 text-sm">
                  <Author p={p} />
                  <span className="tabular text-text/45">{p.readMinutes} menit</span>
                </div>
              </div>
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

/**
 * Rubrik Artikel ala "jurnal": Pilihan Redaksi lalu daftar bernomor serif — nomor, judul, ringkasan, penulis,
 * dan cincin waktu baca yang terisi saat baris disentuh. Tanpa foto mengikuti kursor.
 */
export function ArticleJournal() {
  const { results, picks, category, query, busy } = useWarta();
  const filtering = Boolean(category || query);
  const pickSlugs = new Set(picks.map((p) => p.slug));
  const list = results.artikel.filter((p) => (filtering ? true : !pickSlugs.has(p.slug))).filter((p) => !category || p.category === category);

  return (
    <div>
      {!filtering && <EditorsPick items={picks} />}
      {!busy && !list.length && filtering ? (
        <EmptyEdition what="artikel" />
      ) : (
        <ol className="border-t border-navy/15">
          {list.map((p, i) => (
            <li key={p.slug} data-aos="fade-up" data-aos-delay={Math.min(i, 5) * 50} className="border-b border-line">
              <a href={`/berita/${p.slug}`} className="wt-story wt-row group grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-3 py-7 md:grid-cols-[4.5rem_1fr_auto] md:items-center md:gap-x-8">
                <span className="tabular font-serif text-2xl leading-none text-gold md:text-[2.6rem]">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <p className="kicker flex gap-2 text-maroon">
                    <span>{p.category}</span>
                    <span aria-hidden className="text-text/25">/</span>
                    <time dateTime={p.publishedAt} className="text-text/50">{fmtDate(p.publishedAt)}</time>
                  </p>
                  <h3 className="wt-headline mt-2 font-serif text-[clamp(1.35rem,2.2vw,1.85rem)] leading-snug text-navy">
                    <Highlight text={p.title} query={query} />
                  </h3>
                  <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-text/65">
                    <Highlight text={p.excerpt} query={query} />
                  </p>
                  <div className="mt-3 text-sm">
                    <Author p={p} />
                  </div>
                </div>
                <div className="col-start-2 md:col-start-auto">
                  <ReadRing minutes={p.readMinutes} />
                </div>
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
