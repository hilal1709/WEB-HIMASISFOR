"use client";
import { useRef } from "react";
import { Reorder, motion } from "motion/react";
import { animate } from "animejs";
import { LIMITS, cellOf } from "@/lib/program-kelas-cms/schema";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Field, MagnetButton, Sheet, TitleLines } from "../fields";

const NEXT = { yes: "no", no: "text", text: "yes" };
let rid = 0;

/**
 * Editor tabel banding: matriks aspek × kelas. Klik ikon sel untuk memutar Ya → Tidak → Teks
 * (kartu sel membalik, anime.js); baris diseret untuk mengurutkan.
 */
export function CompareEditor({ v, set, path, root, ask }) {
  const classes = root.classes.items;
  const rows = v.rows;
  const ids = useRef([]);
  if (ids.current.length !== rows.length) ids.current = rows.map((_, i) => ids.current[i] ?? `r${++rid}`);
  const keyed = rows.map((r, i) => ({ r, k: ids.current[i] }));

  const setCell = (ri, cls, patch) => {
    const r = rows[ri];
    const cur = cellOf(r, cls);
    const nextCell = { ...cur, ...patch };
    const values = r.values.some((x) => x.cls === cls) ? r.values.map((x) => (x.cls === cls ? nextCell : x)) : [...r.values, nextCell];
    set(`rows.${ri}.values`, values);
  };
  const flip = (e, ri, cls) => {
    const el = e.currentTarget;
    if (!prefersReducedMotion()) animate(el, { rotateY: [0, 180, 360], duration: 500, ease: "outQuad" });
    setCell(ri, cls, { kind: NEXT[cellOf(rows[ri], cls).kind] });
  };

  const cols = { gridTemplateColumns: `minmax(160px,1.2fr) repeat(${classes.length}, minmax(130px,1fr)) 36px` };

  return (
    <div className="space-y-6">
      <Sheet title="Teks bagian banding">
        <TitleLines path={path("title")} value={v.title} onChange={(x) => set("title", x)} />
        <Field path={path("body")} label="Pengantar" value={v.body} onChange={(x) => set("body", x)} max={240} multiline rows={2} />
      </Sheet>

      <Sheet
        title="Matriks banding"
        hint="Klik lingkaran untuk memutar Ya → Tidak → Teks. Seret ⋮⋮ untuk mengurutkan baris."
        aside={
          <MagnetButton
            tone="maroon"
            disabled={rows.length >= LIMITS.rows}
            onClick={() => {
              ids.current = [...ids.current, `r${++rid}`];
              set("rows", [...rows, { label: "Aspek baru", values: classes.map((c) => ({ cls: c.key, kind: "text", text: "" })) }]);
            }}
          >
            + Baris
          </MagnetButton>
        }
      >
        <div className="overflow-x-auto">
          <div className="min-w-[640px] rounded-md border border-navy/10 bg-white">
            <div className="grid border-b border-navy/10 bg-cream/50" style={cols}>
              <span className="p-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text/45">{v.aspectLabel}</span>
              {classes.map((c) => (
                <span key={c.key} className="p-3 font-serif text-[1rem] text-navy">
                  {c.short || c.name}
                </span>
              ))}
              <span />
            </div>
            <Reorder.Group
              axis="y"
              values={keyed}
              onReorder={(next) => {
                ids.current = next.map((x) => x.k);
                set("rows", next.map((x) => x.r));
              }}
            >
              {keyed.map(({ r, k }, ri) => (
                <Reorder.Item key={k} value={keyed[ri]} whileDrag={{ scale: 1.01, boxShadow: "0 16px 28px -18px rgb(20 33 61 / 0.6)" }} className="grid items-center border-b border-navy/[0.07] bg-white last:border-0" style={cols}>
                  <div className="flex items-center gap-1 p-2">
                    <span aria-hidden className="cursor-grab select-none px-1 text-[13px] text-text/30 active:cursor-grabbing">⋮⋮</span>
                    <input
                      value={r.label}
                      maxLength={60}
                      aria-label={`Aspek ${ri + 1}`}
                      onChange={(e) => set(`rows.${ri}.label`, e.target.value)}
                      className="min-w-0 flex-1 rounded px-1.5 py-1 text-[13.5px] text-navy hover:bg-cream/60 focus:bg-cream/60 focus:outline-none"
                    />
                  </div>
                  {classes.map((c) => {
                    const cell = cellOf(r, c.key);
                    return (
                      <div key={c.key} className="flex items-center gap-1.5 p-2">
                        <button
                          type="button"
                          onClick={(e) => flip(e, ri, c.key)}
                          title="Putar jenis sel"
                          aria-label={`${r.label} · ${c.short}: ${cell.kind === "yes" ? v.yesLabel : cell.kind === "no" ? v.noLabel : "teks"}`}
                          className={cn(
                            "grid size-7 shrink-0 place-items-center rounded-full border text-[12px] font-bold transition-colors [transform-style:preserve-3d]",
                            cell.kind === "yes" && "border-maroon bg-gold/25 text-maroon",
                            cell.kind === "no" && "border-navy/15 text-text/35",
                            cell.kind === "text" && "border-navy/20 bg-white text-navy"
                          )}
                        >
                          {cell.kind === "yes" ? "✓" : cell.kind === "no" ? "×" : "T"}
                        </button>
                        {cell.kind === "text" ? (
                          <motion.input
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            value={cell.text}
                            maxLength={40}
                            placeholder="—"
                            aria-label={`${r.label} · ${c.short}`}
                            onChange={(e) => setCell(ri, c.key, { text: e.target.value })}
                            className="min-w-0 flex-1 rounded border border-transparent px-1.5 py-1 text-[13px] font-medium text-navy hover:border-navy/10 focus:border-maroon/30 focus:outline-none"
                          />
                        ) : (
                          <span className="text-[12px] text-text/45">{cell.kind === "yes" ? v.yesLabel : v.noLabel}</span>
                        )}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    aria-label={`Hapus baris ${r.label}`}
                    onClick={() =>
                      ask({
                        title: `Hapus baris "${r.label}"?`,
                        description: "Baris hilang dari tabel di draf.",
                        onConfirm: () => {
                          ids.current = ids.current.filter((_, j) => j !== ri);
                          set("rows", rows.filter((_, j) => j !== ri));
                        },
                      })
                    }
                    className="grid size-7 place-items-center rounded text-text/35 hover:bg-maroon/10 hover:text-maroon"
                  >
                    ×
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            {!rows.length && <p className="p-6 text-center text-[13px] text-text/45">Belum ada baris — tabel disembunyikan dari halaman.</p>}
          </div>
        </div>
      </Sheet>

      <Sheet title="Label tabel">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Kolom aspek" value={v.aspectLabel} onChange={(x) => set("aspectLabel", x)} max={20} />
          <Field label="Label ya" value={v.yesLabel} onChange={(x) => set("yesLabel", x)} max={12} />
          <Field label="Label tidak" value={v.noLabel} onChange={(x) => set("noLabel", x)} max={12} />
          <Field label="Saklar perbedaan" value={v.diffLabel} onChange={(x) => set("diffLabel", x)} max={30} />
          <Field label="Petunjuk geser (ponsel)" value={v.swipeHint} onChange={(x) => set("swipeHint", x)} max={100} className="sm:col-span-2" />
        </div>
      </Sheet>
    </div>
  );
}
