'use client'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowDown } from '../icons/ArrowDown'

export default function DynamicNavbar() {
  const [navItems, setNavItems] = useState([])
  const [open, setOpen] = useState(null)
  const [openNav, setOpenNav] = useState(false)
  const pathname = usePathname()

  const loadNavItems = useCallback(async () => {
    try {
      const response = await fetch('/api/navbar', {
        // Add caching
        next: { revalidate: 3600 }
      })
      const data = await response.json()
      if (data.success) {
        const activeItems = data.items.filter(item => item.isActive)
        setNavItems(activeItems)
      }
    } catch (error) {
      console.error('Error loading nav items:', error)
    }
  }, [])

  useEffect(() => {
    loadNavItems()
  }, [loadNavItems])

  const openMenu = (menu) => {
    setOpen(open === menu ? null : menu)
  }

  const closeMenu = () => {
    setOpen(null)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        closeMenu()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  // Static menu items (hardcoded for existing pages)
  const staticMenus = [
    { label: 'Beranda', href: '/', order: 1 },
    { label: 'Profile', href: '/profile', order: 2 },
    { label: 'Kurikulum', href: '/curiculum', order: 3 },
    { label: 'Prestasi', href: '/achievement', order: 4 },
  ]

  // Combine static and dynamic menu items
  const allMenus = [...staticMenus, ...navItems].sort((a, b) => a.order - b.order)

  return (
    <header className="sticky top-4 bg-white z-50 mx-4 shadow-xl rounded-xl">
      {/* Desktop Navigation */}
      <nav className="hidden max-w-7xl lg:flex justify-between items-center px-8 pr-4 py-3 text-sm mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Image src="/img/logo.png" alt="Logo Sistem Informasi UISI" width={180} height={48} className="h-8 w-auto object-contain" priority />
          </Link>
          <ul className="flex items-center gap-2">
            {allMenus.map((menu, index) => (
              <li key={index}>
                <Link
                  href={menu.href}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    pathname === menu.href
                      ? 'bg-red-600 text-white'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {menu.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <a
            href="https://pmb.uisi.ac.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Daftar Sekarang
          </a>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden flex justify-between items-center px-6 py-3">
        <Link href="/">
          <Image src="/img/logo.png" alt="Logo" width={180} height={48} className="h-7 w-auto object-contain" priority />
        </Link>
        <button
          onClick={() => setOpenNav(!openNav)}
          className="text-zinc-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {openNav && (
        <div className="lg:hidden border-t border-zinc-200">
          <ul className="px-6 py-4 space-y-2">
            {allMenus.map((menu, index) => (
              <li key={index}>
                <Link
                  href={menu.href}
                  onClick={() => setOpenNav(false)}
                  className={`block px-4 py-3 rounded-lg font-medium transition ${
                    pathname === menu.href
                      ? 'bg-red-600 text-white'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {menu.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="https://pmb.uisi.ac.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-red-600 text-white px-4 py-3 rounded-lg font-semibold text-center hover:bg-red-700 transition"
              >
                Daftar Sekarang
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
