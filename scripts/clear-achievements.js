const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAchievements() {
  try {
    await prisma.achievement.deleteMany({});
    console.log('✅ All achievements deleted');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAchievements();
