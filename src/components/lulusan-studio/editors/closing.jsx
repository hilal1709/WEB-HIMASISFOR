"use client";
import { motion } from "motion/react";
import { LIMITS } from "@/lib/profil-lulusan-cms/schema";
import { cn } from "@/lib/utils";
import { AddButton, Field, Grip, IconBtn, MascotField, Panel, TitlePair, moveItem, useSortable } from "../fields";

/** Penutup — ajakan, tombol aksi, dan baris tautan lanjutan. */
export function ClosingEditor({ v, set, flag, ask, path }) {
  const links = v.links;
  const sort = useSortable((a, b) => set("links", moveItem(links, a, b)));
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Ajakan" hint="Band maroon di akhir halaman.">
          <TitlePair path="closing" top={v.titleTop} accent={v.titleAccent} onTop={(x) => set("titleTop", x)} onAccent={(x) => set("titleAccent", x)} />
          <Field path={path("body")} label="Kalimat penjelas" value={v.body} onChange={(x) => set("body", x)} max={240} multiline rows={2} flag={flag("body")} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field path={path("cta.label")} label="Label tombol" value={v.cta.label} onChange={(x) => set("cta.label", x)} max={40} />
            <Field path={path("cta.href")} label="Tautan tombol" value={v.cta.href} onChange={(x) => set("cta.href", x)} placeholder="https://… atau /halaman" hint="Tautan luar dibuka di tab baru." />
          </div>
          <Field path={path("note")} label="Catatan di bawah tombol" value={v.note} onChange={(x) => set("note", x)} max={120} flag={flag("note")} />
        </Panel>
        <Panel title="Elvo di penutup">
          <MascotField path={path("mascot")} value={v.mascot} onChange={(x) => set("mascot", x)} flag={flag("mascot.say")} />
        </Panel>
      </div>

      <Panel title="Tautan lanjutan" hint="Baris berpemisah garis di bawah band. Seret pegangan untuk urutan." aside={<span className="text-[11px] text-white/35">{links.length}/{LIMITS.links}</span>}>
        <ul className="space-y-2">
          {links.map((l, i) => (
            <motion.li key={i} layout transition={{ type: "spring", stiffness: 400, damping: 36 }}>
              <div ref={sort.itemRef(i)} className={cn("grid items-end gap-2 rounded-xl border bg-black/20 p-3 md:grid-cols-[auto_8rem_1fr_1.4fr_10rem_auto]", sort.drag?.over === i && sort.drag.from !== i ? "border-dashed border-gold/70" : "border-white/[0.07]")}>
                <span className="mb-1">
                  <Grip {...sort.handle(i, links.length)} />
                </span>
                <Field path={path(`links.${i}.kicker`)} label="Kicker" value={l.kicker} onChange={(x) => set(`links.${i}.kicker`, x)} max={30} />
                <Field path={path(`links.${i}.title`)} label="Judul" value={l.title} onChange={(x) => set(`links.${i}.title`, x)} max={60} />
                <Field path={path(`links.${i}.body`)} label="Keterangan" value={l.body} onChange={(x) => set(`links.${i}.body`, x)} max={160} flag={flag(`links.${i}.body`)} />
                <Field path={path(`links.${i}.href`)} label="Tautan" value={l.href} onChange={(x) => set(`links.${i}.href`, x)} placeholder="/halaman" />
                <IconBtn label="Hapus tautan" danger className="mb-1" onClick={() => ask({ title: `Hapus tautan “${l.title || i + 1}”?`, confirmLabel: "Hapus", onConfirm: () => set("links", links.filter((_, k) => k !== i)) })}>
                  ×
                </IconBtn>
              </div>
            </motion.li>
          ))}
        </ul>
        <AddButton disabled={links.length >= LIMITS.links} onClick={() => set("links", [...links, { kicker: "", title: "", body: "", href: "" }])}>
          Tautan baru
        </AddButton>
      </Panel>
    </div>
  );
}
