'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateAchievementPage() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    achieverName: '',
    title: '',
    description: '',
    category: 'dosen',
    tingkatan: 'Nasional',
    tahun: '',
    image: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return formData.image

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', imageFile)
      formDataUpload.append('folder', 'img/award')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })

      const data = await response.json()
      
      if (data.success) {
        return data.url
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Gagal upload gambar: ' + error.message)
      return formData.image
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      let imagePath = formData.image
      if (imageFile) {
        imagePath = await uploadImage()
      }

      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          image: imagePath
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Prestasi berhasil ditambahkan!')
        router.push('/admin/achievements')
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-4 lg:mb-6">
        <Link 
          href="/admin/achievements"
          className="text-red-600 hover:text-red-700 font-medium mb-4 inline-block text-sm lg:text-base"
        >
          ← Kembali ke List Prestasi
        </Link>
        <h2 className="text-xl lg:text-2xl font-bold text-zinc-800">Tambah Prestasi Baru</h2>
        <p className="text-sm text-zinc-500 mt-1">Isi form di bawah untuk menambah prestasi</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          {/* Image Upload with Preview */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-zinc-700 mb-2">Foto</label>
            <div className="flex flex-col sm:flex-row items-start gap-3 lg:gap-4">
              <div className="flex-shrink-0 w-full sm:w-auto">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full sm:w-24 lg:w-32 h-auto sm:h-24 lg:h-32 rounded-lg object-cover border-2 border-zinc-200"
                  />
                ) : (
                  <div className="w-full sm:w-24 lg:w-32 h-24 lg:h-32 rounded-lg bg-zinc-100 flex items-center justify-center border-2 border-dashed border-zinc-300">
                    <span className="text-zinc-400 text-xs text-center">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1 w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 lg:px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-xs lg:text-sm"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Upload foto atau masukkan URL gambar di bawah. Format: JPG, PNG (max 2MB)
                </p>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 lg:px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none mt-2 text-sm lg:text-base"
                  placeholder="atau masukkan URL: /img/award/nama.jpg"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-zinc-700 mb-2">Nama Orang *</label>
            <input
              type="text"
              value={formData.achieverName}
              onChange={(e) => setFormData({ ...formData, achieverName: e.target.value })}
              className="w-full px-3 lg:px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm lg:text-base"
              placeholder="Contoh: Dr. John Doe, S.Kom., M.Kom."
              required
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-zinc-700 mb-2">Nama Prestasi *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 lg:px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm lg:text-base"
              placeholder="Contoh: Juara 1 Lomba Desain Web"
              required
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-zinc-700 mb-2">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 lg:px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm lg:text-base"
              rows="4"
              placeholder="Deskripsi prestasi (opsional)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-zinc-700 mb-2">Kategori *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm lg:text-base"
                required
              >
                <option value="dosen">Dosen</option>
                <option value="mahasiswa">Mahasiswa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-zinc-700 mb-2">Tingkatan *</label>
              <select
                value={formData.tingkatan}
                onChange={(e) => setFormData({ ...formData, tingkatan: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm lg:text-base"
                required
              >
                <option value="Nasional">Nasional</option>
                <option value="Internasional">Internasional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-zinc-700 mb-2">Tahun *</label>
            <input
              type="text"
              value={formData.tahun}
              onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
              className="w-full px-3 lg:px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm lg:text-base"
              placeholder="Contoh: 2023 atau 2021, 2023 atau 2021-2023"
              required
            />
            <p className="text-xs text-zinc-500 mt-1">
              Format: tahun tunggal (2023), beberapa tahun (2021, 2023), atau rentang (2021-2023)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-200">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-red-600 text-white py-2 lg:py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-zinc-400 disabled:cursor-not-allowed text-sm lg:text-base"
            >
              {uploading ? 'Mengupload...' : 'Simpan Prestasi'}
            </button>
            <Link
              href="/admin/achievements"
              className="flex-1 bg-zinc-200 text-zinc-700 py-2 lg:py-3 rounded-lg font-semibold hover:bg-zinc-300 transition text-center text-sm lg:text-base"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
