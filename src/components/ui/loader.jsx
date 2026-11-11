"use client";
import { useEffect, useRef } from "react";
import { createTimeline, stagger, svg } from "animejs";
import { cn } from "@/lib/utils";

/** Spinner kecil untuk tombol / inline. */
export function Spinner({ className }) {
  return (
    <svg
      role="status"
      aria-label="Memuat"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("size-5 animate-spin", className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Tiga titik melompat — untuk "mengetik" / proses ringan. */
export function DotsLoader({ className }) {
  return (
    <span role="status" aria-label="Memuat" className={cn("inline-flex items-center gap-1 text-primary", className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2 animate-bounce rounded-full bg-current"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

/** Path logo Sistem Informasi UISI (public/img/sisfor.svg) — dipakai untuk animasi gambar-garis. */
const LOGO_PATHS = [
  "M54.1231 93.0173V101.555H35.1504V92.0687C35.1504 59.5859 61.4829 33.2534 93.9656 33.2534H171.754V53.1747H93.9657C71.9612 53.1747 54.1231 71.0129 54.1231 93.0173Z",
  "M23.0168 84.6695L22.8182 101.555H1.94824L2.55053 80.2745C3.79978 36.1342 39.9424 1 84.1003 1H171.754V20.9213H87.5194C52.1892 20.9213 23.4325 49.3417 23.0168 84.6695Z",
  "M118.631 75.942L118.631 71.1989L137.604 71.1989L137.604 76.8907C137.604 109.373 111.271 135.706 78.7883 135.706L69.3019 135.706L69.3019 115.785L78.7883 115.785C100.793 115.785 118.631 97.9465 118.631 75.942Z",
  "M149.774 84.3275L149.936 71.1989L170.806 71.1989L170.289 88.7755C168.992 132.879 132.864 167.959 88.7415 167.959L68.3533 167.959L68.3533 148.038L85.2715 148.038C120.587 148.038 149.338 119.64 149.774 84.3275Z",
  "M1.95 115.785H55.07V134.76H1.95Z",
  "M1.95 148.038H55.07V167.01H1.95Z",
];

/**
 * Logo yang digambar garis demi garis (anime.js), lalu terisi warna,
 * wordmark muncul, dan progress bar 2px berjalan. Bukan spinner (ditolak di PRODUCT.md).
 */
export function LogoDraw({ label = "Sistem Informasi", sub = "Universitas Internasional Semen Indonesia", loop = false, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paths = el.querySelectorAll("[data-stroke]");
    if (reduce) {
      paths.forEach((p) => {
        p.style.fillOpacity = 1;
        p.style.strokeDashoffset = 0;
      });
      return;
    }
    const tl = createTimeline({ loop, defaults: { ease: "inOutCubic" } });
    tl.add(svg.createDrawable(paths), { draw: ["0 0", "0 1"], duration: 900, delay: stagger(90) })
      .add(paths, { fillOpacity: [0, 1], duration: 450, delay: stagger(40) }, "-=250")
      .add(el.querySelector("[data-dot]"), { scale: [0, 1], duration: 450, ease: "outBack(2)" }, "-=500")
      .add(el.querySelectorAll("[data-word]"), { opacity: [0, 1], translateY: [8, 0], duration: 500, delay: stagger(80) }, "-=600")
      .add(el.querySelector("[data-bar]"), { scaleX: [0, 1], duration: 1700, ease: "inOutQuart" }, 0);
    if (loop) tl.add({ duration: 500 });
    return () => tl.revert();
  }, [loop]);

  return (
    <div ref={ref} role="status" aria-label="Memuat" className={cn("flex flex-col items-center", className)}>
      <svg viewBox="0 0 173 169" className="size-16 overflow-visible" fill="none">
        {LOGO_PATHS.map((d, i) => (
          <path
            key={i}
            data-stroke
            d={d}
            stroke="var(--navy)"
            strokeWidth="2"
            strokeLinejoin="round"
            style={{ fill: i < 4 ? "var(--navy)" : "var(--maroon)", fillOpacity: 0 }}
          />
        ))}
        <circle data-dot cx="86.38" cy="84.48" r="16.13" fill="var(--maroon)" style={{ transformOrigin: "86px 84px" }} />
      </svg>
      <p data-word className="mt-5 font-serif text-xl text-navy">
        {label}
      </p>
      <p data-word className="mt-1 text-xs text-muted-foreground">
        {sub}
      </p>
      <span className="mt-6 block h-0.5 w-40 overflow-hidden rounded-full bg-border">
        <span data-bar className="block h-full w-full origin-left bg-gold" />
      </span>
    </div>
  );
}

/** Loader brand (navigasi antar halaman) — logo digambar berulang. */
export function BrandLoader({ label = "Memuat…", className }) {
  return <LogoDraw loop sub={label} className={className} />;
}

/** Overlay layar penuh. */
export function PageLoader({ label }) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-paper">
      <BrandLoader label={label} />
    </div>
  );
}

/** Skeleton shimmer. */
export function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-shimmer rounded-md bg-muted",
        className
      )}
      {...props}
    />
  );
}
