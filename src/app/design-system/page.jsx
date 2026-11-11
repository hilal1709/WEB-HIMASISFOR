"use client";
import { useState } from "react";
import { Bell, GraduationCap, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLoader, DotsLoader, Skeleton, Spinner, PageLoader } from "@/components/ui/loader";
import { ConfirmModal, Modal, ModalClose, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, ModalTrigger } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Spotlight } from "@/components/aceternity/spotlight";
import { MovingBorderButton } from "@/components/aceternity/moving-border";
import { TiltCard } from "@/components/aceternity/tilt-card";
import { Reveal } from "@/components/motion/reveal";
import { SwiperCarousel } from "@/components/motion/swiper-carousel";
import { LordIcon } from "@/components/media/lord-icon";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { BarChart, DoughnutChart, LineChart } from "@/components/charts/charts";
import { countUp, staggerIn } from "@/lib/motion";
import { ArrowRight } from "lucide-react";
import { SpotlightCard } from "@/components/aceternity/spotlight-card";
import { BackgroundPaths } from "@/components/aceternity/background-paths";
import { Magnetic } from "@/components/motion/magnetic";
import { Marquee } from "@/components/motion/marquee";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Elvo, ELVO_POSES } from "@/components/mascot/elvo";
import { Eyebrow, PillLink, SceneTitle } from "@/components/home/shared";

const SWATCHES = [
  ["primary", "bg-primary"], ["brand-from", "bg-brand-from"], ["brand-to", "bg-brand-to"], ["brand-deep", "bg-brand-deep"],
  ["foreground", "bg-foreground"], ["muted", "bg-muted"], ["border", "bg-border"], ["accent", "bg-accent"],
  ["success", "bg-success"], ["warning", "bg-warning"], ["info", "bg-info"], ["danger", "bg-danger"],
  ["paper", "bg-paper"], ["ink", "bg-ink"], ["brand-gold", "bg-brand-gold"], ["brand-glow", "bg-brand-glow"],
];

function Section({ title, desc, children }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-serif text-3xl">{title}</h2>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [overlay, setOverlay] = useState(false);

  const slides = [{ t: "Akreditasi Unggul", i: Trophy }, { t: "Kurikulum MBKM", i: GraduationCap }, { t: "Alumni Terserap Industri", i: Users }, { t: "Dosen Bersertifikasi", i: Trophy }];

  return (
    <main className="mx-auto max-w-5xl space-y-16 px-4 py-12">
      {/* Hero dengan Spotlight (Aceternity) */}
      <header className="relative overflow-hidden rounded-3xl bg-zinc-950 px-8 py-16 text-white">
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#ef4444" />
        <Badge variant="soft" className="relative">Design System v1</Badge>
        <h1 className="relative mt-4 font-serif text-5xl md:text-6xl">Sisfor UISI</h1>
        <p className="relative mt-3 max-w-xl text-zinc-400">
          shadcn/ui · Aceternity · GSAP · anime.js · Swiper · AOS · Lordicon · Lottie · Chart.js · Auth.js
        </p>
        <div className="relative mt-8 flex flex-wrap gap-3">
          <MovingBorderButton>Mulai Gunakan</MovingBorderButton>
          <Button variant="brand" size="lg" onClick={() => toast.success("Design system siap dipakai")}>Coba Toast</Button>
        </div>
      </header>

      <Section title="Warna" desc="Token di globals.css. Jangan hardcode hex di komponen.">
        <Reveal stagger className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SWATCHES.map(([name, cls]) => (
            <div key={name} className="overflow-hidden rounded-xl border">
              <div className={`h-16 ${cls}`} />
              <p className="px-3 py-2 text-xs font-medium">{name}</p>
            </div>
          ))}
        </Reveal>
      </Section>

      <Section title="Tipografi">
        <Card><CardContent className="space-y-2 pt-6">
          <p className="font-serif text-5xl">Noto Serif Display: Heading</p>
          <p className="text-2xl font-semibold">Inter Semibold: Subheading</p>
          <p className="text-base">Inter Regular: paragraf isi konten program studi Sistem Informasi.</p>
          <p className="text-sm text-muted-foreground">Inter Small Muted: keterangan</p>
        </CardContent></Card>
      </Section>

      <Section title="Tombol & Badge">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Default</Button><Button variant="brand">Brand</Button><Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button><Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button><Button loading>Loading</Button><Button size="sm">Small</Button><Button size="icon" aria-label="Notifikasi"><Bell className="size-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge><Badge variant="soft">Soft</Badge><Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge><Badge variant="warning">Warning</Badge><Badge variant="info">Info</Badge><Badge variant="danger">Danger</Badge>
        </div>
      </Section>

      <Section title="Form">
        <Card><CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="n">Nama</Label><Input id="n" placeholder="Nama lengkap" /></div>
          <div className="space-y-2"><Label htmlFor="e">Email (error)</Label><Input id="e" invalid defaultValue="salah-format" /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="m">Pesan</Label><Textarea id="m" placeholder="Tulis pesan…" /></div>
        </CardContent></Card>
      </Section>

      <Section title="Banner" desc="Pesan inline & pengumuman.">
        <div className="space-y-3">
          <Banner variant="brand" title="Pendaftaran mahasiswa baru dibuka" action={<Button size="sm" variant="secondary">Daftar</Button>}>Gelombang 1 hingga 30 Maret.</Banner>
          <Banner variant="info" title="Info">Jadwal kuliah semester genap sudah tersedia.</Banner>
          <Banner variant="success" title="Berhasil" dismissible>Data prestasi tersimpan.</Banner>
          <Banner variant="warning" title="Perhatian">Ukuran gambar melebihi 2 MB.</Banner>
          <Banner variant="danger" title="Gagal">Email atau password salah.</Banner>
        </div>
      </Section>

      <Section title="Toast">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => toast.success("Tersimpan", { description: "Perubahan berhasil disimpan." })}>Success</Button>
          <Button variant="outline" onClick={() => toast.error("Gagal menyimpan", { description: "Periksa koneksi Anda." })}>Error</Button>
          <Button variant="outline" onClick={() => toast.warning("Perhatian")}>Warning</Button>
          <Button variant="outline" onClick={() => toast.info("Informasi baru")}>Info</Button>
        </div>
      </Section>

      <Section title="Modal">
        <div className="flex flex-wrap gap-2">
          <Modal>
            <ModalTrigger asChild><Button>Buka Modal</Button></ModalTrigger>
            <ModalContent>
              <ModalHeader><ModalTitle>Tambah Prestasi</ModalTitle><ModalDescription>Isi detail prestasi mahasiswa.</ModalDescription></ModalHeader>
              <Input placeholder="Judul prestasi" />
              <ModalFooter><ModalClose asChild><Button variant="outline">Batal</Button></ModalClose><Button>Simpan</Button></ModalFooter>
            </ModalContent>
          </Modal>
          <Button variant="destructive" onClick={() => setConfirm(true)}>Hapus (konfirmasi)</Button>
          <ConfirmModal
            open={confirm} onOpenChange={setConfirm} destructive loading={busy}
            title="Hapus data ini?" description="Tindakan ini tidak dapat dibatalkan." confirmLabel="Hapus"
            onConfirm={() => { setBusy(true); setTimeout(() => { setBusy(false); setConfirm(false); toast.success("Data dihapus"); }, 1200); }}
          />
        </div>
      </Section>

      <Section title="Loading">
        <Card><CardContent className="flex flex-wrap items-center gap-10 pt-6">
          <Spinner className="size-8 text-primary" />
          <DotsLoader />
          <BrandLoader label="Memuat data…" />
          <div className="w-56 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-20 w-full" /></div>
          <Button variant="outline" onClick={() => { setOverlay(true); setTimeout(() => setOverlay(false), 1800); }}>Page loader</Button>
        </CardContent></Card>
        {overlay && <PageLoader label="Memuat halaman…" />}
      </Section>

      <Section title="Animasi" desc="GSAP (scroll reveal) · anime.js (counter/stagger) · AOS · Swiper · Aceternity.">
        <StatsDemo />
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-aos="fade-right"><Card><CardHeader><CardTitle>AOS fade-right</CardTitle><CardDescription>data-aos="fade-right"</CardDescription></CardHeader></Card></div>
          <div data-aos="fade-left"><TiltCard><p className="font-semibold">Aceternity Tilt Card</p><p className="text-sm text-muted-foreground">Arahkan kursor ke kartu ini.</p></TiltCard></div>
        </div>
        <SwiperCarousel
          items={slides}
          render={({ t, i: Icon }) => (
            <Card className="h-full"><CardContent className="flex items-center gap-3 pt-6"><span className="grid size-10 place-items-center rounded-lg bg-accent text-primary"><Icon className="size-5" /></span><span className="font-semibold">{t}</span></CardContent></Card>
          )}
        />
      </Section>

      <Section title="Ikon & Ilustrasi" desc="Lordicon (ikon animasi) dan Lottie (ilustrasi).">
        <Card><CardContent className="flex flex-wrap items-center gap-10 pt-6">
          <div className="text-center">
            <LordIcon src="/lordicon/bell.json" size={48} fallback={<Bell className="size-10 text-primary" />} />
            <p className="mt-2 text-xs text-muted-foreground">Lordicon (hover)</p>
          </div>
          <div className="text-center">
            <div className="w-40"><LottieIllustration src="/lottie/pulse.json" /></div>
            <p className="text-xs text-muted-foreground">Lottie</p>
          </div>
        </CardContent></Card>
      </Section>

      <Section title="Cinematic Layer" desc="Komponen beranda 2026, terinspirasi 21st.dev & horizonx.so. Lihat DESIGN.md › Cinematic Layer.">
        <Card><CardContent className="space-y-6 pt-6">
          <Eyebrow>Eyebrow</Eyebrow>
          <SceneTitle lines={["Judul babak tegas", "dengan aksen serif"]} />
          <SplitReveal as="p" className="text-lg text-muted-foreground">SplitReveal: teks muncul per kata dengan mask dan blur.</SplitReveal>
          <div className="flex flex-wrap gap-3">
            <Magnetic><PillLink href="#" icon={ArrowRight}>PillLink brand + Magnetic</PillLink></Magnetic>
            <PillLink href="#" variant="glass">Glass</PillLink>
          </div>
        </CardContent></Card>
        <div className="grid gap-4 md:grid-cols-3">
          {["Spotlight Card", "Glow ikut kursor", "Border menyala"].map((t) => (
            <SpotlightCard key={t} className="rounded-3xl border bg-card p-6">
              <p className="font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted-foreground">Gerakkan kursor di atas kartu.</p>
            </SpotlightCard>
          ))}
        </div>
        <div className="grain relative h-48 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-to via-brand-from to-brand-deep text-white">
          <BackgroundPaths />
          <p className="relative p-6 font-serif text-3xl italic">Background Paths + grain</p>
        </div>
        <Marquee className="rounded-2xl border py-4">
          {["Marquee", "berhenti", "saat", "hover", "·"].map((w) => <span key={w} className="text-2xl font-semibold text-muted-foreground">{w}</span>)}
        </Marquee>
      </Section>

      <Section title="Maskot: Elvo" desc="Pemandu halaman. Pakai pose sesuai konteks, jangan di-stretch atau diwarnai ulang.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {Object.keys(ELVO_POSES).map((p) => (
            <div key={p} className="flex flex-col items-center rounded-2xl bg-paper p-4">
              <div className="animate-float"><Elvo pose={p} height={120} /></div>
              <code className="mt-3 text-xs">{p}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Chart" desc="Chart.js, warna otomatis dari token --chart-1…5.">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2"><CardHeader><CardTitle>Mahasiswa Baru per Tahun</CardTitle></CardHeader><CardContent>
            <BarChart data={{ labels: ["2021", "2022", "2023", "2024", "2025"], datasets: [{ label: "Mahasiswa", data: [82, 96, 110, 128, 141] }] }} />
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Bidang Karier</CardTitle></CardHeader><CardContent>
            <DoughnutChart data={{ labels: ["Analyst", "Auditor", "Consultant", "ERP"], datasets: [{ data: [34, 22, 26, 18] }] }} />
          </CardContent></Card>
          <Card className="lg:col-span-3"><CardHeader><CardTitle>Prestasi</CardTitle></CardHeader><CardContent>
            <LineChart height={220} data={{ labels: ["Q1", "Q2", "Q3", "Q4"], datasets: [{ label: "Nasional", data: [4, 7, 6, 11] }, { label: "Internasional", data: [1, 2, 3, 4] }] }} />
          </CardContent></Card>
        </div>
      </Section>
    </main>
  );
}

function StatsDemo() {
  const stats = [["Mahasiswa", 520], ["Alumni", 1800], ["Prestasi", 96]];
  return (
    <div
      className="grid grid-cols-3 gap-4"
      ref={(el) => {
        if (!el || el.dataset.ran) return;
        el.dataset.ran = "1";
        staggerIn(el.children);
        el.querySelectorAll("[data-count]").forEach((n) => countUp(n, Number(n.dataset.count)));
      }}
    >
      {stats.map(([label, n]) => (
        <Card key={label}><CardContent className="pt-6 text-center">
          <p className="font-serif text-4xl text-primary"><span data-count={n}>0</span>+</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </CardContent></Card>
      ))}
    </div>
  );
}
