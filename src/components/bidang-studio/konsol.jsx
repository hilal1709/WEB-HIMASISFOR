"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { blankField } from "@/lib/bidang-cms/schema";
import { findRedundancy, redundantFields } from "@/lib/bidang-cms/lint";
import { useKonsol } from "./use-konsol";
import { ChannelStrip, AddChannel } from "./channel-strip";
import { MasterBus } from "./master-bus";
import { ChannelInspector } from "./inspector";
import { ChannelDeleteModal, HistoryModal, MasterOutModal, RedundancyModal } from "./modals";
import { KonsolLoader, SignalBanner, ConsoleIllustration, PreviewSheet, jumpTo } from "./chrome";
import { Dock } from "@/components/sambutan-studio/chrome";
import { MeterToaster, useMeter } from "./meter-toast";
import { cn } from "@/lib/utils";

function ConsoleInner() {
  const [bus, setBus] = useState("hero");
  const [selected, setSelected] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [masterOpen, setMasterOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [redundancyOpen, setRedundancyOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [solo, setSolo] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const rack = useRef(null);
  const meter = useMeter();
  const { doc, refs, value, status, dirty, update, replace, undo, redo, canUndo, canRedo, flush, discard, publish, restore, error } = useKonsol({
    onRemote: ({ type, by }) => type === "conflict" ? meter("Admin lain sedang mengedit", { tone: "warn", detail: by }) : meter("Sinyal baru diterima", { tone: "live", detail: by }),
    onSaved: () => meter("Draf tersimpan", { tone: "ok" }),
  });
  const hits = useMemo(() => (value ? findRedundancy(value) : []), [value]);
  const flagged = useMemo(() => redundantFields(hits), [hits]);

  useEffect(() => {
    const key = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); flush().then(() => meter("Draf disimpan", { tone: "ok" })).catch((x) => meter(x.message, { tone: "error" })); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); (e.shiftKey ? redo : undo)(); }
      if (e.target.closest("input,textarea,select,[contenteditable=true]")) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); const next = Math.max(0, Math.min((value?.fields?.length ?? 1) - 1, (selected ?? 0) + (e.key === "ArrowRight" ? 1 : -1))); setSelected(next); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [flush, meter, redo, selected, undo, value?.fields?.length]);

  if (!value || !doc) return <KonsolLoader />;
  const move = (from, to) => {
    const next = [...value.fields];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    replace({ ...value, fields: next });
    setSelected(to);
    meter("Urutan channel diperbarui", { tone: "info" });
  };
  const add = () => {
    if (value.fields.length >= 6) return;
    const slug = `bidang-${value.fields.length + 1}`;
    replace({ ...value, fields: [...value.fields, blankField(slug, value.dimensions.length)] });
    setSelected(value.fields.length);
    meter("Channel baru ditambahkan", { tone: "ok" });
  };
  const remove = () => {
    if (deleteIndex == null || value.fields.length <= 2) return;
    replace({ ...value, fields: value.fields.filter((_, i) => i !== deleteIndex) });
    setDeleteIndex(null);
    setSelected(null);
    meter("Channel dihapus dari draf", { tone: "info" });
  };
  const updateDims = (next, map) => replace({ ...value, dimensions: next, fields: value.fields.map((f) => ({ ...f, profile: map(f.profile ?? []) })) });
  const doPublish = () => {
    if (publishing) return;
    setPublishing(true);
    publish()
      .then(() => {
        setMasterOpen(false);
        meter("Master Out aktif — situs diperbarui", { tone: "live" });
      })
      .catch((e) => meter(e.message, { tone: "error" }))
      .finally(() => setPublishing(false));
  };

  return (
    <div className="konsol min-h-dvh bg-[#080f1e] text-[var(--k-ink)]">
      <header className="sticky top-0 z-30 border-b border-[var(--k-line)] bg-[#080f1e]/90 px-4 py-3 backdrop-blur-xl sm:px-7">
        <div className="mx-auto flex max-w-[1800px] items-center gap-4"><div><p className="font-mono text-[10px] tracking-[0.28em] text-[var(--k-gold)]">HIMASISFOR · CMS</p><h1 className="font-serif text-2xl">Konsol Bidang</h1></div><span className="ml-auto hidden font-mono text-[11px] text-[var(--k-faint)] sm:block">CTRL/⌘ S simpan · CTRL/⌘ Z urungkan</span><button type="button" onClick={() => setRedundancyOpen(true)} className="rounded-md border border-[var(--k-line-2)] px-2.5 py-1.5 text-[11px] text-[var(--k-mute)] hover:border-[var(--k-gold)] hover:text-[var(--k-gold)]">Redundansi <b>{hits.length}</b></button><button type="button" onClick={() => setHistoryOpen(true)} className="rounded-md border border-[var(--k-line-2)] px-2.5 py-1.5 text-[11px] text-[var(--k-mute)] hover:border-[var(--k-gold)] hover:text-[var(--k-gold)]">Riwayat</button></div>
      </header>
      <main className="mx-auto flex max-w-[1800px] flex-col gap-4 p-4 pb-28 sm:p-7">
        {error && <SignalBanner tone="error">{error}</SignalBanner>}
        {doc.hasLegacy && <SignalBanner tone="legacy">Isi lama berhasil diimpor sebagai titik awal. Tinjau sebelum diterbitkan.</SignalBanner>}
        {dirty && <SignalBanner tone="draft">Draf berubah. Pengunjung masih melihat versi tayang sampai Master Out.</SignalBanner>}
        <section className="grid min-h-[calc(100dvh-180px)] gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(440px,0.9fr)]">
          <div className="min-w-0 rounded-2xl border border-[var(--k-line)] bg-[var(--k-panel)]/50 p-4 sm:p-5">
            <div className="mb-4 flex items-end justify-between"><div><p className="font-mono text-[10px] tracking-[0.25em] text-[var(--k-gold)]">CHANNEL RACK</p><h2 className="font-serif text-xl">Rak bidang</h2></div><span className="font-mono text-[11px] text-[var(--k-faint)]">{value.fields.length}/6 CHANNEL</span></div>
            <div ref={rack} className="k-scroll flex min-h-[480px] gap-3 overflow-x-auto pb-5 pt-1" onDragOver={(e) => e.preventDefault()}>
              {value.fields.map((field, i) => <div key={field.slug} draggable onDragStart={() => setDragIndex(i)} onDragOver={(e) => { e.preventDefault(); setDragIndex(i); }} onDrop={() => { if (dragIndex != null && dragIndex !== i) move(dragIndex, i); setDragIndex(null); }} className="shrink-0"><ChannelStrip field={field} index={i} dims={value.dimensions} selected={selected === i} dragging={dragIndex === i} dropHint={dragIndex != null && dragIndex === i} onOpen={() => { setSelected(i); }} onProfile={(dim, val) => update(`fields.${i}.profile.${dim}`, val)} onPatch={(patch) => Object.entries(patch).forEach(([k, v]) => update(`fields.${i}.${k}`, v))} onSolo={() => { setSolo(field.slug); setPreviewKey((x) => x + 1); setPreviewOpen(true); }} dragProps={{ "aria-label": `Seret untuk mengurutkan ${field.title}` }} led={flagged.has(i) ? "bad" : dirty ? "warn" : "ok"} /></div>)}
              <AddChannel onAdd={add} disabled={value.fields.length >= 6} max={6} icon={<span className="text-3xl text-[var(--k-gold)]">+</span>} />
              {!value.fields.length && <div className="grid min-w-full place-items-center py-16"><ConsoleIllustration className="w-56 text-[var(--k-faint)]" /><p className="mt-3 text-[13px] text-[var(--k-mute)]">Belum ada channel.</p></div>}
            </div>
          </div>
          <div className="flex min-h-[560px] min-w-0 flex-col rounded-2xl border border-[var(--k-line)] bg-[var(--k-panel)]/50 p-4 sm:p-5"><div className="mb-3"><p className="font-mono text-[10px] tracking-[0.25em] text-[var(--k-gold)]">MASTER BUS</p><h2 className="font-serif text-xl">Sinyal halaman</h2></div><MasterBus value={value} update={update} onDims={updateDims} flagged={new Set(hits.map((h) => h.a.path).concat(hits.map((h) => h.b.path)))} tab={bus} onTab={setBus} /></div>
        </section>
      </main>
      <Dock status={status} dirty={dirty} canUndo={canUndo} onUndo={undo} redundancy={hits} onJump={jumpTo} history={doc.history} onRestore={(i) => restore(i).then(() => meter("Versi dipulihkan ke draf", { tone: "info" })).catch((e) => meter(e.message, { tone: "error" }))} onPreview={() => { setPreviewKey((x) => x + 1); setPreviewOpen(true); }} onDiscard={() => discard().then(() => meter("Draf dibuang", { tone: "info" })).catch((e) => meter(e.message, { tone: "error" }))} onPublish={() => setMasterOpen(true)} onHistory={() => setHistoryOpen(true)} onRedundancy={() => setRedundancyOpen(true)} />
      <ChannelInspector open={selected != null} onOpenChange={(open) => !open && setSelected(null)} field={selected == null ? null : value.fields[selected]} index={selected ?? 0} dims={value.dimensions} refs={refs} update={update} onDelete={() => setDeleteIndex(selected)} />
      <MasterOutModal open={masterOpen} onOpenChange={setMasterOpen} value={value} live={doc.live} onConfirm={doPublish} busy={publishing} />
      <ChannelDeleteModal open={deleteIndex != null} onOpenChange={(open) => !open && setDeleteIndex(null)} field={deleteIndex == null ? null : value.fields[deleteIndex]} onConfirm={remove} />
      <HistoryModal open={historyOpen} onOpenChange={setHistoryOpen} history={doc.history} onRestore={(i) => restore(i).then(() => { setHistoryOpen(false); meter("Versi dipulihkan ke draf", { tone: "info" }); })} />
      <RedundancyModal open={redundancyOpen} onOpenChange={setRedundancyOpen} hits={hits} onJump={jumpTo} />
      <PreviewSheet open={previewOpen} onOpenChange={setPreviewOpen} refreshKey={previewKey} slug={solo} />
    </div>
  );
}

export function BidangKonsol() {
  return <MeterToaster><ConsoleInner /></MeterToaster>;
}
