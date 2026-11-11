"use client";
import { PageCurtain as Curtain } from "@/components/motion/page-curtain";

/** Tirai masuk halaman sambutan (versi umum ada di components/motion/page-curtain.jsx). */
export function PageCurtain() {
  return <Curtain storageKey="sisfor:curtain:sambutan" title="Sambutan" accent="Kaprodi" label="Memuat sambutan" />;
}
