'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { AppIcon, EmptyState, useConfirm } from '@/components/ds'
import { HoverCard } from '@/components/aceternity'
import notify from '@/lib/notify'
import { cn } from '@/lib/utils'

export default function GalleryPage() {
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const confirm = useConfirm()

  const fetchGalleries = async () => {
    try {
      const response = await fetch('/api/gallery')
      const data = await response.json()
      if (data.success) setGalleries(data.data)
    } catch (error) {
      notify.error('Gagal memuat galeri', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGalleries() }, [])

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase()
    if (!q) return galleries
    return galleries.filter((i) => i.title.toLowerCase().includes(q) || i.name.toLowerCase().includes(q) || String(i.year).toLowerCase().includes(q))
  }, [galleries, searchTerm])

  const handleDelete = async (item) => {
    const ok = await confirm({ title: 'Hapus galeri ini?', description: `"${item.title}" akan dihapus permanen dari galeri.`, tone: 'danger' })
    if (!ok) return
    try {
      const response = await fetch(`/api/gallery?id=${item.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        notify.success('Galeri berhasil dihapus')
        fetchGalleries()
      } else {
        notify.error('Gagal menghapus', { description: data.error })
      }
    } catch (error) {
      notify.error('Terjadi kesalahan', { description: error.message })
    }
  }

  const toggleActive = async (item) => {
    try {
      const response = await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
      })
      const data = await response.json()
      if (data.success) {
        notify.success(item.isActive ? 'Galeri dinonaktifkan' : 'Galeri diaktifkan')
        fetchGalleries()
      } else {
        notify.error('Gagal mengubah status', { description: data.error })
      }
    } catch (error) {
      notify.error('Terjadi kesalahan', { description: error.message })
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 lg:text-2xl">Kelola Galeri Prestasi</h2>
          <p className="mt-1 text-sm text-zinc-500">Kelola foto showcase galeri prestasi</p>
        </div>
        <Button asChild className="group">
          <Link href="/admin/gallery/create"><AppIcon name="plus" size={16} target=".group" /> Tambah Galeri</Link>
        </Button>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-soft lg:p-6">
        <div className="space-y-2">
          <Label htmlFor="search">Cari Galeri</Label>
          <div className="relative">
            <AppIcon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input id="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari judul, nama, atau tahun…" className="pl-9" />
          </div>
        </div>
        <p className="mt-4 text-xs text-zinc-500 lg:text-sm">Menampilkan {filtered.length} dari {galleries.length} galeri</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={searchTerm ? 'Tidak ada yang cocok' : 'Belum ada data galeri'}
          description={searchTerm ? 'Coba kata kunci lain.' : 'Tambahkan foto prestasi untuk ditampilkan di website.'}
          illustration={searchTerm ? 'not-found' : 'empty'}
          action={!searchTerm && <Button asChild><Link href="/admin/gallery/create">Tambah Galeri</Link></Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
          {filtered.map((item, i) => (
            <div key={item.id} data-aos="fade-up" data-aos-delay={(i % 4) * 60}>
              <HoverCard className={cn('h-full', !item.isActive && 'opacity-70')}>
                <div className="relative h-48 bg-zinc-100">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-400">Tidak ada gambar</div>
                  )}
                  <button
                    onClick={() => toggleActive(item)}
                    className={cn('absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur transition cursor-pointer',
                      item.isActive ? 'bg-success text-white hover:brightness-110' : 'bg-zinc-800/80 text-white hover:bg-zinc-800')}
                  >
                    {item.isActive ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="mb-2 line-clamp-2 font-semibold text-zinc-900">{item.title}</h3>
                  <div className="mb-3 flex items-center gap-2 text-sm text-zinc-600">
                    {item.photoProfile && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.photoProfile} alt={item.name} className="size-6 rounded-full object-cover" />
                    )}
                    <span className="line-clamp-1">{item.name}</span>
                  </div>
                  <div className="mb-4 flex items-center justify-between text-xs text-zinc-500">
                    <span>Tahun {item.year}</span><span>Urutan {item.order}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="group flex-1">
                      <Link href={`/admin/gallery/edit/${item.id}`}><AppIcon name="edit" size={14} target=".group" /> Edit</Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="group flex-1 bg-danger-soft text-danger hover:bg-brand-100 hover:text-danger" onClick={() => handleDelete(item)}>
                      <AppIcon name="trash" size={14} target=".group" /> Hapus
                    </Button>
                  </div>
                </div>
              </HoverCard>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
