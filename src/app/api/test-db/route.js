import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// API untuk test koneksi database
export async function GET() {
  try {
    // Test koneksi dengan query sederhana
    await prisma.$connect()
    
    // Get database info
    const result = await prisma.$queryRaw`SELECT version()`
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connected successfully!',
      database: result
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to connect to database',
      details: error.message 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
