"use client";
import Image from "next/image";
import { Container, SectionHeader } from "@/components/home/shared";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { smoothTo } from "./dosen-hero";
import { useDosen } from "./dosen-provider";

/**
 * Peta keahlian: empat rumpun sebagai kolom bento. Tiap kolom memuat ilustrasi Lottie (diputar ulang
 * saat hover), deskripsi, avatar dosen terkait (avatar klik → profil). Klik rumpun → filter direktori + gulir.
 */
export function ExpertiseMap() {
  const { fields, lecturers, field, setField, openProfile } = useDosen();
  return (
    <section className="bg-cream-2/60 py-16 md:py-20">
      <Container>
        <SectionHeader title={["Empat rumpun,", "satu ekosistem"]} body="Keahlian dosen saling melengkapi: dari tata kelola hingga data, semuanya bermuara pada sistem enterprise di industri." />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {fields.map((f, i) => {
            const people = lecturers.filter((l) => l.fields.includes(f.key));
            const on = field === f.key;
            return (
              <li key={f.key} data-aos="fade-up" data-aos-delay={i * 70}>
                <div
                  data-lottie-hover
                  className={cn(
                    "group flex h-full flex-col rounded-lg border bg-white p-6 transition-[border-color,box-shadow,transform] duration-500 ease-cinematic hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgb(20_33_61/0.6)]",
                    on ? "border-gold" : "border-line hover:border-navy/20"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-20 rounded-full bg-navy p-3 transition-transform duration-500 ease-cinematic group-hover:scale-105">
                      <LottieIllustration src={f.lottie} replayOnHover />
                    </div>
                    <span className="tabular font-serif text-[2rem] leading-none text-line transition-colors duration-500 group-hover:text-gold">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-6 font-serif text-[1.35rem] leading-tight text-navy">{f.name}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-text/60">{f.body}</p>
                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
                    <ul className="flex pl-2">
                      {people.map((p, j) => (
                        <li key={p.slug} className="-ml-2 transition-transform duration-300 hover:z-10 hover:-translate-y-1" style={{ zIndex: people.length - j }}>
                          <button
                            type="button"
                            onClick={() => openProfile(p.slug)}
                            aria-label={`Profil ${p.name}`}
                            title={p.name}
                            className="relative block size-9 overflow-hidden rounded-full border-2 border-white bg-cream-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/40"
                          >
                            {p.photo ? <Image src={p.photo} alt="" fill sizes="36px" className="object-cover" /> : <span className="text-[11px] text-maroon">{p.initials}</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        setField(f.key);
                        smoothTo("direktori");
                      }}
                      className="group/btn inline-flex items-center gap-1.5 text-[13px] font-semibold text-maroon"
                    >
                      <span className="u-gold">{people.length} dosen</span>
                      <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5">
                        <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
