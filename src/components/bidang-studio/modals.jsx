"use client";

import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { changedSections } from "@/lib/bidang-cms/schema";

export function MasterOutModal({ open, onOpenChange, value, live, onConfirm, busy }) {
  const changes = changedSections(value, live);
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="konsol border-[var(--k-line)] bg-[#0f1729] text-[var(--k-ink)]">
        <ModalHeader><ModalTitle className="text-[var(--k-ink)]">Master Out</ModalTitle><ModalDescription className="text-[var(--k-mute)]">Perubahan berikut akan menjadi versi publik dan kartu beranda.</ModalDescription></ModalHeader>
        <div className="max-h-64 overflow-y-auto rounded-lg border border-[var(--k-line)] bg-black/20 p-2">
          {changes.map((key) => <div key={key} className="flex items-center justify-between border-b border-[var(--k-line)] px-3 py-2 text-[13px] last:border-0"><span>{LABELS[key] ?? key}</span><span className="font-mono text-[10px] text-[var(--k-gold)]">BERUBAH</span></div>)}
          {!changes.length && <p className="p-3 text-[13px] text-[var(--k-faint)]">Belum ada perubahan untuk diterbitkan.</p>}
        </div>
        <ModalFooter><button type="button" onClick={() => onOpenChange(false)} className="rounded-md border border-[var(--k-line-2)] px-3 py-2 text-[13px] text-[var(--k-mute)]">Batal</button><button type="button" disabled={!changes.length || busy} onClick={onConfirm} className="rounded-md bg-[var(--k-gold)] px-4 py-2 text-[13px] font-semibold text-[#1a1406] disabled:opacity-40">{busy ? "Menerbitkan…" : "Terbitkan sekarang"}</button></ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function ChannelDeleteModal({ open, onOpenChange, field, onConfirm }) {
  return <Modal open={open} onOpenChange={onOpenChange}><ModalContent className="konsol border-[var(--k-line)] bg-[#0f1729] text-[var(--k-ink)]"><ModalHeader><ModalTitle className="text-[var(--k-ink)]">Hapus channel?</ModalTitle><ModalDescription className="text-[var(--k-mute)]">Channel “{field?.title}” akan dihapus dari draf. Versi live tetap aman sampai Master Out.</ModalDescription></ModalHeader><ModalFooter><button type="button" onClick={() => onOpenChange(false)} className="rounded-md border border-[var(--k-line-2)] px-3 py-2 text-[13px] text-[var(--k-mute)]">Batal</button><button type="button" onClick={onConfirm} className="rounded-md bg-[var(--k-led-bad)] px-4 py-2 text-[13px] font-semibold text-white">Hapus channel</button></ModalFooter></ModalContent></Modal>;
}

export function HistoryModal({ open, onOpenChange, history = [], onRestore }) {
  return <Modal open={open} onOpenChange={onOpenChange}><ModalContent className="konsol border-[var(--k-line)] bg-[#0f1729] text-[var(--k-ink)]"><ModalHeader><ModalTitle className="text-[var(--k-ink)]">Riwayat terbit</ModalTitle><ModalDescription className="text-[var(--k-mute)]">Pulihkan versi lama ke draf untuk ditinjau sebelum diterbitkan.</ModalDescription></ModalHeader><div className="max-h-72 space-y-2 overflow-y-auto">{history.map((h) => <div key={h.index} className="flex items-center gap-3 rounded-lg border border-[var(--k-line)] p-3"><div className="min-w-0 flex-1"><p className="text-[13px]">{h.publishedAt ? new Date(h.publishedAt).toLocaleString("id-ID") : "Tanpa tanggal"}</p><p className="text-[11px] text-[var(--k-faint)]">{h.publishedBy || "admin"}</p></div><button type="button" onClick={() => onRestore(h.index)} className="rounded-md border border-[var(--k-line-2)] px-2.5 py-1.5 text-[12px] hover:border-[var(--k-gold)] hover:text-[var(--k-gold)]">Pulihkan</button></div>)}{!history.length && <p className="py-6 text-center text-[13px] text-[var(--k-faint)]">Belum ada riwayat.</p>}</div></ModalContent></Modal>;
}

export function RedundancyModal({ open, onOpenChange, hits = [], onJump }) {
  return <Modal open={open} onOpenChange={onOpenChange}><ModalContent className="konsol border-[var(--k-line)] bg-[#0f1729] text-[var(--k-ink)]"><ModalHeader><ModalTitle className="text-[var(--k-ink)]">Sinyal redundansi</ModalTitle><ModalDescription className="text-[var(--k-mute)]">Kalimat yang sama atau sangat mirip ditandai agar tiap bagian punya suara sendiri.</ModalDescription></ModalHeader><div className="max-h-80 space-y-2 overflow-y-auto">{hits.map((h, i) => <div key={i} className="rounded-lg border border-[var(--k-led-bad)]/30 bg-[var(--k-led-bad)]/5 p-3"><p className="text-[13px] italic">“{h.text}”</p><div className="mt-2 flex flex-wrap gap-1.5">{[h.a, h.b].map((x) => <button key={x.path} type="button" onClick={() => { onOpenChange(false); onJump(x.path); }} className={cn("rounded bg-[var(--k-led-bad)]/10 px-2 py-1 text-[11px] text-[var(--k-led-bad)] hover:bg-[var(--k-led-bad)]/20")}>{x.label}</button>)}</div></div>)}{!hits.length && <p className="py-6 text-center text-[13px] text-[var(--k-led-ok)]">Tidak ada kalimat berulang.</p>}</div></ModalContent></Modal>;
}

const LABELS = { fields: "Channel bidang", hero: "Sampul", mosaic: "Mosaik", dimensions: "Dimensi", radar: "Penakar", caseStudy: "Studi kasus", modal: "Rangkuman", shortlist: "Rak", toasts: "Notifikasi", curtain: "Tirai", seo: "Meta" };
