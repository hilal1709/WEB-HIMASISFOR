"use client";
import { Container } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { useKurikulum } from "./kurikulum-provider";

const NOTES = [
  { href: "/dosen", title: "Dosen", body: "pengampu mata kuliah dan bidang risetnya." },
  { href: "/profil-lulusan", title: "Profil Lulusan", body: "peran yang dituju seluruh kurikulum ini." },
  { href: "/program-kelas", title: "Program Kelas", body: "kurikulum yang sama, tiga ritme belajar." },
];

/**
 * Penutup "catatan kaki" (melanjutkan hero daftar isi): ajakan mencari mata kuliah lewat palet cari,
 * lalu tautan lanjutan sebagai catatan kaki bernomor ¹ ² ³ di bawah garis pemisah pendek.
 */
export function Closing() {
  const { openSearch } = useKurikulum();
  return (
    <section className="relative bg-white pb-20 pt-12 md:pb-20 md:pt-16">
      <Container className="relative">
        <div className="absolute -top-14 right-8 hidden lg:block">
          <div className="relative"><ElvoPeek pose="thumbs-up" size={72} side="left" say="Simpan halaman ini untuk tiap awal semester!" /></div>
        </div>

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <p className="font-serif text-[clamp(1.4rem,2.6vw,1.9rem)] leading-snug text-navy">
            Belum ketemu mata kuliah yang kamu cari?
          </p>
          <button
            type="button"
            onClick={openSearch}
            className="inline-flex h-12 shrink-0 items-center gap-3 rounded-md border border-navy/20 bg-cream pl-4 pr-3 text-[15px] font-semibold text-navy transition-[border-color,background-color] duration-300 hover:border-navy/40 hover:bg-white"
          >
            Cari mata kuliah
            <kbd className="rounded border border-line bg-white px-1.5 py-0.5 font-sans text-[11px] font-normal text-text/50">Ctrl K</kbd>
          </button>
        </div>

        {/* catatan kaki */}
        <span aria-hidden className="mt-12 block h-px w-24 bg-navy/30" />
        <ol className="mt-5 space-y-2.5">
          {NOTES.map((n, i) => (
            <li key={n.href} className="flex gap-2 text-[14.5px] leading-relaxed text-text/65">
              <sup className="mt-1.5 w-4 shrink-0 font-serif text-[12px] text-maroon">{i + 1}</sup>
              <span>
                <a href={n.href} className="font-semibold text-navy">
                  <span className="u-gold">{n.title}</span>
                </a>
                {" "}— {n.body}
              </span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
