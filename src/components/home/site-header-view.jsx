"use client";
import { useLayoutEffect as useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/lib/scroll";
import { HOME_DEFAULTS } from "@/lib/home-cms/defaults";

const ext = (href = "") => (/^https?:\/\//.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {});
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navTriggerClass,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Modal, ModalTrigger, ModalContent, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { MenuGlyph, ChevronGlyph, ArrowGlyph } from "./glyphs";

/** Bar utilitas navy: tautan per audiens (pola situs kampus). */
export function Topbar({ content: c = HOME_DEFAULTS.header }) {
  return (
    <div className="hidden bg-maroon-deep text-[13px] text-white/80 md:block">
      <div className="mx-auto flex h-9 max-w-[1240px] items-center justify-between px-8">
        <nav aria-label="Tautan audiens" className="flex items-center gap-6">
          {c.audience.map((a) => (
            <a key={a.label} href={a.href} {...ext(a.href)} className="u-gold transition-colors hover:text-white">
              {a.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-6">
          {c.utility.map((a) => (
            <a key={a.label} href={a.href} className="u-gold transition-colors hover:text-white">{a.label}</a>
          ))}
          {c.lang && <span className="text-white/45" title={c.langNote || undefined}>{c.lang}</span>}
        </div>
      </div>
    </div>
  );
}

/** Path tanpa hash/query: "/curiculum#kelulusan" → "/curiculum". */
const pathOf = (href = "") => href.split(/[?#]/)[0] || "/";

/** Menu utama yang memuat halaman aktif: cocok persis dengan salah satu sub-menu (tanpa hash), atau Beranda di "/". */
function activeMenu(pathname, NAV) {
  if (!pathname || pathname === "/") return "Beranda";
  const hit = NAV.find((n) => n.items?.some((s) => !s.href.startsWith("/#") && pathOf(s.href) === pathname));
  return hit?.label ?? null;
}

/** Header utama putih, sticky, memadat saat di-scroll. Mega menu + pencarian + tombol PMB. */
export function SiteHeader({ content: c = HOME_DEFAULTS.header }) {
  const NAV = c.nav;
  const pathname = usePathname();
  const current = activeMenu(pathname, NAV);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const st = ScrollTrigger.create({ start: 80, end: "max", onToggle: (s) => setScrolled(s.isActive) });
    return () => st.kill();
  }, []);

  return (
    <header className={cn("sticky top-0 z-50 border-b bg-white transition-[border-color,box-shadow] duration-500", scrolled ? "border-line shadow-[0_8px_24px_-20px_rgb(20_33_61/0.45)]" : "border-transparent")}>
      <div className={cn("mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-5 transition-[height] duration-500 ease-cinematic md:px-8", scrolled ? "h-16" : "h-20")}>
        <a href="/" aria-label={`${c.logoAlt}, ke beranda`} className="shrink-0">
          <Image src={c.logo} alt={c.logoAlt} width={1400} height={420} priority className={cn("w-auto transition-[height] duration-500", scrolled ? "h-9" : "h-11")} />
        </a>

        <NavigationMenu className="hidden lg:flex" aria-label="Menu utama">
          <NavigationMenuList>
            {NAV.map((item, idx) =>
              item.items?.length ? (
                <NavigationMenuItem key={item.label} className="relative">
                  <NavigationMenuTrigger
                    aria-current={current === item.label ? "page" : undefined}
                    className={cn("text-text/80 hover:text-navy data-[state=open]:text-navy", current === item.label && "text-navy")}
                  >
                    {item.label}
                  </NavigationMenuTrigger>
                  {/* Menu di separuh kanan nav di-anchor ke tepi kanan trigger agar panel tidak keluar viewport */}
                  <NavigationMenuContent className={cn("max-w-[calc(100vw-2rem)] rounded-lg border-line p-0", idx >= NAV.length / 2 ? "left-auto -right-6" : "-left-6")}>
                    <Mega item={item} pathname={pathname} />
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink asChild>
                    <a href={item.href} className={cn(navTriggerClass, "text-text/80 hover:text-navy")} aria-current={current === item.label ? "page" : undefined}>
                      {item.label}
                    </a>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <SearchButton nav={NAV} placeholder={c.searchPlaceholder} empty={c.searchEmpty} />
          {c.pmb?.label && (
            <a href={c.pmb.href} {...ext(c.pmb.href)} className="hidden h-10 items-center rounded-md bg-maroon px-5 text-sm font-semibold text-white transition-colors hover:bg-maroon-deep sm:inline-flex">
              {c.pmb.label}
            </a>
          )}
          <MobileMenu c={c} />
        </div>
      </div>
    </header>
  );
}

function Mega({ item, pathname }) {
  const f = item.feature?.title && item.feature?.image ? item.feature : null;
  return (
    <div className={cn("grid max-w-full", f ? "w-[600px] grid-cols-[1fr_232px]" : "w-[360px]")}>
      <ul className="grid content-start gap-0.5 p-3">
        {item.items.map((sub, i) => (
          <li key={sub.label} className="animate-in fade-in-0 slide-in-from-bottom-1 duration-500" style={{ animationDelay: `${60 + i * 45}ms`, animationFillMode: "both" }}>
            <NavigationMenuLink asChild>
              <a
                href={sub.href}
                aria-current={pathOf(sub.href) === pathname && !sub.href.includes("#") ? "page" : undefined}
                className="group/sub relative flex items-start justify-between gap-4 rounded-md px-3 py-2.5 transition-colors hover:bg-cream focus:bg-cream focus:outline-none aria-[current=page]:bg-cream"
              >
                <span aria-hidden className="absolute inset-y-2.5 left-0 w-[3px] origin-center scale-y-0 rounded-full bg-gold transition-transform duration-300 group-aria-[current=page]/sub:scale-y-100" />
                <span>
                  <span className="block text-sm font-semibold text-navy">{sub.label}</span>
                  <span className="mt-0.5 block text-xs text-text/55">{sub.desc}</span>
                </span>
                <ArrowGlyph className="mt-1 size-3.5 shrink-0 -translate-x-1 text-maroon opacity-0 transition-all duration-300 group-hover/sub:translate-x-0 group-hover/sub:opacity-100" />
              </a>
            </NavigationMenuLink>
          </li>
        ))}
      </ul>
      {f && (
        <NavigationMenuLink asChild>
          <a href={f.href} className="group/feat m-3 ml-0 flex flex-col overflow-hidden rounded-md bg-navy text-white animate-in fade-in-0 duration-500" style={{ animationDelay: "120ms", animationFillMode: "both" }}>
            {/* foto mengisi sisa tinggi panel agar tidak ada ruang kosong saat sub-menu panjang */}
            <span className="relative block min-h-[150px] flex-1 overflow-hidden">
              <Image src={f.image} alt="" fill sizes="240px" className="scale-[1.08] object-cover transition-transform duration-700 group-hover/feat:scale-[1.14]" />
            </span>
            <span className="shrink-0 p-4">
              <span className="block font-serif text-lg leading-snug">{f.title}</span>
              <span className="mt-1 block text-xs leading-relaxed text-white/70">{f.body}</span>
            </span>
          </a>
        </NavigationMenuLink>
      )}
    </div>
  );
}

function SearchButton({ nav: NAV, placeholder, empty }) {
  const [q, setQ] = useState("");
  const links = useMemo(() => NAV.flatMap((n) => (n.items?.length ? n.items.map((s) => ({ ...s, group: n.label })) : [{ ...n, group: "Utama" }])), [NAV]);
  const shown = links.filter((l) => (l.label + " " + (l.desc ?? "")).toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal onOpenChange={(o) => !o && setQ("")}>
      <ModalTrigger aria-label="Cari" className="grid size-10 place-items-center rounded-md text-navy transition-colors hover:bg-cream">
        <svg aria-hidden viewBox="0 0 20 20" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <circle cx="9" cy="9" r="6" />
          <path d="M13.5 13.5 17 17" />
        </svg>
      </ModalTrigger>
      <ModalContent className="top-[18%] max-w-xl translate-y-0 p-0">
        <ModalTitle className="sr-only">Cari halaman</ModalTitle>
        <ModalDescription className="sr-only">Ketik untuk menyaring halaman situs</ModalDescription>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="h-14 w-full border-b border-line px-5 pr-12 text-[15px] outline-none placeholder:text-text/40"
        />
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {shown.map((l) => (
            <li key={l.group + l.label}>
              <a href={l.href} className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm hover:bg-cream">
                <span className="font-medium text-navy">{l.label}</span>
                <span className="text-xs text-text/45">{l.group}</span>
              </a>
            </li>
          ))}
          {!shown.length && <li className="px-3 py-6 text-center text-sm text-text/50">{empty}</li>}
        </ul>
      </ModalContent>
    </Modal>
  );
}

function MobileMenu({ c }) {
  const NAV = c.nav;
  const [open, setOpen] = useState(null);
  return (
    <Sheet>
      <SheetTrigger aria-label="Buka menu" className="grid size-10 place-items-center rounded-md text-navy ring-1 ring-line transition hover:bg-cream lg:hidden">
        <MenuGlyph className="size-5" />
      </SheetTrigger>
      <SheetContent>
        <div className="border-b px-5 py-5">
          <SheetTitle className="font-serif text-xl font-normal text-navy">Menu</SheetTitle>
          <SheetDescription>Navigasi situs Sistem Informasi UISI</SheetDescription>
        </div>
        <nav aria-label="Menu seluler" className="flex-1 overflow-y-auto px-3 py-3">
          {NAV.map((item) =>
            item.items?.length ? (
              <div key={item.label} className="border-b border-line last:border-0">
                <button type="button" aria-expanded={open === item.label} onClick={() => setOpen(open === item.label ? null : item.label)} className="flex w-full items-center justify-between px-3 py-3.5 text-left text-[15px] font-medium text-navy">
                  {item.label}
                  <ChevronGlyph className={cn("size-4 text-text/50 transition-transform duration-300", open === item.label && "rotate-180")} />
                </button>
                <div className={cn("grid transition-[grid-template-rows] duration-500 ease-cinematic", open === item.label ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <ul className="overflow-hidden pb-1">
                    {item.items.map((sub) => (
                      <li key={sub.label}>
                        <SheetClose asChild>
                          <a href={sub.href} className="block rounded-md px-3 py-2.5 pl-6 text-sm text-text/65 hover:bg-cream hover:text-navy">{sub.label}</a>
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <SheetClose asChild key={item.label}>
                <a href={item.href} className="block border-b border-line px-3 py-3.5 text-[15px] font-medium text-navy">{item.label}</a>
              </SheetClose>
            )
          )}
          <div className="mt-4 grid grid-cols-2 gap-2 px-3">
            {c.audience.map((a) => (
              <a key={a.label} href={a.href} {...ext(a.href)} className="rounded-md bg-cream px-3 py-2.5 text-xs font-medium text-navy">{a.label}</a>
            ))}
          </div>
        </nav>
        <div className="border-t p-5">
          <a href={c.pmb.href} {...ext(c.pmb.href)} className="flex h-12 items-center justify-center rounded-md bg-maroon text-sm font-semibold text-white">{c.mobileCta}</a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
