"use client";
import Image from "next/image";
import { prefersReducedMotion } from "@/lib/motion";
import { HOME_DEFAULTS } from "@/lib/home-cms/defaults";
import { LordIcon } from "@/components/media/lord-icon";
import { Container } from "./shared";
import { ArrowUpGlyph } from "./glyphs";
import { ElvoPeek } from "./elvo-peek";

const brand = (d) =>
  function BrandIcon({ className }) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
        <path d={d} />
      </svg>
    );
  };
export const SOCIAL_ICON = {
  Instagram: brand("M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 4.7a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2zm0 8.4a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6zm5.3-9.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"),
  YouTube: brand("M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"),
  TikTok: brand("M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.2a6.3 6.3 0 1 0 5.4 6.2V8.6a7.9 7.9 0 0 0 4.6 1.5V6.7a4.6 4.6 0 0 1-4.6-4.7z"),
};

/** Footer kampus navy: identitas & kontak, kolom tautan, sosial, garis emas, kembali ke atas. */
export function SiteFooter({ content: FOOTER = HOME_DEFAULTS.footer }) {
  const toTop = () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  return (
    <footer id="kontak" className="relative bg-maroon-deep text-white/75">
      <div className="absolute -top-[86px] right-[8%] hidden md:block">
        <div className="relative"><ElvoPeek pose={FOOTER.mascot.pose} size={92} say={FOOTER.mascot.say} delay={0.5} /></div>
      </div>
      <Container className="grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:py-16">
        <div>
          <span className="inline-block rounded bg-white px-3 py-2">
            <Image src={FOOTER.logo} alt="Sistem Informasi UISI" width={1400} height={420} className="h-9 w-auto" />
          </span>
          <p className="mt-6 flex max-w-sm gap-2.5 text-sm leading-relaxed">
            <span className="footer-loc mt-0.5">
              <LordIcon name="location" size={20} trigger="hover" target=".footer-loc" colors="primary:#ffffff,secondary:#c9a227" />
            </span>
            {FOOTER.address}
          </p>
          {FOOTER.map?.label && (
            <a href={FOOTER.map.href} target="_blank" rel="noopener noreferrer" className="u-gold mt-3 inline-block text-sm font-semibold text-gold-soft">
              {FOOTER.map.label}
            </a>
          )}
          <ul className="mt-6 flex gap-2">
            {FOOTER.socials.map((s) => {
              const Icon = SOCIAL_ICON[s.name];
              return (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} className="grid size-10 place-items-center rounded-full border border-white/20 text-white transition-[background-color,border-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-maroon-deep">
                    {Icon && <Icon className="size-4" />}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        {FOOTER.columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="font-serif text-lg text-white">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="u-gold text-sm transition-colors hover:text-white">{label}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-gold/40">
        <Container className="flex flex-col gap-4 py-5 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <p>{FOOTER.copyright.replace("{tahun}", String(new Date().getFullYear()))}</p>
          <div className="flex items-center gap-5">
            {FOOTER.bottomLinks.map((a) => (
              <a key={a.label} href={a.href} className="u-gold hover:text-white">{a.label}</a>
            ))}
            <button type="button" onClick={toTop} className="group inline-flex items-center gap-2 rounded border border-white/20 px-3 py-1.5 font-medium text-white transition-colors hover:border-gold hover:bg-gold hover:text-maroon-deep">
              {FOOTER.toTop}
              <ArrowUpGlyph className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </Container>
      </div>
    </footer>
  );
}
