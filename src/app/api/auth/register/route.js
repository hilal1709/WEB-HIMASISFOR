import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// API untuk membuat admin pertama kali (hanya untuk development)
export async function POST(request) {
  try {
    const { email, password, name } = await request.json()

    // Validasi input
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah email sudah ada
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Buat admin baru
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'admin'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin berhasil dibuat',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat membuat admin' },
      { status: 500 }
    )
  }
}
