"use client";
import { PageCurtain as Curtain } from "@/components/motion/page-curtain";

export const CURTAIN_KEY = "sisfor:curtain:sambutan";

/** Tirai masuk halaman sambutan; teksnya dari CMS (bab "Tirai"). */
export function PageCurtain({ content }) {
  return <Curtain storageKey={CURTAIN_KEY} title={content.title} accent={content.accent} label={content.label} />;
}
