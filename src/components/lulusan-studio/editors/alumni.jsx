"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LIMITS } from "@/lib/profil-lulusan-cms/schema";
import { GraduatePathIllustration } from "@/components/illustrations/line-illustrations";
import { cn } from "@/lib/utils";
import { AddButton, Field, Grip, IconBtn, MascotField, MediaField, Panel, Switch, TitlePair, moveItem, useSortable } from "../fields";

const initials = (n) => String(n).split(/[ ,.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("") || "?";

/**
 * Dinding Alumni — buku tahunan. Kartu foto bisa diseret untuk urutan, klik foto untuk menggantinya;
 * kartu terpilih membuka lembar kutipan di bawah kisi.
 */
export function AlumniEditor({ v, set, flag, pick, ask, path }) {
  const items = v.items;
  const [sel, setSel] = useState(null);
  const [q, setQ] = useState("");
  const sort = useSortable((a, b) => {
    set("items", moveItem(items, a, b));
    if (sel === a) setSel(b);
  });
  const visible = useMemo(() => items.map((a, i) => ({ a, i })).filter(({ a }) => !q || `${a.name} ${a.role}`.toLowerCase().includes(q.toLowerCase())), [items, q]);
  const cur = sel != null ? items[sel] : null;
  const at = (k) => `items.${sel}.${k}`;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Kepala section">
          <TitlePair path="alumni" top={v.titleTop} accent={v.titleAccent} onTop={(x) => set("titleTop", x)} onAccent={(x) => set("titleAccent", x)} />
          <Field path={path("body")} label="Pengantar" value={v.body} onChange={(x) => set("body", x)} max={280} multiline rows={2} flag={flag("body")} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field path={path("kicker")} label="Kicker modal cerita" value={v.kicker} onChange={(x) => set("kicker", x)} max={60} />
            <MediaField path={path("lottie")} label="Lottie di samping judul" kind="lottie" value={v.lottie} onChange={(x) => set("lottie", x)} pick={pick} />
          </div>
          <Field path={path("fallbackQuote")} label="Kutipan cadangan" value={v.fallbackQuote} onChange={(x) => set("fallbackQuote", x)} max={240} multiline rows={2} flag={flag("fallbackQuote")} hint="Dipakai di modal alumni yang belum punya kutipan." />
        </Panel>
        <Panel title="Elvo di dinding alumni">
          <MascotField path={path("mascot")} value={v.mascot} onChange={(x) => set("mascot", x)} flag={flag("mascot.say")} />
        </Panel>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <p className="font-serif text-[1.15rem] text-white">
            Buku <em className="text-gold-soft">tahunan</em>
          </p>
          <span className="text-[11px] text-white/35">
            {items.length}/{LIMITS.alumni} · {items.filter((a) => a.quote).length} berkutipan
          </span>
          {items.length > 8 && (
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau jabatan" className="ml-auto h-8 w-52 rounded-full border border-white/10 bg-black/25 px-3 text-[12.5px] text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none" />
          )}
        </div>
        {items.length === 0 ? (
          <div className="grid place-items-center py-8 text-center">
            <div className="w-44 text-gold-soft/70">
              <GraduatePathIllustration className="h-auto w-full" />
            </div>
            <p className="mt-3 text-[13px] text-white/50">Belum ada alumni. Section disembunyikan sampai ada satu kartu.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {visible.map(({ a, i }) => (
              <motion.li key={`${a.name}-${i}`} layout transition={{ type: "spring", stiffness: 400, damping: 34 }}>
                <div
                  ref={sort.itemRef(i)}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border bg-white p-1.5 pb-2 text-navy transition-[border-color,box-shadow,rotate] duration-300",
                    sel === i ? "border-gold shadow-[0_0_0_3px_rgb(201_162_39/0.35)]" : "border-transparent hover:rotate-[-1deg]",
                    sort.drag?.over === i && sort.drag.from !== i && "ring-2 ring-dashed ring-gold"
                  )}
                >
                  <button type="button" onClick={() => pick("image", a.photo, (x) => set(`items.${i}.photo`, x))} className="relative block aspect-[4/5] w-full overflow-hidden rounded-md bg-cream-2" aria-label={`Ganti foto ${a.name || "alumni"}`}>
                    {a.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.photo} alt="" className="size-full object-cover grayscale-[0.25] transition-[filter,transform] duration-500 group-hover:scale-[1.04] group-hover:grayscale-0" />
                    ) : (
                      <span className="grid size-full place-items-center font-serif text-2xl text-maroon">{initials(a.name)}</span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 translate-y-full bg-navy/85 py-1 text-center text-[10.5px] font-semibold text-white transition-transform duration-300 group-hover:translate-y-0">Ganti foto</span>
                  </button>
                  <button type="button" onClick={() => setSel(sel === i ? null : i)} className="mt-1.5 block w-full px-1 text-left">
                    <span className="block truncate text-[12.5px] font-semibold">{a.name || <em className="font-normal text-text/40">Tanpa nama</em>}</span>
                    <span className="line-clamp-2 block text-[11px] leading-snug text-text/55">{a.role}</span>
                  </button>
                  <span className="absolute right-1 top-1 flex rounded-lg bg-navy/70 opacity-0 transition-opacity group-hover:opacity-100">
                    <Grip {...sort.handle(i, items.length)} />
                  </span>
                  {a.quote && <span className="absolute left-2.5 top-2.5 rounded bg-gold px-1 text-[9.5px] font-bold text-navy">“ ”</span>}
                </div>
              </motion.li>
            ))}
          </ul>
        )}

        <AnimatePresence initial={false}>
          {cur && (
            <motion.div key={sel} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
              <div className="mt-4 grid gap-4 rounded-xl border border-gold/25 bg-black/25 p-4 md:grid-cols-[1fr_1.3fr]">
                <div className="space-y-3">
                  <Field path={path(at("name"))} label="Nama" value={cur.name} onChange={(x) => set(at("name"), x)} max={80} />
                  <Field path={path(at("role"))} label="Jabatan · instansi" value={cur.role} onChange={(x) => set(at("role"), x)} max={140} />
                  <MediaField path={path(at("photo"))} label="Foto" value={cur.photo} onChange={(x) => set(at("photo"), x)} pick={pick} />
                </div>
                <div className="space-y-3">
                  <Field path={path(at("quote"))} label="Kutipan" value={cur.quote} onChange={(x) => set(at("quote"), x)} max={280} multiline rows={4} flag={flag(at("quote"))} placeholder="Kosong = pakai kutipan cadangan" />
                  <Switch checked={cur.sample} onChange={(x) => set(at("sample"), x)} label="Tandai sebagai contoh" />
                  <div className="flex justify-end gap-2 pt-2">
                    <IconBtn label="Tutup lembar" onClick={() => setSel(null)}>
                      ↑
                    </IconBtn>
                    <button
                      type="button"
                      onClick={() =>
                        ask({
                          title: `Hapus ${cur.name || "alumni ini"}?`,
                          description: "Kartu hilang dari dinding alumni di draf.",
                          confirmLabel: "Hapus alumni",
                          onConfirm: () => {
                            set("items", items.filter((_, k) => k !== sel));
                            setSel(null);
                          },
                        })
                      }
                      className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#ff9aa8] hover:bg-[#e86a7c]/15"
                    >
                      Hapus alumni
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4">
          <AddButton
            disabled={items.length >= LIMITS.alumni}
            onClick={() => {
              set("items", [...items, { name: "", role: "", photo: "", quote: "", sample: false }]);
              setSel(items.length);
            }}
          >
            Alumni baru
          </AddButton>
        </div>
      </div>
    </div>
  );
}
