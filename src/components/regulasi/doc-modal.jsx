"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { fillRegulasi } from "@/lib/regulasi-cms/copy";
import { PlaceholderTag } from "@/components/home/shared";
import { LordIcon } from "@/components/media/lord-icon";
import { NavBtn } from "@/components/jalur/stage-modal";
import { DocCover } from "./doc-shelf";

/**
 * Modal dokumen — sampul di kiri, isi: data berkas, daftar isi (Pedoman memakai judul bab dari halaman ini,
 * tidak ditulis ulang), tombol unduh (loading → toast; berkas belum ada → toast info "menyusul"). ‹ › + panah.
 */
export function DocModal({ docs, chapters, version, index, onIndex, onClose, copy, preview }) {
  const ui = copy.documents;
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const last = useRef(null);
  if (index != null) last.current = index;
  const shown = index ?? last.current;
  const d = shown != null ? docs[shown] : null;
  const total = docs.length;
  const go = (k) => index != null && onIndex((index + k + total) % total);

  const toc = d ? (d.toc === "chapters" ? chapters.map((c) => `${c.roman}. ${c.title}`) : d.toc) : [];

  const download = () => {
    if (!d || loading) return;
    if (d.href && !preview) {
      const link = document.createElement("a");
      link.href = d.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (d.href) toast.success(fillRegulasi(ui.opened, d), { description: fillRegulasi(ui.openedHint, d) });
      else toast.info(ui.missing, { description: ui.missingHint });
    }, 450);
  };

  return (
    <Modal open={index != null} onOpenChange={(o) => !o && onClose()}>
      {d && (
        <ModalContent closeLabel={copy.general.close} className="max-w-3xl p-0" onKeyDown={(e) => (e.key === "ArrowRight" ? go(1) : e.key === "ArrowLeft" ? go(-1) : null)}>
          <div className="grid max-h-[88vh] overflow-y-auto sm:grid-cols-[0.85fr_1.15fr]">
            <div className="p-4 sm:p-5">
              <DocCover key={d.key} d={d} version={version} ui={ui} className="h-full min-h-[220px] animate-in fade-in-0 zoom-in-95 duration-500" />
            </div>
            <div className="flex flex-col p-6 pt-2 sm:pl-2 sm:pt-8">
              <ModalTitle className="pr-8 text-[1.6rem]">{d.title}</ModalTitle>
              <ModalDescription className="mt-1">{fillRegulasi(ui.coverVersion, { version })}</ModalDescription>

              <dl className="mt-5 grid grid-cols-3 divide-x divide-line rounded-lg border border-line text-center">
                {[
                  [ui.pages, d.pages ?? "—"],
                  [ui.size, d.size || "—"],
                  [ui.format, ui.formatValue],
                ].map(([k, v], i) => (
                  <div key={i} className="px-2 py-3">
                    <dt className="text-[11.5px] uppercase tracking-[0.12em] text-text/45">{k}</dt>
                    <dd className="tabular mt-0.5 font-serif text-[1.15rem] text-navy">{v}</dd>
                  </div>
                ))}
              </dl>

              {toc.length > 0 && <>
              <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.14em] text-text/45">{ui.contents}</p>
              <ol className="mt-2 divide-y divide-line border-y border-line">
                {toc.map((t, i) => (
                  <li key={`${t}-${i}`} className="py-2 text-[14.5px] text-navy animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both" style={{ animationDelay: `${80 + i * 45}ms` }}>
                    {t}
                  </li>
                ))}
              </ol>
              </>}
              {d.sample && <PlaceholderTag className="mt-4 self-start">{copy.general.sample}</PlaceholderTag>}

              <div className="mt-6 flex items-center justify-between gap-3 pt-2">
                <Button variant="maroon" size="lg" loading={loading} onClick={download} className="group">
                  {!loading && <LordIcon name="document" size={22} trigger="hover" target=".group" colors="primary:#ffffff,secondary:#c9a227" />}
                  {ui.download}
                </Button>
                <div className="flex gap-2">
                  <NavBtn label={ui.previous} onClick={() => go(-1)} icon={ChevronLeft} />
                  <NavBtn label={ui.next} onClick={() => go(1)} icon={ChevronRight} />
                </div>
              </div>
            </div>
          </div>
        </ModalContent>
      )}
    </Modal>
  );
}
