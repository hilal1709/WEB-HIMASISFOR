"use client";
import { useLayoutEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { createTimeline, stagger, svg } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { LOGO_PATHS } from "@/components/ui/loader";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { AccessPass } from "@/components/login/access-pass";

const SCOPES = [
  { title: "Warta", note: "Berita dan agenda tayang tanpa menyentuh kode.", lottie: "/lottie/envelope-sent-dark.json" },
  { title: "Kurikulum", note: "Mata kuliah dan RPS diperbarui di satu tempat.", lottie: "/lottie/laptop-code-dark.json" },
  { title: "Prestasi", note: "Catatan juara mahasiswa dan dosen terus bertambah.", lottie: "/lottie/medal-dark.json" },
];

function LogoMark() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const paths = el.querySelectorAll("[data-stroke]");
    if (prefersReducedMotion()) {
      paths.forEach((p) => (p.style.fillOpacity = 1));
      return;
    }
    const tl = createTimeline({ defaults: { ease: "inOutCubic" } });
    tl.add(svg.createDrawable(paths), { draw: ["0 0", "0 1"], duration: 900, delay: stagger(80) })
      .add(paths, { fillOpacity: [0, 1], duration: 450, delay: stagger(35) }, "-=250")
      .add(el.querySelector("[data-dot]"), { scale: [0, 1], duration: 450, ease: "outBack(2)" }, "-=450");
    return () => tl.revert();
  }, []);
  return (
    <svg ref={ref} viewBox="0 0 173 169" className="size-11 overflow-visible" fill="none" aria-hidden>
      {LOGO_PATHS.map((d, i) => (
        <path key={i} data-stroke d={d} stroke="#fff" strokeWidth="2" strokeLinejoin="round" style={{ fill: "#fff", fillOpacity: 0 }} />
      ))}
      <circle data-dot cx="86.38" cy="84.48" r="16.13" fill="var(--gold)" style={{ transformOrigin: "86px 84px" }} />
    </svg>
  );
}

/** Panel maroon: logo tergambar, Pas Akses interaktif, dan Swiper fade "yang bisa dikelola". */
export function LoginStage({ status, strength, email }) {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(root.current, { clipPath: "inset(0 100% 0 0)", duration: 1.1, ease: "expo.out" });
      gsap.from("[data-pass]", { y: 40, opacity: 0, duration: 1, ease: "expo.out", delay: 0.35 });
      gsap.from("[data-scopes]", { y: 20, opacity: 0, duration: 0.9, ease: "expo.out", delay: 0.6 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <aside ref={root} className="relative flex min-h-[112px] flex-col justify-between overflow-hidden bg-maroon px-6 py-6 text-white lg:min-h-dvh lg:px-12 lg:py-10">
      {/* garis bingkai tipis — tanpa gradien */}
      <span className="pointer-events-none absolute inset-3 hidden rounded-md border border-white/10 lg:block" />

      <div className="relative flex items-center gap-3">
        <LogoMark />
        <p className="font-serif text-lg leading-tight">
          Sistem Informasi <span className="italic text-gold-soft">UISI</span>
        </p>
      </div>

      <div data-pass className="relative hidden lg:block">
        <AccessPass status={status} strength={strength} email={email} />
      </div>

      <div data-scopes className="relative hidden lg:block">
        <Swiper
          modules={[Autoplay, EffectFade, A11y]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop
          autoplay={{ delay: 3800, disableOnInteraction: false, pauseOnMouseEnter: true }}
          className="max-w-[340px] !mx-auto"
        >
          {SCOPES.map((s) => (
            <SwiperSlide key={s.title}>
              <div className="flex items-center gap-4">
                <LottieIllustration src={s.lottie} className="size-14 shrink-0" speed={0.8} />
                <div>
                  <p className="font-serif text-lg italic text-gold-soft">{s.title}</p>
                  <p className="mt-0.5 text-sm leading-snug text-white/70">{s.note}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </aside>
  );
}
