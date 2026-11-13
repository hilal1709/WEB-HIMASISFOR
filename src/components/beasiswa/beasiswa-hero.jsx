"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion, curtainDelay } from "@/lib/motion";
import { CURTAIN_KEY, rupiahLess } from "@/lib/beasiswa-content";
import { Container, SceneTitle } from "@/components/home/shared";
import { ElvoPeek } from "@/components/home/elvo-peek";
import { cn } from "@/lib/utils";
import { smoothTo, useBeasiswa } from "./beasiswa-provider";

/**
 * Hero "angka raksasa": judul + intro, lalu persen UKT yang ditanggung beasiswa yang disorot sebagai angka serif
 * raksasa yang berhitung (GSAP), lalu tag kertas tergantung di seutas tali, satu per beasiswa. Hover/fokus tag →
 * angkanya berganti; klik → rincian. Tag berganti sendiri tiap 3,4 dtk sampai disentuh. Tanpa ilustrasi garis.
 */
export function BeasiswaHero() {
  const { intro, items, focus, setFocus, open } = useBeasiswa();
  const ref = useRef(null);
  const pct = useRef(null);
  const touched = useRef(false);
  const [auto, setAuto] = useState(true);
  const current = items.find((s) => s.slug === focus) ?? items[0];

  // masuk
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const delay = curtainDelay(CURTAIN_KEY);
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", delay });
      gsap.from("[data-tag] > button", { y: -40, rotate: -14, opacity: 0, duration: 1.4, stagger: 0.07, ease: "elastic.out(1, 0.5)", delay: delay + 0.35, clearProps: "transform,opacity" });
    }, el);
    return () => ctx.revert();
  }, []);

  // angka persen raksasa berhitung ke cakupan beasiswa yang disorot
  useEffect(() => {
    const n = pct.current;
    if (!n || !current) return;
    if (prefersReducedMotion()) {
      n.textContent = String(current.coverage);
      return;
    }
    const st = { v: Number(n.textContent) || 0 };
    const t = gsap.to(st, { v: current.coverage, duration: 1, ease: "expo.out", onUpdate: () => (n.textContent = String(Math.round(st.v))) });
    return () => t.kill();
  }, [current]);

  // ganti sendiri sampai pengguna menyentuh tag
  useEffect(() => {
    if (!auto || prefersReducedMotion() || items.length < 2) return;
    const id = setInterval(() => {
      if (touched.current) return;
      setFocus((f) => {
        const i = items.findIndex((s) => s.slug === f);
        return items[(i + 1) % items.length].slug;
      });
    }, 3400);
    return () => clearInterval(id);
  }, [auto, items, setFocus]);

  const pick = (slug) => {
    touched.current = true;
    setAuto(false);
    setFocus(slug);
  };

  return (
    <section ref={ref} className="relative overflow-hidden pb-10 pt-10 md:pb-14 md:pt-14">
      <Container>
        <nav aria-label="Breadcrumb" data-hero-fade className="text-sm text-text/55">
          <ol className="flex flex-wrap items-center gap-2">
            <li><a href="/" className="u-gold transition-colors hover:text-maroon">Beranda</a></li>
            <li aria-hidden>/</li>
            <li>Layanan</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-navy">Beasiswa</li>
          </ol>
        </nav>

        {/* angka memimpin: persen UKT yang ditanggung (kiri), judul + intro di sebelahnya (kanan) */}
        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-14">
          <div data-hero-fade aria-live="polite" className="relative lg:border-r lg:border-line lg:pr-14">
            <p className="font-serif leading-[0.78] tracking-tight text-maroon">
              <span ref={pct} className="tabular-nums text-[clamp(7rem,20vw,15rem)]">{current?.coverage ?? 0}</span>
              <span className="text-[clamp(3rem,8vw,6rem)]">%</span>
            </p>
            <span className="kicker mt-4 block text-[11px] text-text/50">UKT ditanggung · {current?.org}</span>
            <span className="mt-1 block font-serif text-[clamp(1.3rem,2.2vw,1.75rem)] leading-tight text-navy">{current?.name}</span>
            {current?.living && <span className="mt-2 inline-block rounded-full bg-gold/20 px-3 py-1 text-[12.5px] font-semibold text-navy">+ biaya hidup</span>}
            <div className="pointer-events-none absolute -top-10 right-6 hidden xl:block">
              <ElvoPeek pose="confident" size={76} side="left" say="Sentuh tagnya, angkanya ikut berubah." />
            </div>
          </div>
          <div>
            <SceneTitle as="h1" trigger="mount" title={["Kuliah tetap jalan,", "biayanya ditanggung bersama"]} className="!text-[clamp(2.1rem,3.6vw,3.4rem)] !leading-[1.04]" />
            <p data-hero-fade className="mt-5 max-w-xl text-pretty text-[16.5px] leading-relaxed text-text/70">{intro.body}</p>
            {/* tali + tag kertas */}
            <div data-hero-fade className="relative mt-8">
              <svg aria-hidden viewBox="0 0 600 24" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-6 w-full text-navy/40">
                <path d="M0 4C150 20 450 20 600 4" fill="none" stroke="currentColor" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
              </svg>
              <ul aria-label="Pilih beasiswa untuk melihat cakupannya" className="relative grid grid-cols-2 gap-x-2 gap-y-3 pt-3 sm:flex sm:flex-wrap sm:gap-x-3 sm:gap-y-5">
                {items.map((s, i) => {
                  const on = s.slug === current?.slug;
                  return (
                    <li key={s.slug} data-tag className="bs-tag-wrap" style={{ "--tilt": `${i % 2 ? 2.5 : -2.5}deg` }}>
                      <span aria-hidden className="mx-auto block h-3 w-px bg-navy/35" />
                      <button
                        type="button"
                        onPointerEnter={() => pick(s.slug)}
                        onFocus={() => pick(s.slug)}
                        onClick={() => open(s.slug)}
                        aria-pressed={on}
                        aria-label={`${s.name}: ${rupiahLess(s)}. Buka rincian`}
                        className={cn("bs-tag", on && "bs-tag-on")}
                      >
                        <span aria-hidden className="bs-tag-hole" />
                        <span className="block text-left">
                          <span className="block text-[12.5px] font-semibold leading-tight sm:text-[13.5px]">{s.name}</span>
                          <span className={cn("mt-0.5 block font-serif text-[13px] italic", on ? "text-gold-soft" : "text-maroon")}>{s.coverage}%{s.living ? " + hidup" : ""}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div data-hero-fade className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <button
                type="button"
                onClick={() => smoothTo("cek")}
                className="group inline-flex h-12 items-center gap-2 rounded-md bg-maroon px-6 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 ease-cinematic hover:bg-maroon-deep active:scale-[0.98]"
              >
                Cek mana yang cocok untukku
                <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5">
                  <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" onClick={() => smoothTo("jadwal")} className="text-[15px] font-semibold text-navy">
                <span className="u-gold">Kapan pendaftarannya dibuka?</span>
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
