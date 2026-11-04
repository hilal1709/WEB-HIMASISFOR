'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AppIcon, Banner, ChartCard, StatCard } from '@/components/ds'
import notify from '@/lib/notify'

const QUICK_ACTIONS = [
  { href: '/admin/content', title: 'Edit Konten Utama', desc: 'Kelola konten homepage', icon: 'content' },
  { href: '/admin/profile-content', title: 'Edit Halaman Profil', desc: 'Kelola konten profil', icon: 'profile' },
  { href: '/admin/curriculum', title: 'Kelola Kurikulum', desc: 'Edit data kurikulum', icon: 'book' },
  { href: '/admin/achievements/create', title: 'Tambah Prestasi', desc: 'Tambahkan prestasi baru', icon: 'trophy' },
  { href: '/admin/gallery/create', title: 'Tambah Galeri', desc: 'Upload foto galeri prestasi', icon: 'gallery' },
  { href: '/admin/media', title: 'Upload Media', desc: 'Upload gambar dan file', icon: 'upload' },
]

const RED = '#dc2626'
const DARK = '#27272a'

function firstYear(tahun) {
  const m = String(tahun || '').match(/\d{4}/)
  return m ? m[0] : 'Lainnya'
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [achievements, setAchievements] = useState([])
  const [galleryCount, setGalleryCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, gRes] = await Promise.all([fetch('/api/achievements?format=list'), fetch('/api/gallery')])
        const [aData, gData] = await Promise.all([aRes.json(), gRes.json()])
        setAchievements(Array.isArray(aData.data) ? aData.data : [])
        setGalleryCount(Array.isArray(gData.data) ? gData.data.length : 0)
      } catch (error) {
        notify.error('Gagal memuat statistik', { description: error.message })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const intl = achievements.filter((a) => /internasional/i.test(a.tingkatan)).length
    const byYear = {}
    achievements.forEach((a) => {
      const y = firstYear(a.tahun)
      byYear[y] ??= { nasional: 0, internasional: 0 }
      byYear[y][/internasional/i.test(a.tingkatan) ? 'internasional' : 'nasional']++
    })
    const years = Object.keys(byYear).sort().slice(-6)
    return {
      total: achievements.length,
      intl,
      people: new Set(achievements.map((a) => a.achieverName)).size,
      mahasiswa: achievements.filter((a) => a.category === 'mahasiswa').length,
      dosen: achievements.filter((a) => a.category === 'dosen').length,
      years,
      byYear,
    }
  }, [achievements])

  const barData = {
    labels: stats.years,
    datasets: [
      { label: 'Nasional', data: stats.years.map((y) => stats.byYear[y].nasional), backgroundColor: RED, borderRadius: 6, maxBarThickness: 28 },
      { label: 'Internasional', data: stats.years.map((y) => stats.byYear[y].internasional), backgroundColor: DARK, borderRadius: 6, maxBarThickness: 28 },
    ],
  }
  const doughnutData = {
    labels: ['Mahasiswa', 'Dosen'],
    datasets: [{ data: [stats.mahasiswa, stats.dosen], backgroundColor: [RED, DARK], borderWidth: 0, hoverOffset: 6 }],
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div data-aos="fade-up">
        <h2 className="text-2xl font-bold text-zinc-900 lg:text-3xl">Halo, {session?.user?.name?.split(' ')[0] || 'Admin'} 👋</h2>
        <p className="mt-1 text-sm text-zinc-500 lg:text-base">Kelola konten website Sistem Informasi UISI dari sini.</p>
      </div>

      <Banner variant="brand" title="Design System sudah tersedia" dismissible storageKey="ds-launch" action={
        <Link href="/design-system" className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50">Lihat</Link>
      }>
        Semua komponen, warna, dan animasi website kini terdokumentasi di satu tempat.
      </Banner>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Prestasi" value={stats.total} icon="trophy" href="/admin/achievements" loading={loading} />
        <StatCard title="Prestasi Internasional" value={stats.intl} icon="globe" href="/admin/achievements" loading={loading} />
        <StatCard title="Peraih Prestasi" value={stats.people} icon="profile" loading={loading} />
        <StatCard title="Galeri Prestasi" value={galleryCount} icon="gallery" href="/admin/gallery" loading={loading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard type="bar" title="Prestasi per Tahun" description="6 tahun terakhir berdasarkan tingkat" className="lg:col-span-2" data={barData} loading={loading}
          options={{ scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { grid: { display: false } } } }} />
        <ChartCard type="doughnut" title="Kategori Peraih" description="Mahasiswa vs dosen" data={doughnutData} loading={loading}
          options={{ cutout: '68%', plugins: { legend: { position: 'bottom' } } }} />
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-soft lg:p-6">
        <h3 className="mb-4 text-lg font-bold text-zinc-900">Aksi Cepat</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((a, i) => (
            <Link key={a.href} href={a.href} data-aos="fade-up" data-aos-delay={i * 50}
              className="group flex items-center gap-4 rounded-xl border p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/50">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <AppIcon name={a.icon} size={20} target=".group" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-zinc-900">{a.title}</span>
                <span className="block text-xs text-zinc-500">{a.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
