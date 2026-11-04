'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AppIcon, EmptyState, useConfirm } from '@/components/ds'
import notify from '@/lib/notify'

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterTingkatan, setFilterTingkatan] = useState('all')
  const confirm = useConfirm()

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements?format=list')
      const data = await response.json()
      if (data.success) setAchievements(data.data)
    } catch (error) {
      notify.error('Gagal memuat prestasi', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAchievements() }, [])

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return achievements.filter((item) =>
      (!q || item.achieverName.toLowerCase().includes(q) || item.title.toLowerCase().includes(q)) &&
      (filterCategory === 'all' || item.category === filterCategory) &&
      (filterTingkatan === 'all' || item.tingkatan === filterTingkatan)
    )
  }, [achievements, searchTerm, filterCategory, filterTingkatan])

  const hasFilter = searchTerm || filterCategory !== 'all' || filterTingkatan !== 'all'

  const handleDelete = async (item) => {
    const ok = await confirm({ title: 'Hapus prestasi ini?', description: `"${item.title}" milik ${item.achieverName} akan dihapus permanen.`, tone: 'danger' })
    if (!ok) return
    try {
      const response = await fetch(`/api/achievements?id=${item.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        notify.success('Prestasi berhasil dihapus')
        fetchAchievements()
      } else {
        notify.error('Gagal menghapus', { description: data.error })
      }
    } catch (error) {
      notify.error('Terjadi kesalahan', { description: error.message })
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 lg:text-2xl">Manajemen Prestasi</h2>
          <p className="mt-1 text-sm text-zinc-500">Kelola data prestasi Sistem Informasi</p>
        </div>
        <Button asChild className="group">
          <Link href="/admin/achievements/create"><AppIcon name="plus" size={16} target=".group" /> Tambah Prestasi</Link>
        </Button>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-soft lg:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="search">Cari Prestasi</Label>
            <div className="relative">
              <AppIcon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input id="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari nama atau prestasi…" className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat">Kategori</Label>
            <NativeSelect id="cat" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">Semua</option><option value="dosen">Dosen</option><option value="mahasiswa">Mahasiswa</option>
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tingkat">Tingkatan</Label>
            <NativeSelect id="tingkat" value={filterTingkatan} onChange={(e) => setFilterTingkatan(e.target.value)}>
              <option value="all">Semua</option><option value="Nasional">Nasional</option><option value="Internasional">Internasional</option>
            </NativeSelect>
          </div>
        </div>
        <p className="mt-4 text-xs text-zinc-500 lg:text-sm">Menampilkan {filtered.length} dari {achievements.length} prestasi</p>
      </div>

      {loading ? (
        <div className="space-y-2 rounded-2xl border bg-white p-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={hasFilter ? 'Tidak ada yang cocok' : 'Belum ada data prestasi'}
          description={hasFilter ? 'Coba ubah kata kunci atau filter.' : 'Tambahkan prestasi pertama agar tampil di website.'}
          illustration={hasFilter ? 'not-found' : 'empty'}
          action={!hasFilter && <Button asChild><Link href="/admin/achievements/create">Tambah Prestasi</Link></Button>}
        />
      ) : (
        <Table className="min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead><TableHead>Foto</TableHead><TableHead>Nama</TableHead><TableHead>Prestasi</TableHead>
              <TableHead>Kategori</TableHead><TableHead>Tingkatan</TableHead><TableHead>Tahun</TableHead><TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-zinc-500">{index + 1}</TableCell>
                <TableCell>
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.achieverName} className="size-10 rounded-full object-cover ring-2 ring-brand-50" />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600">{item.achieverName?.charAt(0)}</div>
                  )}
                </TableCell>
                <TableCell className="font-medium text-zinc-900">{item.achieverName}</TableCell>
                <TableCell className="max-w-xs whitespace-normal text-zinc-600">{item.title}</TableCell>
                <TableCell><Badge variant={item.category === 'dosen' ? 'info' : 'success'}>{item.category === 'dosen' ? 'Dosen' : 'Mahasiswa'}</Badge></TableCell>
                <TableCell><Badge variant={item.tingkatan === 'Internasional' ? 'soft' : 'secondary'}>{item.tingkatan}</Badge></TableCell>
                <TableCell className="text-zinc-600">{item.tahun}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" aria-label="Edit" className="group">
                      <Link href={`/admin/achievements/edit/${item.id}`}><AppIcon name="edit" size={16} target=".group" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Hapus" className="group text-danger hover:bg-danger-soft hover:text-danger" onClick={() => handleDelete(item)}>
                      <AppIcon name="trash" size={16} target=".group" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
