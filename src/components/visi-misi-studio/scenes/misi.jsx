"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, EffectCards, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";
import { Flip } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { LIMITS, MISI_ILLUSTRATIONS, fillCount } from "@/lib/visi-misi-cms/schema";
import { ILLUSTRATIONS, KnowledgeIllustration } from "@/components/illustrations/line-illustrations";
import { ConfirmModal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { Line, Panel, Tags, Toggle } from "../fields";

const pad = (n) => String(n).padStart(2, "0");
const BLANK = { key: "", text: "", detail: "", tags: [], illustration: "compass", sample: false };

/**
 * Adegan Misi: dek kartu bertumpuk (Swiper effect-cards). Depan = kata kunci & teks resmi,
 * balik kartu (3D) = penjelasan, tag, ilustrasi. Baris kartu mini di bawah bisa diseret untuk mengurutkan (GSAP Flip).
 */
export function MisiScene({ value: m, set, flags }) {
  const items = m.items ?? [];
  const [swiper, setSwiper] = useState(null);
  const [active, setActive] = useState(0);
  const [flipped, setFlipped] = useState({});
  const [confirm, setConfirm] = useState(null);
  const strip = useRef(null);
  const flipState = useRef(null);
  const [dragFrom, setDragFrom] = useState(null);

  useLayoutEffect(() => {
    if (!flipState.current) return;
    Flip.from(flipState.current, { duration: 0.5, ease: "expo.out", absolute: true });
    flipState.current = null;
  });

  const setItem = (i, k, v) => set("misi.items", items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const reorder = (from, to) => {
    if (from === to || to < 0 || to >= items.length) return;
    if (strip.current && !prefersReducedMotion()) flipState.current = Flip.getState(strip.current.querySelectorAll("[data-chip]"));
    const next = [...items];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    set("misi.items", next);
    setActive(to);
    requestAnimationFrame(() => swiper?.slideTo(to));
  };
  const add = () => {
    if (items.length >= LIMITS.misi) return;
    set("misi.items", [...items, { ...BLANK }]);
    const to = items.length;
    setActive(to);
    setTimeout(() => swiper?.slideTo(to), 60);
  };
  const remove = (i) => {
    set("misi.items", items.filter((_, j) => j !== i));
    setConfirm(null);
    setActive((a) => Math.max(0, Math.min(a, items.length - 2)));
  };

  return (
    <div className="space-y-6">
      <Panel title="Kepala section">
        <div className="grid gap-5 md:grid-cols-2">
          <Line path="misi.titleTop" label="Judul" value={m.titleTop} max={60} onChange={(v) => set("misi.titleTop", v)} hint={`Tulis {jumlah} → “${fillCount("{jumlah}", items.length)}”, ikut berubah bila misi ditambah.`} />
          <Line path="misi.titleAccent" label="Aksen miring" value={m.titleAccent} max={60} onChange={(v) => set("misi.titleAccent", v)} />
        </div>
        <Line path="misi.intro" label="Pengantar" value={m.intro} max={240} multiline rows={2} flag={flags("misi.intro")} onChange={(v) => set("misi.intro", v)} />
        <div className="grid gap-5 md:grid-cols-2">
          <Line path="misi.moreLabel" label="Tombol detail" value={m.moreLabel} max={30} size="sm" onChange={(v) => set("misi.moreLabel", v)} />
          <Line path="misi.sampleNote" label="Label konten contoh" value={m.sampleNote} max={80} size="sm" onChange={(v) => set("misi.sampleNote", v)} hint="Tampil di modal misi yang ditandai “contoh”." />
        </div>
      </Panel>

      {items.length === 0 ? (
        <div className="grid place-items-center rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-navy/[0.07]">
          <div className="w-48 text-navy">
            <KnowledgeIllustration />
          </div>
          <p className="mt-4 font-serif text-xl text-navy">Belum ada misi</p>
          <p className="mt-1 text-[13.5px] text-text/55">Section misi disembunyikan dari halaman sampai ada minimal satu.</p>
          <button type="button" onClick={add} className="mt-5 rounded-md bg-maroon px-4 py-2 text-[14px] font-semibold text-white hover:bg-maroon-deep">
            Tambah misi pertama
          </button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
          <div className="min-w-0 px-2 sm:px-8">
            <Swiper
              modules={[EffectCards, A11y, Keyboard]}
              effect="cards"
              grabCursor
              keyboard={{ enabled: true, onlyInViewport: true }}
              cardsEffect={{ perSlideOffset: 7, perSlideRotate: 2, slideShadows: false }}
              noSwipingSelector="input, textarea, button, label"
              onSwiper={setSwiper}
              onSlideChange={(s) => setActive(s.activeIndex)}
              className="!overflow-visible"
            >
              {items.map((it, i) => (
                <SwiperSlide key={i} className="!h-auto rounded-2xl">
                  <FlipCard
                    n={i + 1}
                    item={it}
                    flipped={Boolean(flipped[i])}
                    onFlip={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
                    onChange={(k, v) => setItem(i, k, v)}
                    onRemove={() => setConfirm(i)}
                    flags={flags}
                    path={`misi.items.${i}`}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <aside>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/50">Urutan · seret untuk memindah</p>
            <ol ref={strip} className="mt-3 space-y-2">
              {items.map((it, i) => (
                <li
                  key={`${it.key}-${i}`}
                  data-chip
                  data-flip-id={`chip-${it.key || i}-${it.text.slice(0, 12)}`}
                  draggable
                  onDragStart={(e) => {
                    setDragFrom(i);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => (reorder(dragFrom, i), setDragFrom(null))}
                  onDragEnd={() => setDragFrom(null)}
                  className={cn(
                    "group flex cursor-grab items-center gap-3 rounded-lg bg-white px-3 py-2.5 ring-1 transition-[box-shadow,opacity] active:cursor-grabbing",
                    i === active ? "ring-2 ring-maroon shadow-[0_14px_30px_-20px_rgb(110_20_35/0.6)]" : "ring-navy/10 hover:ring-navy/25",
                    dragFrom === i && "opacity-40"
                  )}
                >
                  <span aria-hidden className="text-navy/25">⋮⋮</span>
                  <button type="button" onClick={() => swiper?.slideTo(i)} className="flex min-w-0 flex-1 items-baseline gap-2 text-left">
                    <span className="font-serif text-lg text-gold">{pad(i + 1)}</span>
                    <span className="truncate text-[13.5px] font-medium text-navy">{it.key || "Tanpa kata kunci"}</span>
                  </button>
                  <span className="flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                    <button type="button" aria-label="Naikkan" disabled={i === 0} onClick={() => reorder(i, i - 1)} className="px-1 text-navy/50 hover:text-navy disabled:opacity-20">↑</button>
                    <button type="button" aria-label="Turunkan" disabled={i === items.length - 1} onClick={() => reorder(i, i + 1)} className="px-1 text-navy/50 hover:text-navy disabled:opacity-20">↓</button>
                  </span>
                </li>
              ))}
            </ol>
            {items.length < LIMITS.misi && (
              <button type="button" onClick={add} className="mt-3 w-full rounded-lg border border-dashed border-maroon/40 py-2.5 text-[13.5px] font-medium text-maroon transition-colors hover:bg-maroon/5">
                + Tambah misi
              </button>
            )}
            <p className="mt-3 text-[12px] text-text/45">
              {items.length}/{LIMITS.misi} misi · ← → untuk berpindah kartu
            </p>
          </aside>
        </div>
      )}

      <ConfirmModal
        open={confirm != null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`Hapus misi ${confirm != null ? pad(confirm + 1) : ""}?`}
        description="Kartu ini hilang dari draf. Masih bisa diurungkan dengan Ctrl+Z sebelum terbit."
        confirmLabel="Hapus misi"
        destructive
        onConfirm={() => remove(confirm)}
      />
    </div>
  );
}

function FlipCard({ n, item, flipped, onFlip, onChange, onRemove, flags, path }) {
  const Illustration = ILLUSTRATIONS[item.illustration];
  return (
    <div className="[perspective:1600px]">
      <div className={cn("grid transition-transform duration-700 ease-cinematic [transform-style:preserve-3d]", flipped && "[transform:rotateY(180deg)]")}>
        {/* depan */}
        <div aria-hidden={flipped} inert={flipped} className="flex flex-col rounded-2xl bg-white p-6 shadow-[0_30px_60px_-36px_rgb(20_33_61/0.55)] ring-1 ring-navy/10 [backface-visibility:hidden] [grid-area:1/1] sm:p-8">
          <div className="flex items-start gap-4">
            <span className="font-serif text-[2.6rem] leading-none text-gold">{pad(n)}</span>
            <Line path={`${path}.key`} label="Kata kunci" value={item.key} max={40} size="sm" onChange={(v) => onChange("key", v)} className="flex-1" inputClassName="font-semibold uppercase tracking-[0.12em] text-maroon" />
          </div>
          <Line path={`${path}.text`} label="Teks misi (resmi)" value={item.text} max={400} multiline rows={4} flag={flags(`${path}.text`)} onChange={(v) => onChange("text", v)} className="mt-5" inputClassName="font-serif text-[1.2rem] leading-snug" />
          <div className="mt-auto flex pt-6 flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={onRemove} className="text-[13px] text-maroon/70 hover:text-maroon">
              Hapus
            </button>
            <button type="button" onClick={onFlip} className="group inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-[13px] font-semibold text-white transition-transform active:scale-95">
              Balik kartu
              <span aria-hidden className="transition-transform duration-500 group-hover:rotate-180">↻</span>
            </button>
          </div>
        </div>

        {/* belakang */}
        <div aria-hidden={!flipped} inert={!flipped} className="rounded-2xl bg-navy p-6 text-white shadow-[0_30px_60px_-36px_rgb(14_24_48/0.8)] [backface-visibility:hidden] [grid-area:1/1] [transform:rotateY(180deg)] sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <p className="kicker text-gold-soft">
              Misi {pad(n)} · sisi detail
            </p>
            <button type="button" onClick={onFlip} className="rounded-full px-3 py-1 text-[12.5px] ring-1 ring-white/20 hover:bg-white/10">
              ↺ Depan
            </button>
          </div>
          <Line tone="dark" path={`${path}.detail`} label="Penjelasan (modal)" value={item.detail} max={600} multiline rows={3} flag={flags(`${path}.detail`)} onChange={(v) => onChange("detail", v)} className="mt-4" />
          <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_120px]">
            <div className="rounded-lg bg-white p-3 text-navy">
              <Tags path={`${path}.tags`} label="Tag" items={item.tags} max={LIMITS.tags} onChange={(v) => onChange("tags", v)} />
            </div>
            <div className="hidden items-center rounded-lg bg-cream p-2 text-navy sm:flex">{Illustration && <Illustration className="h-auto w-full" />}</div>
          </div>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-soft/80">Ilustrasi</p>
          <div role="radiogroup" aria-label="Ilustrasi misi" className="mt-2 grid grid-cols-5 gap-2">
            {MISI_ILLUSTRATIONS.map(([k, label]) => {
              const Ill = ILLUSTRATIONS[k];
              const on = item.illustration === k;
              return (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  title={label}
                  onClick={() => onChange("illustration", k)}
                  className={cn("aspect-[4/3] overflow-hidden rounded-md bg-cream p-1 text-navy transition-[transform,box-shadow] duration-300", on ? "scale-105 ring-2 ring-gold" : "opacity-70 hover:opacity-100")}
                >
                  <Ill className="h-full w-full" />
                </button>
              );
            })}
          </div>
          <div className="mt-5">
            <Toggle tone="dark" checked={item.sample} onChange={(v) => onChange("sample", v)} label="Tandai sebagai contoh" hint="Penjelasan belum resmi → modal menampilkan label konten contoh." />
          </div>
        </div>
      </div>
    </div>
  );
}
