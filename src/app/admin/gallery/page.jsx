'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function GalleryPage() {
  const [galleries, setGalleries] = useState([])
  const [filteredGalleries, setFilteredGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchGalleries()
  }, [])

  useEffect(() => {
    filterGalleries()
  }, [galleries, searchTerm])

  const fetchGalleries = async () => {
    try {
      const response = await fetch('/api/gallery')
      const data = await response.json()
      if (data.success) {
        setGalleries(data.data)
      }
    } catch (error) {
      console.error('Error fetching galleries:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterGalleries = () => {
    let filtered = [...galleries]

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.year.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredGalleries(filtered)
  }



  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus galeri ini?')) return

    try {
      const response = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        alert('Galeri berhasil dihapus!')
        fetchGalleries()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message)
    }
  }

  const toggleActive = async (id, currentStatus) => {
    try {
      const response = await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus })
      })

      const data = await response.json()

      if (data.success) {
        fetchGalleries()
      }
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message)
    }
  }



  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Kelola Galeri Prestasi</h2>
          <p className="text-zinc-500 mt-1">Kelola foto showcase galeri prestasi</p>
        </div>
        <Link
          href="/admin/gallery/create"
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          + Tambah Galeri
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Cari Galeri</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari judul, nama, atau tahun..."
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-zinc-600">
          Menampilkan {filteredGalleries.length} dari {galleries.length} galeri
        </div>
      </div>

      {/* Grid Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-zinc-500">Loading...</div>
        ) : filteredGalleries.length === 0 ? (
          <div className="col-span-full p-8 text-center text-zinc-500">
            {searchTerm ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data galeri'}
          </div>
        ) : (
          filteredGalleries.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="relative h-48">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-500">
                    <span className="text-sm">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => toggleActive(item.id, item.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.isActive 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-400 text-white'
                    }`}
                  >
                    {item.isActive ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-zinc-800 line-clamp-2 mb-2">{item.title}</h3>
                <div className="flex items-center gap-2 text-sm text-zinc-600 mb-3">
                  {item.photoProfile && (
                    <img 
                      src={item.photoProfile} 
                      alt={item.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span className="line-clamp-1">{item.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
                  <span>Tahun: {item.year}</span>
                  <span>Urutan: {item.order}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/gallery/edit/${item.id}`}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-100 transition text-sm text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-medium hover:bg-red-100 transition text-sm"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
