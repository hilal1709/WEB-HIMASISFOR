"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { PlaceholderTag } from "@/components/home/shared";
import { cn } from "@/lib/utils";

const Ctx = createContext(() => {});
export const useProfileModal = () => useContext(Ctx);

const pad = (n) => String(n).padStart(2, "0");
const HASH = "#pl-";

/**
 * Modal detail profil lulusan; dibuka lewat useProfileModal()(index).
 * - ‹ › dan panah keyboard berpindah profil.
 * - URL mendapat hash `#pl-<key>` (deep link) — membuka halaman dengan hash itu langsung membuka modal.
 */
export function ProfileModalProvider({ profiles, children }) {
  const [index, setIndex] = useState(null);
  const item = index != null ? profiles[index] : null;

  const setHash = (key) => {
    try {
      const url = key ? `${location.pathname}${location.search}${HASH}${key}` : `${location.pathname}${location.search}`;
      history.replaceState(null, "", url);
    } catch {}
  };

  const open = useCallback(
    (i) => {
      setIndex(i);
      setHash(profiles[i]?.key);
    },
    [profiles]
  );

  const go = (d) => {
    const next = (index + d + profiles.length) % profiles.length;
    setIndex(next);
    setHash(profiles[next].key);
  };

  // deep link saat halaman dibuka
  useEffect(() => {
    const fromHash = () => {
      if (!location.hash.startsWith(HASH)) return;
      const i = profiles.findIndex((p) => p.key === location.hash.slice(HASH.length));
      if (i >= 0) setIndex(i);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [profiles]);

  return (
    <Ctx.Provider value={open}>
      {children}
      <Modal
        open={index != null}
        onOpenChange={(o) => {
          if (o) return;
          setIndex(null);
          setHash(null);
        }}
      >
        <ModalContent
          className="max-w-3xl p-0"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
          }}
        >
          {item && (
            <div key={index} className="grid animate-in fade-in-0 slide-in-from-right-2 duration-300 md:grid-cols-[240px_1fr]">
              <div className="relative flex items-center justify-center bg-navy px-6 pb-4 pt-8 md:p-6">
                <LottieIllustration src={item.lottie} className="w-28 md:w-full md:max-w-[190px]" />
                <span aria-hidden className="absolute bottom-4 left-5 font-serif text-[3.25rem] leading-none text-gold/90 md:bottom-6">{pad(item.n)}</span>
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-6 sm:p-8">
                <p className="kicker text-maroon">Profil lulusan · {item.short}</p>
                <ModalTitle className="mt-3 text-[1.65rem] leading-snug">{item.title}</ModalTitle>
                <ModalDescription className="mt-3 text-[15px]">{item.summary}</ModalDescription>

                <Block title="Kompetensi utama">
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {item.competencies.map((c, i) => (
                      <li
                        key={c}
                        className="flex items-start gap-2.5 text-[14.5px] text-navy animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both"
                        style={{ animationDelay: `${120 + i * 60}ms` }}
                      >
                        <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-gold" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </Block>

                <div className="grid gap-x-8 sm:grid-cols-2">
                  <Block title="Contoh jabatan">
                    <ul className="flex flex-wrap gap-1.5">
                      {item.roles.map((r) => (
                        <li key={r} className="rounded-md bg-cream px-2.5 py-1 text-[13px] text-navy">{r}</li>
                      ))}
                    </ul>
                  </Block>
                  <Block title="Mata kuliah pendukung">
                    <ul className="space-y-1 text-[14px] text-text/70">
                      {item.courses.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </Block>
                </div>
                <PlaceholderTag className="mt-6" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-3 sm:px-8">
            <div className="flex items-center">
              <div className="flex gap-1.5" aria-hidden>
                {profiles.map((_, i) => (
                  <span key={i} className={cn("h-1.5 rounded-full transition-[width,background-color] duration-500 ease-cinematic", i === index ? "w-6 bg-maroon" : "w-1.5 bg-line")} />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <NavBtn label="Profil sebelumnya" onClick={() => go(-1)} icon={ChevronLeft} />
              <NavBtn label="Profil berikutnya" onClick={() => go(1)} icon={ChevronRight} />
            </div>
          </div>
        </ModalContent>
      </Modal>
    </Ctx.Provider>
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
