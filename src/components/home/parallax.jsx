"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { gsap, ScrollTrigger, CINEMATIC_QUERY } from "@/lib/scroll";

/**
 * Parallax berlapis untuk satu babak.
 * Anak dengan `data-depth="<n>"` bergeser vertikal sebanding n selama babak melintasi layar:
 * n < 0 = lapisan jauh (bergerak lebih lambat dari scroll), n > 0 = lapisan dekat (lebih cepat).
 * `data-zoom` memperbesar lapisan perlahan. Mati di layar < 768px dan prefers-reduced-motion.
 *
 * `mode="hero"`: rentang dimulai dari atas halaman (babak sudah terlihat saat dimuat).
 */
export function ParallaxScene({ as: Tag = "section", mode = "scene", className, children, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add(CINEMATIC_QUERY, () => {
      const st =
        mode === "hero"
          ? { trigger: root, start: "top top", end: "bottom top", scrub: 0.6 }
          : { trigger: root, start: "top bottom", end: "bottom top", scrub: 0.6 };
      root.querySelectorAll("[data-depth]").forEach((el) => {
        const d = parseFloat(el.dataset.depth);
        const from = mode === "hero" ? 0 : -d * 0.5;
        gsap.fromTo(el, { yPercent: from }, { yPercent: mode === "hero" ? d : d * 0.5, ease: "none", scrollTrigger: st });
      });
      root.querySelectorAll("[data-zoom]").forEach((el) => {
        gsap.fromTo(el, { scale: 1 }, { scale: 1 + parseFloat(el.dataset.zoom), ease: "none", scrollTrigger: st });
      });
      root.querySelectorAll("[data-fade]").forEach((el) => {
        gsap.to(el, { opacity: 0, ease: "none", scrollTrigger: { ...st, end: el.dataset.fade || "60% top" } });
      });
      // Elvo berlari mendekat ke penonton di sepanjang jalan
      root.querySelectorAll("[data-approach]").forEach((el) => {
        gsap.to(el, { scale: 1.3, ease: "none", transformOrigin: "50% 100%", scrollTrigger: st });
      });
      // isi babak naik pelan saat masuk (sekali, dari keadaan yang sudah terlihat)
      root.querySelectorAll("[data-rise]").forEach((el, i) => {
        gsap.from(el, {
          y: 48,
          duration: 1.1,
          ease: "expo.out",
          delay: (i % 4) * 0.08,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    });
    const t = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      clearTimeout(t);
      mm.revert();
    };
  }, [mode]);

  return (
    <Tag ref={ref} className={className} {...props}>
      {children}
    </Tag>
  );
}
