"use client";
import { createContext, useCallback, useContext, useState } from "react";
import Image from "next/image";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { CONTACT_URL } from "@/lib/home-content";
import { PillLink } from "@/components/home/shared";

const Ctx = createContext(() => {});
export const useProfileModal = () => useContext(Ctx);

/** Modal profil lengkap Kaprodi; dibuka dari hero & kolom sticky lewat useProfileModal(). */
export function ProfileModalProvider({ data, children }) {
  const [open, setOpen] = useState(false);
  const openModal = useCallback(() => setOpen(true), []);
  return (
    <Ctx.Provider value={openModal}>
      {children}
      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent className="max-w-2xl p-0">
          <div className="grid sm:grid-cols-[220px_1fr]">
            <div className="relative h-56 bg-cream-2 sm:h-auto">
              <Image src={data.photo} alt={data.name} fill sizes="220px" className="object-cover object-top" />
            </div>
            <div className="p-6 sm:p-8">
              <p className="kicker text-maroon">{data.role}</p>
              <ModalTitle className="mt-2 text-2xl">
                {data.name}
                {data.credentials && <span className="block text-base text-text/55">{data.credentials}</span>}
              </ModalTitle>
              <ModalDescription className="mt-3">Profil singkat ketua program studi.</ModalDescription>

              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-navy">Bidang riset</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {data.research.map((r) => (
                      <span key={r} className="rounded-md bg-cream px-2.5 py-1 text-[13px] text-navy">{r}</span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-navy">Pendidikan</dt>
                  <dd className="mt-1.5 space-y-1 text-text/70">
                    {data.education.map((e) => (
                      <p key={e.degree}>{e.degree}{e.place ? ` · ${e.place}` : ""}</p>
                    ))}
                  </dd>
                </div>
                {data.certifications?.length > 0 && (
                  <div>
                    <dt className="font-semibold text-navy">Sertifikasi</dt>
                    <dd className="mt-1.5 text-text/70">{data.certifications.join(", ")}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-7 flex flex-wrap gap-2">
                <PillLink href={CONTACT_URL} size="sm" target="_blank" rel="noopener noreferrer">Hubungi prodi</PillLink>
              </div>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </Ctx.Provider>
  );
}
