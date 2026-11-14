"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { ConfirmModal } from "@/components/ui/modal";
import { useConnection, usePresence } from "@/lib/realtime/client";
import { LAYERS, changedLayers } from "@/lib/struktur-cms/schema";
import { findRedundancy, peopleIssues } from "@/lib/struktur-cms/lint";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { LanyardToaster, useLanyard } from "./lanyard-toast";
import { BaganLoader, CanvasSkeleton } from "./bagan-loader";
import { Canvas } from "./canvas";
import { LayerPanel, OverviewPanel, PersonPanel } from "./inspector";
import { LayerRail, PreviewDock, StatusRibbon, Toolbar } from "./chrome";
import { HistoryModal, PublishModal } from "./modals";
import { fid } from "./fields";
import { addChild, blankPerson, duplicate, moveTo, promote, removePerson, shift, useBagan } from "./use-bagan";

/**
 * Studio Bagan — CMS halaman Struktur Organisasi.
 * Tiga zona: rel lapisan (kiri), kanvas pohon yang bisa digeser/zoom/diseret (tengah),
 * inspektur kaca (kanan; lembar bawah di layar kecil). Semua isi publik ada di salah satu lapisan.
 */
export function StudioBagan() {
  return (
    <LanyardToaster>
      <Workspace />
    </LanyardToaster>
  );
}

function Workspace() {
  const notify = useLanyard();
  const [layer, setLayer] = useState("people");
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(false);
  const [modal, setModal] = useState(null); // publish | history | discard | remove
  const [removing, setRemoving] = useState(null);
  const [conflict, setConflict] = useState(null);
  const canvas = useRef(null);
  const frame = useRef(null);
  const panel = useRef(null);
  const connection = useConnection();

  const postFrame = useCallback((msg) => frame.current?.contentWindow?.postMessage({ source: "studio-bagan", ...msg }, window.location.origin), []);

  const b = useBagan({
    onSaved: () => postFrame({ type: "refresh" }),
    onRemote: ({ type, by }) => {
      if (type === "conflict") setConflict(by);
      if (type === "draft") notify(`${by} mengubah draf`, { tone: "live", detail: "Tampilan diperbarui mengikuti perubahan terbarunya." });
      if (type === "published") notify(`${by} mengesahkan versi baru`, { tone: "live" });
    },
  });
  const { members, me } = usePresence("presence-studio", Boolean(b.doc));
  const v = b.value;
  const people = v?.people ?? [];

  /* ── pemeriksa ── */
  const lint = useMemo(() => (v ? findRedundancy(v) : []), [v]);
  const issues = useMemo(() => peopleIssues(people), [people]);
  const flagged = useMemo(() => new Set(lint.flatMap((r) => [r.a.path, r.b.path])), [lint]);
  const changed = useMemo(() => (b.doc && v ? changedLayers(b.doc.live, v) : []), [b.doc, v]);

  const index = people.findIndex((p) => p.key === selected);
  const person = index >= 0 ? people[index] : null;

  /* ── operasi pohon ── */
  const setPeople = useCallback((next) => b.replace({ ...b.value, people: next }), [b]);
  const actions = useMemo(
    () => ({
      add: (parent, group = "main") => {
        const r = addChild(people, parent, group);
        setPeople(r.people);
        setSelected(r.key);
        setLayer("people");
        setTimeout(() => {
          canvas.current?.focus(r.key);
          document.getElementById(fid(`people.${r.people.findIndex((p) => p.key === r.key)}.name`))?.select();
        }, 80);
      },
      move: (key, parent, group) => {
        const next = moveTo(people, key, parent, group);
        if (!next) return notify("Tidak bisa dipindah ke bawahannya sendiri", { tone: "warn" });
        setPeople(next);
        const who = people.find((p) => p.key === key)?.name;
        const to = group === "staff" ? "jalur staf" : people.find((p) => p.key === parent)?.name;
        notify(`${who} kini melapor ke ${to}`, { tone: "info", action: { label: "Urungkan", onClick: b.undo } });
      },
      duplicate: (key) => {
        const r = duplicate(people, key);
        if (!r) return;
        setPeople(r.people);
        setSelected(r.key);
      },
      shift: (key, dir) => {
        const next = shift(people, key, dir);
        if (next) setPeople(next);
      },
      promote: (key) => {
        const next = promote(people, key);
        if (!next) return;
        setPeople(next);
        notify(`${people.find((p) => p.key === key)?.name} kini di puncak bagan`, { tone: "info", action: { label: "Urungkan", onClick: b.undo } });
        setTimeout(() => canvas.current?.fit(), 60);
      },
      remove: (key) => {
        if (!people.find((p) => p.key === key)?.reportsTo) return notify("Puncak bagan tidak bisa dihapus", { tone: "warn", detail: "Jadikan orang lain puncak terlebih dahulu." });
        setRemoving(key);
        setModal("remove");
      },
    }),
    [people, setPeople, notify, b.undo]
  );

  const confirmRemove = () => {
    const who = people.find((p) => p.key === removing);
    const next = removePerson(people, removing);
    setModal(null);
    if (!next) return;
    setPeople(next);
    setSelected(null);
    notify(`${who?.name ?? "Orang"} dihapus dari bagan`, { tone: "warn", detail: "Bawahannya naik satu tingkat.", action: { label: "Urungkan", onClick: b.undo } });
  };

  /* ── melompat ke field bermasalah ── */
  const jump = useCallback(
    (path) => {
      const m = /^people\.(\d+)/.exec(path);
      if (m) {
        const p = people[Number(m[1])];
        setLayer("people");
        if (p) {
          setSelected(p.key);
          canvas.current?.focus(p.key);
        }
      } else {
        const top = path.split(".")[0];
        setLayer(LAYERS.some((l) => l.key === top) ? top : "people");
        setSelected(null);
      }
      setTimeout(() => {
        const el = document.getElementById(fid(path));
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.focus?.();
      }, 120);
    },
    [people]
  );

  /* ── pita status ── */
  const ribbon = useMemo(() => {
    const out = [];
    if (conflict)
      out.push({
        id: "conflict",
        tone: "conflict",
        title: `${conflict} juga sedang mengubah draf.`,
        body: "Simpanan Anda bisa menimpa perubahannya.",
        dismissible: false,
        action: {
          label: "Muat versinya",
          onClick: () => {
            setConflict(null);
            b.load();
          },
        },
      });
    lint.slice(0, 3).forEach((r, i) => out.push({ id: `lint-${i}-${r.a.path}`, tone: "warn", title: "Kalimat berulang:", body: `${r.a.label} ↔ ${r.b.label}`, action: { label: "Perbaiki", onClick: () => jump(r.b.path) } }));
    if (issues.length) out.push({ id: `issues-${issues.length}`, tone: "warn", title: `${issues.length} data orang belum lengkap.`, body: issues[0].label, action: { label: "Lihat", onClick: () => jump(issues[0].path) } });
    if (b.doc?.hasLegacy) out.push({ id: "legacy", tone: "info", title: "Isi lama dari database ikut dimuat.", body: "Sahkan sekali agar sepenuhnya dikelola dari studio ini." });
    return out;
  }, [conflict, lint, issues, b, jump]);

  /* ── pratinjau ikut lapisan aktif ── */
  const anchorOf = useCallback((k) => (k === "people" ? "bagan" : LAYERS.find((l) => l.key === k)?.anchor ?? "top"), []);
  useEffect(() => {
    // jembatan di dalam iframe melapor "ready" setelah halaman siap → gulir ke lapisan aktif
    const onMsg = (e) => {
      if (e.origin !== window.location.origin || e.data?.source !== "home-preview" || e.data.type !== "ready") return;
      postFrame({ type: "scroll", anchor: anchorOf(layer) });
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [layer, postFrame, anchorOf]);
  useEffect(() => {
    if (!preview) return;
    const anchor = layer === "people" ? "bagan" : LAYERS.find((l) => l.key === layer)?.anchor ?? "top";
    postFrame({ type: "scroll", anchor });
  }, [layer, preview, postFrame]);

  /* ── inspektur masuk saat isi berganti ── */
  useEffect(() => {
    if (!panel.current || prefersReducedMotion()) return;
    gsap.fromTo(panel.current.children, { x: 18, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, stagger: 0.03, ease: "expo.out" });
  }, [layer, selected]);

  /* ── terbit / buang / pulihkan ── */
  const doPublish = async () => {
    try {
      const published = await b.publish();
      setConflict(null);
      postFrame({ type: "refresh" });
      if (!published) notify("Tidak ada perubahan untuk disahkan", { tone: "info" });
    } catch (e) {
      notify("Gagal mengesahkan", { tone: "error", detail: e.message });
      throw e;
    }
  };
  const doDiscard = async () => {
    try {
      await b.discard();
      setModal(null);
      setSelected(null);
      postFrame({ type: "refresh" });
      notify("Draf dibuang", { tone: "info", detail: "Kembali ke versi yang sedang tayang." });
    } catch (e) {
      notify("Gagal membuang draf", { tone: "error", detail: e.message });
    }
  };
  const doRestore = async (i) => {
    try {
      await b.restore(i);
      notify("Versi lama dipulihkan ke draf", { tone: "ok", detail: "Sahkan untuk menayangkannya." });
    } catch (e) {
      notify("Gagal memulihkan", { tone: "error", detail: e.message });
    }
  };

  /* ── pintasan papan ketik ── */
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        b.flush()
          .then(() => notify("Draf tersimpan", { tone: "ok" }))
          .catch((err) => notify("Gagal menyimpan", { tone: "error", detail: err.message }));
      } else if (mod && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setPreview((x) => !x);
      } else if (mod && e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        e.shiftKey ? b.redo() : b.undo();
      } else if (!typing && !mod) {
        if (e.key === "Escape") setSelected(null);
        if ((e.key === "Delete" || e.key === "Backspace") && selected) actions.remove(selected);
        if (e.key.toLowerCase() === "n" && selected) actions.add(selected);
        if (e.key.toLowerCase() === "f") canvas.current?.fit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [b, selected, actions, notify]);

  // peringatan tutup tab saat masih mengetik / menyimpan
  useEffect(() => {
    if (b.status !== "typing" && b.status !== "saving") return;
    const guard = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [b.status]);

  // galat autosave
  useEffect(() => {
    if (b.status === "error") notify("Draf gagal tersimpan", { tone: "error", detail: "Periksa koneksi lalu tekan Ctrl+S.", action: { label: "Coba lagi", onClick: () => b.flush().catch(() => {}) } });
  }, [b.status]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── memuat / galat ── */
  if (b.error && !v)
    return (
      <Shell>
        <div className="grid flex-1 place-items-center px-6 text-center">
          <div>
            <p className="font-serif text-2xl text-white">Studio tidak bisa dibuka</p>
            <p className="mt-2 text-[14px] text-white/50">{b.error}</p>
            <button type="button" onClick={b.load} className="mt-6 rounded-xl bg-gold px-5 py-2.5 text-[14px] font-semibold text-navy">
              Coba lagi
            </button>
          </div>
        </div>
      </Shell>
    );
  if (!v)
    return (
      <Shell>
        <div className="grid flex-1 place-items-center">
          <div className="flex flex-col items-center gap-14">
            <BaganLoader label="Membuka Studio Bagan…" />
            <CanvasSkeleton />
          </div>
        </div>
      </Shell>
    );

  const textLayer = layer !== "people";
  const layerMeta = LAYERS.find((l) => l.key === layer);

  return (
    <Shell>
      <Toolbar
        status={b.status}
        dirty={b.dirty}
        canUndo={b.canUndo}
        onUndo={b.undo}
        onRedo={b.redo}
        onHistory={() => setModal("history")}
        onPreview={() => setPreview((x) => !x)}
        previewOn={preview}
        onDiscard={() => setModal("discard")}
        onPublish={() => b.flush().catch(() => {}).finally(() => setModal("publish"))}
        connection={connection}
        members={members}
        me={me}
      />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <LayerRail
          active={layer}
          changed={changed}
          onChange={(k) => {
            setLayer(k);
            if (k !== "people") setSelected(null);
          }}
        />

        <main className="relative min-h-0 flex-1">
          <StatusRibbon items={ribbon} />
          <div className={cn("absolute inset-0 transition-[opacity,filter] duration-500", textLayer && "opacity-40 blur-[1px] lg:opacity-30")}>
            <Canvas
              ref={canvas}
              people={people}
              selected={selected}
              issues={issues}
              divisions={v.chart.divisions}
              onSelect={(k) => {
                setSelected(k);
                if (k) setLayer("people");
              }}
              onAdd={(parent, group) => (parent ? actions.add(parent, group) : setPeople([blankPerson([], "")]))}
              onMove={actions.move}
            />
          </div>
        </main>

        {/* inspektur: panel kanan (lg) / lembar bawah (kecil) */}
        <aside
          aria-label="Inspektur"
          className={cn(
            "z-20 flex flex-col border-white/[0.07] bg-[#0d1529]/95 backdrop-blur-xl",
            "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:max-h-[68vh] max-lg:rounded-t-3xl max-lg:border-t max-lg:shadow-[0_-30px_60px_-20px_rgb(0_0_0/0.6)]",
            "lg:relative lg:border-l lg:transition-[width] lg:duration-500 lg:ease-cinematic",
            textLayer ? "lg:w-[460px]" : "lg:w-[380px]",
            !textLayer && !person && "max-lg:hidden"
          )}
        >
          <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-3.5">
            <span className="mx-auto h-1 w-10 rounded-full bg-white/15 lg:hidden" />
            <div className="min-w-0 max-lg:hidden">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/35">{textLayer ? "Lapisan" : person ? "Kartu orang" : "Ringkasan"}</p>
              <p className="truncate text-[14px] font-medium text-white">{textLayer ? layerMeta.label : person ? person.name : "Bagan organisasi"}</p>
            </div>
            {(person || textLayer) && (
              <button
                type="button"
                aria-label="Tutup inspektur"
                onClick={() => {
                  setSelected(null);
                  setLayer("people");
                }}
                className="ml-auto grid size-7 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <div ref={panel} className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-10">
            {textLayer ? (
              <LayerPanel layer={layer} value={v} people={people} update={b.update} flag={(p) => flagged.has(p)} />
            ) : person ? (
              <PersonPanel key={person.key} people={people} person={person} index={index} update={b.update} flags={[...flagged]} notify={notify} actions={actions} divisions={v.chart.divisions} />
            ) : (
              <OverviewPanel people={people} onAddRoot={() => setPeople([blankPerson([], "")])} />
            )}
          </div>
        </aside>
      </div>

      <PreviewDock open={preview} onClose={() => setPreview(false)} frameRef={frame} onReady={() => {}} />

      <PublishModal open={modal === "publish"} onOpenChange={(o) => setModal(o ? "publish" : null)} live={b.doc?.live} value={v} lint={lint} issues={issues} onPublish={doPublish} />
      <HistoryModal open={modal === "history"} onOpenChange={(o) => setModal(o ? "history" : null)} history={b.doc?.history} onRestore={doRestore} />
      <ConfirmModal
        open={modal === "discard"}
        onOpenChange={(o) => setModal(o ? "discard" : null)}
        title="Buang seluruh draf?"
        description="Semua perubahan yang belum disahkan hilang dan studio kembali ke versi yang sedang tayang."
        confirmLabel="Buang draf"
        destructive
        onConfirm={doDiscard}
      />
      <ConfirmModal
        open={modal === "remove"}
        onOpenChange={(o) => setModal(o ? "remove" : null)}
        title={`Hapus ${people.find((p) => p.key === removing)?.name ?? "orang ini"}?`}
        description={
          people.some((p) => p.reportsTo === removing)
            ? "Bawahannya akan naik melapor ke atasan orang ini. Perubahan masih bisa diurungkan sebelum disahkan."
            : "Perubahan masih bisa diurungkan sebelum disahkan."
        }
        confirmLabel="Hapus"
        destructive
        onConfirm={confirmRemove}
      />
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#080e1d] text-white [color-scheme:dark]">
      <span aria-hidden className="pointer-events-none fixed -left-40 top-20 size-[520px] rounded-full bg-maroon/20 blur-[140px]" />
      <span aria-hidden className="pointer-events-none fixed -right-40 bottom-0 size-[480px] rounded-full bg-gold/[0.07] blur-[140px]" />
      {children}
    </div>
  );
}
