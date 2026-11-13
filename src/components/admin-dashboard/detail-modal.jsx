"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { serviceByKey, statusOf, fmtStamp } from "@/lib/layanan-content";
import { cn } from "@/lib/utils";

/**
 * Modal detail bertema: kepala kicker + judul serif, isi bebas, dan ‹ › (serta panah keyboard)
 * bila `onPrev` / `onNext` diberikan. Dipakai untuk ringkasan angka dan detail pengajuan.
 */
export function DetailModal({ open, onOpenChange, kicker, title, description, children, onPrev, onNext, position, footer }) {
  useEffect(() => {
    if (!open || (!onPrev && !onNext)) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onPrev, onNext]);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-xl rounded-xl border-line bg-cream p-0 sm:p-0">
        <div className="bg-white p-6 sm:p-7">
          <ModalHeader className="mb-5">
            {kicker && <span className="kicker text-maroon/80">{kicker}</span>}
            <ModalTitle className="font-serif text-2xl leading-tight text-navy">{title}</ModalTitle>
            {description && <ModalDescription className="text-sm text-text/65">{description}</ModalDescription>}
          </ModalHeader>
          {children}
        </div>
        <div className="flex items-center justify-between gap-3 px-6 py-4 sm:px-7">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={!onPrev}
              aria-label="Sebelumnya"
              className="flex size-9 items-center justify-center rounded-full border border-navy/15 bg-white text-navy transition-colors hover:border-maroon hover:text-maroon disabled:opacity-30"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!onNext}
              aria-label="Berikutnya"
              className="flex size-9 items-center justify-center rounded-full border border-navy/15 bg-white text-navy transition-colors hover:border-maroon hover:text-maroon disabled:opacity-30"
            >
              ›
            </button>
            {position && <span className="ml-2 text-xs tabular text-text/55">{position}</span>}
          </div>
          {footer}
        </div>
      </ModalContent>
    </Modal>
  );
}

/** Daftar baris kecil di dalam modal ringkasan. */
export function MiniList({ items, empty }) {
  if (!items?.length) return <p className="rounded-lg bg-cream px-4 py-3 text-sm text-text/60">{empty}</p>;
  return (
    <ul className="divide-y divide-line">
      {items.map((it) => (
        <li key={it.key} className="flex items-center justify-between gap-3 py-3">
          <span className="min-w-0">
            <span className="block truncate font-semibold text-navy">{it.title}</span>
            <span className="block truncate text-xs text-text/55">{it.meta}</span>
          </span>
          {it.href && (
            <Link href={it.href} className="shrink-0 text-xs font-semibold text-maroon underline decoration-gold decoration-2 underline-offset-4">
              Buka
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

const TONE = {
  diterima: "bg-info-soft text-info",
  diverifikasi: "bg-info-soft text-info",
  diproses: "bg-warning-soft text-warning",
  siap: "bg-success-soft text-success",
  selesai: "bg-success-soft text-success",
  "perlu-perbaikan": "bg-warning-soft text-warning",
  ditolak: "bg-danger-soft text-danger",
};

/** Isi modal untuk satu pengajuan layanan (baca saja). */
export function RequestDetail({ row }) {
  if (!row) return null;
  const service = serviceByKey(row.serviceKey)?.title ?? row.serviceKey;
  const status = statusOf(row.status);
  const rows = [
    ["Kode", row.code],
    ["Layanan", service],
    ["Nama", row.name],
    ["NIM", row.nim],
    ["Diajukan", fmtStamp(row.createdAt)],
  ];
  return (
    <div>
      <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-semibold", TONE[row.status] ?? "bg-cream text-navy")}>{status.label}</span>
      <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="kicker text-text/50">{k}</dt>
            <dd className="mt-1 truncate font-medium text-navy">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-sm text-text/60">{status.desc}</p>
    </div>
  );
}
