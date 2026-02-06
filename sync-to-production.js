import { PrismaClient } from '@prisma/client';

// Database connections
const localDb = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:hilal123@localhost:5432/sisfor_db?schema=public'
    }
  }
});

const productionDb = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://787fe2889e8c87f946e167ee059b119c562a2c079f7034222046412a572cb6bb:sk_BaegH2lZeTB47zoA7elRr@db.prisma.io:5432/postgres?sslmode=require'
    }
  }
});

async function syncToProduction() {
  console.log('\n🔄 Starting data synchronization...\n');

  try {
    // 1. Sync Alumni
    console.log('📋 Syncing Alumni...');
    const alumni = await localDb.alumni.findMany();
    for (const item of alumni) {
      const { id, ...data } = item;
      await productionDb.alumni.upsert({
        where: { nim: data.nim },
        update: data,
        create: data
      });
    }
    console.log(`✅ Synced ${alumni.length} alumni records`);

    // 2. Sync Achievements
    console.log('\n📋 Syncing Achievements...');
    const achievements = await localDb.achievement.findMany();
    
    // Clear existing achievements first
    await productionDb.achievement.deleteMany({});
    
    for (const item of achievements) {
      const { id, ...data } = item;
      await productionDb.achievement.create({ data });
    }
    console.log(`✅ Synced ${achievements.length} achievement records`);

    // 3. Sync Navbar Items
    console.log('\n📋 Syncing Navbar Items...');
    const navbarItems = await localDb.navbarItem.findMany();
    
    // Clear existing navbar items first
    await productionDb.navbarItem.deleteMany({});
    
    for (const item of navbarItems) {
      const { id, ...data } = item;
      await productionDb.navbarItem.create({ data });
    }
    console.log(`✅ Synced ${navbarItems.length} navbar items`);

    // 4. Sync Pages
    console.log('\n📋 Syncing Pages...');
    const pages = await localDb.page.findMany();
    for (const item of pages) {
      const { id, ...data } = item;
      await productionDb.page.upsert({
        where: { slug: data.slug },
        update: data,
        create: data
      });
    }
    console.log(`✅ Synced ${pages.length} page records`);

    // 5. Sync Page Contents (merge with existing)
    console.log('\n📋 Syncing Page Contents...');
    const pageContents = await localDb.pageContent.findMany();
    for (const item of pageContents) {
      const { id, ...data } = item;
      await productionDb.pageContent.upsert({
        where: { section: data.section },
        update: data,
        create: data
      });
    }
    console.log(`✅ Synced ${pageContents.length} page content records`);

    console.log('\n🎉 Synchronization completed successfully!\n');
    
    // Show final stats
    console.log('📊 Production Database Stats:');
    const stats = {
      admins: await productionDb.admin.count(),
      alumni: await productionDb.alumni.count(),
      achievements: await productionDb.achievement.count(),
      pages: await productionDb.page.count(),
      pageContents: await productionDb.pageContent.count(),
      navbarItems: await productionDb.navbarItem.count()
    };
    
    console.log(`   👤 Admin Users: ${stats.admins}`);
    console.log(`   🎓 Alumni: ${stats.alumni}`);
    console.log(`   🏆 Achievements: ${stats.achievements}`);
    console.log(`   📄 Pages: ${stats.pages}`);
    console.log(`   📝 Page Contents: ${stats.pageContents}`);
    console.log(`   🧭 Navbar Items: ${stats.navbarItems}\n`);

  } catch (error) {
    console.error('\n❌ Sync Error:', error.message);
    console.error(error);
  } finally {
    await localDb.$disconnect();
    await productionDb.$disconnect();
  }
}

// Confirmation prompt
console.log('⚠️  This will sync all data from LOCAL → PRODUCTION database');
console.log('   This will OVERWRITE existing data in production!\n');

syncToProduction();
