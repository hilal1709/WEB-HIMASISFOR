"use client";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";

const NEXT = [
  { href: "/kontak", kicker: "Kontak", title: "Tulis surat ke meja yang tepat" },
  { href: "/layanan-akademik", kicker: "Layanan akademik", title: "Ajukan dan lacak surat keterangan" },
  { href: "/regulasi-akademik", kicker: "Regulasi akademik", title: "Baca aturan lengkapnya pasal demi pasal" },
];

/** Penutup: tiga jalan lanjut bila kartu belum cukup. Tanpa CTA PMB (tidak mengulang beranda). */
export function FaqClosing() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-white pb-20 pt-16 md:pb-24 md:pt-20">
      <Container>
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <SceneTitle title={["Jawaban lengkap", "ada di meja masing-masing"]} />
            <p data-aos="fade-up" data-aos-delay="100" className="mt-4 max-w-lg text-pretty text-[16px] leading-relaxed text-text/65">
              Kartu hanya menunjuk arah. Untuk urusan yang butuh keputusan, langsung ke tempat yang menanganinya.
            </p>
          </div>
          <div className="pointer-events-none hidden lg:block">
            <div className="relative">
              <ElvoPeek pose="think" size={110} side="left" say="Kalau ragu, simpan nomor kartunya dan tanyakan langsung." />
            </div>
          </div>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-3">
          {NEXT.map((l, i) => (
            <li key={l.href} data-aos="fade-up" data-aos-delay={i * 80}>
              <a href={l.href} className="fq-next group">
                <span className="fq-callno tabular">{`RUJUK·0${i + 1}`}</span>
                <span className="mt-3 block kicker text-[11px] text-maroon">{l.kicker}</span>
                <span className="mt-1 block font-serif text-[1.2rem] leading-tight text-navy">{l.title}</span>
                <svg aria-hidden viewBox="0 0 16 16" className="mt-5 size-4 text-maroon transition-transform duration-500 ease-cinematic group-hover:translate-x-1.5">
                  <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
