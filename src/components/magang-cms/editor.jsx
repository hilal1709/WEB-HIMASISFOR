"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AOS from "aos";
import { animate, stagger } from "animejs";
import { Flip } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { BLOCKS } from "@/lib/magang-cms/schema";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/banner";
import { ConfirmModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { LordIcon } from "@/components/media/lord-icon";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";
import { BlockFields, OrderButton, reordered } from "./fields";
import { PreviewMagang } from "./preview";
import styles from "./editor.module.css";

const API = "/api/magang-cms";
const DATES = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });
const SUCCESS = { save: "Draf Magang tersimpan", publish: "Halaman Magang diterbitkan", discard: "Draf Magang dibuang" };
const METHOD = { save: "PUT", publish: "POST", discard: "DELETE" };
const INITIAL = [{ key: "hero", visible: true, fixed: true }];

function Skeleton() {
  const list = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const animation = animate(list.current.children, { opacity: [0.4, 1], duration: 800, delay: stagger(65), loop: true, alternate: true, ease: "inOutSine" });
    return () => animation.revert();
  }, []);
  return <div role="status">
    <span className="sr-only">Memuat konten Magang…</span>
    <div ref={list} aria-hidden className="space-y-3">{Object.keys(BLOCKS).map((key, i) => (
      <div key={key} className="flex h-[4.75rem] items-center justify-between gap-2 border-b border-navy/15 px-4">
        <div className="h-4 rounded bg-navy/12" style={{ width: 28 - i * 2 + "%" }} />
        <div className="h-3 w-20 rounded bg-navy/10" />
      </div>
    ))}</div>
  </div>;
}

function blockSummary(key, value) {
  if (key === "routes") return value.routes.length + " jalur";
  if (key === "jobs") return value.jobs.length + " lowongan";
  if (key === "logbook") return value.logbook.length + " bab · " + value.docs.length + " berkas";
  if (key === "closing") return value.stops.length + " tautan";
  if (key === "tracker") return "Tersimpan di perangkat mahasiswa";
  return "";
}

export function MagangEditor({ assets }) {
  const toast = useToast();
  const router = useRouter();
  const [snapshot, setSnapshot] = useState(null);
  const [value, setValue] = useState(null);
  const [active, setActive] = useState(null);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState("load");
  const [dialog, setDialog] = useState(null);
  const [preview, setPreview] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const list = useRef(null);
  const previewButton = useRef(null);
  const problem = useRef(null);
  const flip = useRef(null);
  const running = useRef(null);
  const dirty = !!snapshot && JSON.stringify(snapshot.value) !== JSON.stringify(value);
  const conflict = error?.status === 409;

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setBusy("load");
      setError(null);
      try {
        const response = await fetch(API, { cache: "no-store", signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Konten Magang gagal dimuat.");
        if (controller.signal.aborted) return;
        setSnapshot(result.data);
        setValue(result.data.value);
      } catch (failure) {
        if (!controller.signal.aborted) setError({ message: failure.message || "Konten Magang gagal dimuat." });
      } finally {
        if (!controller.signal.aborted) setBusy(null);
      }
    }
    load();
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    if (!dirty) return;
    function warn(event) { event.preventDefault(); event.returnValue = ""; }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (!snapshot) return;
    const timer = requestAnimationFrame(() => AOS.refreshHard());
    return () => cancelAnimationFrame(timer);
  }, [snapshot]);

  useEffect(() => {
    if (error && snapshot) problem.current?.focus();
  }, [error, snapshot]);

  useLayoutEffect(() => {
    if (!flip.current || !list.current) return;
    const state = flip.current;
    flip.current = null;
    const targets = list.current.querySelectorAll("[data-ordered]");
    running.current = Flip.from(state, { targets, duration: 0.35, ease: "power2.out", scale: false, prune: true });
    return () => { running.current?.progress(1).kill(); };
  }, [value?.blocks]);

  function select(key, index) {
    if (active === key) {
      setActive(null);
      return;
    }
    const previous = active === "hero" ? 0 : value.blocks.findIndex((block) => block.key === active) + 1;
    setDirection(index >= previous ? 1 : -1);
    setActive(key);
  }

  function move(index, delta) {
    if (!list.current || busy) return;
    running.current?.progress(1).kill();
    if (!prefersReducedMotion()) flip.current = Flip.getState(list.current.querySelectorAll("[data-ordered]"));
    const blocks = reordered(value.blocks, index, index + delta);
    setValue((current) => ({ ...current, blocks }));
    setAnnouncement(BLOCKS[blocks[index + delta].key] + " sekarang di urutan " + (index + delta + 2) + ".");
  }

  async function write(action, current = snapshot) {
    const response = await fetch(API, {
      method: METHOD[action],
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revision: current.revision, ...(action === "save" && { value }) }),
    });
    const result = await response.json();
    if (!response.ok) {
      const failure = new Error(result.error || "Perubahan gagal diproses.");
      failure.status = response.status;
      throw failure;
    }
    setSnapshot(result.data);
    setValue(result.data.value);
    return result.data;
  }

  async function perform(action) {
    if (busy || !snapshot || conflict) return;
    setBusy(action);
    setError(null);
    try {
      if (action === "preview") {
        if (dirty) await write("save");
        setPreview(true);
      } else {
        const current = action === "publish" && dirty ? await write("save") : snapshot;
        await write(action, current);
        toast.success(SUCCESS[action], { appearance: "brand" });
      }
    } catch (failure) {
      setError({ message: failure.message || "Perubahan gagal diproses.", status: failure.status });
      toast.error(failure.status === 409 ? "Konflik revisi" : "Perubahan belum diproses", { appearance: "brand" });
    } finally {
      setBusy(null);
      setDialog(null);
    }
  }

  const status = !snapshot ? null : dirty
    ? "Perubahan belum disimpan"
    : snapshot.draftAt ? "Draf tersimpan · " + DATES.format(new Date(snapshot.draftAt)) + " WIB"
      : snapshot.publishedAt ? "Terbit · " + DATES.format(new Date(snapshot.publishedAt)) + " WIB" : "Memakai konten awal";

  const blocks = value ? [...INITIAL, ...value.blocks] : [];

  return <main className={styles.editor} aria-busy={!!busy}>
    <header className={styles.masthead}>
      <div className="mx-auto flex max-w-[68rem] items-center justify-between gap-4 px-4 py-4 text-sm sm:px-8">
        <Link href="/admin/dashboard" className="font-semibold underline-offset-4 hover:underline" onNavigate={(event) => {
          if (dirty) { event.preventDefault(); setDialog("leave"); }
        }}>Kembali ke Dashboard</Link>
        <Link href="/magang" target="_blank" rel="noopener noreferrer" className="font-semibold text-gold-soft underline-offset-4 hover:underline">Buka halaman publik</Link>
      </div>
      <div className="mx-auto flex max-w-[68rem] flex-wrap items-end justify-between gap-x-8 gap-y-4 px-4 pb-8 pt-3 sm:px-8 sm:pb-10">
        <div>
          <h1 className="font-serif text-[clamp(2.65rem,7vw,4.15rem)] leading-none tracking-[-0.035em]">CMS Magang</h1>
          {status && <p role="status" className="mt-3 text-sm font-medium tabular-nums text-white/80">{status}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button ref={previewButton} type="button" variant="outline-navy" className="border-white/45 bg-transparent text-white hover:border-white hover:bg-white/10" disabled={!!busy || !snapshot || conflict} onClick={() => perform("preview")}>
            <LordIcon name="document" size={17} colors="primary:#fff8eb,secondary:#e6d3a1" />Pratinjau
          </Button>
          <Button type="button" variant="outline-navy" loading={busy === "save"} disabled={!!busy || !dirty || conflict} onClick={() => perform("save")}>Simpan draf</Button>
          <Button type="button" variant="navy" className="bg-gold-soft text-navy hover:bg-white" disabled={!!busy || !snapshot || (!dirty && !snapshot.draftAt) || conflict} onClick={() => setDialog("publish")}>Terbitkan</Button>
        </div>
      </div>
    </header>

    <div className="mx-auto max-w-[68rem] px-4 pb-16 pt-8 sm:px-8 sm:pt-10">
      {error && <div ref={problem} tabIndex={-1} className="mb-6 rounded-md">
        <Banner variant={conflict ? "warning" : "danger"} title={conflict ? "Versi di server berubah" : "Periksa konten"} className="border-l">
          <p>{error.message}</p>
          {(!snapshot || conflict) && <button type="button" className="mt-2 min-h-8 font-semibold text-maroon underline underline-offset-4" onClick={() => dirty ? setDialog("reload") : setAttempt((i) => i + 1)}>
            {conflict ? "Muat versi terbaru" : "Coba lagi"}
          </button>}
        </Banner>
      </div>}
      {busy === "load" && !value && <Skeleton />}
      {value && <>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-maroon pb-3" data-aos="fade-up" data-aos-duration="350">
          <div>
            <h2 className="font-serif text-3xl leading-tight text-navy">Susunan halaman</h2>
            <p className="mt-1 text-sm text-navy/70">Pilih blok untuk mengedit isinya.</p>
          </div>
          <Button type="button" variant="outline-navy" onClick={() => select("seo", blocks.length)} aria-expanded={active === "seo"} aria-controls="magang-seo" disabled={!!busy}>Pengaturan SEO</Button>
        </div>
        <div id="magang-seo" hidden={active !== "seo"} className="border-x border-b border-gold/70 bg-white/70 p-4 sm:p-6">
          {active === "seo" && <fieldset disabled={!!busy}><BlockFields block="seo" value={value} update={setValue} courses={snapshot.courses} assets={assets} /></fieldset>}
        </div>
        <ol ref={list} className="divide-y divide-navy/20 border-b border-navy/20">
          {blocks.map((block, index) => {
            const title = BLOCKS[block.key];
            const expanded = active === block.key;
            const summary = blockSummary(block.key, value);
            return <li key={block.key} data-flip-id={block.key} data-ordered={!block.fixed || undefined} data-active={expanded} className={styles.block} style={{ "--selection-offset": direction * 5 + "px" }}>
              <div className={styles.blockHeader}>
                <button type="button" className={cn(styles.name, "min-w-0 break-words py-2 text-left font-serif text-[1.45rem] leading-tight transition-colors sm:text-[1.7rem]", expanded && "text-maroon")} aria-expanded={expanded} aria-controls={"blok-" + block.key} onClick={() => select(block.key, index)}>
                  {title}
                </button>
                <p className={cn(styles.status, "my-1 flex flex-col self-start text-xs leading-5 text-navy/75 md:my-0 md:self-auto")}>
                  <span className={cn("font-semibold", !block.visible && "text-maroon")}>{block.fixed ? "Selalu tampil" : block.visible ? "Ditampilkan" : "Disembunyikan"}</span>
                  {summary && <span>{summary}</span>}
                </p>
                <div className="col-start-2 row-start-2 flex shrink-0 flex-wrap items-center justify-end gap-1 md:col-start-auto md:row-start-auto">
                  {!block.fixed && <>
                    <button type="button" aria-label={(block.visible ? "Sembunyikan " : "Tampilkan ") + title} disabled={!!busy} onClick={() => {
                      setValue((current) => ({ ...current, blocks: current.blocks.map((item) => item.key === block.key ? { ...item, visible: !item.visible } : item) }));
                      setAnnouncement(title + (block.visible ? " disembunyikan." : " ditampilkan."));
                    }} className="min-h-10 px-1.5 text-xs font-semibold text-maroon underline-offset-4 hover:underline sm:px-3">
                      {block.visible ? "Sembunyikan" : "Tampilkan"}
                    </button>
                    <OrderButton direction={-1} label={"Naikkan blok " + title} disabled={!!busy || index === 1} onClick={() => move(index - 1, -1)} />
                    <OrderButton direction={1} label={"Turunkan blok " + title} disabled={!!busy || index === blocks.length - 1} onClick={() => move(index - 1, 1)} />
                  </>}
                </div>
              </div>
              <div id={"blok-" + block.key} hidden={!expanded}>
                {expanded && <fieldset disabled={!!busy} className="relative space-y-6 border-t border-navy/15 p-4 sm:p-6">
                  {block.key === "jobs" && !value.jobs.length && <div className="flex max-w-md items-center gap-3 text-sm text-navy/75">
                    <LottieIllustration src="/lottie/briefcase.json" className="size-16 shrink-0" />
                    <p>Daftar posisi kosong. Tambahkan lowongan jika sudah siap diumumkan.</p>
                  </div>}
                  <BlockFields block={block.key} value={value} update={setValue} courses={snapshot.courses} assets={assets} />
                </fieldset>}
              </div>
            </li>;
          })}
        </ol>
        <p role="status" className="sr-only">{announcement}</p>
        {snapshot.draftAt && <button type="button" disabled={!!busy || conflict} onClick={() => setDialog("discard")} className="mt-5 min-h-10 text-sm font-semibold text-maroon underline underline-offset-4 disabled:opacity-50">Buang draf</button>}
      </>}
    </div>

    {dialog && <ConfirmModal
      open
      onOpenChange={(open) => { if (!open && !busy) setDialog(null); }}
      title={dialog === "publish" ? "Terbitkan halaman Magang?" : dialog === "discard" ? "Buang draf Magang?" : dialog === "leave" ? "Kembali ke Dashboard?" : "Muat ulang versi terbaru?"}
      description={dialog === "publish" ? "Pengunjung akan melihat isi dan susunan blok dari pengeditan ini." : dialog === "discard" ? "Isi draf akan kembali ke konten yang sedang tampil di publik." : "Perubahan lokal yang belum tersimpan akan hilang."}
      confirmLabel={dialog === "publish" ? "Terbitkan sekarang" : dialog === "discard" ? "Buang draf" : dialog === "leave" ? "Kembali" : "Muat ulang"}
      destructive={dialog !== "publish"}
      loading={!!busy}
      onConfirm={() => {
        if (dialog === "leave") { router.push("/admin/dashboard"); return; }
        if (dialog !== "reload") { perform(dialog); return; }
        setDialog(null);
        setValue(null);
        setSnapshot(null);
        setAttempt((i) => i + 1);
      }}
    />}
    {preview && snapshot && <PreviewMagang open={preview} onOpenChange={setPreview} revision={snapshot.revision} restoreFocus={() => previewButton.current?.focus()} />}
  </main>;
}
