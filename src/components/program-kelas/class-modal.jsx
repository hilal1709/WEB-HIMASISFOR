"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PMB_URL } from "@/lib/home-content";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { PillLink, PlaceholderTag } from "@/components/home/shared";
import { cn } from "@/lib/utils";

const pad = (n) => String(n).padStart(2, "0");

/** Modal detail satu kelas: panel navy + Lottie, isi lengkap, ‹ › dan panah keyboard berpindah kelas. */
export function ClassModal({ classes, index, onIndex, onClose }) {
  // simpan kelas terakhir agar isi tidak hilang selama animasi tutup
  const last = useRef(null);
  if (index != null) last.current = index;
  const shown = index ?? last.current;
  const item = shown != null ? classes[shown] : null;
  const go = (d) => index != null && onIndex((index + d + classes.length) % classes.length);

  return (
    <Modal open={index != null} onOpenChange={(o) => !o && onClose()}>
      <ModalContent
        className="max-w-3xl p-0"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        {item && (
          <div key={shown} className="grid animate-in fade-in-0 slide-in-from-right-2 duration-300 md:grid-cols-[230px_1fr]">
            <div className="relative flex flex-col justify-between gap-6 bg-navy px-6 pb-6 pt-9 text-white md:p-6 md:pt-9">
              <div className="rounded-md bg-cream p-3">
                <LottieIllustration src={item.lottie} className="mx-auto w-28 md:w-full md:max-w-[170px]" />
              </div>
              <div>
                <span aria-hidden className="font-serif text-[3rem] leading-none text-gold/90">{pad(item.n)}</span>
                <dl className="mt-4 space-y-3 text-[13px]">
                  <Fact label="Biaya" value={`${item.fee}`} note={item.feeNote} />
                  <Fact label="Kuota" value={`${item.seats} kursi`} />
                  <Fact label="Lokasi" value={item.location} />
                </dl>
              </div>
            </div>
            <div className="max-h-[72vh] overflow-y-auto p-6 sm:p-8">
              <p className="kicker text-maroon">Program kelas · {item.mode}</p>
              <ModalTitle className="mt-3 text-[1.65rem] leading-snug">{item.name}</ModalTitle>
              <ModalDescription className="mt-2 text-[15px]">{item.tagline}</ModalDescription>
              <p className="mt-4 inline-flex rounded-md bg-cream px-3 py-1.5 text-[13.5px] font-medium text-navy">{item.schedule}</p>

              <Block title="Cocok untuk">
                <ul className="space-y-2">
                  {item.forWho.map((c, i) => (
                    <li
                      key={c}
                      className="flex items-start gap-2.5 text-[14.5px] text-navy animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both"
                      style={{ animationDelay: `${100 + i * 60}ms` }}
                    >
                      <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-gold" />
                      {c}
                    </li>
                  ))}
                </ul>
              </Block>
              <div className="grid gap-x-8 sm:grid-cols-2">
                <Block title="Keunggulan">
                  <ul className="space-y-1.5 text-[14px] text-text/75">
                    {item.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </Block>
                <Block title="Persyaratan">
                  <ol className="space-y-1.5 text-[14px] text-text/75">
                    {item.requirements.map((r, i) => (
                      <li key={r} className="flex gap-2">
                        <span className="tabular text-maroon">{i + 1}.</span>
                        {r}
                      </li>
                    ))}
                  </ol>
                </Block>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <PillLink href={PMB_URL} size="sm" target="_blank" rel="noopener noreferrer">
                  Daftar {item.short}
                </PillLink>
                {item.sample && <PlaceholderTag />}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-3 sm:px-8">
          <div className="flex gap-1.5" aria-hidden>
            {classes.map((_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full transition-[width,background-color] duration-500 ease-cinematic", i === shown ? "w-6 bg-maroon" : "w-1.5 bg-line")} />
            ))}
          </div>
          <div className="flex gap-2">
            <NavBtn label="Kelas sebelumnya" onClick={() => go(-1)} icon={ChevronLeft} />
            <NavBtn label="Kelas berikutnya" onClick={() => go(1)} icon={ChevronRight} />
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

function Fact({ label, value, note }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-2">
      <dt className="text-white/50">{label}</dt>
      <dd className="text-right font-medium text-white">
        {value}
        {note && <span className="block text-[11.5px] font-normal text-white/50">{note}</span>}
      </dd>
    </div>
  );
}

function Block({ title, children }) {
  return (
    <div className="mt-6">
      <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-text/45">{title}</p>
      {children}
    </div>
  );
}

function NavBtn({ label, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-md border border-line text-navy transition-[border-color,background-color,color,transform] duration-300 hover:border-maroon hover:bg-maroon hover:text-white active:scale-95"
    >
      <Icon aria-hidden className="size-4" />
    </button>
  );
}
