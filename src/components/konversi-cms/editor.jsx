"use client";
import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { BLOCKS } from "@/lib/konversi-cms/schema";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { ConfirmModal, Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { BlockFields, OrderButtons, move } from "./fields";

const endpoint = "/api/konversi-cms";
const when = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" });
const titles = { ...BLOCKS, settings: "Metadata dan pesan halaman" };

function LoadingRows() {
  const rows = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const animation = animate(rows.current.querySelectorAll("[data-line]"), {
      opacity: [0.35, 0.85], alternate: true, loop: true, duration: 780, delay: (_, index) => index * 110,
    });
    return () => animation.revert();
  }, []);
  return <div ref={rows} role="status" className="divide-y divide-line border-y border-line">
    <span className="sr-only">Memuat blok Konversi SKS…</span>
    {Object.keys(BLOCKS).map((name, i) => <div aria-hidden key={name} className="flex items-center justify-between gap-6 px-5 py-5">
      <div data-line className="h-4 rounded bg-cream-2" style={{ width: (27 + (i % 3) * 8) + "%" }} />
      <div data-line className="h-3 w-16 rounded bg-cream-2" />
    </div>)}
  </div>;
}

function Preview({ open, onOpenChange, revision, trigger }) {
  const [mobile, setMobile] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const route = "/admin/konversi-sks/pratinjau?revisi=" + encodeURIComponent(revision);
  useEffect(() => {
    if (!open || loaded) return;
    const timer = setTimeout(() => setFailed(true), 12000);
    return () => clearTimeout(timer);
  }, [open, loaded]);
  return <Modal open={open} onOpenChange={onOpenChange}>
    <ModalContent className="flex h-[94dvh] max-w-[96vw] flex-col p-0" onCloseAutoFocus={(event) => {
      if (trigger.current) { event.preventDefault(); trigger.current.focus(); }
    }}>
      <div className="border-b border-line px-4 pb-3 pt-5 pr-16 sm:flex sm:items-center sm:justify-between sm:px-6 sm:pr-16">
        <ModalTitle>Pratinjau draf</ModalTitle>
        <ModalDescription className="sr-only">Halaman publik dengan isi draf tersimpan.</ModalDescription>
        <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0">
          <Button size="sm" variant={mobile ? "ghost" : "maroon"} aria-pressed={!mobile} onClick={() => setMobile(false)}>Desktop</Button>
          <Button size="sm" variant={mobile ? "maroon" : "ghost"} aria-pressed={mobile} onClick={() => setMobile(true)}>Ponsel</Button>
          <a href={route} target="_blank" rel="noopener noreferrer" className="px-2 text-sm font-semibold text-maroon underline underline-offset-4">Buka tab</a>
        </div>
      </div>
      <div className="relative min-h-0 grow bg-cream-2">
        {!loaded && <div className="absolute inset-0 grid place-items-center bg-cream-2 text-sm text-navy" role="status">
          {failed ? "Pratinjau belum tersedia. Coba buka di tab baru." : "Memuat pratinjau…"}
        </div>}
        {open && <iframe className={cn("mx-auto block h-full max-w-full border-x border-line bg-white", mobile ? "w-[390px]" : "w-full")}
          title="Halaman publik Konversi SKS" src={route} onLoad={() => setLoaded(true)} />}
      </div>
    </ModalContent>
  </Modal>;
}

export function KonversiEditor({ assets }) {
  const toast = useToast();
  const [state, setState] = useState(null);
  const [value, setValue] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [selected, setSelected] = useState("hero");
  const [panel, setPanel] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [preview, setPreview] = useState(false);
  const rowTrigger = useRef(null);
  const previewTrigger = useRef(null);
  const confirmTrigger = useRef(null);
  const dirty = !!state && value !== state.value;

  async function load() {
    setBusy("load");
    setError("");
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setState(result.data);
      setValue(result.data.value);
      setConflict(false);
      setConfirm("");
    } catch (failure) {
      setError(failure.message || "Konten gagal dimuat. Coba lagi.");
      setConfirm("");
    } finally {
      setBusy("");
    }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function write(action) {
    if (busy || conflict || !state) return;
    setBusy(action);
    setError("");
    try {
      const response = await fetch(endpoint, {
        method: { save: "PUT", publish: "POST", discard: "DELETE" }[action],
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision: state.revision, ...(action === "save" && { value }) }),
      });
      const result = await response.json();
      if (response.status === 409) { setConflict(true); return; }
      if (!response.ok) throw new Error(result.error);
      setState({ ...state, ...result.data });
      setValue(result.data.value);
      toast.success({ save: "Draf tersimpan", publish: "Perubahan terbit", discard: "Draf dibuang" }[action]);
    } catch (failure) {
      const message = failure.message || "Perubahan gagal diproses.";
      setError(message);
      toast.error("Perubahan gagal diproses", { description: message });
    } finally {
      setBusy("");
      setConfirm("");
    }
  }

  function update(key, next) {
    setValue((current) => ({ ...current, ...(typeof key === "string" ? { [key]: next } : key) }));
  }

  function reorder(index, delta) {
    const blocks = move(value.blocks, index, delta);
    if (!prefersReducedMotion()) {
      const row = document.getElementById("konversi-cms-" + value.blocks[index].key);
      if (row) gsap.fromTo(row, { y: delta * -Math.min(18, row.offsetHeight / 4) }, { y: 0, clearProps: "transform", duration: 0.3, ease: "expo.out" });
    }
    update("blocks", blocks);
  }

  const select = (key, event) => {
    rowTrigger.current = event.currentTarget;
    setSelected(key);
    setPanel(true);
  };
  const confirmation = (action, event) => {
    confirmTrigger.current = event.currentTarget;
    setConfirm(action);
  };
  const waiting = Boolean(busy);
  const canPublish = state?.draftAt && !dirty;
  const canPreview = state?.draftAt && !dirty && !conflict;
  const confirmCopy = {
    publish: ["Terbitkan perubahan?", "Draf tersimpan akan tampil di halaman Konversi SKS.", "Terbitkan"],
    discard: ["Buang draf?", "Draf tersimpan dan perubahan lokal akan dibuang.", "Buang draf"],
    reload: ["Muat versi server?", "Perubahan lokal akan diganti dengan versi terbaru di server.", "Muat versi server"],
  }[confirm];

  return (
    <main className="min-h-dvh bg-cream text-navy">
      <header className="border-b-[3px] border-gold bg-maroon text-white">
        <div className="mx-auto max-w-6xl px-5 pb-8 pt-9 sm:px-9 lg:pb-10 lg:pt-10">
          <a href="/admin/dashboard" className="text-sm font-medium text-gold-soft underline decoration-gold/45 underline-offset-4">Kembali ke admin</a>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
            <h1 className="font-serif text-[clamp(2.1rem,5vw,3.5rem)] leading-none">Konversi SKS</h1>
            <a href="/konversi-sks" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white underline decoration-white/45 underline-offset-4">Buka halaman publik</a>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-9">
        {error && <Banner variant="warning" title={error} className="mb-5"
          action={!state && <Button size="sm" variant="outline-navy" disabled={waiting} onClick={load}>Coba lagi</Button>} />}
        {conflict && <Banner variant="warning" title="Versi server lebih baru" className="mb-5"
          action={<Button size="sm" variant="outline-navy" onClick={(event) => confirmation("reload", event)}>Muat versi server</Button>}>
          Isian di layar tetap tersedia sampai kamu memuat versi server.
        </Banner>}
        {!state && !error && <LoadingRows />}
        {state && <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
            <p aria-live="polite" className="text-sm text-text/75">
              {dirty ? "Ada perubahan lokal" : state.draftAt ? "Draf disimpan " + when.format(new Date(state.draftAt)) : state.publishedAt ? "Terbit " + when.format(new Date(state.publishedAt)) : "Memakai konten awal"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {state.draftAt && <Button variant="ghost" size="sm" disabled={waiting || conflict} onClick={(event) => confirmation("discard", event)}>Buang draf</Button>}
              <Button ref={previewTrigger} variant="outline-navy" disabled={!canPreview || waiting} size="sm" onClick={() => setPreview(true)}>Pratinjau</Button>
              {canPublish ? <Button variant="maroon" size="sm" disabled={waiting || conflict} onClick={(event) => confirmation("publish", event)}>Terbitkan</Button>
                : <Button variant="maroon" size="sm" loading={busy === "save"} disabled={waiting || conflict} onClick={() => write("save")}>Simpan draf</Button>}
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-line bg-white shadow-[0_22px_42px_-35px_rgb(20_33_61/0.45)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-line bg-cream-2 text-navy">
                <tr>
                  <th scope="col" className="w-10 px-2 py-3 text-center sm:w-16 sm:px-5"><span className="sm:hidden" aria-hidden>#</span><span className="sr-only sm:not-sr-only">Posisi</span></th>
                  <th scope="col" className="px-2 py-3 sm:px-4">Blok halaman</th>
                  <th scope="col" className="w-18 px-1 py-3 sm:w-32 sm:px-4">Tampil</th>
                  <th scope="col" className="w-20 px-1 py-3 sm:w-28 sm:px-4">Urutan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {value.blocks.map((block, index) => <tr id={"konversi-cms-" + block.key} key={block.key} className={cn("transition-colors", selected === block.key ? "bg-cream" : "hover:bg-cream/60")}>
                  <td className="px-2 text-center font-serif text-base tabular-nums text-text/75 sm:px-5">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="relative px-2 py-3 sm:px-4">
                    {selected === block.key && <span aria-hidden className="absolute inset-y-2 left-0 w-px bg-gold motion-safe:animate-in motion-safe:slide-in-from-bottom-1" />}
                    <button type="button" onClick={(event) => select(block.key, event)}
                      className="min-h-9 rounded px-1 text-left font-semibold text-navy underline-offset-4 hover:text-maroon hover:underline focus-visible:outline-2 focus-visible:outline-maroon">
                      {titles[block.key]}
                    </button>
                  </td>
                  <td className="px-1 sm:px-4">
                    <label className="inline-flex min-h-9 items-center gap-2">
                      <input type="checkbox" className="size-4 accent-maroon" disabled={waiting} checked={block.visible}
                        aria-label={"Tampilkan " + titles[block.key]}
                        onChange={(event) => update("blocks", value.blocks.map((item) => item === block ? { ...item, visible: event.target.checked } : item))} />
                      <span className="hidden text-text/75 sm:inline">{block.visible ? "Tampil" : "Tersembunyi"}</span>
                    </label>
                  </td>
                  <td className="px-1 sm:px-4">
                    <fieldset disabled={waiting}><legend className="sr-only">Atur posisi {titles[block.key]}</legend>
                      <OrderButtons index={index} count={value.blocks.length} label={titles[block.key]} change={(delta) => reorder(index, delta)} />
                    </fieldset>
                  </td>
                </tr>)}
              </tbody>
            </table>
            <div className="border-t border-line bg-cream/55 px-4 py-3 sm:px-6">
              <Button variant="ghost" size="sm" onClick={(event) => select("settings", event)}>{titles.settings}</Button>
            </div>
          </div>
          <Sheet open={panel} onOpenChange={setPanel}>
            <SheetContent onCloseAutoFocus={(event) => {
              if (rowTrigger.current) { event.preventDefault(); rowTrigger.current.focus(); }
            }} className="w-full overflow-hidden border-line bg-cream sm:w-[min(95vw,680px)] motion-reduce:animate-none">
              <div className="shrink-0 border-b border-line bg-cream px-5 py-4 pr-16 sm:px-8 sm:pr-16">
                <SheetTitle className="font-serif text-2xl text-navy">{titles[selected]}</SheetTitle>
                <SheetDescription>Ubah konten {titles[selected].toLowerCase()}.</SheetDescription>
              </div>
              <fieldset disabled={waiting} className="min-h-0 min-w-0 flex-1 overflow-y-auto p-5 sm:p-8">
                <legend className="sr-only">{titles[selected]}</legend>
                <BlockFields key={selected} name={selected} value={value} update={update} catalog={state.catalog} assets={assets} />
              </fieldset>
              <div className="flex shrink-0 justify-end gap-2 border-t border-line bg-cream px-5 py-3 sm:px-8">
                <Button variant="outline-navy" size="sm" onClick={() => setPanel(false)}>Selesai</Button>
                <Button variant="maroon" size="sm" loading={busy === "save"} disabled={!dirty || waiting || conflict} onClick={() => write("save")}>Simpan draf</Button>
              </div>
            </SheetContent>
          </Sheet>
          {preview && <Preview open={preview} onOpenChange={setPreview} revision={state.revision} trigger={previewTrigger} />}
          <ConfirmModal open={Boolean(confirm)} onOpenChange={(open) => !open && !waiting && setConfirm("")} loading={waiting}
            onCloseAutoFocus={(event) => { if (confirmTrigger.current?.isConnected) { event.preventDefault(); confirmTrigger.current.focus(); } }}
            title={confirmCopy?.[0]} description={confirmCopy?.[1]} confirmLabel={confirmCopy?.[2]}
            onConfirm={() => confirm === "reload" ? load() : write(confirm)} destructive={confirm === "discard"} />
        </>}
      </div>
    </main>
  );
}
