"use client";
import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { DRAWERS } from "@/lib/dosen-cms/schema";
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LordIcon } from "@/components/media/lord-icon";
import { cn } from "@/lib/utils";

const fmt = (d) => (d ? new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—");

/**
 * Terbit sebagai "slip pengantar berkas": daftar loker & berkas dosen yang berubah tercetak berurutan,
 * peringatan kalimat kembar di bawahnya. Konfirmasi → amplop tersegel (LordIcon).
 */
export function PublishModal({ open, onOpenChange, drawers, lecturers, redundancy, onPublish }) {
  const list = useRef(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      const rows = list.current?.querySelectorAll("li");
      if (rows?.length) animate(rows, { opacity: [0, 1], translateX: [-10, 0], delay: stagger(60, { start: 120 }), duration: 320, ease: "outQuad" });
    });
    return () => cancelAnimationFrame(id);
  }, [open]);
  const empty = !drawers.length && !lecturers.length;
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>Terbitkan halaman Dosen?</ModalTitle>
          <ModalDescription>Pengunjung yang sedang membuka /dosen, /bidang-keahlian, dan /bootcamp langsung diperbarui.</ModalDescription>
        </ModalHeader>
        <div className="rounded-sm bg-[#fffdf7] p-4 font-mono text-[12px] text-navy ring-1 ring-navy/10">
          <p className="tracking-[0.2em] text-navy/50">SLIP PENGANTAR</p>
          <span className="my-2 block border-t border-dashed border-navy/20" />
          {empty ? (
            <p className="font-sans text-[13.5px] text-text/60">Tidak ada perubahan dibanding versi live.</p>
          ) : (
            <ul ref={list} className="space-y-1.5 font-sans text-[13.5px]">
              {drawers.map((k) => {
                const d = DRAWERS.find((x) => x.key === k);
                return (
                  <li key={k} className="flex items-center justify-between gap-3">
                    <span>
                      <span className="font-mono text-[11px] text-maroon/70">{d?.code}</span> {d?.label}
                    </span>
                    <span className="font-mono text-[11px] text-navy/40">diubah</span>
                  </li>
                );
              })}
              {lecturers.map((n) => (
                <li key={n} className="flex items-center justify-between gap-3 pl-4">
                  <span className="truncate">↳ {n}</span>
                  <span className="font-mono text-[11px] text-navy/40">berkas</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {redundancy > 0 && (
          <p className="mt-3 rounded-sm border-l-2 border-maroon bg-maroon/5 px-3 py-2 text-[13px] text-maroon">
            Ada {redundancy} kalimat kembar. Tetap bisa terbit, tapi sebaiknya dirapikan dulu.
          </p>
        )}
        <ModalFooter>
          <Button variant="outline-navy" onClick={() => onOpenChange(false)} disabled={busy}>
            Nanti dulu
          </Button>
          <Button
            variant="maroon"
            loading={busy}
            disabled={empty}
            className="pub-btn gap-2"
            onClick={async () => {
              setBusy(true);
              try {
                await onPublish();
                onOpenChange(false);
              } finally {
                setBusy(false);
              }
            }}
          >
            {!busy && <LordIcon name="check" size={20} target=".pub-btn" colors="primary:#ffffff,secondary:#c9a227" />}
            Segel & terbitkan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/** Riwayat terbit: deretan cap tanggal; pulihkan menyalin versi itu ke draf. */
export function HistoryModal({ open, onOpenChange, doc, onRestore }) {
  const [busy, setBusy] = useState(null);
  const items = doc?.history ?? [];
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>Riwayat terbit</ModalTitle>
          <ModalDescription>Memulihkan menyalin versi lama ke draf. Halaman publik baru berubah setelah Anda menerbitkannya.</ModalDescription>
        </ModalHeader>
        <ol className="relative space-y-2 border-l-2 border-dotted border-navy/20 pl-5">
          <li className="relative">
            <span aria-hidden className="absolute -left-[27px] top-2 size-3 rounded-full border-2 border-white bg-emerald-500" />
            <p className="text-[13.5px] font-semibold text-navy">Versi live sekarang</p>
            <p className="text-[12.5px] text-text/55">
              {fmt(doc?.publishedAt)} · {doc?.publishedBy ?? "bawaan"}
            </p>
          </li>
          {items.map((h) => (
            <li key={h.index} className="group relative flex items-center justify-between gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-cream">
              <span aria-hidden className="absolute -left-[27px] top-3 size-3 rounded-full border-2 border-white bg-gold" />
              <span>
                <span className="block text-[13.5px] text-navy">{fmt(h.publishedAt)}</span>
                <span className="block text-[12px] text-text/50">{h.publishedBy ?? "Admin"}</span>
              </span>
              <Button
                size="sm"
                variant="outline-navy"
                loading={busy === h.index}
                onClick={async () => {
                  setBusy(h.index);
                  try {
                    await onRestore(h.index);
                    onOpenChange(false);
                  } finally {
                    setBusy(null);
                  }
                }}
              >
                Pulihkan ke draf
              </Button>
            </li>
          ))}
          {!items.length && <li className="text-[13px] text-text/50">Belum ada versi sebelumnya.</li>}
        </ol>
      </ModalContent>
    </Modal>
  );
}

/** Tambah dosen tamu (bukan dari Studio Bagan). */
export function AddLecturerModal({ open, onOpenChange, onAdd }) {
  const [name, setName] = useState("");
  const [credentials, setCredentials] = useState("");
  const [role, setRole] = useState("Dosen");
  useEffect(() => {
    if (open) {
      setName("");
      setCredentials("");
      setRole("Dosen");
    }
  }, [open]);
  const ok = name.trim().length >= 3;
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>Berkas dosen tamu</ModalTitle>
          <ModalDescription>Untuk dosen yang tidak ada di Studio Bagan (mis. dosen tamu atau praktisi). Dosen tetap sebaiknya ditambahkan di Studio Bagan.</ModalDescription>
        </ModalHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!ok) return;
            onAdd({ name: name.trim(), credentials: credentials.trim(), role: role.trim() || "Dosen" });
            onOpenChange(false);
          }}
        >
          {[
            ["Nama lengkap", name, setName, "Dr. Nama Dosen", 120],
            ["Gelar", credentials, setCredentials, "S.Kom., M.Kom.", 160],
            ["Jabatan", role, setRole, "Dosen Tamu", 160],
          ].map(([l, val, set, ph, max]) => (
            <label key={l} className="block">
              <span className="mb-1 block text-[11.5px] font-semibold uppercase tracking-[0.14em] text-navy/60">{l}</span>
              <Input value={val} maxLength={max} placeholder={ph} onChange={(e) => set(e.target.value)} className="border-navy/15" autoFocus={l === "Nama lengkap"} />
            </label>
          ))}
          <ModalFooter>
            <Button type="button" variant="outline-navy" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" variant="navy" disabled={!ok} className={cn(!ok && "opacity-60")}>
              Buat berkas
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
