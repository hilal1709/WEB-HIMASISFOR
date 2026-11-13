"use client";
import { useLayoutEffect as useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { initials } from "@/lib/struktur-content";
import { Container, SectionHeader } from "@/components/home/shared";
import { Banner } from "@/components/ui/banner";
import { usePersonModal } from "./person-modal";
import { cn } from "@/lib/utils";

/**
 * Bagan organisasi interaktif, dibangun dari `reportsTo`:
 *   puncak (tanpa reportsTo) → baris anak langsung (garis bus) → cucu sebagai daftar ringkas di bawah induknya.
 * - Garis konektor "tumbuh" saat bagan masuk layar (GSAP ScrollTrigger).
 * - Hover/fokus kartu: kartu & atasannya menyala, jalur konektornya maroon, cabang lain meredup.
 * - < lg: daftar bertingkat dengan garis vertikal.
 * Klik kartu → modal detail.
 */
export function OrgChart({ people, confirmed }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(null);

  const tree = useMemo(() => {
    const byKey = Object.fromEntries(people.map((p) => [p.key, p]));
    const root = people.find((p) => !p.reportsTo || !byKey[p.reportsTo]) ?? people[0];
    const childrenOf = (k) => people.filter((p) => p.reportsTo === k && p.key !== root.key);
    const staff = childrenOf(root.key).filter((p) => p.group === "staff");
    const level1 = childrenOf(root.key).filter((p) => p.group !== "staff");
    return { byKey, root, staff, level1, childrenOf };
  }, [people]);

  // jalur menyala = kartu yang di-hover + semua atasannya + semua bawahannya
  const lit = useMemo(() => {
    const s = new Set();
    let k = hover;
    while (k && tree.byKey[k] && !s.has(k)) {
      s.add(k);
      k = tree.byKey[k].reportsTo;
    }
    const down = (key) =>
      people.forEach((p) => {
        if (p.reportsTo === key && !s.has(p.key)) {
          s.add(p.key);
          down(p.key);
        }
      });
    if (hover) down(hover);
    return s;
  }, [hover, tree, people]);

  const dim = (p) => !!hover && !lit.has(p.key);
  const anyLit = tree.level1.some((m) => lit.has(m.key));

  // urutan daftar mobile: puncak, lalu tiap anak diikuti cucunya
  const flat = useMemo(() => {
    const out = [{ p: tree.root, depth: 0 }, ...tree.staff.map((p) => ({ p, depth: 1 }))];
    tree.level1.forEach((m) => {
      out.push({ p: m, depth: 1 });
      tree.childrenOf(m.key).forEach((c) => out.push({ p: c, depth: 2 }));
    });
    return out;
  }, [tree]);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-tree]", start: "top 75%", once: true } });
      tl.from("[data-tree] [data-card='0']", { y: 24, opacity: 0, duration: 0.7, ease: "expo.out" })
        .from("[data-tree] [data-h='staff']", { scaleX: 0, duration: 0.4, ease: "power2.inOut" }, "-=0.3")
        .from("[data-tree] [data-card='staff']", { x: -12, opacity: 0, duration: 0.5, ease: "expo.out" }, "-=0.15")
        .from("[data-tree] [data-v='trunk']", { scaleY: 0, duration: 0.45, ease: "power2.inOut" }, "-=0.3")
        .from("[data-tree] [data-h='bus']", { scaleX: 0, duration: 0.6, ease: "power3.inOut" })
        .from("[data-tree] [data-v='drop']", { scaleY: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" }, "-=0.2")
        .from("[data-tree] [data-card='1']", { y: 20, opacity: 0, duration: 0.6, stagger: 0.07, ease: "expo.out" }, "-=0.15");
      gsap.from("[data-list] > li", { x: -14, opacity: 0, duration: 0.55, stagger: 0.06, ease: "expo.out", scrollTrigger: { trigger: "[data-list]", start: "top 85%", once: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  const n = tree.level1.length;

  return (
    <section ref={ref} id="bagan" className="relative scroll-mt-24 border-y border-line bg-white py-20 md:py-20">
      <Container>
        <SectionHeader
          title={["Bagan", "organisasi"]}
          body="Arahkan kursor ke salah satu kartu untuk melihat jalur koordinasinya. Klik untuk melihat bidang keahlian."
        />

        {!confirmed && (
          <Banner variant="info" dismissible title="Struktur lengkap sedang disusun" className="mt-10">
            Saat ini ditampilkan ketua program studi, dosen, dan staf prodi. Jabatan lain akan ditambahkan setelah ditetapkan.
          </Banner>
        )}

        {/* Desktop: pohon */}
        <div data-tree className="relative mt-14 hidden lg:block" onPointerLeave={() => setHover(null)}>
          <div className="grid grid-cols-[1fr_320px_1fr] items-center">
            <div />
            <div data-card="0">
              <PersonCard person={tree.root} variant="lead" dim={dim(tree.root)} lit={lit.has(tree.root.key)} onHover={setHover} />
            </div>
            {/* garis staf: tenaga kependidikan di samping Kaprodi */}
            <div className="flex items-center">
              {tree.staff.length > 0 && (
                <>
                  <Conn data-h="staff" lit={tree.staff.some((p) => lit.has(p.key))} className="h-[2px] w-10 shrink-0 origin-left xl:w-16" />
                  <div className="flex flex-col gap-3">
                    {tree.staff.map((p) => (
                      <div key={p.key} data-card="staff" className="w-[230px]">
                        <PersonCard person={p} variant="row" dim={dim(p)} lit={lit.has(p.key)} onHover={setHover} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {n > 0 && (
            <>
              <div className="flex justify-center">
                <Conn data-v="trunk" vertical lit={anyLit} className="h-14 origin-top" />
              </div>
              <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
                {tree.level1.map((m, i) => {
                  const kids = tree.childrenOf(m.key);
                  return (
                    <div key={m.key} className="relative flex flex-col items-center">
                      {n > 1 && (
                        <Conn
                          data-h="bus"
                          lit={lit.has(m.key)}
                          className={cn(
                            "absolute top-0 h-[2px]",
                            i === 0 ? "left-1/2 -right-2.5 origin-left" : i === n - 1 ? "-left-2.5 right-1/2 origin-right" : "-inset-x-2.5 origin-center"
                          )}
                        />
                      )}
                      <Conn data-v="drop" vertical lit={lit.has(m.key)} className="h-9 origin-top" />
                      <div data-card="1" className="flex w-full flex-1 flex-col">
                        <PersonCard person={m} variant="member" dim={dim(m)} lit={lit.has(m.key)} onHover={setHover} />
                        {kids.length > 0 && (
                          <ul className="mt-3 space-y-2 border-l-2 border-navy/10 pl-3">
                            {kids.map((c) => (
                              <li key={c.key}>
                                <PersonCard person={c} variant="row" dim={dim(c)} lit={lit.has(c.key)} onHover={setHover} />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* < lg: daftar bertingkat */}
        <ol data-list className="relative mt-10 space-y-3 lg:hidden">
          <span aria-hidden className="absolute bottom-8 left-3 top-8 w-[2px] bg-navy/10" />
          {flat.map(({ p, depth }) => (
            <li key={p.key} className={cn("relative", depth === 1 && "pl-6", depth === 2 && "pl-12")}>
              {depth > 0 && <span aria-hidden className={cn("absolute left-3 top-1/2 h-[2px] bg-navy/10", depth === 2 ? "w-9" : "w-3")} />}
              <PersonCard person={p} variant="row" dim={false} lit={false} onHover={() => {}} />
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

function Conn({ vertical, lit, className, ...props }) {
  return <span aria-hidden className={cn("block transition-colors duration-500", vertical && "w-[2px]", lit ? "bg-maroon" : "bg-navy/15", className)} {...props} />;
}

function PersonCard({ person: p, variant, dim, lit, onHover }) {
  const open = usePersonModal();
  const lead = variant === "lead";
  const row = variant === "row";
  const member = variant === "member";

  return (
    <button
      type="button"
      onClick={() => open(p.key)}
      onPointerEnter={() => onHover(p.key)}
      onFocus={() => onHover(p.key)}
      onBlur={() => onHover(null)}
      aria-label={`${p.name}, ${p.role}. Lihat detail`}
      className={cn(
        "group relative flex w-full items-center gap-4 overflow-hidden rounded-lg border bg-white text-left outline-none",
        "transition-[opacity,filter,transform,border-color,box-shadow] duration-500 ease-cinematic",
        "hover:-translate-y-1 hover:shadow-[0_26px_50px_-34px_rgb(20_33_61/0.6)] focus-visible:ring-2 focus-visible:ring-maroon/50 active:scale-[0.985]",
        lead ? "flex-col p-6 text-center" : row ? "p-3" : "h-full flex-col items-start justify-start p-4",
        lit ? "border-maroon/35" : "border-line",
        dim && "opacity-50"
      )}
    >
      <span aria-hidden className={cn("absolute inset-x-0 top-0 block h-[3px] origin-left bg-gold transition-transform duration-700 ease-cinematic group-hover:scale-x-100", lit ? "scale-x-100" : "scale-x-0")} />
      {lead && <span aria-hidden className="absolute inset-0 bg-cream/60" />}

      <span
        className={cn(
          "relative z-10 grid shrink-0 place-items-center overflow-hidden bg-cream-2 font-serif text-maroon",
          lead ? "size-24 rounded-full ring-4 ring-white" : member ? "aspect-[4/3] w-full rounded-md text-3xl" : "size-14 rounded-full text-lg"
        )}
      >
        {p.photo ? (
          <Image
            src={p.photo}
            alt=""
            fill
            sizes={member ? "240px" : "96px"}
            className="object-cover object-top transition-transform duration-700 ease-cinematic group-hover:scale-[1.06]"
          />
        ) : (
          initials(p.name)
        )}
      </span>

      <span className={cn("relative z-10 min-w-0", lead && "mt-1")}>
        <span className={cn("kicker block text-[11px] text-maroon", lead && "text-[12px]")}>{p.role}</span>
        <span className={cn("mt-1.5 block font-serif leading-snug text-navy", lead ? "text-[1.45rem]" : "text-[1.05rem]")}>{p.name}</span>
        {lead && p.credentials && <span className="mt-1 block text-[13px] text-text/50">{p.credentials}</span>}
        {member && p.expertise?.[0] && <span className="mt-1 block truncate text-[12.5px] text-text/55">{p.expertise[0]}</span>}
        {!row && (
          <span className={cn("mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-navy/60 transition-colors group-hover:text-maroon", lead && "justify-center")}>
            Lihat profil
            <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 transition-transform duration-500 ease-cinematic group-hover:translate-x-1">
              <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </span>
    </button>
  );
}
