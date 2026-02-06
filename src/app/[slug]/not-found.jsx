export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-zinc-800 mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-zinc-600 mb-8">Maaf, halaman yang Anda cari tidak tersedia.</p>
        <a
          href="/"
          className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  )
}
