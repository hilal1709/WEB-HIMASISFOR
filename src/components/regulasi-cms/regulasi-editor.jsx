"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { animate } from "animejs";
import { useReducedMotion } from "motion/react";
import { A11y, FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/banner";
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalTitle } from "@/components/ui/modal";
import { AosReady } from "@/components/motion/aos-provider";
import { LordIcon } from "@/components/media/lord-icon";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { RegulasiFields, SECTIONS } from "./fields";
import { PreviewPane } from "./preview-pane";
import { useRegulasiEditor } from "./use-regulasi-editor";
import styles from "./regulasi-editor.module.css";

const STATUS = {
  loading: "Memuat naskah", ready: "Versi publik", dirty: "Perubahan belum tersimpan",
  saving: "Menyimpan draf", saved: "Draf tersimpan", conflict: "Konflik revisi", error: "Perlu ditinjau",
};

const confirmCopy = {
  publish: ["Terbitkan naskah?", "Versi ini akan langsung tampil di halaman Regulasi Akademik.", "Terbitkan"],
  discard: ["Buang draf?", "Perubahan dalam draf akan dihapus dan editor kembali ke versi publik.", "Buang draf"],
  reload: ["Muat revisi dari server?", "Isian yang belum tersimpan di perangkat ini akan dilepas.", "Muat revisi"],
  keep: ["Ganti draf di server?", "Isian di layar ini akan disimpan sebagai draf terbaru. Versi publik tetap tersedia.", "Gunakan isian saya"],
};

function ManuscriptLoader() {
  const ref = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const animation = animate(ref.current.querySelectorAll("[data-loader-line]"), {
      scaleX: [0.25, 1], opacity: [0.3, 1], delay: (_, index) => index * 95, duration: 720,
      alternate: true, loop: true, ease: "inOutSine",
    });
    return () => animation.revert();
  }, []);
  return (
    <div role="status" ref={ref} className="flex min-h-56 items-center justify-center gap-5 text-sm text-navy/75">
      <span aria-hidden className="grid w-9 gap-1.5 border-l border-gold pl-2">
        {[0, 1, 2].map((index) => <span key={index} data-loader-line className="h-px w-full origin-left bg-maroon" />)}
      </span>
      Memuat naskah
    </div>
  );
}

function SectionIndex({ active, onChange }) {
  const row = (item) => (
    <button
      type="button"
      onClick={() => onChange(item.key)}
      aria-current={item.key === active ? "true" : undefined}
      className={cn(styles.indexButton, "whitespace-nowrap px-3 py-3 text-sm font-semibold md:px-4", item.key === active ? "text-maroon" : "text-navy/75 hover:text-maroon")}
    >
      {item.title}
    </button>
  );
  return (
    <nav aria-label="Bagian naskah" className={styles.index}>
      <div className="hidden flex-wrap md:flex">{SECTIONS.map((item) => <span key={item.key}>{row(item)}</span>)}</div>
      <Swiper modules={[FreeMode, A11y]} freeMode slidesPerView="auto" speed={0} className="md:!hidden">
        {SECTIONS.map((item) => <SwiperSlide className="!w-auto" key={item.key}>{row(item)}</SwiperSlide>)}
      </Swiper>
    </nav>
  );
}

function Confirmation({ action, busy, onCancel, onConfirm }) {
  const content = confirmCopy[action];
  return (
    <Modal open={Boolean(content)} onOpenChange={(open) => !open && !busy && onCancel()}>
      {content && (
        <ModalContent
          className="max-w-[29rem] border-gold/40 bg-cream px-7 pb-6 pt-8 sm:px-8"
          onEscapeKeyDown={(event) => { if (busy) event.preventDefault(); }}
          onPointerDownOutside={(event) => { if (busy) event.preventDefault(); }}
        >
          <ModalTitle className="pr-6 text-[1.7rem] text-maroon">{content[0]}</ModalTitle>
          <ModalDescription className="mt-2 text-navy/80">{content[1]}</ModalDescription>
          <ModalFooter>
            <Button type="button" variant="outline-navy" onClick={onCancel} disabled={Boolean(busy)} autoFocus>Batal</Button>
            <Button type="button" variant={action === "discard" ? "destructive" : "maroon"} onClick={onConfirm} loading={Boolean(busy)}>{content[2]}</Button>
          </ModalFooter>
        </ModalContent>
      )}
    </Modal>
  );
}

const time = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });

export function RegulasiEditor() {
  const editor = useRegulasiEditor();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [section, setSection] = useState(SECTIONS[0].key);
  const [pane, setPane] = useState("editor");
  const [action, setAction] = useState("");
  const [toast, setToast] = useState(null);
  const fieldwork = useRef(null);
  const isLoaded = Boolean(editor.value);
  const sectionInfo = SECTIONS.find((item) => item.key === section);
  const changed = editor.unsaved || Boolean(editor.snapshot?.draftAt);
  const blocked = editor.status === "conflict" || Boolean(editor.busy);

  useEffect(() => {
    if (!fieldwork.current || prefersReducedMotion()) return;
    const motion = gsap.fromTo(fieldwork.current, { y: 4, opacity: 0.82 }, { y: 0, opacity: 1, duration: 0.23, ease: "power2.out", clearProps: "transform,opacity" });
    return () => motion.revert();
  }, [section, isLoaded]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timeout);
  }, [toast]);

  const confirm = async () => {
    const done = await editor.act(action);
    setAction("");
    if (!done) return;
    const messages = { publish: "Regulasi sudah terbit", discard: "Draf dibuang", reload: "Revisi server dimuat", keep: "Isian disimpan sebagai draf" };
    setToast({ text: messages[action] });
  };

  return (
    <div className={cn(styles.studio, "min-h-screen bg-cream text-navy selection:bg-gold/35")}>
      <header className="border-b border-line bg-[#fcf9f3]">
        <div className={cn(styles.frame, "grid gap-4 pb-5 pt-4 sm:pt-5")}>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
            <Link
              href="/admin/dashboard"
              prefetch={false}
              onNavigate={(event) => {
                if (!editor.unsaved) return;
                event.preventDefault();
                editor.flush().then((saved) => { if (saved) router.push("/admin/dashboard"); });
              }}
              className="font-medium text-maroon underline-offset-4 hover:underline"
            >
              Kembali ke dashboard
            </Link>
            <a href="/regulasi-akademik" target="_blank" rel="noreferrer" className="font-medium text-maroon underline-offset-4 hover:underline">Buka halaman publik</a>
          </div>
          <div data-aos="fade-up" data-aos-duration="250" data-aos-offset="0" className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-[2rem] leading-tight tracking-tight text-maroon sm:text-[2.65rem]">Regulasi Akademik</h1>
              {editor.value && <p className="mt-1.5 text-xs tabular-nums text-navy/75">
                {editor.snapshot.publishedAt ? `Terbit ${time.format(new Date(editor.snapshot.publishedAt))} WIB` : "Versi awal"}
                {editor.snapshot.draftAt && <span> · Draf {time.format(new Date(editor.snapshot.draftAt))} WIB</span>}
              </p>}
            </div>
            {editor.value && (
              <div className="flex flex-wrap items-center gap-2" aria-label="Tindakan penerbitan">
                <span role="status" className="mr-1 flex min-h-8 items-center gap-2 text-xs font-medium text-navy/80">
                  <span aria-hidden className={cn("size-1.5 rounded-full", editor.status === "saved" ? "bg-success" : editor.status === "ready" ? "bg-navy/45" : "bg-maroon")} />
                  {STATUS[editor.status]}
                </span>
                <Button type="button" size="sm" variant="outline-navy" disabled={!editor.unsaved || blocked || editor.status === "saving"} onClick={editor.flush}>Simpan draf</Button>
                <Button type="button" size="sm" variant="maroon" disabled={!changed || blocked} onClick={() => setAction("publish")} className="group">
                  {!reducedMotion && <LordIcon name="document" size={16} target=".group" colors="primary:#ffffff,secondary:#d9b23a" />} Terbitkan
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={cn(styles.frame, "pb-12")}>
        {editor.error && (
          <Banner variant="danger" className="mt-5 border-l px-4" title={editor.status === "conflict" ? "Revisi server berubah" : "Perubahan perlu ditinjau"}>
            <p>{editor.status === "conflict" ? "Isianmu masih ada di editor. Muat revisi server atau gunakan isianmu sebagai draf terbaru." : editor.error}</p>
            {editor.status === "conflict" ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline-navy" onClick={() => setAction("reload")}>Muat revisi server</Button>
                <Button type="button" size="sm" variant="maroon" onClick={() => setAction("keep")}>Gunakan isian saya</Button>
              </div>
            ) : !editor.value && <Button type="button" size="sm" variant="outline-navy" className="mt-3" onClick={editor.load}>Coba lagi</Button>}
          </Banner>
        )}
        {!editor.value && editor.status === "loading" && <ManuscriptLoader />}
        {editor.value && (
          <>
            <div className="mt-4 flex gap-1 border-b border-line lg:hidden" aria-label="Mode ruang kerja">
              {["editor", "preview"].map((mode) => (
                <button key={mode} type="button" aria-pressed={mode === pane} onClick={() => setPane(mode)} className={cn(styles.indexButton, "px-4 py-3 text-sm font-semibold text-maroon")}>
                  {mode === "editor" ? "Editor" : "Pratinjau"}
                </button>
              ))}
            </div>
            <div className={styles.workspace}>
              <section aria-labelledby="regulasi-field-title" className={cn(styles.manuscript, pane === "preview" && "hidden lg:block")}>
                <SectionIndex active={section} onChange={setSection} />
                <div ref={fieldwork} className="px-4 pb-6 pt-5 sm:px-6 sm:pb-7">
                  <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3">
                    <h2 id="regulasi-field-title" className="font-serif text-[1.6rem] leading-tight text-navy">{sectionInfo.title}</h2>
                    {changed && <button type="button" disabled={blocked} onClick={() => setAction("discard")} className="text-xs font-semibold text-maroon underline-offset-4 hover:underline disabled:opacity-45">Buang draf</button>}
                  </div>
                  <fieldset key={section} disabled={Boolean(editor.busy)} className="grid min-w-0 gap-7">
                    <RegulasiFields section={section} value={editor.value} curriculum={editor.snapshot.curriculum} onChange={editor.update} />
                  </fieldset>
                </div>
              </section>
              <div className={cn(styles.proof, pane === "editor" && "hidden lg:block")}>
                <PreviewPane value={editor.value} anchor={sectionInfo.anchor} />
              </div>
            </div>
          </>
        )}
      </main>

      <Confirmation action={action} busy={editor.busy} onCancel={() => setAction("")} onConfirm={confirm} />
      {toast && (
        <div className={cn(styles.toast, "fixed inset-x-4 bottom-4 z-[105] flex max-w-sm items-center justify-between gap-4 rounded-md bg-navy px-4 py-3 text-sm text-white sm:left-auto sm:right-6")}>
          <span role="status">{toast.text}</span>
          <button type="button" aria-label="Tutup notifikasi" onClick={() => setToast(null)} className="min-h-8 font-semibold text-gold-soft underline-offset-4 hover:underline">Tutup</button>
        </div>
      )}
      <AosReady />
    </div>
  );
}
