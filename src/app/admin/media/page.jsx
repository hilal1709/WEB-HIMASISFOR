'use client'
import { useState, useEffect } from 'react'

export default function MediaPage() {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [selectedFolder, setSelectedFolder] = useState('uploads')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingFile, setEditingFile] = useState(null)
  const [newFilename, setNewFilename] = useState('')

  const folders = [
    { value: 'uploads', label: 'Uploads (Umum)' },
    { value: 'img/award', label: 'Prestasi' },
    { value: 'img/profil', label: 'Profil' },
    { value: 'img/logo', label: 'Logo' },
  ]

  useEffect(() => {
    loadFiles()
  }, [selectedFolder])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/upload?folder=${selectedFolder}`)
      const data = await response.json()
      if (data.success) {
        setUploadedFiles(data.files)
      }
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    const fileInput = e.target.file
    const file = fileInput.files[0]

    if (!file) {
      alert('Pilih file terlebih dahulu')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', selectedFolder)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        alert('File berhasil diupload!')
        loadFiles()
        setPreviewUrl(null)
        fileInput.value = ''
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const copyToClipboard = (url) => {
    const fullUrl = window.location.origin + url
    navigator.clipboard.writeText(fullUrl)
    alert('Link berhasil dicopy!\n' + fullUrl)
  }

  const copyPath = (url) => {
    navigator.clipboard.writeText(url)
    alert('Path berhasil dicopy!\n' + url)
  }

  const handleDelete = async (url, filename) => {
    if (!confirm(`Yakin ingin menghapus file "${filename}"?\nFile akan dihapus permanen.`)) {
      return
    }

    try {
      const response = await fetch(`/api/upload?url=${encodeURIComponent(url)}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        alert('File berhasil dihapus!')
        loadFiles()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message)
    }
  }

  const startEdit = (file) => {
    setEditingFile(file)
    setNewFilename(file.filename)
  }

  const cancelEdit = () => {
    setEditingFile(null)
    setNewFilename('')
  }

  const handleEdit = async () => {
    if (!newFilename.trim()) {
      alert('Nama file tidak boleh kosong')
      return
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldUrl: editingFile.url,
          newFilename: newFilename.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('File berhasil diubah!')
        cancelEdit()
        loadFiles()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message)
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="mb-4 lg:mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-zinc-800">Upload Media</h2>
        <p className="text-sm text-zinc-500 mt-1">Upload gambar dan dapatkan link URL-nya</p>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-xl shadow-md p-4 lg:p-6">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Pilih Folder Tujuan
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full px-3 lg:px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm lg:text-base"
            >
              {folders.map((folder) => (
                <option key={folder.value} value={folder.value}>
                  {folder.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Pilih File
            </label>
            <input
              type="file"
              name="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full px-3 lg:px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm lg:text-base"
              required
            />
          </div>

          {previewUrl && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Preview
              </label>
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full lg:max-w-md h-auto rounded-lg border border-zinc-200"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-red-600 text-white py-2 lg:py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-zinc-400 disabled:cursor-not-allowed text-sm lg:text-base"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>
      </div>

      {/* Uploaded Files */}
      <div className="bg-white rounded-xl shadow-md p-4 lg:p-6">
        <h3 className="text-lg lg:text-xl font-bold text-zinc-800 mb-4">
          File di Folder: {folders.find(f => f.value === selectedFolder)?.label}
        </h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
            <p className="mt-2 text-zinc-500">Memuat file...</p>
          </div>
        ) : uploadedFiles.length > 0 ? (
          <div className="space-y-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="border border-zinc-200 rounded-lg p-3 lg:p-4">
                <div className="flex flex-col sm:flex-row items-start gap-3 lg:gap-4">
                  <img
                    src={file.url}
                    alt={file.filename}
                    className="w-full sm:w-20 lg:w-24 h-auto sm:h-20 lg:h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    {editingFile?.url === file.url ? (
                      <div className="mb-2">
                        <input
                          type="text"
                          value={newFilename}
                          onChange={(e) => setNewFilename(e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleEdit}
                            className="px-4 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-1 bg-zinc-400 text-white text-sm rounded hover:bg-zinc-500"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="font-semibold text-zinc-800">{file.filename}</p>
                    )}
                    <div className="mt-2 space-y-2">
                      <div>
                        <label className="text-xs text-zinc-500">Full URL:</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={window.location.origin + file.url}
                            readOnly
                            className="flex-1 px-3 py-1 text-sm border border-zinc-300 rounded bg-zinc-50"
                          />
                          <button
                            onClick={() => copyToClipboard(file.url)}
                            className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Copy URL
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500">Path (untuk database):</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={file.url}
                            readOnly
                            className="flex-1 px-3 py-1 text-sm border border-zinc-300 rounded bg-zinc-50"
                          />
                          <button
                            onClick={() => copyPath(file.url)}
                            className="px-4 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Copy Path
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => startEdit(file)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      disabled={editingFile !== null}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(file.url, file.filename)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      disabled={editingFile !== null}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500">
            Belum ada file di folder ini
          </div>
        )}
      </div>
    </div>
  )
}
