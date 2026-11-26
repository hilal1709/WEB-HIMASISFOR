"use client";
import { Container } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { useToast } from "@/components/ui/toast";
import { useRegulasi } from "./regulasi-provider";
import { fillRegulasi } from "@/lib/regulasi-cms/copy";

/**
 * Penutup "Catatan untuk dosen wali": kartu bergaya kertas bergaris dengan margin merah, berisi pasal yang
 * ditandai (atau ajakan menandai bila kosong) + tombol salin daftar → toast. Tautan lanjutan sebaris teks.
 * Tanpa CTA PMB / statistik (tidak mengulang beranda).
 */
export function RegulasiClosing() {
  const { marks, findPasal, goPasal, links, copy } = useRegulasi();
  const ui = copy.closing;
  const toast = useToast();
  const picked = marks.map((id) => findPasal(id)).filter(Boolean);

  const copyList = () => {
    const text = [ui.copyTitle, ...picked.map((p) => fillRegulasi(ui.copyItem, p))].join("\n");
    const ok = () => toast.success(fillRegulasi(ui.copied, { count: picked.length }), { description: ui.copiedHint });
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(ok, () => toast.error(ui.copyError));
    else toast.error(ui.copyError);
  };

  return (
    <section id="catatan" className="relative scroll-mt-20 pb-20 pt-12 md:pb-20 md:pt-16">
      <Container>
        <div className="relative mx-auto max-w-3xl">
          <span aria-hidden className="absolute inset-0 translate-x-2 translate-y-2 rotate-[0.6deg] rounded-sm bg-cream-2" />
          <div
            className="relative rounded-sm border border-line bg-white px-6 pb-8 pt-9 shadow-[0_40px_70px_-50px_rgb(20_33_61/0.45)] sm:pl-20 sm:pr-10"
            style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 31px, rgb(20 33 61 / 0.07) 31px 32px)" }}
          >
            <span aria-hidden className="absolute bottom-0 left-12 top-0 hidden w-px bg-maroon/40 sm:block" />
            <p className="kicker text-[11px] text-maroon">{ui.note}</p>
            <p className="mt-2 font-serif text-[clamp(1.5rem,3vw,2.1rem)] leading-tight text-navy">
              {picked.length ? fillRegulasi(ui.marked, { count: picked.length }) : ui.title}
            </p>
            {picked.length ? (
              <ol className="mt-4 space-y-0">
                {picked.map((p) => (
                  <li key={p.id} className="flex h-8 items-center gap-3 text-[15px]">
                    <span className="w-10 shrink-0 tabular-nums text-text/45">{p.no}</span>
                    <button type="button" onClick={() => goPasal(p.id)} className="truncate text-left text-navy">
                      <span className="u-gold">{p.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 max-w-lg text-[15.5px] leading-8 text-text/65">
                {ui.body}
              </p>
            )}
            {picked.length > 0 && (
              <button
                type="button"
                onClick={copyList}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-maroon px-5 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-maroon-deep active:scale-[0.98]"
              >
                {ui.copy}
              </button>
            )}
          </div>
          {ui.mascotPose && <div className="pointer-events-none absolute -right-20 -top-16 hidden xl:block">
            <div className="relative"><ElvoPeek pose={ui.mascotPose} size={92} side="left" say={ui.mascot} /></div>
          </div>}
        </div>

        {links.length > 0 && <p className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-2 text-[14.5px] text-text/60">
          <span>{ui.related}</span>
          {links.map((l, index) => (
            <a key={`${l.href}-${index}`} href={l.href} className="font-semibold text-navy">
              <span className="u-gold">{l.label}</span>
            </a>
          ))}
        </p>}
      </Container>
    </section>
  );
}
