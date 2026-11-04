'use client'
import { Suspense, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ds/Loader'
import LottiePlayer from '@/components/ds/LottiePlayer'
import notify from '@/lib/notify'
import { BackgroundBeams, BackgroundGrid, TextGenerateEffect } from '@/components/aceternity'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const cardRef = useRef(null)

  useGSAP(() => {
    gsap.fromTo('[data-login-item]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out' })
  }, { scope: cardRef })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.error) {
        setError('Email atau password salah')
        notify.error('Login gagal', { description: 'Periksa kembali email dan password Anda.' })
        gsap.fromTo(cardRef.current, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' })
      } else {
        notify.success('Login berhasil', { description: 'Selamat datang kembali!' })
        const callbackUrl = params.get('callbackUrl')
        router.replace(callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/admin/dashboard')
        router.refresh()
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
      notify.error('Terjadi kesalahan', { description: 'Silakan coba lagi beberapa saat.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={cardRef} className="relative z-10 w-full max-w-md rounded-2xl border bg-white/90 p-6 shadow-2xl backdrop-blur lg:p-8">
      <div className="mb-6 flex flex-col items-center text-center" data-login-item>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/logo.png" alt="Logo Sistem Informasi UISI" className="mb-4 h-10 w-auto object-contain lg:h-12" />
        <h1 className="text-2xl font-bold text-zinc-900 lg:text-3xl">CMS Admin</h1>
        <p className="mt-1 text-sm text-zinc-500">Masuk untuk mengelola konten website</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div role="alert" className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger" data-login-item>
            {error}
          </div>
        )}
        <div className="space-y-2" data-login-item>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@uisi.ac.id" required />
        </div>
        <div className="space-y-2" data-login-item>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading} data-login-item>
          {loading ? <><Spinner /> Memproses…</> : 'Masuk'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm" data-login-item>
        <Link href="/" className="font-medium text-brand-600 hover:text-brand-700">← Kembali ke Website</Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="relative grid min-h-screen overflow-hidden bg-white lg:grid-cols-2">
      {/* Panel ilustrasi */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-10 text-white lg:flex">
        <BackgroundBeams />
        <div className="relative z-10 flex items-center gap-2 text-sm text-white/70">
          <span className="size-2 rounded-full bg-brand-500" /> Sistem Informasi UISI
        </div>
        <div className="relative z-10">
          <LottiePlayer name="secure" className="w-56" ariaLabel="Ilustrasi keamanan" />
          <TextGenerateEffect
            as="h2"
            words="Kelola konten Sistem Informasi dengan mudah dan aman."
            className="mt-6 max-w-md font-serif text-4xl leading-tight"
          />
          <p className="mt-4 max-w-sm text-sm text-white/60">Prestasi, galeri, kurikulum, dan konten halaman — semua dalam satu dashboard.</p>
        </div>
        <p className="relative z-10 text-xs text-white/40">© {new Date().getFullYear()} Program Studi Sistem Informasi</p>
      </div>

      {/* Panel form */}
      <div className="relative flex items-center justify-center p-4 sm:p-8">
        <BackgroundGrid variant="dot" />
        <Suspense fallback={<Spinner size={24} className="text-brand-600" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
