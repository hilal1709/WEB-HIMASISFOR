import { NextResponse } from 'next/server'
import { writeFile, mkdir, unlink, readdir, readFile, stat } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { auth } from '@/auth'

/**
 * Manajer berkas /public untuk CMS (khusus admin).
 * Semua path dikunci di dalam /public — folder/URL yang keluar dari sana ditolak.
 */
const PUBLIC = path.join(process.cwd(), 'public')
const MAX_BYTES = 40 * 1024 * 1024
const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif', '.mp4', '.webm', '.json', '.pdf'])

const fail = (error, status) => NextResponse.json({ success: false, error }, { status })

async function requireAdmin() {
  const session = await auth()
  return session?.user ? null : fail('Tidak berwenang', 401)
}

/** Folder relatif aman: hanya huruf, angka, -, _, dan "/" antar-segmen. */
function safeFolder(raw) {
  const folder = String(raw || 'uploads').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
  if (!/^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/.test(folder)) return null
  return folder
}

/** URL publik → path absolut di dalam /public, atau null bila keluar dari /public. */
function resolvePublic(url) {
  const rel = decodeURIComponent(String(url || '')).replace(/^\/+/, '')
  const abs = path.resolve(PUBLIC, rel)
  return abs.startsWith(PUBLIC + path.sep) ? abs : null
}

const safeName = (name) => String(name).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '').slice(-120)

export async function GET(request) {
  const denied = await requireAdmin()
  if (denied) return denied
  try {
    const folder = safeFolder(new URL(request.url).searchParams.get('folder'))
    if (!folder) return fail('Folder tidak valid', 400)
    const uploadDir = path.join(PUBLIC, folder)
    if (!existsSync(uploadDir)) return NextResponse.json({ success: true, files: [] })
    const names = await readdir(uploadDir)
    const files = []
    for (const filename of names) {
      const s = await stat(path.join(uploadDir, filename)).catch(() => null)
      if (s?.isFile()) files.push({ filename, url: `/${folder}/${filename}`, size: s.size, modified: s.mtimeMs })
    }
    return NextResponse.json({ success: true, files })
  } catch (error) {
    console.error('List files error:', error)
    return fail('Failed to list files', 500)
  }
}

export async function POST(request) {
  const denied = await requireAdmin()
  if (denied) return denied
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const folder = safeFolder(formData.get('folder'))
    if (!file || typeof file === 'string') return fail('No file uploaded', 400)
    if (!folder) return fail('Folder tidak valid', 400)
    const ext = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXT.has(ext)) return fail('Tipe berkas tidak diizinkan', 415)
    if (file.size > MAX_BYTES) return fail('Ukuran berkas melebihi 40 MB', 413)

    const uploadDir = path.join(PUBLIC, folder)
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
    const filename = `${Date.now()}-${safeName(file.name) || `berkas${ext}`}`
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()))

    return NextResponse.json({ success: true, url: `/${folder}/${filename}`, filename, message: 'File uploaded successfully' })
  } catch (error) {
    console.error('Upload error:', error)
    return fail('Failed to upload file', 500)
  }
}

export async function PUT(request) {
  const denied = await requireAdmin()
  if (denied) return denied
  try {
    const { oldUrl, newFilename } = await request.json()
    if (!oldUrl || !newFilename) return fail('Missing required fields', 400)
    const oldFilepath = resolvePublic(oldUrl)
    if (!oldFilepath) return fail('Path tidak valid', 400)
    if (!existsSync(oldFilepath)) return fail('File not found', 404)

    const clean = safeName(newFilename)
    if (!clean || !ALLOWED_EXT.has(path.extname(clean).toLowerCase())) return fail('Nama berkas tidak valid', 400)
    const newFilepath = path.join(path.dirname(oldFilepath), clean)
    if (existsSync(newFilepath)) return fail('Filename already exists', 400)

    await writeFile(newFilepath, await readFile(oldFilepath))
    await unlink(oldFilepath)
    const newUrl = '/' + path.relative(PUBLIC, newFilepath).replace(/\\/g, '/')
    return NextResponse.json({ success: true, url: newUrl, filename: clean, message: 'File renamed successfully' })
  } catch (error) {
    console.error('Rename error:', error)
    return fail('Failed to rename file', 500)
  }
}

export async function DELETE(request) {
  const denied = await requireAdmin()
  if (denied) return denied
  try {
    const url = new URL(request.url).searchParams.get('url')
    if (!url) return fail('No file URL provided', 400)
    const filepath = resolvePublic(url)
    if (!filepath) return fail('Path tidak valid', 400)
    if (!existsSync(filepath)) return fail('File not found', 404)
    await unlink(filepath)
    return NextResponse.json({ success: true, message: 'File deleted successfully' })
  } catch (error) {
    console.error('Delete error:', error)
    return fail('Failed to delete file', 500)
  }
}
