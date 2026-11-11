import Image from "next/image";
import { ACCREDITATION } from "@/lib/home-content";
import { Modal, ModalTrigger, ModalContent, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { Container } from "./shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";

/** Pita akreditasi ringkas (satu baris) di atas latar cream-2. */
export function AccreditationBand() {
  return (
    <section id="akreditasi" aria-label="Akreditasi" className="bg-navy text-white">
      <Container className="flex flex-col gap-6 py-8 md:flex-row md:items-center md:gap-10">
        <Modal>
          <ModalTrigger className="group relative w-32 shrink-0 overflow-hidden rounded border border-gold/50 bg-white" aria-label="Perbesar sertifikat akreditasi">
            <Image src={ACCREDITATION.certificate} alt="Sertifikat akreditasi" width={1151} height={762} className="h-auto w-full transition-transform duration-700 ease-cinematic group-hover:scale-110" />
          </ModalTrigger>
          <ModalContent className="max-w-3xl p-3 sm:p-4">
            <ModalTitle className="sr-only">Sertifikat akreditasi {ACCREDITATION.issuer}</ModalTitle>
            <ModalDescription className="sr-only">{ACCREDITATION.body}</ModalDescription>
            <Image src={ACCREDITATION.certificate} alt="Sertifikat akreditasi LAM INFOKOM" width={1151} height={762} className="h-auto w-full rounded" />
          </ModalContent>
        </Modal>
        <LottieIllustration src="/lottie/badge-dark.json" label="Lencana akreditasi" className="hidden w-20 shrink-0 sm:block" />
        <p className="font-serif text-2xl text-white md:text-[1.75rem]">
          Terakreditasi <em className="italic text-gold">“{ACCREDITATION.grade}”</em>
          <span className="block font-sans text-sm text-white/65 md:mt-1">{ACCREDITATION.issuer} · Lembaga Akreditasi Mandiri Informatika dan Komputer</span>
        </p>
        <dl className="grid gap-x-10 gap-y-2 text-sm md:ml-auto md:grid-cols-2">
          {ACCREDITATION.rows.slice(0, 2).map(([k, v]) => (
            <div key={k}>
              <dt className="kicker text-[11px] text-gold">{k}</dt>
              <dd className="mt-0.5 font-medium text-white">{v}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
