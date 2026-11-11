"use client";
import Image from "next/image";
import { Modal, ModalTrigger, ModalContent, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

/**
 * Kartu video: poster + tombol putar yang membesar saat hover → Dialog berisi <video>.
 * Video penuh baru diunduh saat dialog dibuka (preload="none", elemen dibuat saat dibuka).
 */
export function VideoCard({ video, className, label, aspect = "aspect-video", children }) {
  return (
    <Modal>
      <ModalTrigger className={cn("group relative block w-full overflow-hidden rounded-lg bg-maroon-deep text-left", aspect, className)} aria-label={`Putar video: ${video.title}`}>
        <Image src={video.poster} alt="" fill sizes="(min-width:1024px) 640px, 100vw" className="object-cover transition-transform duration-700 ease-cinematic group-hover:scale-[1.04]" />
        <span className="absolute inset-0 bg-maroon-deep/20 transition-colors duration-500 group-hover:bg-maroon-deep/5" />
        <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-maroon shadow-lg transition-transform duration-500 ease-cinematic group-hover:scale-110 md:size-20">
          <svg aria-hidden viewBox="0 0 24 24" className="ml-1 size-6 md:size-7" fill="currentColor">
            <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
          </svg>
          <span aria-hidden className="absolute inset-0 rounded-full ring-2 ring-white/60 transition-transform duration-700 group-hover:scale-125 group-hover:opacity-0" />
        </span>
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-maroon-deep/90 px-5 py-3.5 text-white">
          <span>
            {label && <span className="kicker block text-gold-soft">{label}</span>}
            <span className="mt-0.5 block text-sm font-medium leading-snug">{video.title}</span>
          </span>
          <span className="tabular shrink-0 text-xs text-white/70">{video.duration}</span>
        </span>
        {children}
      </ModalTrigger>
      <ModalContent className="max-w-5xl bg-maroon-deep p-0 text-white sm:p-0" hideClose={false}>
        <ModalTitle className="sr-only">{video.title}</ModalTitle>
        <ModalDescription className="sr-only">Pemutar video</ModalDescription>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video src={video.src} poster={video.poster} controls autoPlay playsInline preload="none" className="aspect-video w-full bg-black" />
      </ModalContent>
    </Modal>
  );
}

/** Tombol teks "▶ Tonton video" yang membuka Dialog pemutar. */
export function VideoButton({ video, children = "Tonton video", className }) {
  return (
    <Modal>
      <ModalTrigger className={cn("group inline-flex h-12 items-center gap-3 text-[15px] font-semibold text-white", className)}>
        <span className="grid size-10 place-items-center rounded-full border border-white/40 transition-[background-color,border-color,transform] duration-500 ease-cinematic group-hover:scale-110 group-hover:border-white group-hover:bg-white group-hover:text-maroon">
          <svg aria-hidden viewBox="0 0 24 24" className="ml-0.5 size-4" fill="currentColor">
            <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
          </svg>
        </span>
        <span className="u-gold">{children}</span>
      </ModalTrigger>
      <ModalContent className="max-w-5xl bg-maroon-deep p-0 text-white sm:p-0">
        <ModalTitle className="sr-only">{video.title}</ModalTitle>
        <ModalDescription className="sr-only">Pemutar video</ModalDescription>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video src={video.src} poster={video.poster} controls autoPlay playsInline preload="none" className="aspect-video w-full bg-black" />
      </ModalContent>
    </Modal>
  );
}
