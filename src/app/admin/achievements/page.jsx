'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([])
  const [filteredAchievements, setFilteredAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterTingkatan, setFilterTingkatan] = useState('all')

  useEffect(() => {
    fetchAchievements()
  }, [])

  useEffect(() => {
    filterAchievements()
  }, [achievements, searchTerm, filterCategory, filterTingkatan])

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements?format=list')
      const data = await response.json()
      if (data.success) {
        setAchievements(data.data)
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAchievements = () => {
    let filtered = [...achievements]

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.achieverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory)
    }

    if (filterTingkatan !== 'all') {
      filtered = filtered.filter(item => item.tingkatan === filterTingkatan)
    }

    setFilteredAchievements(filtered)
  }



  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus prestasi ini?')) return

    try {
      const response = await fetch(`/api/achievements?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        alert('Prestasi berhasil dihapus!')
        fetchAchievements()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message)
    }
  }



  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Manajemen Prestasi</h2>
          <p className="text-zinc-500 mt-1">Kelola data prestasi Sistem Informasi</p>
        </div>
        <Link
          href="/admin/achievements/create"
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          + Tambah Prestasi
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-2">Cari Prestasi</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau prestasi..."
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Kategori</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            >
              <option value="all">Semua</option>
              <option value="dosen">Dosen</option>
              <option value="mahasiswa">Mahasiswa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Tingkatan</label>
            <select
              value={filterTingkatan}
              onChange={(e) => setFilterTingkatan(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            >
              <option value="all">Semua</option>
              <option value="Nasional">Nasional</option>
              <option value="Internasional">Internasional</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-zinc-600">
          Menampilkan {filteredAchievements.length} dari {achievements.length} prestasi
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading...</div>
        ) : filteredAchievements.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            {searchTerm || filterCategory !== 'all' || filterTingkatan !== 'all' 
              ? 'Tidak ada data yang sesuai dengan filter' 
              : 'Belum ada data prestasi'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">Foto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">Nama</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">Prestasi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">Kategori</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">Tingkatan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">Tahun</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAchievements.map((item, index) => (
                  <tr key={item.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="px-6 py-4 text-sm text-zinc-600">{index + 1}</td>
                    <td className="px-6 py-4">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.achieverName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500">
                          <span className="text-xs">No Img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-800">{item.achieverName}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{item.title}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.category === 'dosen' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {item.category === 'dosen' ? 'Dosen' : 'Mahasiswa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{item.tingkatan}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{item.tahun}</td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/admin/achievements/edit/${item.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium mr-3"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
