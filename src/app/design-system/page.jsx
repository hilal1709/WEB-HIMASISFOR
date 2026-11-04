'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AppIcon, Banner, ChartCard, DotsLoader, EmptyState, LottiePlayer, Modal, PageLoader, Spinner, StatCard, useConfirm } from '@/components/ds'
import { BackgroundBeams, BackgroundGrid, HoverCard, MovingBorderButton, Spotlight, TextGenerateEffect } from '@/components/aceternity'
import { ICONS } from '@/lib/icons'
import notify from '@/lib/notify'

const BRAND = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
const SEMANTIC = [
  ['primary', 'bg-primary'], ['foreground', 'bg-foreground'], ['muted', 'bg-muted'], ['border', 'bg-border'],
  ['success', 'bg-success'], ['warning', 'bg-warning'], ['info', 'bg-info'], ['danger', 'bg-danger'],
]

function Section({ id, title, description, children }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-5" data-aos="fade-up">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {children}
    </section>
  )
}

const NAV = ['warna', 'tipografi', 'tombol', 'form', 'komponen', 'feedback', 'loading', 'ilustrasi', 'ikon', 'chart', 'aceternity', 'carousel']

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const confirm = useConfirm()

  const demoLoader = () => { setShowLoader(true); setTimeout(() => setShowLoader(false), 2200) }
  const demoConfirm = async () => {
    const ok = await confirm({ title: 'Hapus data ini?', description: 'Data yang dihapus tidak dapat dikembalikan.', tone: 'danger' })
    ok ? notify.success('Data dihapus') : notify.info('Dibatalkan')
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {showLoader && <PageLoader label="Contoh page loader…" />}

      {/* Hero */}
      <header className="relative overflow-hidden bg-zinc-950 text-white">
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />
        <BackgroundBeams />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <Badge variant="soft" className="mb-4">Sisfor DS v1.0</Badge>
          <TextGenerateEffect as="h1" words="Design System Sistem Informasi UISI" className="font-serif text-4xl leading-tight sm:text-6xl" />
          <p className="mt-4 max-w-2xl text-white/70">
            Satu sumber kebenaran untuk warna, tipografi, komponen, animasi, dan pola interaksi di website & CMS.
            Panduan lengkap ada di <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">DESIGN_SYSTEM.md</code>.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild><Link href="/admin/dashboard">Buka CMS</Link></Button>
            <MovingBorderButton as={Link} href="/">Lihat Website</MovingBorderButton>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="no-scrollbar mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
          {NAV.map((n) => (
            <a key={n} href={`#${n}`} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm capitalize text-zinc-600 hover:bg-brand-50 hover:text-brand-700">{n}</a>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl space-y-16 px-4 py-12">
        <Section id="warna" title="Warna" description="Brand merah UISI + netral zinc. Gunakan token, bukan kode hex langsung.">
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {BRAND.map((s) => (
              <div key={s} className="space-y-1.5">
                <div className="h-14 rounded-lg border" style={{ background: `var(--brand-${s})` }} />
                <p className="text-xs font-medium text-zinc-700">brand-{s}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SEMANTIC.map(([n, cls]) => (
              <div key={n} className="flex items-center gap-3 rounded-xl border bg-white p-3">
                <span className={`size-9 rounded-lg border ${cls}`} />
                <span className="text-sm font-medium text-zinc-700">{n}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="tipografi" title="Tipografi" description="Inter untuk UI & isi, Noto Serif Display untuk judul besar bernuansa editorial.">
          <Card><CardContent className="space-y-4">
            <p className="font-serif text-5xl text-zinc-900">Display — Noto Serif</p>
            <h1 className="text-4xl font-bold text-zinc-900">Heading 1 — 36/40 bold</h1>
            <h2 className="text-2xl font-bold text-zinc-900">Heading 2 — 24/32 bold</h2>
            <h3 className="text-lg font-semibold text-zinc-900">Heading 3 — 18/28 semibold</h3>
            <p className="text-base text-zinc-700">Body — 16/24. Program Studi Sistem Informasi mencetak lulusan yang mampu menjembatani bisnis dan teknologi.</p>
            <p className="text-sm text-zinc-500">Small / caption — 14/20, warna muted.</p>
          </CardContent></Card>
        </Section>

        <Section id="tombol" title="Tombol" description="shadcn/ui Button dengan varian bertema.">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="dark">Dark</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive"><AppIcon name="trash" size={16} /> Hapus</Button>
            <Button disabled><Spinner /> Menyimpan…</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" variant="outline" aria-label="Edit"><AppIcon name="edit" size={16} /></Button>
          </div>
        </Section>

        <Section id="form" title="Form" description="Input, Textarea, Select dan Label.">
          <Card><CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="ds-name">Nama</Label><Input id="ds-name" placeholder="Nama lengkap" /></div>
            <div className="space-y-2"><Label htmlFor="ds-cat">Kategori</Label>
              <NativeSelect id="ds-cat" defaultValue="mahasiswa"><option value="mahasiswa">Mahasiswa</option><option value="dosen">Dosen</option></NativeSelect>
            </div>
            <div className="space-y-2"><Label htmlFor="ds-err">Input error</Label><Input id="ds-err" aria-invalid defaultValue="email-salah" /><p className="text-xs text-danger">Format email tidak valid</p></div>
            <div className="space-y-2"><Label htmlFor="ds-dis">Disabled</Label><Input id="ds-dis" disabled placeholder="Tidak bisa diubah" /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="ds-desc">Deskripsi</Label><Textarea id="ds-desc" placeholder="Tulis deskripsi…" /></div>
          </CardContent></Card>
        </Section>

        <Section id="komponen" title="Komponen" description="Card, Badge, Tabs, Table, Stat card.">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Total Prestasi" value={128} icon="trophy" hint="+12 tahun ini" />
            <StatCard title="Galeri" value={46} icon="gallery" />
            <StatCard title="Mata Kuliah" value={144} icon="book" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge><Badge variant="soft">Internasional</Badge><Badge variant="secondary">Nasional</Badge>
            <Badge variant="success">Aktif</Badge><Badge variant="warning">Draft</Badge><Badge variant="info">Info</Badge><Badge variant="outline">Outline</Badge>
          </div>
          <Tabs defaultValue="mhs">
            <TabsList><TabsTrigger value="mhs">Mahasiswa</TabsTrigger><TabsTrigger value="dsn">Dosen</TabsTrigger></TabsList>
            <TabsContent value="mhs">
              <Table>
                <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Prestasi</TableHead><TableHead>Tingkat</TableHead></TableRow></TableHeader>
                <TableBody>
                  <TableRow><TableCell className="font-medium">Andi</TableCell><TableCell>Juara 1 UI/UX</TableCell><TableCell><Badge variant="soft">Internasional</Badge></TableCell></TableRow>
                  <TableRow><TableCell className="font-medium">Sari</TableCell><TableCell>Finalis Gemastik</TableCell><TableCell><Badge variant="secondary">Nasional</Badge></TableCell></TableRow>
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="dsn"><Card><CardHeader><CardTitle>Dosen</CardTitle><CardDescription>Contoh isi tab kedua.</CardDescription></CardHeader></Card></TabsContent>
          </Tabs>
        </Section>

        <Section id="feedback" title="Modal, Toast & Banner" description="Pengganti alert() dan confirm() bawaan browser.">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setModalOpen(true)}>Buka Modal</Button>
            <Button variant="outline" onClick={demoConfirm}>Confirm Dialog</Button>
            <Button variant="outline" onClick={() => notify.success('Berhasil disimpan', { description: 'Perubahan sudah tayang di website.' })}>Toast sukses</Button>
            <Button variant="outline" onClick={() => notify.error('Gagal upload', { description: 'Ukuran file melebihi 5MB.' })}>Toast error</Button>
            <Button variant="outline" onClick={() => notify.warning('Koneksi lambat')}>Toast warning</Button>
            <Button variant="outline" onClick={() => notify.promise(new Promise((r) => setTimeout(r, 1500)), { loading: 'Menyimpan…', success: 'Tersimpan!', error: 'Gagal' })}>Toast promise</Button>
          </div>
          <div className="space-y-3">
            <Banner variant="brand" title="Pendaftaran Mahasiswa Baru dibuka!" dismissible action={<Button size="sm" variant="secondary">Daftar</Button>}>Kuota terbatas — daftar sebelum 30 November.</Banner>
            <Banner variant="info" title="Informasi">Website akan maintenance pukul 22.00 WIB.</Banner>
            <Banner variant="success" title="Konten berhasil dipublikasikan" dismissible />
            <Banner variant="warning" title="Gambar belum diisi">Tambahkan foto agar tampilan lebih menarik.</Banner>
            <Banner variant="danger" title="Sesi hampir habis">Simpan pekerjaan Anda sekarang.</Banner>
          </div>
          <Modal
            open={modalOpen}
            onOpenChange={setModalOpen}
            title="Tambah Prestasi"
            description="Isi data prestasi dengan lengkap."
            icon={<AppIcon name="trophy" size={24} />}
            footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button><Button onClick={() => { setModalOpen(false); notify.success('Prestasi ditambahkan') }}>Simpan</Button></>}
          >
            <div className="space-y-3">
              <div className="space-y-2"><Label htmlFor="m-name">Nama</Label><Input id="m-name" placeholder="Nama peraih" /></div>
              <div className="space-y-2"><Label htmlFor="m-title">Prestasi</Label><Input id="m-title" placeholder="Juara 1 …" /></div>
            </div>
          </Modal>
        </Section>

        <Section id="loading" title="Loading" description="Page loader (anime.js), dots, spinner dan skeleton shimmer.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardContent className="flex h-32 items-center justify-center"><DotsLoader /></CardContent></Card>
            <Card><CardContent className="flex h-32 items-center justify-center gap-4"><Spinner size={28} className="text-brand-600" /><Button variant="outline" onClick={demoLoader}>Demo page loader</Button></CardContent></Card>
            <Card><CardContent className="space-y-3"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-20 w-full" /></CardContent></Card>
          </div>
        </Section>

        <Section id="ilustrasi" title="Ilustrasi Lottie" description="File di public/lottie — dibuat khusus dengan palet brand.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {['loader', 'success', 'empty', 'not-found', 'secure'].map((n) => (
              <Card key={n} className="items-center py-4"><LottiePlayer name={n} className="w-28" /><p className="text-xs font-medium text-zinc-600">{n}</p></Card>
            ))}
          </div>
          <EmptyState title="Belum ada prestasi" description="Tambahkan prestasi pertama agar tampil di website." action={<Button><AppIcon name="plus" size={16} /> Tambah Prestasi</Button>} />
        </Section>

        <Section id="ikon" title="Ikon" description="<AppIcon name=… /> — Lordicon bila tersedia, fallback lucide. Hover untuk micro-interaction.">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-9">
            {Object.keys(ICONS).map((n) => (
              <div key={n} className="group flex flex-col items-center gap-2 rounded-xl border bg-white p-3 text-zinc-700 transition hover:border-brand-200 hover:text-brand-600">
                <AppIcon name={n} size={24} target=".group" />
                <span className="text-[11px] text-zinc-500">{n}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="chart" title="Chart" description="Chart.js dengan palet --chart-1…5.">
          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard type="bar" title="Prestasi per Tahun" className="lg:col-span-2" data={{
              labels: ['2021', '2022', '2023', '2024', '2025'],
              datasets: [
                { label: 'Nasional', data: [8, 12, 15, 20, 24], backgroundColor: '#dc2626', borderRadius: 6 },
                { label: 'Internasional', data: [2, 3, 6, 8, 11], backgroundColor: '#27272a', borderRadius: 6 },
              ],
            }} />
            <ChartCard type="doughnut" title="Kategori" data={{
              labels: ['Mahasiswa', 'Dosen'],
              datasets: [{ data: [78, 22], backgroundColor: ['#dc2626', '#27272a'], borderWidth: 0 }],
            }} options={{ cutout: '68%' }} />
          </div>
        </Section>

        <Section id="aceternity" title="Efek Aceternity" description="Spotlight, Beams, Grid, Text Generate, Hover Card, Moving Border — dijalankan dengan GSAP/CSS.">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <HoverCard key={i} className="p-6">
                <AppIcon name={['trophy', 'book', 'globe'][i - 1]} size={28} className="text-brand-600" />
                <h3 className="mt-4 font-semibold text-zinc-900">Hover Card {i}</h3>
                <p className="mt-1 text-sm text-zinc-500">Cahaya mengikuti kursor dengan sedikit efek tilt.</p>
              </HoverCard>
            ))}
          </div>
          <div className="relative overflow-hidden rounded-2xl border bg-white p-10 text-center">
            <BackgroundGrid />
            <TextGenerateEffect as="p" words="Background grid dengan mask radial." className="relative text-xl font-semibold text-zinc-900" />
          </div>
        </Section>

        <Section id="carousel" title="Carousel (Swiper)" description="Untuk testimoni, galeri prestasi dan alumni.">
          <Swiper modules={[Autoplay, Pagination]} spaceBetween={16} slidesPerView={1.15} breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 3 } }} autoplay={{ delay: 2500, disableOnInteraction: false }} pagination={{ clickable: true }} className="!pb-10">
            {[1, 2, 3, 4, 5].map((i) => (
              <SwiperSlide key={i}>
                <Card className="h-40 justify-center px-6"><p className="font-serif text-2xl text-zinc-900">Slide {i}</p><p className="text-sm text-zinc-500">Swiper + autoplay + pagination</p></Card>
              </SwiperSlide>
            ))}
          </Swiper>
        </Section>
      </main>
    </div>
  )
}
