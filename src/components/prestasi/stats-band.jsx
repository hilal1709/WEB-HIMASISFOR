"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { countUp } from "@/lib/motion";
import { Container } from "@/components/home/shared";
import { usePrestasi } from "./prestasi-provider";

/** Pita terang: angka turunan data prestasi (bukan contoh), berhitung saat terlihat. */
export function StatsBand() {
  const { stats } = usePrestasi();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.querySelectorAll("[data-count]").forEach((n, i) => setTimeout(() => countUp(n, Number(n.dataset.count), { duration: 1300 }), i * 110));
        io.disconnect();
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden border-y border-gold/30 bg-cream-2 py-12 md:py-14">
      <Container>
        <dl className="grid grid-cols-2 gap-y-8 md:grid-cols-4 md:divide-x md:divide-gold/40">
          {stats.map((s, i) => (
            <div key={s.label} data-aos="fade-up" data-aos-delay={i * 70} className="md:px-8 md:first:pl-0">
              <dd className="font-serif text-[clamp(2.5rem,5vw,3.75rem)] leading-none tabular-nums text-maroon">
                <span data-count={s.value}>0</span>
              </dd>
              <dt className="mt-2 text-[13.5px] text-text/60">{s.label}</dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
