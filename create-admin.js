require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: ['error', 'warn'],
})

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@uisi.ac.id',
        password: hashedPassword,
        name: 'Admin Sisfor UISI',
        role: 'admin'
      }
    })

    console.log('✅ Admin berhasil dibuat!')
    console.log('Email:', admin.email)
    console.log('Password: admin123')
    console.log('Name:', admin.name)
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Admin dengan email ini sudah ada!')
    } else {
      console.error('Error:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
