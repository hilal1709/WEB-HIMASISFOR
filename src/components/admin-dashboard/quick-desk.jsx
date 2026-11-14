"use client";
import Link from "next/link";
import { LordIcon } from "@/components/media/lord-icon";
import { TextRoll } from "@/components/motion/text-roll";

/** Pintasan ke modul CMS. Ikon Lordicon hanya di sini (tombol), tidak sebagai dekorasi. */
export const DESK_LINKS = [
  { href: "/admin/content", icon: "document", title: "Konten Web Utama", note: "Hero, tentang, dan mitra di beranda" },
  { href: "/admin/kurikulum", icon: "book", title: "Kurikulum & RPS", note: "Semester, mata kuliah, dan lembar RPS" },
  { href: "/admin/achievements", icon: "target", title: "Prestasi & Galeri", note: "Peraih prestasi dan foto kegiatan" },
  { href: "/admin/media", icon: "plus-circle", title: "Upload Media", note: "Gambar dan berkas untuk seluruh halaman" },
];

export function QuickDesk() {
  return (
    <section aria-label="Pintasan kerja" data-aos="fade-up">
      <ul className="grid gap-px overflow-hidden rounded-xl border border-line bg-line">
        {DESK_LINKS.map((d) => (
          <li key={d.href} className="bg-white">
            <Link
              href={d.href}
              className="group/desk group/roll flex h-full items-center gap-4 p-5 transition-colors duration-500 hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-maroon/40 sm:p-6"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gold/20 transition-transform duration-500 group-hover/desk:-rotate-6 group-hover/desk:scale-105">
                <LordIcon name={d.icon} size={30} trigger="hover" target="a" colors="primary:#6e1423,secondary:#c9a227" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-xl text-navy">
                  <TextRoll>{d.title}</TextRoll>
                </span>
                <span className="mt-1 block text-sm text-text/60">{d.note}</span>
              </span>
              <span aria-hidden className="text-lg text-maroon transition-transform duration-500 group-hover/desk:translate-x-1">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
