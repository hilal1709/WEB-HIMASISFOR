'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { BrandLoader } from '@/components/ui/loader'
import { useToast } from '@/components/ui/toast'
import { useChannel } from '@/lib/realtime/client'

export default function AdminLayout({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const toast = useToast()

  // Realtime: pengajuan layanan baru langsung terlihat di semua halaman admin
  useChannel('private-admin', {
    'layanan:new': ({ code, service }) =>
      toast.info('Pengajuan layanan baru', {
        description: [code, service].filter(Boolean).join(' · '),
        action: { label: 'Buka kotak masuk', onClick: () => router.push('/admin/layanan') },
      }),
  }, Boolean(session))

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
      const data = await response.json() // Auth.js: { user, expires } atau null

      if (data?.user) {
        setSession(data.user)
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
      await signOut({ redirect: false })
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
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <BrandLoader label="Memuat CMS…" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Studio penuh memakai kanvas sendiri tanpa chrome admin.
  if (pathname === '/admin/home' || pathname === '/admin/sambutan' || pathname === '/admin/bidang-keahlian' || pathname === '/admin/visi-misi' || pathname === '/admin/struktur' || pathname === '/admin/profil-lulusan' || pathname === '/admin/program-kelas' || pathname === '/admin/dosen' || pathname === '/admin/prestasi' || pathname === '/admin/kurikulum') {
    return children
  }

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/layanan', label: 'Kotak Masuk Layanan' },
    { href: '/admin/home', label: 'Studio Beranda' },
    { href: '/admin/bidang-keahlian', label: 'Konsol Bidang Keahlian' },
    { href: '/admin/sambutan', label: 'Meja Sambutan Kaprodi' },
    { href: '/admin/visi-misi', label: 'Ruang Kompas Visi & Misi' },
    { href: '/admin/struktur', label: 'Studio Bagan Struktur' },
    { href: '/admin/profil-lulusan', label: 'Galeri Wisuda Profil Lulusan' },
    { href: '/admin/program-kelas', label: 'Papan Jadwal Program Kelas' },
    { href: '/admin/dosen', label: 'Ruang Dosen' },
    { href: '/admin/warta', label: 'Warta (Berita & Agenda)' },
    { href: '/admin/content', label: 'Konten Web Utama' },
    { href: '/admin/profile-content', label: 'Konten Halaman Profil' },
    { href: '/admin/kurikulum', label: 'Kartografer Kurikulum' },
    { href: '/admin/prestasi', label: 'Ruang Kurator Prestasi' },
    { href: '/admin/gallery', label: 'Kelola Galeri Prestasi' },
    { href: '/admin/media', label: 'Upload Media' },
  ]

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-cream text-text">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className={`fixed top-0 left-0 h-full bg-maroon-deep text-cream shadow-[0_0_60px_-20px_rgb(26_6_7/0.6)] transition-all duration-300 z-50 hidden lg:block ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <>
                <div>
                  <h2 className="font-serif text-2xl text-gold-soft">CMS Admin</h2>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/55 mt-1">Sistem Informasi</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-cream/50 hover:text-cream text-2xl">
                  ‹
                </button>
              </>
            ) : (
              <button onClick={() => setSidebarOpen(true)} className="text-cream/50 hover:text-cream mx-auto text-2xl">
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
                  ? 'bg-white/10 text-white font-semibold shadow-[inset_3px_0_0_var(--gold)]'
                  : 'text-cream/70 hover:bg-white/5 hover:text-cream'
              } ${!sidebarOpen ? 'justify-center' : ''}`}
              title={!sidebarOpen ? item.label : ''}
            >
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
              {!sidebarOpen && <span className="text-sm font-bold">{item.label.charAt(0)}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <Link
            href="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-cream/70 hover:bg-white/5 hover:text-cream transition ${!sidebarOpen ? 'justify-center' : ''}`}
            title={!sidebarOpen ? 'Lihat Website' : ''}
          >
            {sidebarOpen && <span className="text-sm">Lihat Website</span>}
            {!sidebarOpen && <span className="text-sm font-bold">W</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-cream/70 hover:bg-white/5 hover:text-gold-soft transition w-full ${!sidebarOpen ? 'justify-center' : ''}`}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            {sidebarOpen && <span className="text-sm">Logout</span>}
            {!sidebarOpen && <span className="text-sm font-bold">X</span>}
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      <aside className={`fixed top-0 left-0 h-full bg-maroon-deep text-cream shadow-[0_0_60px_-20px_rgb(26_6_7/0.6)] transition-transform duration-300 z-50 lg:hidden w-64 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl text-gold-soft">CMS Admin</h2>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/55 mt-1">Sistem Informasi</p>
            </div>
            <button onClick={closeMobileMenu} className="text-cream/50 hover:text-cream text-2xl">
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
                  ? 'bg-white/10 text-white font-semibold shadow-[inset_3px_0_0_var(--gold)]'
                  : 'text-cream/70 hover:bg-white/5 hover:text-cream'
              }`}
            >
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-cream/70 hover:bg-white/5 hover:text-cream transition"
          >
            <span className="text-sm">Lihat Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-cream/70 hover:bg-white/5 hover:text-gold-soft transition w-full"
          >
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 lg:ml-20 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Header */}
        <header className="relative bg-cream/90 backdrop-blur-md border-b border-navy/10 sticky top-0 z-30">
          <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-maroon" />
          <div className="px-4 lg:px-6 py-4 flex justify-between items-center">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-navy hover:text-maroon mr-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h1 className="font-serif text-xl lg:text-[1.75rem] leading-none text-navy truncate">
              {menuItems.find(item => item.href === pathname)?.label || 'Dashboard'}
            </h1>
            
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs lg:text-sm font-semibold text-navy">{session.name}</p>
                <p className="text-xs text-text/55">{session.email}</p>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gold-soft flex items-center justify-center text-maroon font-serif text-sm lg:text-base">
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
