"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LIMITS, PROFILE_LOTTIES, fillCount, slugify } from "@/lib/profil-lulusan-cms/schema";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { AddButton, Chips, Field, Grip, IconBtn, MediaField, Panel, Segmented, Switch, TitlePair, moveItem, useSortable } from "../fields";

const blank = (n) => ({
  key: `profil-${Date.now().toString(36)}`,
  title: "",
  short: "",
  lottie: PROFILE_LOTTIES[n % PROFILE_LOTTIES.length][0],
  summary: "",
  competencies: [],
  roles: [],
  courses: [],
  sample: true,
});

/**
 * Jalur Profil — dek kartu karier. Kartu bisa diseret untuk urutan; kartu terpilih dibuka
 * di meja kerja yang bisa "dibalik" (sisi depan: identitas, sisi belakang: isi detail).
 */
export function ProfilesEditor({ v, set, flag, pick, ask, path }) {
  const items = v.items;
  const [sel, setSel] = useState(0);
  const [side, setSide] = useState("front");
  const i = Math.min(sel, items.length - 1);
  const p = items[i];
  const sort = useSortable((from, to) => {
    set("items", moveItem(items, from, to));
    if (from === i) setSel(to);
  });
  const at = (k) => `items.${i}.${k}`;

  return (
    <div className="space-y-4">
      <Panel title="Kepala section" hint="Token {jumlah} diganti jumlah profil.">
        <TitlePair path="profiles" top={v.titleTop} accent={v.titleAccent} onTop={(x) => set("titleTop", x)} onAccent={(x) => set("titleAccent", x)} hint={`Tampil: “${fillCount(v.titleTop, items.length)} ${v.titleAccent}”`} />
        <Field path={path("body")} label="Pengantar" value={v.body} onChange={(x) => set("body", x)} max={280} multiline rows={2} flag={flag("body")} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field path={path("rolesLabel")} label="Label contoh jabatan (panel)" value={v.rolesLabel} onChange={(x) => set("rolesLabel", x)} max={30} />
          <Field path={path("detailLabel")} label="Label tombol detail" value={v.detailLabel} onChange={(x) => set("detailLabel", x)} max={30} />
        </div>
        <Switch checked={v.autoplay} onChange={(x) => set("autoplay", x)} label="Putar otomatis antar tab" hint="Berhenti sendiri ketika pengunjung memilih tab." />
      </Panel>

      {/* dek kartu */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">Dek profil · seret untuk urutan</p>
          <span className="text-[11px] text-white/35">{items.length}/{LIMITS.profiles}</span>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((it, k) => (
            <motion.li key={it.key} layout transition={{ type: "spring", stiffness: 400, damping: 34 }}>
              <div
                ref={sort.itemRef(k)}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-navy transition-[border-color,box-shadow] duration-300",
                  k === i ? "border-gold shadow-[0_0_0_3px_rgb(201_162_39/0.25)]" : "border-white/10 hover:border-white/30",
                  sort.drag?.over === k && sort.drag.from !== k && "border-dashed border-gold/70"
                )}
              >
                <button type="button" onClick={() => setSel(k)} className="flex flex-1 flex-col p-3 text-left">
                  <span className="relative grid h-20 place-items-center">
                    {it.lottie && <LottieIllustration src={it.lottie} className="w-16" />}
                    <span className="absolute bottom-0 left-0 font-serif text-[1.6rem] leading-none text-gold/90">{String(k + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="mt-2 block text-[11px] text-gold-soft">{it.short || "—"}</span>
                  <span className="line-clamp-2 block font-serif text-[0.95rem] leading-snug text-white">{it.title || <em className="text-white/30">Tanpa judul</em>}</span>
                  {it.sample && <span className="mt-1.5 w-fit rounded bg-white/10 px-1.5 text-[10px] text-white/55">contoh</span>}
                </button>
                <span className="absolute right-1 top-1 opacity-60 transition-opacity group-hover:opacity-100">
                  <Grip {...sort.handle(k, items.length)} />
                </span>
              </div>
            </motion.li>
          ))}
          {items.length < LIMITS.profiles && (
            <li>
              <button
                type="button"
                onClick={() => {
                  set("items", [...items, blank(items.length + 1)]);
                  setSel(items.length);
                  setSide("front");
                }}
                className="grid h-full min-h-[170px] w-full place-items-center rounded-xl border border-dashed border-white/15 text-[13px] text-white/45 transition-colors hover:border-gold/60 hover:text-gold-soft"
              >
                + Profil baru
              </button>
            </li>
          )}
        </ul>
      </div>

      {p ? (
        <div className="[perspective:1600px]">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Segmented value={side} onChange={setSide} options={[["front", "Sisi depan · identitas"], ["back", "Sisi belakang · detail"]]} layoutId="profile-side" />
            <span className="ml-auto flex items-center gap-1">
              <IconBtn label="Geser ke kiri" disabled={i === 0} onClick={() => (set("items", moveItem(items, i, i - 1)), setSel(i - 1))}>
                ←
              </IconBtn>
              <IconBtn label="Geser ke kanan" disabled={i === items.length - 1} onClick={() => (set("items", moveItem(items, i, i + 1)), setSel(i + 1))}>
                →
              </IconBtn>
              <IconBtn
                label="Hapus profil"
                danger
                onClick={() =>
                  ask({
                    title: `Hapus profil “${p.title || p.short || i + 1}”?`,
                    description: "Kartu dan seluruh isinya hilang dari draf. Masih bisa diurungkan dengan Ctrl+Z.",
                    confirmLabel: "Hapus profil",
                    onConfirm: () => {
                      set("items", items.filter((_, k) => k !== i));
                      setSel(Math.max(0, i - 1));
                    },
                  })
                }
              >
                ×
              </IconBtn>
            </span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${p.key}-${side}`}
              initial={{ rotateY: side === "back" ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: side === "back" ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {side === "front" ? (
                <Panel title={p.title || "Profil baru"} hint="Identitas kartu: tampil di tab, kartu ponsel, dan kepala modal.">
                  <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
                    <Field
                      path={path(at("title"))}
                      label="Nama profil"
                      value={p.title}
                      onChange={(x) => {
                        set(at("title"), x);
                        if (p.key.startsWith("profil-")) set(at("key"), slugify(x) || p.key);
                      }}
                      max={80}
                      size="title"
                    />
                    <Field path={path(at("short"))} label="Sebutan singkat" value={p.short} onChange={(x) => set(at("short"), x)} max={40} />
                  </div>
                  <Field path={path(at("summary"))} label="Ringkasan" value={p.summary} onChange={(x) => set(at("summary"), x)} max={400} multiline rows={3} flag={flag(at("summary"))} />
                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">Ilustrasi Lottie</p>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {PROFILE_LOTTIES.map(([src, label]) => (
                        <button
                          key={src}
                          type="button"
                          title={label}
                          onClick={() => set(at("lottie"), src)}
                          className={cn("grid aspect-square place-items-center rounded-xl border bg-navy p-1.5 transition-[transform,border-color] hover:-translate-y-0.5", p.lottie === src ? "border-gold ring-2 ring-gold/30" : "border-white/10")}
                        >
                          <LottieIllustration src={src} className="w-full" />
                        </button>
                      ))}
                    </div>
                    <div className="mt-3">
                      <MediaField label="…atau berkas Lottie lain" kind="lottie" value={p.lottie} onChange={(x) => set(at("lottie"), x)} pick={pick} allowEmpty={false} />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field path={path(at("key"))} label="Kunci tautan (#pl-…)" value={p.key} onChange={(x) => set(at("key"), slugify(x))} max={40} hint="Huruf kecil & tanda hubung." />
                    <div className="pt-6">
                      <Switch checked={p.sample} onChange={(x) => set(at("sample"), x)} label="Tandai sebagai contoh" />
                    </div>
                  </div>
                </Panel>
              ) : (
                <Panel title="Isi detail" hint="Tampil di panel tab dan modal detail profil.">
                  <Chips path={path(at("competencies"))} label="Kompetensi" items={p.competencies} onChange={(x) => set(at("competencies"), x)} max={LIMITS.chips} />
                  <Chips path={path(at("roles"))} label="Jabatan" items={p.roles} onChange={(x) => set(at("roles"), x)} max={LIMITS.chips} hint="Dua yang pertama tampil di panel tab." />
                  <Chips path={path(at("courses"))} label="Mata kuliah pendukung" items={p.courses} onChange={(x) => set(at("courses"), x)} max={LIMITS.chips} />
                </Panel>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <Panel>
          <p className="text-[13px] text-white/50">Belum ada profil. Section disembunyikan dari halaman publik sampai ada minimal satu kartu.</p>
          <AddButton onClick={() => set("items", [blank(1)])}>Buat profil pertama</AddButton>
        </Panel>
      )}

      <Panel title="Label modal detail">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field path={path("modal.kicker")} label="Kicker" value={v.modal.kicker} onChange={(x) => set("modal.kicker", x)} max={40} />
          <Field path={path("modal.competenciesLabel")} label="Judul kompetensi" value={v.modal.competenciesLabel} onChange={(x) => set("modal.competenciesLabel", x)} max={40} />
          <Field path={path("modal.rolesLabel")} label="Judul jabatan" value={v.modal.rolesLabel} onChange={(x) => set("modal.rolesLabel", x)} max={40} />
          <Field path={path("modal.coursesLabel")} label="Judul mata kuliah" value={v.modal.coursesLabel} onChange={(x) => set("modal.coursesLabel", x)} max={40} />
        </div>
      </Panel>
    </div>
  );
}
