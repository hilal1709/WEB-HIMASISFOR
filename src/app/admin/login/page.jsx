'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Banner } from '@/components/ui/banner'
import { useToast } from '@/components/ui/toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await signIn('credentials', { email, password, redirect: false })

      if (res?.error) {
        setError('Email atau password salah')
        return
      }
      toast.success('Login berhasil', { description: 'Mengalihkan ke dashboard…' })
      router.push('/admin/dashboard')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-zinc-100 p-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="pointer-events-none absolute inset-0 opacity-5 bg-[url('/img/sisfor.svg')] bg-repeat" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl lg:p-8">
        <div className="mb-6 flex flex-col items-center lg:mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo.png" alt="Logo Sistem Informasi UISI" className="mb-4 h-10 w-auto lg:h-12" />
          <h1 className="text-2xl font-bold lg:text-3xl">CMS Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground lg:text-base">Sistem Informasi UISI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
          {error && <Banner variant="danger">{error}</Banner>}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@uisi.ac.id"
              invalid={!!error}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              invalid={!!error}
              required
            />
          </div>

          <Button type="submit" variant="brand" size="lg" className="w-full" loading={loading}>
            {loading ? 'Memproses…' : 'Login'}
          </Button>
        </form>

        <div className="mt-4 text-center text-xs text-muted-foreground lg:mt-6 lg:text-sm">
          <a href="/" className="font-medium text-primary hover:underline">
            ← Kembali ke Website
          </a>
        </div>
      </div>
    </div>
  )
}
