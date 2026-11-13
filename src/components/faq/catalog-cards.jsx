"use client";
import { Fragment, useLayoutEffect as useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import AOS from "aos";
import { gsap, Flip, ScrollTrigger } from "@/lib/scroll";
import { fold } from "@/lib/faq-content";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, SectionHeader, PlaceholderTag } from "@/components/home/shared";
import { FaqBanner } from "./faq-banner";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { LordIcon } from "@/components/media/lord-icon";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { DrawerRail } from "./drawer-rail";
import { cardId, useFaq } from "./faq-provider";

const VOTES_KEY = "sisfor:faq:votes";

/** Sorot kata kunci di dalam teks (tanpa peduli huruf besar/aksen). */
function Highlight({ text, query }) {
  const words = fold(query).split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return text;
  const folded = fold(text);
  const marks = [];
  words.forEach((w) => {
    let i = folded.indexOf(w);
    while (i !== -1) {
      marks.push([i, i + w.length]);
      i = folded.indexOf(w, i + w.length);
    }
  });
  if (!marks.length) return text;
  marks.sort((a, b) => a[0] - b[0]);
  const out = [];
  let at = 0;
  marks.forEach(([s, e], k) => {
    if (s < at) return;
    out.push(<Fragment key={`t${k}`}>{text.slice(at, s)}</Fragment>, <mark key={`m${k}`} className="fq-hl">{text.slice(s, e)}</mark>);
    at = e;
  });
  out.push(<Fragment key="end">{text.slice(at)}</Fragment>);
  return out;
}

function useVotes() {
  const [votes, setVotes] = useState({});
  useEffect(() => {
    try {
      setVotes(JSON.parse(localStorage.getItem(VOTES_KEY) || "{}"));
    } catch {}
  }, []);
  const vote = (slug, v) =>
    setVotes((cur) => {
      const next = { ...cur, [slug]: v };
      try {
        localStorage.setItem(VOTES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  return [votes, vote];
}

function CardBody({ card, query, vote, voted, onAsk }) {
  const toast = useToast();
  const body = useRef(null);

  useEffect(() => {
    const el = body.current;
    if (!el || prefersReducedMotion()) return;
    const a = animate(el.querySelectorAll("[data-reveal]"), { opacity: [0, 1], translateY: [10, 0], duration: 520, delay: stagger(70, { start: 120 }), ease: "outCubic" });
    return () => a.revert();
  }, []);

  return (
    <div ref={body} id={`${cardId(card.slug)}-isi`} role="region" aria-labelledby={`${cardId(card.slug)}-q`} className="fq-card-body">
      <p data-reveal className="max-w-2xl text-pretty text-[16.5px] leading-relaxed text-text/75">
        <Highlight text={card.a} query={query} />
      </p>
      <div data-reveal className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        {card.source && (
          <a
            href={card.source.href}
            {...(card.source.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group inline-flex items-center gap-2 text-[15px] font-semibold text-maroon"
          >
            <span className="u-gold">Selengkapnya di {card.source.label}</span>
            <LordIcon name="arrow-right" size={18} trigger="hover" target=".group" colors="primary:#6e1423" />
            {card.source.external && <span className="sr-only">(tab baru)</span>}
          </a>
        )}
        {card.sample && <PlaceholderTag />}
      </div>

      <div data-reveal className="fq-card-foot">
        <span className="flex items-center gap-2" role="group" aria-label="Apakah kartu ini membantu?">
          {voted ? (
            <span className="text-[13px] text-text/55 animate-in fade-in-0">
              {voted === "ya" ? "Kamu menandai kartu ini membantu." : "Terima kasih, pertanyaanmu kami tunggu."}
            </span>
          ) : (
            <>
              <span className="text-[13px] text-text/55">Membantu?</span>
              <button
                type="button"
                className="fq-chip"
                onClick={() => {
                  vote(card.slug, "ya");
                  toast.success("Senang bisa membantu", { description: "Bagikan tautannya ke teman yang bertanya hal sama." });
                }}
              >
                Ya
              </button>
              <button
                type="button"
                className="fq-chip"
                onClick={() => {
                  vote(card.slug, "belum");
                  onAsk();
                }}
              >
                Belum
              </button>
            </>
          )}
        </span>
      </div>
      <span aria-hidden className="fq-card-hole" />
    </div>
  );
}

/**
 * Tumpukan kartu katalog `#katalog`. Kartu tertutup saling menindih seperti di dalam laci — hanya kepala
 * kartu (nomor panggil + pertanyaan) yang terlihat. Buka = kartu terangkat & memanjang (GSAP Flip), jawaban
 * muncul bertahap (anime.js), tautan sumber, "Membantu?" (Ya → toast, Belum → modal kartu kosong).
 * Keyboard: ↑/↓ pindah kartu, Home/End, Esc menutup.
 */
export function CatalogCards() {
  const { visible, openSlug, open, deferred, drawerOf, setAsk, query, reset, persona, drawer } = useFaq();
  const [votes, vote] = useVotes();
  const tray = useRef(null);
  const snap = useRef(null);
  const sig = `${visible.map((c) => c.slug).join(",")}|${openSlug}`;
  const last = useRef(sig);

  // potret posisi kartu sebelum DOM berubah → Flip setelah commit
  if (last.current !== sig && tray.current && !prefersReducedMotion()) {
    snap.current = Flip.getState(tray.current.querySelectorAll("[data-flip-id]"));
  }
  last.current = sig;

  useLayoutEffect(() => {
    if (!snap.current || !tray.current) return;
    Flip.from(snap.current, {
      targets: tray.current.querySelectorAll("[data-flip-id]"),
      duration: 0.6,
      ease: "expo.out",
      absolute: false,
      nested: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: "expo.out" }),
    });
    snap.current = null;
  }, [sig]);

  // tinggi tumpukan berubah → posisi pemicu AOS & ScrollTrigger di bawahnya (penutup) dihitung ulang,
  // kalau tidak elemen yang naik ke atas tidak pernah "terlihat" dan tetap transparan.
  useEffect(() => {
    const t = setTimeout(() => {
      ScrollTrigger.refresh();
      AOS.refresh();
    }, 700);
    return () => clearTimeout(t);
  }, [sig]);

  const onKey = (e, slug) => {
    const heads = [...(tray.current?.querySelectorAll(".fq-card-head") ?? [])];
    const i = heads.indexOf(e.currentTarget);
    const go = (n) => {
      e.preventDefault();
      heads[(n + heads.length) % heads.length]?.focus();
    };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(heads.length - 1);
    else if (e.key === "Escape" && openSlug === slug) open(null);
  };

  const filtered = Boolean(deferred.trim() || persona !== "all" || drawer);

  return (
    <section id="katalog" className="scroll-mt-24 pb-20 pt-10 md:pb-28 md:pt-14">
      <Container>
        <SectionHeader title={["Tarik lacinya,", "baca kartunya"]} body="Pilih topik, lalu buka kartu yang paling dekat dengan pertanyaanmu." />
        <FaqBanner className="mt-8" />
        <div className="mt-10 md:mt-12">
          <DrawerRail />
        </div>

        <div className="mx-auto mt-10 max-w-[880px] md:mt-14">
          {visible.length ? (
            <ol ref={tray} className="fq-tray" aria-label="Kartu pertanyaan">
              {visible.map((c) => {
                const isOpen = openSlug === c.slug;
                return (
                  <li key={c.slug} id={cardId(c.slug)} data-flip-id={c.slug} className={cn("fq-card scroll-mt-28", isOpen && "is-open")}>
                    <h3 className="m-0">
                      <button
                        type="button"
                        id={`${cardId(c.slug)}-q`}
                        aria-expanded={isOpen}
                        aria-controls={`${cardId(c.slug)}-isi`}
                        onClick={() => open(isOpen ? null : c.slug)}
                        onKeyDown={(e) => onKey(e, c.slug)}
                        className="fq-card-head"
                      >
                        <span className="fq-callno tabular">{c.callNo}</span>
                        <span className="min-w-0 flex-1 font-serif text-[clamp(1.08rem,1.7vw,1.32rem)] leading-snug text-navy">
                          <Highlight text={c.q} query={deferred} />
                        </span>
                        <span className="hidden text-[12px] text-text/45 sm:block">{drawerOf(c.drawer)?.label}</span>
                        <span aria-hidden className="fq-pull">{isOpen ? "Simpan" : "Tarik"}</span>
                      </button>
                    </h3>
                    {isOpen && <CardBody card={c} query={deferred} voted={votes[c.slug]} vote={vote} onAsk={() => setAsk({ q: "", drawer: c.drawer })} />}
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="flex flex-col items-center rounded-[8px] border border-dashed border-navy/20 bg-white px-6 py-12 text-center animate-in fade-in-0">
              <LottieIllustration src="/lottie/qa-student.json" className="h-40 w-40" />
              <p className="mt-4 font-serif text-2xl text-navy">
                Laci ini belum punya kartu {query.trim() ? <>untuk “<em className="text-maroon">{query.trim()}</em>”</> : "untukmu"}
              </p>
              <p className="mt-2 max-w-md text-[15px] text-text/60">Tulis pertanyaannya di kartu kosong, kami tunjukkan meja yang tepat untuk menjawab.</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                <button
                  type="button"
                  onClick={() => setAsk({ q: query.trim(), drawer })}
                  className="inline-flex h-12 items-center rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-maroon-deep active:scale-[0.98]"
                >
                  Isi kartu kosong
                </button>
                {filtered && (
                  <button type="button" onClick={reset} className="text-[15px] font-semibold text-navy">
                    <span className="u-gold">Buka semua laci</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {visible.length > 0 && (
            <p className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-[15px] text-text/60">
              Pertanyaanmu tidak ada di lemari?
              <button type="button" onClick={() => setAsk({ q: query.trim(), drawer })} className="font-semibold text-maroon">
                <span className="u-gold">Isi kartu kosong</span>
              </button>
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
