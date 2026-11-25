"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ChevronRight, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/banner";
import { ConfirmModal } from "@/components/ui/modal";
import { BrandLoader } from "@/components/ui/loader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { SectionFields } from "./fields";
import { useJalurEditor } from "./use-jalur-editor";

const SECTIONS = [
  { id: "identity", title: "Identitas halaman", detail: "Pembuka, breadcrumb, metadata, dan judul animasi masuk." },
  { id: "paths", title: "Jalur & tahapan", detail: "Kelola pilihan jalur, ilustrasi, langkah, dan persyaratan." },
  { id: "academic", title: "Data akademik", detail: "Atur sumber data tugas akhir dan mata kuliah prasyarat." },
  { id: "readiness", title: "Cek kesiapan", detail: "Atur checklist per jalur dan pesan yang muncul saat mahasiswa mengisinya." },
  { id: "sections", title: "Cerita & perbandingan", detail: "Atur judul, isi pengantar, dan visibilitas bagian di halaman." },
  { id: "notice", title: "Banner", detail: "Tampilkan pengumuman tugas akhir dengan tautan ke informasi lengkap." },
  { id: "closing", title: "Penutup", detail: "Atur rujukan yang bisa dibuka mahasiswa setelah memilih jalur." },
  { id: "labels", title: "Label dialog", detail: "Atur teks pada ringkasan jalur, detail tahap, dan penanda konten contoh." },
];

const STATUS = {
  loading: "Memuat konten", ready: "Sesuai versi publik", dirty: "Menunggu disimpan",
  saving: "Menyimpan draf…", saved: "Draf tersimpan", conflict: "Draf berubah di server", error: "Perlu ditinjau",
};

const TIME = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });

function PreviewFrame({ revision, onBack }) {
  const [mode, setMode] = useState("desktop");
  const frameWidth = mode === "desktop" ? 1366 : 390;
  const frameHeight = 780;
  const [available, setAvailable] = useState(0);
  const stage = useRef(null);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setAvailable(entry.contentRect.width));
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  const scale = Math.min(available / frameWidth, 1);

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline-navy" onClick={onBack}><ArrowLeft className="size-4" />Kembali ke editor</Button>
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList aria-label="Ukuran layar pratinjau" className="h-auto rounded-md border border-line bg-white">
            <TabsTrigger value="desktop" className="gap-2 rounded-sm px-3 text-navy data-[state=active]:bg-maroon data-[state=active]:text-white"><Monitor className="size-4" />Desktop</TabsTrigger>
            <TabsTrigger value="mobile" className="gap-2 rounded-sm px-3 text-navy data-[state=active]:bg-maroon data-[state=active]:text-white"><Smartphone className="size-4" />Ponsel</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div ref={stage} className="flex justify-center">
        <div className="relative overflow-hidden rounded-lg border border-navy/15 bg-white shadow-[0_18px_55px_-42px_#14213d]" style={{ width: frameWidth * scale, height: frameHeight * scale }}>
          <iframe
            title={`Pratinjau Jalur Kelulusan ${mode === "desktop" ? "desktop" : "ponsel"}`}
            src={`/admin/jalur-kelulusan/pratinjau?rev=${encodeURIComponent(revision)}`}
            width={frameWidth} height={frameHeight}
            className="absolute inset-0 max-w-none origin-top-left border-0"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </section>
  );
}

export function JalurEditor() {
  const editor = useJalurEditor();
  const { document: data, value, status, error, update, hasUnsaved } = editor;
  const toast = useToast();
  const router = useRouter();
  const [sectionId, setSectionId] = useState(SECTIONS[0].id);
  const [selected, setSelected] = useState("");
  const [action, setAction] = useState(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const title = useRef(null);
  const section = SECTIONS.find(({ id }) => id === sectionId);
  const sectionNumber = SECTIONS.findIndex(({ id }) => id === sectionId) + 1;

  const changeSection = (id) => {
    setSectionId(id);
    requestAnimationFrame(() => title.current?.focus({ preventScroll: false }));
  };

  const confirmRemove = (name, remove) => setAction({
    title: "Hapus dari draf?",
    description: `“${name}” akan dihapus saat perubahan ini diterbitkan. Gunakan pilihan sembunyikan jika ingin tetap menyimpannya.`,
    confirmLabel: "Hapus dari draf", destructive: true, run: remove,
  });

  const publish = () => setAction({
    title: "Terbitkan perubahan?",
    description: "Versi ini akan langsung tampil di halaman Jalur Kelulusan.", confirmLabel: "Terbitkan",
    run: async () => {
      if (await editor.publish()) toast.success("Jalur Kelulusan diterbitkan", {
        action: { label: "Lihat halaman", onClick: () => window.open("/jalur-kelulusan", "_blank", "noopener,noreferrer") },
      });
    },
  });

  const previewPage = async () => {
    setBusy(true);
    if (await editor.flush()) setPreview(true);
    setBusy(false);
  };

  const leave = (event) => {
    if (!hasUnsaved) return;
    event.preventDefault();
    setAction({ title: "Tinggalkan editor?", description: "Perubahan yang belum tersimpan akan hilang.", confirmLabel: "Tinggalkan", destructive: true, run: () => router.push("/admin/dashboard") });
  };

  const issue = status === "conflict" ? <Banner variant="warning" title="Admin lain menyimpan perubahan">
    <p>Perubahanmu masih ada di editor. Pilih draf yang ingin dipakai.</p>
    <div className="mt-3 flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="maroon" onClick={() => setAction({ title: "Gunakan perubahanmu?", description: "Draf di server akan diganti dengan perubahan di editor ini.", confirmLabel: "Gunakan draf saya", run: editor.keepLocal })}>Gunakan draf saya</Button>
      <Button type="button" size="sm" variant="outline-navy" onClick={() => setAction({ title: "Muat draf server?", description: "Perubahan yang belum tersimpan di editor ini akan hilang.", confirmLabel: "Muat draf server", destructive: true, run: editor.load })}>Muat draf server</Button>
    </div>
  </Banner> : error && <Banner variant="danger" title={error}>
    {hasUnsaved && <Button type="button" size="sm" variant="outline-navy" onClick={editor.flush}>Coba simpan lagi</Button>}
    {!value && <Button type="button" size="sm" variant="outline-navy" onClick={editor.load}>Muat ulang konten</Button>}
  </Banner>;

  return (
    <div className="min-h-screen bg-cream text-navy selection:bg-gold/30">
      <header className="relative overflow-hidden border-b border-gold/45 bg-maroon-deep text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-32 hidden size-96 rounded-full border border-gold/20 lg:block"><div className="absolute inset-9 rounded-full border border-gold/20"><div className="absolute inset-9 rounded-full border border-gold/20" /></div><span className="absolute bottom-16 left-14 size-3 rounded-full bg-gold" /></div>
        <div className="relative mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-x-6 gap-y-5 px-4 pb-7 pt-5 sm:px-8 sm:pb-9">
          <div>
            <Link href="/admin/dashboard" onClick={leave} className="inline-flex min-h-8 items-center gap-2 text-sm font-medium text-gold-soft underline-offset-4 hover:underline"><ArrowLeft className="size-4" />Dashboard</Link>
            <h1 className="mt-3 font-serif text-[clamp(2rem,5vw,3.5rem)] leading-tight">Jalur <em className="font-normal text-gold-soft">Kelulusan</em></h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85">Ruang untuk menyusun informasi dan tahapan menuju kelulusan.</p>
          </div>
          <a href="/jalur-kelulusan" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 border-b border-white/35 text-sm font-medium text-white underline-offset-4 hover:text-gold-soft">
            Lihat versi publik <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </header>

      {preview ? <PreviewFrame revision={data.revision} onBack={() => setPreview(false)} /> : (
        <div className="mx-auto grid min-h-[65vh] max-w-[1440px] grid-cols-1 md:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[19rem_minmax(0,1fr)]">
          <nav aria-label="Bagian editor Jalur Kelulusan" className="min-w-0 border-b border-line bg-cream md:border-b-0 md:border-r">
            <div className="md:sticky md:top-0 md:px-5 md:py-8 xl:px-7">
            <div className="hidden items-baseline justify-between px-3 pb-4 md:flex"><h2 className="font-serif text-lg">Bagian halaman</h2><span className="text-xs tabular-nums text-text/75">{sectionNumber} / {SECTIONS.length}</span></div>
            <ul className="flex gap-2 overflow-x-auto px-4 py-3 md:flex-col md:gap-1 md:overflow-visible md:p-0">
              {SECTIONS.map((entry, index) => (
                <li key={entry.id} className="shrink-0">
                  <button type="button" aria-current={entry.id === section.id ? "true" : undefined} onClick={() => changeSection(entry.id)} className="group flex min-h-12 w-full items-center gap-3 rounded-md border border-line bg-white/60 px-3 py-2 text-left text-sm font-semibold text-navy transition-colors hover:border-maroon/30 hover:bg-white focus-visible:outline-2 focus-visible:outline-maroon aria-[current=true]:border-maroon aria-[current=true]:bg-maroon aria-[current=true]:text-white md:border-transparent md:bg-transparent">
                    <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full border border-current/30 text-xs font-medium tabular-nums group-aria-[current=true]:border-gold-soft group-aria-[current=true]:text-gold-soft">{String(index + 1).padStart(2, "0")}</span>
                    <span className="flex-1">{entry.title}</span><ChevronRight className="hidden size-4 opacity-0 group-hover:opacity-100 group-aria-[current=true]:opacity-100 md:block" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            </div>
          </nav>

          <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-9 xl:px-13">
            <div className="mx-auto max-w-4xl">
              {issue && <div className="mb-6">{issue}</div>}
              {status === "loading" && !value && <div className="grid min-h-72 place-items-center"><BrandLoader label="Memuat editor Jalur Kelulusan…" /></div>}
              {value && <div key={section.id} className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
                <div className="flex items-start gap-4 border-b border-line pb-6 sm:gap-5">
                  <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full border border-gold bg-white font-serif text-lg text-maroon tabular-nums sm:size-14">{String(sectionNumber).padStart(2, "0")}</span>
                  <div><h2 ref={title} tabIndex={-1} className="font-serif text-3xl leading-tight outline-none sm:text-4xl">{section.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text/75">{section.detail}</p></div>
                </div>
                <fieldset disabled={busy} className="mt-6 min-w-0 space-y-4">
                  <SectionFields section={section.id} value={value} update={update} courses={data.courses} selected={selected} setSelected={setSelected} confirmRemove={confirmRemove} />
                </fieldset>
              </div>}
            </div>
          </main>
        </div>
      )}

      <footer className="sticky bottom-0 z-20 border-t border-line bg-white shadow-[0_-12px_30px_-25px_#14213d]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div role="status" className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-navy sm:text-sm">
            <span aria-hidden="true" className={`size-2 rounded-full ${status === "ready" || status === "saved" ? "bg-[#376549]" : status === "error" || status === "conflict" ? "bg-maroon" : "bg-gold"}`} />
            <span>{STATUS[status]}</span>
            {data?.publishedAt && <span className="text-text/75">· Terbit {TIME.format(new Date(data.publishedAt))} WIB</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {!preview && <Button type="button" variant="outline-navy" onClick={previewPage} disabled={!value || busy || status === "conflict"}>Pratinjau</Button>}
            <Button type="button" variant="maroon" onClick={publish} disabled={!value || busy || status === "conflict" || (status === "ready" && Boolean(data?.publishedAt))}>Terbitkan</Button>
          </div>
        </div>
      </footer>

      <ConfirmModal
        open={Boolean(action)} onOpenChange={(open) => { if (!open && !busy) setAction(null); }}
        title={action?.title} description={action?.description} confirmLabel={action?.confirmLabel} destructive={action?.destructive} loading={busy}
        onConfirm={async () => {
          setBusy(true);
          try { await action.run(); } finally { setBusy(false); setAction(null); }
        }}
      />
    </div>
  );
}
