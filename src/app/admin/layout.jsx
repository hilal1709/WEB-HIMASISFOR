'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkSession()
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-50 hidden lg:block ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <>
                <div>
                  <h2 className="font-bold text-xl text-red-600">CMS Admin</h2>
                  <p className="text-xs text-zinc-500 mt-1">Sistem Informasi</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-zinc-600 text-2xl">
                  ‹
                </button>
              </>
            ) : (
              <button onClick={() => setSidebarOpen(true)} className="text-zinc-400 hover:text-zinc-600 mx-auto text-2xl">
                ›
              </button>
            )}
          </div>
        </div>

        <nav className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
                pathname === item.href
                  ? 'bg-red-50 text-red-600 font-semibold'
                  : 'text-zinc-600 hover:bg-zinc-100'
              } ${!sidebarOpen ? 'justify-center' : ''}`}
              title={!sidebarOpen ? item.label : ''}
            >
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
              {!sidebarOpen && <span className="text-sm font-bold">{item.label.charAt(0)}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-zinc-200">
          <Link
            href="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-zinc-600 hover:bg-zinc-100 transition ${!sidebarOpen ? 'justify-center' : ''}`}
            title={!sidebarOpen ? 'Lihat Website' : ''}
          >
            {sidebarOpen && <span className="text-sm">Lihat Website</span>}
            {!sidebarOpen && <span className="text-sm font-bold">W</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition w-full ${!sidebarOpen ? 'justify-center' : ''}`}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            {sidebarOpen && <span className="text-sm">Logout</span>}
            {!sidebarOpen && <span className="text-sm font-bold">X</span>}
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      <aside className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-transform duration-300 z-50 lg:hidden w-64 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-xl text-red-600">CMS Admin</h2>
              <p className="text-xs text-zinc-500 mt-1">Sistem Informasi</p>
            </div>
            <button onClick={closeMobileMenu} className="text-zinc-400 hover:text-zinc-600 text-2xl">
              ×
            </button>
          </div>
        </div>

        <nav className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
                pathname === item.href
                  ? 'bg-red-50 text-red-600 font-semibold'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-zinc-200">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-zinc-600 hover:bg-zinc-100 transition"
          >
            <span className="text-sm">Lihat Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition w-full"
          >
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 lg:ml-20 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-zinc-200 sticky top-0 z-30">
          <div className="px-4 lg:px-6 py-4 flex justify-between items-center">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-zinc-600 hover:text-zinc-800 mr-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h1 className="text-lg lg:text-2xl font-bold text-zinc-800 truncate">
              {menuItems.find(item => item.href === pathname)?.label || 'Dashboard'}
            </h1>
            
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs lg:text-sm font-semibold text-zinc-800">{session.name}</p>
                <p className="text-xs text-zinc-500">{session.email}</p>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-sm lg:text-base">
                {session.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
