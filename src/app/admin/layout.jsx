'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      })
      const data = await response.json()

      if (data.success) {
        setSession(data.session)
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (pathname === '/admin/login') {
    return children
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="mt-4 text-zinc-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/content', label: 'Konten Web Utama' },
    { href: '/admin/profile-content', label: 'Konten Halaman Profil' },
    { href: '/admin/curriculum', label: 'Kelola Kurikulum' },
    { href: '/admin/achievements', label: 'Kelola Prestasi' },
    { href: '/admin/gallery', label: 'Kelola Galeri Prestasi' },
    { href: '/admin/media', label: 'Upload Media' },
  ]

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <>
                <div>
                  <h2 className="font-bold text-xl text-red-600">CMS Admin</h2>
                  <p className="text-xs text-zinc-500 mt-1">Sistem Informasi</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  ‹
                </button>
              </>
            ) : (
              <button onClick={() => setSidebarOpen(true)} className="text-zinc-400 hover:text-zinc-600 mx-auto">
                ›
              </button>
            )}
          </div>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
                pathname === item.href
                  ? 'bg-red-50 text-red-600 font-semibold'
                  : 'text-zinc-600 hover:bg-zinc-100'
              } ${!sidebarOpen ? 'px-2' : ''}`}
              title={!sidebarOpen ? item.label : ''}
            >
              {sidebarOpen ? (
                <span>{item.label}</span>
              ) : (
                <span className="text-base font-semibold">{item.label.charAt(0)}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-zinc-200">
          <Link
            href="/"
            className={`flex items-center justify-center gap-3 px-4 py-3 rounded-lg mb-2 text-zinc-600 hover:bg-zinc-100 transition ${!sidebarOpen ? 'px-2' : ''}`}
            title={!sidebarOpen ? 'Lihat Website' : ''}
          >
            {sidebarOpen ? <span>Lihat Website</span> : <span className="text-base">🌐</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition w-full ${!sidebarOpen ? 'px-2' : ''}`}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            {sidebarOpen ? <span>Logout</span> : <span className="text-base">🚪</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-zinc-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-zinc-800">
              {menuItems.find(item => item.href === pathname)?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-zinc-800">{session.name}</p>
                <p className="text-xs text-zinc-500">{session.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold">
                {session.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
