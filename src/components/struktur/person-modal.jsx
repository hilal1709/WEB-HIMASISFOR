"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/struktur-content";

const Ctx = createContext(() => {});
export const usePersonModal = () => useContext(Ctx);

/**
 * Modal detail dosen; dibuka lewat usePersonModal()(key).
 * - ‹ › dan panah keyboard berpindah orang.
 * - Kartu "Melapor ke" / "Membawahi" bisa diklik untuk menelusuri bagan.
 */
export function PersonModalProvider({ people, children }) {
  const [key, setKey] = useState(null);
  const byKey = useMemo(() => Object.fromEntries(people.map((p) => [p.key, p])), [people]);
  const index = people.findIndex((p) => p.key === key);
  const item = byKey[key];

  const open = useCallback((k) => setKey(k), []);
  const go = (d) => open(people[(index + d + people.length) % people.length].key);

  const boss = item?.reportsTo ? byKey[item.reportsTo] : null;
  const team = item ? people.filter((p) => p.reportsTo === item.key) : [];

  return (
    <Ctx.Provider value={open}>
      {children}
      <Modal
        open={!!item}
        onOpenChange={(o) => {
          if (!o) setKey(null);
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
            <div key={key} className="grid animate-in fade-in-0 slide-in-from-right-2 duration-300 md:grid-cols-[250px_1fr]">
              <div className="relative bg-navy p-6 text-white md:p-7">
                <div className="relative mx-auto aspect-[4/5] w-36 overflow-hidden rounded-md bg-navy-deep md:w-full">
                  {item.photo ? (
                    <Image src={item.photo} alt={item.name} fill sizes="250px" className="object-cover object-top animate-in zoom-in-105 fade-in-0 duration-700" />
                  ) : (
                    <span className="grid size-full place-items-center font-serif text-5xl text-gold-soft">{initials(item.name)}</span>
                  )}
                </div>
                <span aria-hidden className="mx-auto mt-5 block h-[3px] w-10 bg-gold md:mx-0" />
                <p className="mt-3 text-center text-[13px] leading-relaxed text-white/65 md:text-left">{item.role}</p>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-6 sm:p-8">
                <p className="kicker text-maroon">{item.role}</p>
                <ModalTitle className="mt-3 text-[1.6rem] leading-snug">{item.name}</ModalTitle>
                {item.credentials && <p className="mt-1 text-[14px] text-text/55">{item.credentials}</p>}
                <ModalDescription className="sr-only">Detail tugas dan bidang keahlian {item.name}</ModalDescription>

                {item.duties?.length > 0 && (
                <Block title="Tugas & tanggung jawab">
                  <ol className="space-y-2.5">
                    {item.duties.map((d, i) => (
                      <li
                        key={d}
                        className="flex gap-3 text-[14.5px] leading-relaxed text-navy animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both"
                        style={{ animationDelay: `${120 + i * 70}ms` }}
                      >
                        <span className="mt-0.5 font-serif text-[15px] leading-none text-gold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                        {d}
                      </li>
                    ))}
                  </ol>
                </Block>
                )}

                <Block title={item.group === "staff" ? "Layanan" : "Bidang keahlian"}>
                  <ul className="flex flex-wrap gap-1.5">
                    {item.expertise.map((x) => (
                      <li key={x} className="rounded-md bg-cream px-2.5 py-1 text-[13px] text-navy">{x}</li>
                    ))}
                  </ul>
                </Block>

                {(boss || team.length > 0) && (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {boss && <Relation label="Melapor ke" people={[boss]} onOpen={open} />}
                    {team.length > 0 && <Relation label="Membawahi" people={team} onOpen={open} />}
                  </div>
                )}

              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-3 sm:px-8">
            <div className="flex gap-1.5" aria-hidden>
              {people.map((p, i) => (
                <span key={p.key} className={cn("h-1.5 rounded-full transition-[width,background-color] duration-500 ease-cinematic", i === index ? "w-6 bg-maroon" : "w-1.5 bg-line")} />
              ))}
            </div>
            <div className="flex gap-2">
              <NavBtn label="Sebelumnya" onClick={() => go(-1)} icon={ChevronLeft} />
              <NavBtn label="Berikutnya" onClick={() => go(1)} icon={ChevronRight} />
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

function Relation({ label, people, onOpen }) {
  return (
    <div className="rounded-md border border-line p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text/45">{label}</p>
      <ul className="mt-2 space-y-1">
        {people.map((p) => (
          <li key={p.key}>
            <button
              type="button"
              onClick={() => onOpen(p.key)}
              className="group flex w-full items-center gap-2.5 rounded p-1 text-left transition-colors hover:bg-cream"
            >
              <Avatar person={p} size={28} />
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-medium text-navy group-hover:text-maroon">{p.name}</span>
                <span className="block truncate text-[12px] text-text/50">{p.role}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Avatar({ person, size = 40, className }) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-cream-2 text-[11px] font-semibold text-maroon", className)} style={{ width: size, height: size }}>
      {person.photo ? <Image src={person.photo} alt="" fill sizes={`${size}px`} className="object-cover" /> : initials(person.name)}
    </span>
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
