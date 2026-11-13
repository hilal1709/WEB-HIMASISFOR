"use client";
import { useState } from "react";
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { useToast } from "@/components/ui/toast";

const VIA = {
  email: { title: "Surat diteruskan ke aplikasi email", body: "Periksa jendela email yang terbuka, lalu tekan kirim dari sana." },
  whatsapp: { title: "Surat diteruskan ke WhatsApp", body: "Pesan sudah tersusun di tab WhatsApp. Tinggal tekan kirim." },
  copy: { title: "Surat tersalin", body: "Tempelkan di email, WhatsApp, atau cetak dan serahkan langsung ke sekretariat." },
};

/** Konfirmasi setelah amplop tertutup: animasi amplop melesat, ringkasan surat, salin ulang / tulis surat lain. */
export function LetterModal({ sent, onCopy, onReset, onClose }) {
  const toast = useToast();
  const [peek, setPeek] = useState(false);
  const info = sent ? VIA[sent.via] : null;

  return (
    <Modal open={!!sent} onOpenChange={(o) => !o && (setPeek(false), onClose())}>
      <ModalContent className="max-w-md">
        {sent && (
          <>
            <div className="-mx-6 -mt-6 mb-5 grid place-items-center bg-cream py-4">
              <LottieIllustration src="/lottie/envelope-sent.json" label="Amplop tertutup dan terkirim" className="size-36" />
            </div>
            <ModalHeader>
              <ModalTitle>{info.title}</ModalTitle>
              <ModalDescription>{info.body}</ModalDescription>
            </ModalHeader>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-y border-line py-4 text-[14px]">
              <dt className="text-text/55">Kepada</dt>
              <dd className="font-medium text-navy">{sent.desk.name}</dd>
              <dt className="text-text/55">Perihal</dt>
              <dd className="text-navy">{sent.topic.label}</dd>
              <dt className="text-text/55">Dari</dt>
              <dd className="text-navy">{sent.name}</dd>
            </dl>
            <button type="button" onClick={() => setPeek((p) => !p)} aria-expanded={peek} className="u-gold mt-4 text-[13.5px] font-semibold text-maroon">
              {peek ? "Sembunyikan isi surat" : "Lihat isi surat"}
            </button>
            {peek && <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-cream p-4 font-sans text-[13px] leading-relaxed text-text/80">{sent.text}</pre>}
            <ModalFooter>
              <Button
                variant="outline-navy"
                onClick={async () => ((await onCopy(sent.text)) ? toast.success("Isi surat disalin") : toast.error("Gagal menyalin", { description: "Izinkan akses papan klip, lalu coba lagi." }))}
              >
                Salin isi surat
              </Button>
              <Button variant="maroon" onClick={() => (setPeek(false), onReset())}>
                Tulis surat lain
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
