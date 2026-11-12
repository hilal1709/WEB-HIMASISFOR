"use client";
import { useRef, useState } from "react";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { LordIcon } from "@/components/media/lord-icon";
import { PlaceholderTag } from "@/components/home/shared";
import { useToast } from "@/components/ui/toast";
import { useMagang } from "./magang-provider";

/**
 * Modal berkas administrasi: sampul tiruan, data berkas, daftar isi. Unduh memeriksa berkas di server
 * (`Button loading`) lalu membukanya di tab baru → toast; `href` kosong → toast "menyusul".
 */
export function DocModal({ docKey, onClose }) {
  const { docs } = useMagang();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const last = useRef(null);
  if (docKey) last.current = docKey;
  const d = docs.find((x) => x.key === (docKey ?? last.current));

  const download = async () => {
    if (!d?.href) {
      toast.info("Berkas menyusul", { description: "Sekretariat prodi sedang menyiapkan versi terbarunya." });
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(d.href, { method: "HEAD" });
      if (!r.ok) throw new Error(String(r.status));
      window.open(d.href, "_blank", "noopener,noreferrer");
      toast.success("Berkas dibuka di tab baru", { description: d.title });
    } catch {
      toast.error("Berkas tidak bisa dimuat", { description: "Coba lagi nanti atau hubungi sekretariat prodi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={!!docKey} onOpenChange={(o) => !o && onClose()}>
      {d && (
        <ModalContent className="max-w-2xl p-0">
          <div className="grid sm:grid-cols-[220px_1fr]">
            <div className="flex items-center justify-center bg-cream px-6 py-8">
              <div className="relative h-56 w-40 rotate-[-3deg] rounded-sm border border-line bg-white p-4 shadow-[0_24px_40px_-24px_rgb(20_33_61/0.55)] transition-transform duration-700 ease-cinematic hover:rotate-0">
                <span className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-gold/30" aria-hidden />
                <p className="kicker text-[8.5px] text-maroon">Sistem Informasi UISI</p>
                <p className="mt-3 font-serif text-[1rem] leading-tight text-navy">{d.title}</p>
                <span aria-hidden className="mt-4 block space-y-1.5">
                  {[100, 85, 92, 70, 88, 60].map((w, i) => (
                    <span key={i} className="block h-[3px] rounded bg-navy/10" style={{ width: `${w}%` }} />
                  ))}
                </span>
                <span aria-hidden className="absolute inset-x-4 bottom-4 h-1 rounded bg-maroon" />
              </div>
            </div>
            <div className="p-6 sm:p-7">
              <p className="kicker text-[11px] text-maroon">
                {d.kind} · {d.pages} halaman
              </p>
              <ModalTitle className="mt-2 pr-8 text-[1.6rem]">{d.title}</ModalTitle>
              <ModalDescription className="mt-1">Isi berkas, berurutan:</ModalDescription>
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
                  {loading ? "Memeriksa berkas…" : "Unduh berkas"}
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
