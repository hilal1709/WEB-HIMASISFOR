'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function EditGalleryPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    name: '',
    year: '',
    image: '',
    photoProfile: '',
    description: '',
    order: 0,
    isActive: true
  })
  const [imageFile, setImageFile] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')

  useEffect(() => {
    fetchGallery()
  }, [])

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/gallery')
      const data = await response.json()
      if (data.success) {
        const gallery = data.data.find(item => item.id === parseInt(params.id))
        if (gallery) {
          setFormData(gallery)
          setImagePreview(gallery.image || '')
          setPhotoPreview(gallery.photoProfile || '')
        } else {
          alert('Galeri tidak ditemukan')
          router.push('/admin/gallery')
        }
      }
    } catch (error) {
      console.error('Error fetching gallery:', error)
      alert('Gagal memuat data')
      router.push('/admin/gallery')
    } finally {
      setLoading(false)
    }
  }

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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file, folder) => {
    if (!file) return null

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', folder)

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
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      let imagePath = formData.image
      let photoPath = formData.photoProfile

      // Upload image file if selected
      if (imageFile) {
        const uploadedImagePath = await uploadImage(imageFile, 'img/award')
        if (uploadedImagePath) {
          imagePath = uploadedImagePath
        } else {
          // Upload failed, check if manual URL provided
          if (!imagePath || imagePath.trim() === '') {
            alert('Upload gambar gagal dan URL manual tidak diisi. Silakan masukkan URL gambar secara manual.')
            return
          }
        }
      }

      // Upload photo file if selected
      if (photoFile) {
        const uploadedPhotoPath = await uploadImage(photoFile, 'img/award')
        if (uploadedPhotoPath) {
          photoPath = uploadedPhotoPath
        }
        // Photo profile is optional, so we continue even if upload fails
      }

      // Validate required fields
      if (!imagePath || imagePath.trim() === '') {
        alert('Foto penghargaan wajib diisi! Silakan masukkan URL gambar.')
        return
      }

      // photoProfile is optional, but if empty set to empty string
      if (!photoPath) {
        photoPath = ''
      }

      const response = await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          image: imagePath,
          photoProfile: photoPath
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Galeri berhasil diupdate!')
        router.push('/admin/gallery')
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="mt-4 text-zinc-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link 
          href="/admin/gallery"
          className="text-red-600 hover:text-red-700 font-medium mb-4 inline-block"
        >
          ← Kembali ke List Galeri
        </Link>
        <h2 className="text-2xl font-bold text-zinc-800">Edit Galeri Prestasi</h2>
        <p className="text-zinc-500 mt-1">Update data galeri prestasi di bawah</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Award Image Upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Foto Penghargaan *
            </label>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-32 rounded-lg object-cover border-2 border-zinc-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-zinc-100 flex items-center justify-center border-2 border-dashed border-zinc-300">
                    <span className="text-zinc-400 text-xs text-center">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  placeholder="Masukkan URL: /img/award/nama.jpg"
                  required
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Masukkan URL gambar (contoh: /img/award/piala.jpg). Upload file tidak tersedia di production Vercel.
                </p>
              </div>
            </div>
          </div>

          {/* Photo Profile Upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Foto Profil
            </label>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-32 h-32 rounded-lg object-cover border-2 border-zinc-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-zinc-100 flex items-center justify-center border-2 border-dashed border-zinc-300">
                    <span className="text-zinc-400 text-xs text-center">No Photo</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.photoProfile}
                  onChange={(e) => setFormData({ ...formData, photoProfile: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  placeholder="Masukkan URL: /img/award/profil.jpg"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Masukkan URL foto profil (contoh: /img/award/john-doe.jpg). Upload file tidak tersedia di production Vercel.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Judul Prestasi *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              placeholder="Contoh: Juara 1 Lomba Web Design"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Nama Penerima *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              placeholder="Contoh: John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Tahun *</label>
            <input
              type="text"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              placeholder="Contoh: 2023"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              rows="4"
              placeholder="Deskripsi prestasi (opsional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Urutan Tampilan</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                placeholder="0"
              />
              <p className="text-xs text-zinc-500 mt-1">Semakin kecil angka, semakin depan urutannya</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Status</label>
              <select
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              >
                <option value="true">Aktif</option>
                <option value="false">Tidak Aktif</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-zinc-200">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-zinc-400 disabled:cursor-not-allowed"
            >
              {uploading ? 'Mengupload...' : 'Update Galeri'}
            </button>
            <Link
              href="/admin/gallery"
              className="flex-1 bg-zinc-200 text-zinc-700 py-3 rounded-lg font-semibold hover:bg-zinc-300 transition text-center"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
