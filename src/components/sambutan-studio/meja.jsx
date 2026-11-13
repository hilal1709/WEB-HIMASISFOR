"use client";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { animate } from "animejs";
import { useConnection } from "@/lib/realtime/client";
import { CHAPTERS, MASCOT_POSES, BANNER_VARIANTS, changedChapters } from "@/lib/sambutan-cms/schema";
import { findRedundancy } from "@/lib/sambutan-cms/lint";
import { Signature } from "@/components/sambutan/signature";
import { MediaPicker } from "@/components/home-studio/overlays";
import { Spotlight } from "@/components/home-studio/fx";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { PostcardIllustration } from "@/components/illustrations/line-illustrations";
import { ConfirmModal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useMeja } from "./use-meja";
import { PostcardToaster, usePostcard } from "./postcard-toast";
import { ChipList, LinkPair, PaperField, PaperSwitch, fieldDomId } from "./paper-field";
import { ParagraphList } from "./paragraph-list";
import { SignaturePad } from "./signature-pad";
import { PublishModal } from "./publish-modal";
import { ChapterRibbon, Dock, MejaLoader, PaperRibbon, PreviewSheet, ROMAN, chapterId, jumpToField } from "./chrome";

const FOLDERS = {
  image: ["uploads/sambutan", "img/profil", "uploads", "img"],
  lottie: ["lottie", "uploads/sambutan"],
};
const POSE_LABEL = { wave: "Melambai", "thumbs-up": "Jempol", confident: "Yakin", proud: "Bangga", think: "Berpikir", laugh: "Tertawa", run: "Berlari" };
const VARIANT_LABEL = { brand: "Maroon", info: "Netral", success: "Hijau", warning: "Emas" };
const CHAPTER_OF = { person: "hero", signature: "letter" };

/**
 * Meja Sambutan — CMS halaman Sambutan Kaprodi. Isi diedit langsung di atas "kertas surat"
 * yang bergaya sama dengan halaman publik; lima bab, dok mengambang, autosave draf, terbit dengan redline.
 */
export function MejaSambutan() {
  return (
    <PostcardToaster>
      <Desk />
    </PostcardToaster>
  );
}

function Desk() {
  const post = usePostcard();
  const [conflict, setConflict] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const m = useMeja({
    onSaved: () => setRefreshKey((k) => k + 1),
    onRemote: (e) => {
      if (e.type === "conflict") setConflict(e.by);
      if (e.type === "draft") post(`${e.by} mengubah draf`, { tone: "info", detail: "Isi meja diperbarui." });
      if (e.type === "published") post(`${e.by} menerbitkan sambutan`, { tone: "live" });
    },
  });
  const conn = useConnection();
  const [picker, setPicker] = useState(null);
  const [sigOpen, setSigOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [preview, setPreview] = useState({ open: false, anchor: null });

  const v = m.value;
  const deferred = useDeferredValue(v);
  const redundancy = useMemo(() => (deferred ? findRedundancy(deferred) : []), [deferred]);
  const changed = useMemo(
    () => (v && m.doc ? [...new Set(changedChapters(v, m.doc.live).map((k) => CHAPTER_OF[k] ?? k))] : []),
    [v, m.doc]
  );

  // pintasan keyboard
  const keys = useRef({});
  keys.current = { m, post };
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName ?? "");
      const k = e.key.toLowerCase();
      if (k === "s") {
        e.preventDefault();
        keys.current.m.flush().then(
          () => keys.current.post("Draf disimpan", { detail: "Belum tayang sampai diterbitkan." }),
          () => keys.current.post("Gagal menyimpan", { tone: "error" })
        );
      } else if (k === "z" && !typing) {
        e.preventDefault();
        if (e.shiftKey) keys.current.m.redo();
        else if (keys.current.m.undo()) keys.current.post("Langkah diurungkan", { tone: "info", duration: 2200 });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const busy = m.status === "typing" || m.status === "saving";
    if (!busy) return;
    const fn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [m.status]);

  useEffect(() => {
    if (m.status === "error") post("Draf gagal disimpan", { tone: "error", detail: "Periksa koneksi lalu tekan Ctrl+S.", action: { label: "Coba lagi", onClick: () => m.flush().catch(() => {}) } });
  }, [m.status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (m.error && !v) return <Failure message={m.error} onRetry={m.load} />;
  if (!v) return <MejaLoader />;

  const set = (path) => (val) => m.update(path, val);
  const pick = (kind, path, current) => setPicker({ kind, path, current });

  const doPublish = async () => {
    try {
      const ok = await m.publish();
      post(ok ? "Sambutan diterbitkan" : "Tidak ada perubahan", { tone: ok ? "live" : "info", detail: ok ? "Halaman publik sudah diperbarui." : undefined });
    } catch (e) {
      post("Gagal menerbitkan", { tone: "error", detail: e.message });
      throw e;
    }
  };

  return (
    <div className="meja-desk min-h-screen text-text">
      {/* kepala meja */}
      <header className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 pb-4 pt-6 sm:px-6">
        <Link href="/admin/dashboard" className="group inline-flex items-center gap-2 text-[13px] text-navy/60 transition-colors hover:text-navy">
          <span className="transition-transform group-hover:-translate-x-0.5">←</span> Panel admin
        </Link>
        <p className="font-serif text-xl text-navy">
          Meja <em className="text-maroon">Sambutan</em>
        </p>
        <div className="ml-auto flex items-center gap-4 text-[13px] text-text/55">
          {m.doc.publishedAt && (
            <span className="hidden md:inline">
              Tayang sejak {new Date(m.doc.publishedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
            </span>
          )}
          <a href="/sambutan-kaprodi" target="_blank" rel="noopener noreferrer" className="u-gold text-navy hover:text-maroon">
            Buka halaman ↗
          </a>
        </div>
      </header>

      <ChapterRibbon changed={changed} />

      <main className="mx-auto max-w-[880px] px-4 pb-40 pt-8 sm:px-6">
        {/* sapaan meja (hanya ilustrasi, tanpa ikon) */}
        <div className="mb-8 grid grid-cols-1 items-center gap-6 sm:grid-cols-[minmax(0,1fr)_190px]">
          <div>
            <h1 className="font-serif text-[clamp(1.7rem,3.4vw,2.4rem)] leading-tight text-navy">
              Tulis ulang langsung <em className="text-maroon">di kertasnya.</em>
            </h1>
            <p className="mt-2 max-w-lg text-[14.5px] leading-relaxed text-text/60">
              Klik teks mana pun untuk mengubahnya. Draf tersimpan otomatis dan baru tayang setelah diterbitkan.
            </p>
          </div>
          <div className="hidden -rotate-2 sm:block">
            <PostcardIllustration className="h-auto w-full text-navy" />
          </div>
        </div>

        {conflict && (
          <PaperRibbon
            tone="conflict"
            action={
              <button type="button" onClick={() => (setConflict(null), m.load())} className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25">
                Muat versi mereka
              </button>
            }
          >
            {conflict} juga sedang mengedit. Simpananmu berikutnya akan menimpa perubahan mereka.
          </PaperRibbon>
        )}
        {conn === "unavailable" && <PaperRibbon tone="offline">Koneksi realtime terputus — perubahan admin lain tidak terlihat sampai tersambung lagi.</PaperRibbon>}
        {m.dirty && !conflict && (
          <PaperRibbon
            tone="draft"
            action={
              <button type="button" onClick={() => setPublishOpen(true)} className="shrink-0 font-semibold underline decoration-gold underline-offset-4">
                Tinjau & terbitkan
              </button>
            }
          >
            Draf belum terbit{m.doc.draftAt ? ` · disimpan ${new Date(m.doc.draftAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}` : ""}. Pengunjung masih membaca versi tayang.
          </PaperRibbon>
        )}

        {/* kertas */}
        <article className="relative rounded-[6px] bg-white shadow-[0_1px_0_rgb(20_33_61/0.04),0_50px_100px_-50px_rgb(20_33_61/0.45)] ring-1 ring-navy/[0.06]">
          <span aria-hidden className="absolute inset-y-0 left-10 hidden w-px bg-maroon/10 sm:block" />

          {/* I · Tirai */}
          <Chapter index={0} onPreview={() => setPreview({ open: true, anchor: "top" })}>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_250px] lg:items-start">
              <div className="space-y-6">
                <PaperSwitch checked={v.curtain.enabled} onChange={set("curtain.enabled")} label="Tampilkan tirai pembuka" hint="Muncul sekali per sesi kunjungan, lalu terangkat." />
                <div className={cn("grid gap-6 transition-opacity sm:grid-cols-2", !v.curtain.enabled && "pointer-events-none opacity-40")}>
                  <PaperField path="curtain.title" label="Kata utama" value={v.curtain.title} onChange={set("curtain.title")} size="title" max={40} />
                  <PaperField path="curtain.accent" label="Kata aksen" value={v.curtain.accent} onChange={set("curtain.accent")} size="italic" max={40} />
                  <PaperField path="curtain.label" label="Label memuat" value={v.curtain.label} onChange={set("curtain.label")} size="meta" max={60} className="sm:col-span-2" />
                </div>
              </div>
              <CurtainMini curtain={v.curtain} />
            </div>
          </Chapter>

          {/* II · Sampul */}
          <Chapter index={1} onPreview={() => setPreview({ open: true, anchor: "top" })}>
            <Breadcrumbs items={v.hero.breadcrumb} onChange={set("hero.breadcrumb")} />
            <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-6">
                <span aria-hidden className="block h-[3px] w-10 bg-gold" />
                <PaperField path="hero.titleTop" label="Judul" value={v.hero.titleTop} onChange={set("hero.titleTop")} size="display" multiline max={80} />
                <PaperField path="hero.titleAccent" label="Judul aksen (miring)" value={v.hero.titleAccent} onChange={set("hero.titleAccent")} size="display" multiline inputClassName="italic !text-maroon" max={80} />
                <PaperField path="hero.subtitle" label="Subjudul" value={v.hero.subtitle} onChange={set("hero.subtitle")} multiline max={280} />
                <div className="flex flex-wrap gap-3">
                  <ButtonInput path="hero.readLabel" value={v.hero.readLabel} onChange={set("hero.readLabel")} tone="solid" label="Tombol baca" />
                  <ButtonInput path="hero.profileLabel" value={v.hero.profileLabel} onChange={set("hero.profileLabel")} tone="outline" label="Tombol profil" />
                </div>
                <div className="rounded-lg bg-cream/60 p-4">
                  <PaperSwitch checked={v.hero.showLottie} onChange={set("hero.showLottie")} label="Animasi Lottie di sudut" hint="Tampil di layar lebar." />
                  {v.hero.showLottie && (
                    <div className="mt-3 flex items-center gap-4">
                      <div className="grid size-20 place-items-center rounded-md bg-white ring-1 ring-navy/10">{v.hero.lottie && <LottieIllustration src={v.hero.lottie} className="w-16 text-navy" />}</div>
                      <button type="button" onClick={() => pick("lottie", "hero.lottie", v.hero.lottie)} className="text-sm text-navy underline decoration-gold underline-offset-4 hover:text-maroon">
                        Ganti animasi
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <Portrait person={v.person} onPick={() => pick("image", "person.photo", v.person.photo)} set={set} />
                <PaperField path="person.credentials" label="Gelar" value={v.person.credentials} onChange={set("person.credentials")} size="meta" max={160} />
                <PaperField path="person.photoAlt" label="Teks alternatif foto" value={v.person.photoAlt} onChange={set("person.photoAlt")} size="meta" max={200} placeholder={`${v.person.name}, ${v.person.role}`} hint="Untuk pembaca layar." />
                <Mascot mascot={v.hero.mascot} set={set} />
              </div>
            </div>
          </Chapter>

          {/* III · Surat */}
          <Chapter index={2} onPreview={() => setPreview({ open: true, anchor: "surat" })}>
            <BannerEditor banner={v.letter.banner} set={set} />
            <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_200px]">
              <div className="min-w-0 space-y-6">
                <PaperField path="letter.greeting" label="Salam pembuka" value={v.letter.greeting} onChange={set("letter.greeting")} size="italic" multiline max={300} />
                <ParagraphList
                  paragraphs={v.letter.paragraphs}
                  quoteAfter={v.letter.quoteAfter}
                  quote={v.letter.quote}
                  onChange={set("letter.paragraphs")}
                  onQuoteAfter={set("letter.quoteAfter")}
                />
                <QuoteField value={v.letter.quote} onChange={set("letter.quote")} />
                <PaperField path="letter.closing" label="Salam penutup" value={v.letter.closing} onChange={set("letter.closing")} size="italic" multiline max={300} />
                <div className="rounded-lg border border-dashed border-navy/15 p-5">
                  <PaperField path="letter.signOff" label="Kalimat sebelum tanda tangan" value={v.letter.signOff} onChange={set("letter.signOff")} size="meta" max={60} />
                  <button type="button" onClick={() => setSigOpen(true)} className="group mt-3 block w-full rounded-md p-2 text-left transition-colors hover:bg-cream">
                    <Signature signature={v.signature} />
                    <span className="mt-1 block text-[12px] text-text/45 transition-colors group-hover:text-maroon">Klik untuk menggambar ulang tanda tangan</span>
                  </button>
                  <p className="mt-2 font-serif text-lg text-navy">
                    {v.person.name}
                    {v.person.credentials ? `, ${v.person.credentials}` : ""}
                  </p>
                </div>
              </div>
              <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-text/40">Rel progres baca</p>
                  <div className="flex gap-3">
                    <span className="w-[2px] rounded-full bg-gold" />
                    <div className="flex-1 space-y-3">
                      {[0, 1, 2, 3].map((i) => (
                        <input
                          key={i}
                          id={fieldDomId(`letter.progressLabels.${i}`)}
                          value={v.letter.progressLabels[i] ?? ""}
                          maxLength={40}
                          placeholder={`Penanda ${i + 1}`}
                          onChange={(e) => {
                            const next = [0, 1, 2, 3].map((j) => (j === i ? e.target.value : v.letter.progressLabels[j] ?? ""));
                            set("letter.progressLabels")(next.some(Boolean) ? next : []);
                          }}
                          className="block w-full border-b border-dashed border-text/15 bg-transparent pb-1 text-[13px] text-text/70 outline-none focus:border-gold"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-[11.5px] text-text/45">Kosongkan semua untuk menyembunyikan rel.</p>
                </div>
                <PaperField path="letter.profileButtonLabel" label="Tombol profil (kolom kiri)" value={v.letter.profileButtonLabel} onChange={set("letter.profileButtonLabel")} size="meta" max={30} hint="Kosong = disembunyikan." />
              </aside>
            </div>
          </Chapter>

          {/* IV · Profil */}
          <Chapter index={3} onPreview={() => setPreview({ open: true, anchor: "surat" })}>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-[150px_minmax(0,1fr)]">
              <div className="relative hidden aspect-[3/4] overflow-hidden rounded-md bg-cream-2 sm:block">
                <Image src={v.person.photo} alt="" fill sizes="150px" className="object-cover object-top" />
              </div>
              <div className="space-y-7">
                <div>
                  <p className="kicker text-maroon">{v.person.role}</p>
                  <p className="mt-1 font-serif text-2xl text-navy">{v.person.name}</p>
                </div>
                <PaperField path="profile.intro" label="Pengantar" value={v.profile.intro} onChange={set("profile.intro")} size="meta" multiline max={300} />
                <LabeledBlock path="profile.researchLabel" label={v.profile.researchLabel} onLabel={set("profile.researchLabel")}>
                  <ChipList path="profile.research" label="Isi" items={v.profile.research} onChange={set("profile.research")} />
                </LabeledBlock>
                <LabeledBlock path="profile.educationLabel" label={v.profile.educationLabel} onLabel={set("profile.educationLabel")}>
                  <Education items={v.profile.education} onChange={set("profile.education")} />
                </LabeledBlock>
                <LabeledBlock path="profile.certificationsLabel" label={v.profile.certificationsLabel} onLabel={set("profile.certificationsLabel")}>
                  <ChipList path="profile.certifications" label="Isi" items={v.profile.certifications} onChange={set("profile.certifications")} />
                </LabeledBlock>
                <LinkPair path="profile.contact" label="Tombol kontak" value={v.profile.contact} onChange={set("profile.contact")} />
              </div>
            </div>
          </Chapter>

          {/* V · Meta */}
          <Chapter index={4} last>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <PaperField path="seo.title" label="Judul halaman" value={v.seo.title} onChange={set("seo.title")} size="meta" max={90} hint="Ideal ≤ 60 karakter." />
                <PaperField path="seo.description" label="Deskripsi" value={v.seo.description} onChange={set("seo.description")} size="meta" multiline max={200} hint="Ideal 120–160 karakter." />
              </div>
              <div className="rounded-lg bg-cream/60 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text/40">Tampilan di mesin pencari</p>
                <p className="mt-3 truncate text-[12.5px] text-emerald-800">sisfor.uisi.ac.id › sambutan-kaprodi</p>
                <p className="mt-0.5 line-clamp-1 text-[18px] text-[#1a0dab]">{v.seo.title || "—"}</p>
                <p className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-text/70">{v.seo.description || "—"}</p>
              </div>
            </div>
          </Chapter>
        </article>
      </main>

      <Dock
        status={m.status}
        dirty={m.dirty}
        canUndo={m.canUndo}
        onUndo={() => m.undo()}
        redundancy={redundancy}
        onJump={jumpToField}
        history={m.doc.history}
        onRestore={async (i) => {
          try {
            await m.restore(i);
            post("Versi lama dipulihkan ke draf", { detail: "Terbitkan untuk menayangkannya.", action: { label: "Urungkan", onClick: () => m.undo() } });
          } catch (e) {
            post("Gagal memulihkan", { tone: "error", detail: e.message });
          }
        }}
        onPreview={() => setPreview((p) => ({ ...p, open: true }))}
        onDiscard={() => setDiscardOpen(true)}
        onPublish={() => setPublishOpen(true)}
      />

      <MediaPicker
        open={Boolean(picker)}
        onOpenChange={(o) => !o && setPicker(null)}
        kind={picker?.kind ?? "image"}
        current={picker?.current}
        folders={FOLDERS[picker?.kind ?? "image"]}
        uploadFolder="uploads/sambutan"
        notify={(t, o) => post(t, o)}
        onPick={(url) => {
          if (picker?.path === "signature.svgUrl") m.update("signature", { ...v.signature, mode: "svg", svgUrl: url });
          else if (picker) m.update(picker.path, url);
        }}
      />
      <SignaturePad
        open={sigOpen}
        onOpenChange={setSigOpen}
        signature={v.signature}
        onSave={(sg) => {
          m.update("signature", sg);
          post("Tanda tangan diperbarui", { action: { label: "Urungkan", onClick: () => m.undo() } });
        }}
        onPickSvg={() => {
          setSigOpen(false);
          pick("image", "signature.svgUrl", v.signature.svgUrl);
        }}
      />
      <PublishModal open={publishOpen} onOpenChange={setPublishOpen} value={v} live={m.doc.live} onPublish={doPublish} />
      <ConfirmModal
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        title="Buang draf?"
        description="Semua perubahan yang belum terbit hilang dan meja kembali ke versi yang sedang tayang."
        confirmLabel="Buang draf"
        destructive
        loading={discarding}
        onConfirm={async () => {
          setDiscarding(true);
          try {
            await m.discard();
            post("Draf dibuang", { tone: "info", detail: "Meja kembali ke versi tayang." });
            setDiscardOpen(false);
          } catch (e) {
            post("Gagal membuang draf", { tone: "error", detail: e.message });
          } finally {
            setDiscarding(false);
          }
        }}
      />
      <PreviewSheet open={preview.open} onOpenChange={(o) => setPreview((p) => ({ ...p, open: o }))} refreshKey={refreshKey} anchor={preview.anchor} />
    </div>
  );
}

/* ───────────── bagian-bagian kertas ───────────── */

function Chapter({ index, last, onPreview, children }) {
  const c = CHAPTERS[index];
  return (
    <section id={chapterId(c.key)} data-aos="fade-up" className={cn("scroll-mt-16 px-5 py-10 sm:pl-16 sm:pr-10 sm:py-12", !last && "border-b border-dashed border-navy/10")}>
      <header className="mb-8 flex items-baseline gap-4">
        <span className="font-serif text-[2.4rem] leading-none text-gold/80">{ROMAN[index]}</span>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-2xl text-navy">{c.label}</h2>
          <p className="text-[13px] text-text/50">{c.hint}</p>
        </div>
        {onPreview && (
          <button type="button" onClick={onPreview} className="shrink-0 text-[12.5px] text-navy/60 underline decoration-gold/60 underline-offset-4 hover:text-maroon">
            lihat di halaman
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

function CurtainMini({ curtain }) {
  const line = useRef(null);
  const key = `${curtain.title}|${curtain.accent}`;
  useEffect(() => {
    if (line.current) animate(line.current, { scaleX: [0, 1], duration: 700, ease: "inOutQuart" });
  }, [key]);
  return (
    <div className={cn("relative grid aspect-[4/3] place-items-center overflow-hidden rounded-md bg-maroon px-4 text-center text-white transition-opacity", !curtain.enabled && "opacity-30 grayscale")}>
      <div>
        <p className="text-[9px] uppercase tracking-[0.2em] text-gold-soft/80">Program Studi Sistem Informasi</p>
        <p className="mt-2 text-balance break-words font-serif text-xl">
          {curtain.title} <em className="text-gold-soft">{curtain.accent}</em>
        </p>
        <span ref={line} className="mx-auto mt-3 block h-px w-16 origin-left bg-gold" />
        <p className="mt-3 text-[10px] text-white/60">{curtain.label}…</p>
      </div>
      <span className="absolute left-2 top-2 rounded-full bg-black/20 px-2 py-0.5 text-[10px] text-white/70">pratinjau</span>
    </div>
  );
}

function Breadcrumbs({ items, onChange }) {
  const upd = (i, val) => onChange(items.map((x, j) => (j === i ? val : x)));
  return (
    <div id={fieldDomId("hero.breadcrumb")}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-text/40">Breadcrumb</p>
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {items.map((b, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="group/crumb flex items-center gap-2">
              {i > 0 && <span className="text-text/30">/</span>}
              <span className={cn("relative inline-flex items-center rounded-md px-2 py-1 ring-1 ring-transparent transition hover:ring-navy/10", last ? "text-navy" : "text-text/55")}>
                <input value={b.label} size={Math.max(4, b.label.length)} maxLength={60} onChange={(e) => upd(i, { ...b, label: e.target.value })} className="bg-transparent outline-none" aria-label={`Label breadcrumb ${i + 1}`} />
                {!last && (
                  <input
                    value={b.href}
                    placeholder="tanpa tautan"
                    onChange={(e) => upd(i, { ...b, href: e.target.value })}
                    className="absolute left-0 top-full z-10 mt-1 hidden w-44 rounded-md bg-white px-2 py-1 text-[12px] text-text/70 shadow-lg outline-none ring-1 ring-navy/10 group-focus-within/crumb:block"
                    aria-label={`Tautan breadcrumb ${i + 1}`}
                  />
                )}
                {items.length > 1 && (
                  <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Hapus" className="ml-1 text-text/25 opacity-0 transition hover:text-maroon group-hover/crumb:opacity-100">
                    ×
                  </button>
                )}
              </span>
            </li>
          );
        })}
        {items.length < 5 && (
          <li>
            <button type="button" onClick={() => onChange([...items.slice(0, -1), { label: "Baru", href: "" }, ...items.slice(-1)])} className="rounded-md px-2 py-1 text-[12px] text-navy/50 hover:text-maroon">
              + tingkat
            </button>
          </li>
        )}
      </ol>
    </div>
  );
}

function ButtonInput({ path, value, onChange, tone, label }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-text/40">{label}</span>
      <input
        id={fieldDomId(path)}
        value={value}
        maxLength={40}
        onChange={(e) => onChange(e.target.value)}
        size={Math.max(8, value.length + 1)}
        className={cn(
          "h-12 rounded-md px-6 text-[15px] font-semibold outline-none transition-[box-shadow,transform] focus:ring-4 focus:ring-gold/40 active:scale-[0.99]",
          tone === "solid" ? "bg-maroon text-white placeholder:text-white/40" : "border border-navy/25 bg-white text-navy"
        )}
      />
    </label>
  );
}

function Portrait({ person, onPick, set }) {
  return (
    <figure className="group relative mx-auto w-full max-w-[300px]">
      <span aria-hidden className="absolute -right-3 -top-3 h-full w-full rounded-lg border-2 border-gold transition-transform duration-700 group-hover:translate-x-1 group-hover:-translate-y-1" />
      <button type="button" onClick={onPick} className="relative block aspect-[4/5] w-full overflow-hidden rounded-lg bg-cream-2" aria-label="Ganti foto">
        <Image src={person.photo} alt="" fill sizes="300px" className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]" />
        <span className="absolute inset-0 grid place-items-center bg-navy/0 text-sm font-semibold text-white opacity-0 transition-[background-color,opacity] duration-300 group-hover:bg-navy/45 group-hover:opacity-100">
          Ganti foto
        </span>
      </button>
      <figcaption className="relative -mt-10 ml-[-12px] mr-6 rounded-lg border-t-[3px] border-gold bg-navy px-4 py-3 text-white shadow-[0_24px_50px_-20px_rgb(14_24_48/0.7)]">
        <input id={fieldDomId("person.name")} value={person.name} maxLength={120} onChange={(e) => set("person.name")(e.target.value)} className="w-full bg-transparent font-serif text-lg leading-tight outline-none placeholder:text-white/40" placeholder="Nama" aria-label="Nama" />
        <input id={fieldDomId("person.role")} value={person.role} maxLength={160} onChange={(e) => set("person.role")(e.target.value)} className="mt-1 w-full bg-transparent text-[13px] text-white/70 outline-none" placeholder="Jabatan" aria-label="Jabatan" />
      </figcaption>
    </figure>
  );
}

function Mascot({ mascot, set }) {
  return (
    <div className="rounded-lg bg-cream/60 p-4">
      <PaperSwitch checked={mascot.show} onChange={set("hero.mascot.show")} label="Maskot Elvo menyapa" hint="Muncul di samping potret pada layar lebar." />
      {mascot.show && (
        <div className="mt-4 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {MASCOT_POSES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => set("hero.mascot.pose")(p)}
                title={POSE_LABEL[p]}
                className={cn("relative grid size-14 shrink-0 place-items-center rounded-md bg-white ring-1 transition-[box-shadow,transform] hover:-translate-y-0.5", mascot.pose === p ? "ring-2 ring-gold" : "ring-navy/10")}
              >
                <Image src={`/mascot/elvo-${p}.webp`} alt={POSE_LABEL[p]} width={44} height={44} className="h-11 w-auto object-contain" />
              </button>
            ))}
          </div>
          <div className="relative rounded-xl rounded-bl-none bg-white px-3 pb-1 pt-2 ring-1 ring-navy/10">
            <PaperField path="hero.mascot.say" label="Ucapan" value={mascot.say} onChange={set("hero.mascot.say")} size="meta" max={120} />
          </div>
        </div>
      )}
    </div>
  );
}

function BannerEditor({ banner: b, set }) {
  return (
    <div>
      <PaperSwitch checked={b.show} onChange={set("letter.banner.show")} label="Banner pengumuman di atas surat" />
      {b.show && (
        <Spotlight className={cn("mt-4 rounded-lg border-l-4 border-gold p-5", b.variant === "brand" ? "bg-maroon text-white" : "bg-cream text-navy")}>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {BANNER_VARIANTS.map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => set("letter.banner.variant")(x)}
                className={cn("rounded-full px-2.5 py-0.5 text-[11.5px] ring-1 transition", b.variant === x ? "bg-gold text-navy ring-gold" : b.variant === "brand" ? "ring-white/25 text-white/75 hover:ring-white/60" : "ring-navy/15 text-navy/70 hover:ring-navy/40")}
              >
                {VARIANT_LABEL[x]}
              </button>
            ))}
          </div>
          <input
            id={fieldDomId("letter.banner.title")}
            value={b.title}
            maxLength={120}
            onChange={(e) => set("letter.banner.title")(e.target.value)}
            placeholder="Judul banner"
            className="w-full bg-transparent text-[15px] font-semibold outline-none placeholder:opacity-40"
          />
          <input
            id={fieldDomId("letter.banner.body")}
            value={b.body}
            maxLength={240}
            onChange={(e) => set("letter.banner.body")(e.target.value)}
            placeholder="Isi singkat (opsional)"
            className={cn("mt-1 w-full bg-transparent text-sm outline-none placeholder:opacity-40", b.variant === "brand" ? "text-white/80" : "text-text/75")}
          />
          <div className={cn("mt-4 grid gap-3 border-t pt-3 sm:grid-cols-[140px_1fr]", b.variant === "brand" ? "border-white/15" : "border-navy/10")}>
            <input value={b.linkLabel} maxLength={40} onChange={(e) => set("letter.banner.linkLabel")(e.target.value)} placeholder="Label tautan" aria-label="Label tautan banner" className="bg-transparent text-[13px] font-semibold outline-none placeholder:opacity-40" />
            <input value={b.href} onChange={(e) => set("letter.banner.href")(e.target.value)} placeholder="https://…" aria-label="Tautan banner" className="bg-transparent text-[13px] opacity-75 outline-none placeholder:opacity-40" />
          </div>
        </Spotlight>
      )}
    </div>
  );
}

function QuoteField({ value, onChange }) {
  const words = (value || "").split(" ").filter(Boolean);
  return (
    <figure id={fieldDomId("letter.quote")} className="relative my-6 border-y border-line py-10">
      <span aria-hidden className="absolute -top-7 left-0 bg-white pr-4 font-serif text-[5rem] leading-none text-gold">
        &ldquo;
      </span>
      <p className="mb-3 pl-16 text-[11px] font-semibold uppercase tracking-[0.16em] text-text/40">Kutipan — menyala kata demi kata saat dibaca</p>
      <div className="relative">
        {/* lapisan pratinjau: kata terakhir yang diketik menyala */}
        <p aria-hidden className="pointer-events-none whitespace-pre-wrap break-words font-serif text-[clamp(1.4rem,2.6vw,2rem)] leading-[1.25] text-navy">
          {words.map((w, i) => (
            <span key={i} style={{ opacity: 0.25 + 0.75 * ((i + 1) / words.length) }}>
              {w}{" "}
            </span>
          ))}
          {!words.length && <span className="text-text/25">Kutipan kosong tidak ditampilkan.</span>}
        </p>
        <textarea
          value={value}
          maxLength={400}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Kutipan"
          className="absolute inset-0 h-full w-full resize-none overflow-hidden bg-transparent font-serif text-[clamp(1.4rem,2.6vw,2rem)] leading-[1.25] text-transparent caret-maroon outline-none selection:bg-gold/30"
        />
      </div>
    </figure>
  );
}

function LabeledBlock({ path, label, onLabel, children }) {
  return (
    <div className="space-y-2">
      <input
        id={fieldDomId(path)}
        value={label}
        maxLength={40}
        onChange={(e) => onLabel(e.target.value)}
        aria-label="Judul blok"
        className="w-full bg-transparent text-sm font-semibold text-navy outline-none focus:underline focus:decoration-gold focus:underline-offset-4"
      />
      {children}
    </div>
  );
}

function Education({ items, onChange }) {
  const upd = (i, k, val) => onChange(items.map((x, j) => (j === i ? { ...x, [k]: val } : x)));
  return (
    <ul id={fieldDomId("profile.education")} className="space-y-2">
      {items.map((e, i) => (
        <li key={i} className="group/edu flex items-center gap-2 text-sm">
          <span className="size-1.5 shrink-0 rounded-full bg-gold" />
          <input value={e.degree} maxLength={120} onChange={(x) => upd(i, "degree", x.target.value)} placeholder="Jenjang & gelar" className="min-w-0 flex-1 border-b border-dashed border-transparent bg-transparent text-text/80 outline-none hover:border-text/15 focus:border-gold" />
          <span className="text-text/30">·</span>
          <input value={e.place} maxLength={160} onChange={(x) => upd(i, "place", x.target.value)} placeholder="Kampus (opsional)" className="min-w-0 flex-1 border-b border-dashed border-transparent bg-transparent text-text/60 outline-none hover:border-text/15 focus:border-gold" />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Hapus" className="text-text/25 opacity-0 transition hover:text-maroon group-hover/edu:opacity-100 focus:opacity-100">
            ×
          </button>
        </li>
      ))}
      {items.length < 8 && (
        <li>
          <button type="button" onClick={() => onChange([...items, { degree: "", place: "" }])} className="text-[12.5px] text-navy/55 hover:text-maroon">
            + jenjang
          </button>
        </li>
      )}
    </ul>
  );
}

function Failure({ message, onRetry }) {
  return (
    <div className="meja-desk grid min-h-screen place-items-center px-6 text-center">
      <div className="max-w-sm">
        <PostcardIllustration className="mx-auto h-auto w-56 -rotate-3 text-navy" />
        <h1 className="mt-6 font-serif text-2xl text-navy">Meja belum bisa dibuka</h1>
        <p className="mt-2 text-sm text-text/60">{message}</p>
        <button type="button" onClick={onRetry} className="mt-6 h-11 rounded-md bg-maroon px-6 text-sm font-semibold text-white hover:bg-maroon-deep">
          Coba lagi
        </button>
      </div>
    </div>
  );
}
