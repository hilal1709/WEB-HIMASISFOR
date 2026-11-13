"use client";
import { useLayoutEffect as useEffect, useId, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { CURTAIN_KEY } from "@/lib/faq-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { DotsLoader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { smoothTo, useFaq } from "./faq-provider";

const HINTS = ["biaya kuliah", "magang", "skripsi", "beasiswa", "peminatan"];

function ElvoBubble({ children, className }) {
  return (
    <div data-msg className={cn("flex items-end gap-3", className)}>
      <span aria-hidden className="relative size-10 shrink-0 overflow-hidden rounded-full bg-cream-2 ring-2 ring-white">
        <Image src="/mascot/elvo-wave.webp" alt="" width={605} height={720} className="absolute -bottom-1 left-1/2 h-[125%] w-auto max-w-none -translate-x-1/2" />
      </span>
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-[15.5px] leading-relaxed text-navy shadow-[0_14px_30px_-24px_rgb(20_33_61/0.6)] sm:max-w-[75%]">{children}</div>
    </div>
  );
}

function UserBubble({ children }) {
  return (
    <div data-msg className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-navy px-4 py-3 text-[15.5px] leading-relaxed text-white sm:max-w-[75%]">{children}</div>
    </div>
  );
}

/**
 * Hero "obrolan": seluruh hero adalah jendela percakapan dengan Elvo; judul halaman (h1) adalah pesan pertamanya. Elvo bertanya "kamu siapa?" → persona dipilih
 * lewat balasan cepat (menyaring kartu), lalu "mau tanya soal apa?" → saran topik atau ketik di kolom pesan
 * (mengisi `query`). Balasan terakhir Elvo menyebut jumlah kartu yang cocok + tautan ke lemari. Tanpa ilustrasi garis.
 */
export function FaqHero() {
  const { intro, personas, persona, setPersona, query, setQuery, searching, pool, cards, reset } = useFaq();
  const ref = useRef(null);
  const input = useRef(null);
  const ids = useId();
  const who = personas.find((p) => p.key === persona);
  const filtered = persona !== "all" || query.trim();

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const delay = curtainDelay(CURTAIN_KEY);
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay });
      gsap.fromTo("[data-msg]", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.18, ease: "expo.out", delay: delay + 0.3, clearProps: "transform,opacity" });
    }, el);
    return () => ctx.revert();
  }, []);

  const chip = (on) =>
    cn(
      "rounded-full border px-3.5 py-1.5 text-[13.5px] transition-colors duration-300",
      on ? "border-navy bg-navy text-white" : "border-navy/20 bg-white text-navy hover:border-navy/50"
    );

  return (
    <section ref={ref} className="relative overflow-hidden pb-10 pt-10 md:pb-14 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li>Layanan</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">FAQ</li>
          </ol>
        </nav>

        {/* jendela obrolan */}
        <div data-hero-fade className="mx-auto mt-8 max-w-5xl rounded-[28px] border border-line bg-cream-2/60 shadow-[0_40px_80px_-60px_rgb(20_33_61/0.5)] lg:mt-10">
          <div className="flex items-center gap-2 border-b border-line px-5 py-3 text-[13px] text-text/55">
            <span aria-hidden className="size-2 rounded-full bg-[#3fa66b]" />
            Elvo · biasanya menjawab dalam hitungan detik
          </div>
          <div className="space-y-4 p-5 sm:p-7" aria-live="polite">
            <ElvoBubble className="[&>div]:max-w-full [&>div]:sm:max-w-[90%]">
              <SceneTitle as="h1" trigger="mount" title={["Ada yang", "ingin ditanyakan?"]} className="!text-[clamp(2rem,4.6vw,3.6rem)] !leading-[1.04]" />
              <span className="mt-3 block text-pretty text-[16px] leading-relaxed text-text/70">{intro.body}</span>
            </ElvoBubble>
            <ElvoBubble>Biar jawabanku pas, kamu siapa?</ElvoBubble>
            <div data-msg role="radiogroup" aria-label="Saya adalah" className="flex flex-wrap justify-end gap-2">
              {personas.map((p) => (
                <button key={p.key} type="button" role="radio" aria-checked={persona === p.key} onClick={() => setPersona(p.key)} className={chip(persona === p.key)}>
                  {p.label}
                </button>
              ))}
            </div>
            {persona !== "all" && <UserBubble>Saya {who?.label?.toLowerCase()}.</UserBubble>}
            <ElvoBubble>
              Oke. Mau tanya soal apa? Contohnya:{" "}
              {HINTS.map((h, i) => (
                <span key={h}>
                  {i > 0 && ", "}
                  <button type="button" onClick={() => setQuery(h)} className="font-semibold text-maroon">
                    <span className="u-gold">{h}</span>
                  </button>
                </span>
              ))}
              .
            </ElvoBubble>
            {query.trim() && <UserBubble>{query}</UserBubble>}
            {filtered && (
              <ElvoBubble>
                {searching ? (
                  <DotsLoader />
                ) : (
                  <>
                    Ada <span className="tabular font-semibold">{pool.length}</span> dari {cards.length} kartu yang cocok.{" "}
                    <button type="button" onClick={() => smoothTo("katalog")} className="font-semibold text-maroon">
                      <span className="u-gold">Buka lemarinya</span>
                    </button>{" "}
                    atau{" "}
                    <button type="button" onClick={reset} className="text-text/60 underline-offset-2 hover:underline">
                      mulai lagi
                    </button>
                    .
                  </>
                )}
              </ElvoBubble>
            )}
          </div>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              input.current?.blur();
              smoothTo("katalog");
            }}
            className="flex items-center gap-2 border-t border-line p-3 sm:p-4"
          >
            <label htmlFor={`${ids}-q`} className="sr-only">Ketik pertanyaanmu</label>
            <input
              ref={input}
              id={`${ids}-q`}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQuery("")}
              placeholder="Ketik pertanyaanmu…"
              autoComplete="off"
              enterKeyHint="search"
              className="h-12 min-w-0 flex-1 rounded-full border border-line bg-white px-5 text-[15.5px] text-navy outline-none transition-[border-color,box-shadow] placeholder:text-text/40 focus:border-maroon/40 focus:shadow-[0_0_0_4px_rgb(110_20_35/0.08)]"
            />
            <button type="submit" aria-label="Kirim" className="grid size-12 shrink-0 place-items-center rounded-full bg-maroon text-white transition-colors hover:bg-maroon-deep">
              <svg aria-hidden viewBox="0 0 16 16" className="size-4">
                <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      </Container>
    </section>
  );
}
