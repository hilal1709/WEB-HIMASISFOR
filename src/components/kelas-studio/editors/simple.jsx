"use client";
import { useRef, useState } from "react";
import { AnimatePresence, Reorder, motion } from "motion/react";
import { BANNER_VARIANTS, CLOSING_LOTTIES, LIMITS } from "@/lib/program-kelas-cms/schema";
import { Banner } from "@/components/ui/banner";
import { cn } from "@/lib/utils";
import { Field, LottieGrid, MagnetButton, MascotField, Segmented, Sheet, Switch, TitleLines, Tokens, fid } from "../fields";

let uid = 0;
const useIds = (n) => {
  const ids = useRef([]);
  if (ids.current.length !== n) ids.current = Array.from({ length: n }, (_, i) => ids.current[i] ?? `i${++uid}`);
  return ids;
};

/* ───────────── Pembuka ───────────── */
export function HeroEditor({ v, set, path, flag }) {
  const crumbs = v.breadcrumb;
  return (
    <div className="space-y-6">
      <Sheet title="Judul & intro">
        <TitleLines path={path("title")} value={v.title} onChange={(x) => set("title", x)} tokens={["jumlah"]} hint="Jumlah kelas dalam kata" />
        <Field path={path("body")} label="Intro" value={v.body} onChange={(x) => set("body", x)} max={320} multiline rows={3} flag={flag("body")} />
      </Sheet>
      <Sheet title="Jejak navigasi" hint="Butir terakhir = halaman ini (tanpa tautan).">
        {crumbs.map((b, i) => (
          <div key={i} className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Field label={`Butir ${i + 1}`} value={b.label} onChange={(x) => set(`breadcrumb.${i}.label`, x)} max={40} />
            <Field label="Tautan" value={b.href} onChange={(x) => set(`breadcrumb.${i}.href`, x)} placeholder="/ atau kosong" />
            <MagnetButton tone="danger" disabled={crumbs.length <= 1} onClick={() => set("breadcrumb", crumbs.filter((_, j) => j !== i))}>
              Hapus
            </MagnetButton>
          </div>
        ))}
        {crumbs.length < LIMITS.breadcrumb && <MagnetButton onClick={() => set("breadcrumb", [...crumbs.slice(0, -1), { label: "", href: "" }, crumbs[crumbs.length - 1]])}>+ Butir</MagnetButton>}
      </Sheet>
      <Sheet title="Kartu pertanyaan" hint="Pertanyaan & opsinya diambil dari Kuis nomor 1.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kicker kartu" value={v.cardKicker} onChange={(x) => set("cardKicker", x)} max={40} />
          <Field label="Penghitung" value={v.cardCounter} onChange={(x) => set("cardCounter", x)} max={40} />
          <Field label="Tautan kuis lengkap" value={v.fullQuiz} onChange={(x) => set("fullQuiz", x)} max={60} />
          <Field label="Kicker hasil" value={v.resultKicker} onChange={(x) => set("resultKicker", x)} max={40} />
          <Field label="Label jadwal" value={v.scheduleLabel} onChange={(x) => set("scheduleLabel", x)} max={20} />
          <Field label="Label biaya" value={v.feeLabel} onChange={(x) => set("feeLabel", x)} max={20} />
          <Field label="Tombol detail" value={v.detailCta} onChange={(x) => set("detailCta", x)} max={40} />
          <Field label="Tombol ulangi" value={v.retry} onChange={(x) => set("retry", x)} max={20} />
          <Field label="Tombol kuis" value={v.quizCta} onChange={(x) => set("quizCta", x)} max={30} />
        </div>
        <p className="text-[12px] text-text/45">
          Token: <Tokens list={["total"]} />
        </p>
      </Sheet>
      <Sheet title="Elvo di kartu">
        <MascotField path={path("mascot")} value={v.mascot} onChange={(x) => set("mascot", x)} flag={flag("mascot.say")} />
      </Sheet>
    </div>
  );
}

/* ───────────── Pengumuman ───────────── */
export function BannerEditor({ v, set, path, flag }) {
  return (
    <div className="space-y-6">
      <Sheet title="Pita pengumuman" aside={<Switch label="Tampil" checked={v.show} onChange={(x) => set("show", x)} />}>
        <Segmented label="Gaya" value={v.variant} onChange={(x) => set("variant", x)} options={BANNER_VARIANTS.map((k) => [k, { brand: "Merek", info: "Info", success: "Sukses", warning: "Peringatan" }[k]])} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field path={path("title")} label="Judul" value={v.title} onChange={(x) => set("title", x)} max={60} />
          <Field label="Versi" value={v.version} onChange={(x) => set("version", x)} max={20} hint="Ganti versi agar pengunjung yang sudah menutup pita melihatnya lagi." />
        </div>
        <Field path={path("body")} label="Isi" value={v.body} onChange={(x) => set("body", x)} max={200} multiline rows={2} flag={flag("body")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tombol" value={v.cta} onChange={(x) => set("cta", x)} max={24} />
          <Field label="Tautan tombol" value={v.href} onChange={(x) => set("href", x)} />
        </div>
      </Sheet>
      <div className={cn("transition-opacity", !v.show && "opacity-40")}>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text/50">Tampilan</p>
        <Banner variant={v.variant} title={v.title} action={v.cta ? <span className={cn("rounded-full px-3 py-1 text-[12px] font-semibold", v.variant === "brand" ? "bg-gold text-navy" : "bg-maroon text-white")}>{v.cta}</span> : null}>
          {v.body}
        </Banner>
      </div>
    </div>
  );
}

/* ───────────── Tanya (FAQ) ───────────── */
export function FaqEditor({ v, set, path, flag, ask }) {
  const items = v.items;
  const ids = useIds(items.length);
  const keyed = items.map((f, i) => ({ f, k: ids.current[i] }));
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-6">
      <Sheet title="Pengantar">
        <TitleLines path={path("title")} value={v.title} onChange={(x) => set("title", x)} />
        <Field path={path("body")} label="Pengantar" value={v.body} onChange={(x) => set("body", x)} max={240} multiline rows={2} flag={flag("body")} />
        <Field label="Tombol kuis" value={v.quizCta} onChange={(x) => set("quizCta", x)} max={40} />
      </Sheet>
      <Sheet
        title="Daftar pertanyaan"
        hint="Seret untuk mengurutkan. Klik untuk membuka."
        aside={
          <MagnetButton
            tone="maroon"
            disabled={items.length >= LIMITS.faq}
            onClick={() => {
              ids.current = [...ids.current, `i${++uid}`];
              set("items", [...items, { q: "", a: "" }]);
              setOpen(ids.current[ids.current.length - 1]);
            }}
          >
            + Pertanyaan
          </MagnetButton>
        }
      >
        <Reorder.Group
          axis="y"
          values={keyed}
          onReorder={(next) => {
            ids.current = next.map((x) => x.k);
            set("items", next.map((x) => x.f));
          }}
          className="space-y-2"
        >
          {keyed.map(({ f, k }, i) => {
            const on = open === k;
            return (
              <Reorder.Item key={k} value={keyed[i]} id={fid(`faq.items.${i}.a`)} whileDrag={{ scale: 1.01, rotate: -0.4 }} className={cn("rounded-md border bg-white", flag(`items.${i}.a`) ? "border-orange-300" : "border-navy/10")}>
                <div className="flex items-center gap-2 px-2 py-2">
                  <span aria-hidden className="cursor-grab select-none px-1 text-[13px] text-text/30">⋮⋮</span>
                  <span className="w-6 text-[12px] tabular-nums text-text/40">{String(i + 1).padStart(2, "0")}</span>
                  <button type="button" onClick={() => setOpen(on ? null : k)} aria-expanded={on} className="min-w-0 flex-1 truncate text-left font-serif text-[1rem] text-navy">
                    {f.q || <em className="text-text/35">Pertanyaan kosong</em>}
                  </button>
                  <motion.span animate={{ rotate: on ? 45 : 0 }} aria-hidden className="grid size-6 place-items-center text-navy/50">
                    +
                  </motion.span>
                </div>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="space-y-3 border-t border-dashed border-navy/10 p-3">
                        <Field label="Pertanyaan" value={f.q} onChange={(x) => set(`items.${i}.q`, x)} max={160} />
                        <Field label="Jawaban" value={f.a} onChange={(x) => set(`items.${i}.a`, x)} max={600} multiline rows={3} flag={flag(`items.${i}.a`)} />
                        <MagnetButton
                          tone="danger"
                          onClick={() =>
                            ask({
                              title: "Hapus pertanyaan ini?",
                              description: f.q || "Pertanyaan kosong",
                              onConfirm: () => {
                                ids.current = ids.current.filter((_, j) => j !== i);
                                set("items", items.filter((_, j) => j !== i));
                              },
                            })
                          }
                        >
                          Hapus pertanyaan
                        </MagnetButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
        {!items.length && <p className="text-[13px] text-text/50">Tanpa pertanyaan, bagian Tanya disembunyikan dari halaman.</p>}
      </Sheet>
    </div>
  );
}

/* ───────────── Penutup ───────────── */
export function ClosingEditor({ v, set, path, flag }) {
  const links = v.links;
  return (
    <div className="space-y-6">
      <Sheet title="Badan ajakan" hint="Kartu maroon di tengah penutup.">
        <Field label="Kicker" value={v.kicker} onChange={(x) => set("kicker", x)} max={60} />
        <div>
          <TitleLines path={path("title")} value={v.title} onChange={(x) => set("title", x)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tombol daftar" value={v.cta} onChange={(x) => set("cta", x)} max={40} />
          <Field path={path("note")} label="Catatan tombol" value={v.note} onChange={(x) => set("note", x)} max={160} flag={flag("note")} />
        </div>
      </Sheet>
      <Sheet title="Ilustrasi">
        <LottieGrid label="Lottie penutup" value={v.lottie} options={CLOSING_LOTTIES} onChange={(x) => set("lottie", x)} dark />
      </Sheet>
      <Sheet title="Sudut kontak">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kicker" value={v.stubKicker} onChange={(x) => set("stubKicker", x)} max={40} />
          <Field label="Tombol kontak" value={v.stubCta} onChange={(x) => set("stubCta", x)} max={30} />
        </div>
        <Field path={path("stubBody")} label="Ajakan" value={v.stubBody} onChange={(x) => set("stubBody", x)} max={160} multiline rows={2} flag={flag("stubBody")} />
      </Sheet>
      <Sheet title="Tautan lanjutan" aside={links.length < LIMITS.links && <MagnetButton onClick={() => set("links", [...links, { title: "", body: "", href: "/" }])}>+ Tautan</MagnetButton>}>
        {links.map((l, i) => (
          <div key={i} className="grid items-end gap-2 rounded-md border border-navy/10 bg-white p-3 sm:grid-cols-[1fr_1.4fr_1fr_auto]">
            <Field label="Judul" value={l.title} onChange={(x) => set(`links.${i}.title`, x)} max={40} />
            <Field path={path(`links.${i}.body`)} label="Keterangan" value={l.body} onChange={(x) => set(`links.${i}.body`, x)} max={100} flag={flag(`links.${i}.body`)} />
            <Field label="Alamat" value={l.href} onChange={(x) => set(`links.${i}.href`, x)} />
            <MagnetButton tone="danger" onClick={() => set("links", links.filter((_, j) => j !== i))}>
              ×
            </MagnetButton>
          </div>
        ))}
      </Sheet>
      <Sheet title="Elvo di penutup">
        <MascotField path={path("mascot")} value={v.mascot} onChange={(x) => set("mascot", x)} flag={flag("mascot.say")} />
      </Sheet>
    </div>
  );
}

/* ───────────── Tautan global ───────────── */
export function LinksEditor({ v, set }) {
  return (
    <Sheet title="Alamat bersama" hint="Dipakai tombol daftar di kartu kelas, modal, dan penutup.">
      <Field label="Pendaftaran (PMB)" value={v.pmb} onChange={(x) => set("pmb", x)} />
      <Field label="Kontak prodi" value={v.contact} onChange={(x) => set("contact", x)} />
    </Sheet>
  );
}

/* ───────────── Tirai & meta ───────────── */
export function MetaEditor({ root, setRoot }) {
  const c = root.curtain;
  const s = root.seo;
  return (
    <div className="space-y-6">
      <Sheet title="Tirai pembuka" hint="Layar sekali per sesi sebelum halaman tampil." aside={<Switch label="Aktif" checked={c.enabled} onChange={(x) => setRoot("curtain.enabled", x)} />}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Judul" value={c.title} onChange={(x) => setRoot("curtain.title", x)} max={40} size="title" />
          <Field label="Aksen" value={c.accent} onChange={(x) => setRoot("curtain.accent", x)} max={40} size="title" />
          <Field label="Label pembaca layar" value={c.label} onChange={(x) => setRoot("curtain.label", x)} max={60} />
        </div>
        <div className="grid place-items-center rounded-md bg-maroon py-8 text-center">
          <p className="font-serif text-3xl text-white">
            {c.title} <em className="text-gold-soft">{c.accent}</em>
          </p>
        </div>
      </Sheet>
      <Sheet title="Mesin pencari">
        <Field label="Judul halaman" value={s.title} onChange={(x) => setRoot("seo.title", x)} max={90} />
        <Field label="Deskripsi" value={s.description} onChange={(x) => setRoot("seo.description", x)} max={200} multiline rows={3} />
        <div className="rounded-md border border-navy/10 bg-white p-4">
          <p className="truncate text-[12px] text-emerald-700">… › program-kelas</p>
          <p className="mt-0.5 truncate text-[16px] text-[#1a0dab]">{s.title}</p>
          <p className="mt-0.5 line-clamp-2 text-[13px] text-text/65">{s.description}</p>
        </div>
        <Field label="Label konten contoh" value={s.sampleNote} onChange={(x) => setRoot("seo.sampleNote", x)} max={60} hint="Muncul di kelas yang ditandai contoh." />
      </Sheet>
    </div>
  );
}
