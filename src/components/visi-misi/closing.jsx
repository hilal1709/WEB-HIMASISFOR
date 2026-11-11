"use client";
import { PMB_URL } from "@/lib/home-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";

const STOPS = [
  { href: "/sambutan-kaprodi", kicker: "Profil", title: "Sambutan Kaprodi", body: "Pesan dari ketua program studi." },
  { href: "/curiculum", kicker: "Akademik", title: "Kurikulum", body: "Mata kuliah per bidang keahlian." },
  { href: "/dosen", kicker: "Profil", title: "Dosen", body: "Pengajar dan bidang risetnya." },
  { href: PMB_URL, kicker: "2030", title: "Daftar PMB 2027", body: "Ikut menempuh perjalanan ini.", final: true },
];

/**
 * Penutup "Langkah berikutnya" sebagai rute: garis putus-putus emas dengan halte bertitik,
 * halte terakhir = pendaftaran PMB. Horizontal di desktop, vertikal di mobile.
 */
export function Closing() {
  return (
    <section className="relative overflow-hidden bg-cream-2 py-16 md:py-24">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <SceneTitle title={["Langkah", "berikutnya"]} />
          <div className="relative hidden shrink-0 xl:block">
            <ElvoPeek pose="thumbs-up" size={84} say="Masih penasaran? Jelajahi halaman lainnya." delay={0.2} />
          </div>
        </div>

        <ol className="relative mt-12 grid gap-8 md:mt-16 md:grid-cols-4 md:gap-6">
          {/* jalur: vertikal (mobile) / horizontal (desktop) */}
          <span aria-hidden className="absolute bottom-3 left-[7px] top-3 border-l-2 border-dashed border-gold/70 md:inset-x-2 md:bottom-auto md:left-2 md:top-[7px] md:border-l-0 md:border-t-2" />
          {STOPS.map((s, i) => {
            const external = s.href.startsWith("http");
            return (
              <li key={s.title} data-aos="fade-up" data-aos-delay={i * 90} className="relative pl-10 md:pl-0 md:pt-10">
                <span
                  aria-hidden
                  className={`absolute left-0 top-1 size-4 rounded-full border-2 md:top-0 ${
                    s.final ? "border-maroon bg-maroon ring-4 ring-maroon/15" : "border-navy bg-cream-2"
                  }`}
                />
                <a
                  href={s.href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`group block rounded-md transition-colors ${s.final ? "-m-3 bg-maroon p-3 text-white hover:bg-maroon-deep md:-m-4 md:p-4" : ""}`}
                >
                  <p className={`kicker ${s.final ? "text-gold-soft" : "text-maroon"}`}>{s.kicker}</p>
                  <p className={`mt-1.5 inline-flex items-center gap-2 font-serif text-[1.4rem] leading-tight ${s.final ? "text-white" : "text-navy"}`}>
                    <span className={s.final ? "" : "u-gold"}>{s.title}</span>
                    <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0 transition-transform duration-500 ease-cinematic group-hover:translate-x-1">
                      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </p>
                  <p className={`mt-1 text-sm ${s.final ? "text-white/70" : "text-text/60"}`}>{s.body}</p>
                </a>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
