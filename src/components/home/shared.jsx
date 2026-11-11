"use client";
import { SplitReveal } from "@/components/motion/split-reveal";
import { cn } from "@/lib/utils";

/**
 * Primitif beranda "Kampus v3": judul serif (Noto Serif Display) dengan frasa italic,
 * maroon untuk aksi, navy untuk permukaan gelap, gold untuk aksen tipis. Tanpa gradien,
 * tanpa label pil di atas judul.
 */

export function Container({ className, children, as: Tag = "div", ...props }) {
  return (
    <Tag className={cn("mx-auto w-full max-w-[1240px] px-5 md:px-8", className)} {...props}>
      {children}
    </Tag>
  );
}

/** Dipertahankan untuk kompatibilitas (halaman lain). Tidak dipakai di beranda v3. */
export function Eyebrow({ children, tone = "light", className }) {
  return <span className={cn("kicker", tone === "light" ? "text-maroon" : "text-gold-soft", className)}>{children}</span>;
}

/** Judul serif. `title` = string atau [sebelum, aksen-italic, sesudah?]. */
export function SceneTitle({ lines, title, as = "h2", tone = "light", align = "left", size = "lg", className, trigger = "scroll" }) {
  const parts = title ?? lines;
  const [a, accent, c] = Array.isArray(parts) ? parts : [parts];
  return (
    <SplitReveal
      as={as}
      trigger={trigger}
      className={cn(
        "font-serif font-normal text-balance leading-[1.08] tracking-[-0.01em]",
        size === "lg" ? "text-[clamp(2rem,3.8vw,3.25rem)]" : "text-[clamp(1.6rem,2.6vw,2.25rem)]",
        tone === "light" ? "text-navy" : "text-white",
        align === "center" && "text-center",
        className
      )}
    >
      {a}
      {accent && (
        <>
          {" "}
          <em className={cn("italic", tone === "light" ? "text-maroon" : "text-gold-soft")}>{accent}</em>
        </>
      )}
      {c && <> {c}</>}
    </SplitReveal>
  );
}

/** Header section: judul + deskripsi (+ aksi di kanan). Garis emas pendek sebagai penanda. */
export function SectionHeader({ title, body, tone = "light", align = "left", size, action, className }) {
  const center = align === "center";
  return (
    <div className={cn(center ? "mx-auto flex max-w-2xl flex-col items-center text-center" : "flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className={cn(!center && "max-w-2xl")}>
        <span aria-hidden className={cn("mb-5 block h-[3px] w-10 bg-gold", center && "mx-auto")} />
        <SceneTitle title={title} tone={tone} align={align} size={size} />
        {body && (
          <p data-aos="fade-up" data-aos-delay="100" className={cn("mt-4 text-pretty text-[16.5px] leading-relaxed", tone === "light" ? "text-text/65" : "text-white/70")}>
            {body}
          </p>
        )}
      </div>
      {action && (
        <div data-aos="fade-up" data-aos-delay="150" className={cn("shrink-0", center && "mt-6")}>
          {action}
        </div>
      )}
    </div>
  );
}

/** Tautan teks dengan garis emas tumbuh + panah bergeser. */
export function ArrowLink({ href, children, tone = "light", className, ...props }) {
  return (
    <a
      href={href}
      className={cn("group inline-flex items-center gap-2 text-sm font-semibold", tone === "light" ? "text-maroon" : "text-white", className)}
      {...props}
    >
      <span className="u-gold">{children}</span>
      <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform duration-500 ease-cinematic group-hover:translate-x-1">
        <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

/** Tombol kampus (radius kecil, bukan pil SaaS). */
export function PillLink({ href, children, variant = "maroon", size = "md", className, icon, ...props }) {
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-[background-color,color,border-color,transform] duration-300 ease-cinematic active:scale-[0.98]",
        size === "md" ? "h-12 px-6 text-[15px]" : "h-10 px-4 text-sm",
        (variant === "maroon" || variant === "brand" || variant === "dark") && "bg-maroon text-white hover:bg-maroon-deep",
        variant === "navy" && "bg-navy text-white hover:bg-navy-deep",
        variant === "gold" && "bg-gold text-navy hover:bg-gold-soft",
        variant === "outline" && "border border-navy/25 bg-white text-navy hover:border-navy",
        (variant === "white" || variant === "glass") && "bg-white text-navy hover:bg-cream",
        variant === "outline-light" && "border border-white/40 text-white hover:border-white hover:bg-white/10",
        className
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
      <svg aria-hidden viewBox="0 0 16 16" className="size-4 -mr-1 transition-transform duration-300 group-hover:translate-x-0.5">
        <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

/** Label "Contoh konten" untuk data yang belum resmi (PRODUCT.md). */
export function PlaceholderTag({ tone = "light", className }) {
  return (
    <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium", tone === "light" ? "bg-cream-2 text-text/55" : "bg-white/10 text-white/60", className)}>
      Contoh konten · menunggu data CMS
    </span>
  );
}
