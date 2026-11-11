"use client";
import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { Container, PlaceholderTag } from "@/components/home/shared";

/**
 * Pita navy berisi angka sorotan lulusan. Saat terlihat: angka berhitung naik (anime.js),
 * garis emas di atas tiap angka memanjang bergantian.
 */
export function StatsBand({ stats }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nums = [...el.querySelectorAll("[data-num]")];
    if (prefersReducedMotion()) return;
    nums.forEach((n) => (n.textContent = "0"));
    const anims = [];
    const io = new IntersectionObserver(
      ([e]) => {
        // mulai saat terlihat — atau bila section sudah terlewati (mis. lompat lewat tautan)
        if (e.intersectionRatio < 0.4 && e.boundingClientRect.top > 0) return;
        io.disconnect();
        anims.push(animate(el.querySelectorAll("[data-bar]"), { scaleX: [0, 1], duration: 900, delay: stagger(120), ease: "inOutQuart" }));
        nums.forEach((n, i) => {
          const state = { v: 0 };
          const to = Number(n.dataset.num);
          anims.push(
            animate(state, {
              v: to,
              duration: 1600,
              delay: 150 + i * 120,
              ease: "outExpo",
              onUpdate: () => (n.textContent = Math.round(state.v).toLocaleString("id-ID")),
            })
          );
        });
      },
      { threshold: [0, 0.4] }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      anims.forEach((a) => a.pause?.());
    };
  }, []);

  return (
    <section ref={ref} aria-label="Angka lulusan" className="bg-navy py-12 text-white md:py-14">
      <Container>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="group flex flex-col">
              <span data-bar aria-hidden className="block h-[3px] w-10 origin-left bg-gold transition-[width] duration-500 ease-cinematic group-hover:w-16" />
              <dt className="order-last mt-2 text-sm text-white/65">{s.label}</dt>
              <dd className="mt-4 font-serif text-[clamp(2.4rem,4.4vw,3.5rem)] leading-none tabular-nums text-white">
                <span data-num={s.value}>{s.value.toLocaleString("id-ID")}</span>
                <span className="text-gold-soft">{s.suffix}</span>
              </dd>
            </div>
          ))}
        </dl>
        <PlaceholderTag tone="dark" className="mt-8" />
      </Container>
    </section>
  );
}
