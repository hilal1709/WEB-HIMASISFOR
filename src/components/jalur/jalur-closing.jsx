"use client";
import { Container } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { fillJalur } from "@/lib/jalur-cms/copy";
import { safeJalurUrl } from "@/lib/jalur-cms/schema";
import { useJalur } from "./jalur-provider";

/**
 * Penutup "langkah berikutnya": satu kartu besar berisi rekomendasi yang mengikuti jalur yang sedang dicek
 * (skripsi → RPS Metode Penelitian; jalur lain → ringkasan tahapannya), lalu tautan lain sebagai teks kecil.
 * Tanpa CTA PMB (tidak mengulang beranda).
 */
export function JalurClosing() {
  const { paths, active, method, thesis, openPath, academic, closingAction, closingMascot, links, copy: { closing } } = useJalur();
  const p = paths[active];

  let main = null;
  if (closingAction.mode === "link") {
    const href = safeJalurUrl(closingAction.href);
    if (href && closingAction.title) main = { ...closingAction, href };
  } else if (closingAction.mode === "default" && p) {
    main = p.key === academic.prerequisitePath && method?.href
      ? { href: method.href, kicker: method.semester != null ? fillJalur(closing.courseKicker, method) : "", title: method.nama, note: closing.courseNote }
      : { onClick: () => openPath(active), kicker: fillJalur(closing.pathKicker, { path: p.title }), title: closing.pathTitle, note: closing.pathNote };
  }
  const more = links.filter((link) => link.visible && link.label && (thesis.semester != null || !link.label.includes("{semester}")))
    .map((link) => ({ ...link, href: safeJalurUrl(link.href), title: fillJalur(link.label, thesis) })).filter((link) => link.href);
  const prompt = thesis.semester != null ? fillJalur(closing.prompt, thesis) : closing.promptWithoutSemester;

  const cardInner = main && (
    <>
      <span className="min-w-0">
        <span className="kicker block text-[11px] text-gold-soft">{[closing.kicker, main.kicker].filter(Boolean).join(" · ")}</span>
        <span className="mt-3 block font-serif text-[clamp(1.7rem,3.4vw,2.6rem)] leading-tight">{main.title}</span>
        <span className="mt-2 block max-w-md text-[15px] leading-relaxed text-white/70">{main.note}</span>
      </span>
      <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-gold text-navy transition-transform duration-500 ease-cinematic group-hover:translate-x-1.5">
        <svg viewBox="0 0 16 16" className="size-5">
          <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </>
  );
  const cardCls =
    "group relative flex w-full items-end justify-between gap-8 overflow-hidden rounded-2xl bg-navy p-7 text-left text-white transition-[box-shadow] duration-500 hover:shadow-[0_40px_80px_-40px_rgb(14_24_48/0.8)] sm:p-10";

  return (
    <section className="relative pb-20 pt-12 md:pb-20 md:pt-16">
      <Container>
        {prompt && <p className="max-w-2xl text-pretty font-serif text-[clamp(1.35rem,2.4vw,1.75rem)] leading-snug text-navy">{prompt}</p>}

        {main?.title && <div className="relative mt-8">
          {main.href ? (
            <a href={main.href} className={cardCls}>{cardInner}</a>
          ) : (
            <button type="button" onClick={main.onClick} className={cardCls}>{cardInner}</button>
          )}
          {closingMascot.visible && <div className="pointer-events-none absolute -top-24 right-10 hidden lg:block">
            <div className="relative"><ElvoPeek pose={closingMascot.pose} size={96} side="left" say={closing.mascot} /></div>
          </div>}
        </div>}

        {more.length > 0 && <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14.5px] text-text/60">
          {closing.linksLabel && <span>{closing.linksLabel}</span>}
          {more.map((l) => (
            <a key={l.id} href={l.href} className="font-semibold text-navy">
              <span className="u-gold">{l.title}</span>
            </a>
          ))}
        </p>}
      </Container>
    </section>
  );
}
