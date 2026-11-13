"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import { FOOTER } from "@/lib/home-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { SOCIAL_ICON } from "@/components/home/site-footer-view";
import { cn } from "@/lib/utils";

const handle = (href) => {
  const path = new URL(href).pathname.replace(/\/$/, "").split("/").pop();
  return path.startsWith("@") ? path : `@${path}`;
};

const STAMPS = FOOTER.socials.map((s, i) => ({
  ...s,
  handle: handle(s.href),
  tone: ["bg-maroon text-gold-soft", "bg-navy text-white", "bg-gold text-navy"][i % 3],
  tilt: ["-rotate-2", "rotate-1", "-rotate-1"][i % 3],
}));

function Stamp({ s, className }) {
  const Icon = SOCIAL_ICON[s.name];
  return (
    <a
      href={s.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${s.name} ${s.handle} (tab baru)`}
      className={cn(
        "kt-stamp group relative block bg-white p-2.5 shadow-[0_18px_40px_-26px_rgb(20_33_61/0.6)] transition-[transform,box-shadow] duration-500 ease-cinematic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/50",
        "hover:-translate-y-2 hover:rotate-0 hover:shadow-[0_34px_50px_-28px_rgb(20_33_61/0.7)]",
        s.tilt,
        className
      )}
    >
      <span className={cn("relative flex aspect-[4/5] flex-col justify-between overflow-hidden p-5", s.tone)}>
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-80">{s.name}</span>
        {Icon && <Icon className="mx-auto size-16 transition-transform duration-700 ease-cinematic group-hover:scale-110 group-hover:-rotate-6 md:size-20" />}
        <span className="break-all font-serif text-[clamp(1rem,1.4vw,1.25rem)] italic leading-tight">{s.handle}</span>
        {/* cap gelombang yang melintas saat hover */}
        <svg aria-hidden viewBox="0 0 200 40" className="pointer-events-none absolute -right-6 top-1/2 w-[85%] -translate-y-1/2 translate-x-full opacity-0 transition-[transform,opacity] duration-700 ease-cinematic group-hover:translate-x-0 group-hover:opacity-40">
          {[8, 18, 28].map((y) => (
            <path key={y} d={`M0 ${y}q12-7 25 0t25 0t25 0t25 0t25 0t25 0t25 0t25 0`} fill="none" stroke="currentColor" strokeWidth="2" />
          ))}
        </svg>
      </span>
    </a>
  );
}

/**
 * Penutup halaman: satu lembar perangko — tiap perangko adalah kanal media sosial prodi. Hover = perangko
 * terangkat dari lembar dan dicap gelombang. Di layar kecil lembar menjadi deret geser (Swiper).
 */
export function StampSheet() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-16 [&>*]:min-w-0">
          <div>
            <SceneTitle title={["Kabar harian kami", "ada di sini"]} />
            <p data-aos="fade-up" data-aos-delay="100" className="mt-5 max-w-md text-pretty text-[16.5px] leading-relaxed text-text/65">
              Agenda, karya mahasiswa, dan cerita kelas dibagikan lebih dulu lewat media sosial prodi.
            </p>
          </div>

          <div data-aos="fade-up" className="kt-sheet relative hidden rounded-[6px] bg-cream-2 p-6 md:block lg:p-8">
            <div className="grid grid-cols-3 gap-5 lg:gap-7">
              {STAMPS.map((s) => (
                <Stamp key={s.name} s={s} />
              ))}
            </div>
          </div>

          <div className="-mx-5 md:hidden">
            <Swiper modules={[A11y, Keyboard]} keyboard slidesPerView={1.35} centeredSlides spaceBetween={16} className="!px-5 !py-4">
              {STAMPS.map((s) => (
                <SwiperSlide key={s.name}>
                  <Stamp s={s} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </Container>
    </section>
  );
}
