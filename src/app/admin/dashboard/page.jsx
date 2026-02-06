'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    achievements: 0,
    gallery: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [achievementsRes, galleryRes] = await Promise.all([
        fetch('/api/achievements'),
        fetch('/api/gallery')
      ])

      const achievementsData = await achievementsRes.json()
      const galleryData = await galleryRes.json()

      setStats({
        achievements: achievementsData.data?.length || 0,
        gallery: galleryData.data?.length || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      title: 'Total Prestasi',
      value: stats.achievements,
      color: 'bg-yellow-500',
      link: '/admin/achievements'
    },
    {
      title: 'Galeri Prestasi',
      value: stats.gallery,
      color: 'bg-purple-500',
      link: '/admin/gallery'
    }
  ]

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-zinc-800">Selamat Datang di CMS!</h2>
        <p className="text-sm lg:text-base text-zinc-500 mt-2">Kelola konten website Sistem Informasi UISI</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {cards.map((card, index) => (
          <Link
            key={index}
            href={card.link}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-4 lg:p-6 border border-zinc-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-500 text-xs lg:text-sm font-medium">{card.title}</p>
                <p className="text-2xl lg:text-3xl font-bold text-zinc-800 mt-2">
                  {loading ? '...' : card.value}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-4 lg:p-6 border border-zinc-100">
        <h3 className="text-lg lg:text-xl font-bold text-zinc-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <Link
            href="/admin/content"
            className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition"
          >
            <div>
              <p className="font-semibold text-zinc-800 text-sm lg:text-base">Edit Konten Utama</p>
              <p className="text-xs lg:text-sm text-zinc-500">Kelola konten homepage</p>
            </div>
          </Link>
          <Link
            href="/admin/profile-content"
            className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition"
          >
            <div>
              <p className="font-semibold text-zinc-800 text-sm lg:text-base">Edit Halaman Profil</p>
              <p className="text-xs lg:text-sm text-zinc-500">Kelola konten profil</p>
            </div>
          </Link>
          <Link
            href="/admin/curriculum"
            className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition"
          >
            <div>
              <p className="font-semibold text-zinc-800 text-sm lg:text-base">Kelola Kurikulum</p>
              <p className="text-xs lg:text-sm text-zinc-500">Edit data kurikulum</p>
            </div>
          </Link>
          <Link
            href="/admin/achievements"
            className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition"
          >
            <div>
              <p className="font-semibold text-zinc-800 text-sm lg:text-base">Tambah Prestasi</p>
              <p className="text-xs lg:text-sm text-zinc-500">Tambahkan prestasi baru</p>
            </div>
          </Link>
          <Link
            href="/admin/gallery"
            className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition"
          >
            <div>
              <p className="font-semibold text-zinc-800 text-sm lg:text-base">Tambah Galeri</p>
              <p className="text-xs lg:text-sm text-zinc-500">Upload foto galeri prestasi</p>
            </div>
          </Link>
          <Link
            href="/admin/media"
            className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition"
          >
            <div>
              <p className="font-semibold text-zinc-800 text-sm lg:text-base">Upload Media</p>
              <p className="text-xs lg:text-sm text-zinc-500">Upload gambar dan file</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
