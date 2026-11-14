"use client";
import { Container } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { useKurikulum } from "./kurikulum-provider";

/**
 * Penutup "catatan kaki" (melanjutkan hero daftar isi): ajakan mencari mata kuliah lewat palet cari,
 * lalu tautan lanjutan sebagai catatan kaki bernomor di bawah garis pemisah pendek. Semua isi dari CMS.
 */
export function Closing() {
  const { openSearch, copy } = useKurikulum();
  const t = copy.penutup;
  return (
    <section className="relative bg-white pb-20 pt-12 md:pb-20 md:pt-16">
      <Container className="relative">
        {t.mascot.show && (
          <div className="absolute -top-14 right-8 hidden lg:block">
            <div className="relative"><ElvoPeek pose={t.mascot.pose} size={72} side="left" say={t.mascot.say} /></div>
          </div>
        )}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <p className="font-serif text-[clamp(1.4rem,2.6vw,1.9rem)] leading-snug text-navy">{t.question}</p>
          <button
            type="button"
            onClick={openSearch}
            className="inline-flex h-12 shrink-0 items-center gap-3 rounded-md border border-navy/20 bg-cream pl-4 pr-3 text-[15px] font-semibold text-navy transition-[border-color,background-color] duration-300 hover:border-navy/40 hover:bg-white"
          >
            {t.button}
            {copy.hero.kbd && <kbd className="rounded border border-line bg-white px-1.5 py-0.5 font-sans text-[11px] font-normal text-text/50">{copy.hero.kbd}</kbd>}
          </button>
        </div>

        {t.notes.length > 0 && (
          <>
            <span aria-hidden className="mt-12 block h-px w-24 bg-navy/30" />
            <ol className="mt-5 space-y-2.5">
              {t.notes.map((n, i) => (
                <li key={`${n.href}-${i}`} className="flex gap-2 text-[14.5px] leading-relaxed text-text/65">
                  <sup className="mt-1.5 w-4 shrink-0 font-serif text-[12px] text-maroon">{i + 1}</sup>
                  <span>
                    <a href={n.href} className="font-semibold text-navy">
                      <span className="u-gold">{n.title}</span>
                    </a>
                    {n.body ? <> — {n.body}</> : null}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}
      </Container>
    </section>
  );
}
