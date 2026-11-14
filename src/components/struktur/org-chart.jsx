"use client";
import { createContext, useContext, useLayoutEffect as useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { initials } from "@/lib/struktur-content";
import { Container, SectionHeader } from "@/components/home/shared";
import { Banner } from "@/components/ui/banner";
import { usePersonModal } from "./person-modal";
import { cn } from "@/lib/utils";

const Ctx = createContext(null);
const useChart = () => useContext(Ctx);

const TONE = {
  maroon: { bar: "bg-maroon", dot: "bg-maroon", soft: "bg-maroon/[0.04]" },
  navy: { bar: "bg-navy", dot: "bg-navy", soft: "bg-navy/[0.04]" },
  gold: { bar: "bg-gold", dot: "bg-gold", soft: "bg-gold/[0.08]" },
};
const WIDTH = { lg: "w-[300px]", md: "w-[216px]", sm: "w-[188px]" };

/**
 * Bagan organisasi publik. Bentuknya dari CMS (`content.layout`):
 *   tree       → pohon vertikal penuh, kedalaman bebas, garis bus per tingkat
 *   horizontal → pohon mengalir ke kanan
 *   divisions  → puncak + staf, lalu kotak per divisi
 * Tampilan kartu diatur per tingkat (`content.cards.lead|level1|deeper`).
 * Hover/fokus menyalakan jalur koordinasi (atasan + bawahan); bagan lebar bisa diseret ke samping.
 * < lg: daftar bertingkat.
 */
export function OrgChart({ content: c, people }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(null);

  const tree = useMemo(() => {
    const byKey = Object.fromEntries(people.map((p) => [p.key, p]));
    const root = people.find((p) => p.group !== "staff" && (!p.reportsTo || !byKey[p.reportsTo])) ?? people[0];
    const isLane = (p) => p.reportsTo === root.key && p.group === "staff";
    const kids = (k) => people.filter((p) => p.reportsTo === k && p.key !== root.key && !isLane(p));
    const staff = people.filter(isLane);
    const depth = {};
    const walk = (k, d, seen) => {
      if (seen.has(k)) return;
      seen.add(k);
      depth[k] = d;
      kids(k).forEach((x) => walk(x.key, d + 1, seen));
    };
    walk(root.key, 0, new Set());
    staff.forEach((p) => (depth[p.key] = 1));
    people.forEach((p) => depth[p.key] ?? (depth[p.key] = 1));
    // urutan baca (DFS) untuk daftar mobile & isi kotak divisi
    const order = [];
    const dfs = (k, seen) => {
      if (seen.has(k)) return;
      seen.add(k);
      order.push(byKey[k]);
      if (k === root.key) staff.forEach((s) => dfs(s.key, seen));
      kids(k).forEach((x) => dfs(x.key, seen));
    };
    const seen = new Set();
    dfs(root.key, seen);
    people.forEach((p) => !seen.has(p.key) && order.push(p));
    return { byKey, root, staff, kids, depth, order, maxDepth: Math.max(0, ...Object.values(depth)) };
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

  const divisions = c.divisions ?? [];
  const divByKey = useMemo(() => Object.fromEntries(divisions.map((d) => [d.key, d])), [divisions]);
  const layout = c.layout === "divisions" && !divisions.length ? "tree" : c.layout ?? "tree";

  const ctx = {
    tree,
    lit,
    hover,
    setHover,
    cta: c.cardCta,
    tier: (p) => (p.key === tree.root.key ? c.cards.lead : tree.depth[p.key] <= 1 ? c.cards.level1 : c.cards.deeper),
    division: (p) => (layout !== "divisions" ? divByKey[p.division] : null),
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctxG = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-chart]", start: "top 75%", once: true } });
      for (let d = 0; d <= tree.maxDepth + 1; d++) {
        const conns = el.querySelectorAll(`[data-chart] [data-conn='${d}']`);
        const cards = el.querySelectorAll(`[data-chart] [data-card='${d}']`);
        if (conns.length) tl.from(conns, { scale: 0, duration: 0.35, stagger: 0.02, ease: "power2.inOut" }, d ? "-=0.15" : 0);
        if (cards.length) tl.from(cards, { y: 18, opacity: 0, duration: 0.55, stagger: 0.05, ease: "expo.out" }, "-=0.2");
      }
      gsap.from("[data-list] > li", { x: -14, opacity: 0, duration: 0.55, stagger: 0.05, ease: "expo.out", scrollTrigger: { trigger: "[data-list]", start: "top 85%", once: true } });
    }, el);
    return () => ctxG.revert();
  }, [layout, tree]);

  return (
    <Ctx.Provider value={ctx}>
      <section ref={ref} id="bagan" className="relative scroll-mt-24 border-y border-line bg-white py-20 md:py-20">
        <Container>
          <SectionHeader title={[c.titleTop, c.titleAccent]} body={c.body} />

          {c.banner.show && (c.banner.title || c.banner.body) && (
            <Banner variant={c.banner.variant} dismissible title={c.banner.title} className="mt-10">
              {c.banner.body}
            </Banner>
          )}

          <div data-chart className="relative mt-14 hidden lg:block" onPointerLeave={() => setHover(null)}>
            {layout === "horizontal" ? <HorizontalTree /> : layout === "divisions" ? <DivisionBoard divisions={divisions} ungrouped={c.ungroupedLabel} /> : <VerticalTree />}
          </div>

          {/* < lg: daftar bertingkat */}
          <ol data-list className="relative mt-10 space-y-3 lg:hidden">
            <span aria-hidden className="absolute bottom-8 left-3 top-8 w-[2px] bg-navy/10" />
            {tree.order.map((p) => {
              const d = Math.min(tree.depth[p.key], 3);
              return (
                <li key={p.key} className={cn("relative", d === 1 && "pl-6", d === 2 && "pl-12", d === 3 && "pl-[4.5rem]")}>
                  {d > 0 && <span aria-hidden className={cn("absolute left-3 top-1/2 h-[2px] bg-navy/10", d === 3 ? "w-[3.75rem]" : d === 2 ? "w-9" : "w-3")} />}
                  <RowCard p={p} division={divByKey[p.division]} />
                </li>
              );
            })}
          </ol>
        </Container>
      </section>
    </Ctx.Provider>
  );
}

/* ───────────────────────── tata letak ───────────────────────── */

/** Kontainer geser: bagan yang lebih lebar dari layar bisa diseret ke samping; tepi memudar saat terpotong. */
function Scroller({ children }) {
  const ref = useRef(null);
  const [edge, setEdge] = useState({ l: false, r: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => setEdge({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);
  const grab = (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = ref.current;
    if (el.scrollWidth <= el.clientWidth) return;
    const x0 = e.clientX;
    const s0 = el.scrollLeft;
    let moved = false;
    const move = (ev) => {
      if (Math.abs(ev.clientX - x0) > 4) moved = true;
      el.scrollLeft = s0 - (ev.clientX - x0);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      // seretan tidak dianggap klik kartu
      if (moved) el.addEventListener("click", (ev) => ev.stopPropagation(), { capture: true, once: true });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return (
    <div className="relative">
      <div ref={ref} onPointerDown={grab} className={cn("overflow-x-auto pb-4 [scrollbar-width:thin]", (edge.l || edge.r) && "cursor-grab active:cursor-grabbing")}>
        <div className="mx-auto w-max min-w-full">{children}</div>
      </div>
      <span aria-hidden className={cn("pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent transition-opacity duration-300", edge.l ? "opacity-100" : "opacity-0")} />
      <span aria-hidden className={cn("pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent transition-opacity duration-300", edge.r ? "opacity-100" : "opacity-0")} />
      {edge.r && <p className="mt-1 text-right text-[12px] text-text/45">Seret ke samping untuk melihat seluruh bagan →</p>}
    </div>
  );
}

/** Baris puncak: kartu puncak di tengah, staf di jalur samping kanan. */
function RootRow() {
  const { tree, lit } = useChart();
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center">
      <div />
      <div data-card="0">
        <TreeCard p={tree.root} />
      </div>
      <div className="flex items-center">
        {tree.staff.length > 0 && (
          <>
            <Conn data-conn="1" lit={tree.staff.some((p) => lit.has(p.key))} className="h-[2px] w-10 shrink-0 origin-left xl:w-14" />
            <div className="flex flex-col gap-3">
              {tree.staff.map((p) => (
                <div key={p.key} data-card="1">
                  <TreeCard p={p} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function VerticalTree() {
  const { tree, lit } = useChart();
  const kids = tree.kids(tree.root.key);
  const seen = new Set([tree.root.key]);
  kids.forEach((k) => seen.add(k.key));
  return (
    <Scroller>
      <RootRow />
      {kids.length > 0 && (
        <div className="flex flex-col items-center">
          <Conn data-conn="1" vertical lit={kids.some((k) => lit.has(k.key))} className="h-8 origin-top" />
          <ul className="flex justify-center">
            {kids.map((k, i) => (
              <VBranch key={k.key} p={k} index={i} count={kids.length} depth={1} seen={seen} />
            ))}
          </ul>
        </div>
      )}
    </Scroller>
  );
}

/** Satu cabang pohon vertikal (rekursif): bus horizontal, tetes, kartu, lalu anak-anaknya. */
function VBranch({ p, index, count, depth, seen }) {
  const { tree, lit } = useChart();
  const kids = tree.kids(p.key).filter((k) => !seen.has(k.key));
  kids.forEach((k) => seen.add(k.key));
  const on = lit.has(p.key);
  return (
    <li className="relative flex flex-col items-center px-2.5">
      {count > 1 && (
        <Conn
          data-conn={depth}
          lit={on}
          className={cn("absolute top-0 h-[2px]", index === 0 ? "left-1/2 right-0 origin-left" : index === count - 1 ? "left-0 right-1/2 origin-right" : "inset-x-0 origin-center")}
        />
      )}
      <Conn data-conn={depth} vertical lit={on} className="h-7 origin-top" />
      <div data-card={depth}>
        <TreeCard p={p} />
      </div>
      {kids.length > 0 && (
        <>
          <Conn data-conn={depth + 1} vertical lit={on && kids.some((k) => lit.has(k.key))} className="h-7 origin-top" />
          <ul className="flex">
            {kids.map((k, i) => (
              <VBranch key={k.key} p={k} index={i} count={kids.length} depth={depth + 1} seen={seen} />
            ))}
          </ul>
        </>
      )}
    </li>
  );
}

function HorizontalTree() {
  const { tree, lit } = useChart();
  const kids = tree.kids(tree.root.key);
  const seen = new Set([tree.root.key]);
  kids.forEach((k) => seen.add(k.key));
  return (
    <Scroller>
      <div className="flex items-center">
        <div className="flex shrink-0 flex-col items-center">
          <div data-card="0">
            <TreeCard p={tree.root} />
          </div>
          {tree.staff.length > 0 && (
            <>
              <Conn data-conn="1" vertical lit={tree.staff.some((p) => lit.has(p.key))} className="h-6 origin-top" />
              <div className="flex flex-col gap-2">
                {tree.staff.map((p) => (
                  <div key={p.key} data-card="1">
                    <TreeCard p={p} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {kids.length > 0 && (
          <>
            <Conn data-conn="1" lit={kids.some((k) => lit.has(k.key))} className="h-[2px] w-8 shrink-0 origin-left" />
            <ul className="flex flex-col">
              {kids.map((k, i) => (
                <HBranch key={k.key} p={k} index={i} count={kids.length} depth={1} seen={seen} />
              ))}
            </ul>
          </>
        )}
      </div>
    </Scroller>
  );
}

/** Cabang pohon horizontal (rekursif): bus vertikal di kiri, kartu, lalu anak di kanan. */
function HBranch({ p, index, count, depth, seen }) {
  const { tree, lit } = useChart();
  const kids = tree.kids(p.key).filter((k) => !seen.has(k.key));
  kids.forEach((k) => seen.add(k.key));
  const on = lit.has(p.key);
  return (
    <li className="relative flex items-center py-1.5">
      {count > 1 && (
        <Conn
          data-conn={depth}
          vertical
          lit={on}
          className={cn("absolute left-0", index === 0 ? "bottom-0 top-1/2 origin-top" : index === count - 1 ? "bottom-1/2 top-0 origin-bottom" : "inset-y-0 origin-center")}
        />
      )}
      <Conn data-conn={depth} lit={on} className="h-[2px] w-6 shrink-0 origin-left" />
      <div data-card={depth} className="shrink-0">
        <TreeCard p={p} />
      </div>
      {kids.length > 0 && (
        <>
          <Conn data-conn={depth + 1} lit={on && kids.some((k) => lit.has(k.key))} className="h-[2px] w-6 shrink-0 origin-left" />
          <ul className="flex flex-col">
            {kids.map((k, i) => (
              <HBranch key={k.key} p={k} index={i} count={kids.length} depth={depth + 1} seen={seen} />
            ))}
          </ul>
        </>
      )}
    </li>
  );
}

/** Papan divisi: puncak + staf, lalu kotak per divisi. Orang tanpa divisi masuk kotak `ungrouped`. */
function DivisionBoard({ divisions, ungrouped }) {
  const { tree, lit } = useChart();
  const rest = tree.order.filter((p) => p.key !== tree.root.key && !tree.staff.includes(p));
  const keys = new Set(divisions.map((d) => d.key));
  const boxes = [
    ...divisions.map((d) => ({ ...d, members: rest.filter((p) => p.division === d.key) })),
    { key: "__none", name: ungrouped, body: "", tone: "navy", members: rest.filter((p) => !keys.has(p.division)) },
  ].filter((b) => b.members.length);
  return (
    <div>
      <RootRow />
      {boxes.length > 0 && (
        <>
          <div className="flex justify-center">
            <Conn data-conn="1" vertical lit={rest.some((p) => lit.has(p.key))} className="h-10 origin-top" />
          </div>
          <div className={cn("grid gap-5", boxes.length === 1 ? "grid-cols-1" : boxes.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
            {boxes.map((b) => {
              const tone = TONE[b.tone] ?? TONE.maroon;
              const anyLit = b.members.some((p) => lit.has(p.key));
              return (
                <section
                  key={b.key}
                  data-card="1"
                  className={cn("relative overflow-hidden rounded-lg border p-5 transition-[border-color,box-shadow] duration-500", tone.soft, anyLit ? "border-maroon/30 shadow-[0_24px_50px_-36px_rgb(20_33_61/0.55)]" : "border-line")}
                >
                  <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", tone.bar)} />
                  <header className="flex items-baseline justify-between gap-3">
                    <h3 className="font-serif text-[1.25rem] leading-tight text-navy">{b.name}</h3>
                    <span className="shrink-0 text-[12px] tabular-nums text-text/45">{b.members.length} orang</span>
                  </header>
                  {b.body && <p className="mt-1.5 text-[13.5px] leading-relaxed text-text/60">{b.body}</p>}
                  <ul className="mt-4 flex flex-wrap justify-center gap-3">
                    {b.members.map((p) => (
                      <li key={p.key}>
                        <TreeCard p={p} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ───────────────────────── kartu ───────────────────────── */

function Conn({ vertical, lit, className, ...props }) {
  return <span aria-hidden className={cn("block transition-colors duration-500", vertical && "w-[2px]", lit ? "bg-maroon" : "bg-navy/15", className)} {...props} />;
}

/** Kartu bagan; bentuk mengikuti pengaturan tingkatnya (foto potret/bulat/tanpa, ukuran, isi). */
function TreeCard({ p }) {
  const { tier, lit, hover, setHover, cta, division } = useChart();
  const open = usePersonModal();
  const t = tier(p);
  const on = lit.has(p.key);
  const dim = !!hover && !on;
  const div = division(p);
  const portrait = t.photo === "portrait";
  const round = t.photo === "round";
  const stacked = portrait || t.photo === "none" || t.size === "lg";
  const avatar = t.size === "lg" ? "size-24 text-2xl" : t.size === "md" ? "size-14 text-lg" : "size-11 text-base";

  return (
    <button
      type="button"
      onClick={() => open(p.key)}
      onPointerEnter={() => setHover(p.key)}
      onFocus={() => setHover(p.key)}
      onBlur={() => setHover(null)}
      aria-label={`${p.name}, ${p.role}`}
      className={cn(
        "group relative flex overflow-hidden rounded-lg border bg-white text-left outline-none",
        "transition-[opacity,transform,border-color,box-shadow] duration-500 ease-cinematic",
        "hover:-translate-y-1 hover:shadow-[0_26px_50px_-34px_rgb(20_33_61/0.6)] focus-visible:ring-2 focus-visible:ring-maroon/50 active:scale-[0.985]",
        WIDTH[t.size] ?? WIDTH.md,
        stacked ? "flex-col" : "items-center gap-3",
        portrait ? "p-3.5" : t.size === "lg" ? "items-center p-6 text-center" : "p-3.5",
        on ? "border-maroon/35" : "border-line",
        dim && "opacity-50"
      )}
    >
      <span aria-hidden className={cn("absolute inset-x-0 top-0 block h-[3px] origin-left bg-gold transition-transform duration-700 ease-cinematic group-hover:scale-x-100", on ? "scale-x-100" : "scale-x-0")} />
      {t.size === "lg" && round && <span aria-hidden className="absolute inset-0 bg-cream/60" />}

      {t.photo !== "none" && (
        <span
          className={cn(
            "relative z-10 grid shrink-0 place-items-center overflow-hidden bg-cream-2 font-serif text-maroon",
            portrait ? "mb-3 aspect-[4/3] w-full rounded-md text-3xl" : cn("rounded-full", avatar, t.size === "lg" && "mb-3 ring-4 ring-white")
          )}
        >
          {p.photo ? (
            <Image src={p.photo} alt="" fill sizes={portrait ? "300px" : "96px"} className="object-cover object-top transition-transform duration-700 ease-cinematic group-hover:scale-[1.06]" />
          ) : (
            initials(p.name)
          )}
        </span>
      )}

      <span className="relative z-10 min-w-0">
        <span className={cn("kicker block text-[11px] text-maroon", t.size === "lg" && "text-[12px]")}>{p.role}</span>
        <span className={cn("mt-1 block font-serif leading-snug text-navy", t.size === "lg" ? "text-[1.45rem]" : t.size === "md" ? "text-[1.05rem]" : "text-[15px]")}>{p.name}</span>
        {t.credentials && p.credentials && <span className="mt-1 block text-[12.5px] text-text/50">{p.credentials}</span>}
        {t.expertise && p.expertise?.[0] && <span className="mt-1 block truncate text-[12.5px] text-text/55">{p.expertise[0]}</span>}
        {div && (
          <span className={cn("mt-2 inline-flex items-center gap-1.5 text-[11.5px] text-text/55", t.size === "lg" && "justify-center")}>
            <span className={cn("size-1.5 rounded-full", (TONE[div.tone] ?? TONE.maroon).dot)} />
            {div.name}
          </span>
        )}
        {t.cta && cta && (
          <span className={cn("mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-navy/60 transition-colors group-hover:text-maroon", t.size === "lg" && "justify-center")}>
            {cta}
            <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 transition-transform duration-500 ease-cinematic group-hover:translate-x-1">
              <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </span>
    </button>
  );
}

/** Kartu ringkas untuk daftar mobile. */
function RowCard({ p, division }) {
  const open = usePersonModal();
  return (
    <button
      type="button"
      onClick={() => open(p.key)}
      aria-label={`${p.name}, ${p.role}`}
      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-lg border border-line bg-white p-3 text-left outline-none transition-[transform,border-color] duration-500 ease-cinematic focus-visible:ring-2 focus-visible:ring-maroon/50 active:scale-[0.985]"
    >
      <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-cream-2 font-serif text-lg text-maroon">
        {p.photo ? <Image src={p.photo} alt="" fill sizes="56px" className="object-cover object-top" /> : initials(p.name)}
      </span>
      <span className="min-w-0">
        <span className="kicker block text-[11px] text-maroon">{p.role}</span>
        <span className="mt-1 block font-serif text-[1.05rem] leading-snug text-navy">{p.name}</span>
        {division && <span className="mt-0.5 block text-[12px] text-text/50">{division.name}</span>}
      </span>
    </button>
  );
}
