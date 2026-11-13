"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import { gsap, ScrollTrigger, CINEMATIC_QUERY } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";

const W = 280; // lebar kartu (px)
const H = 380;
const GAP = 22;

/**
 * Carousel silinder cekung 3D (pola hero horizonx.so).
 * Kamera berada di dalam silinder: kartu tengah paling jauh, kartu tepi membesar.
 * Berputar pelan sendiri, bisa di-drag (dengan inersia), dan scroll menambah putaran.
 * Di bawah 768px / reduced-motion → Swiper coverflow.
 */
export function CurvedCarousel({ cards, ready = true }) {
  const [desktop, setDesktop] = useState(null); // null = belum diketahui (SSR) → placeholder ukuran tetap
  useEffect(() => {
    const mq = window.matchMedia(CINEMATIC_QUERY);
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  if (desktop === null) return <div aria-hidden className="h-[380px] md:h-[460px]" />;
  return desktop ? <Cylinder cards={cards} ready={ready} /> : <Coverflow cards={cards} />;
}

function Cylinder({ cards, ready }) {
  const stage = useRef(null);
  const ring = useRef(null);
  const n = cards.length;
  const step = 360 / n;
  const radius = Math.round((W + GAP) / 2 / Math.tan(Math.PI / n));

  useEffect(() => {
    const el = ring.current;
    const st = stage.current;
    if (!el || !st) return;
    const state = { angle: 0, vel: 0, drag: false, lastX: 0, scrollBoost: 0 };
    const base = prefersReducedMotion() ? 0 : 4.5; // derajat per detik
    const render = () => gsap.set(el, { rotateY: state.angle, z: radius * 0.42 });

    const tick = (_, dt) => {
      const s = dt / 1000;
      if (!state.drag) {
        state.vel *= 0.94;
        state.scrollBoost *= 0.9;
        state.angle -= (base + state.scrollBoost) * s + state.vel;
      }
      render();
    };
    gsap.ticker.add(tick);

    const down = (e) => {
      state.drag = true;
      state.lastX = e.clientX;
      state.vel = 0;
      st.setPointerCapture?.(e.pointerId);
    };
    const move = (e) => {
      if (!state.drag) return;
      const dx = e.clientX - state.lastX;
      state.lastX = e.clientX;
      state.angle += dx * 0.12;
      state.vel = -dx * 0.12;
    };
    const up = () => (state.drag = false);
    st.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    const trig = ScrollTrigger.create({
      trigger: st,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => (state.scrollBoost = Math.min(Math.abs(self.getVelocity()) / 40, 60)),
    });

    return () => {
      gsap.ticker.remove(tick);
      st.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      trig.kill();
    };
  }, [radius]);

  // masuk: kartu naik & melengkung dari datar
  useEffect(() => {
    if (!ready || prefersReducedMotion()) {
      gsap.set(stage.current, { autoAlpha: 1 });
      return;
    }
    const tl = gsap.timeline();
    tl.set(stage.current, { autoAlpha: 1 })
      .from(stage.current, { yPercent: 14, duration: 1.6, ease: "expo.out" })
      .from(ring.current.children, { opacity: 0, y: 80, duration: 1.2, ease: "expo.out", stagger: { each: 0.04, from: "center" } }, 0);
    return () => tl.kill();
  }, [ready]);

  return (
    <div
      ref={stage}
      data-cursor="Geser"
      className="cyl-stage invisible relative mx-auto h-[460px] w-full cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
      style={{ perspective: "1100px" }}
    >
      <div ref={ring} className="cyl-ring absolute left-1/2 top-1/2" style={{ width: W, height: H, marginLeft: -W / 2, marginTop: -H / 2 }}>
        {cards.map((c, i) => (
          <div key={i} className="cyl-card" style={{ width: W, height: H, transform: `rotateY(${i * step}deg) translateZ(${-radius}px)` }}>
            <Card card={c} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Coverflow({ cards }) {
  return (
    <Swiper
      modules={[EffectCoverflow, Autoplay, A11y]}
      effect="coverflow"
      centeredSlides
      loop
      slidesPerView={1.45}
      spaceBetween={-10}
      speed={800}
      autoplay={{ delay: 3200, disableOnInteraction: false }}
      coverflowEffect={{ rotate: 18, stretch: 0, depth: 160, modifier: 1, slideShadows: false }}
      breakpoints={{ 560: { slidesPerView: 2.2 } }}
      className="!overflow-visible !pb-2"
    >
      {cards.map((c, i) => (
        <SwiperSlide key={i} className="aspect-[280/380]">
          <Card card={c} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

function Card({ card }) {
  const base = "relative h-full w-full overflow-hidden rounded-[22px] ring-1 ring-black/5 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)]";
  if (card.type === "stat") {
    return (
      <div className={cn(base, card.tone === "red" ? "bg-primary text-white" : "bg-tile text-night", "flex flex-col justify-between p-6")}>
        <span className={cn("text-[13px] font-medium", card.tone === "red" ? "text-white/70" : "text-night/50")}>{card.label}</span>
        <div>
          <p className="display-xl text-[3.4rem]">{card.value}</p>
          <p className={cn("mt-2 text-sm", card.tone === "red" ? "text-white/75" : "text-night/60")}>{card.caption}</p>
        </div>
      </div>
    );
  }
  if (card.type === "lottie") {
    return (
      <div className={cn(base, "flex flex-col justify-between bg-brand-deep p-6 text-white")}>
        <span className="text-[13px] font-medium text-white/55">{card.label}</span>
        <LottieIllustration src={card.src} className="mx-auto w-full" />
        <p className="text-sm text-white/75">{card.caption}</p>
      </div>
    );
  }
  return (
    <div className={cn(base, "bg-tile-muted")}>
      <Image src={card.image} alt={card.alt ?? ""} fill sizes="300px" draggable={false} className={cn("object-cover", card.crop && "scale-[1.12]", card.lift && "brightness-[1.3]")} style={{ objectPosition: card.position }} />
      {card.caption && (
        <span className="absolute inset-x-3 bottom-3 rounded-full bg-white/85 px-3 py-1.5 text-center text-xs font-medium text-night backdrop-blur-md">
          {card.caption}
        </span>
      )}
    </div>
  );
}
