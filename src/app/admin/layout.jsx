'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { SessionProvider, signOut, useSession } from 'next-auth/react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import AppIcon from '@/components/ds/AppIcon'
import { PageLoader } from '@/components/ds/Loader'
import { useConfirm } from '@/components/ds/ConfirmProvider'
import notify from '@/lib/notify'
import { cn } from '@/lib/utils'

const MENU = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/content', label: 'Konten Web Utama', icon: 'content' },
  { href: '/admin/profile-content', label: 'Konten Halaman Profil', icon: 'profile' },
  { href: '/admin/curriculum', label: 'Kelola Kurikulum', icon: 'book' },
  { href: '/admin/achievements', label: 'Kelola Prestasi', icon: 'trophy' },
  { href: '/admin/gallery', label: 'Kelola Galeri Prestasi', icon: 'gallery' },
  { href: '/admin/media', label: 'Upload Media', icon: 'media' },
]

const EXTRA = [
  { href: '/design-system', label: 'Design System', icon: 'palette' },
  { href: '/', label: 'Lihat Website', icon: 'globe' },
]

function isActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavItem({ item, collapsed, pathname, onClick }) {
  const active = isActive(pathname, item.href)
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      data-nav-item
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
        active ? 'bg-brand-50 font-semibold text-brand-700' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
        collapsed && 'justify-center'
      )}
    >
      {active && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-600" />}
      <AppIcon name={item.icon} size={20} target=".group" className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )
}

function Sidebar({ collapsed, pathname, onNavigate, onLogout, onToggle, mobile }) {
  const ref = useRef(null)
  useGSAP(() => {
    gsap.fromTo('[data-nav-item]', { x: -16, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.04, duration: 0.45, ease: 'power2.out' })
  }, { scope: ref })

  return (
    <div ref={ref} className="flex h-full flex-col">
      <div className={cn('flex items-center border-b px-4 py-5', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-600 font-bold text-white shadow-lift">S</div>
            <div>
              <p className="font-bold leading-tight text-zinc-900">CMS Admin</p>
              <p className="text-xs text-zinc-500">Sistem Informasi</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          aria-label={mobile ? 'Tutup menu' : collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 cursor-pointer"
        >
          <AppIcon name={mobile ? 'close' : 'menu'} size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {!collapsed && <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Konten</p>}
        {MENU.map((item) => (
          <NavItem key={item.href} item={item} collapsed={collapsed} pathname={pathname} onClick={onNavigate} />
        ))}
      </nav>

      <div className="space-y-1 border-t p-3">
        {EXTRA.map((item) => (
          <NavItem key={item.href} item={item} collapsed={collapsed} pathname={pathname} onClick={onNavigate} />
        ))}
        <button
          onClick={onLogout}
          data-nav-item
          title={collapsed ? 'Logout' : undefined}
          className={cn('group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-brand-600 transition hover:bg-brand-50 cursor-pointer', collapsed && 'justify-center')}
        >
          <AppIcon name="logout" size={20} target=".group" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

function AdminShell({ children }) {
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const confirm = useConfirm()

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const handleLogout = async () => {
    const ok = await confirm({ title: 'Keluar dari CMS?', description: 'Anda perlu login kembali untuk mengelola konten.', confirmText: 'Ya, keluar', tone: 'default' })
    if (!ok) return
    notify.info('Anda telah keluar')
    await signOut({ callbackUrl: '/admin/login' })
  }

  if (pathname === '/admin/login') return children
  if (status === 'loading') return <PageLoader label="Memeriksa sesi…" />
  if (status === 'unauthenticated' || !session) return <PageLoader label="Mengalihkan ke halaman login…" />

  const user = session.user || {}
  const title = MENU.find((m) => isActive(pathname, m.href))?.label || 'Dashboard'

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Overlay mobile */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={cn('fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden', mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0')}
      />

      {/* Sidebar desktop */}
      <aside className={cn('fixed left-0 top-0 z-50 hidden h-full border-r bg-white transition-[width] duration-300 ease-brand lg:block', sidebarOpen ? 'w-64' : 'w-20')}>
        <Sidebar collapsed={!sidebarOpen} pathname={pathname} onLogout={handleLogout} onToggle={() => setSidebarOpen((v) => !v)} />
      </aside>

      {/* Sidebar mobile */}
      <aside className={cn('fixed left-0 top-0 z-50 h-full w-72 border-r bg-white transition-transform duration-300 ease-brand lg:hidden', mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full')}>
        <Sidebar mobile collapsed={false} pathname={pathname} onLogout={handleLogout} onNavigate={() => setMobileMenuOpen(false)} onToggle={() => setMobileMenuOpen(false)} />
      </aside>

      <div className={cn('transition-[margin] duration-300 ease-brand', sidebarOpen ? 'lg:ml-64' : 'lg:ml-20')}>
        <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} aria-label="Buka menu" className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden cursor-pointer">
                <AppIcon name="menu" size={22} />
              </button>
              <h1 className="truncate text-lg font-bold text-zinc-900 lg:text-xl">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-zinc-800">{user.name}</p>
                <p className="text-xs text-zinc-500">{user.email}</p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white ring-4 ring-brand-50 lg:size-10">
                {user.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  )
}
