"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { animate, stagger } from "animejs";
import { Flip, gsap } from "@/lib/scroll";
import { countUp, prefersReducedMotion } from "@/lib/motion";
import { LEVEL_KEYS } from "@/lib/prestasi-cms/schema";
import { initials, normalizeLevel, parseYears, shortName } from "@/lib/prestasi-content";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { LordIcon } from "@/components/media/lord-icon";
import { cn } from "@/lib/utils";

/* tinggi kepala kolom = anak tangga podium */
const STEP_H = { internasional: "h-24", nasional: "h-16", regional: "h-10" };
const STEP_NO = { internasional: "1", nasional: "2", regional: "3" };

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/**
 * Vitrin — data prestasi sebagai tiga kolom podium (Internasional · Nasional · Regional).
 * Plakat bisa diseret antar kolom untuk mengganti tingkat (animasi GSAP Flip), dipilih banyak
 * untuk aksi massal, atau diklik untuk membuka laci plakat. Perubahan langsung tayang.
 */
export function Vitrin({ records, labels, onOpen, onCreate, onMove, onBulk, busy }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [year, setYear] = useState("all");
  const [sel, setSel] = useState([]);
  const [over, setOver] = useState(null);
  const board = useRef(null);
  const flip = useRef(null);

  const rows = useMemo(
    () =>
      records.map((r) => {
        const y = parseYears(r.tahun, labels.now);
        return { ...r, level: normalizeLevel(r.tingkatan), short: shortName(r.achieverName), years: y.years, yearLabel: y.label, latest: y.latest };
      }),
    [records, labels.now]
  );
  const years = useMemo(() => [...new Set(rows.flatMap((r) => r.years))].sort((a, b) => b - a), [rows]);
  // baris kembar (nama + judul + tahun sama) — halaman publik hanya menampilkan satu; sisanya bisa dirapikan
  const dupIds = useMemo(() => {
    const seen = new Set();
    return [...records]
      .sort((a, b) => a.id - b.id)
      .filter((r) => {
        const k = `${norm(r.achieverName).trim()}|${norm(r.title).trim()}|${String(r.tahun).trim()}`;
        if (seen.has(k)) return true;
        seen.add(k);
        return false;
      })
      .map((r) => r.id);
  }, [records]);
  const shown = useMemo(() => {
    const k = norm(q.trim());
    return rows
      .filter((r) => (cat === "all" || r.category === cat) && (year === "all" || r.years.includes(Number(year))) && (!k || norm(`${r.achieverName} ${r.title}`).includes(k)))
      .sort((a, b) => b.latest - a.latest || a.short.localeCompare(b.short));
  }, [rows, q, cat, year]);
  const cols = useMemo(() => Object.fromEntries(LEVEL_KEYS.map((l) => [l, shown.filter((r) => r.level === l)])), [shown]);

  // pilihan yang sudah tidak ada (dihapus admin lain) dibuang
  useEffect(() => setSel((s) => s.filter((id) => records.some((r) => r.id === id))), [records]);

  const withFlip = (fn) => {
    if (board.current && !prefersReducedMotion()) flip.current = Flip.getState(board.current.querySelectorAll("[data-plaque]"));
    fn();
  };
  useLayoutEffect(() => {
    if (!flip.current || !board.current) return;
    Flip.from(flip.current, {
      targets: board.current.querySelectorAll("[data-plaque]"),
      duration: 0.6,
      ease: "expo.out",
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.45, clearProps: "opacity,transform" }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.94, duration: 0.3 }),
    });
    flip.current = null;
  }, [shown]);

  // plakat masuk berurutan saat pertama tampil
  useLayoutEffect(() => {
    if (!board.current || prefersReducedMotion()) return;
    animate(board.current.querySelectorAll("[data-plaque]"), { opacity: [0, 1], translateY: [14, 0], delay: stagger(28, { start: 120 }), duration: 520, ease: "outExpo" });
    animate(board.current.querySelectorAll("[data-step]"), { scaleY: [0, 1], delay: stagger(110), duration: 700, ease: "outExpo" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const drop = (level, e) => {
    e.preventDefault();
    setOver(null);
    const id = Number(e.dataTransfer.getData("text/plaque"));
    const r = rows.find((x) => x.id === id);
    if (!r || r.level === level) return;
    const ids = sel.includes(id) ? sel : [id];
    withFlip(() => onMove(ids, level));
  };

  return (
    <div className="space-y-6">
      <Ledger rows={rows} labels={labels} />

      {dupIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--k-maroon)]/45 bg-[var(--k-maroon)]/10 px-4 py-3 animate-in fade-in-0 slide-in-from-top-1">
          <span aria-hidden className="grid size-8 place-items-center rounded-full bg-[var(--k-maroon)]/30 font-serif text-[#f0b8c1]">≡</span>
          <p className="min-w-0 flex-1 text-[13.5px] text-[var(--k-ink)]">
            <b className="font-semibold">{dupIds.length} plakat kembar</b>
            <span className="text-[var(--k-mute)]"> — nama, judul, dan tahunnya sama dengan plakat lain. Pengunjung hanya melihat satu.</span>
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => onBulk(dupIds, "delete")}
            className="h-9 rounded-[10px] border border-[var(--k-maroon)]/60 px-3.5 text-[13px] font-semibold text-[#f0b8c1] transition-colors hover:bg-[var(--k-maroon)] hover:text-white disabled:opacity-40"
          >
            Rapikan kembar
          </button>
        </div>
      )}

      {/* toolbar */}
      <div className="sticky top-[68px] z-20 -mx-4 flex flex-wrap items-center gap-2 border-y border-[var(--k-line)] bg-[var(--k-bg)]/85 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border">
        <label className="relative min-w-[200px] flex-1">
          <span className="sr-only">Cari prestasi</span>
          <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--k-faint)]">
            <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input value={q} onChange={(e) => withFlip(() => setQ(e.target.value))} placeholder="Cari nama peraih atau judul…" className="k-field h-10 pl-9" />
        </label>
        <div role="radiogroup" aria-label="Kategori" className="flex rounded-[10px] border border-[var(--k-line-2)] p-1">
          {["all", "mahasiswa", "dosen"].map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={cat === k}
              onClick={() => withFlip(() => setCat(k))}
              className={cn("rounded-md px-3 py-1 text-[13px] font-medium transition-colors", cat === k ? "bg-white/10 text-[var(--k-ink)]" : "text-[var(--k-mute)] hover:text-[var(--k-ink)]")}
            >
              {labels.categories[k]}
            </button>
          ))}
        </div>
        <select value={year} onChange={(e) => withFlip(() => setYear(e.target.value))} aria-label="Tahun" className="k-field h-10 w-auto pr-8">
          <option value="all">Semua tahun</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onCreate}
          className="group ml-auto inline-flex h-10 items-center gap-2 rounded-[10px] bg-[var(--k-gold)] pl-2.5 pr-4 text-[13.5px] font-semibold text-[var(--k-gold-ink)] transition-[filter,transform] hover:brightness-110 active:scale-[0.97]"
        >
          <LordIcon name="plus-circle" size={22} target=".group" colors="primary:#1b1505,secondary:#1b1505" fallback={<span className="text-lg leading-none">+</span>} />
          Plakat baru
        </button>
      </div>

      {records.length === 0 ? (
        <EmptyVitrin onCreate={onCreate} />
      ) : (
        <div ref={board} className="grid gap-4 lg:grid-cols-3">
          {LEVEL_KEYS.map((level) => (
            <section
              key={level}
              aria-label={labels.levels[level]}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(level);
              }}
              onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget) && setOver(null)}
              onDrop={(e) => drop(level, e)}
              className={cn(
                "flex min-h-[200px] flex-col rounded-2xl border bg-[var(--k-panel)]/70 transition-[border-color,background-color,box-shadow] duration-300",
                over === level ? "border-[var(--k-gold)]/70 bg-[var(--k-gold)]/[0.05] shadow-[0_0_0_4px_rgb(214_176_74/0.08)]" : "border-[var(--k-line)]"
              )}
            >
              <header className="flex items-end gap-3 px-4 pt-4">
                <span data-step aria-hidden className={cn("flex w-11 origin-bottom items-start justify-center rounded-t-md border border-b-0 border-[var(--k-gold)]/40 bg-[linear-gradient(180deg,rgb(214_176_74/0.22),rgb(214_176_74/0.03))] pt-1.5 font-serif text-[15px] text-[var(--k-gold)]", STEP_H[level])}>
                  {STEP_NO[level]}
                </span>
                <div className="min-w-0 flex-1 pb-1">
                  <h3 className="font-serif text-[1.2rem] leading-none text-[var(--k-ink)]">{labels.levels[level]}</h3>
                  <p className="mt-1 text-[12px] text-[var(--k-faint)]">{cols[level].length} plakat</p>
                </div>
                {cols[level].length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const ids = cols[level].map((r) => r.id);
                      const all = ids.every((id) => sel.includes(id));
                      setSel((s) => (all ? s.filter((id) => !ids.includes(id)) : [...new Set([...s, ...ids])]));
                    }}
                    className="mb-1 text-[12px] font-medium text-[var(--k-faint)] hover:text-[var(--k-gold)]"
                  >
                    Pilih kolom
                  </button>
                )}
              </header>
              <div className="mx-4 mt-0 h-px bg-[linear-gradient(90deg,var(--k-gold),transparent)] opacity-40" />
              <ul className="flex max-h-[62vh] flex-1 flex-col gap-2 overflow-y-auto p-3">
                {cols[level].map((r) => (
                  <Plaque key={r.id} r={r} labels={labels} selected={sel.includes(r.id)} onToggle={() => toggle(r.id)} onOpen={() => onOpen(r)} selCount={sel.length} />
                ))}
                {cols[level].length === 0 && (
                  <li className="grid flex-1 place-items-center rounded-xl border border-dashed border-[var(--k-line)] px-4 py-8 text-center text-[12.5px] text-[var(--k-faint)]">Seret plakat ke sini</li>
                )}
              </ul>
            </section>
          ))}
        </div>
      )}

      <BulkBar
        count={sel.length}
        labels={labels}
        busy={busy}
        onClear={() => setSel([])}
        onLevel={(level) => withFlip(() => onBulk(sel, { tingkatan: level }))}
        onCategory={(c) => onBulk(sel, { category: c })}
        onDelete={() => onBulk(sel, "delete", () => setSel([]))}
      />
    </div>
  );
}

function Plaque({ r, labels, selected, onToggle, onOpen, selCount }) {
  return (
    <li data-plaque data-flip-id={r.id}>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plaque", String(r.id));
          e.dataTransfer.effectAllowed = "move";
          e.currentTarget.classList.add("opacity-40");
        }}
        onDragEnd={(e) => e.currentTarget.classList.remove("opacity-40")}
        className={cn(
          "k-plaque group relative flex cursor-grab items-start gap-3 rounded-xl border p-3 transition-[border-color,background-color,transform,box-shadow] duration-300 ease-cinematic active:cursor-grabbing",
          selected ? "border-[var(--k-gold)]/70 bg-[var(--k-gold)]/[0.08]" : "border-[var(--k-line)] bg-[var(--k-panel-2)] hover:-translate-y-0.5 hover:border-[var(--k-line-2)] hover:shadow-[0_18px_30px_-22px_black]"
        )}
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={selected}
          aria-label={`Pilih ${r.title}`}
          onClick={onToggle}
          className={cn(
            "absolute left-2 top-2 z-10 grid size-5 place-items-center rounded-md border text-[11px] transition-[opacity,background-color,border-color]",
            selected ? "border-[var(--k-gold)] bg-[var(--k-gold)] text-[var(--k-gold-ink)] opacity-100" : cn("border-white/30 bg-black/50 text-transparent", selCount ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100")
          )}
        >
          ✓
        </button>
        <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-black/40">
          {r.image && /^\/(?!\/)/.test(r.image) ? (
            <Image src={r.image} alt="" fill sizes="48px" className="object-cover object-top" />
          ) : (
            <span className="grid size-full place-items-center font-serif text-[15px] text-[var(--k-gold)]/80">{initials(r.achieverName)}</span>
          )}
        </span>
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left focus-visible:outline-none">
          <span className="flex items-center gap-2 text-[11.5px] text-[var(--k-faint)]">
            <span className={cn("size-1.5 rounded-full", r.category === "dosen" ? "bg-[#8ab4f8]" : "bg-[var(--k-gold)]")} />
            {labels.categories[r.category] ?? r.category}
            <span className="tabular-nums">· {r.yearLabel}</span>
          </span>
          <span className="mt-1 line-clamp-2 block font-serif text-[15px] leading-snug text-[var(--k-ink)] transition-colors group-hover:text-[var(--k-gold)]">{r.title}</span>
          <span className="mt-0.5 block truncate text-[12.5px] text-[var(--k-mute)]">{r.short}</span>
        </button>
      </div>
    </li>
  );
}

/** Buku besar: empat angka yang menghitung naik saat Vitrin dibuka / berubah. */
function Ledger({ rows, labels }) {
  const ref = useRef(null);
  const people = new Set(rows.map((r) => r.achieverName)).size;
  const stats = [
    ["Plakat", rows.length],
    [labels.levels.internasional, rows.filter((r) => r.level === "internasional").length],
    [labels.levels.nasional, rows.filter((r) => r.level === "nasional").length],
    ["Peraih", people],
  ];
  const key = stats.map((s) => s[1]).join("-");
  useEffect(() => {
    ref.current?.querySelectorAll("[data-n]").forEach((el) => countUp(el, Number(el.dataset.n), { duration: 900 }));
  }, [key]);
  return (
    <dl ref={ref} className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[var(--k-line)] bg-[var(--k-panel)] sm:grid-cols-4">
      {stats.map(([label, n], i) => (
        <div key={label} className={cn("px-5 py-4", i > 0 && "border-l border-[var(--k-line)]", i === 2 && "max-sm:border-l-0 max-sm:border-t", i === 3 && "max-sm:border-t")}>
          <dd data-n={n} className="font-serif text-[2rem] leading-none tabular-nums text-[var(--k-ink)]">
            {n}
          </dd>
          <dt className="mt-1.5 text-[12px] uppercase tracking-[0.14em] text-[var(--k-faint)]">{label}</dt>
        </div>
      ))}
    </dl>
  );
}

function BulkBar({ count, labels, busy, onClear, onLevel, onCategory, onDelete }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (count > 0) setShown(true);
    else if (ref.current && !prefersReducedMotion()) animate(ref.current, { translateY: [0, 120], opacity: [1, 0], duration: 320, ease: "inQuad", onComplete: () => setShown(false) });
    else setShown(false);
  }, [count]);
  useLayoutEffect(() => {
    if (shown && ref.current && !prefersReducedMotion()) animate(ref.current, { translateY: [120, 0], opacity: [0, 1], duration: 520, ease: "outBack(1.3)" });
  }, [shown]);
  if (!shown) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <div ref={ref} role="toolbar" aria-label="Aksi massal" className="pointer-events-auto flex max-w-full flex-wrap items-center gap-1.5 rounded-2xl border border-[var(--k-line-2)] bg-[var(--k-raise)]/95 p-1.5 pl-4 shadow-[0_30px_60px_-20px_black] backdrop-blur-md">
        <span className="mr-2 text-[13px] text-[var(--k-ink)]">
          <b className="font-serif text-[1.1rem] tabular-nums text-[var(--k-gold)]">{count}</b> dipilih
        </span>
        <span className="mr-1 hidden text-[11px] uppercase tracking-[0.14em] text-[var(--k-faint)] md:inline">Pindah ke</span>
        {LEVEL_KEYS.map((l) => (
          <BarBtn key={l} disabled={busy} onClick={() => onLevel(l)}>
            {labels.levels[l]}
          </BarBtn>
        ))}
        <span className="mx-1 h-6 w-px bg-[var(--k-line-2)]" />
        <BarBtn disabled={busy} onClick={() => onCategory("mahasiswa")}>{labels.categories.mahasiswa}</BarBtn>
        <BarBtn disabled={busy} onClick={() => onCategory("dosen")}>{labels.categories.dosen}</BarBtn>
        <span className="mx-1 h-6 w-px bg-[var(--k-line-2)]" />
        <BarBtn disabled={busy} onClick={onDelete} danger>
          Hapus
        </BarBtn>
        <BarBtn onClick={onClear}>Batal</BarBtn>
      </div>
    </div>
  );
}

function BarBtn({ children, danger, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "h-9 rounded-xl px-3 text-[13px] font-medium transition-colors disabled:opacity-40",
        danger ? "text-[#e9a0ab] hover:bg-[var(--k-maroon)] hover:text-white" : "text-[var(--k-mute)] hover:bg-white/[0.07] hover:text-[var(--k-ink)]"
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function EmptyVitrin({ onCreate }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--k-line-2)] bg-[var(--k-panel)]/60 px-6 py-14 text-center">
      <div className="w-32">
        <LottieIllustration src="/lottie/trophy-dark.json" label="Vitrin kosong" />
      </div>
      <p className="mt-4 font-serif text-[1.5rem] text-[var(--k-ink)]">Vitrin masih kosong</p>
      <p className="mt-1 max-w-sm text-[13.5px] text-[var(--k-mute)]">Pasang plakat pertama. Selama kosong, halaman publik memakai data contoh bila diizinkan di bab Arsip.</p>
      <button type="button" onClick={onCreate} className="mt-6 h-10 rounded-[10px] bg-[var(--k-gold)] px-5 text-[13.5px] font-semibold text-[var(--k-gold-ink)] transition hover:brightness-110 active:scale-[0.97]">
        Pasang plakat pertama
      </button>
    </div>
  );
}
