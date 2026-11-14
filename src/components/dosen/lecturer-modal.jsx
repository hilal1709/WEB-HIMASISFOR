"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LordIcon } from "@/components/media/lord-icon";
import { PlaceholderTag } from "@/components/home/shared";
import { certMap } from "@/lib/dosen-content";
import { cn } from "@/lib/utils";

/** Profil akademik dosen; URL diisi dari CMS (`data.lecturers[].links`). */
const LINKS = [
  { key: "scholar", icon: "book" },
  { key: "scopus", icon: "document" },
  { key: "sinta", icon: "globe" },
];

/**
 * Modal profil dosen (pola person-modal Struktur): panel navy (foto, gelar, tautan akademik)
 * + tab Profil · Mengajar · Riset. ‹ › dan panah keyboard berpindah dosen.
 * Tautan Google Scholar / Scopus / SINTA membuka tab baru; bila belum diisi tampil "menyusul".
 */
export function LecturerModal({ lecturers, fields, labels: copy, certs, sampleLabel, slug, onSlug, onClose }) {
  const L = copy.labels;
  const CERTS = certMap(certs);
  const [tab, setTab] = useState("profil");
  const index = lecturers.findIndex((l) => l.slug === slug);
  const item = lecturers[index];
  const go = (d) => onSlug(lecturers[(index + d + lecturers.length) % lecturers.length].slug);
  const fieldName = (k) => fields.find((f) => f.key === k)?.name ?? k;

  return (
    <Modal
      open={!!item}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setTab("profil");
        }
      }}
    >
      <ModalContent
        className="max-w-4xl p-0"
        onKeyDown={(e) => {
          if (e.target.closest?.("[role=tablist]")) return;
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        {item && (
          <div key={item.slug} className="grid animate-in fade-in-0 slide-in-from-right-2 duration-300 md:grid-cols-[280px_1fr]">
            {/* panel navy */}
            <div className="relative overflow-hidden bg-navy p-6 text-white md:p-7">
              <span aria-hidden className="pointer-events-none absolute -bottom-20 -left-20 size-56 rounded-full border border-white/10" />
              <div className="relative mx-auto aspect-[4/5] w-36 overflow-hidden rounded-md bg-navy-deep md:w-full">
                {item.photo ? (
                  <Image src={item.photo} alt={item.name} fill sizes="280px" className="object-cover object-top animate-in zoom-in-105 fade-in-0 duration-700" />
                ) : (
                  <span className="grid size-full place-items-center font-serif text-5xl text-gold-soft">{item.initials}</span>
                )}
              </div>
              <span aria-hidden className="mx-auto mt-5 block h-[3px] w-10 bg-gold md:mx-0" />
              <p className="mt-3 text-center text-[13px] leading-relaxed text-white/65 md:text-left">{item.credentials}</p>

              {/* identitas: NUPTK & email */}
              <dl className="relative mt-5 space-y-3 border-t border-white/10 pt-4 text-[13px]">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">{L.nuptk}</dt>
                  <dd className={cn("tabular mt-0.5 font-medium tracking-wide", item.nuptk ? "text-white" : "text-white/40")}>{item.nuptk ?? L.pending}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">{L.email}</dt>
                  <dd className="mt-0.5">
                    {item.email ? (
                      <a href={`mailto:${item.email}`} className="mail-lnk group inline-flex max-w-full items-center gap-2 font-medium text-white">
                        <LordIcon name="chat" size={18} target=".mail-lnk" colors="primary:#ffffff,secondary:#c9a227" />
                        <span className="u-gold truncate">{item.email}</span>
                      </a>
                    ) : (
                      <span className="text-white/40">{L.pending}</span>
                    )}
                  </dd>
                </div>
              </dl>

              <ul className="relative mt-5 space-y-1.5">
                {LINKS.map(({ key, icon }) => ({ key, icon, label: copy.links[key] })).filter((l) => l.label).map((l) => {
                  const href = item.links?.[l.key];
                  const cls = "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-[13.5px] transition-[border-color,background-color,color] duration-300";
                  return (
                    <li key={l.key}>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${l.label} ${item.name} (tab baru)`}
                          className={cn(cls, `lnk-${l.key}`, "border-white/15 hover:border-gold hover:bg-white/5")}
                        >
                          <LordIcon name={l.icon} size={20} target={`.lnk-${l.key}`} colors="primary:#ffffff,secondary:#c9a227" />
                          <span className="flex-1">{l.label}</span>
                          <ChevronRight aria-hidden className="size-3.5 text-white/40" />
                        </a>
                      ) : (
                        <span className={cn(cls, "cursor-not-allowed border-dashed border-white/10 text-white/40")} title="Menunggu data CMS">
                          <span className="grid size-5 place-items-center text-[11px]">—</span>
                          <span className="flex-1">{l.label}</span>
                          <span className="text-[11px]">{L.pending}</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* isi */}
            <div className="flex max-h-[72vh] flex-col overflow-y-auto p-6 sm:p-8">
              <p className="kicker text-maroon">{item.role}</p>
              <ModalTitle className="mt-3 text-[1.7rem] leading-snug">{item.name}</ModalTitle>
              <ModalDescription className="mt-1 text-[14px]">{item.fields.map(fieldName).join(" · ") || L.fallback}</ModalDescription>

              <Tabs value={tab} onValueChange={setTab} className="mt-6">
                <TabsList className="rounded-md bg-cream p-1">
                  {[
                    ["profil", L.tabProfile],
                    ["mengajar", L.tabTeach],
                    ["riset", L.tabResearch],
                  ].map(([v, l]) => (
                    <TabsTrigger
                      key={v}
                      value={v}
                      className="h-8 rounded px-4 text-[13.5px] text-navy/60 data-[state=active]:bg-white data-[state=active]:text-navy data-[state=active]:shadow-[0_6px_16px_-10px_rgb(20_33_61/0.5)] focus-visible:outline-maroon"
                    >
                      {l}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="profil" className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                  {item.quote && (
                    <blockquote className="mt-6 border-l-2 border-gold pl-4 font-serif text-[1.15rem] italic leading-snug text-navy">“{item.quote}”</blockquote>
                  )}
                  {item.expertise.length > 0 && (<Block title={L.expertise}>
                    <ul className="flex flex-wrap gap-1.5">
                      {item.expertise.map((x, i) => (
                        <li
                          key={x}
                          className="rounded-md bg-cream px-2.5 py-1 text-[13px] text-navy animate-in fade-in-0 zoom-in-95 fill-mode-both"
                          style={{ animationDelay: `${80 + i * 60}ms` }}
                        >
                          {x}
                        </li>
                      ))}
                    </ul>
                  </Block>)}
                  {item.education.length > 0 && (
                    <Block title={L.education}>
                      <ol className="relative space-y-3 border-l border-line pl-5">
                        {item.education.map((e, i) => (
                          <li key={e.label} className="relative animate-in fade-in-0 slide-in-from-left-1 fill-mode-both" style={{ animationDelay: `${120 + i * 70}ms` }}>
                            <span aria-hidden className={cn("absolute -left-[25px] top-1.5 size-2.5 rounded-full border-2 border-white", i === 0 ? "bg-maroon" : "bg-gold")} />
                            <span className="tabular font-serif text-[15px] text-maroon">{e.level}</span>
                            <span className="ml-2 text-[14.5px] text-navy">{e.label}</span>
                          </li>
                        ))}
                      </ol>
                    </Block>
                  )}
                  {item.certs.length > 0 && (
                    <Block title={L.certs}>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {item.certs.map((c) => (
                          <li key={c} className="group flex items-center gap-3 rounded-md border border-line px-3 py-2 transition-colors duration-300 hover:border-gold">
                            <span className="font-serif text-[15px] text-maroon">{c}</span>
                            <span className="text-[12.5px] leading-snug text-text/60">{CERTS[c]}</span>
                          </li>
                        ))}
                      </ul>
                    </Block>
                  )}
                </TabsContent>

                <TabsContent value="mengajar" className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                  <Block title={L.courses} tag={item.sample.courses && sampleLabel}>
                    <List items={item.courses} />
                  </Block>
                </TabsContent>

                <TabsContent value="riset" className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                  <Block title={L.research} tag={item.sample.research && sampleLabel}>
                    <List items={item.research} />
                  </Block>
                </TabsContent>
              </Tabs>

            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-3 sm:px-8">
          <div className="flex gap-1.5" aria-hidden>
            {lecturers.map((l, i) => (
              <span key={l.slug} className={cn("h-1.5 rounded-full transition-[width,background-color] duration-500 ease-cinematic", i === index ? "w-6 bg-maroon" : "w-1.5 bg-line")} />
            ))}
          </div>
          <div className="flex gap-2">
            <NavBtn label={L.prev} onClick={() => go(-1)} icon={ChevronLeft} />
            <NavBtn label={L.next} onClick={() => go(1)} icon={ChevronRight} />
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

function Block({ title, tag, children }) {
  return (
    <div className="mt-6">
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-text/45">{title}</p>
        {tag && <PlaceholderTag>{tag}</PlaceholderTag>}
      </div>
      {children}
    </div>
  );
}

function List({ items }) {
  return (
    <ol className="divide-y divide-line border-y border-line">
      {items.map((t, i) => (
        <li
          key={t}
          className="group flex gap-3 py-3 text-[14.5px] text-text/75 animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both"
          style={{ animationDelay: `${80 + i * 70}ms` }}
        >
          <span className="tabular font-serif text-maroon transition-transform duration-300 group-hover:-translate-y-0.5">{String(i + 1).padStart(2, "0")}</span>
          <span className="transition-colors duration-300 group-hover:text-navy">{t}</span>
        </li>
      ))}
    </ol>
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
