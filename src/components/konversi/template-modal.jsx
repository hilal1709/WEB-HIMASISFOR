"use client";
import { useRef, useState } from "react";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { LordIcon } from "@/components/media/lord-icon";
import { PlaceholderTag } from "@/components/home/shared";
import { useToast } from "@/components/ui/toast";
import { useKonversi } from "./konversi-provider";

/**
 * Modal templat berkas konversi. Kiri: pratinjau lembar yang sudah terisi dari meja konversi (kegiatan + mata
 * kuliah di kantong) — jadi mahasiswa melihat bentuk akhirnya. Kanan: daftar isian + unduh (`Button loading`
 * memeriksa berkas → toast; `href` kosong → toast "menyusul").
 */
export function TemplateModal({ docKey, onClose }) {
  const { docs, program, pickedCourses, credits } = useKonversi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const last = useRef(null);
  if (docKey) last.current = docKey;
  const d = docs.find((x) => x.key === (docKey ?? last.current));

  const download = async () => {
    if (!d?.href) {
      toast.info("Templat menyusul", { description: "Koordinator MBKM sedang menyiapkan versi terbarunya." });
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(d.href, { method: "HEAD" });
      if (!r.ok) throw new Error(String(r.status));
      window.open(d.href, "_blank", "noopener,noreferrer");
      toast.success("Templat dibuka di tab baru", { description: d.title });
    } catch {
      toast.error("Templat tidak bisa dimuat", { description: "Coba lagi nanti atau hubungi koordinator MBKM." });
    } finally {
      setLoading(false);
    }
  };

  const rows = pickedCourses.length ? pickedCourses : null;

  return (
    <Modal open={!!docKey} onOpenChange={(o) => !o && onClose()}>
      {d && (
        <ModalContent className="max-w-3xl p-0">
          <div className="grid md:grid-cols-[1fr_1fr]">
            <div className="bg-cream-2 p-5 sm:p-7">
              <div className="rounded-sm border border-line bg-white p-5 font-mono text-[11px] text-navy shadow-[0_24px_40px_-24px_rgb(20_33_61/0.5)]">
                <p className="kicker text-[8.5px] text-maroon">Sistem Informasi UISI</p>
                <p className="mt-2 font-serif text-[1.05rem] leading-tight">{d.title}</p>
                <div className="mt-4 grid grid-cols-[88px_1fr] gap-y-1.5 border-y border-dashed border-navy/20 py-3">
                  <span className="text-text/45">Kegiatan</span>
                  <span className="font-semibold">{program.label}</span>
                  <span className="text-text/45">SKS diakui</span>
                  <span className="font-semibold">{credits || "…"}</span>
                  <span className="text-text/45">Mitra</span>
                  <span aria-hidden className="mt-1.5 block h-[3px] w-3/4 rounded bg-navy/10" />
                </div>
                <table className="mt-3 w-full">
                  <thead>
                    <tr className="text-left text-[9.5px] uppercase tracking-[0.1em] text-text/45">
                      <th className="pb-1.5 font-medium">Mata kuliah</th>
                      <th className="pb-1.5 text-right font-medium">SKS</th>
                      <th className="pb-1.5 text-right font-medium">{d.key === "la" ? "Bobot" : "Nilai"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(rows ?? [null, null, null]).map((c, i) => (
                      <tr key={c?.slug ?? i} className="border-t border-line">
                        <td className="py-1.5 pr-2">{c ? c.nama : <span aria-hidden className="block h-[3px] w-4/5 rounded bg-navy/10" />}</td>
                        <td className="tabular py-1.5 text-right">{c?.sks ?? ""}</td>
                        <td className="py-1.5 text-right text-text/35">{d.key === "la" ? "__%" : "__"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div aria-hidden className="mt-5 grid grid-cols-3 gap-3 text-center text-[8.5px] text-text/40">
                  {(d.key === "la" ? ["Mahasiswa", "Koordinator", "Mitra"] : ["Pendamping", "Koordinator", "Kaprodi"]).map((s) => (
                    <span key={s}>
                      <span className="mb-1 block h-6 border-b border-navy/20" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-[12px] text-text/50">{rows ? "Terisi dari kantong mata kuliahmu di meja konversi." : "Pilih mata kuliah di meja konversi untuk melihatnya terisi."}</p>
            </div>
            <div className="p-6 sm:p-7">
              <p className="kicker text-[11px] text-maroon">
                {d.kind} · {d.pages} halaman
              </p>
              <ModalTitle className="mt-2 pr-8 text-[1.6rem]">{d.title}</ModalTitle>
              <ModalDescription className="mt-1">Bagian yang perlu kamu isi:</ModalDescription>
              <ol className="mt-4 space-y-2">
                {d.outline.map((o, i) => (
                  <li key={o} className="flex gap-3 text-[14.5px] text-navy">
                    <span className="tabular w-5 font-serif text-gold">{i + 1}</span>
                    {o}
                  </li>
                ))}
              </ol>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button variant="maroon" size="lg" loading={loading} onClick={download} className="group">
                  {!loading && <LordIcon name="document" size={20} target=".group" colors="primary:#ffffff,secondary:#e6d3a1" />}
                  {loading ? "Memeriksa berkas…" : "Unduh templat"}
                </Button>
                {d.sample && <PlaceholderTag />}
              </div>
            </div>
          </div>
        </ModalContent>
      )}
    </Modal>
  );
}
