"use client";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { LottieIllustration } from "@/components/media/lottie-illustration";

const STEPS = [
  "Kirim email akun yang terdaftar kepada pengelola utama situs.",
  "Pengelola membuatkan kata sandi sementara untuk akun itu.",
];

export function HelpModal({ open, onOpenChange }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <div className="flex items-start gap-4 pt-2">
          <LottieIllustration src="/lottie/service-bell.json" className="size-20 shrink-0" />
          <ModalHeader className="mb-0">
            <ModalTitle>
              Lupa kata sandi? <span className="italic text-maroon">Ada jalannya.</span>
            </ModalTitle>
            <ModalDescription>Reset mandiri lewat email belum tersedia, jadi prosesnya lewat pengelola.</ModalDescription>
          </ModalHeader>
        </div>
        <ol className="mt-5 space-y-3">
          {STEPS.map((t, i) => (
            <li key={t} className="flex gap-3 text-sm leading-relaxed text-text/80">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-navy font-serif text-xs text-gold-soft">{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="navy">Mengerti</Button>
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
