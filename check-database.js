import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('\n📊 Database Statistics:\n');
    
    const adminCount = await prisma.admin.count();
    console.log(`👤 Admin Users: ${adminCount}`);
    
    try {
      const alumniCount = await prisma.alumni.count();
      console.log(`🎓 Alumni: ${alumniCount}`);
    } catch (e) { console.log(`🎓 Alumni: Table not exists`); }
    
    try {
      const achievementCount = await prisma.achievement.count();
      console.log(`🏆 Achievements: ${achievementCount}`);
    } catch (e) { console.log(`🏆 Achievements: Table not exists`); }
    
    try {
      const pageCount = await prisma.page.count();
      console.log(`📄 Pages: ${pageCount}`);
    } catch (e) { console.log(`📄 Pages: Table not exists`); }
    
    const contentCount = await prisma.pageContent.count();
    console.log(`📝 Page Contents: ${contentCount}`);
    
    try {
      const navbarCount = await prisma.navbarItem.count();
      console.log(`🧭 Navbar Items: ${navbarCount}`);
    } catch (e) { console.log(`🧭 Navbar Items: Table not exists`); }
    
    try {
      const galleryCount = await prisma.gallery.count();
      console.log(`🖼️  Gallery: ${galleryCount}`);
    } catch (e) { console.log(`🖼️  Gallery: Table not exists`); }
    
    console.log('\n✅ Database check complete!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
