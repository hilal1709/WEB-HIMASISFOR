"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { ILLUSTRATIONS } from "@/components/illustrations/line-illustrations";
import { LordIcon } from "@/components/media/lord-icon";
import { PlaceholderTag } from "@/components/home/shared";
import { cn } from "@/lib/utils";

const Ctx = createContext(() => {});
export const useMisiModal = () => useContext(Ctx);

/** Modal detail misi; dibuka lewat useMisiModal()(index). Tombol ‹ › dan panah keyboard berpindah misi. */
export function MisiModalProvider({ misi, children }) {
  const [index, setIndex] = useState(null);
  const open = useCallback((i) => setIndex(i), []);
  const item = index != null ? misi[index] : null;
  const go = (d) => setIndex((i) => (i + d + misi.length) % misi.length);
  const Illustration = item ? ILLUSTRATIONS[item.illustration] : null;

  return (
    <Ctx.Provider value={open}>
      {children}
      <Modal open={index != null} onOpenChange={(o) => !o && setIndex(null)}>
        <ModalContent
          className="max-w-2xl p-0"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
          }}
        >
          {item && (
            <div key={index} className="grid animate-in fade-in-0 slide-in-from-right-2 duration-300 sm:grid-cols-[1fr_200px]">
              <div className="p-6 sm:p-8">
                <p className="kicker text-maroon">
                  Misi {String(item.n).padStart(2, "0")} · {item.key}
                </p>
                <ModalTitle className="mt-3 text-[1.4rem] leading-snug">{item.text}</ModalTitle>
                {item.detail && <ModalDescription className="mt-4 text-[15px]">{item.detail}</ModalDescription>}
                {item.tags?.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {item.tags.map((t) => (
                      <li key={t} className="rounded-md bg-cream px-2.5 py-1 text-[13px] text-navy">{t}</li>
                    ))}
                  </ul>
                )}
                <PlaceholderTag className="mt-5" />
              </div>
              <div className="hidden items-center bg-cream p-6 sm:flex">{Illustration && <Illustration />}</div>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-line px-6 py-3 sm:px-8">
            <div className="flex gap-1.5" aria-hidden>
              {misi.map((_, i) => (
                <span key={i} className={cn("h-1.5 rounded-full transition-[width,background-color] duration-500 ease-cinematic", i === index ? "w-6 bg-maroon" : "w-1.5 bg-line")} />
              ))}
            </div>
            <div className="flex gap-2">
              <NavBtn label="Misi sebelumnya" onClick={() => go(-1)} flip />
              <NavBtn label="Misi berikutnya" onClick={() => go(1)} />
            </div>
          </div>
        </ModalContent>
      </Modal>
    </Ctx.Provider>
  );
}

function NavBtn({ label, onClick, flip }) {
  const cls = flip ? "nav-prev" : "nav-next";
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(cls, "grid size-9 place-items-center rounded-md border border-line text-navy transition-[border-color,transform] duration-300 hover:border-navy active:scale-95")}
    >
      <LordIcon name="arrow-right" size={18} target={`.${cls}`} colors="primary:#14213d,secondary:#6e1423" className={flip ? "rotate-180" : undefined} />
    </button>
  );
}
