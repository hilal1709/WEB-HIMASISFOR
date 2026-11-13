"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { animate } from "animejs";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import "swiper/css";
import { sectionOf } from "@/lib/home-cms/schema";
import { useConnection, usePresence } from "@/lib/realtime/client";
import { cn } from "@/lib/utils";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { useStudio } from "./use-studio";
import { Spine } from "./spine";
import { Inspector } from "./inspector";
import { Stage } from "./stage";
import { FieldCtx, fieldId } from "./fields";
import { GridBackdrop, MovingBorder } from "./fx";
import { CommandBar, DiscardModal, MediaPicker, PublishModal, StudioBanner, StudioLoader, StudioToaster, useStudioToast } from "./overlays";

const label = (k) => (k === "layout" ? "Urutan section" : sectionOf(k)?.label ?? k);
const WELCOME_KEY = "home-studio:welcome";

export function HomeStudio() {
  return (
    <StudioToaster>
      <StudioInner />
    </StudioToaster>
  );
}

function StudioInner() {
  const toast = useStudioToast();
  const stage = useRef(null);
  const [active, setActive] = useState("hero");
  const [group, setGroup] = useState("teks");
  const [publishOpen, setPublishOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [picker, setPicker] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [pane, setPane] = useState(null);
  const [welcome, setWelcome] = useState(false);
  const desk = useIsDesktop();

  const studio = useStudio({
    onSaved: () => stage.current?.refresh(),
    onRemote: (e) => {
      if (e.type === "draft") {
        toast(`${e.by} mengubah ${label(e.section)}`, { tone: "info" });
        stage.current?.refresh();
      }
      if (e.type === "conflict") setConflict(e);
      if (e.type === "published") toast(`${e.by} menerbitkan ${e.sections.map(label).join(", ")}`, { tone: "live" });
    },
  });
  const { sections, status, user, error } = studio;
  const connection = useConnection();
  const { members } = usePresence("presence-studio", Boolean(sections));

  useEffect(() => {
    try {
      setWelcome(localStorage.getItem(WELCOME_KEY) !== "0");
    } catch {}
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        studio.flush().then(() => toast("Draf tersimpan"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [studio, toast]);

  // peringatkan sebelum menutup tab saat masih ada ketikan belum tersimpan
  useEffect(() => {
    const on = (e) => {
      if (studio.saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", on);
    return () => window.removeEventListener("beforeunload", on);
  }, [studio.saving]);

  const select = useCallback((k) => {
    setActive(k);
    pane?.slideTo(1);
    const anchor = sectionOf(k)?.anchor;
    if (anchor) stage.current?.scrollTo(anchor);
  }, [pane]);

  const jump = (e) => {
    select(e.section);
    if (!e.field) return;
    const f = sectionOf(e.section).fields.find((x) => x.key === e.field);
    setGroup(f?.group ?? "teks");
    setTimeout(() => {
      const el = document.getElementById(fieldId(`${e.section}.${e.field}`));
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      animate(el, { backgroundColor: ["rgba(201,162,39,0.25)", "rgba(201,162,39,0)"], duration: 1600, ease: "outQuad", delay: 300 });
      el.querySelector("input,textarea,button")?.focus({ preventScroll: true });
    }, 120);
  };

  const openPicker = useCallback((kind, current, onPick) => setPicker({ kind, current, onPick }), []);

  if (error && !sections)
    return (
      <div className="grid min-h-screen place-items-center bg-ink px-6 text-center text-white">
        <div>
          <LottieIllustration src="/lottie/empty-news.json" className="mx-auto w-36" />
          <p className="mt-4 font-serif text-2xl">Studio belum bisa dibuka</p>
          <p className="mt-2 text-sm text-white/55">{error}</p>
          <button type="button" onClick={studio.load} className="mt-6 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink">
            Coba lagi
          </button>
        </div>
      </div>
    );
  if (!sections) return <StudioLoader />;

  const entry = sections[active];
  const dirty = studio.dirtyKeys;
  const others = members.filter((m) => m.name !== user?.name);

  const inspector = (
    <Inspector
      sectionKey={active}
      entry={entry}
      group={group}
      onGroup={setGroup}
      status={status[active]}
      onChange={(v) => studio.update(active, v)}
      onDiscard={() => setDiscardOpen(true)}
    />
  );
  const spine = <Spine sections={sections} active={active} onSelect={select} onLayout={(v) => studio.update("layout", v)} />;

  return (
    <FieldCtx.Provider value={{ openPicker }}>
      <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-ink text-white">
        <GridBackdrop />
        <span aria-hidden className="pointer-events-none absolute -left-40 -top-40 size-[520px] rounded-full bg-maroon/40 blur-[120px]" />

        {/* ── Bilah atas ── */}
        <header className="relative z-10 flex shrink-0 items-center gap-3 px-4 py-3 md:px-6">
          <Link href="/admin/dashboard" className="group flex items-center gap-3" aria-label="Kembali ke dashboard">
            <span className="grid size-9 place-items-center rounded-xl bg-paper transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:-rotate-6">
              <Image src="/img/sisfor.svg" alt="" width={22} height={22} />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block font-serif text-lg">Studio Beranda</span>
              <span className="block text-[11px] text-white/45">← Dashboard</span>
            </span>
          </Link>

          <SaveState saving={studio.saving} failed={studio.failed} onRetry={() => studio.flush().catch(() => {})} />

          <div className="ml-auto flex items-center gap-2">
            <Presence members={members} connection={connection} />
            <button type="button" onClick={() => setCmdOpen(true)} className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/55 transition-colors hover:border-white/25 hover:text-white md:flex">
              Lompat ke…
              <kbd className="rounded bg-white/10 px-1.5 font-sans text-[10px]">Ctrl K</kbd>
            </button>
            <a href="/" target="_blank" rel="noopener noreferrer" className="hidden rounded-full px-3 py-1.5 text-xs text-white/55 transition-colors hover:bg-white/10 hover:text-white sm:block">
              Situs live ↗
            </a>
            <MovingBorder className="h-10" disabled={!dirty.length} onClick={() => setPublishOpen(true)}>
              Terbitkan
              {dirty.length > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-gold px-1.5 text-[11px] text-ink tabular-nums">{dirty.length}</span>}
            </MovingBorder>
          </div>
        </header>

        {/* ── Pita status ── */}
        <div className="relative z-10 shrink-0 space-y-2 px-4 empty:hidden md:px-6">
          {conflict && (
            <StudioBanner tone="conflict" onDismiss={() => setConflict(null)} action={<button type="button" onClick={() => { setConflict(null); studio.load(); }} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Muat versi terbaru</button>}>
              {conflict.by} juga menyunting {label(conflict.section)}. Simpanan terakhir yang berlaku.
            </StudioBanner>
          )}
          {(connection === "unavailable" || connection === "failed") && <StudioBanner tone="offline">Sambungan realtime terputus — draf tetap tersimpan, tetapi perubahan admin lain tidak langsung terlihat.</StudioBanner>}
          {others.length > 0 && !conflict && (
            <StudioBanner tone="draft">{others.map((m) => m.name).join(", ")} sedang membuka Studio. Perubahan kalian saling tersinkron.</StudioBanner>
          )}
        </div>

        {/* ── Tiga zona (desktop) ── */}
        {desk ? (
        <main className="relative z-10 grid min-h-0 flex-1 grid-cols-[236px_minmax(400px,0.9fr)_1.25fr] gap-4 p-4 pt-3 md:px-6">
          <aside className="min-h-0 overflow-y-auto pr-1">
            {welcome && <Welcome name={user?.name} onClose={() => { setWelcome(false); try { localStorage.setItem(WELCOME_KEY, "0"); } catch {} }} />}
            {spine}
          </aside>
          {inspector}
          <Stage ref={stage} />
        </main>
        ) : (
        /* ── Ponsel/tablet: tiga panel geser ── */
        <main className="relative z-10 flex min-h-0 flex-1 flex-col">
          <Tabs pane={pane} />
          <Swiper modules={[A11y]} onSwiper={setPane} className="min-h-0 w-full flex-1" style={{ height: "100%" }} allowTouchMove={false}>
            <SwiperSlide className="!h-full overflow-y-auto px-4 pb-6">{spine}</SwiperSlide>
            <SwiperSlide className="!h-full px-3 pb-3">{inspector}</SwiperSlide>
            <SwiperSlide className="!h-full px-3 pb-3">
              <Stage ref={stage} />
            </SwiperSlide>
          </Swiper>
        </main>
        )}
      </div>

      <PublishModal
        open={publishOpen}
        onOpenChange={setPublishOpen}
        sections={sections}
        dirtyKeys={dirty}
        onPublish={async (keys) => {
          try {
            const done = await studio.publish(keys);
            stage.current?.refresh();
            return done;
          } catch (e) {
            toast("Gagal menerbitkan", { tone: "error", detail: e.message });
            throw e;
          }
        }}
      />
      <DiscardModal
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        label={sectionOf(active)?.label}
        onConfirm={async () => {
          const before = entry.value;
          await studio.discard(active);
          toast(`${sectionOf(active).label} kembali ke versi live`, { tone: "warn", action: { label: "Urungkan", onClick: () => studio.update(active, before) } });
        }}
      />
      <CommandBar open={cmdOpen} onOpenChange={setCmdOpen} onJump={jump} />
      {picker && <MediaPicker open onOpenChange={(o) => !o && setPicker(null)} kind={picker.kind} current={picker.current} onPick={picker.onPick} />}
    </FieldCtx.Provider>
  );
}

/** Indikator simpan otomatis: teks berganti dengan geser halus (anime.js). */
function SaveState({ saving, failed, onRetry }) {
  const ref = useRef(null);
  const state = failed ? "error" : saving ? "saving" : "saved";
  useEffect(() => {
    if (ref.current) animate(ref.current, { translateY: [6, 0], opacity: [0, 1], duration: 380, ease: "outExpo" });
  }, [state]);
  const text = { saved: "Semua draf tersimpan", saving: "Menyimpan draf…", error: "Gagal menyimpan — coba lagi" }[state];
  const dot = { saved: "bg-emerald-400", saving: "bg-gold animate-pulse", error: "bg-red-400" }[state];
  return (
    <button type="button" onClick={failed ? onRetry : undefined} className={cn("ml-2 hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs md:flex", failed ? "cursor-pointer text-red-200" : "cursor-default text-white/60")} aria-live="polite">
      <span className={cn("size-1.5 rounded-full", dot)} />
      <span ref={ref}>{text}</span>
    </button>
  );
}

function Presence({ members, connection }) {
  const live = connection === "connected";
  return (
    <div className="flex items-center gap-2" title={live ? "Realtime aktif" : "Realtime tidak aktif"}>
      <span className="flex -space-x-2">
        {members.slice(0, 4).map((m) => (
          <span key={m.id} title={m.name} className="grid size-7 place-items-center rounded-full border-2 border-ink bg-gold-soft text-[11px] font-bold uppercase text-maroon-deep animate-in zoom-in-50 duration-300">
            {(m.name ?? "?").slice(0, 1)}
          </span>
        ))}
      </span>
      <span className={cn("relative flex size-2", !live && "opacity-50")}>
        {live && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />}
        <span className={cn("relative size-2 rounded-full", live ? "bg-emerald-400" : "bg-white/30")} />
      </span>
    </div>
  );
}

function Welcome({ name, onClose }) {
  return (
    <div className="relative mb-4 overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-maroon/60 to-ink p-4 pr-16 animate-in fade-in-0 slide-in-from-left-2 duration-700">
      <Image src="/mascot/elvo-wave.webp" alt="" width={120} height={150} className="absolute -bottom-3 -right-2 w-16 animate-float" />
      <p className="font-serif text-lg leading-snug">Halo{name ? `, ${name.split(" ")[0]}` : ""}!</p>
      <p className="mt-1 text-xs leading-relaxed text-white/65">Pilih section, ubah isinya, lihat hasilnya di kanan. Draf tersimpan sendiri; pengunjung baru melihatnya setelah Terbitkan.</p>
      <button type="button" onClick={onClose} className="mt-3 text-xs font-semibold text-gold-soft underline-offset-4 hover:underline">
        Mengerti
      </button>
    </div>
  );
}

function Tabs({ pane }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!pane) return;
    const on = () => setI(pane.activeIndex);
    pane.on("slideChange", on);
    return () => pane.off("slideChange", on);
  }, [pane]);
  return (
    <div className="mx-4 mb-3 grid grid-cols-3 rounded-full border border-white/10 bg-white/[0.04] p-1 text-xs font-semibold">
      {["Section", "Isi", "Pratinjau"].map((t, k) => (
        <button key={t} type="button" onClick={() => pane?.slideTo(k)} className={cn("rounded-full py-1.5 transition-colors", i === k ? "bg-gold-soft text-ink" : "text-white/55")}>
          {t}
        </button>
      ))}
    </div>
  );
}

/** Satu tata letak saja yang dirender (desktop tiga zona vs. panel geser) agar iframe & id field tidak ganda. */
function useIsDesktop() {
  const [desk, setDesk] = useState(true);
  useEffect(() => {
    const mq = matchMedia("(min-width: 1024px)");
    const on = () => setDesk(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return desk;
}
