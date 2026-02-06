import prisma from './src/lib/prisma.js'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('sisfor123', 10)
    
    const admin = await prisma.admin.create({
      data: {
        email: 'adminsisfor@uisi.ac.id',
        password: hashedPassword,
        name: 'Admin Sisfor UISI',
        role: 'admin'
      }
    })

    console.log('✅ Admin berhasil dibuat!')
    console.log('Email:', admin.email)
    console.log('Password: sisfor123')
    console.log('Name:', admin.name)
    console.log('\n🔗 Login di: http://localhost:3000/admin/login')
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Admin dengan email ini sudah ada!')
      console.log('Email: adminsisfor@uisi.ac.id')
      console.log('Password: sisfor123')
      console.log('\n🔗 Login di: http://localhost:3000/admin/login')
    } else {
      console.error('❌ Error:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
