'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import { Banner } from '@/components/ui/banner'
import { AosProvider, AosReady } from '@/components/motion/aos-provider'
import { DashHero } from '@/components/admin-dashboard/dash-hero'
import { StatRail } from '@/components/admin-dashboard/stat-rail'
import { InboxTimeline } from '@/components/admin-dashboard/inbox-timeline'
import { AgendaDesk } from '@/components/admin-dashboard/agenda-desk'
import { QuickDesk } from '@/components/admin-dashboard/quick-desk'
import { DetailModal, MiniList, RequestDetail } from '@/components/admin-dashboard/detail-modal'

const BANNER_KEY = 'sisfor:dash:banner-hidden'
const TOAST_KEY = 'sisfor:dash:pending-seen'
const PENDING = ['diterima', 'diverifikasi']

const safeGet = (key) => {
  try { return window.sessionStorage.getItem(key) } catch { return null }
}
const safeSet = (key, value) => {
  try { window.sessionStorage.setItem(key, value) } catch { /* sesi diblokir: abaikan */ }
}

const plural = (n, label) => `${n} ${label}`

export default function DashboardPage() {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [viewer, setViewer] = useState('')
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [bannerHidden, setBannerHidden] = useState(true)
  const [modal, setModal] = useState(null) // { kind: 'stat', key } | { kind: 'request', index }

  useEffect(() => {
    setBannerHidden(safeGet(BANNER_KEY) === '1')
    let live = true
    fetch('/api/dashboard', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (!live) return
        if (!json?.success) throw new Error(json?.error || 'gagal')
        setData(json.data)
        setViewer(json.data.viewer ?? '')
      })
      .catch(() => live && setFailed(true))
      .finally(() => live && setLoading(false))
    return () => { live = false }
  }, [])

  const counts = data?.counts
  const pendingRequests = useMemo(
    () => (data?.recentRequests ?? []).filter((r) => PENDING.includes(r.status)),
    [data]
  )

  // Toast sekali per sesi: hanya bila jumlah pengajuan menunggu berubah sejak kunjungan terakhir.
  useEffect(() => {
    if (!counts || counts.requestsPending === 0) return
    const key = String(counts.requestsPending)
    if (safeGet(TOAST_KEY) === key) return
    safeSet(TOAST_KEY, key)
    toast.info(plural(counts.requestsPending, 'pengajuan baru menunggu'), {
      description: 'Antrean dibuka dari bagian bawah ringkasan.',
      action: {
        label: 'Lihat antrean',
        onClick: () => document.getElementById('antrean')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      },
    })
    // toast stabil dari provider
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts])

  const hideBanner = useCallback(() => {
    safeSet(BANNER_KEY, '1')
    setBannerHidden(true)
  }, [])

  const firstName = viewer ? viewer.split(' ')[0] : ''
  const pendingCount = counts?.requestsPending ?? 0
  const draftCount = counts?.postsDraft ?? 0
  const showBanner = !loading && !failed && !bannerHidden && (pendingCount > 0 || draftCount > 0)

  // ----- modal -----
  const statItems = useMemo(() => {
    if (!data || !modal || modal.kind !== 'stat') return { items: [], hasList: false, title: '', description: '', link: null, kicker: '' }
    switch (modal.key) {
      case 'requests':
        return {
          kicker: 'Pengajuan menunggu',
          title: plural(pendingCount, 'pengajuan'),
          description: 'Diurutkan dari yang terbaru. Sisanya ada di antrean lengkap.',
          hasList: true,
          items: pendingRequests.map((r) => ({ key: r.id, title: r.name, meta: `${r.code} · ${r.nim}`, href: '/admin/layanan' })),
          link: { href: '/admin/layanan', label: 'Buka kotak layanan' },
        }
      case 'posts':
        return {
          kicker: 'Warta',
          title: plural(counts?.postsPublished ?? 0, 'warta terbit'),
          description: draftCount ? `${plural(draftCount, 'draf')} menunggu untuk diterbitkan.` : 'Semua warta sudah terbit.',
          hasList: true,
          items: (data.recentPosts ?? [])
            .filter((p) => p.status === 'terbit')
            .slice(0, 4)
            .map((p) => ({ key: p.id, title: p.title, meta: p.category, href: '/admin/warta' })),
          link: { href: '/admin/warta', label: 'Kelola warta' },
        }
      case 'achievements':
        return {
          kicker: 'Prestasi',
          title: plural(counts?.achievements ?? 0, 'prestasi tercatat'),
          description: 'Mencakup peraih dari kalangan dosen dan mahasiswa.',
          items: [],
          link: { href: '/admin/achievements', label: 'Kelola prestasi' },
        }
      default:
        return {
          kicker: 'Galeri',
          title: plural(counts?.gallery ?? 0, 'foto aktif'),
          description: 'Foto yang ditampilkan di halaman prestasi.',
          items: [],
          link: { href: '/admin/gallery', label: 'Kelola galeri' },
        }
    }
  }, [modal, data, counts, pendingCount, pendingRequests, draftCount])

  const requests = data?.recentRequests ?? []
  const reqIndex = modal?.kind === 'request' ? modal.index : -1
  const go = (step) =>
    setModal((m) => (m?.kind === 'request' ? { kind: 'request', index: (m.index + step + requests.length) % requests.length } : m))

  return (
    <AosProvider>
      <div className="space-y-8 lg:space-y-10">
        <DashHero firstName={firstName} pendingCount={pendingCount} />

        {failed && (
          <Banner variant="danger" title="Ringkasan belum bisa dimuat">
            Muat ulang halaman. Jika tetap gagal, periksa koneksi basis data.
          </Banner>
        )}

        {showBanner && (
          <Banner
            variant="brand"
            title="Menunggu tindakanmu"
            action={
              <div className="flex items-center gap-4">
                <a href="#antrean" className="text-sm font-semibold text-gold-soft underline underline-offset-4">Tinjau antrean</a>
                <button type="button" onClick={hideBanner} className="text-xs text-white/70 hover:text-white">Sembunyikan</button>
              </div>
            }
          >
            {[
              pendingCount > 0 && plural(pendingCount, 'pengajuan layanan belum diverifikasi'),
              draftCount > 0 && plural(draftCount, 'warta masih berupa draf'),
            ].filter(Boolean).join(', ')}.
          </Banner>
        )}

        <StatRail counts={counts} loading={loading} onOpen={(key) => setModal({ kind: 'stat', key })} />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
          <section id="antrean" aria-labelledby="antrean-judul" className="scroll-mt-28 min-w-0" data-aos="fade-up">
            <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-navy/10 pb-3">
              <h2 id="antrean-judul" className="font-serif text-2xl text-navy">Antrean pengajuan</h2>
              <span className="text-xs text-text/55">5 terbaru</span>
            </div>
            <InboxTimeline rows={requests} loading={loading} onSelect={(r) => setModal({ kind: 'request', index: requests.findIndex((x) => x.id === r.id) })} />
          </section>

          <section aria-labelledby="pintasan-judul" className="min-w-0 lg:pt-1" data-aos="fade-up" data-aos-delay="120">
            <div className="mb-5 border-b border-navy/10 pb-3">
              <h2 id="pintasan-judul" className="font-serif text-2xl text-navy">Pintasan kerja</h2>
            </div>
            <QuickDesk />
          </section>
        </div>

        <AgendaDesk events={data?.upcomingEvents} posts={data?.recentPosts} loading={loading} />
      </div>

      <DetailModal
        open={modal?.kind === 'stat'}
        onOpenChange={(o) => !o && setModal(null)}
        kicker={statItems.kicker}
        title={statItems.title}
        description={statItems.description}
        footer={
          statItems.link ? (
            <Link href={statItems.link.href} className="rounded-md bg-maroon px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-maroon-deep">
              {statItems.link.label}
            </Link>
          ) : null
        }
      >
        {statItems.hasList && <MiniList items={statItems.items} empty="Belum ada item untuk ditampilkan di sini." />}
      </DetailModal>

      <DetailModal
        open={modal?.kind === 'request' && reqIndex >= 0}
        onOpenChange={(o) => !o && setModal(null)}
        kicker="Pengajuan layanan"
        title={requests[reqIndex]?.name ?? ''}
        onPrev={requests.length > 1 ? () => go(-1) : undefined}
        onNext={requests.length > 1 ? () => go(1) : undefined}
        position={requests.length ? `${reqIndex + 1} / ${requests.length}` : ''}
        footer={
          <Link href="/admin/layanan" className="rounded-md bg-maroon px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-maroon-deep">
            Proses di kotak layanan
          </Link>
        }
      >
        <RequestDetail row={requests[reqIndex]} />
      </DetailModal>
      <AosReady />
    </AosProvider>
  )
}
